'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCouncilStream } from '@/hooks/useCouncilStream';
import QueryInput from '@/components/QueryInput';
import ExampleQuestions from '@/components/ExampleQuestions';
import SpeakerCard from '@/components/SpeakerCard';
import SpeechBubble from '@/components/SpeechBubble';
import SynthesisPanel from '@/components/SynthesisPanel';
import SourceCitation from '@/components/SourceCitation';

function CouncilContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const council = useCouncilStream();
  const discussionPanelRef = useRef<HTMLDivElement>(null);

  // Auto-start if query is provided via URL
  useEffect(() => {
    if (initialQuery && council.status === 'idle') {
      setQuery(initialQuery);
      council.startCouncil(initialQuery);
    }
  }, [initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll only the discussion panel (not the whole page)
  useEffect(() => {
    const panel = discussionPanelRef.current;
    if (panel) {
      panel.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' });
    }
  }, [council.turns, council.synthesis]);

  const handleNewQuery = (q: string) => {
    setQuery(q);
    council.reset();
    council.startCouncil(q);
    window.history.replaceState(null, '', `/council?q=${encodeURIComponent(q)}`);
  };

  const isActive = council.status !== 'idle' && council.status !== 'error';
  const currentSpeaker = council.turns.find(t => t.isStreaming)?.agent || null;

  const agentIndexMap = new Map<string, number>();
  council.agents.forEach((a, i) => agentIndexMap.set(a.name, i));

  return (
    <main className="flex-1 flex flex-col h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-white/5 bg-surface-50/80 backdrop-blur-sm flex-shrink-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-white">Product Council</span>
            </div>
          </div>
          {council.status !== 'idle' && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {isActive && council.status !== 'complete' && (
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              )}
              <span>{council.statusMessage}</span>
            </div>
          )}
        </div>
      </header>

      {/* No query yet — show input */}
      {council.status === 'idle' && !initialQuery && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto w-full relative">
          <div className="fixed inset-0 bg-mesh pointer-events-none" />
          <div className="relative z-10 w-full text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Ask the Council</h2>
            <p className="text-slate-400 mb-6">Pose a product question and get advice from the best PM minds.</p>
            <div className="w-full mb-8">
              <QueryInput onSubmit={handleNewQuery} isLoading={false} />
            </div>
            <ExampleQuestions onSelect={handleNewQuery} />
          </div>
        </div>
      )}

      {/* Active session — dual panel */}
      {(isActive || council.status === 'complete' || council.status === 'error') && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel — Chat / Synthesis */}
          <div className="w-full lg:w-2/5 border-r border-white/5 flex flex-col bg-surface-50 overflow-y-auto">
            <div className="p-6 flex-1">
              {/* User question */}
              <div className="mb-6">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Your Question</span>
                <p className="mt-2 text-lg font-medium text-white">{query}</p>
              </div>

              {/* Topics matched */}
              {council.topics.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Topics</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {council.topics.map(topic => (
                      <span key={topic} className="px-2.5 py-1 bg-brand-500/10 text-brand-400 text-xs font-medium rounded-full border border-brand-500/20">
                        {topic.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Council Members */}
              {council.agents.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Council Members</span>
                  <div className="space-y-2">
                    {council.agents.map((agent) => (
                      <SpeakerCard
                        key={agent.name}
                        agent={agent}
                        isSpeaking={currentSpeaker === agent.name}
                        isActive={council.turns.some(t => t.agent === agent.name)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Synthesis */}
              {council.synthesis && (
                <SynthesisPanel content={council.synthesis} isStreaming={council.synthesisStreaming} />
              )}

              {/* Sources */}
              <SourceCitation sources={council.sources} />

              {/* Error */}
              {council.status === 'error' && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400">{council.error}</p>
                </div>
              )}

              {/* Follow-up */}
              {council.status === 'complete' && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-sm text-slate-400 mb-3">Ask a follow-up question:</p>
                  <QueryInput onSubmit={handleNewQuery} isLoading={false} />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel — Discussion Thread */}
          <div ref={discussionPanelRef} className="hidden lg:flex lg:w-3/5 flex-col bg-surface overflow-y-auto dot-pattern">
            <div className="px-6 py-4 border-b border-white/5 bg-surface-50/80 backdrop-blur-sm sticky top-0 z-10">
              <h3 className="font-semibold text-slate-200 text-sm">Council Discussion</h3>
            </div>
            <div className="flex-1 p-6 space-y-1">
              {/* Loading state */}
              {council.status === 'retrieving' && (
                <div className="flex items-center gap-3 text-slate-400 py-8 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                  <span className="text-sm">{council.statusMessage}</span>
                </div>
              )}

              {/* Debate turns */}
              {council.turns.map((turn, i) => (
                <SpeechBubble
                  key={`${turn.agent}-${turn.phase}-${turn.round ?? ''}-${i}`}
                  agent={turn.agent}
                  content={turn.content}
                  role={turn.role}
                  isStreaming={turn.isStreaming}
                  speakerIndex={agentIndexMap.get(turn.agent) ?? 0}
                />
              ))}

              {/* Synthesizing indicator */}
              {council.status === 'synthesizing' && !council.turns.some(t => t.isStreaming) && (
                <div className="flex items-center gap-3 text-brand-400 py-4 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Lenny is wrapping up...</span>
                </div>
              )}

              {/* Complete message */}
              {council.status === 'complete' && (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500">Discussion complete. Check the synthesis on the left.</p>
                </div>
              )}

              {/* Auto-scroll is handled by discussionPanelRef.scrollTo */}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CouncilPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    }>
      <CouncilContent />
    </Suspense>
  );
}
