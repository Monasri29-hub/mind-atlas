import assert from 'node:assert/strict';
import * as T from 'three';
import { destinations, connections, worldView } from '../components/WorldCatalog.ts';
import * as architecture from '../components/WorldArchitecture.ts';
import { batchWorld } from '../components/SceneBatch.ts';

// The geometry is renderer-independent. Labels receive a minimal offscreen canvas.
globalThis.document = { createElement: () => ({ width: 512, height: 112, getContext: () => ({ fillRect() {}, fillText() {} }) }) };
const builders = [architecture.buildMindGarden, architecture.buildIntelligenceNexus, architecture.buildProjectAtelier, architecture.buildCulturalCrossroads, architecture.buildInventionYard, architecture.buildObservatory, architecture.buildSystemsNexus, architecture.buildOpenHorizon];
assert.equal(new Set(destinations.map(d => d.id)).size, 8, 'Eight distinct world IDs');
const visited = new Set([0]);
for (let pass = 0; pass < destinations.length; pass++) for (const [a, b] of connections) {
  assert(destinations[a] && destinations[b], 'Routes must terminate at real worlds');
  if (visited.has(a)) visited.add(b);
  if (visited.has(b)) visited.add(a);
}
assert.equal(visited.size, 8, 'Every world must be reachable through the sky network');
const expectedProjects = ['emotispace', 'signspell', 'news', 'benchmark', 'culture'];
const ray = new T.Raycaster();
for (const [i, d] of destinations.entries()) {
  const group = new T.Group(); group.position.set(...d.p);
  architecture.buildFloatingFoundation(group, d.r, d.id === 'projects' ? .72 : d.id === 'psychology' ? .8 : 1, i * 110 + 4);
  const built = builders[i](group); group.updateMatrixWorld(true);
  const beforeBounds = new T.Box3().setFromObject(group, true);
  let originalObjects = 0;
  group.traverse(object => { if (object.geometry) originalObjects++; });
  batchWorld(group, built);
  const afterBounds = new T.Box3().setFromObject(group, true);
  assert(beforeBounds.min.distanceTo(afterBounds.min) < .001 && beforeBounds.max.distanceTo(afterBounds.max) < .001, `${d.id}: batching preserves world bounds`);
  let meshes = 0, triangles = 0;
  group.traverse(object => {
    if (!object.geometry) return;
    const position = object.geometry.getAttribute('position');
    assert(position && [...position.array].every(Number.isFinite), `${d.id}: finite geometry`);
    triangles += object.geometry.index ? object.geometry.index.count / 3 : position.count / 3;
    meshes++;
  });
  for (const a of built.animations) {
    let ancestor = a.object;
    while (ancestor && ancestor !== group) ancestor = ancestor.parent;
    assert.equal(ancestor, group, `${d.id}: animation target belongs to the world`);
    assert(Number.isFinite(a.speed));
  }
  assert.deepEqual(built.exhibits.map(e => e.userData.project), d.id === 'projects' ? expectedProjects : [], `${d.id}: one world holds all five project exhibits`);
  for (const exhibit of built.exhibits) {
    const bounds = new T.Box3().setFromObject(exhibit), center = bounds.getCenter(new T.Vector3());
    ray.set(center.clone().add(new T.Vector3(0, 0, 10)), new T.Vector3(0, 0, -1));
    assert(ray.intersectObject(exhibit, true).length > 0, `${exhibit.userData.project}: selectable exhibit`);
  }
  for (const aspect of [.72, 1.3, 2.5]) {
    const view = worldView(d.id, aspect), camera = new T.PerspectiveCamera(40, aspect, .2, 350);
    camera.position.set(view.x, view.y, view.z); camera.lookAt(view.lx, view.ly, view.lz); camera.updateMatrixWorld(true);
    let extent = 0;
    group.traverse(object => {
      if (!object.geometry) return;
      const positions = object.geometry.getAttribute('position'), p = new T.Vector3();
      for (let index = 0; index < positions.count; index++) {
        p.fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld).project(camera);
        assert(p.z > -1 && p.z < 1, `${d.id}: visible depth`);
        extent = Math.max(extent, Math.abs(p.x), Math.abs(p.y));
      }
    });
    assert(extent < 1.04, `${d.id}: chapter framing clipped at aspect ${aspect} (${extent.toFixed(3)})`);
  }
  console.log(`${d.id}: ${originalObjects} → ${meshes} geometry objects, ${Math.round(triangles)} triangles; framing and selection OK`);
}
console.log('All eight worlds are connected; all five projects remain in one gallery.');
