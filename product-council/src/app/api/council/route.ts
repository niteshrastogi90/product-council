import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { runCouncil } from '@/lib/agents/orchestrator';
import { CouncilRequest, SSEEvent } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { saveSession, addUserSession } from '@/lib/redis';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user (optional — guests can use the council)
    const session = await auth();
    const userEmail = session?.user?.email || null;

    const body: CouncilRequest = await request.json();

    if (!body.query || body.query.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Please provide a question (at least 10 characters).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sessionId = uuidv4();
    const query = body.query.trim();
    const speakerCount = Math.min(body.speakerCount || 4, 6);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(`event: session_id\ndata: ${JSON.stringify({ sessionId })}\n\n`)
          );

          const allEvents: SSEEvent[] = [];

          for await (const event of runCouncil(query, { speakerCount })) {
            allEvents.push(event);
            const sseData = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }

          // Save completed session to Redis (only for authenticated users)
          const completeEvent = allEvents.find(e => e.type === 'complete');
          if (completeEvent && userEmail) {
            const sessionData = {
              id: sessionId,
              userEmail,
              query,
              ...completeEvent.data,
              createdAt: new Date().toISOString(),
              status: 'complete' as const,
            };
            // Save session data and add to user's session list
            await Promise.all([
              saveSession(sessionId, sessionData),
              addUserSession(userEmail, sessionId),
            ]).catch(err => console.error('Failed to save session:', err));
          }

        } catch (error) {
          console.error('Council error:', error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ message: errorMsg })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Session-Id': sessionId,
      },
    });

  } catch (error) {
    console.error('Council request error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to start council session.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
