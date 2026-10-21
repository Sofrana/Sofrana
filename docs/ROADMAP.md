# Roadmap

Two weeks, two people, full time: 10 working days. Day 1 is a Monday; the weekend between day 5 and day 6 is a buffer, used only if we are behind. Each phase ends with a gate; we do not start the next phase until the gate is passed.

| Phase | Days | Goal | Gate |
| --- | --- | --- | --- |
| [M1 · Foundation](#m1--foundation-days-12) | 1–2 | Next.js app, CI, Vercel, schema, admin form, auth, design system | Live link works, design and schema approved by both |
| [M2 · Core](#m2--core-days-36) | 3–6 | Data for 15 dishes, consensus pipeline, recipe pages, servings, menu builder, search, kitchen mode | The website works end to end |
| [M3 · Stars](#m3--stars-days-79) | 7–9 | Regional map, voice, English, PWA, accessibility | All six features meet their definition of done |
| [M4 · Polish and launch](#m4--polish-and-launch-day-10) | 10 | End-to-end tests, Lighthouse, demo video, docs | Live demo and video published, `v1.0.0` released |

Each phase is a GitHub milestone. Each of the six features is an epic issue with the label `epic`. Every task is an issue with a `day:N` label.

**Owners:** **A** owns the consensus recipe, fridge search and regional map, plus the database, data scripts, admin form and auth. **B** owns servings and the menu builder, the voice kitchen mode and the PWA, plus project setup, CI, Vercel and the design system.

**Content:** 15 dishes (6–10 versions each), 5 provinces, Turkish and English.

## Daily rhythm

- **09:30 · stand-up (15 min):** what I finished, what I do today, what blocks me.
- **During the day:** small PRs; review the other person's PR within two hours.
- **17:30 · demo (15 min):** show what was merged today; two lines each in [`docs/daily-notes.md`](daily-notes.md).
- **Every other day:** one of us cooks a consensus recipe and gives it the "tested" badge (at least 5 by day 10).

---

## M1 · Foundation (days 1–2)

### Day 1

1. **Both** Kick-off: invite A to the organization, pick the 15 dishes, agree on the daily times (#11, #12)
2. **B** Create the Next.js app and get CI green on a first PR; A reviews it (#7)
3. **A** In parallel: create the Supabase project and collect 6–10 public version links per dish (#9)
4. **B** After #7: connect Vercel and add the live link (#8), then start the designs (#15)
5. **A** After #7: Drizzle schema, migration and seed scripts (#9)

### Day 2

1. **A** Admin form with "paste and parse": paste an ingredient list, Claude Haiku splits it into rows (#10)
2. **B** Designs reviewed and approved by both before noon (#15)
3. **B** Design system: tokens and base components (#16)
4. **A** Supabase Auth; protect the admin form (#17)
5. **A** Start entering versions (#13)

**Gate:** live link works, design and schema approved by both. Close M1, release `v0.1.0`.

## M2 · Core (days 3–6)

| Day | A | B |
| --- | --- | --- |
| 3 | Finish entering versions for 15 dishes (#13), normalization script with tests (#14) | Scaling rules with tests and the servings control (#18) |
| 4 | Consensus script with tests; run all 15 dishes (#19) | Home, meal tabs and menu sections (#20) |
| 5 | Recipe detail page and animated "Why this way?" panel (#21) | Menu builder: merged shopping list, cooking order (#22) |
| 6 | "What's in my fridge?" search (#23) and ranking score (#24) | Kitchen mode: step cards, timers, screen wake lock (#25) |

On day 3 morning we agree on the shared types in `src/lib/core/types.ts`, so A's data and B's pages fit without waiting for each other.

**Gate:** a visitor can browse, open a recipe, change servings, build a menu, search by ingredients and cook in kitchen mode. On day 6 afternoon each person tests the other's flows. Close M2, release `v0.2.0`.

## M3 · Stars (days 7–9)

| Day | A | B |
| --- | --- | --- |
| 7 | Regional map and 5 province pages (#26) | Voice: rule layer, Turkish numbers, speech recognition (#27) |
| 8 | English steps and translations (#28) | Claude voice layer and the 20-command test set (#29) |
| 9 | Animation and accessibility pass (#30) | PWA: manifest, service worker, offline recipes; test on Android and iPhone (#31) |

**Gate:** all six features meet their definition of done; the README "Current" column is filled in. Close M3, release `v0.3.0`.

## M4 · Polish and launch (day 10)

| | A | B |
| --- | --- | --- |
| Morning | Playwright tests for recipe, search and map; cross-test B's features (#32) | Playwright tests for servings, menu and kitchen mode; cross-test A's features (#33) |
| Afternoon | `docs/ARCHITECTURE.md` (#32) | 2-minute demo video, README screenshots (#33) |
| End of day | **Both:** Lighthouse ≥ 90, live demo and video links in both READMEs, close M4, release `v1.0.0` (#34) | |

After launch (optional): one case study each (blog post or LinkedIn article).

---

## Definition of done

1. **Consensus recipe:** 15 dishes passed through the pipeline; every recipe shows ingredient usage percentages; the panel animates on scroll; the pipeline reruns with one command and has tests.
2. **Servings and menu builder:** works for 1–12 servings; rounding, spice and time rules are unit tested; the menu builder returns a merged shopping list and a cooking order.
3. **Voice kitchen mode:** at least 90 % of the 20-command test set is parsed correctly; the transcript is shown on screen; free-form questions go to Claude; a typed command box is always available.
4. **Fridge search:** results for 3 ingredients in under 300 ms; tolerant to typos ("patlican" finds "patlıcan").
5. **Regional map:** 5 provinces (İstanbul, İzmir, Kayseri, Gaziantep, Trabzon) are clickable and open their own page; usable with the keyboard.
6. **PWA:** can be added to the home screen on Android and iPhone; the screen stays on in kitchen mode (Screen Wake Lock API); the last 10 opened recipes work offline.

## Out of scope

| Item | Why |
| --- | --- |
| Separate mobile app (Expo) | The PWA covers the same use case with one codebase |
| Regional variants ("Kayseri usulü") | Needs more data than two weeks allow |
| More than 15 dishes and 5 provinces | Data entry is the slowest task; quality over quantity |
| Lock-screen timer | Needs native mobile code |
| App Store / Play Store release | A live demo and a video are enough for a portfolio |
| Chef partnerships, licensed data | Not needed for a non-commercial project |
| Photo-based doneness check, fridge photo recognition | Image analysis costs money per request |
| Live recipe cost, shared shopping list, taste profile | Valuable, but they distract from the six core features |

## If time allows (in order)

1. More dishes and provinces, regional variants
2. Hand-gesture "next step" with MediaPipe (runs in the browser)
3. One-time AI summary of reviews per recipe

New ideas go to the `idea` label and are not started before day 10 is done.
