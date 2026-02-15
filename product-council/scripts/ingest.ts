import fs from 'fs';
import path from 'path';
import { parseTranscript } from '../src/lib/data/parser';
import { chunkTranscript } from '../src/lib/data/chunker';
import type { TranscriptChunk } from '../src/lib/types';

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

async function main() {
  try {
    // Resolve transcript path
    const defaultPath = path.resolve(__dirname, '../../lennys-podcast-transcripts-main/lennys-podcast-transcripts-main');
    const transcriptPath = process.env.TRANSCRIPT_PATH
      ? path.resolve(process.cwd(), process.env.TRANSCRIPT_PATH)
      : defaultPath;

    console.log(`📂 Reading transcripts from: ${transcriptPath}`);

    // Verify the path exists
    const episodesDir = path.join(transcriptPath, 'episodes');
    if (!fs.existsSync(episodesDir)) {
      console.error(`❌ Episodes directory not found at: ${episodesDir}`);
      console.error(`   Set TRANSCRIPT_PATH in .env.local to point to your transcript archive root.`);
      process.exit(1);
    }

    const dirs = fs.readdirSync(episodesDir);
    console.log(`   Found ${dirs.length} episode directories`);

    // Parse and chunk each episode individually (with progress)
    const allChunks: TranscriptChunk[] = [];
    let parsed = 0;
    let skipped = 0;

    for (const dir of dirs) {
      const transcriptFile = path.join(episodesDir, dir, 'transcript.md');
      if (!fs.existsSync(transcriptFile)) {
        skipped++;
        continue;
      }

      try {
        const { meta, turns } = parseTranscript(transcriptFile);
        const chunks = chunkTranscript(meta.id, meta, turns);
        allChunks.push(...chunks);
        parsed++;

        // Progress log every 50 episodes
        if (parsed % 50 === 0) {
          console.log(`   ... parsed ${parsed} episodes (${allChunks.length} chunks so far)`);
        }
      } catch (err) {
        console.warn(`   ⚠️  Skipping ${dir}: ${err instanceof Error ? err.message : err}`);
        skipped++;
      }
    }

    console.log(`✅ Parsed ${parsed} episodes, skipped ${skipped}`);
    console.log(`✅ Generated ${allChunks.length} chunks`);

    // Write chunks to compact JSON (no pretty-printing — keeps file size manageable)
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const chunksPath = path.join(dataDir, 'chunks.json');
    console.log(`💾 Writing chunks to: ${chunksPath} ...`);
    fs.writeFileSync(chunksPath, JSON.stringify(allChunks));
    const fileSizeMB = (fs.statSync(chunksPath).size / (1024 * 1024)).toFixed(1);
    console.log(`💾 Done (${fileSizeMB} MB)`);

    // Summary
    const avg = (allChunks.length / parsed).toFixed(1);
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📈 INGESTION SUMMARY`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Episodes parsed:  ${parsed}`);
    console.log(`Episodes skipped: ${skipped}`);
    console.log(`Total chunks:     ${allChunks.length}`);
    console.log(`Avg chunks/ep:    ${avg}`);
    console.log(`Output file:      ${chunksPath} (${fileSizeMB} MB)`);
    console.log(`${'='.repeat(50)}`);
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    process.exit(1);
  }
}

main();
