# TurnItOut Enhancement Roadmap

## Current State (v1.0 - Built 25-26 March 2026)

### Core Features Complete
- [x] Rich text editor with auto-section splitting (AI-powered)
- [x] Separate essay body + reference list editors
- [x] Module outline upload (VLM-powered PDF parsing via Qwen3-VL)
- [x] 8 analysis checks (all run in parallel):
  - [x] Readability (client-side, instant)
  - [x] Grammar & Spelling (Claude API, language-aware)
  - [x] Tone & Formality (Claude API)
  - [x] Harvard/APA/MLA/Chicago/Vancouver/IEEE/OSCOLA citation checking
  - [x] Plagiarism & Similarity (Claude API, 25% Cornerstone threshold)
  - [x] AI Writing Risk Detection (perplexity, burstiness, vocabulary, transitions)
  - [x] Academic Grading (exact rubric from module outline, SA/UK/US/AU/EU scales)
  - [x] Improvement Advice (auto-generated after all checks)
- [x] Guided fix suggestions (Option C - show HOW, don't do it FOR them)
- [x] Word template export (.docx) with university template or generic fallback
- [x] PDF export via print preview
- [x] Document preview (cover page, TOC, sections, declaration)
- [x] Internationalisation (15 countries, 5 grading scales, 7 referencing styles)
- [x] Onboarding flow (4-step: country, university, scale/style, student details)
- [x] Dashboard with module cards and check history
- [x] Persistent storage (Neon PostgreSQL + localStorage)
- [x] Per-module paper persistence (switch modules, come back, everything restored)
- [x] Server-side API key (students don't manage keys)
- [x] Dark mode + mobile responsive

---

## Phase 2: Student Productivity (April 2026)

### 2.1 Source Suggestion Engine
**Priority: HIGH | Effort: MEDIUM | Impact: HIGH**
- Integrate OpenAlex API (250M+ works, free, no key needed)
- Semantic Scholar API as fallback (200M+ papers)
- Analyse essay topic → suggest 5-10 relevant academic sources
- Show: title, authors, year, journal, citation count, abstract snippet
- "Add to References" button that formats citation in selected referencing style
- Filter by: year range, peer-reviewed only, open access
- **Files:** `/src/app/api/suggest-sources/route.ts`, `/src/components/analysis/sources-panel.tsx`
- **New tab:** Sources (between Advice and Export)

### 2.2 Outline Generator
**Priority: HIGH | Effort: EASY | Impact: MEDIUM**
- Student enters: topic, word count, assignment type (essay/report/reflection)
- Claude generates: suggested structure with section headings and word allocation
- Shows as a template they can follow (not content)
- "Apply to Editor" button sets up headings in the editor
- **Files:** `/src/app/api/generate-outline/route.ts`, `/src/components/editor/outline-generator.tsx`
- **Location:** Button in editor header, opens modal

### 2.3 Draft Progress Tracking
**Priority: MEDIUM | Effort: EASY | Impact: MEDIUM**
- Save snapshots after each "Run All Checks"
- Show progress chart: readability, AI risk, grade over time
- "Your readability went 45→72" motivational messages
- Compare current draft vs previous drafts
- **Files:** `/src/store/draft-history-store.ts`, `/src/components/dashboard/progress-chart.tsx`
- **Location:** Dashboard page, new "Progress" section

### 2.4 Section Word Targets
**Priority: MEDIUM | Effort: EASY | Impact: MEDIUM**
- Based on word count requirement from outline (e.g. 1000-1200)
- Show per-section targets: Intro 10-15%, Body 70-80%, Conclusion 10-15%
- Progress bars per section in the section view
- Colour-coded: green (in range), yellow (close), red (over/under)
- **Files:** Update `/src/components/editor/section-view.tsx`

### 2.5 Citation Formatter
**Priority: HIGH | Effort: MEDIUM | Impact: HIGH**
- Parse messy citations and reformat to correct style
- Input: raw citation text → Output: properly formatted Harvard/APA/MLA
- DOI lookup via CrossRef API (free) for auto-formatting
- "Fix All Citations" button in citation panel
- **Files:** `/src/app/api/format-citation/route.ts`, update citation panel

---

## Phase 3: AI Writing Coach (May 2026)

### 3.1 Writing Coach Chat
**Priority: HIGH | Effort: MEDIUM | Impact: HIGH**
- Sidebar chat that asks Socratic questions about the essay
- Assignment-aware: knows the rubric, word count, referencing style
- Questions like: "Why did you choose this evidence for paragraph 3?"
- "What's the connection between your intro claim and your conclusion?"
- Never writes content - only asks questions to make the student think
- **Files:** `/src/components/coach/chat-panel.tsx`, `/src/app/api/coach/route.ts`
- **Location:** Floating button, opens chat drawer

### 3.2 Real-time Feedback
**Priority: MEDIUM | Effort: HARD | Impact: HIGH**
- Tiptap extension that analyses as the student types
- Inline suggestions: underline issues, hover for explanation
- Debounced: runs every 5 seconds of inactivity
- Start with: sentence length warning, passive voice, informal language
- **Files:** `/src/components/editor/realtime-extension.ts`, update paper-editor.tsx

### 3.3 Assignment Countdown
**Priority: LOW | Effort: EASY | Impact: MEDIUM**
- Read due date from uploaded outline
- Show "Due in 3 days" badge in header
- Colour changes as deadline approaches (green → yellow → red)
- **Files:** Update header.tsx, read from module outline

### 3.4 Word Frequency Cloud
**Priority: LOW | Effort: EASY | Impact: LOW**
- Visual cloud of most-used words (excluding stopwords)
- Helps spot repetition and vocabulary diversity
- Click a word to highlight all instances in the editor
- **Files:** `/src/components/analysis/word-cloud.tsx`, update readability panel

---

## Phase 4: Platform & Growth (June 2026)

### 4.1 Multi-Institution Module Library
**Priority: HIGH | Effort: MEDIUM | Impact: HIGH**
- Students upload outlines → stored in DB → searchable by institution
- Other students at same institution can find and use rubrics
- Crowdsourced library grows the platform's moat
- Admin approval for quality control
- **Database:** New tables `institutions`, `shared_outlines`

### 4.2 Email Reports
**Priority: MEDIUM | Effort: MEDIUM | Impact: MEDIUM**
- After "Run All Checks", option to email PDF summary
- Professional report: all scores, top issues, advice checklist
- Could use as proof of pre-submission checking
- **Integration:** SendGrid or Resend for email delivery

### 4.3 Student Authentication
**Priority: HIGH | Effort: MEDIUM | Impact: HIGH**
- Email + password login (or Google/Microsoft SSO)
- Replaces current localStorage-only approach
- Required for SaaS billing
- **Integration:** NextAuth.js or Clerk

### 4.4 Subscription Billing
**Priority: HIGH | Effort: MEDIUM | Impact: HIGH**
- Free tier: 2 checks/month, basic readability + grammar
- Student tier: R49-79/mo, unlimited everything
- Annual tier: R399-599/yr
- **Integration:** Stripe (supports ZAR)

### 4.5 Peer Review Matching
**Priority: LOW | Effort: HARD | Impact: MEDIUM**
- Match 2-3 students for anonymous review of each other's drafts
- Structured review form based on rubric criteria
- Students rate each other's feedback
- Builds community and learning

### 4.6 Browser Extension
**Priority: LOW | Effort: HARD | Impact: MEDIUM**
- Chrome/Edge extension
- Check writing in Google Docs directly
- Like Turnitin Draft Coach but with our full analysis suite

---

## Build Order (Recommended)

### Sprint 1 (This week)
1. Source Suggestion Engine (biggest differentiator)
2. Section Word Targets (quick win)
3. Draft Progress Tracking (quick win)

### Sprint 2 (Next week)
4. Outline Generator
5. Citation Formatter
6. Assignment Countdown

### Sprint 3 (Week after)
7. Writing Coach Chat
8. Word Frequency Cloud
9. Mobile polish + dark mode fixes

### Sprint 4 (Month 2)
10. Student Authentication
11. Subscription Billing
12. Multi-Institution Module Library

### Sprint 5 (Month 2-3)
13. Real-time Feedback
14. Email Reports
15. Peer Review Matching
16. Browser Extension
