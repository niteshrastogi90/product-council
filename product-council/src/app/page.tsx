'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Sparkles, Zap, MessageSquare, BookOpen, LogOut } from 'lucide-react';
import Link from 'next/link';
import QueryInput from '@/components/QueryInput';
import ExampleQuestions from '@/components/ExampleQuestions';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading] = useState(false);

  const handleSubmit = (query: string) => {
    const encoded = encodeURIComponent(query);
    router.push(`/council?q=${encoded}`);
  };

  return (
    <main className="flex-1 relative">
      {/* Ambient background */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-brand-600/5 blur-[120px] ambient-glow pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[100px] ambient-glow pointer-events-none" style={{ animationDelay: '4s' }} />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg text-white">Product Council</span>
          </div>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <span className="text-sm text-slate-400">{session.user.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 pt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-subtle text-xs font-medium text-brand-300 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Powered by 303 episodes of Lenny&apos;s Podcast
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
          <span className="text-white">Ask the best product minds.</span>
          <br />
          <span className="text-gradient">Get a council debate.</span>
        </h1>
        <p className="mt-5 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          AI agents representing top PM leaders debate your question in real-time — then synthesize the advice.
        </p>
      </section>

      {/* Query Input */}
      <section className="relative z-10 max-w-2xl mx-auto px-4 pb-8">
        <QueryInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder="Ask a product question — e.g., 'How do I know if we've achieved product-market fit?'"
        />
      </section>

      {/* Example Questions */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 pb-16">
        <p className="text-sm font-medium text-slate-500 mb-3 text-center">Or try one of these</p>
        <ExampleQuestions onSelect={handleSubmit} disabled={isLoading} />
      </section>

      {/* How It Works */}
      <section className="relative z-10 border-t border-white/5 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-white mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: '1. Ask Your Question', desc: 'Pose any product management challenge — from strategy to growth to leadership.' },
              { icon: MessageSquare, title: '2. Watch the Debate', desc: 'AI agents representing relevant podcast guests discuss your question in real-time.' },
              { icon: Zap, title: '3. Get Actionable Advice', desc: 'Lenny synthesizes the discussion into key insights, trade-offs, and action items.' },
            ].map((step) => (
              <div key={step.title} className="glass rounded-2xl p-6 text-center hover:border-brand-500/20 transition-all duration-300">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-brand-500/10 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-600">
            Product Council — Built on 303 episodes of{' '}
            <a href="https://www.lennyspodcast.com/" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
              Lenny&apos;s Podcast
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
