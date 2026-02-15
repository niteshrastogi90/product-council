import { TopicIndex, EpisodeMeta } from '@/lib/types';

// Load topic index from data/topics.json (cached in memory)
let topicIndex: TopicIndex | null = null;

async function loadTopicIndex(): Promise<TopicIndex> {
  if (topicIndex) return topicIndex;
  const fs = await import('fs/promises');
  const path = await import('path');
  const data = await fs.readFile(path.join(process.cwd(), 'data/topics.json'), 'utf-8');
  topicIndex = JSON.parse(data);
  return topicIndex!;
}

// Extract keywords from a query by normalizing and matching against known topics
export async function matchTopics(query: string): Promise<string[]> {
  const topics = await loadTopicIndex();
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  const scored: { topic: string; score: number }[] = [];

  for (const topic of Object.keys(topics)) {
    const topicWords = topic.split('-');
    let score = 0;

    // Exact substring match in query
    if (queryLower.includes(topic.replace(/-/g, ' '))) {
      score += 3;
    }

    // Individual word overlap
    for (const tw of topicWords) {
      for (const qw of queryWords) {
        if (qw.includes(tw) || tw.includes(qw)) {
          score += 1;
        }
      }
    }

    if (score > 0) {
      scored.push({ topic, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.topic);
}

// Get episode IDs for matched topics
export async function getEpisodesForTopics(topics: string[]): Promise<string[]> {
  const index = await loadTopicIndex();
  const episodeSet = new Set<string>();

  for (const topic of topics) {
    const topicData = index[topic];
    if (topicData) {
      for (const ep of topicData.episodes) {
        episodeSet.add(ep);
      }
    }
  }

  return Array.from(episodeSet);
}
