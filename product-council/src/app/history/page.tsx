'use client';

import { useState, useEffect } from 'react';
import { Users, ArrowLeft, Clock, MessageSquare, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
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
    <main className="flex-1">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/council" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Users className="w-5 h-5 text-brand-600" />
            <span className="font-bold text-gray-900">Session History</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-12">{error}</p>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No sessions yet</p>
            <Link href="/council" className="text-brand-600 hover:underline text-sm">
              Start your first council session
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <Link
                key={session.id}
                href={`/council/${session.id}`}
                className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300
                         hover:shadow-sm transition-all duration-200"
              >
                <p className="font-medium text-gray-900 mb-1">{truncate(session.query, 100)}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
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
