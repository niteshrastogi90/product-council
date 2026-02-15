'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function QueryInput({ onSubmit, isLoading, placeholder }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [query]);

  const handleSubmit = () => {
    if (query.trim().length >= 10 && !isLoading) {
      onSubmit(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <div className="relative flex items-end glass rounded-2xl focus-within:ring-2 focus-within:ring-brand-500/40 focus-within:border-brand-500/30 transition-all duration-300">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask the Product Council a question..."}
          disabled={isLoading}
          rows={1}
          className={cn(
            "flex-1 px-4 py-3.5 bg-transparent text-slate-100 placeholder:text-slate-500 resize-none",
            "focus:outline-none",
            "transition-all duration-200",
            isLoading && "opacity-60 cursor-not-allowed"
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={query.trim().length < 10 || isLoading}
          className={cn(
            "m-2 p-2.5 rounded-xl transition-all duration-200 flex-shrink-0",
            query.trim().length >= 10 && !isLoading
              ? "bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/20"
              : "bg-surface-200 text-slate-500 cursor-not-allowed"
          )}
          title="Submit (Enter)"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="mt-1.5 flex justify-between px-1">
        <span className="text-xs text-slate-600">
          {query.trim().length < 10 && query.length > 0 ? `${10 - query.trim().length} more characters needed` : ''}
        </span>
        <span className="text-xs text-slate-600">Shift+Enter for new line</span>
      </div>
    </div>
  );
}
