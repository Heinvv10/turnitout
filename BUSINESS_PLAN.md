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

### Proposed Model

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | R0 | 3 checks/month, readability + grammar + tone only |
| **Student** | R29/month | Unlimited checks, all features, citation generator |
| **Student Annual** | R249/year (save 28%) | Same as Student, billed annually |
| **Pay-per-check** | R5/check | For irregular users, no commitment |
| **Institutional** | R99/student/year | Bulk licensing via Cornerstone, includes admin dashboard |

**Rationale:**
- R29/month is ~1 cheap meal — affordable even without NSFAS
- Pay-per-check option matches irregular student cash flow
- Institutional deal is the real revenue play (R99 x 2,000 students = R198k/year from one institution)
- Free tier must be useful enough to drive word-of-mouth but limited enough to convert

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

## Revenue Projections

| Scenario | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| **Conservative** (Cornerstone only) | R50k | R200k | R400k |
| **Moderate** (3-5 institutions) | R150k | R600k | R1.5M |
| **Aggressive** (10+ institutions) | R300k | R1.2M | R3M+ |

Assumptions:
- Cornerstone: ~2,000 students, 20% adoption Year 1
- Other institutions: 500-5,000 students each
- Mix of institutional licenses (R99/student) and individual subscriptions (R29/month)

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
