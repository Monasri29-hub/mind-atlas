# Live 3D restoration and world refinement

17 October 2026

The illustrated browsing experiment was rejected by Mona. It is superseded by this implementation: the actual Three.js floating universe is the primary experience again. There are no island image cards, image-atlas sprites, or separate picture-led browsing mode. `WorldVisual.tsx` has been removed. Existing concept art remains a design reference, not the scene.

## Layout inside the 3D experience

One renderer stays mounted while visitors read, scroll, change worlds, and enter/leave orbit control. The camera travels between the eight existing modeled destinations. All five projects remain together in the Project Atelier.

The scene and reading region have separate viewport rectangles rather than allowing long panels to cross a fixed canvas:

- Desktop: scrollable reading rail on the left; live 3D and a compact world toolbar on the right.
- Phone/tablet portrait: live 3D above, toolbar in its own row, scrollable reading region below, destination navigator at the bottom.
- Small-screen landscape at 560px and above: side-by-side regions preserve useful reading height.
- Orbit mode: the same renderer expands, the reading rail becomes inert/hidden, and Read details restores it. Reset and optional button-based orbit/zoom remain available.

Scrolling the reading region changes the active world. Wheel gestures over the scene and vertical touch drags in browsing mode forward to the reading region. Orbit mode enables the actual drag/pinch camera controls. Direct navigation, URL fragments, keyboard focus, and return actions target the reading region. The reader is a named keyboard-focusable main landmark.

Loading and WebGL failure states use text and a retry action, without substituting island illustrations. The readable portfolio remains available when rendering fails. The sky image is used only as atmosphere/reflection texture; all islands, buildings, landmarks, routes, and added details are mesh geometry.

## Added modeling

`WorldRefinement.ts` adds world-specific geometry before material batching:

| World | Added mesh details |
| --- | --- |
| Psychology | Reflection ripples, spatial memory lattices, flowing thought-path edges |
| AI | Volumetric interface panels, status nodes, routed inference channels, calibrated core plinth |
| Projects | Connected five-bay pergola ribs, structural posts, shared exhibition path lighting |
| Culture | Brass global armillary and acoustic details around the woven arts pavilion |
| Hackathons | Two articulated fabrication arms with joints/grippers and illuminated test pads |
| Research | Observatory dome ribs and a three-dimensional knowledge instrument |
| Technology | Service ports, module sockets, and layered cable routes |
| Future | Geographic meridians and three open destination threshold arches |

These objects are symbolic environment details; they do not add portfolio achievements or project claims. Existing factual content remains available for the later information pass.

## Verification

TypeScript, production build, actual geometry framing/batching/project-picking checks, camera handoffs, bounded view controls, frame lifecycle, and environment checks run before release. Geometry tests additionally require purpose-specific mesh refinement groups in all eight worlds and reject flat image planes in those additions.

Static component checks verify the live-stage shell, nine readable chapters, no picture cards, normal/orbit/loading/failure controls, and unchanged project content. Live browser and GPU/device review is unavailable in this environment; these checks are not a claim of exact visual acceptance on every device.
