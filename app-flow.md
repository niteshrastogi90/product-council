# App Flow: Lenny's Council

## User Journey Map

### Primary Journey: Ask Question → Get Council Discussion

```
Landing Page
     ↓
Query Input
     ↓
Retrieval (Background)
     ↓
Speaker Selection (Streamed)
     ↓
Discussion Generation (Streamed)
     ↓
Discussion Display
     ↓
Feedback Collection
     ↓
[Optional] Episode Deep Dive
```

---

## Screen-by-Screen Flows

### 1. Landing Page / Home

**Purpose:** First impression, explain value, capture query

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  Header: Lenny's Council              [About] [Login] │
├────────────────────────────────────────────────────────┤
│                                                        │
│              Lenny's Council                           │
│      Get expert product perspectives in 30s           │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Ask your product question...                    │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                        [Ask Council] │
│                                                        │
│  ⚙️  Optional: Add context                           │
│                                                        │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  Example questions:                                    │
│  • Should we pivot our product?                       │
│  • How do we prioritize features?                     │
│  • When is the right time to hire PMs?                │
│                                                        │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  How it works:                                         │
│  1. Ask a product question                            │
│  2. We find the most relevant expert perspectives     │
│  3. See how different experts approach your problem   │
│  4. Get actionable synthesis + source episodes        │
└────────────────────────────────────────────────────────┘
```

**Components:**
- Hero section with value prop
- Query input (primary CTA)
- Example questions (inspiration + SEO)
- How it works (build trust)
- Footer with attribution to Lenny

**User Actions:**
- ✏️ Type question
- ⚙️ Expand context (optional)
- 🚀 Submit query
- 📖 Click example question
- ℹ️ Learn more about the product

**State:**
- Empty state (no query)
- Typing state (CTA enabled)
- Loading state (after submit)

**Edge Cases:**
- Query too short (<10 chars): Prompt for more detail
- Query too long (>500 chars): Show character count
- Empty submit: Shake input, show error
- Network error: Show retry option

---

### 2. Loading / Retrieval State

**Purpose:** Show progress, manage expectations, keep user engaged

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  [←] Lenny's Council                                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Your question:                                        │
│  "Should we pivot our product strategy?"              │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  🔍 Finding relevant experts...                  │ │
│  │  ████████░░░░░░░░░░░░ 35%                       │ │
│  │                                                  │ │
│  │  Searching 127 podcast episodes...              │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  This usually takes 10-15 seconds                     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Progressive States:**
```
State 1 (0-2s):   🔍 Finding relevant experts...
State 2 (2-5s):   ✓ Experts found
                  💬 Building discussion...
State 3 (5-10s):  ✓ Discussion ready
                  📝 Formatting response...
State 4 (10s+):   ✓ Complete
```

**Components:**
- Query echo (so user knows what's being processed)
- Progress bar (visual feedback)
- Status text (current step)
- Time estimate (set expectations)
- Back button (allow cancellation)

**User Actions:**
- ← Cancel/go back
- Wait patiently

**State Management:**
```typescript
enum LoadingState {
  RETRIEVING = 'retrieving',
  GENERATING = 'generating',
  FORMATTING = 'formatting',
  COMPLETE = 'complete'
}
```

**Edge Cases:**
- Takes longer than 30s: Show "still working" message
- Network timeout: Show retry option
- Server error: Show friendly error message
- User cancels: Return to query input with pre-filled text

---

### 3. Discussion Display (Main Result Screen)

**Purpose:** Present expert discussion, enable exploration

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  [←] Lenny's Council                                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Your question:                                        │
│  "Should we pivot our product strategy?"              │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  👥 Council Members                              │ │
│  │                                                  │ │
│  │  ┌─ Julie Zhuo ─────────────┐  ┌─ Shreyas ──┐  │ │
│  │  │ Former VP, Facebook      │  │ ex-Stripe  │  │ │
│  │  │ Episode #142             │  │ Ep #87     │  │ │
│  │  └──────────────────────────┘  └────────────┘  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  💬 Initial Perspectives                         │ │
│  │                                                  │ │
│  │  Julie Zhuo:                                     │ │
│  │  "I'd start by validating the pivot thesis      │ │
│  │   with deep user research..."                    │ │
│  │                                                  │ │
│  │  Shreyas Doshani:                                │ │
│  │  "Before pivoting, examine if the problem is    │ │
│  │   product-market fit or go-to-market..."        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  ⚡ Where They Disagree                          │ │
│  │  Research first vs. Ship fast?                   │ │
│  │  [Details expanded...]                           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  🎯 Framework for Your Decision                  │ │
│  │  [Synthesis with action items...]                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Was this helpful? ⭐⭐⭐⭐⭐                        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  📚 Sources                                       │ │
│  │  • Episode #142 [Listen] [Transcript]            │ │
│  │  • Episode #87 [Listen] [Transcript]             │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [Ask Another Question]                               │
└────────────────────────────────────────────────────────┘
```

**Streaming Behavior:**
```
1. Speaker cards appear (fade in)
2. "Initial Perspectives" section streams in
3. "Where They Disagree" streams in
4. "Framework" streams in
5. Feedback prompt appears
6. Sources appear last
```

**Components:**
- Query echo (top of page)
- Speaker cards (compact, clickable)
- Discussion sections (progressive disclosure)
- Feedback component (rating + optional text)
- Sources (clickable episode links)
- New query CTA (bottom)

**User Actions:**
- 📖 Read discussion sections
- 👤 Click speaker card → see more details
- 🎧 Click episode link → open in new tab
- ⭐ Rate discussion
- 💬 Leave feedback
- 🔄 Ask another question
- 📤 Share discussion (future)

**Interaction States:**
- Reading mode (default)
- Feedback mode (after rating)
- Expanded speaker details (modal/drawer)

**Edge Cases:**
- Very long discussion: Add "Read more" expansion
- No disagreements: Hide "Tensions" section
- Only 1 speaker found: Adapt UI, note limitation
- User rates poorly: Show feedback form

---

### 4. Speaker Detail Modal

**Purpose:** Provide more context on selected expert

**Trigger:** User clicks on speaker card

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│                        [✕]                             │
│                                                        │
│  👤  Julie Zhuo                                        │
│  Former VP Product Design, Facebook                   │
│                                                        │
│  Background:                                           │
│  Julie led product design for Facebook from 2008-2019,│
│  helping grow the platform to 2B+ users. Now VP of    │
│  Product Design at Sundial and author of "The Making  │
│  of a Manager."                                        │
│                                                        │
│  Expertise Areas:                                      │
│  • Product Design  • User Research  • Team Building   │
│  • Early Stage     • Consumer Products                │
│                                                        │
│  Episodes on Lenny's Podcast:                         │
│  • #142 - Building Products Users Love                │
│  • #89 - Design Principles for Product Teams          │
│                                                        │
│  [View All Episodes] [Close]                          │
└────────────────────────────────────────────────────────┘
```

**Components:**
- Speaker header (name, title, avatar)
- Background bio
- Expertise tags
- Episode list
- CTAs to explore more

**User Actions:**
- 🎧 Click episode → open in new tab
- 📚 View all episodes → filtered episode list
- ✕ Close modal

---

### 5. Context Expansion (Optional Input)

**Purpose:** Allow users to provide more specific context

**Trigger:** User clicks "⚙️ Add context" on query page

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  ⚙️  Add Context (optional)                            │
│                                                        │
│  This helps us find more relevant perspectives.       │
│                                                        │
│  Company Stage:                                        │
│  [ ] Pre-seed  [ ] Seed  [ ] Series A  [ ] Series B+  │
│                                                        │
│  Product Type:                                         │
│  [ ] B2B  [ ] B2C  [ ] Marketplace  [ ] Platform      │
│                                                        │
│  Team Size:                                            │
│  [ ] Solo  [ ] 2-10  [ ] 11-50  [ ] 50+               │
│                                                        │
│  [Clear] [Apply]                                       │
└────────────────────────────────────────────────────────┘
```

**Components:**
- Checkbox groups (multi-select)
- Clear button (reset all)
- Apply button (close and use context)

**User Actions:**
- Select relevant context
- Clear selections
- Apply and return to query

**State:**
- Context is passed to retrieval engine
- Visual indicator on query page shows context is active
- Can be edited after submission

---

### 6. Feedback State

**Purpose:** Collect user feedback to improve quality

**Trigger:** User clicks rating stars or feedback button

**States:**

**After Rating (Good - 4-5 stars):**
```
┌────────────────────────────────────────────────────────┐
│  Thanks for the feedback! 🎉                          │
│                                                        │
│  Want to share what was most helpful?                 │
│  ┌────────────────────────────────────────────────┐   │
│  │ (Optional feedback text)                       │   │
│  └────────────────────────────────────────────────┘   │
│                                [Submit] [Skip]        │
└────────────────────────────────────────────────────────┘
```

**After Rating (Poor - 1-2 stars):**
```
┌────────────────────────────────────────────────────────┐
│  Sorry this wasn't helpful. 😞                        │
│                                                        │
│  What went wrong?                                      │
│  [ ] Wrong speakers selected                          │
│  [ ] Discussion felt generic                          │
│  [ ] Sources not relevant                             │
│  [ ] Other (please specify)                           │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │ (Additional feedback)                          │   │
│  └────────────────────────────────────────────────┘   │
│                                [Submit]               │
└────────────────────────────────────────────────────────┘
```

**Components:**
- Thank you message (tone based on rating)
- Optional text input
- Checkboxes for common issues (low ratings)
- Submit button

**User Actions:**
- Write feedback
- Select issue checkboxes
- Submit or skip

---

### 7. Error States

**Error Type 1: No Results Found**
```
┌────────────────────────────────────────────────────────┐
│  🤔 No Relevant Experts Found                         │
│                                                        │
│  We couldn't find good matches for:                   │
│  "How do I optimize my TikTok algorithm?"            │
│                                                        │
│  This topic might be outside our current knowledge    │
│  base. Lenny's podcast focuses on:                    │
│  • Product strategy & roadmapping                     │
│  • User research & design                             │
│  • Growth & metrics                                   │
│  • Team building & management                         │
│                                                        │
│  Try asking about these areas instead.                │
│                                                        │
│  [Try Different Question] [Browse Topics]             │
└────────────────────────────────────────────────────────┘
```

**Error Type 2: Generation Failed**
```
┌────────────────────────────────────────────────────────┐
│  ⚠️  Something Went Wrong                             │
│                                                        │
│  We found relevant experts but couldn't generate      │
│  a discussion. This is usually temporary.             │
│                                                        │
│  Please try:                                           │
│  • Refreshing the page                                │
│  • Rephrasing your question                           │
│  • Asking a different question                        │
│                                                        │
│  If this keeps happening, please let us know.         │
│                                                        │
│  [Try Again] [Report Issue]                           │
└────────────────────────────────────────────────────────┘
```

**Error Type 3: Network Timeout**
```
┌────────────────────────────────────────────────────────┐
│  ⏰ Request Timed Out                                 │
│                                                        │
│  The request took longer than expected. This might    │
│  be due to network issues.                            │
│                                                        │
│  Your question: "Should we pivot?"                    │
│                                                        │
│  [Retry] [Go Back]                                    │
└────────────────────────────────────────────────────────┘
```

---

## State Transition Diagram

```
┌─────────────┐
│    IDLE     │ (Landing page)
└─────┬───────┘
      │ User enters query
      ↓
┌─────────────┐
│ SUBMITTING  │ (Validation)
└─────┬───────┘
      │ Query valid
      ↓
┌─────────────┐
│ RETRIEVING  │ (Vector search, speaker selection)
└─────┬───────┘
      │ Speakers found
      ↓
┌─────────────┐
│ GENERATING  │ (LLM discussion creation)
└─────┬───────┘
      │ Discussion complete
      ↓
┌─────────────┐
│ DISPLAYING  │ (Stream results)
└─────┬───────┘
      │ User rates
      ↓
┌─────────────┐
│ FEEDBACK    │ (Collect feedback)
└─────┬───────┘
      │ Submit or skip
      ↓
┌─────────────┐
│  COMPLETE   │ (Final state, allow new query)
└─────────────┘

Error Transitions:
SUBMITTING → ERROR (validation fails)
RETRIEVING → ERROR (no results)
GENERATING → ERROR (generation fails)
Any state → ERROR (network/server error)

ERROR → IDLE (user retries or goes back)
```

---

## Navigation Patterns

### Header Navigation (All Pages)
```
┌────────────────────────────────────────────────────────┐
│  [←] Lenny's Council        [About] [History] [⚙️]    │
└────────────────────────────────────────────────────────┘
```

**Components:**
- Logo/Brand (clickable, returns home)
- Back button (when not on home)
- About link (opens about modal/page)
- History (view past queries - future)
- Settings (preferences - future)

### Footer (Home Page Only)
```
┌────────────────────────────────────────────────────────┐
│  Built with wisdom from Lenny's Podcast               │
│  Powered by AI • Not affiliated with Lenny Rachitsky  │
│                                                        │
│  [Privacy] [Terms] [Contact] [GitHub]                 │
└────────────────────────────────────────────────────────┘
```

---

## Mobile-Specific Flows

### Mobile Query Input
```
┌──────────────────┐
│ Lenny's Council  │
├──────────────────┤
│                  │
│ Ask your         │
│ product          │
│ question:        │
│                  │
│ ┌──────────────┐ │
│ │ Should we    │ │
│ │ pivot?       │ │
│ │              │ │
│ └──────────────┘ │
│                  │
│ ⚙️ Context      │
│                  │
│ [Ask Council]──→ │
└──────────────────┘
```

**Mobile Adjustments:**
- Larger touch targets (48px minimum)
- Context as bottom sheet
- Stacked speaker cards
- Simplified typography

### Mobile Discussion View
```
┌──────────────────┐
│  ← Council       │
├──────────────────┤
│                  │
│ Your Q:          │
│ "Should we       │
│  pivot?"         │
│                  │
│ ┌──────────────┐ │
│ │ Julie Zhuo   │ │
│ │ Facebook     │ │
│ │ Ep #142      │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Shreyas      │ │
│ │ Stripe       │ │
│ │ Ep #87       │ │
│ └──────────────┘ │
│                  │
│ 💬 Perspectives  │
│ [Collapsed...]   │
│                  │
│ ⚡ Tensions      │
│ [Collapsed...]   │
│                  │
│ 🎯 Framework     │
│ [Collapsed...]   │
│                  │
│ ⭐⭐⭐⭐⭐         │
│                  │
│ 📚 Sources       │
│ [Collapsed...]   │
└──────────────────┘
```

**Mobile Optimizations:**
- Collapsible sections (expand on tap)
- Sticky section headers
- Bottom CTA (new question)
- Swipe gestures (future)

---

## Edge Cases & Error Handling

### Query Validation

**Too Short:**
```
Condition: query.length < 10
Action: Shake input, show tooltip "Please provide more detail"
```

**Too Long:**
```
Condition: query.length > 500
Action: Show character count in red, disable submit
```

**Inappropriate Content:**
```
Condition: Contains profanity, spam patterns
Action: Show error "Please rephrase your question professionally"
```

### Retrieval Edge Cases

**No Speakers Found:**
```
Display: Empty state with topic suggestions
Action: Allow browsing by category (future)
```

**Only 1 Speaker Found:**
```
Display: Single-speaker discussion (adapted UI)
Note: "We found 1 relevant expert. Here's their perspective..."
```

**Identical Speakers (duplicates):**
```
Condition: Same person appears in multiple episodes
Action: Consolidate, pull from best episode
```

### Generation Edge Cases

**Malformed JSON:**
```
Retry: 1 automatic retry with adjusted prompt
Fallback: Return raw text with apology
```

**Timeout:**
```
After 30s: Show "Still working..." message
After 60s: Cancel, show error, offer retry
```

**Rate Limit Hit:**
```
Display: "We're experiencing high demand. Please try again in a moment."
Action: Queue request or throttle
```

### Network Issues

**Slow Connection:**
```
Show: Progress indicator with retry option
After 15s: "This is taking longer than usual. Continue waiting or try again?"
```

**Offline:**
```
Detect: navigator.onLine
Display: "You're offline. Please check your connection."
Action: Disable submit, enable when online
```

**Server Error:**
```
5xx errors: "Our servers are having issues. We've been notified. Please try again."
4xx errors: Specific message based on error code
```

---

## Performance Considerations

### Loading Strategies

**Above the Fold:**
- Load immediately: Header, query input, examples
- Defer: Footer, about content, analytics

**Streaming Strategy:**
```
1. Send speaker cards immediately (after retrieval)
2. Stream discussion sections as generated
3. Buffer complete sentences before displaying
4. Show sources at end
```

**Optimistic Updates:**
```
- Cache similar queries locally
- Pre-populate likely follow-ups
- Prefetch episode metadata
```

### Perceived Performance

**Quick Wins:**
- Skeleton screens during load
- Instant visual feedback on actions
- Progress indicators with estimates
- Smooth transitions between states

**Async Loading:**
```
- Load speaker avatars lazily
- Defer non-critical images
- Load episode links on demand
```

---

## Analytics Events

### Track User Actions

```typescript
// Page views
trackPageView({ page: 'home' | 'discussion' | 'error' })

// Query events
trackQuerySubmit({ query, hasContext, contextValues })
trackQueryComplete({ 
  query, 
  speakersFound, 
  retrievalTime, 
  generationTime, 
  tokensUsed 
})

// Interaction events
trackSpeakerClick({ speakerId, speakerName })
trackEpisodeClick({ episodeId, position: 'card' | 'sources' })
trackSectionExpand({ section: 'positions' | 'tensions' | 'synthesis' })

// Feedback events
trackRating({ rating: 1-5, query })
trackFeedbackSubmit({ rating, feedbackText, selectedIssues })

// Error events
trackError({ 
  errorType: 'no_results' | 'generation_failed' | 'network',
  query,
  context
})
```

---

## Accessibility Navigation

### Keyboard Shortcuts

```
Tab:        Navigate between interactive elements
Enter:      Submit query / expand section
Escape:     Close modal / cancel operation
Arrow keys: Navigate within collapsed sections (future)
```

### Screen Reader Announcements

```
Query Submit:     "Searching for relevant experts"
Retrieval Done:   "Found 2 experts: Julie Zhuo, Shreyas Doshani"
Generation Start: "Generating discussion"
Generation Done:  "Discussion ready"
Error:           "Error: [error message]"
```

### Focus Management

```
On page load:      Focus query input
After submit:      Focus loading indicator
After completion:  Focus discussion heading
After error:       Focus error message
```

---

## Future Flow Extensions

### Conversation History (Phase 2)
- List of past queries
- Clickable to revisit
- Search/filter history
- Export discussions

### Follow-up Questions (Phase 2)
- "Ask a follow-up" button
- Context carried forward
- Conversation threading

### Share Discussion (Phase 2)
- Generate shareable link
- Social media previews
- Copy as markdown

### Guided Onboarding (Phase 3)
- First-time user tutorial
- Interactive tooltips
- Sample question prompts

---

*Document Version: 1.0*  
*Last Updated: February 14, 2026*  
*Owner: Product Team*
