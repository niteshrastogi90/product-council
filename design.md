# Design Guidelines: Lenny's Council

## Brand Identity

### Brand Essence

**Lenny's Council is intelligent, trustworthy, and empowering.**

We help product practitioners make better decisions by bringing together the collective wisdom of proven experts. Our brand should feel:

- **Intelligent**: Sophisticated, thoughtful, evidence-based
- **Trustworthy**: Credible, transparent, grounded in real expertise
- **Empowering**: Enabling, clarifying, confidence-building
- **Accessible**: Clear, approachable, not intimidating

**Not:**
- Generic AI chatbot
- Academic research tool
- Entertainment/casual content discovery
- Sales/marketing platform

---

## Visual Identity

### Color Palette

**Primary Colors:**
```
Council Blue (Primary)
- HEX: #2563EB
- RGB: 37, 99, 235
- Use: Primary actions, key UI elements, speaker accents

Deep Slate (Text)
- HEX: #0F172A
- RGB: 15, 23, 42
- Use: Body text, headings

Warm White (Background)
- HEX: #FAFAF9
- RGB: 250, 250, 249
- Use: Main background, cards
```

**Secondary Colors:**
```
Amber (Insight Highlight)
- HEX: #F59E0B
- RGB: 245, 158, 11
- Use: Key insights, tension markers

Emerald (Consensus)
- HEX: #10B981
- RGB: 16, 185, 129
- Use: Points of agreement, positive indicators

Rose (Disagreement)
- HEX: #F43F5E
- RGB: 244, 63, 94
- Use: Tensions, contrasting viewpoints
```

**Neutral Grays:**
```
Slate 100: #F1F5F9 (Light backgrounds)
Slate 200: #E2E8F0 (Borders, dividers)
Slate 400: #94A3B8 (Secondary text)
Slate 600: #475569 (Labels, metadata)
Slate 800: #1E293B (Dark mode primary)
```

### Typography

**Font Stack:**
```css
/* Primary: Inter (Headings & UI) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Secondary: System fonts (Body text) */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Monospace: Code & technical content */
font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Type Scale:**
```
Display (Hero): 48px / 3rem, font-weight: 700, line-height: 1.1
H1 (Page Title): 36px / 2.25rem, font-weight: 700, line-height: 1.2
H2 (Section): 24px / 1.5rem, font-weight: 600, line-height: 1.3
H3 (Subsection): 20px / 1.25rem, font-weight: 600, line-height: 1.4
Body Large: 18px / 1.125rem, font-weight: 400, line-height: 1.6
Body: 16px / 1rem, font-weight: 400, line-height: 1.6
Body Small: 14px / 0.875rem, font-weight: 400, line-height: 1.5
Caption: 12px / 0.75rem, font-weight: 500, line-height: 1.4
```

### Spacing System

**Base Unit: 4px**

```
Space 1:  4px   (0.25rem)
Space 2:  8px   (0.5rem)
Space 3:  12px  (0.75rem)
Space 4:  16px  (1rem)    ← Most common
Space 6:  24px  (1.5rem)  ← Section spacing
Space 8:  32px  (2rem)
Space 12: 48px  (3rem)
Space 16: 64px  (4rem)
Space 24: 96px  (6rem)
```

### Border Radius

```
Small:  4px  (0.25rem) - Buttons, badges
Medium: 8px  (0.5rem)  - Cards, inputs
Large:  12px (0.75rem) - Modals, major containers
XL:     16px (1rem)    - Hero sections
Full:   9999px         - Pills, circular avatars
```

### Shadows

```css
/* Subtle: Cards, hover states */
box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

/* Medium: Dropdowns, popovers */
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Large: Modals, important overlays */
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Glow: Focus states */
box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
```

---

## Design Principles

### 1. Clarity Over Cleverness

**Do:**
- Use plain language for labels and instructions
- Show information hierarchy clearly
- Make CTAs obvious and unambiguous
- Display sources prominently

**Don't:**
- Use jargon or overly technical terms
- Bury important info in walls of text
- Make users hunt for next steps
- Hide attribution in footnotes

**Example:**
✅ "2 experts weighing in: Julie Zhuo, Shreyas Doshani"
❌ "Multi-agent synthesis initialized with n=2 personas"

---

### 2. Progressive Disclosure

**Do:**
- Show most important information first
- Allow users to dive deeper on demand
- Use collapsible sections for details
- Stream results as they become available

**Don't:**
- Overwhelm with everything at once
- Require scrolling to see key takeaways
- Make users wait for complete response before showing anything

**Example:**
✅ Show speaker cards → positions → tensions → full synthesis
❌ Generate everything, then dump it all at once

---

### 3. Transparent Intelligence

**Do:**
- Show which speakers were selected and why
- Link to original episode sources
- Indicate when it's AI synthesis vs direct quotes
- Expose reasoning process visually

**Don't:**
- Present AI output as expert's own words
- Hide the mechanics of how discussion was generated
- Make it feel like magic black box

**Example:**
✅ "Based on episode #142 where Julie discussed user research..."
❌ "Julie thinks you should..."

---

### 4. Respect User Time

**Do:**
- Show loading progress clearly
- Allow interrupting/canceling long operations
- Cache aggressively to avoid repeat work
- Provide TL;DR summaries

**Don't:**
- Use vague spinners with no indication of progress
- Force users to wait for unnecessary processing
- Repeat slow operations for similar queries

---

### 5. Celebrate Cognitive Diversity

**Do:**
- Visually distinguish different perspectives
- Highlight disagreements as valuable, not problematic
- Show spectrum of approaches, not single "correct" answer
- Use color/icons to differentiate speakers

**Don't:**
- Present all perspectives as identical
- Try to force consensus where disagreement exists
- Favor one perspective over others visually

---

## Component Patterns

### Query Input

**Desktop:**
```
┌─────────────────────────────────────────────────────┐
│  Ask the council a product question                │
│  ┌───────────────────────────────────────────────┐ │
│  │ Should we pivot our product strategy?        │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Optional context (expand):                        │
│  Stage: [Seed ▼]  Type: [B2B SaaS ▼]             │
│                                                     │
│                              [Convene Council] ──→ │
└─────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌───────────────────────┐
│ Ask a question        │
│ ┌───────────────────┐ │
│ │ Should we pivot? │ │
│ │                  │ │
│ └───────────────────┘ │
│                       │
│ ⚙️ Add context       │
│                       │
│    [Ask Council] ──→  │
└───────────────────────┘
```

**Specifications:**
- Textarea: min-height 80px, max-height 200px, auto-resize
- Placeholder: Specific examples of good questions
- Character limit: 500 chars (soft limit with warning)
- Submit: Enter key (with Shift+Enter for newlines)
- Context: Collapsed by default, expand inline

---

### Speaker Cards

```
┌─────────────────────────────────────────┐
│  👤 Julie Zhuo                         │
│  Former VP Product Design, Facebook    │
│                                         │
│  Relevance: ████████░░ 87%            │
│                                         │
│  From: Episode #142 - "Building       │
│        Products Users Love"            │
│                                         │
│  [🎧 Listen to episode]                │
└─────────────────────────────────────────┘
```

**Specifications:**
- Avatar: 48px circle (use initials if no photo)
- Name: H3 weight, Council Blue
- Title/Company: Body Small, Slate 600
- Relevance bar: Green gradient, show percentage
- Episode link: Subtle, opens in new tab
- Border: 2px solid, color-coded per speaker

**Color Coding:**
- Speaker 1: Council Blue (#2563EB)
- Speaker 2: Emerald (#10B981)
- Speaker 3: Amber (#F59E0B)
- Speaker 4: Rose (#F43F5E)

---

### Discussion Sections

**Initial Positions:**
```
┌─────────────────────────────────────────────────────┐
│  💬 Initial Perspectives                           │
│                                                     │
│  ┌─ Julie Zhuo ─────────────────────────────────┐ │
│  │  "I'd start by validating the pivot thesis    │ │
│  │   with deep user research..."                 │ │
│  │                                                │ │
│  │   → Her reasoning: Focus on evidence first    │ │
│  │   → Example: Facebook's News Feed pivot      │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ Shreyas Doshani ─────────────────────────────┐ │
│  │  "Before pivoting, I'd examine if the problem │ │
│  │   is product-market fit or go-to-market..."   │ │
│  │                                                │ │
│  │   → His reasoning: Diagnose root cause       │ │
│  │   → Example: Stripe's positioning shifts     │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Specifications:**
- Section header: H2, with emoji for quick scanning
- Speaker sections: Nested cards with speaker's border color
- Quote style: Slightly larger text, subtle background
- Reasoning/Examples: Indented, secondary text color
- Spacing: 24px between speakers, 32px between sections

---

**Key Tensions:**
```
┌─────────────────────────────────────────────────────┐
│  ⚡ Where They Disagree                            │
│                                                     │
│  Research first vs. Ship fast?                     │
│                                                     │
│  Julie:        Move slow to move fast later        │
│  ────────────  Understanding prevents waste        │
│                                                     │
│  Shreyas:      Ship to learn what research can't   │
│  ────────────  Market feedback > hypotheses        │
│                                                     │
│  💡 Why it matters:                                │
│  The choice depends on your certainty level        │
│  and cost of being wrong.                          │
└─────────────────────────────────────────────────────┘
```

**Specifications:**
- Tension title: Bold, posed as question
- Speaker positions: Side-by-side on desktop, stacked on mobile
- Divider: Subtle line between positions
- "Why it matters": Highlighted with 💡, amber background

---

**Synthesis:**
```
┌─────────────────────────────────────────────────────┐
│  🎯 Framework for Your Decision                    │
│                                                     │
│  Consider both perspectives based on:              │
│                                                     │
│  ✓ When to lean toward research (Julie's approach):│
│    • You're in a new market                        │
│    • Pivot cost is high                            │
│    • You have time to validate                     │
│                                                     │
│  ✓ When to lean toward shipping (Shreyas's way):   │
│    • You have a strong hypothesis                  │
│    • Fast iteration is possible                    │
│    • Market is moving quickly                      │
│                                                     │
│  ⚙️  Action Items:                                 │
│  1. Assess your pivot cost and reversibility       │
│  2. Define what would validate/invalidate         │
│  3. Set a decision timeline                        │
└─────────────────────────────────────────────────────┘
```

**Specifications:**
- Framework: Clear structure, scannable
- When to use: Checkbox bullets, emerald color
- Action items: Numbered, Council Blue
- Background: Warm white with subtle border

---

### Source Attribution

```
┌─────────────────────────────────────────────────────┐
│  📚 Sources & References                           │
│                                                     │
│  🎧 Episode #142: Building Products Users Love     │
│     Guest: Julie Zhuo                              │
│     [Listen on Spotify] [Read Transcript]          │
│                                                     │
│  🎧 Episode #87: Product Strategy That Works       │
│     Guest: Shreyas Doshani                         │
│     [Listen on Spotify] [Read Transcript]          │
└─────────────────────────────────────────────────────┘
```

**Specifications:**
- Always at bottom of discussion
- Each episode: Clickable card
- Links: Open in new tabs
- Icons: Consistent with episode format

---

### Loading States

**Initial Loading:**
```
┌─────────────────────────────────────┐
│  🔍 Finding relevant experts...     │
│  ████████░░░░░░░░░░░░ 35%          │
└─────────────────────────────────────┘
```

**Streaming Discussion:**
```
┌─────────────────────────────────────┐
│  💬 Convening the council...        │
│                                     │
│  ✓ Julie Zhuo selected              │
│  ✓ Shreyas Doshani selected         │
│  ⏳ Generating discussion...        │
└─────────────────────────────────────┘
```

**Specifications:**
- Progress bar: Animated, Council Blue
- Status text: Updates in real-time
- Checkmarks: Green, show completed steps
- Spinner: Subtle, only when necessary

---

### Feedback Component

```
┌─────────────────────────────────────────┐
│  Was this helpful?                      │
│                                         │
│  ⭐⭐⭐⭐⭐                                │
│                                         │
│  [💬 Add feedback (optional)]           │
└─────────────────────────────────────────┘
```

**Specifications:**
- Position: Bottom of discussion, before sources
- Stars: 24px, hover effect, Council Blue when selected
- Feedback box: Expands on click, 200 char max
- Submission: Auto-saves on star selection

---

## Responsive Design

### Breakpoints

```css
/* Mobile: 0-640px */
@media (max-width: 640px) {
  - Single column layout
  - Stacked speaker cards
  - Reduced spacing (16px → 12px)
  - Smaller type scale (-2px across the board)
}

/* Tablet: 641-1024px */
@media (min-width: 641px) and (max-width: 1024px) {
  - Max width: 720px
  - Side-by-side for 2 speakers
  - Standard spacing
}

/* Desktop: 1025px+ */
@media (min-width: 1025px) {
  - Max width: 960px, centered
  - Multi-column where helpful
  - Generous spacing
  - Hover states enabled
}
```

### Mobile Considerations

**Touch Targets:**
- Minimum 44x44px for all interactive elements
- 8px minimum between clickable items
- Larger form inputs (min-height: 48px)

**Typography:**
- Never smaller than 14px for body text
- Generous line-height (1.6) for readability
- Adequate contrast (WCAG AA minimum)

**Navigation:**
- Sticky header on scroll (optional)
- Bottom-sheet for context options
- Swipe gestures where appropriate

---

## Accessibility

### WCAG AA Compliance

**Color Contrast:**
- Text: Minimum 4.5:1 ratio
- Large text (18px+): Minimum 3:1
- UI components: Minimum 3:1
- Test all color combinations

**Keyboard Navigation:**
- All interactive elements focusable
- Logical tab order
- Visible focus indicators (blue outline)
- Skip to main content link

**Screen Readers:**
- Semantic HTML (nav, main, article, aside)
- ARIA labels where needed
- Alt text for all images
- Form labels properly associated

**Motion:**
- Respect prefers-reduced-motion
- No auto-playing animations
- Pauseable/cancelable animations

---

## Dark Mode (Future)

### Color Adaptations

```
Background: Slate 900 (#0F172A)
Surface: Slate 800 (#1E293B)
Text: Slate 100 (#F1F5F9)
Borders: Slate 700 (#334155)

Primary: Lighter Council Blue (#60A5FA)
Amber: Slightly desaturated (#FCD34D)
Emerald: Slightly desaturated (#6EE7B7)
Rose: Slightly desaturated (#FDA4AF)
```

### Implementation

```css
/* Respect system preference */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0F172A;
    --text-primary: #F1F5F9;
    /* ... */
  }
}

/* Allow manual override */
[data-theme="dark"] {
  /* Dark theme variables */
}
```

---

## Animation & Motion

### Principles

**Purposeful Motion:**
- Animations should communicate state or guide attention
- Duration: 200-300ms for most transitions
- Easing: ease-in-out for natural feel
- No motion for motion's sake

### Common Animations

**Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 200ms ease-in-out;
```

**Slide Up:**
```css
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
animation: slideUp 300ms ease-out;
```

**Scale (for emphasis):**
```css
@keyframes scaleIn {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}
animation: scaleIn 200ms ease-out;
```

### State Transitions

- Hover: 150ms ease-in-out
- Focus: Instant (0ms)
- Loading → Content: 200ms fade
- Modal open/close: 250ms slide + fade

---

## Error States

### Error Messages

```
┌─────────────────────────────────────────┐
│  ⚠️  Something went wrong               │
│                                         │
│  We couldn't generate a discussion for  │
│  this query. Please try:                │
│                                         │
│  • Rephrasing your question             │
│  • Being more specific                  │
│  • Asking about a different topic       │
│                                         │
│  [Try Again]                            │
└─────────────────────────────────────────┘
```

**Guidelines:**
- Friendly tone, not technical error codes
- Explain what happened
- Suggest concrete next steps
- Provide retry option

### Empty States

```
┌─────────────────────────────────────────┐
│          🤔                             │
│                                         │
│  No relevant experts found              │
│                                         │
│  This topic might be outside the        │
│  current knowledge base. Try asking     │
│  about product strategy, growth, user   │
│  research, or team building.            │
│                                         │
│  [Browse Topics]                        │
└─────────────────────────────────────────┘
```

**Guidelines:**
- Empathetic, not dismissive
- Explain limitations clearly
- Suggest alternatives
- Maintain brand voice

---

## Brand Voice

### Writing Principles

**Be Clear:**
- Use simple, direct language
- Avoid jargon and acronyms
- One idea per sentence
- Active voice preferred

**Be Helpful:**
- Anticipate user needs
- Provide context when needed
- Suggest next steps
- Don't leave users stuck

**Be Humble:**
- It's AI synthesis, not gospel
- Acknowledge uncertainty
- Present multiple views
- Don't overstate confidence

**Be Respectful:**
- Of user's time and intelligence
- Of original content creators
- Of diverse perspectives
- Of the complexity of decisions

### Example Copy

**Good:**
✅ "Julie and Shreyas disagree on this. Here's why both perspectives matter..."
✅ "Based on Episode #142 where Julie discussed..."
✅ "This depends on your specific situation. Consider..."

**Bad:**
❌ "The correct answer is..."
❌ "According to our AI analysis..."
❌ "You should definitely..."

---

## UI Inspiration & References

### Similar Products to Study
- Perplexity (clean source attribution)
- Linear (minimal, purposeful UI)
- Notion (progressive disclosure)
- ChatGPT (streaming responses)

### Design Systems
- Tailwind UI components
- shadcn/ui (our base)
- Radix UI primitives

### Fonts in the Wild
- Inter: GitHub, Vercel, Stripe
- System fonts: Apple HIG, Material Design

---

## File Naming Conventions

**Components:**
- PascalCase: `QueryForm.tsx`, `DiscussionCard.tsx`
- Co-locate styles if component-specific

**Assets:**
- kebab-case: `speaker-avatar-placeholder.svg`
- Semantic names: `icon-external-link.svg` not `arrow-up-right.svg`

**Images:**
- Include dimensions: `og-image-1200x630.png`
- Optimize: WebP for photos, SVG for icons/logos

---

*Document Version: 1.0*  
*Last Updated: February 14, 2026*  
*Owner: Design Team*
