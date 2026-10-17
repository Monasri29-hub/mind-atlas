# Phase 5 — Cinematic travel and interaction

Date: 17 October 2026

## Outcome

World travel has one destination at a time. A direct navigation link moves the document immediately to its content and animates the camera to that world. Ordinary page scrolling still changes worlds as chapters cross the upper quarter of the viewport. Visitors can read throughout a flight; there is no mandatory introduction or navigation delay.

## Arrival direction

The camera still fits actual geometry and instance transforms for the available scene aspect ratio. Each landmark now has a distinct front-facing arrival direction rather than sharing a single angle.

| World | Arrival emphasis |
| --- | --- |
| Psychology | Shallow, almost frontal view of the mind silhouette |
| AI | Oblique view separating the towers, core, and pipeline |
| Projects | Elevated, almost frontal view across all five exhibit bays |
| Culture | Left-hand approach across woven forms and the amphitheatre |
| Hackathons | More angled, elevated view across the gantry and workstations |
| Research | Quiet left-hand view of the observatory and knowledge atlas |
| Technology | Elevated oblique view exposing the modular layers |
| Future | Open, almost frontal view of Earth and the destination routes |

The eight illustrated fallback views are regenerated from those camera presets. The overview composition is unchanged.

## Movement and handoffs

- GSAP eases a normalized flight progress value. The camera pivot translates while its viewing arm rotates and gently pulls back. This avoids a straight-line interpolation collapsing into the pivot when travelling from an inspected rear view.
- Duration scales with distance, bounded between 0.65 and 1.5 seconds.
- A new destination starts from the actual rendered camera and current pivot. Previous flights are cancelled, so rapid navigation retargets immediately.
- Entering inspection preserves the current pose. Returning to the portfolio restores its fitted reading view.
- Dragging interrupts an active inspection flight. Reset view returns to the current world's fitted arrival view.
- Inspection holds document scrolling. Resizing updates the canvas and aspect ratio while preserving a manually inspected eye and pivot; reading mode refits its landmark.
- Pointer parallax eases toward its target and settles when the pointer leaves. Touchable devices do not produce pointer parallax. Selectable 3D objects expose a pointer cursor, and clicks during flights are ignored to avoid selecting moving geometry accidentally.
- Reduced motion uses immediate camera/pivot updates and disables environmental motion and parallax.

## Navigation and feedback

All existing internal destination anchors share one delegated navigation handler. Modified clicks, external links, and downloads keep their native behavior. Header, directory, footer, previous/next, and content links leave inspection and focus the destination section. Inspector destination buttons retain inspection. Direct travel records a URL fragment; fragment navigation and browser history restore the destination, including the initial overview URL.

The scene heading shows a travelling state and a polite status announcement. The world directory returns focus to the actual opening control on Escape, including the mobile footer control. Project content and factual claims are unchanged. All five projects remain in one island.

## Verification

```bash
npm run typecheck
npm run verify:navigation
npm run verify:worlds
npm run verify:environment
npm run build
```

The navigation suite covers 24 preset/orbit handoffs using real Three.js OrbitControls without a DOM element. Sixteen additional flight combinations include opposite viewing arms, exact endpoints, finite and continuous intermediate positions, pivot clearance, interrupted travel, and bounded duration. Geometry checks cover all eight arrival fits across three aspect ratios, project picking, and overview marker placement. Static HTML and component rendering checks cover the existing content and links.

CPU-rendered fallback images verify silhouettes and composition, not WebGL material rendering. Browser focus, history behavior, touch gestures, actual camera motion, visual comfort, and GPU performance still require live browser/device review. Phase 6 addresses device-specific refinement and accessibility; Phase 7 verifies the complete integrated experience.
