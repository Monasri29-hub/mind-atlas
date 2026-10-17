# Responsive presentation repair

**Superseded:** Mona rejected the illustrated browsing approach. The live Three.js experience has been restored and refined; see [Live 3D restoration](Live_3D_Restoration.md). This document records the removed experiment, not the current product.

17 October 2026

## Why the previous arrangement changed

The fixed mobile canvas and fixed controls competed with long scrolling reading panels. Hiding controls when panels intersected the stage did not create a stable page composition. The scene and text also used different alignment rules across breakpoints.

Normal browsing now uses nine document-flow sections: overview plus eight worlds. Every section owns its world visual, caption, explicit 3D entry, and reading panel. There is no fixed canvas or scene toolbar over reading content.

## Current composition

- Above 1100px: a 400px maximum reading column and a flexible world column, with shared gutters and a consistent gap. World figures can remain sticky while long content scrolls, and their art fits the available viewport height.
- At 1100px and below: artwork, caption/action, and reading panel stack naturally, using the same centered width. They scroll together. Short landscapes reduce artwork size without cropping its island.
- At 640px and below: smaller gutters, fluid titles, single-column contact/workflow blocks, and a one-column scrolling world directory.
- At 360px and below: the artwork action takes its own full-width row.
- Header/footer, safe areas, focus states, ordinary browser zoom, and previous/current/next navigation remain available.

World topics carry their own accent colors within each section, rather than changing all visible cards to the currently active world's theme. Text, cards, buttons, and captions share the same horizontal alignment. Existing project facts and source content remain working content for a later information pass; no additional personal claims were added.

## Visual direction and 3D

The illustrated browsing view uses the original cinematic world-identity artwork, with CSS selecting the seven relevant cells directly from `public/world-identities.webp`. The old Projects cell is deliberately not used: it depicted separate islands. The new `public/project-atelier-art.webp` shows one continuous island with five exhibits. The overview uses the existing expansive `public/sky-world.webp` artwork.

The original procedural Three.js worlds remain available through each **Explore in 3D** action and the world directory. This is an explicit viewer, separate from the illustrated page. It is not a claim that procedural geometry reproduces the illustration pixel for pixel. The viewer reserves space for its return/reset actions; optional orbit/zoom buttons sit inside a collapsed **Adjust view** disclosure. Header/footer navigation remains available, and world navigation retains the active 3D session. Escape and Return to portfolio restore the selected chapter. Loading and failure states retain matching artwork and an enabled return action.

This intentionally replaces automatic camera movement during ordinary page scrolling with a consistent illustrated reading composition. Cinematic camera travel still operates between destinations inside the 3D viewer. The GPU scene mounts only when requested.

## New artwork record

Asset: `public/project-atelier-art.webp`.

Generated with the built-in image-generation tool, then encoded as WebP for the website. Original generated PNG remains separate. Final prompt:

> Use case: stylized-concept. Asset type: production square world illustration for Mind Atlas portfolio website. Create a single sophisticated cinematic floating PROJECT ATELIER island above a soft white cloud ocean in an airy blue sky. Match a premium realistic architectural visualization: natural layered pale rock underside with moss, hanging greenery, finely detailed pearl stone terraces, warm sun upper left, cool blue sky fill, cyan and restrained lavender light accents. One SINGLE continuous broad floating island, no separate satellite islands. A beautifully curated open-air exhibition garden containing FIVE distinct small interconnected exhibits on the SAME floor: left an elegant furnished room pavilion with a rose/lavender sculptural wall; then an expressive articulated hand sculpture in a slim cyan scanner arch; center folded luminous paper/news forms over a refined desk; then an airy geometric reasoning/knowledge graph sculpture with gold and cyan connections; right an artifact gallery with ceramic vessels and an elegant crescent frame. All five bays share ONE graceful semicircular pergola and continuous curved pedestrian paths with planted garden terraces. Slightly elevated three-quarter view, visible full island and entire rocky underside, subject fills around 78 percent of square frame with generous blue sky margins. Delicate thin cyan bridge exiting to the right edge implies a connected universe. Elegant, advanced, surreal, professional, physically credible materials, subtle contact shadows, rich detail and calm cinematic depth. No UI, no typography, no labels, no watermarks, no logos, no poster layout. No low-poly style, no generic repeated towers, no excessive neon, no dark nighttime atmosphere, no detached project islands.

## Verification and limits

TypeScript, production export, runtime/camera/geometry/environment checks, and static HTML/component checks cover the implementation. The static UI checks verify nine owned world visuals, nine explicit 3D entries, the absence of 3D controls in normal reading HTML, complete project content, valid navigation/ARIA references, inert inspection content, collapsed view adjustments, and available return/retry states.

Interactive browser tooling is unavailable in this environment. These checks do not certify browser layout, touch gestures, WebGL appearance, or a pixel-identical result across phones, tablets, and laptops. Real device/browser review remains required for that acceptance.
