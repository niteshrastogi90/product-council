'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setErrorMsg('Invalid or expired link.');
      return;
    }

    signIn('magic-link', {
      email,
      token,
      redirect: false,
    }).then((result) => {
      if (result?.error) {
        setStatus('error');
        setErrorMsg('Link expired or already used. Please request a new one.');
      } else {
        setStatus('success');
        setTimeout(() => router.push('/council'), 1500);
      }
    }).catch(() => {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    });
  }, [searchParams, router]);

  return (
    <main className="flex-1 flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="text-center max-w-md relative z-10">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Signing you in...</h2>
            <p className="text-slate-400">Verifying your magic link.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">You&apos;re in!</h2>
            <p className="text-slate-400">Redirecting to Product Council...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Link expired</h2>
            <p className="text-slate-400 mb-4">{errorMsg}</p>
            <a href="/login" className="text-brand-400 hover:underline font-medium">
              Request a new link
            </a>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
