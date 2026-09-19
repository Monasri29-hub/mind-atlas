# Mind Atlas

**Kundeti Monasri’s portfolio — a connected universe of ideas, people, and intelligent systems.**

A cinematic floating-island portfolio built with Next.js, React, TypeScript, Three.js, and GSAP. Eight distinct worlds introduce Monasri’s projects, technical strengths, research interests, communities, and next chapter. Readable content panels and direct navigation keep the experience useful for recruiters as well as explorers.

![Floating sky-world concept artwork](public/sky-world.webp)

*Concept artwork used by the portfolio; the interactive scene is rendered separately with Three.js.*

## Experience

- Scroll-driven exploration with cinematic camera movement and connected sky routes.
- Eight worlds with different architecture, symbols, colors, and atmospheres.
- Five project case studies with the problem, contribution, workflow, technologies, and outcome.
- Prominent section headings, supported text panels, and responsive navigation.
- Keyboard-accessible project dialogs, reduced-motion support, and a manual motion toggle.
- Illustrated fallback when WebGL is unavailable.
- Static export: no database, API keys, or paid model services required to run the portfolio.

## The worlds

| World | Visual identity | Portfolio focus |
| --- | --- | --- |
| Psychology | Neural forms, thought pathways, soft emotional light | Human behavior, cognition, and human-centered design |
| AI | Intelligence core, structured towers, data pipelines | AI/ML applications and intelligent systems |
| Projects | Five purpose-specific miniature environments | Selected work and individual contributions |
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
| `components/SkyScene.tsx` | Procedural Three.js worlds and camera behavior |
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
- Output directory: `out`
- Environment variables: none

After linking the repository, Vercel can deploy updates pushed to `main` and create previews for pull requests. A production URL should be added here once the deployment is verified.

## Accessibility and rendering

The portfolio supports narrow screens, readable content overlays, native project dialogs, keyboard navigation, and reduced motion. The animated scene uses a single WebGL renderer. Browsers without WebGL receive themed artwork while the portfolio content remains available.

The scene should also be reviewed on a WebGL-capable device when changing geometry or animation. The available browser used during development had WebGL disabled, so its visual checks covered the illustrated fallback and interface.

## Assets and content

Sky-world and world-identity illustrations were AI-generated for this portfolio. The procedural 3D scene is implemented in code. Profile content is curated from material supplied by Monasri; raw profile documents and internal hosting configuration are excluded from this repository.

## Connect

- [GitHub — Monasri29-hub](https://github.com/Monasri29-hub)
- [LinkedIn — Kundeti Monasri](https://www.linkedin.com/in/kundeti-monasri-3650ba326)
