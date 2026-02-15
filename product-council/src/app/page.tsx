'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Users, Zap, MessageSquare, BookOpen, LogOut } from 'lucide-react';
import Link from 'next/link';
import QueryInput from '@/components/QueryInput';
import ExampleQuestions from '@/components/ExampleQuestions';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (query: string) => {
    const encoded = encodeURIComponent(query);
    router.push(`/council?q=${encoded}`);
  };

  return (
    <main className="flex-1">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            <span className="font-bold text-lg text-gray-900">Product Council</span>
          </div>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <Link href="/history" className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
                  History
                </Link>
                <span className="text-sm text-gray-400">{session.user.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-gray-400 hover:text-red-600 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Ask the best product minds.
          <br />
          <span className="text-brand-600">Get a council debate.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Powered by 303 episodes of Lenny&apos;s Podcast. AI agents representing top PM leaders
          debate your question — then Lenny synthesizes the advice.
        </p>
      </section>

      {/* Query Input */}
      <section className="max-w-2xl mx-auto px-4 pb-8">
        <QueryInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder="Ask a product question — e.g., 'How do I know if we've achieved product-market fit?'"
        />
      </section>

      {/* Example Questions */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <p className="text-sm font-medium text-gray-500 mb-3 text-center">Or try one of these:</p>
        <ExampleQuestions onSelect={handleSubmit} disabled={isLoading} />
      </section>

      {/* How It Works */}
      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Ask Your Question</h3>
              <p className="text-sm text-gray-600">
                Pose any product management challenge — from strategy to growth to leadership.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand-50 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Watch the Debate</h3>
              <p className="text-sm text-gray-600">
                AI agents representing relevant podcast guests discuss your question in real-time.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand-50 flex items-center justify-center">
                <Zap className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Get Actionable Advice</h3>
              <p className="text-sm text-gray-600">
                Lenny synthesizes the discussion into key insights, trade-offs, and action items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Product Council — Built on 303 episodes of{' '}
            <a href="https://www.lennyspodcast.com/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
              Lenny&apos;s Podcast
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
