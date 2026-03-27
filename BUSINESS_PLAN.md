# TurnItOut Business Plan

## Mission
Help South African first-year students submit better assignments by bridging the gap between **detection** and **remediation** — the only pre-submission tool built for the SA market.

## Market Position
No tool in the market combines pre-submission checking with remediation assistance specifically for South African ESL students. Turnitin detects problems. Grammarly fixes writing. TurnItOut does both, calibrated for SA universities.

**Key market facts:**
- 98.7% of SA internet users connect via mobile phones
- 50-60% first-year dropout rate, academic unpreparedness is primary driver
- UCT and other SA universities are abandoning AI detection tools (false positives hit ESL students hardest)
- Cornerstone students have no NSFAS access — extreme price sensitivity
- WhatsApp is the dominant student collaboration platform
- Harvard + APA referencing both used, with institution-specific variations

---

## Feature Roadmap

### Phase 1: Quick Wins (Week 1-2)
High-impact, low-effort features using existing infrastructure.

- [ ] **Text-to-Speech Proofreading** — "Read aloud" button using browser SpeechSynthesis API. Zero cost. ESL students catch errors by hearing their text read back.
- [ ] **WhatsApp Score Share** — "Share my readiness score" button generating a `wa.me` link with pre-filled text summary. Viral growth channel in SA.
- [ ] **Citation Cross-Checker** — Scan in-text citations (Author, Year) against reference list. Flag orphan citations and ghost references. Regex + NLP in existing API route.
- [ ] **Quick Check Mode** — Single-button "quick scan" that runs readability + grammar + citation check in under 30 seconds. For last-minute submissions.
- [ ] **Submission Readiness Checklist** — Final pre-submit dashboard: word count, readability, originality, citations matched, tone academic, formatting correct. Aggregate existing checks.

### Phase 2: Core Differentiators (Week 3-5)
Features that create competitive moat.

- [ ] **Academic Phrasebank** — Searchable library of 2,000+ phrases organized by essay section (introduction, literature review, methodology, discussion, conclusion). Psychology-specific phrases included. JSON dataset + UI panel alongside editor.
- [ ] **Paraphrasing Assistant** — When originality check flags similar passages, offer inline "Rephrase this" with 3 alternative phrasings. Powered by Claude API (already integrated).
- [ ] **Academizer / Tone Converter** — Button to convert informal sentences to academic register. Critical for ESL students. Claude API with specialized prompt.
- [ ] **Citation Generator** — Auto-generate Harvard/APA references from pasted URL, DOI, or book title. Use CrossRef + OpenLibrary APIs. SA Harvard conventions (not generic).
- [ ] **Vocabulary Level Indicator** — Show academic vocabulary level (basic/intermediate/advanced). Suggest upgrades for overused simple words ("good" -> "advantageous"). Extends existing word cloud feature.

### Phase 3: Retention & Engagement (Week 6-8)
Features that keep students coming back.

- [ ] **Writing Process Provenance Log** — Track writing timeline (typed, pasted, deleted, revised). Creates verifiable authorship trail. Student can share with lecturer to prove they wrote it. Addresses the shift away from AI detection.
- [ ] **Self-Plagiarism Checker** — Upload previous assignments, check new work against them. Many first-years unknowingly recycle paragraphs.
- [ ] **Side-by-Side Originality Viewer** — Split view showing student text alongside matched source with highlighted phrases. Educational, not punitive.
- [ ] **ESL-Aware Grammar Mode** — Detect and explain common L1 transfer errors (article omission, preposition errors, tense inconsistency). Coaching tone: explain *why* not just *what*.
- [ ] **Module-Specific Rubric Templates** — Pre-built rubrics for common BA Psychology Year 1 modules. Makes grade prediction more accurate.

### Phase 4: Growth & Scale (Week 9-12)
SA-market-specific growth features.

- [ ] **Afrikaans Writing Support** — Basic grammar and tone checking in Afrikaans. No competitor offers this. Claude has reasonable Afrikaans capability.
- [ ] **Peer Review Mode** — Shareable read-only link with structured review prompts. Every shared link introduces a new potential user. Viral growth.
- [ ] **Low-Data Mode** — Minimal payload toggle. Disable images, reduce API calls, aggressive caching. Critical for data-cost-sensitive students.
- [ ] **Offline Essay Capture** — Allow document upload + basic local checks (word count, readability) without internet. Queue API checks for when connectivity returns.
- [ ] **Institutional Licensing Portal** — Dashboard for Cornerstone admin to manage student accounts, view aggregate usage, track academic integrity trends.

---

## Pricing Strategy

### Current Model
2 free checks total, then must pay. No monthly reset.

### Proposed Model — Revised (based on SA market research + API cost reality)

**Context:**
- NSFAS living allowance: R1,650/mo. After food, almost nothing left.
- Spotify Student SA: R47.99/mo — the affordability ceiling.
- Grammarly: ~R204/mo — unaffordable for 90%+ of SA students.
- **Our API cost: ~R2 per full "Run All Checks"** (Claude token usage).
- 41% of features are FREE (local computation, zero API cost).

**Core pricing principle:** Charge per AI check, not per month. Students pay for what they use. Local features are always free.

---

#### What's FREE (always, no limits)

Every student gets these at R0 — they cost us nothing to run:

- Readability scoring (Flesch-Kincaid, passive voice, sentence length)
- Vocabulary analysis + academic word upgrades
- ESL pattern detection (21 SA language patterns)
- Afrikaans writing support (18 patterns)
- Citation cross-checker (orphans, ghosts, duplicates)
- Self-plagiarism checker (against uploaded previous work)
- Text-to-Speech proofreading
- Academic phrasebank (92 phrases, searchable)
- Submission readiness checklist
- Writing provenance log
- DOCX export
- Module rubric browser
- Peer review link generation
- Offline mode (local checks work without internet)

**This is already more than Grammarly Free or QuillBot Free offer.**

---

#### Value Comparison: What students pay elsewhere

| Feature | Competitor | Their Price | TurnItOut |
|---------|-----------|-------------|-----------|
| Grammar + tone | Grammarly Pro | R204/mo | Included |
| Paraphrasing | QuillBot Premium | R142/mo | Included |
| Plagiarism (per doc) | Scribbr | R340-R850/doc | Included |
| AI detection | Copyleaks | R240/mo | Included |
| Citation generator | QuillBot Premium | R142/mo (bundled) | Included |
| Grade prediction | No competitor | — | Included |
| ESL/Afrikaans support | No competitor | — | Included |
| Academic phrasebank | Ref-N-Write | R510 once-off | Included |
| Self-plagiarism check | Scribbr | R340/doc | Included |
| **Cost to replicate** | | **R586+/mo** | **From R69/mo** |

TurnItOut replaces 5+ paid tools at a fraction of the cost. Even at R99/mo we'd be 83% cheaper than the competitor stack — and none of them offer ESL patterns, Afrikaans support, provenance logs, or SA-specific Harvard referencing.

#### B2C Plans (Individual Students)

| Tier | Price | AI Checks Included | Extra Checks | Key Extras |
|------|-------|---------------------|--------------|------------|
| **Free** | R0 | **2 full AI checks total** (trial) | R15/each | All local features (unlimited) |
| **Starter** | R69/month | **5 AI checks/month** | R10/each | + Academizer, citation generator |
| **Pro** | R99/month | **15 AI checks/month** | R8/each | + Writing coach, paraphraser, source suggestions |
| **Semester Pass** | R449/semester (5 months) | **40 AI checks total** | R8/each | All Pro features. ~R11/check. Best value for serious students. |
| **Single Check** | R15 once-off | 1 AI check | — | No subscription. Assignment-night panic buy. |

**What counts as 1 "AI check":**
A full "Run All Checks" = 1 check (grammar + citations + plagiarism + AI risk + grading + tone + advice). "Quick Check" (grammar + citations only) = 0.5 checks. Academize and Paraphrase each = 0.25 checks.

**Per-essay budgeting guide for students:**
- 1 assignment = typically 2-3 checks (draft + revision + final) = R30-R45 on pay-as-you-go
- Semester of 6 assignments = ~15-18 checks = Starter plan covers it at R69/mo
- Semester Pass at R449 for 40 checks is the best deal for consistent users
- Even at R99/mo, TurnItOut is 83% cheaper than Grammarly Pro alone

**Why this pricing works:**
- R69/mo is less than half of Grammarly Pro (R204/mo) — easy to justify
- R99/mo replaces R586+/mo worth of tools — massive perceived value
- R15/single check = assignment-night impulse buy (less than a McDonald's meal)
- Free tier gives 2 checks total (not monthly) — enough to experience value, not enough to freeload
- Semester Pass rewards commitment at semester start when students have money

---

#### B2B Plans (Institutions)

| Tier | Price | Checks/Student/Year | What's Included |
|------|-------|---------------------|-----------------|
| **Starter** (up to 500 students) | R99/student/year | 25 AI checks | All features, admin dashboard, usage analytics |
| **Growth** (500-2,000 students) | R79/student/year | 30 AI checks | + Priority support, custom rubrics, LMS integration |
| **Enterprise** (2,000+ students) | Custom (from R59) | 40+ AI checks | + SSO, API access, account manager, on-site training |

**Institutional margin calculation (post-Haiku optimization):**
- API cost per check (optimized): ~R1.48
- R79/student/year with 30 checks = R1.48 × 30 = R44.40 API cost → **R34.60 margin (44%)**
- R99/student/year with 25 checks = R1.48 × 25 = R37 API cost → **R62 margin (63%)**
- Still undercuts Turnitin at R50-R110/student/year, and offers far more features
- Cornerstone deal: R79 × 2,000 students = **R158k/year**

---

#### API Cost Breakdown (per check type)

| Check | Model | Token Cost | Optimized Cost |
|-------|-------|------------|----------------|
| Grammar | Haiku | R0.15 | R0.08 |
| Citations | Haiku | R0.20 | R0.10 |
| Tone | Haiku | R0.10 | R0.05 |
| Plagiarism | Sonnet | R0.50 | R0.30 |
| AI Risk | Sonnet | R0.50 | R0.30 |
| Grading | Sonnet | R0.80 | R0.50 |
| Advice | Haiku | R0.30 | R0.15 |
| **Full check (current)** | **Mixed** | **~R2.55** | — |
| **Full check (optimized)** | **Haiku + Sonnet** | — | **~R1.48** |

**Cost optimization roadmap:**
- [ ] Migrate grammar, citations, tone to Haiku (saves 60% on these)
- [ ] Cache repeat grammar patterns (save ~20% on grammar calls)
- [ ] Batch plagiarism + AI risk into single prompt (save 1 API call)
- [ ] Use streaming for grading to reduce perceived latency
- [ ] Set hard monthly caps per tier — no overages without purchase

---

#### Pricing Rationale

| Decision | Why |
|----------|-----|
| Free tier with 1 AI check/month | Enough to try the full experience once. Local features provide daily value. Converts curiosity → habit. |
| Per-check model, not unlimited | At R2/check API cost, unlimited at R19 = guaranteed loss. Students understand "you get X checks." |
| R5/single check | R5 is less than a Coke at a campus café. Low enough for impulse buy. Covers R2 API + R3 margin. |
| Semester Pass at R199 | Matches academic calendar. Students budget per semester, not per month. 30 checks for 5 assignments = generous. |
| B2B at R49-R59/student/year | Still undercuts Turnitin (R50-R110). Profitable only with Haiku optimization. |
| No USD pricing | ZAR-denominated = advantage over Grammarly/QuillBot. No FX surprises. |
| Quick Check = 0.5 credits | Encourages use of the cheaper option (grammar + citations only), saves API costs. |

---

## Go-to-Market Strategy

### Phase 1: Cornerstone Beachhead (Month 1-3)
- [ ] Pilot with 50 Cornerstone BA Psychology Year 1 students
- [ ] Partner with 2-3 lecturers as champions
- [ ] Collect testimonials and usage data
- [ ] Iterate on feedback (especially ESL pain points)
- [ ] Measure: retention rate, checks per student, NPS

### Phase 2: Cornerstone Institution-Wide (Month 3-6)
- [ ] Present pilot results to Cornerstone management
- [ ] Propose institutional licensing deal
- [ ] Expand to all Cornerstone faculties (Theology, Education, Psychology, Business)
- [ ] Integrate with Funda (Cornerstone's VLE) if possible
- [ ] Measure: conversion rate, institutional deal closed Y/N

### Phase 3: SA Private Universities (Month 6-12)
- [ ] Target other private HEIs: Monash SA, Varsity College, AFDA, Boston City Campus
- [ ] Adapt rubric templates for each institution
- [ ] Build case study from Cornerstone data
- [ ] Apply for zero-rating with MTN, Vodacom (educational content exemption from data charges)
- [ ] Measure: number of institutions, total student reach

### Phase 4: Public Universities (Month 12-18)
- [ ] Target UWC, CPUT, Stellenbosch (Western Cape cluster)
- [ ] Position against Turnitin Draft Coach (which requires institutional Turnitin license)
- [ ] NSFAS-eligible pricing for public university students
- [ ] Measure: market share in Western Cape

---

## Revenue Projections (Revised)

### B2C Revenue Model
| Metric | Conservative | Moderate | Aggressive |
|--------|-------------|----------|------------|
| Free users (Year 1) | 500 | 2,000 | 5,000 |
| Conversion to paid | 3% | 5% | 8% |
| Paying users | 15 | 100 | 400 |
| Avg revenue/user/year | R449 (semester pass) | R594 (R99 × 6mo) | R828 (R69 × 12mo) |
| **B2C Revenue Year 1** | **R6,735** | **R59,400** | **R331,200** |

### B2B Revenue Model (the real play)
| Metric | Conservative | Moderate | Aggressive |
|--------|-------------|----------|------------|
| Institutions | 1 (Cornerstone) | 3 | 8 |
| Students covered | 500 | 3,000 | 12,000 |
| Avg price/student/year | R99 | R79 | R69 |
| **B2B Revenue Year 1** | **R49,500** | **R237,000** | **R828,000** |

### Combined Revenue
| Scenario | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| **Conservative** | R56k | R180k | R400k |
| **Moderate** | R296k | R900k | R2M |
| **Aggressive** | R1.16M | R3.5M | R7M+ |

**Key insight:** B2C drives adoption. B2B drives revenue. One Cornerstone deal at R79/student × 2,000 = R158k/year. The higher B2C pricing also means individual subscribers are genuinely profitable — R99/mo with 15 checks = R1.48 × 15 = R22.20 API cost vs R99 revenue = **78% margin**.

---

## Technical Priorities

- [ ] **Performance**: Keep LCP under 1s, bundle size minimal
- [ ] **Mobile-first**: All features must work on 390px viewport
- [ ] **Data efficiency**: Lazy loading, service worker caching, low-data mode
- [ ] **Zero-rating application**: Prepare technical documentation for MTN/Vodacom
- [ ] **PWA**: Add service worker + manifest for installable web app
- [ ] **Test coverage**: Maintain 169+ tests, add integration tests for API routes

---

## Key Metrics to Track

| Metric | Target |
|--------|--------|
| Monthly Active Users | 100 (Month 3), 500 (Month 6), 2,000 (Month 12) |
| Checks per user per month | 4+ |
| Free-to-paid conversion | 15%+ |
| 30-day retention | 60%+ |
| NPS score | 50+ |
| Institutional deals closed | 1 (Month 6), 3 (Month 12) |
| WhatsApp shares per month | 200+ (organic growth indicator) |

---

## Competitive Advantages

1. **Only pre-submission tool built for SA market** — ZAR pricing, Harvard SA conventions, ESL-aware
2. **Detection + remediation** — doesn't just flag problems, helps students fix them
3. **Mobile-first** — 98.7% of SA students access internet via mobile
4. **Not an AI detector** — positioned as writing improvement, aligned with UCT's shift away from AI detection
5. **WhatsApp-native sharing** — built for how SA students actually collaborate
6. **Affordable** — R29/month or R5/check, no NSFAS required
7. **Cornerstone-specific** — deep integration with module outlines, rubrics, and referencing styles

---

*Last updated: 2026-03-27*
*Generated from competitive analysis of Turnitin, Grammarly, QuillBot, Scribbr, PaperRater, Ref-N-Write, Writefull, Copyleaks + SA higher education market research.*
