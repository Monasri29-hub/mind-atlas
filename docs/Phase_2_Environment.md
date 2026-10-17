# Phase 2 — Shared sky environment and island foundations

Date: 17 October 2026

## Scope

Implement the shared environment layer specified by Phase 1: believable floating ground, atmospheric separation, continuous sky connections, and a restrained daylight palette. Keep all eight existing portfolio destinations and the single five-project gallery.

The Phase 1 drawings remain the visual target. Detailed human-profile ribbons, redesigned individual landmarks, editorial panel changes, and new mobile navigation are later phases. This pass does not claim to match the complete concept drawing.

## Environment changes

- Closed cliff meshes with 64 radial samples and 12 geological levels, irregular shelves, and an offset taper.
- Per-vertex rock color with depth variation and exposed moss patches.
- Embedded outcrops instead of detached cone spikes.
- Planted cliff edges with instanced leaves and merged trailing stems.
- A shaded procedural cloud texture shared across near and horizon cloud banks.
- Soft horizontal cloud drift, stopped by reduced-motion mode.
- Background settlements with atmospheric fog; they are scenery, not extra portfolio worlds or navigation bounds.
- Warm directional key light, cool hemisphere fill, subtle sky reflection, and a cool rim.
- One cached 2048px directional shadow map on desktop. Its bounds follow the active chapter; it refreshes on chapter/viewport changes rather than every animated frame.
- Existing continuous sky artwork remains present during loading and after WebGL is ready.

## Connection changes

Nine connections still join the same eight worlds. Six are walkable railed sky bridges; three are slim energy routes.

Arrival calculations account for elliptical Psychology and Projects footprints and rectangular Hackathon and Technology decks. Each route meets a landing sill with two small guide lights. The skywalks use flat deck geometry rather than tubes. Transit signals move separately from the static bridge batches.

Static transit uses 11 mesh draws. This count excludes the nine independent moving signals and the world architecture.

## Device and accessibility behavior

| Mode | Environment behavior |
| --- | --- |
| Desktop | 38 cloud banks; distant settlements; focused shadow map; existing DPR cap 1.65 and 45fps cap |
| Mobile / coarse pointer | 19 cloud banks; distant settlements hidden; shadow map disabled; existing DPR cap 1.25 and 30fps cap |
| Reduced motion | No decorative cloud drift, transit movement, or world bobbing; direct chapter framing remains available |
| Loading / WebGL failure | Updated transparent geometry stills over the persistent sky; readable HTML content remains available |

These are configured limits, not measured device frame-rate results. Shadow maps are deliberately static between chapter changes, so tiny animated details do not receive continuously refreshed shadows.

## Verification

Run from the repository root:

```bash
npm run typecheck
npm run verify:worlds
npm run verify:navigation
npm run verify:environment
npm run build
```

The environment checks verify finite geometry, nondegenerate cliff faces, a closed shell, outward caps, positive instance transforms, route endpoints inside deck footprints, the transit batch budget, mobile quality switching, and reduced-motion behavior.

The existing checks cover all eight world camera frames, five overview sizes, all five selectable project exhibits, route connectivity, and 24 camera/orbit handoffs.

All nine transparent fallback stills are rendered from the changed Three.js geometry. CPU SVG rendering is a geometry/composition aid; it does not reproduce WebGL materials, shadow maps, or cloud sprites and is not a browser screenshot.

Interactive browser/GPU review is unavailable in the implementation environment. Inspect the deployed portfolio on a WebGL-capable desktop and phone to assess lighting, cloud overlap, shadow edges, and sustained device performance before treating visual acceptance as complete.

## Next phase

Phase 3 develops each world's primary landmark, architecture, and silhouette individually. Start with the Psychology profile sculpture and flowing terraces, then carry the established environment quality into the remaining seven worlds.
