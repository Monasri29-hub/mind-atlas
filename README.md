# Mind Atlas

**Kundeti Monasri’s portfolio — a connected universe of ideas, people, and intelligent systems.**

A cinematic floating-island portfolio built with Next.js, React, TypeScript, Three.js, and GSAP. Eight distinct worlds introduce Monasri’s projects, technical strengths, research interests, communities, and next chapter. Readable content panels and direct navigation keep the experience useful for recruiters as well as explorers.

![Floating sky-world concept artwork](public/sky-world.webp)

*Concept artwork used by the portfolio; the interactive scene is rendered separately with Three.js.*

## Experience

- Scroll-driven exploration with cinematic camera movement and connected sky routes.
- Eight worlds with different architecture, symbols, colors, and atmospheres.
- Five project case studies with the problem, contribution, workflow, technologies, and outcome.
- Opaque editorial reading panels, prominent world titles, and named destination navigation.
- Project cards expose purpose, individual contribution, scope, and technologies before opening a case study.
- Skills are connected to selected projects; participation, experience, communities, and goals have readable content blocks.
- Keyboard-accessible project dialogs and six orbit/zoom buttons, with persistent motion preferences.
- Optional illustrated view with all content available; automatic fallback when WebGL is unavailable.
- Static export: no database, API keys, or paid model services required to run the portfolio.

## World architecture

All eight worlds are implemented as procedural, real-time Three.js environments:

- **Shared foundation:** pearl and stone architecture, irregular floating rock, layered cloud sprites, walkable cyan/pink sky bridges, and an airy daylight palette.
- **Psychology — The Mind Garden:** a human profile built from 25 solid contour ribbons, neural connections, flowing arches, a reflection pool, four suspended memory fragments, and emotion lights.
- **AI — The Intelligence Nexus:** split tapered laboratory towers, a suspended inference engine, three tilted gimbals, a separate knowledge graph, and four ordered model stations.
- **Projects — The Project Atelier:** one continuous exhibition floor, a curved shared gallery spine, five purpose-specific bays, and an open-folio courtyard.
- **Culture — The Cultural Crossroads:** a woven performance pavilion, stepped amphitheatre, warm art folios, acoustic waves, and a suspended connection lantern.
- **Hackathons — The Invention Yard:** a rising asymmetrical truss, a suspended four-rotor prototype, three working benches, supply modules, and a challenge board.
- **Research — The Observatory:** an open-slit dome and visible telescope, a calibrated celestial atlas, sparse knowledge clusters, and a quiet reading terrace.
- **Technology — The Systems Nexus:** exposed cantilevered layers connecting data stores, model modules, application interfaces, and a visible infrastructure spine.
- **Future — The Open Horizon:** solid crescent steps, a supported stylized Earth, and unfinished light routes toward higher studies, research, and global exploration.

Scroll or select a chapter to fly to its world. Choose **Explore in 3D** to drag to orbit and pinch or scroll to zoom. Use the world buttons to travel between all eight worlds; press Escape or **Return to portfolio** to resume reading. Project exhibits open the same accessible case-study dialogs as the project list.

Concept illustrations provide the art direction. The interactive implementation uses lightweight procedural geometry. Each world has a matching transparent code-rendered fallback still. An overview still appears during loading and when WebGL is unavailable. A GPU error boundary keeps failures isolated from the readable portfolio. Important portfolio content remains in readable HTML panels.

Opaque static architecture is batched by material within each world. Animated objects, transparent surfaces, and project selection remain independent. Geometry checks verify the actual batched scene and instance transforms, chapter camera framing at six viewport shapes, overview framing and non-overlapping markers at seven scene sizes, complete route connectivity, and all five project selection targets. These checks also run in GitHub Actions.

## Layout and atmosphere repair

The sky background now remains visible after the renderer starts. A single responsive stylesheet replaces the accumulated layout overrides. Compact numbered beacons reveal world names on hover or keyboard focus; their positions avoid each other and the scene toolbar. The readable panels occupy less horizontal space, leaving a larger continuous 3D stage.

Camera framing is calculated from the constructed geometry rather than a fixed distant viewpoint. The islands have finished edge lighting, supporting fins, cliff energy seams, and viewing rails. Other islands remain present during chapter transitions. Lighting and sky reflections provide clearer separation between architecture, rock, and atmosphere.

Reduced-motion world changes move both the camera and its orbit pivot immediately. Animated flights start at the current inspected viewpoint, and dragging or zooming interrupts a flight. Toolbar changes recalculate marker placement without resetting the camera. The 3D control is disabled until the first successful frame; fallback mode directs visitors to the world navigation. Touch devices retain a conservative frame and resolution budget through orientation changes.

`verify:navigation` runs 24 world transitions and camera handoffs using Three.js OrbitControls with no DOM element. These mathematical regression checks supplement the geometry checks; they do not replace interactive browser or device testing.

## The worlds

### Phase 2 — sky and island foundations

The shared environment now uses closed, vertex-colored rock strata with irregular ledges, embedded outcrops, moss patches, and instanced trailing greenery. Shaded near and horizon cloud banks add depth over the continuous sky background. Distant settlements provide scale without becoming extra portfolio destinations or expanding the navigation camera bounds.

Warm directional light, cool sky fill, and chapter-focused desktop shadow maps separate architecture from terrain. Mobile and touch modes disable shadow maps and distant settlements, halve the cloud banks, and retain the existing resolution and frame limits. Reduced motion stops cloud drift and transit signals.

Sky bridges now attach to the actual elliptical or rectangular deck footprints and include landing sills and small guide lights. Six railed walkways and three energy routes preserve the nine-link network. The fixed transit architecture is batched into 11 mesh draws, with moving signals kept separate. All nine transparent loading/failure stills were regenerated from the updated geometry.

This was the shared environment foundation pass. See [the Phase 2 implementation notes](docs/Phase_2_Environment.md).

### Phase 3 — distinct world landmarks

All eight worlds now have revised architectural silhouettes, with solid sculptural bands, stepped terraces, an open five-bay exhibition, a warm woven pavilion, an angular prototype yard, an observatory, exposed computing layers, and a quiet global horizon. Garden trees have branched trunks and instanced clustered canopies. The Projects world remains one island containing all five existing case studies.

The new band and terrace geometries are closed volumes, with consistent surface winding checked before batching. Project selection is tested through the actual chapter camera against the full gallery: every exhibit must have a visible selectable surface rather than merely intersecting a ray aimed at an empty bounding-box center. All nine fallback images have been regenerated from the changed world geometry.

These are procedural architectural interpretations of the Phase 1 art direction, not a claim of pixel-identical reproduction. CPU stills help assess silhouette and composition; live materials, shadows, orbit interactions, and device performance require a WebGL-capable browser review. See [the Phase 3 implementation notes](docs/Phase_3_World_Identity.md). Phase 4 addresses the editorial content panels and scan-friendly portfolio UI.

### Phase 4 — readable professional portfolio UI

The introduction now identifies Monasri, her AI/ML focus, education, and selected-work action immediately. All eight worlds use opaque ivory reading surfaces, clearer editorial titles, larger supporting text, and theme colors with checked text contrast. Five project cards separate purpose, contribution, and scope/output, with a distinct case-study action. The complete case studies retain their workflow, technology, contribution, and output details.

Technology cards connect methods and tools to actual selected projects. Hackathon participation, selected building roles, community membership, creative achievement, and future goals have dedicated content blocks. Desktop navigation shows destination names; smaller screens use a previous/current/next bar and a keyboard-accessible world directory. The scene controls are compact, and map beacons have 44px targets. At 960px and below, reading panels sit beneath the reserved sky stage.

Static HTML and component-rendering checks cover nine sections, five cards and full case-study dialogs, valid headings and internal/ARIA references, named controls, profile links, and theme contrast. These checks do not constitute a full accessibility audit or live browser review. See [the Phase 4 implementation notes](docs/Phase_4_Readable_UI.md).

### Phase 5 — cinematic travel and interaction

Each world has a deliberate arrival angle fitted to its actual geometry. Direct links select their destination once, expose its content immediately, and animate the camera along a short eased route. Normal scrolling remains chapter-driven. Inspection preserves the current pose, supports reset view, and keeps its viewpoint during resize. Pointer movement eases gently; travelling feedback and reduced-motion handling keep navigation predictable.

Camera checks cover preset/orbit handoffs, opposite viewing directions, flight continuity, interruption, and pivot clearance. Eight regenerated fallback views match the new arrivals. Live browser and device verification remains outstanding. See [the Phase 5 implementation notes](docs/Phase_5_Cinematic_Travel.md).

### Phase 6 — devices, accessibility, and performance

Mobile reading uses a smaller sky stage, safe-area spacing, wrapping metadata, and stacked narrow-screen contact actions. Scene controls step aside when reading panels cover the stage; the directory still provides 3D entry. Six named orbit/zoom buttons make inspection operable without dragging. Hidden reading content becomes inert during inspection, return navigation focuses the chapter, and project dialogs identify their initial close control.

Motion and illustrated-view choices persist locally. Illustrated view stops the GPU scene while keeping every world and project readable; Save-Data defaults to this mode when no explicit choice exists. Rendering sleeps behind menus/dialogs, in hidden tabs, and when mobile reading covers the stage. Framebuffer pixel budgets supplement the existing quality limits. Runtime checks cover scheduler lifecycle, 42 viewport/DPI budgets, and 600 camera-button adjustments. Live device performance and accessibility acceptance remain pending. See [the Phase 6 implementation notes](docs/Phase_6_Device_Accessibility_Performance.md).

| World | Visual identity | Portfolio focus |
| --- | --- | --- |
| Psychology | Neural forms, thought pathways, soft emotional light | Human behavior, cognition, and human-centered design |
| AI | Intelligence core, structured towers, data pipelines | AI/ML applications and intelligent systems |
| Projects | One shared Project Atelier with five purpose-specific exhibits | Selected work and individual contributions |
| Culture | Warm artistic forms and global connections | Generative art, culture, and human connection |
| Hackathons | Experimental structures and invention zones | Rapid building and collaborative challenges |
| Research | Constellations and an observatory atmosphere | Evaluation, curiosity, and research communities |
| Technology | Modular infrastructure and connected systems | Tools in the context of the work they enable |
| Next chapter | Open space, global routes, and a bright horizon | Higher studies, exploration, and future goals |

## Selected projects

| Project | Focus |
| --- | --- |
| EmotiSpace | Emotion- and personality-informed room recommendations |
| SignSpell AI | Webcam-based ASL fingerspelling and text construction |
| AI News Digest | Scheduled news retrieval, local-LLM summarization, and email delivery |
| Learning to learn | A 100-task synthetic benchmark for reasoning and generalization |
| Cultural Memory | Fifteen AI-generated creative interpretations of cultural artifacts |

These are portfolio case studies. Their application source code and services are not bundled with this website. SignSpell is a fingerspelling tool; Cultural Memory is a creative exploration. No benchmark performance or publication claim is implied.

## Run locally

Use **Node.js 24** and npm. The Node version is recorded in `.nvmrc`.

```bash
git clone https://github.com/Monasri29-hub/mind-atlas.git
cd mind-atlas
npm ci
npm run dev
```

Open `http://localhost:3000`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run typecheck` | Check TypeScript without emitting files |
| `npm run verify:worlds` | Verify world geometry, batching, chapter framing, connections, and project selection |
| `npm run verify:navigation` | Verify instant world changes and inspected-camera handoffs with real OrbitControls |
| `npm run verify:environment` | Verify closed terrain, route attachment, batched transit, cloud quality modes, and reduced motion |
| `npm run verify:runtime` | Verify render sleep/resume/disposal, framebuffer budgets, and bounded button-operated camera controls |
| `npm run build` | Generate the production website in `out/` |
| `npm start` | Serve the generated `out/` directory locally |

Run `npm run build` before `npm start`. No environment variables are needed.

## Project structure

| Path | Responsibility |
| --- | --- |
| `app/page.tsx` | Page entry point |
| `app/layout.tsx` | Document structure and metadata |
| `app/globals.css` | Responsive styling, content panels, and motion preferences |
| `components/Portfolio.tsx` | Sections, navigation, project dialogs, and readable content |
| `components/PortfolioSections.tsx` | Editorial reading panels, project cards, contextual skill blocks, and case-study dialogs |
| `components/PortfolioNavigation.tsx` | Named world navigation, professional header, mobile travel bar, and compact scene controls |
| `components/SkyScene.tsx` | Procedural Three.js worlds and camera behavior |
| `components/WorldArchitecture.ts` | Shared materials and eight distinct world builders |
| `components/WorldForms.ts` | Closed sculptural ribbons and solid arc terraces |
| `components/FloatingFoundation.ts` | Closed weathered rock strata, outcrops, and planted cliff edges |
| `components/SkyEnvironment.ts` | Shaded cloud texture, near/horizon cloud layers, and distant settlements |
| `components/SkyRoutes.ts` | Deck-aware arrival points, railed sky bridges, and moving transit signals |
| `components/WorldCatalog.ts` | World positions, route graph, and collision-aware numbered markers |
| `components/SceneFraming.ts` | Camera framing from the real geometry, including instanced foliage |
| `components/CameraNavigation.ts` | Camera and orbit-pivot synchronization for instant navigation and smooth handoffs |
| `components/SceneBoundary.tsx` | Isolates GPU initialization failures from readable content |
| `components/SceneBatch.ts` | Static architecture batching with independent animation and project picking |
| `scripts/verify-worlds.mjs` | Renderer-independent geometry and scene checks |
| `data/portfolio.ts` | Selected projects, experience, skills, and archive |
| `public/` | Illustrations and favicon |
| `next.config.ts` | Static-export configuration |
| `vercel.json` | Vercel build settings |
| `.github/workflows/ci.yml` | Automated install, type check, and production build |

The scene uses Three.js directly inside React. GSAP controls transitions and scroll behavior. Static HTML content remains separate from the WebGL scene so portfolio information remains available when 3D rendering is unsupported.

## Customize

1. Edit project descriptions, contributions, technologies, and experience in `data/portfolio.ts`.
2. Update introduction, community details, and profile links in `components/Portfolio.tsx`.
3. Change world geometry and camera motion in `components/SkyScene.tsx`.
4. Adjust typography, contrast, spacing, and responsive layouts in `app/globals.css`.
5. Update page metadata in `app/layout.tsx`.
6. Run the type check and production build before publishing.

Only verified project, resume, and contact links should be added. The site currently links to the provided GitHub and LinkedIn profiles; a separate downloadable resume and direct project demos have not been supplied.

## Deploy on Vercel

Import `Monasri29-hub/mind-atlas` into Vercel and select the `main` branch, with the repository root as the project root. The included configuration uses:

- Framework: **Next.js**
- Node.js: **24.x**
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: leave the Vercel Next.js preset default (do not override it to `out`)
- Environment variables: none

After linking the repository, Vercel can deploy updates pushed to `main` and create previews for pull requests. The existing production portfolio is [mind-atlas-portfolio-2.vercel.app](https://mind-atlas-portfolio-2.vercel.app/).

## Accessibility and rendering

The portfolio supports narrow screens, readable content overlays, native project dialogs, keyboard navigation, and reduced motion. The animated scene uses a single WebGL renderer. Browsers without WebGL receive themed artwork while the portfolio content remains available.

The scene should also be reviewed on a WebGL-capable device when changing geometry or animation. The latest implementation was checked with TypeScript, a production build, geometry/selection invariants, and code-rendered stills. Interactive browser QA was unavailable in that execution environment; live WebGL appearance, orbit interactions, and device frame rates still need a device review.

## Assets and content

The original sky-world and world-identity illustrations were AI-generated for this portfolio. The procedural 3D scene, eight transparent world stills, and the overview still are rendered from code. `public/sky-atmosphere.webp` was generated with the built-in image-generation tool as a continuous cinematic daylight cloud sky, with blue open space, a low horizon, warm upper-left sunlight, and no islands, buildings, typography, or interface elements. Profile content is curated from material supplied by Monasri; raw profile documents and internal hosting configuration are excluded from this repository.

## Connect

- [GitHub — Monasri29-hub](https://github.com/Monasri29-hub)
- [LinkedIn — Kundeti Monasri](https://www.linkedin.com/in/kundeti-monasri-3650ba326)
