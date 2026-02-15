'use client';

import { cn } from '@/lib/utils';
import { Mic, ExternalLink } from 'lucide-react';
import type { AgentInfo } from '@/hooks/useCouncilStream';

interface SpeakerCardProps {
  agent: AgentInfo;
  isSpeaking?: boolean;
  isActive?: boolean;
}

// Color palette for different speakers
const SPEAKER_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-500' },
];

export function getSpeakerColor(index: number) {
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
}

export default function SpeakerCard({ agent, isSpeaking, isActive }: SpeakerCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-300",
        isActive ? "bg-white border-brand-200 shadow-sm" : "bg-gray-50 border-gray-200",
        isSpeaking && "agent-speaking border-brand-400"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0",
        isSpeaking ? "bg-brand-600" : "bg-gray-400"
      )}>
        {agent.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-900 truncate">{agent.name}</span>
          {isSpeaking && <Mic className="w-3 h-3 text-brand-600 animate-pulse flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-500 truncate">{agent.expertise.slice(0, 3).join(', ')}</p>
      </div>
      <a
        href={agent.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-brand-600 flex-shrink-0"
        title="Watch episode"
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
