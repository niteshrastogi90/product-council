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

  // Auto-resize textarea
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
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Ask the Product Council a question..."}
        disabled={isLoading}
        rows={2}
        className={cn(
          "w-full px-4 py-3 pr-14 rounded-xl border border-gray-200 bg-white",
          "text-gray-900 placeholder:text-gray-400 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
          "transition-all duration-200",
          isLoading && "opacity-60 cursor-not-allowed"
        )}
      />
      <button
        onClick={handleSubmit}
        disabled={query.trim().length < 10 || isLoading}
        className={cn(
          "absolute right-3 bottom-3 p-2 rounded-lg transition-all duration-200",
          query.trim().length >= 10 && !isLoading
            ? "bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
        title="Submit (Cmd+Enter)"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
      <div className="mt-1 flex justify-between px-1">
        <span className="text-xs text-gray-400">
          {query.trim().length < 10 && query.length > 0 ? `${10 - query.trim().length} more characters needed` : ''}
        </span>
        <span className="text-xs text-gray-400">Cmd+Enter to submit</span>
      </div>
    </div>
  );
}
