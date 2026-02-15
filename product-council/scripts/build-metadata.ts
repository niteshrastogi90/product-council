import fs from 'fs';
import path from 'path';
import { parseAllEpisodes } from '../src/lib/data/parser';
import { EpisodeMeta, TopicIndex } from '../src/lib/types';

// Load .env.local from project root so TRANSCRIPT_PATH is available
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

/**
 * Build metadata files:
 * 1. Reads all episode transcripts -> writes data/episodes.json (array of EpisodeMeta)
 * 2. Reads all index/*.md topic files -> writes data/topics.json (TopicIndex)
 */

async function main() {
  try {
    // Get transcript base path from env or default (workspace root sibling: ../../)
    const defaultPath = path.resolve(__dirname, '../../lennys-podcast-transcripts-main/lennys-podcast-transcripts-main');
    const transcriptPath = process.env.TRANSCRIPT_PATH
      ? path.resolve(process.cwd(), process.env.TRANSCRIPT_PATH)
      : defaultPath;

    console.log(`📂 Reading from: ${transcriptPath}`);

    // Step 1: Extract metadata from all episodes
    console.log('\n📖 Extracting episode metadata...');
    const episodes = parseAllEpisodes(transcriptPath);
    const episodeMetas: EpisodeMeta[] = episodes.map((ep) => ep.meta);

    console.log(`✅ Extracted metadata for ${episodeMetas.length} episodes`);

    // Step 2: Build topic index from index/*.md files
    console.log('\n🏷️  Building topic index...');
    const topicIndex = buildTopicIndex(transcriptPath);
    console.log(`✅ Found ${Object.keys(topicIndex).length} topics`);

    // Ensure data directory exists
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write episodes.json
    const episodesPath = path.join(dataDir, 'episodes.json');
    fs.writeFileSync(episodesPath, JSON.stringify(episodeMetas, null, 2));
    console.log(`💾 Wrote episodes to: ${episodesPath}`);

    // Write topics.json
    const topicsPath = path.join(dataDir, 'topics.json');
    fs.writeFileSync(topicsPath, JSON.stringify(topicIndex, null, 2));
    console.log(`💾 Wrote topics to: ${topicsPath}`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📈 METADATA BUILD SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total episodes: ${episodeMetas.length}`);
    console.log(`Total topics: ${Object.keys(topicIndex).length}`);

    // Show sample topics
    const sampleTopics = Object.entries(topicIndex)
      .slice(0, 5)
      .map(([topic, data]) => `${topic} (${data.count})`);
    console.log(`Sample topics: ${sampleTopics.join(', ')}`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('❌ Error building metadata:', error);
    process.exit(1);
  }
}

/**
 * Build topic index by parsing all index/*.md files
 * Extracts episode IDs from markdown links in format: [Guest Name](../episodes/{episode-id}/transcript.md)
 */
function buildTopicIndex(basePath: string): TopicIndex {
  const topicIndex: TopicIndex = {};

  const indexDir = path.join(basePath, 'index');
  if (!fs.existsSync(indexDir)) {
    console.warn(`⚠️  Index directory not found at ${indexDir}`);
    return topicIndex;
  }

  // Read all .md files in index directory
  const files = fs.readdirSync(indexDir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const topicName = path.basename(file, '.md');

    // Skip README
    if (topicName === 'README') {
      continue;
    }

    const filePath = path.join(indexDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract episode IDs from markdown links
    // Pattern: [Guest Name](../episodes/{episode-id}/transcript.md)
    const episodePattern = /\[.+?\]\(\.\.\/episodes\/(.+?)\/transcript\.md\)/g;
    const episodeIds: string[] = [];
    let match;

    while ((match = episodePattern.exec(content)) !== null) {
      const episodeId = match[1];
      if (episodeId && !episodeIds.includes(episodeId)) {
        episodeIds.push(episodeId);
      }
    }

    if (episodeIds.length > 0) {
      topicIndex[topicName] = {
        episodes: episodeIds,
        count: episodeIds.length,
      };
    }
  }

  return topicIndex;
}

main();
