import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODELS = {
  orchestrator: 'gpt-4-turbo',    // Lenny synthesis - highest quality
  agent: 'gpt-4o-mini',            // Speaker agents - fast + cheap
  classifier: 'gpt-4o-mini',       // Topic classification - cheapest
  embedding: 'text-embedding-3-small',
} as const;

export async function chatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  model: string = MODELS.agent,
  options: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {}
) {
  const { temperature = 0.7, maxTokens = 300, stream = false } = options;

  if (stream) {
    return openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });
  }

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content ?? '';
}

export async function streamChatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  model: string = MODELS.agent,
  options: { temperature?: number; maxTokens?: number } = {}
) {
  const { temperature = 0.7, maxTokens = 300 } = options;

  return openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });
}

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: MODELS.embedding,
    input: text,
  });
  return response.data[0].embedding;
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  // OpenAI supports batch embeddings (max 2048 inputs)
  const batchSize = 2000;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: MODELS.embedding,
      input: batch,
    });
    allEmbeddings.push(...response.data.map(d => d.embedding));
  }

  return allEmbeddings;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default openai;
