import { CouncilMember, RetrievalResult } from '@/lib/types';
import { matchTopics, getEpisodesForTopics } from './keyword-matcher';
import { vectorSearch, textSearch } from './vector-search';
import { selectSpeakers } from './speaker-selector';

export async function retrieveCouncilMembers(
  query: string,
  speakerCount: number = 4
): Promise<{ members: CouncilMember[]; topics: string[] }> {
  // Stage 1: Keyword matching to get candidate episodes
  const topics = await matchTopics(query);

  let candidateEpisodeIds: string[] | undefined;
  if (topics.length > 0) {
    candidateEpisodeIds = await getEpisodesForTopics(topics);
  }

  // Stage 2: Vector/text search to find relevant chunks
  // If we have candidate episodes from topic matching, filter to those
  // Otherwise search all chunks
  const rankedChunks = await vectorSearch(query, 30, candidateEpisodeIds);

  // If keyword matching returned too few results, also search without filter
  if (rankedChunks.length < 10 && candidateEpisodeIds) {
    const broadResults = await vectorSearch(query, 20);
    // Merge and deduplicate
    const seenIds = new Set(rankedChunks.map(c => c.id));
    for (const chunk of broadResults) {
      if (!seenIds.has(chunk.id)) {
        rankedChunks.push(chunk);
        seenIds.add(chunk.id);
      }
    }
  }

  // Stage 3: Select diverse speakers
  const members = selectSpeakers(rankedChunks, speakerCount);

  return { members, topics };
}
