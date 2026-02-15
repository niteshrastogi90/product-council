# Product Council

AI-powered PM advice from the best product minds. Ask a question, watch a council of podcast guests debate it, and get actionable synthesis — powered by 303 episodes of Lenny's Podcast.

## Quick Start

### 1. Install dependencies

```bash
cd product-council
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

- **OPENAI_API_KEY** (required) — Get from [platform.openai.com](https://platform.openai.com/api-keys)
- **RESEND_API_KEY** (optional) — For magic link emails. Get from [resend.com](https://resend.com). Without this, magic links will be logged to console.
- **UPSTASH_REDIS_REST_URL / TOKEN** (optional) — For session persistence. Get from [upstash.com](https://upstash.com). Without this, an in-memory mock is used.
- **NEXTAUTH_SECRET** — Generate with `openssl rand -base64 32`

### 3. Set up transcript data

Make sure the transcript archive is accessible. The default path expects:

```
product-council/
└── ../lennys-podcast-transcripts-main/lennys-podcast-transcripts-main/
    ├── episodes/
    └── index/
```

Or set `TRANSCRIPT_PATH` in `.env.local` to point to your transcript directory.

### 4. Build metadata and chunks

```bash
# Extract episode metadata and topic index
npm run build-metadata

# Parse and chunk all 303 transcripts
npm run ingest
```

This creates `data/episodes.json`, `data/topics.json`, and `data/chunks.json`.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy

Make sure `data/chunks.json`, `data/episodes.json`, and `data/topics.json` are committed (or generate them in the build step).

## Architecture

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Auth**: NextAuth.js with magic link email (Resend)
- **AI**: OpenAI GPT-4.1 (orchestrator) + GPT-4.1-mini (agents)
- **Retrieval**: Topic-based keyword matching + in-memory text/vector search
- **Streaming**: Server-Sent Events for real-time debate display
- **Storage**: Upstash Redis for sessions (with in-memory fallback)

## How It Works

1. User asks a PM question
2. System matches the query to relevant topics and episodes
3. Selects 3-5 diverse podcast guests as council members
4. Lenny introduces the discussion
5. Each agent shares their perspective (grounded in actual transcript content)
6. Lenny probes with a follow-up question
7. Agents respond to each other
8. Lenny synthesizes: key insights, tensions, and action items
9. Sources link back to original YouTube episodes

## Token Budget

~1,800 tokens per query. With 250K tokens/day on premium models, supports ~130 queries/day.
