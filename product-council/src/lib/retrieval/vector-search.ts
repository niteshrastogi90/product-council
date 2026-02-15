import { TranscriptChunk, ChunkWithScore } from '@/lib/types';
import { getEmbedding, cosineSimilarity } from '@/lib/openai';

interface ChunkWithEmbedding {
  chunk: TranscriptChunk;
  embedding: number[];
}

// In-memory store - loaded once on cold start
let chunksWithEmbeddings: ChunkWithEmbedding[] | null = null;
let chunksOnly: TranscriptChunk[] | null = null;

// Load chunks from data/chunks.json
export async function loadChunks(): Promise<TranscriptChunk[]> {
  if (chunksOnly) return chunksOnly;
  const fs = await import('fs/promises');
  const path = await import('path');
  const data = await fs.readFile(path.join(process.cwd(), 'data/chunks.json'), 'utf-8');
  chunksOnly = JSON.parse(data);
  return chunksOnly!;
}

// Load pre-computed embeddings from data/embeddings/
export async function loadEmbeddings(): Promise<ChunkWithEmbedding[]> {
  if (chunksWithEmbeddings) return chunksWithEmbeddings;

  const fs = await import('fs/promises');
  const path = await import('path');

  const chunks = await loadChunks();
  const embeddingsPath = path.join(process.cwd(), 'data/embeddings/embeddings.json');

  try {
    const embData = await fs.readFile(embeddingsPath, 'utf-8');
    const embeddings: number[][] = JSON.parse(embData);

    chunksWithEmbeddings = chunks.map((chunk, i) => ({
      chunk,
      embedding: embeddings[i] || [],
    }));
  } catch {
    // If no embeddings file, fall back to chunks without embeddings
    console.warn('No embeddings file found. Vector search will not be available.');
    chunksWithEmbeddings = chunks.map(chunk => ({
      chunk,
      embedding: [],
    }));
  }

  return chunksWithEmbeddings;
}

// Search by cosine similarity
export async function vectorSearch(
  query: string,
  topK: number = 20,
  filterEpisodeIds?: string[]
): Promise<ChunkWithScore[]> {
  const allChunks = await loadEmbeddings();

  // Check if we have embeddings
  if (allChunks.length === 0 || allChunks[0].embedding.length === 0) {
    // Fallback: simple text search
    return textSearch(query, topK, filterEpisodeIds);
  }

  const queryEmbedding = await getEmbedding(query);

  let candidates = allChunks;
  if (filterEpisodeIds) {
    const filterSet = new Set(filterEpisodeIds);
    candidates = candidates.filter(c => filterSet.has(c.chunk.episodeId));
  }

  const scored = candidates.map(({ chunk, embedding }) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, embedding),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Fallback text-based search when embeddings aren't available
export async function textSearch(
  query: string,
  topK: number = 20,
  filterEpisodeIds?: string[]
): Promise<ChunkWithScore[]> {
  const chunks = await loadChunks();
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  let candidates = chunks;
  if (filterEpisodeIds) {
    const filterSet = new Set(filterEpisodeIds);
    candidates = candidates.filter(c => filterSet.has(c.episodeId));
  }

  const scored = candidates.map(chunk => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      const matches = contentLower.split(word).length - 1;
      score += matches;
    }
    // Boost for keyword matches
    for (const kw of chunk.keywords) {
      if (queryWords.some(qw => kw.includes(qw) || qw.includes(kw))) {
        score += 2;
      }
    }
    return { ...chunk, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
