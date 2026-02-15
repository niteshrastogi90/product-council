import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserSessions, getSession } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get session IDs for this user (newest first)
    const sessionIds = await getUserSessions(userEmail);

    // Fetch summary for each session
    const sessions = await Promise.all(
      sessionIds.map(async (id) => {
        const data = await getSession(id);
        if (!data) return null;
        return {
          id: data.id,
          query: data.query,
          memberCount: data.turnCount || data.discussion?.length || 0,
          createdAt: data.createdAt,
        };
      })
    );

    // Filter out nulls (expired sessions)
    const validSessions = sessions.filter(Boolean);

    return NextResponse.json({ sessions: validSessions });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    return NextResponse.json({ error: 'Failed to load sessions.' }, { status: 500 });
  }
}
