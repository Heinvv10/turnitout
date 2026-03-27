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

**Pricing philosophy:** TurnItOut replaces R586+/mo of competitor tools. Even at R199/mo we're 66% cheaper than the stack — and no competitor offers ESL, Afrikaans, provenance, or SA Harvard support. Price for value, not cost. Longer commitments = bigger discounts.

| Tier | Price | Period | Effective Monthly | AI Checks | Savings |
|------|-------|--------|-------------------|-----------|---------|
| **Free** | R0 | — | R0 | **2 AI checks total** (trial) + all local features unlimited | — |
| **Pro Monthly** | R199/month | Month | R199 | **15 AI checks/month** | — |
| **Term Pass** | R500/term (~10 weeks) | Term | R200/mo | **40 AI checks** | Predictable cost |
| **Semester Pass** | R900/semester (~5 months) | Semester | R180/mo | **80 AI checks** | Save 10% vs monthly |
| **Annual Pass** | R1,600/year | Year | R133/mo | **150 AI checks** | Save 33% vs monthly |
| **Single Check** | R25 once-off | — | — | 1 AI check | No commitment |

**What counts as 1 "AI check":**
A full "Run All Checks" = 1 check (grammar + citations + plagiarism + AI risk + grading + tone + advice). "Quick Check" (grammar + citations only) = 0.5 checks. Academize and Paraphrase each = 0.25 checks.

**Typical student usage:**
- 5 subjects × 2 essays/semester = 10 essays
- 2-3 checks per essay (draft + revision + final) = 20-30 checks/semester
- **Term Pass (R500, 40 checks) covers a full term comfortably**
- **Semester Pass (R900, 80 checks) is generous — covers heavy revisers + coach usage**
- **Annual Pass (R1,600, 150 checks) is for the serious student doing both semesters**

**What's always FREE (unlimited, no checks needed):**
Readability, vocabulary analysis, ESL/Afrikaans patterns, citation cross-check, self-plagiarism, TTS read-aloud, academic phrasebank, submission checklist, writing provenance log, DOCX export, module rubrics, peer review. These alone beat Grammarly Free.

**Why this pricing is a no-brainer:**
- vs Grammarly Pro: R204/mo × 12 months = **R2,448/year** — Annual Pass is **35% cheaper**
- vs QuillBot Premium: R142/mo × 12 months = **R1,704/year** — Annual Pass is **6% cheaper** but with 5x the features
- vs Scribbr: 1 plagiarism check = **R340/doc** — Annual Pass covers 150 checks
- vs failing and repeating: 1 module = **R5,000+** — Annual Pass is 68% cheaper than failure
- **We are the ONLY tool that offers all of this in one place, for ZAR, built for SA students**

**Margin analysis:**
| Plan | Revenue | Max checks | API Cost (R1.48/check) | Margin |
|------|---------|------------|------------------------|--------|
| Pro Monthly (15) | R199 | 15 | R22.20 | **R176.80 (89%)** |
| Term (40) | R500 | 40 | R59.20 | **R440.80 (88%)** |
| Semester (80) | R900 | 80 | R118.40 | **R781.60 (87%)** |
| Annual (150) | R1,600 | 150 | R222.00 | **R1,378 (86%)** |
| Single (1) | R25 | 1 | R1.48 | **R23.52 (94%)** |

**Average revenue per check across tiers:**
- Monthly: R13.27/check
- Term: R12.50/check
- Semester: R11.25/check
- Annual: R10.67/check
- Single: R25/check
- **All tiers profitable at 86-94% margin.** Even if students max out every check, we're healthy.

---

#### B2B Plans (Institutions)

Institutional pricing = significant discount vs individual (R1,600/year → from R299/student/year). Volume justifies the discount. Institutions save on disciplinary hearings, repeated modules, and admin time.

| Tier | Price | Checks/Student/Year | What's Included |
|------|-------|---------------------|-----------------|
| **Starter** (up to 500 students) | R399/student/year | 50 AI checks | All features, admin dashboard, usage analytics |
| **Growth** (500-2,000 students) | R299/student/year | 60 AI checks | + Priority support, custom rubrics, LMS integration |
| **Enterprise** (2,000+ students) | Custom (from R199) | 80+ AI checks | + SSO, API access, account manager, on-site training |

**Why institutions pay this:**
- Individual student price is R1,600/year — institutional at R299-R399 is a 75-81% discount
- Still in range of Turnitin (R50-R110/student for detection only — TurnItOut does detection + remediation + coaching)
- Each plagiarism disciplinary hearing costs the institution ~R2,000-R5,000 in admin time
- Preventing even 10 incidents per year pays for the entire deployment
- Cornerstone deal: R299 × 2,000 students = **R598k/year**

**Institutional margin calculation:**
| Tier | Revenue/student | API cost (R1.48 × checks) | Margin |
|------|----------------|---------------------------|--------|
| Starter (50 checks) | R399 | R74 | **R325 (81%)** |
| Growth (60 checks) | R299 | R88.80 | **R210.20 (70%)** |
| Enterprise (80 checks) | R199 | R118.40 | **R80.60 (40%)** — volume play |

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
| Avg revenue/user/year | R900 (1 semester) | R1,250 (sem + topups) | R1,600 (annual) |
| **B2C Revenue Year 1** | **R13,500** | **R125,000** | **R640,000** |

### B2B Revenue Model (the real play)
| Metric | Conservative | Moderate | Aggressive |
|--------|-------------|----------|------------|
| Institutions | 1 (Cornerstone) | 3 | 8 |
| Students covered | 500 | 3,000 | 12,000 |
| Avg price/student/year | R399 | R299 | R249 |
| **B2B Revenue Year 1** | **R199,500** | **R897,000** | **R2,988,000** |

### Combined Revenue
| Scenario | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| **Conservative** | R213k | R650k | R1.3M |
| **Moderate** | R1.02M | R3M | R7M |
| **Aggressive** | R3.63M | R10M | R20M+ |

**Key insight:** A parent paying R900/semester for their child's academic success is an easy sell — it's less than one module repeat (R5,000+). One Cornerstone deal at R299/student × 2,000 = R598k/year. At the moderate scenario, TurnItOut is a R1M/year business in Year 1.

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
