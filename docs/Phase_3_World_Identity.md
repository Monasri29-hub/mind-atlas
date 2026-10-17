# Phase 3 — Distinct world landmarks

Date: 17 October 2026

## Outcome

Rebuild the architectural identity of all eight existing worlds while retaining the shared sky environment from Phase 2. Keep the single Projects island, the five existing case studies, the nine route connections, and the accessible HTML portfolio content.

## World-by-world changes

| World | Landmark and spatial identity | Supporting details |
| --- | --- | --- |
| Psychology | A recognizable human profile made from 25 solid pearl/lavender contour ribbons | Neural connections inside the open sculpture, three flowing arches, a larger shallow pool, four memory fragments, flowering garden canopies, emotion lights |
| AI | A suspended faceted inference engine inside three tilted gimbals, framed by split tapered towers | Recessed glazing, vertical data accents, distinct input/model/evaluate/output stations, a separate knowledge graph |
| Projects | One open exhibition island with five purpose-specific bays and a shared curved gallery spine | A room scene, a gesture-capture arch, folded news forms, a reasoning/evaluation frame, an artifact portico, shared folio courtyard |
| Culture | Broad interwoven pearl, clay, and brass pavilion bands above a warm amphitheatre | Flat stepped seating, a woven connection lantern, art folios, spatial music notation, garden edges |
| Hackathons | A rising asymmetrical fabrication truss with a suspended engineered prototype | Four rotor units, visible bracing, ideate/build/iterate benches, prototype parts, supply modules, challenge board, floor lane marks |
| Research | An open-slit observatory paired with a planar celestial knowledge atlas | Visible telescope barrel, calibrated atlas ticks, sparse constellations, reading desks and books, quiet foreground space |
| Technology | Cantilevered data/model/application layers around an exposed service spine | Database forms, processor modules, interface screens, visible inter-layer conduits, a compact modular tool bus |
| Future | Broad solid crescent steps and a supported stylized Earth, with open sky beyond | Three aspirational light routes with dashed continuations, separate goal labels, restrained planting |

The project bays are exhibits on one continuous floor; they are not separate floating islands. The prototype, star maps, model stations, and routes are symbolic architecture. They do not assert additional projects, published papers, physical hardware achievements, or completed future destinations.

## Geometry and materials

`WorldForms.ts` adds two shared construction tools:

- Solid swept ribbons with real width, thickness, end caps, and computed normals. Used differently for the profile sculpture, garden arches, AI support arms, gallery spine, and cultural weaving.
- Closed annular terrace segments with flat tops, risers, and soffits. Used for the amphitheatre, research terrace, and future crescent.

Worlds share a pearl/stone material family but vary accent materials, proportions, density, and layout. Psychology uses lavender and rose; AI uses cyan and cool metal; Culture uses clay and brass; Hackathons uses coral and dark workshop surfaces; Research stays sparse; Technology exposes teal infrastructure; Future uses pale gold and blue.

Tree geometry now uses actual branch supports and clustered instanced canopies rather than two large canopy spheres. Static architecture still batches by material, while animated objects and project selection remain independent.

## Verification

```bash
npm run typecheck
npm run verify:worlds
npm run verify:navigation
npm run verify:environment
npm run build
```

`verify:worlds` now additionally checks that ribbon and terrace faces are nondegenerate, closed, and consistently wound. Each of the five project exhibits must be selectable from an actual chapter camera against the complete gallery, so another exhibit cannot hide every selection surface.

The existing geometry tests retain finite geometry, batching bounds, animation ownership, three chapter aspect ratios, five overview sizes, route connectivity, separated map markers, and the exact five project IDs. Camera checks retain the 24 instant-navigation and inspected-view handoffs. Phase 2 environment checks still apply.

The nine transparent fallback images are regenerated from the revised geometry. CPU SVG rendering is used to review the eight silhouettes and overview composition. It does not reproduce WebGL depth sorting, PBR lighting, shadow maps, cloud sprites, or live interaction. In particular, transparent materials and overlapping surfaces can look different in these CPU renders.

Interactive GPU/browser QA is unavailable in the implementation environment. A live browser review remains necessary for final visual acceptance, touch behavior, and sustained performance. These procedural worlds interpret the art direction; they are not claimed to be pixel-identical to the generated Phase 1 drawings.

## Next phase

Phase 4 redesigns the HTML reading experience: stronger introductory hierarchy, concise project summaries, contribution and evidence blocks, clearer section titles, readable skill and community content, and scan-friendly actions. Keep important facts in those HTML surfaces rather than relying on small text inside the 3D scene.
