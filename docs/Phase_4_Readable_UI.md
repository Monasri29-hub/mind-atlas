# Phase 4 — Readable professional portfolio UI

Date: 17 October 2026

## Outcome

Make the content understandable alongside the floating worlds. The introduction names Monasri and identifies her AI/ML focus. Each world has a prominent title, a clear purpose, and readable supporting content. Project cards expose the work before asking visitors to open a dialog or interact with 3D.

## Content hierarchy

| Area | Visible content |
| --- | --- |
| Overview | Name, AI/ML focus, short introduction, selected-project action, education, CGPA |
| Psychology | The Mind Garden, human-centered interests, EmotiSpace connection |
| AI | Intelligence Nexus, three selected AI systems and their pipelines |
| Projects | All five existing projects, each with purpose, contribution, scope/output, technology tags, and a case-study action |
| Culture | Cultural Crossroads, creative exploration, Cultural Memory connection, existing dance achievement |
| Hackathons | Event, organizer, date, participation status, and two selected building roles |
| Research | The Observatory, exploratory benchmark scope, community membership |
| Technology | Four project-linked skill areas, using technologies and methods from the existing case studies |
| Future | The Open Horizon, three clearly aspirational directions, LinkedIn and GitHub actions |

Concise project highlights are derived from existing case-study records in `data/portfolio.ts`. No new employers, qualifications, awards, research publications, performance metrics, or admissions are introduced. Existing profile links are labeled as profile links; individual source repositories and live demos are not invented.

## Visual system

- Opaque warm ivory reading surface: `#FBF8F2`.
- Primary text: `#162B3A`; secondary text: `#465565`.
- Editorial serif world titles and system sans-serif interface/body text.
- Body copy is generally 16px; project facts and supporting metadata use a deliberate smaller hierarchy rather than faint text.
- World-specific dark accent text on pale supporting surfaces.
- Shared spacing, bordered content cards, restrained shadows, and rounded corners.
- Project cards use separate labels for contribution and scope/output, avoiding unsupported success claims.
- Typography uses local/system fallbacks without a blocking external font stylesheet.

The primary, secondary, button, and nine theme foreground/background color pairs were checked mathematically against a 4.5:1 normal-text contrast threshold. This covers those specific pairs, not every rendered state or a complete WCAG audit.

## Layout and navigation

Desktop reserves a left reading column and a separate scene area. Panel width is clamped between 340px and 420px, with space between the panel and stage. Long case-study collections use ordinary page scrolling; they are not clipped into a fixed-height card.

At 960px and below, the scene occupies a reserved 300–420px region above the reading panel. The Three.js device breakpoint matches that layout. Smaller screens have a previous/current/next bar, with every destination available through the world directory. The footer accounts for the device safe area.

Desktop navigation names all destinations. Map markers are 44px circles, with their projected offsets synchronized to the new size. Compact scene controls identify the world without repeating a second large section title over the island.

Professional header links return from orbit inspection to the reading experience. The world directory supports Escape, outside-click dismissal, initial focus, and visible current-destination state. Case-study dialogs have a persistent close control, a named title and summary, full content, and focus restoration after the dialog closes.

## Component organization

- `Portfolio.tsx`: state, scene integration, section observation, motion preference, menu dismissal, and dialog lifecycle.
- `PortfolioSections.tsx`: memoized reading content, project cards, contextual skills, and the native project dialog.
- `PortfolioNavigation.tsx`: professional header, world directory, desktop/mobile navigation, and scene controls.
- `globals.css`: one coherent responsive stylesheet rather than accumulated overrides.

The heavy Three.js scene remains dynamically loaded. The reading content is present in the static HTML during loading and when WebGL is unavailable.

## Validation

```bash
npm run typecheck
npm run verify:worlds
npm run verify:navigation
npm run verify:environment
npm run build
```

Additional one-off static DOM and server-rendering checks cover:

- One identity heading and nine labeled, focusable section targets.
- Unique IDs and valid internal links and ARIA references.
- Five project cards with purpose, contribution, and output.
- All five project dialog variants with the complete source contribution, output, workflow, and technologies.
- Named controls, visible role/community/goal blocks, and safe external-profile links.
- Disabled 3D controls while loading.
- The specified text contrast pairs.

These checks do not exercise live focus movement, touch interaction, CSS layout, or WebGL rendering. Interactive browser QA is unavailable in this environment. Review desktop, tablet, mobile, keyboard navigation, and open dialogs in a real browser before treating visual and accessibility acceptance as complete.

## Next phase

Phase 5 refines cinematic movement, arrival views, direct world travel, and interaction feedback. Phase 6 completes device-specific and accessibility review; Phase 7 verifies the final integrated experience.
