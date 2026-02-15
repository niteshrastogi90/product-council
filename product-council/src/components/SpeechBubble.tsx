'use client';

import { cn } from '@/lib/utils';
import { getSpeakerColor } from './SpeakerCard';

interface SpeechBubbleProps {
  agent: string;
  content: string;
  role: 'moderator' | 'speaker';
  isStreaming: boolean;
  speakerIndex: number;
}

export default function SpeechBubble({ agent, content, role, isStreaming, speakerIndex }: SpeechBubbleProps) {
  const isLenny = role === 'moderator';
  const color = isLenny ? null : getSpeakerColor(speakerIndex);

  return (
    <div className={cn("animate-fade-in mb-4", isLenny && "px-1")}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0",
          isLenny ? "bg-gradient-to-br from-brand-500 to-purple-500" : (color?.dot || "bg-surface-300")
        )}>
          {agent.charAt(0)}
        </div>
        <span className={cn(
          "text-sm font-semibold",
          isLenny ? "text-brand-400" : "text-slate-300"
        )}>
          {isLenny ? 'Lenny' : agent}
        </span>
        {isLenny && (
          <span className="text-xs text-brand-500/70 font-medium">Moderator</span>
        )}
      </div>
      <div className={cn(
        "ml-8 rounded-xl px-4 py-3",
        isLenny
          ? "bg-brand-500/10 border border-brand-500/15"
          : `${color?.bg || 'bg-surface-100'} border ${color?.border || 'border-white/5'}`,
      )}>
        <p className={cn(
          "text-sm leading-relaxed text-slate-300",
          isStreaming && "streaming-cursor"
        )}>
          {content}
        </p>
      </div>
    </div>
  );
}
