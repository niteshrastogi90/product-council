'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { truncate } from '@/lib/utils';

interface SessionSummary {
  id: string;
  query: string;
  memberCount: number;
  createdAt: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sessions', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        setSessions(data.sessions || []);
      })
      .catch(() => {
        setError('Failed to load session history.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 bg-surface">
      <header className="border-b border-white/5 bg-surface-50/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/council" className="text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-white">Session History</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-slate-500 text-center py-12">Loading...</p>
        ) : error ? (
          <p className="text-red-400 text-center py-12">{error}</p>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No sessions yet</p>
            <Link href="/council" className="text-brand-400 hover:underline text-sm">
              Start your first council session
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <Link
                key={session.id}
                href={`/council/${session.id}`}
                className="block p-4 glass rounded-xl hover:border-brand-500/20
                         transition-all duration-200"
              >
                <p className="font-medium text-slate-200 mb-1">{truncate(session.query, 100)}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                  <span>{session.memberCount} discussion turns</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
