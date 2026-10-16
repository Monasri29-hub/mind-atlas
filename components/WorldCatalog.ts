/** Scene layout and camera framing shared by the renderer and geometry checks. */
export const destinations = [
  { id: 'psychology', name: 'THE MIND GARDEN', p: [-18, 1, 12], r: 5.5 },
  { id: 'ai', name: 'INTELLIGENCE NEXUS', p: [4, 3, -6], r: 6.5 },
  { id: 'projects', name: 'THE PROJECT ATELIER', p: [20, 0, 18], r: 7.5 },
  { id: 'culture', name: 'THE CULTURAL CROSSROADS', p: [-24, 4, -17], r: 5 },
  { id: 'hackathons', name: 'THE INVENTION YARD', p: [29, 5, -10], r: 5.6 },
  { id: 'research', name: 'THE OBSERVATORY', p: [0, 7, -35], r: 5.2 },
  { id: 'technology', name: 'THE SYSTEMS NEXUS', p: [-30, 2, -39], r: 5.2 },
  { id: 'future', name: 'THE OPEN HORIZON', p: [24, 9, -45], r: 5.6 },
];
export const connections = [[0, 1], [1, 2], [2, 0], [0, 3], [1, 4], [3, 5], [5, 6], [5, 7], [4, 7]];
export const overview = { x: 65, y: 48, z: 87, lx: 0, ly: 0, lz: -13 };
export function worldView(id: string, aspect: number) {
  const d = destinations.find(d => d.id === id);
  if (!d) return overview;
  const distance = id === 'projects' ? 1.18 : id === 'ai' ? 1.3 : id === 'future' ? 1.16 : 1.08;
  return {
    x: d.p[0] + 12 * distance,
    y: d.p[1] + (id === 'ai' ? 11 : 9) * distance,
    z: d.p[2] + (aspect < 1 ? 34 : 28) * distance,
    lx: d.p[0], ly: d.p[1] + 1.2, lz: d.p[2],
  };
}
