import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSession } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authSession = await auth();
  const userEmail = authSession?.user?.email;

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessionData = await getSession(params.id);

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
    }

    // Ensure this session belongs to the requesting user
    if (sessionData.userEmail && sessionData.userEmail !== userEmail) {
      return NextResponse.json({ error: 'Not authorized to view this session.' }, { status: 403 });
    }

    return NextResponse.json({ session: sessionData });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Failed to load session.' }, { status: 500 });
  }
}
