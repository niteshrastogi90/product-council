'use client';

import { cn } from '@/lib/utils';
import { Mic, ExternalLink } from 'lucide-react';
import type { AgentInfo } from '@/hooks/useCouncilStream';

interface SpeakerCardProps {
  agent: AgentInfo;
  isSpeaking?: boolean;
  isActive?: boolean;
}

const SPEAKER_COLORS = [
  { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', dot: 'bg-violet-500' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-500' },
];

export function getSpeakerColor(index: number) {
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
}

export default function SpeakerCard({ agent, isSpeaking, isActive }: SpeakerCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300",
        isActive ? "glass border-brand-500/20" : "bg-surface-100/50 border-white/5",
        isSpeaking && "agent-speaking border-brand-400/40"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0",
        isSpeaking ? "bg-gradient-to-br from-brand-500 to-purple-500" : "bg-surface-300"
      )}>
        {agent.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-200 truncate">{agent.name}</span>
          {isSpeaking && <Mic className="w-3 h-3 text-brand-400 animate-pulse flex-shrink-0" />}
        </div>
        <p className="text-xs text-slate-500 truncate">{agent.expertise.slice(0, 3).join(', ')}</p>
      </div>
      <a
        href={agent.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-600 hover:text-brand-400 flex-shrink-0 transition-colors"
        title="Watch episode"
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
