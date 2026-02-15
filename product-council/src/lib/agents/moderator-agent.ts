import { CouncilMember, DebateTurn } from '@/lib/types';
import { streamChatCompletion, MODELS } from '@/lib/openai';
import { getModeratorIntroPrompt, getModeratorProbePrompt, getSynthesisPrompt } from './prompts';

export async function* generateModeratorIntro(
  query: string,
  members: CouncilMember[]
): AsyncGenerator<string> {
  const prompt = getModeratorIntroPrompt(query, members);

  const stream = await streamChatCompletion(
    [
      { role: 'system', content: 'You are Lenny Rachitsky, host of Lenny\'s Podcast. Be warm, curious, and brief.' },
      { role: 'user', content: prompt },
    ],
    MODELS.orchestrator,
    { temperature: 0.7, maxTokens: 150 }
  );

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}

export async function* generateModeratorProbe(
  query: string,
  turns: DebateTurn[],
  members: CouncilMember[]
): AsyncGenerator<string> {
  const prompt = getModeratorProbePrompt(query, turns, members);

  const stream = await streamChatCompletion(
    [
      { role: 'system', content: 'You are Lenny Rachitsky. Ask one sharp, curious question.' },
      { role: 'user', content: prompt },
    ],
    MODELS.orchestrator,
    { temperature: 0.7, maxTokens: 100 }
  );

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}

export async function* generateSynthesis(
  query: string,
  turns: DebateTurn[],
  members: CouncilMember[]
): AsyncGenerator<string> {
  const prompt = getSynthesisPrompt(query, turns, members);

  const stream = await streamChatCompletion(
    [
      { role: 'system', content: 'You are Lenny Rachitsky, synthesizing a product council discussion. Be practical and actionable.' },
      { role: 'user', content: prompt },
    ],
    MODELS.orchestrator,
    { temperature: 0.5, maxTokens: 400 }
  );

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}
