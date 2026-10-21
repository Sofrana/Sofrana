# Roadmap

12 weeks, two people: 10 weeks of development and 2 weeks of polish and launch. Each phase ends with a gate; we do not start the next phase until the gate is passed.

| Phase | Weeks | Goal | Gate |
| --- | --- | --- | --- |
| [M1 · Foundation](#m1--foundation-weeks-12) | 1–2 | Next.js app, CI, schema, auth, design system, first 10 dishes | Design and schema approved by both |
| [M2 · Core](#m2--core-weeks-36) | 3–6 | Consensus pipeline, recipe pages, servings, menu builder, search, kitchen mode | The website works end to end |
| [M3 · Stars](#m3--stars-weeks-710) | 7–10 | Voice, regional map, PWA, 50 dishes in TR + EN | All six features meet their definition of done |
| [M4 · Polish and launch](#m4--polish-and-launch-weeks-1112) | 11–12 | Tests, performance, demo video, docs | Live demo and video published |

Each phase is a GitHub milestone. Each of the six features is an epic issue with the label `epic`.

**Owners:** **A** owns the consensus recipe, fridge search and regional map, plus the database and data scripts. **B** owns servings and the menu builder, the voice kitchen mode and the PWA, plus project setup, CI, the design system and auth.

---

## M1 · Foundation (weeks 1–2)

### Week 1

- [ ] **B** Create the Next.js app (TypeScript strict, ESLint, Prettier, Vitest) and get CI green on a first PR
- [ ] **B** Connect Vercel and add the live link to the README
- [ ] **A** Create the Supabase project and the first tables: `dishes`, `ingredients`, `recipe_versions`, `version_ingredients`
- [ ] **A** Scaffold the admin form for entering recipe versions
- [ ] **Both** Pick the first 10 dishes (at least one per meal)
- [ ] **Both** Set up the project board and agree on the weekly rhythm

### Week 2

- [ ] **A** Enter versions for the first 10 dishes
- [ ] **A** Normalization script (units → grams, synonyms) with tests
- [ ] **B** First drafts in Claude Design: home, recipe detail, kitchen mode (desktop and phone)
- [ ] **B** Turn the approved design into a design system (colors, type, spacing, components)
- [ ] **B** Supabase Auth in the app

**Gate:** design and database schema approved by both.

## M2 · Core (weeks 3–6)

| Week | A | B |
| --- | --- | --- |
| 3 | Consensus script and tests, first 10 consensus recipes | Scaling rules (rounding, spices, time, pan size) with unit tests |
| 4 | Recipe detail page and animated "Why this way?" panel | Meal and menu pages, servings UI |
| 5 | "What's in my fridge?" search (full-text + pg_trgm) | Menu builder: merged shopping list, cooking order |
| 6 | Reach 20 dishes, ranking score | Kitchen mode: step cards, timers, screen wake lock |

**Gate:** a visitor can browse, open a recipe, change servings, build a menu, search by ingredients and cook in kitchen mode.

## M3 · Stars (weeks 7–10)

| Week | A | B |
| --- | --- | --- |
| 7 | Regional map and province pages | Voice commands: rule layer, Turkish number parsing |
| 8 | Regional variants, reach 35 dishes | Claude layer (tool use), voice test set |
| 9 | Reach 50 dishes, English steps | PWA: manifest, service worker, offline recipes |
| 10 | Animations and accessibility pass | Kitchen mode and voice tested on Android and iPhone, PWA polish |

**Gate:** all six features meet their definition of done.

## M4 · Polish and launch (weeks 11–12)

- [ ] **Both** Playwright end-to-end tests for the main flows
- [ ] **Both** Each person tests the other's features and files issues
- [ ] **Both** Lighthouse ≥ 90 on performance and accessibility
- [ ] **A** Architecture write-up in `docs/ARCHITECTURE.md`
- [ ] **B** 2-minute demo video and final README with screenshots
- [ ] **Both** One case study each (blog post or LinkedIn article)
- [ ] **Both** Live demo and video links in the README

---

## Definition of done

1. **Consensus recipe:** 50 dishes passed through the pipeline; every recipe shows ingredient usage percentages; the panel animates on scroll; the pipeline reruns with one command and has tests.
2. **Servings and menu builder:** works for 1–12 servings; rounding, spice and time rules are unit tested; the menu builder returns a merged shopping list and a cooking order.
3. **Voice kitchen mode:** at least 90 % of the 20-command test set is parsed correctly; the transcript is shown on screen; free-form questions go to Claude; a typed command box is always available.
4. **Fridge search:** results for 3 ingredients in under 300 ms; tolerant to typos ("patlican" finds "patlıcan").
5. **Regional map:** 15 provinces are clickable and open their own page; usable with the keyboard.
6. **PWA:** can be added to the home screen on Android and iPhone; the screen stays on in kitchen mode (Screen Wake Lock API); the last 10 opened recipes work offline.

## Out of scope

| Item | Why |
| --- | --- |
| Separate mobile app (Expo) | The PWA covers the same use case with one codebase |
| Monorepo | Unnecessary complexity for a single app |
| Lock-screen timer | Needs native mobile code |
| App Store / Play Store release | A live demo and a video are enough for a portfolio |
| Chef partnerships, licensed data | Not needed for a non-commercial project |
| Photo-based doneness check, fridge photo recognition | Image analysis costs money per request |
| Live recipe cost | No free price data |
| Shared shopping list, taste profile | Valuable, but they distract from the six core features |

## If time allows (in order)

1. Hand-gesture "next step" with MediaPipe (runs in the browser)
2. One-time AI summary of reviews per recipe
3. After week 12: a native app with Expo, reusing `src/lib/core`

New ideas go to the `idea` label and are not started before week 10.
