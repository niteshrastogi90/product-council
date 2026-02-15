'use client';

import { MessageCircle } from 'lucide-react';

const EXAMPLE_QUESTIONS = [
  {
    question: "How do I know if we've achieved product-market fit?",
    topic: "Product-Market Fit",
  },
  {
    question: "What's the best approach to user onboarding for a B2B SaaS product?",
    topic: "Onboarding",
  },
  {
    question: "Should we build a growth team or embed growth across the org?",
    topic: "Growth Strategy",
  },
  {
    question: "How should I prioritize my product roadmap when everything feels urgent?",
    topic: "Prioritization",
  },
  {
    question: "What makes a great product leader vs a great product manager?",
    topic: "Leadership",
  },
  {
    question: "When is the right time to pivot vs. persevere with our current product?",
    topic: "Product Strategy",
  },
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
          className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white
                     text-left hover:border-brand-300 hover:bg-brand-50 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <MessageCircle className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0 group-hover:text-brand-600" />
          <div>
            <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">{example.topic}</span>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">{example.question}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
