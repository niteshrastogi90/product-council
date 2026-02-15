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
    <div className={cn("animate-fade-in mb-4", isLenny && "px-2")}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0",
          isLenny ? "bg-brand-600" : (color?.dot || "bg-gray-400")
        )}>
          {agent.charAt(0)}
        </div>
        <span className={cn(
          "text-sm font-semibold",
          isLenny ? "text-brand-700" : "text-gray-800"
        )}>
          {isLenny ? 'Lenny' : agent}
        </span>
        {isLenny && (
          <span className="text-xs text-brand-500 font-medium">Moderator</span>
        )}
      </div>
      <div className={cn(
        "ml-8 rounded-lg px-4 py-3",
        isLenny
          ? "bg-brand-50 border border-brand-100"
          : `${color?.bg || 'bg-gray-50'} border ${color?.border || 'border-gray-200'}`,
      )}>
        <p className={cn(
          "text-sm leading-relaxed text-gray-800",
          isStreaming && "streaming-cursor"
        )}>
          {content}
        </p>
      </div>
    </div>
  );
}
