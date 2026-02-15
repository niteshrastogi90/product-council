'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import SpeechBubble from '@/components/SpeechBubble';
import SynthesisPanel from '@/components/SynthesisPanel';
import SourceCitation from '@/components/SourceCitation';

interface SavedSession {
  id: string;
  query: string;
  discussion: Array<{
    agent: string;
    role: 'moderator' | 'speaker' | 'synthesizer';
    content: string;
  }>;
  synthesis: string;
  sources: Array<{
    guest: string;
    episodeTitle: string;
    youtubeUrl: string;
    timestamp?: string;
  }>;
  createdAt: string;
}

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<SavedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`, { credentials: 'include' })
      .then(res => {
        if (res.status === 403) throw new Error('You don\'t have access to this session.');
        if (res.status === 404) throw new Error('Session not found.');
        if (!res.ok) throw new Error('Failed to load session.');
        return res.json();
      })
      .then(data => {
        setSession(data.session);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 bg-surface">
        <p className="text-slate-400 mb-4">{error || 'Session not found.'}</p>
        <Link href="/council" className="text-brand-400 hover:underline">Start a new session</Link>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-screen bg-surface">
      <header className="border-b border-white/5 bg-surface-50/80 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-white">Session Replay</span>
          <span className="text-sm text-slate-500 ml-auto">
            {new Date(session.createdAt).toLocaleDateString()}
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-full lg:w-2/5 border-r border-white/5 flex flex-col bg-surface-50 overflow-y-auto p-6">
          <div className="mb-6">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Question</span>
            <p className="mt-2 text-lg font-medium text-white">{session.query}</p>
          </div>
          {session.synthesis && (
            <SynthesisPanel content={session.synthesis} isStreaming={false} />
          )}
          <SourceCitation sources={session.sources || []} />
        </div>

        <div className="hidden lg:flex lg:w-3/5 flex-col bg-surface overflow-y-auto dot-pattern">
          <div className="px-6 py-4 border-b border-white/5 bg-surface-50/80 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="font-semibold text-slate-200 text-sm">Discussion Replay</h3>
          </div>
          <div className="flex-1 p-6">
            {(session.discussion || []).map((turn, i) => (
              <SpeechBubble
                key={i}
                agent={turn.agent}
                content={turn.content}
                role={turn.role === 'synthesizer' ? 'moderator' : turn.role}
                isStreaming={false}
                speakerIndex={i % 6}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
