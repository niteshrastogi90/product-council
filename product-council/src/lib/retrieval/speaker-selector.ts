import { ChunkWithScore, CouncilMember, SpeakerContext } from '@/lib/types';

interface SpeakerScore {
  name: string;
  episodeId: string;
  episodeTitle: string;
  youtubeUrl: string;
  totalScore: number;
  chunks: ChunkWithScore[];
  keywords: string[];
}

// Select 3-5 diverse speakers from retrieved chunks
export function selectSpeakers(
  rankedChunks: ChunkWithScore[],
  count: number = 4
): CouncilMember[] {
  // Group chunks by speaker (guest name)
  const speakerMap = new Map<string, SpeakerScore>();

  for (const chunk of rankedChunks) {
    // Skip Lenny's turns - we only want guests
    if (chunk.speaker.toLowerCase() === 'lenny') continue;

    const existing = speakerMap.get(chunk.guest);
    if (existing) {
      existing.totalScore += chunk.score;
      existing.chunks.push(chunk);
      // Merge keywords
      for (const kw of chunk.keywords) {
        if (!existing.keywords.includes(kw)) {
          existing.keywords.push(kw);
        }
      }
    } else {
      speakerMap.set(chunk.guest, {
        name: chunk.guest,
        episodeId: chunk.episodeId,
        episodeTitle: chunk.episodeTitle,
        youtubeUrl: chunk.youtubeUrl,
        totalScore: chunk.score,
        chunks: [chunk],
        keywords: [...chunk.keywords],
      });
    }
  }

  // Sort by total relevance score
  const ranked = Array.from(speakerMap.values())
    .sort((a, b) => b.totalScore - a.totalScore);

  // Select diverse speakers - try to avoid too much topic overlap
  const selected: SpeakerScore[] = [];
  const coveredKeywords = new Set<string>();

  for (const speaker of ranked) {
    if (selected.length >= count) break;

    // Check if this speaker brings new perspectives
    const newKeywords = speaker.keywords.filter(kw => !coveredKeywords.has(kw));
    const diversityBonus = newKeywords.length > 0 ? 1 : 0;

    if (selected.length < 2 || diversityBonus > 0) {
      selected.push(speaker);
      speaker.keywords.forEach(kw => coveredKeywords.add(kw));
    }
  }

  // If we didn't get enough through diversity, fill with top-ranked
  if (selected.length < Math.min(count, ranked.length)) {
    for (const speaker of ranked) {
      if (selected.length >= count) break;
      if (!selected.includes(speaker)) {
        selected.push(speaker);
      }
    }
  }

  // Convert to CouncilMember format
  return selected.map(speaker => ({
    name: speaker.name,
    episodeId: speaker.episodeId,
    episodeTitle: speaker.episodeTitle,
    youtubeUrl: speaker.youtubeUrl,
    expertise: speaker.keywords.slice(0, 5),
    context: buildSpeakerContext(speaker),
  }));
}

function buildSpeakerContext(speaker: SpeakerScore): SpeakerContext {
  // Take top 3 chunks by score
  const topChunks = speaker.chunks
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Extract key quotes (first sentence of each chunk)
  const quotes = topChunks.map(chunk => {
    const firstSentence = chunk.content.split(/[.!?]/)[0]?.trim();
    return firstSentence ? `${firstSentence}.` : '';
  }).filter(Boolean);

  return {
    name: speaker.name,
    episodeId: speaker.episodeId,
    episodeTitle: speaker.episodeTitle,
    youtubeUrl: speaker.youtubeUrl,
    expertise: speaker.keywords.slice(0, 5),
    quotes,
    passages: topChunks,
  };
}
