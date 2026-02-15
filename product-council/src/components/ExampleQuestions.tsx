'use client';

import { MessageCircle } from 'lucide-react';

const EXAMPLE_QUESTIONS = [
  { question: "How do I know if we've achieved product-market fit?", topic: "Product-Market Fit" },
  { question: "What's the best approach to user onboarding for a B2B SaaS product?", topic: "Onboarding" },
  { question: "Should we build a growth team or embed growth across the org?", topic: "Growth Strategy" },
  { question: "How should I prioritize my product roadmap when everything feels urgent?", topic: "Prioritization" },
  { question: "What makes a great product leader vs a great product manager?", topic: "Leadership" },
  { question: "When is the right time to pivot vs. persevere with our current product?", topic: "Product Strategy" },
];

interface ExampleQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export default function ExampleQuestions({ onSelect, disabled }: ExampleQuestionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {EXAMPLE_QUESTIONS.map((example) => (
        <button
          key={example.topic}
          onClick={() => !disabled && onSelect(example.question)}
          disabled={disabled}
          className="flex items-start gap-3 p-4 rounded-xl glass
                     text-left hover:border-brand-500/20 hover:bg-surface-200/50 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <MessageCircle className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0 group-hover:text-brand-300" />
          <div>
            <span className="text-xs font-medium text-brand-400 uppercase tracking-wider">{example.topic}</span>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed group-hover:text-slate-200">{example.question}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
