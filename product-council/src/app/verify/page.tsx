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

    // Sign in via NextAuth credentials provider
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
        // Redirect to council after brief success message
        setTimeout(() => router.push('/council'), 1500);
      }
    }).catch(() => {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    });
  }, [searchParams, router]);

  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-brand-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Signing you in...</h2>
            <p className="text-gray-500">Verifying your magic link.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">You're in!</h2>
            <p className="text-gray-500">Redirecting to Product Council...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Link expired</h2>
            <p className="text-gray-500 mb-4">{errorMsg}</p>
            <a href="/login" className="text-brand-600 hover:underline font-medium">
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
