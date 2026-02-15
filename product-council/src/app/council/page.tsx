'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft, Loader2 } from 'lucide-react';
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
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const council = useCouncilStream();

  // Auto-start if query is provided via URL
  useEffect(() => {
    if (initialQuery && council.status === 'idle') {
      setQuery(initialQuery);
      council.startCouncil(initialQuery);
    }
  }, [initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewQuery = (q: string) => {
    setQuery(q);
    council.reset();
    council.startCouncil(q);
    // Update URL without navigation
    window.history.replaceState(null, '', `/council?q=${encodeURIComponent(q)}`);
  };

  const isActive = council.status !== 'idle' && council.status !== 'error';
  const isDebating = council.status === 'debating' || council.status === 'synthesizing';

  // Find which agent is currently streaming
  const currentSpeaker = council.turns.find(t => t.isStreaming)?.agent || null;

  // Map agent names to indices for consistent colors
  const agentIndexMap = new Map<string, number>();
  council.agents.forEach((a, i) => agentIndexMap.set(a.name, i));

  return (
    <main className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <span className="font-bold text-gray-900">Product Council</span>
            </div>
          </div>
          {council.status !== 'idle' && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isActive && council.status !== 'complete' && (
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              )}
              <span>{council.statusMessage}</span>
            </div>
          )}
        </div>
      </header>

      {/* No query yet — show input */}
      {council.status === 'idle' && !initialQuery && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Ask the Council</h2>
          <p className="text-gray-600 mb-6 text-center">Pose a product question and get advice from the best PM minds.</p>
          <div className="w-full mb-8">
            <QueryInput onSubmit={handleNewQuery} isLoading={false} />
          </div>
          <ExampleQuestions onSelect={handleNewQuery} />
        </div>
      )}

      {/* Active session — dual panel */}
      {(isActive || council.status === 'complete' || council.status === 'error') && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel — Chat / Synthesis */}
          <div className="w-full lg:w-2/5 border-r border-gray-200 flex flex-col bg-white overflow-y-auto">
            <div className="p-6 flex-1">
              {/* User question */}
              <div className="mb-6">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Question</span>
                <p className="mt-2 text-lg font-medium text-gray-900">{query}</p>
              </div>

              {/* Topics matched */}
              {council.topics.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Topics</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {council.topics.map(topic => (
                      <span key={topic} className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full">
                        {topic.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Council Members */}
              {council.agents.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Council Members</span>
                  <div className="space-y-2">
                    {council.agents.map((agent, i) => (
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
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700">{council.error}</p>
                </div>
              )}

              {/* Follow-up */}
              {council.status === 'complete' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Ask a follow-up question:</p>
                  <QueryInput onSubmit={handleNewQuery} isLoading={false} />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel — Discussion Thread */}
          <div className="hidden lg:flex lg:w-3/5 flex-col bg-gray-50 overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-900 text-sm">Council Discussion</h3>
            </div>
            <div className="flex-1 p-6 space-y-1">
              {/* Loading state */}
              {council.status === 'retrieving' && (
                <div className="flex items-center gap-3 text-gray-500 py-8 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
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
                <div className="flex items-center gap-3 text-brand-600 py-4 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Lenny is wrapping up...</span>
                </div>
              )}

              {/* Complete message */}
              {council.status === 'complete' && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">Discussion complete. Check the synthesis on the left.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Wrap in Suspense for useSearchParams
export default function CouncilPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    }>
      <CouncilContent />
    </Suspense>
  );
}
