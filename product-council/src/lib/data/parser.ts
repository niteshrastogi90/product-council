import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { EpisodeMeta, TranscriptTurn } from '../types';

/**
 * Parse a single transcript markdown file
 * Returns metadata from YAML frontmatter and parsed transcript turns
 */
export function parseTranscript(filePath: string): {
  meta: EpisodeMeta;
  turns: TranscriptTurn[];
} {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: markdown } = matter(content);

  // Extract episode ID from directory path
  // e.g., /path/to/ada-chen-rekhi/transcript.md -> "ada-chen-rekhi"
  const episodeId = path.basename(path.dirname(filePath));

  // Parse frontmatter into EpisodeMeta
  const meta: EpisodeMeta = {
    id: episodeId,
    guest: data.guest || '',
    title: data.title || '',
    youtubeUrl: data.youtube_url || '',
    videoId: data.video_id || '',
    publishDate: data.publish_date || '',
    description: data.description || '',
    durationSeconds: data.duration_seconds || 0,
    duration: data.duration || '',
    viewCount: data.view_count || 0,
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
  };

  // Parse transcript turns from markdown content
  const turns = parseTranscriptTurns(markdown);

  return { meta, turns };
}

/**
 * Parse all transcript files from a base directory
 * Returns array of parsed episodes with their metadata and turns
 */
export function parseAllEpisodes(
  basePath: string
): Array<{ meta: EpisodeMeta; turns: TranscriptTurn[] }> {
  const episodes: Array<{ meta: EpisodeMeta; turns: TranscriptTurn[] }> = [];

  // Get all episode directories
  const episodeDir = path.join(basePath, 'episodes');
  if (!fs.existsSync(episodeDir)) {
    throw new Error(`Episodes directory not found at ${episodeDir}`);
  }

  const directories = fs.readdirSync(episodeDir);

  for (const dir of directories) {
    const transcriptPath = path.join(episodeDir, dir, 'transcript.md');

    // Skip if transcript.md doesn't exist in this directory
    if (!fs.existsSync(transcriptPath)) {
      continue;
    }

    try {
      const episode = parseTranscript(transcriptPath);
      episodes.push(episode);
    } catch (error) {
      console.error(`Error parsing episode at ${transcriptPath}:`, error);
      // Continue processing other episodes on error
      continue;
    }
  }

  return episodes;
}

/**
 * Parse speaker turns from transcript markdown content
 * Matches pattern: "Speaker Name (HH:MM:SS): text"
 */
function parseTranscriptTurns(markdown: string): TranscriptTurn[] {
  const turns: TranscriptTurn[] = [];

  // Split by lines and process
  const lines = markdown.split('\n');
  let currentSpeaker = '';
  let currentTimestamp = '';
  let currentTimestampSeconds = 0;
  let currentText: string[] = [];

  for (const line of lines) {
    // Match speaker turn pattern: "Speaker Name (HH:MM:SS):"
    const speakerMatch = line.match(/^(.+?)\s*\((\d{1,2}:\d{2}:\d{2})\):\s*(.*)$/m);

    if (speakerMatch) {
      // If we have accumulated text from a previous speaker, save it
      if (currentSpeaker && currentText.length > 0) {
        turns.push({
          speaker: currentSpeaker,
          timestampRaw: currentTimestamp,
          timestampSeconds: currentTimestampSeconds,
          text: currentText.join(' ').trim(),
        });
      }

      // Start new speaker turn
      currentSpeaker = speakerMatch[1].trim();
      currentTimestamp = speakerMatch[2];
      currentTimestampSeconds = timestampToSeconds(speakerMatch[2]);
      currentText = [speakerMatch[3].trim()];
    } else if (currentSpeaker && line.trim()) {
      // Continuation of current speaker's text
      currentText.push(line.trim());
    }
  }

  // Don't forget the last turn
  if (currentSpeaker && currentText.length > 0) {
    turns.push({
      speaker: currentSpeaker,
      timestampRaw: currentTimestamp,
      timestampSeconds: currentTimestampSeconds,
      text: currentText.join(' ').trim(),
    });
  }

  return turns;
}

/**
 * Convert timestamp string "HH:MM:SS" to total seconds
 */
function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(':').map(Number);
  if (parts.length !== 3) {
    return 0;
  }
  const [hours, minutes, seconds] = parts;
  return hours * 3600 + minutes * 60 + seconds;
}
