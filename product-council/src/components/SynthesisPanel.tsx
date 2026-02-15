'use client';

import { cn } from '@/lib/utils';
import { Lightbulb } from 'lucide-react';

interface SynthesisPanelProps {
  content: string;
  isStreaming: boolean;
}

export default function SynthesisPanel({ content, isStreaming }: SynthesisPanelProps) {
  if (!content) return null;

  return (
    <div className="animate-slide-up glass rounded-2xl overflow-hidden border-brand-500/20">
      <div className="bg-brand-500/10 px-5 py-3 border-b border-brand-500/10 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-brand-400" />
        <h3 className="font-semibold text-brand-300 text-sm">Council Synthesis</h3>
      </div>
      <div className={cn(
        "px-5 py-4 synthesis-content text-sm leading-relaxed text-slate-300",
        isStreaming && "streaming-cursor"
      )}>
        <div dangerouslySetInnerHTML={{ __html: simpleMarkdown(content) }} />
      </div>
    </div>
  );
}

function simpleMarkdown(text: string): string {
  return text
    .replace(/### (.+)/g, '<h3>$1</h3>')
    .replace(/## (.+)/g, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- (.+)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}
