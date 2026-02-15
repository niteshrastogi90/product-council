# Tasks: Lenny's Council

> **Source of truth for implementation order.**
> Solo developer · Transcripts ready · Supabase · Vercel from day 1

---

## Phase 0: Project Scaffolding & Infrastructure

_Goal: Deployable skeleton with all services connected._

- [ ] **0.1** Initialize Next.js 14 project with TypeScript, App Router, TailwindCSS
- [ ] **0.2** Install and configure shadcn/ui (button, input, card, dialog, skeleton, tabs, textarea, badge, separator)
- [ ] **0.3** Set up project folder structure per implementation.md (`app/`, `components/`, `lib/`, `scripts/`, `prompts/`, `types/`, `supabase/`)
- [ ] **0.4** Create Supabase project; configure connection string in `.env.local`
- [ ] **0.5** Write and run database migrations — create all 5 tables: `episodes`, `speakers`, `chunks`, `queries`, `query_cache` (schemas from implementation.md)
- [ ] **0.6** Enable `pgvector` extension in Supabase; verify `vector(1536)` column works
- [ ] **0.7** Set up OpenAI API key in `.env.local`; write a smoke-test script that generates one embedding and one completion
- [ ] **0.8** Deploy to Vercel; confirm the app loads at a public URL with env vars connected
- [ ] **0.9** Define core TypeScript types (`types/index.ts`) — Episode, Speaker, Chunk, QueryInput, RetrievalResult, Discussion

**Done when:** Hello-world app is live on Vercel, Supabase tables exist, OpenAI calls work.

---

## Phase 1: Data Pipeline — Transcripts → Chunks → Embeddings

_Goal: All transcripts processed, chunked, embedded, and stored in Supabase._

- [ ] **1.1** Audit transcript files — confirm format (TXT/JSON/SRT), count, and speaker attribution quality
- [ ] **1.2** Write transcript parser (`scripts/parse-transcripts.ts`) — normalize to a common JSON format: `{ episode metadata, turns: [{ speaker, text }] }`
- [ ] **1.3** Build chunking algorithm (`lib/chunking.ts`):
  - Split by speaker turn
  - Target 300–500 words per chunk
  - Preserve sentence boundaries
  - Generate `context_before` and `context_after` windows
- [ ] **1.4** Build speaker extraction & deduplication logic — produce `speakers` table entries with name, title, company, expertise_areas
- [ ] **1.5** Write episode metadata extractor — populate `episodes` table (episode number, title, guest, URLs, topics)
- [ ] **1.6** Build embedding generation script (`scripts/generate-embeddings.ts`):
  - Batch chunks (max 2048 per OpenAI call)
  - Use `text-embedding-3-small`
  - Handle rate limits with exponential backoff
  - Track cost
- [ ] **1.7** Build database insertion pipeline (`scripts/ingest.ts`) — orchestrate: parse → chunk → extract metadata → embed → insert
- [ ] **1.8** Process 10 transcripts end-to-end as smoke test; spot-check chunk quality manually
- [ ] **1.9** Process ALL remaining transcripts
- [ ] **1.10** Create `ivfflat` index on `chunks.embedding` column; verify vector search returns results
- [ ] **1.11** Write a data quality report: total episodes, speakers, chunks, average chunk size, embedding coverage

**Done when:** All transcripts are in Supabase with embeddings, and a raw SQL similarity query returns sensible results.

---

## Phase 2: Retrieval Engine

_Goal: Given a question, return the 2–4 most relevant speakers with their best chunks._

- [ ] **2.1** Create query embedding utility (`lib/retrieval/embed-query.ts`) — embed user question with `text-embedding-3-small`
- [ ] **2.2** Build vector search function (`lib/retrieval/search.ts`) — cosine similarity against `chunks` table, return top-K (K=20–30) with scores
- [ ] **2.3** Build speaker grouping logic (`lib/retrieval/group-speakers.ts`) — aggregate chunk scores per speaker, rank speakers
- [ ] **2.4** Implement diversity scoring — penalize selecting speakers with near-identical perspectives; favor complementary expertise areas
- [ ] **2.5** Implement relevance threshold — minimum similarity score to be included; handle "no relevant results" gracefully
- [ ] **2.6** Build the retrieval orchestrator (`lib/retrieval/index.ts`) — takes `QueryInput`, returns `RetrievalResult[]` (2–4 speakers, top 5–10 chunks each, with episode context)
- [ ] **2.7** Create API route `POST /api/retrieve` — validate input with Zod, call orchestrator, return results
- [ ] **2.8** Write 20 test queries covering different topics (strategy, growth, hiring, design, B2B, B2C); evaluate retrieval quality manually
- [ ] **2.9** Tune parameters: top-K, similarity threshold, speaker count, diversity weight

**Done when:** `/api/retrieve` returns relevant, diverse speakers for 80%+ of test queries in <500ms.

---

## Phase 3: Discussion Generation

_Goal: Take retrieval results and produce a structured multi-perspective discussion._

- [ ] **3.1** Write the core discussion prompt template (`prompts/discussion.md`):
  - System prompt: role, tone, output format
  - Speaker persona construction from chunks
  - Required sections: initial positions, key tensions, points of consensus, synthesis/framework, action items
  - JSON output schema
- [ ] **3.2** Build speaker persona constructor (`lib/discussion/build-persona.ts`) — assemble speaker context from top chunks + episode metadata
- [ ] **3.3** Build discussion generator (`lib/discussion/generate.ts`):
  - Single-pass GPT-4o call
  - Include query + speaker personas + retrieved chunks in prompt
  - Parse and validate JSON output with Zod
  - Track token usage and cost
- [ ] **3.4** Add retry logic — 1 automatic retry with adjusted prompt if JSON is malformed
- [ ] **3.5** Add fallback — if structured output fails twice, return a simplified text response
- [ ] **3.6** Create API route `POST /api/discuss` — takes query + retrieval results, returns Discussion object
- [ ] **3.7** Test with 20 diverse queries; rate each discussion for: authenticity, relevance, tension quality, actionability
- [ ] **3.8** Iterate on prompt based on test results (expect 2–3 prompt revision cycles)
- [ ] **3.9** Add streaming support — use OpenAI streaming API; emit partial JSON sections as they complete

**Done when:** Discussions feel authentic, are grounded in source material, surface real tensions, and generate in <10s. Valid JSON 95%+ of the time.

---

## Phase 4: Core UI

_Goal: Polished, responsive web interface for the full query → discussion flow._

- [ ] **4.1** Build landing page (`app/page.tsx`):
  - Hero section with value prop
  - Query textarea with character count
  - "Add context" expandable section (company stage, product type, team size)
  - Example question chips (clickable to fill input)
  - "Convene Council" submit button
  - "How it works" section
  - Footer with attribution
- [ ] **4.2** Build loading/progress state:
  - Query echo at top
  - Animated progress indicator with step labels (Finding experts → Building discussion → Formatting)
  - Time estimate ("Usually takes 10–15 seconds")
  - Cancel button
- [ ] **4.3** Build speaker cards component (`components/SpeakerCard.tsx`):
  - Avatar (initials fallback), name, title/company
  - Episode reference with link
  - Color-coded border (blue, emerald, amber, rose per speaker index)
- [ ] **4.4** Build discussion display (`components/Discussion.tsx`):
  - Section: Initial Perspectives — speaker-attributed positions with reasoning
  - Section: Where They Disagree — tension cards with contrasting viewpoints
  - Section: Framework for Your Decision — synthesis with action items
  - Section: Sources — episode cards with listen/transcript links
- [ ] **4.5** Implement streaming display — sections appear progressively as they stream in
- [ ] **4.6** Build feedback component (`components/Feedback.tsx`):
  - 5-star rating
  - Conditional follow-up (positive → optional text; negative → issue checkboxes + text)
  - Auto-save on star click
- [ ] **4.7** Create feedback API route `POST /api/feedback` — store rating + text in `queries` table
- [ ] **4.8** Wire everything together — full flow: input → loading → streaming discussion → feedback
- [ ] **4.9** Build error states: no results found, generation failed, network timeout (per app-flow.md)
- [ ] **4.10** Mobile responsive pass — stacked speaker cards, collapsible sections, larger touch targets, bottom CTA
- [ ] **4.11** Accessibility pass — keyboard nav, focus management, ARIA labels, screen reader announcements, color contrast check
- [ ] **4.12** Deploy to Vercel; test on Chrome, Safari, Firefox, iOS Safari, Android Chrome

**Done when:** Full query-to-discussion flow works end-to-end on desktop and mobile, with streaming, error handling, and feedback collection.

---

## Phase 5: Caching & Cost Optimization

_Goal: Reduce per-query cost and improve response time for repeat/similar queries._

- [ ] **5.1** Build query normalizer (`lib/cache/normalize.ts`) — lowercase, strip filler words, generate hash
- [ ] **5.2** Implement cache lookup in the query flow — check `query_cache` table before retrieval/generation
- [ ] **5.3** Store successful results in cache after generation
- [ ] **5.4** Add cache hit tracking (increment `hit_count`, update `last_accessed`)
- [ ] **5.5** (Optional) Implement semantic cache matching — if a new query embedding is >0.95 similar to a cached query embedding, return cached result
- [ ] **5.6** Add cache expiration — purge entries older than 30 days or with 0 hits
- [ ] **5.7** Add rate limiting to public API routes — 100 queries/hour per IP
- [ ] **5.8** Measure: cache hit rate, avg cost per query, P50/P95 response times

**Done when:** Cache hit rate >30% on repeated test queries. Cost per query drops measurably. Rate limiting active.

---

## Phase 6: Analytics, Admin & Polish

_Goal: Visibility into usage; final quality pass before beta._

- [ ] **6.1** Build admin dashboard page (`app/admin/page.tsx`):
  - Total queries, queries today, avg rating
  - Top queries list
  - Speaker selection frequency
  - Cost tracking (tokens, dollars)
  - Recent low-rated queries for review
- [ ] **6.2** Add query logging — every query writes to `queries` table with timing, token, and cost metadata
- [ ] **6.3** Add simple auth gate on `/admin` (environment variable password or Supabase auth)
- [ ] **6.4** Speaker detail modal (`components/SpeakerDetail.tsx`) — bio, expertise tags, episode list; triggered by clicking speaker card
- [ ] **6.5** "Ask another question" CTA at bottom of discussion page
- [ ] **6.6** SEO basics — meta tags, OG image, page title, description
- [ ] **6.7** Final design polish pass — spacing, typography, colors, animations per design.md
- [ ] **6.8** Bug bash — test all flows, edge cases, error states; fix issues
- [ ] **6.9** Write a brief user guide / FAQ section (can be in-app or a notion doc)
- [ ] **6.10** Performance audit — Lighthouse score, bundle size, API response times

**Done when:** Admin dashboard works. All flows polished. No critical bugs. Ready for real users.

---

## Phase 7: Beta Launch

_Goal: Get the product in front of 20 real users and learn._

- [ ] **7.1** Recruit 20 beta users (PMs, founders from your network, communities)
- [ ] **7.2** Write and send onboarding message — what it is, how to use it, how to give feedback
- [ ] **7.3** Monitor usage daily — check admin dashboard, error logs, Vercel analytics
- [ ] **7.4** Collect feedback — in-app ratings + 3–5 short user interviews
- [ ] **7.5** Identify top 3 issues from feedback; fix or iterate
- [ ] **7.6** Analyze query patterns — what are people asking? where does retrieval fail?
- [ ] **7.7** Measure success metrics:
  - Avg rating (target: 4.0+)
  - % who say "better than alternatives" (target: 60%+)
  - % who return in week 2 (target: 40%+)
- [ ] **7.8** Write a post-beta retrospective: what worked, what didn't, what to build next

**Done when:** You have real usage data, real feedback, and a clear picture of what to improve.

---

## Dependencies & Blockers

| Task | Depends On |
|------|-----------|
| Phase 1 (pipeline) | Phase 0 complete + transcripts accessible |
| Phase 2 (retrieval) | Phase 1 complete (chunks with embeddings in DB) |
| Phase 3 (generation) | Phase 2 complete (retrieval returns results) |
| Phase 4 (UI) | Phase 2 at minimum; Phase 3 for full flow |
| Phase 5 (caching) | Phase 3 + 4 complete (need working end-to-end flow) |
| Phase 6 (polish) | Phase 4 complete |
| Phase 7 (beta) | Phase 6 complete |

> **Parallelism note:** Phase 4 (UI) can start as soon as Phase 2 is working — stub the discussion generation with mock data while you build the frontend, then wire in the real generation when Phase 3 is done.

---

## Estimated Timeline (Solo Developer)

| Phase | Estimated Duration | Calendar Target |
|-------|-------------------|----------------|
| Phase 0: Scaffolding | 2–3 days | Week 1 |
| Phase 1: Data Pipeline | 4–5 days | Week 1–2 |
| Phase 2: Retrieval | 3–4 days | Week 2–3 |
| Phase 3: Discussion Generation | 4–6 days | Week 3–4 |
| Phase 4: Core UI | 5–7 days | Week 4–5 |
| Phase 5: Caching | 2–3 days | Week 6 |
| Phase 6: Polish & Admin | 3–4 days | Week 6–7 |
| Phase 7: Beta Launch | Ongoing | Week 7–8 |

**Total: ~6–8 weeks** depending on prompt iteration cycles (Phase 3) and UI polish ambition (Phase 4).

---

*Last Updated: February 14, 2026*
