# Phase 6 — Mobile, accessibility, and rendering refinement

Date: 17 October 2026

## Result

The eight-world portfolio now supports button-operated 3D viewing, persistent motion/view preferences, a deliberately lighter illustrated mode, smaller mobile stage dimensions, safe-area spacing, and a rendering loop that can sleep. All five projects remain together in the Project Atelier; factual portfolio content and landmark geometry are unchanged.

## Mobile reading and layout

- The mobile sky stage uses `clamp(180px, 34svh, 320px)`. Short viewports at 960px or below use `clamp(120px, 28svh, 180px)`.
- Header/footer sizing includes top/bottom safe-area insets. Navigation and reading surfaces account for horizontal insets, and viewport metadata permits ordinary browser zoom.
- When a scrolling reading panel covers the mobile stage, its scene controls are hidden so they cannot obscure the text. Rendering pauses during this reading state. The world directory retains an **Explore current world in 3D** action.
- Inspector controls have a bounded, scrollable surface on small screens. Destination buttons remain in their separate bottom row.
- Contact actions stack on narrow screens; event metadata wraps. Scrollbar space is reserved to reduce layout movement when inspection or dialogs lock page scrolling.
- Numbered markers prefer vertical separation, then try adjacent columns when a short stage cannot accommodate them. Bounds, 44px targets, toolbar avoidance, and inter-marker spacing remain enforced; all destinations are also available in HTML navigation.

## Keyboard and assistive access

- Six named buttons provide orbit left/right, look up/down, and zoom in/out. They operate on the same pivot and distance/polar bounds as drag controls; Reset view remains available.
- During inspection, the reading main is `inert` and hidden from the accessibility tree. Returning to the portfolio or pressing Escape reveals and focuses the selected chapter after React commits the change.
- Entering inspection from the directory moves focus to its persistent return control. Tab leaving the nonmodal directory dismisses it; Escape still restores the opening control.
- Case-study dialogs explicitly identify the close button as their initial focus target. Native modal behavior and existing opener restoration are preserved.
- Named controls, polite travel status, 44px minimum scene-button targets, chapter focus treatment, and forced-colors focus/current-location styling supplement the existing readable surfaces and checked theme contrast.

These are implementation improvements, not a claim of complete WCAG conformance. Actual keyboard focus delivery, screen-reader output, zoom/reflow, forced-colors rendering, touch gestures, and mobile scrolling still need real browser/device review.

## Preferences and illustrated view

The world directory exposes **Reduce motion** and **Illustrated view**. Choices persist locally when browser storage is available; blocked storage does not prevent the controls from working in the current session. A stored motion choice takes precedence over the operating-system preference. Without a stored choice, reduced motion follows the system.

When the browser exposes an active Save-Data preference and no explicit view choice exists, the portfolio starts in illustrated view. Visitors can enable 3D. Illustrated view unmounts the GPU scene, retains the matching world still and all HTML content/navigation, and exposes an Enable 3D action. A WebGL failure retains the illustrated fallback and offers Retry 3D. The scene mounts only after initial preferences have been read.

## Rendering lifecycle and budgets

| Mode | Maximum framebuffer pixels | Maximum pixel ratio | Render limit |
| --- | --- | --- | --- |
| Desktop | 2,000,000 | 1.65 | 45 fps |
| Mobile, coarse pointer, Save-Data, or reported memory at most 4 GB | 900,000 | 1.25 | 30 fps |

The pixel ratio also respects native device ratio and the pixel budget for the current CSS dimensions. Reported device memory and Save-Data are optional hints, not hardware detection guarantees. Existing limited mode disables shadow maps/distant settlements and halves cloud banks.

The frame driver coalesces wakeups into one pending animation frame. Reduced-motion scenes sleep when idle and wake for navigation, resize, pointer/control input, texture loading, and view commands. The scene stops requesting frames while the tab is hidden, a directory/dialog is open, or a mobile reading panel covers its stage. Active camera tweens pause with it. The renderer resumes on return; scene animation time advances only on rendered updates.

The framing cache is capped at 36 entries, and map-marker projection/layout runs only for the overview. Cleanup cancels pending frames, observers, listeners, tweens, controls, and GPU resources. These limits reduce scheduled work; no measured device FPS or battery savings are claimed.

## Verification

```bash
npm run typecheck
npm run verify:runtime
npm run verify:navigation
npm run verify:worlds
npm run verify:environment
npm run build
```

`verify:runtime` is included in GitHub Actions. It checks frame wakeup coalescing, idle sleep, cancellation, resume/disposal, 42 viewport/DPI/device-budget combinations, and 600 repeated button-driven camera adjustments using real OrbitControls math without a DOM element. The geometry suite now projects actual instance transforms and tests individual framing at six aspect ratios plus overview geometry/markers at seven stage sizes.

Additional static HTML and component-rendering checks cover nine reading panels, five project cards and complete dialogs, valid links/headings/ARIA references, contrast pairs, inert inspection content, six named view buttons, illustrated/retry states, hidden covered controls, and zoom-permitting viewport metadata.

Interactive browser QA is unavailable in this environment. The next integrated verification phase should review desktop/tablet/phone, portrait/landscape, long project scrolling, keyboard-only operation, screen-reader behavior, history navigation, saved preferences, Save-Data, WebGL failure/retry, and pause/resume. Performance acceptance requires actual device profiling rather than inferring frame rate from these budgets.
