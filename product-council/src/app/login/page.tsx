'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/council';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const initialError = errorParam === 'expired-link'
    ? 'That link has expired. Please request a new one.'
    : errorParam === 'auth-failed'
    ? 'Authentication failed. Please try again.'
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/auth/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('sent');
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to send magic link.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Connection error. Please try again.');
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 bg-mesh pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Product Council</span>
          </div>
          <p className="text-slate-400">Sign in to save your sessions and get personalized advice</p>
        </div>

        {initialError && status === 'idle' && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-400">{initialError}</p>
          </div>
        )}

        {status === 'sent' ? (
          <div className="glass rounded-2xl p-6 text-center border-brand-500/20">
            <Mail className="w-10 h-10 text-brand-400 mx-auto mb-3" />
            <h2 className="font-semibold text-white mb-2">Check your email</h2>
            <p className="text-sm text-slate-400">
              We sent a magic link to <strong className="text-slate-200">{email}</strong>.
              Click it to sign in.
            </p>
            <p className="text-xs text-slate-600 mt-3">Link expires in 10 minutes.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 rounded-xl glass
                         focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/30
                         text-slate-100 placeholder:text-slate-500 transition-all"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending' || !email.includes('@')}
              className="w-full py-3 px-4 bg-brand-600 text-white font-medium rounded-xl
                       hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-600">
          No password required. We&apos;ll email you a secure sign-in link.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <LoginContent />
    </Suspense>
  );
}
