import { CouncilMember, DebateTurn } from '@/lib/types';
import { streamChatCompletion, MODELS } from '@/lib/openai';
import { getSpeakerPrompt } from './prompts';

export async function* generateSpeakerResponse(
  member: CouncilMember,
  query: string,
  previousTurns: DebateTurn[],
  isFirstRound: boolean = true
): AsyncGenerator<string> {
  const prompt = getSpeakerPrompt(member, query, previousTurns, isFirstRound);

  const stream = await streamChatCompletion(
    [
      { role: 'system', content: `You are ${member.name}, speaking on a product council panel. Be concise, practical, and grounded in your real experience.` },
      { role: 'user', content: prompt },
    ],
    MODELS.agent,
    { temperature: 0.7, maxTokens: 200 }
  );

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
