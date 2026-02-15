# Implementation Guide: Lenny's Council

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  Next.js 14+ (App Router) + React + TailwindCSS + shadcn/ui │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      API Layer (Next.js)                     │
│    Route Handlers + Server Actions + Streaming Support      │
└───┬───────────────┬───────────────┬────────────────┬────────┘
    │               │               │                │
    │               │               │                │
┌───▼──────┐  ┌────▼─────┐  ┌──────▼──────┐  ┌─────▼────────┐
│  Query   │  │ Retrieval│  │   Agent     │  │   Cache      │
│ Service  │  │  Engine  │  │Orchestrator │  │   Layer      │
└───┬──────┘  └────┬─────┘  └──────┬──────┘  └─────┬────────┘
    │              │               │               │
┌───▼──────────────▼───────────────▼───────────────▼─────────┐
│                      Data Layer                             │
│  Supabase (Postgres + pgvector) OR SQLite + sqlite-vss     │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   External Services                          │
│             OpenAI API (Embeddings + Completions)           │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- **Framework**: Next.js 14+ (App Router for server components)
- **UI Library**: React 18+ with TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: React Context + Zustand (for complex state)
- **Streaming**: React Suspense + Server-Sent Events

**Backend:**
- **Runtime**: Node.js 20+ (Vercel Edge Runtime for API routes)
- **API Framework**: Next.js API Routes + Server Actions
- **Language**: TypeScript 5+
- **Validation**: Zod for schema validation

**Database:**
- **Option A (Recommended)**: Supabase (Postgres 15 + pgvector extension)
- **Option B (Local Dev)**: SQLite + sqlite-vss extension
- **Caching**: Upstash Redis (free tier) or in-memory for dev

**AI/ML:**
- **Embeddings**: OpenAI text-embedding-3-small
- **Generation**: OpenAI GPT-4o (discussions), GPT-4o-mini (query expansion, reranking)
- **Orchestration**: Custom async pipeline (no LangChain for simplicity)

**Infrastructure:**
- **Hosting**: Vercel (free tier for MVP)
- **Database**: Supabase (free tier: 500MB, 50k requests/month)
- **Monitoring**: Vercel Analytics + Custom logging
- **Version Control**: Git + GitHub

---

## Database Schema

### Core Tables

#### 1. Episodes Table
Stores metadata about each podcast episode.

```sql
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_number INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  guest_name TEXT NOT NULL,
  guest_title TEXT,
  guest_company TEXT,
  publish_date DATE,
  duration_minutes INTEGER,
  spotify_url TEXT,
  youtube_url TEXT,
  website_url TEXT,
  topics TEXT[], -- Array of topic tags
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_episodes_guest ON episodes(guest_name);
CREATE INDEX idx_episodes_topics ON episodes USING GIN(topics);
```

#### 2. Speakers Table
Denormalized speaker information for quick lookups.

```sql
CREATE TABLE speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  title TEXT,
  company TEXT,
  background TEXT, -- Brief bio
  expertise_areas TEXT[], -- ["product strategy", "B2B SaaS", "growth"]
  episode_count INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 0,
  avg_relevance_score FLOAT, -- Updated based on query feedback
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_speakers_name ON speakers(name);
CREATE INDEX idx_speakers_expertise ON speakers USING GIN(expertise_areas);
```

#### 3. Chunks Table
Stores transcript segments with embeddings.

```sql
CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  speaker_id UUID REFERENCES speakers(id),
  chunk_index INTEGER NOT NULL, -- Position in episode
  content TEXT NOT NULL,
  word_count INTEGER,
  
  -- Context windows for better retrieval
  context_before TEXT, -- Previous chunk content
  context_after TEXT,  -- Next chunk content
  
  -- Embedding vector (1536 dimensions for text-embedding-3-small)
  embedding vector(1536),
  
  -- Metadata
  timestamp_start INTEGER, -- Seconds from episode start
  timestamp_end INTEGER,
  frameworks_mentioned TEXT[], -- ["Jobs to be done", "North Star metric"]
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Composite unique constraint
  UNIQUE(episode_id, chunk_index)
);

-- Critical: Vector similarity search index
CREATE INDEX idx_chunks_embedding ON chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Other indexes
CREATE INDEX idx_chunks_episode ON chunks(episode_id);
CREATE INDEX idx_chunks_speaker ON chunks(speaker_id);
CREATE INDEX idx_chunks_frameworks ON chunks USING GIN(frameworks_mentioned);
```

#### 4. Queries Table
Stores user queries for analytics and caching.

```sql
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- Anonymous ID from cookies/fingerprint
  query_text TEXT NOT NULL,
  query_embedding vector(1536),
  
  -- Retrieved speakers
  selected_speakers JSONB, -- Array of {speaker_id, relevance_score, chunk_ids[]}
  
  -- Generated discussion
  discussion_json JSONB, -- Full structured discussion output
  
  -- Performance metrics
  retrieval_time_ms INTEGER,
  generation_time_ms INTEGER,
  total_tokens_used INTEGER,
  cost_cents FLOAT,
  
  -- User feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  was_helpful BOOLEAN,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_queries_user ON queries(user_id);
CREATE INDEX idx_queries_created ON queries(created_at DESC);
CREATE INDEX idx_queries_embedding ON queries 
USING ivfflat (query_embedding vector_cosine_ops)
WITH (lists = 50);
```

#### 5. Cache Table
Query result caching for cost optimization.

```sql
CREATE TABLE query_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL, -- Hash of normalized query
  query_text TEXT NOT NULL,
  response_json JSONB NOT NULL,
  hit_count INTEGER DEFAULT 1,
  last_accessed TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- Optional TTL
);

CREATE INDEX idx_cache_hash ON query_cache(query_hash);
CREATE INDEX idx_cache_expires ON query_cache(expires_at) 
WHERE expires_at IS NOT NULL;
```

---

## Data Models (TypeScript)

### Core Types

```typescript
// Episode
interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description?: string;
  guest: {
    name: string;
    title?: string;
    company?: string;
  };
  publishDate?: Date;
  durationMinutes?: number;
  urls: {
    spotify?: string;
    youtube?: string;
    website?: string;
  };
  topics: string[];
  createdAt: Date;
}

// Speaker
interface Speaker {
  id: string;
  name: string;
  title?: string;
  company?: string;
  background?: string;
  expertiseAreas: string[];
  episodeCount: number;
  totalChunks: number;
  avgRelevanceScore?: number;
}

// Chunk
interface Chunk {
  id: string;
  episodeId: string;
  speakerId: string;
  chunkIndex: number;
  content: string;
  wordCount: number;
  contextBefore?: string;
  contextAfter?: string;
  embedding: number[];
  timestampStart?: number;
  timestampEnd?: number;
  frameworksMentioned: string[];
}

// Query Input
interface QueryInput {
  text: string;
  context?: {
    companyStage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b+' | 'public';
    productType?: 'b2b' | 'b2c' | 'marketplace' | 'platform';
    teamSize?: 'solo' | 'small' | 'medium' | 'large';
  };
  maxSpeakers?: number; // Default 2, max 4
}

// Retrieval Result
interface RetrievalResult {
  speaker: Speaker;
  relevanceScore: number;
  topChunks: Array<{
    chunk: Chunk;
    episode: Episode;
    score: number;
  }>;
}

// Discussion Output
interface Discussion {
  query: string;
  participants: Array<{
    speaker: Speaker;
    episode: Episode;
    relevance: number;
  }>;
  discussion: {
    initialPositions: Array<{
      speaker: string;
      position: string;
      reasoning: string;
      examples: string[];
    }>;
    keyTensions: Array<{
      question: string;
      perspectives: Record<string, string>;
      whyItMatters: string;
    }>;
    pointsOfConsensus?: string[];
  };
  synthesis: {
    framework: string;
    actionItems: string[];
    whenToApply: string;
    tradeoffs: Array<{
      approach: string;
      prosConsWhen: string;
    }>;
  };
  sources: Array<{
    episodeId: string;
    episodeTitle: string;
    speaker: string;
    chunkIds: string[];
    url?: string;
  }>;
  metadata: {
    retrievalTimeMs: number;
    generationTimeMs: number;
    tokensUsed: number;
    costCents: number;
  };
}
```

---

## Core Features & Requirements

### Feature 1: Transcript Processing Pipeline

**Requirements:**
- Accept transcript files (TXT, JSON, or SRT format)
- Parse speaker attribution
- Chunk intelligently (by speaker turn, ~300-500 words, preserve semantic boundaries)
- Extract metadata (episode info, speaker details, topics)
- Generate embeddings for each chunk
- Store in database with context windows

**Acceptance Criteria:**
- Process 100 transcripts in <10 minutes
- 95%+ speaker attribution accuracy
- Chunks maintain semantic coherence
- Context windows included for all chunks
- Embeddings generated with <1% error rate

### Feature 2: Semantic Search & Retrieval

**Requirements:**
- Accept natural language query
- Generate query embedding
- Vector similarity search across chunks
- Group results by speaker
- Select 2-4 most relevant speakers based on:
  - Semantic similarity scores
  - Diversity of perspectives
  - Expertise relevance
- Return top 5-10 chunks per speaker with context

**Acceptance Criteria:**
- Query response time <500ms
- 80%+ retrieval precision (relevant speakers)
- Speaker diversity: avoid selecting too-similar perspectives
- Context windows included in results
- Graceful handling of no-result cases

### Feature 3: Multi-Agent Discussion Generation

**Requirements:**
- Take query + retrieved chunks
- Build speaker personas from chunks
- Generate structured discussion using single LLM call
- Include:
  - Initial positions from each speaker
  - Key disagreements/tensions
  - Synthesis with actionable framework
- Validate output structure
- Track token usage and costs

**Acceptance Criteria:**
- Generation time <8 seconds (P95)
- Valid JSON output 99%+ of time
- Discussions feel authentic (qualitative test)
- Clear attribution to source chunks
- Token usage <15k per query
- Cost <$0.05 per query

### Feature 4: User Interface

**Requirements:**
- Simple, clean chat-like interface
- Query input with optional context fields
- Streaming response display
- Show discussion sections progressively:
  1. Selected speakers
  2. Initial positions
  3. Key tensions
  4. Synthesis
- Display source episodes with links
- Allow rating (1-5 stars) and feedback
- Mobile responsive

**Acceptance Criteria:**
- <3 second time to first byte
- Smooth streaming experience
- Mobile works on iOS/Android
- Accessible (WCAG AA)
- Works in Chrome, Safari, Firefox

### Feature 5: Query Caching

**Requirements:**
- Hash normalized queries
- Check cache before retrieval/generation
- Return cached results for similar queries
- Update hit counts
- Implement cache expiration (optional)
- Cache warm/cold analytics

**Acceptance Criteria:**
- Cache hit rate >30% after 100 queries
- <50ms cache lookup time
- Proper cache invalidation on data updates
- Memory-efficient storage

### Feature 6: Analytics & Feedback

**Requirements:**
- Track all queries with metadata
- Capture user ratings and feedback
- Monitor retrieval quality (speaker relevance)
- Track performance metrics (latency, cost)
- Admin dashboard for insights

**Acceptance Criteria:**
- 100% query tracking
- Real-time metrics available
- Export capability for analysis
- Privacy-preserving (anonymous user IDs)

---

## Phased Implementation Plan

### Phase 0: Setup & Infrastructure (Week 1)

**Goal: Get development environment ready**

**Tasks:**
1. ✅ Create project repository
2. ⬜ Set up Next.js 14 project with TypeScript
3. ⬜ Configure TailwindCSS + shadcn/ui
4. ⬜ Set up Supabase project (or local SQLite for dev)
5. ⬜ Create database schema and migrations
6. ⬜ Set up environment variables and secrets
7. ⬜ Configure OpenAI API access
8. ⬜ Create basic project structure

**Deliverables:**
- Working Next.js app (Hello World)
- Database connected and tables created
- OpenAI API tested
- Git workflow established

**Validation:**
- Can query database from API route
- Can call OpenAI embedding API
- Can deploy to Vercel

---

### Phase 1: Data Pipeline (Week 2)

**Goal: Process transcripts into searchable chunks**

**Tasks:**
1. ⬜ Create transcript parser (support TXT, JSON)
2. ⬜ Implement intelligent chunking algorithm
   - Split by speaker turns
   - Target 300-500 words per chunk
   - Preserve sentence boundaries
3. ⬜ Build speaker extraction logic
4. ⬜ Create embedding generation batch script
5. ⬜ Build database insertion pipeline
6. ⬜ Add context window extraction
7. ⬜ Process 10 sample transcripts end-to-end
8. ⬜ Build evaluation harness for chunking quality

**Deliverables:**
- `/scripts/process-transcripts.ts` script
- 10 processed transcripts in database
- Data quality report

**Validation:**
- 10 episodes processed successfully
- Chunks average 350-450 words
- Context windows present for all chunks
- Embeddings generated correctly
- Can query by vector similarity

---

### Phase 2: Retrieval Engine (Week 2-3)

**Goal: Build high-quality semantic search**

**Tasks:**
1. ⬜ Create query embedding endpoint
2. ⬜ Implement vector similarity search
3. ⬜ Build speaker grouping algorithm
4. ⬜ Add diversity scoring (avoid too-similar speakers)
5. ⬜ Implement reranking with GPT-4o-mini
6. ⬜ Add relevance thresholding
7. ⬜ Create retrieval API endpoint
8. ⬜ Build test suite with example queries
9. ⬜ Tune parameters (top-k, similarity threshold, etc.)

**Deliverables:**
- `POST /api/retrieve` endpoint
- Test suite with 20 example queries
- Retrieval quality metrics

**Validation:**
- Test queries return relevant speakers 80%+ of time
- Retrieval time <500ms
- Speaker diversity works (no duplicates, varied perspectives)
- Context windows included

**API Contract:**
```typescript
POST /api/retrieve
{
  "query": "Should we pivot our product?",
  "maxSpeakers": 2
}

Response:
{
  "speakers": [
    {
      "speaker": {...},
      "relevanceScore": 0.87,
      "topChunks": [...]
    }
  ],
  "retrievalTimeMs": 234
}
```

---

### Phase 3: Discussion Generation (Week 3-4)

**Goal: Create compelling multi-perspective discussions**

**Tasks:**
1. ⬜ Design core prompt template
2. ⬜ Build speaker persona construction
3. ⬜ Implement single-pass discussion generation
4. ⬜ Add JSON schema validation
5. ⬜ Create fallback handling for malformed outputs
6. ⬜ Add streaming support (optional for v1)
7. ⬜ Build discussion API endpoint
8. ⬜ Test with 20 diverse queries
9. ⬜ Iterate on prompt based on quality

**Deliverables:**
- `POST /api/discuss` endpoint
- Prompt template in `/prompts/discussion.md`
- Test results showing discussion quality

**Validation:**
- Discussions feel authentic (qualitative)
- 95%+ valid JSON output
- Generation time <10 seconds
- Token usage <15k per query
- Includes proper source attribution

**API Contract:**
```typescript
POST /api/discuss
{
  "query": "Should we pivot?",
  "retrievalResults": [...]
}

Response:
{
  "discussion": {...},
  "metadata": {
    "generationTimeMs": 4532,
    "tokensUsed": 12483,
    "costCents": 3.2
  }
}
```

---

### Phase 4: User Interface (Week 4-5)

**Goal: Create polished, usable web interface**

**Tasks:**
1. ⬜ Design wireframes for main screens
2. ⬜ Build chat interface component
3. ⬜ Create query input form
4. ⬜ Implement discussion display components
   - Speaker cards
   - Position sections
   - Tension highlights
   - Synthesis panel
   - Source episode links
5. ⬜ Add streaming response handling
6. ⬜ Build loading states
7. ⬜ Create rating/feedback component
8. ⬜ Add mobile responsive styles
9. ⬜ Test on multiple devices

**Deliverables:**
- `/app/page.tsx` - Main query interface
- `/components/Discussion.tsx` - Display component
- `/components/QueryForm.tsx` - Input component
- Mobile-responsive design

**Validation:**
- Works on desktop (Chrome, Safari, Firefox)
- Works on mobile (iOS Safari, Android Chrome)
- Streaming works smoothly
- Loading states clear
- Accessible (keyboard navigation, screen readers)

---

### Phase 5: Caching & Optimization (Week 5-6)

**Goal: Reduce costs and improve performance**

**Tasks:**
1. ⬜ Implement query normalization
2. ⬜ Build cache lookup logic
3. ⬜ Add cache hit tracking
4. ⬜ Create cache warming script
5. ⬜ Implement cache expiration
6. ⬜ Add query similarity matching
7. ⬜ Build cache analytics
8. ⬜ Optimize database queries
9. ⬜ Add request rate limiting

**Deliverables:**
- Cache system integrated into API
- Cache hit rate dashboard
- Performance improvements report

**Validation:**
- Cache hit rate >30% after 100 queries
- Cache lookup <50ms
- Query deduplication works
- Cost per query reduced by 40%+

---

### Phase 6: Analytics & Polish (Week 6-7)

**Goal: Prepare for beta launch**

**Tasks:**
1. ⬜ Build analytics dashboard
2. ⬜ Add query tracking
3. ⬜ Implement feedback collection
4. ⬜ Create admin interface
5. ⬜ Add error monitoring
6. ⬜ Write user documentation
7. ⬜ Create demo video
8. ⬜ Set up beta user onboarding
9. ⬜ Fix bugs from testing
10. ⬜ Performance optimization pass

**Deliverables:**
- `/admin` dashboard
- User guide
- Demo video
- Beta testing plan
- Bug fixes and polish

**Validation:**
- All core flows work end-to-end
- Error rate <1%
- Response time <30s (P95)
- Cost <$0.10 per query
- Ready for 20 beta users

---

### Phase 7: Beta Launch (Week 7-8)

**Goal: Get feedback from real users**

**Tasks:**
1. ⬜ Recruit 20 beta users (PMs, founders)
2. ⬜ Send onboarding emails
3. ⬜ Monitor usage and errors
4. ⬜ Collect feedback (interviews + ratings)
5. ⬜ Iterate on UX issues
6. ⬜ Fix critical bugs
7. ⬜ Analyze query patterns
8. ⬜ Measure success metrics
9. ⬜ Create improvement roadmap

**Deliverables:**
- 20 active beta users
- Feedback report
- Usage analytics
- Iteration plan

**Success Criteria:**
- 60%+ say it's better than alternatives
- 50%+ would use weekly
- 4.0+ average rating
- Week 1 → Week 2 retention: 40%+

---

## Development Guidelines

### Code Organization

```
lenny-council/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main query interface
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
│       ├── retrieve/
│       ├── discuss/
│       └── feedback/
├── components/            # React components
│   ├── ui/               # shadcn components
│   ├── QueryForm.tsx
│   ├── Discussion.tsx
│   └── SpeakerCard.tsx
├── lib/                   # Core logic
│   ├── db/               # Database utilities
│   ├── openai/           # OpenAI integration
│   ├── retrieval/        # Search logic
│   ├── discussion/       # Agent orchestration
│   └── cache/            # Caching layer
├── scripts/              # Data processing
│   ├── process-transcripts.ts
│   ├── generate-embeddings.ts
│   └── evaluate-quality.ts
├── prompts/              # LLM prompts
│   └── discussion.md
├── types/                # TypeScript types
├── supabase/             # Database migrations
│   └── migrations/
└── tests/                # Test files
```

### Coding Standards

**TypeScript:**
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Proper error handling with typed errors
- Zod for runtime validation

**React:**
- Server Components by default
- Client Components only when needed (interactivity)
- Use `use client` directive explicitly
- Proper loading and error boundaries

**Database:**
- All queries use prepared statements
- Proper indexing on frequently queried columns
- Connection pooling enabled
- Migrations tracked in version control

**API:**
- RESTful conventions
- Consistent error responses
- Request validation with Zod
- Rate limiting on public endpoints

**Testing:**
- Unit tests for core logic
- Integration tests for API endpoints
- E2E tests for critical flows
- Test coverage >70%

### Performance Budgets

- **Time to First Byte**: <500ms
- **Full Discussion Generation**: <30s (P95)
- **Database Queries**: <100ms each
- **Cache Lookup**: <50ms
- **Total Page Load**: <3s

### Cost Budgets

- **Per Query**: <$0.10 (after caching)
- **Embeddings**: Generate once, cache forever
- **Infrastructure**: $0/month (free tiers)

---

## Deployment Strategy

### Environments

1. **Local Development**
   - SQLite + sqlite-vss OR Supabase local
   - OpenAI API (dev keys)
   - Hot reload enabled

2. **Staging**
   - Vercel preview deployment
   - Supabase staging project
   - OpenAI API (separate keys)
   - Test data only

3. **Production**
   - Vercel production
   - Supabase production project
   - OpenAI API (production keys)
   - Real user data

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test:
    - Install dependencies
    - Run TypeScript check
    - Run linting
    - Run unit tests
    - Run integration tests
  
  deploy-preview:
    if: github.event_name == 'pull_request'
    - Deploy to Vercel preview
    - Run E2E tests
  
  deploy-production:
    if: github.ref == 'refs/heads/main'
    - Deploy to Vercel production
    - Run smoke tests
    - Notify team
```

### Monitoring

- **Application**: Vercel Analytics
- **Errors**: Sentry (or similar)
- **Logs**: Vercel Logs
- **Database**: Supabase metrics
- **Custom Metrics**: Track in queries table

---

## Security Considerations

1. **API Keys**: Stored in environment variables, never committed
2. **Rate Limiting**: Prevent abuse, 100 queries/hour per IP
3. **Input Validation**: Sanitize all user inputs
4. **SQL Injection**: Use parameterized queries only
5. **XSS Protection**: Sanitize displayed content
6. **CORS**: Restrict to known origins in production
7. **User Privacy**: Anonymous IDs, no PII collection

---

## Future Technical Enhancements

1. **Advanced Caching**
   - Redis for distributed cache
   - Semantic similarity for cache hits (not just exact match)

2. **Improved Retrieval**
   - Hybrid search (vector + keyword)
   - Query expansion with GPT-4o-mini
   - Re-ranking with cross-encoders

3. **Better Discussions**
   - Multi-turn agent debates
   - Streaming partial results
   - User-guided speaker selection

4. **Scalability**
   - Background job queue for heavy processing
   - CDN caching for static assets
   - Database read replicas

5. **Observability**
   - OpenTelemetry tracing
   - Custom dashboards
   - A/B testing framework

---

*Document Version: 1.0*  
*Last Updated: February 14, 2026*  
*Owner: Engineering Team*
