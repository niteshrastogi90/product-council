import { EpisodeMeta, TranscriptTurn, TranscriptChunk } from '../types';

const WINDOW_SECONDS = 5 * 60; // 5-minute window for grouping
const MIN_WORDS = 30; // Minimum words to include in a chunk

/**
 * Chunk transcript by grouping consecutive turns from the same guest speaker
 * Groups turns within a 5-minute window, filters out turns with < 30 words
 */
export function chunkTranscript(
  episodeId: string,
  meta: EpisodeMeta,
  turns: TranscriptTurn[]
): TranscriptChunk[] {
  const chunks: TranscriptChunk[] = [];

  if (turns.length === 0) {
    return chunks;
  }

  let currentChunk: TranscriptTurn[] = [];
  let currentSpeaker: string | null = null;
  let lastTimestamp = 0;
  let chunkIndex = 0;

  for (const turn of turns) {
    const wordCount = turn.text.split(/\s+/).length;

    // Skip turns with fewer than 30 words
    if (wordCount < MIN_WORDS) {
      continue;
    }

    // Check if we should start a new chunk
    const isNewSpeaker = currentSpeaker !== null && turn.speaker !== currentSpeaker;
    const isOutsideWindow = lastTimestamp > 0 && turn.timestampSeconds - lastTimestamp > WINDOW_SECONDS;
    const isLennyTurn = turn.speaker === 'Lenny';

    // Lenny's turns don't start or continue chunks - they're separators
    if (isLennyTurn) {
      // Save current chunk if it exists
      if (currentChunk.length > 0 && currentSpeaker) {
        const chunk = buildChunk(
          episodeId,
          meta,
          currentSpeaker,
          currentChunk,
          chunkIndex
        );
        chunks.push(chunk);
        chunkIndex++;
      }

      currentChunk = [];
      currentSpeaker = null;
      lastTimestamp = 0;
      continue;
    }

    // Start new chunk if speaker changed or time window exceeded
    if (isNewSpeaker || isOutsideWindow) {
      if (currentChunk.length > 0 && currentSpeaker) {
        const chunk = buildChunk(
          episodeId,
          meta,
          currentSpeaker,
          currentChunk,
          chunkIndex
        );
        chunks.push(chunk);
        chunkIndex++;
      }

      currentChunk = [turn];
      currentSpeaker = turn.speaker;
      lastTimestamp = turn.timestampSeconds;
    } else {
      // Continue current chunk (or start first one)
      if (!currentSpeaker) {
        currentSpeaker = turn.speaker;
      }
      currentChunk.push(turn);
      lastTimestamp = turn.timestampSeconds;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.length > 0 && currentSpeaker) {
    const chunk = buildChunk(
      episodeId,
      meta,
      currentSpeaker,
      currentChunk,
      chunkIndex
    );
    chunks.push(chunk);
  }

  return chunks;
}

/**
 * Build a TranscriptChunk from grouped turns
 */
function buildChunk(
  episodeId: string,
  meta: EpisodeMeta,
  speaker: string,
  turns: TranscriptTurn[],
  chunkIndex: number
): TranscriptChunk {
  const content = turns.map((turn) => turn.text).join(' ');
  const timestampStart = turns[0].timestampSeconds;
  const timestampEnd = turns[turns.length - 1].timestampSeconds;

  // Generate chunk ID: "episode-slug-chunk-0"
  const chunkId = `${episodeId}-chunk-${chunkIndex}`;

  return {
    id: chunkId,
    episodeId,
    guest: meta.guest,
    episodeTitle: meta.title,
    youtubeUrl: meta.youtubeUrl,
    publishDate: meta.publishDate,
    keywords: meta.keywords,
    speaker,
    content,
    timestampStart,
    timestampEnd,
    turnCount: turns.length,
  };
}
