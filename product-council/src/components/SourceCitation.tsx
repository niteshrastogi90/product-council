'use client';

import { ExternalLink, Youtube } from 'lucide-react';
import type { SourceInfo } from '@/hooks/useCouncilStream';

interface SourceCitationProps {
  sources: SourceInfo[];
}

export default function SourceCitation({ sources }: SourceCitationProps) {
  if (sources.length === 0) return null;

  return (
    <div className="animate-fade-in mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Youtube className="w-4 h-4 text-red-500" />
        Go Deeper — Episodes Referenced
      </h4>
      <div className="space-y-2">
        {sources.map((source) => {
          const url = source.timestamp
            ? `${source.youtubeUrl}&t=${parseTimestamp(source.timestamp)}`
            : source.youtubeUrl;

          return (
            <a
              key={source.guest}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm
                         transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center
                              text-xs font-semibold flex-shrink-0">
                {source.guest.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-800 group-hover:text-brand-700">
                  {source.guest}
                </span>
                <p className="text-xs text-gray-500 truncate">{source.episodeTitle}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-brand-600 flex-shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function parseTimestamp(ts: string): number {
  const parts = ts.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}
