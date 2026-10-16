import assert from 'node:assert/strict';
import * as T from 'three';
import { destinations, connections, SCENE_FOV, placeMarkers } from '../components/WorldCatalog.ts';
import * as architecture from '../components/WorldArchitecture.ts';
import { batchWorld } from '../components/SceneBatch.ts';
import { frameObjects } from '../components/SceneFraming.ts';

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
const allWorlds=[];
for (const [i, d] of destinations.entries()) {
  const group = new T.Group(); group.position.set(...d.p);
  architecture.buildFloatingFoundation(group, d.r, d.id === 'projects' ? .72 : d.id === 'psychology' ? .8 : 1, i * 110 + 4);
  const built = builders[i](group); architecture.finishWorld(group,d.id,d.r); group.updateMatrixWorld(true);
  allWorlds.push(group);
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
    const view = frameObjects([group],d.id,aspect), camera = new T.PerspectiveCamera(SCENE_FOV, aspect, .2, 400);
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
for(const [width,height]of [[1363,860],[929,628],[666,628],[390,422],[360,320]]){
  const camera=new T.PerspectiveCamera(SCENE_FOV,width/height,.2,400),view=frameObjects(allWorlds,'home',width/height);
  camera.position.set(view.x,view.y,view.z);camera.lookAt(view.lx,view.ly,view.lz);camera.updateMatrixWorld(true);
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  allWorlds.forEach(group=>group.traverse(object=>{
    if(!object.geometry)return;const positions=object.geometry.getAttribute('position'),p=new T.Vector3();
    for(let i=0;i<positions.count;i++){
      p.fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld).project(camera);
      assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,'Overview keeps every island in frame');
      minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
    }
  }));
  assert(Math.max(maxX-minX,maxY-minY)>1.25,'Overview uses the available frame');
  const obstacle={left:width-300,top:12,right:width-12,bottom:128};
  const points=destinations.map(d=>{const p=new T.Vector3(d.p[0],d.p[1]-d.r*.18,d.p[2]+d.r*d.squash*.88).project(camera);return {x:(p.x*.5+.5)*width,y:(-p.y*.5+.5)*height,visible:true}});
  const markers=placeMarkers(points,width,height,[obstacle]);
  assert(markers.filter(m=>m.visible).length>=6,'Compact views retain at least six map beacons');
  for(const [i,m]of markers.entries())if(m.visible){
    assert(m.x>=25&&m.x<=width-25&&m.y>=25&&m.y<=height-25,'Marker stays within the scene');
    assert(m.x+20<obstacle.left||m.x-20>obstacle.right||m.y+20<obstacle.top||m.y-20>obstacle.bottom,'Marker clears scene controls');
    for(const other of markers.slice(i+1))if(other.visible)assert(Math.hypot(m.x-other.x,m.y-other.y)>=51,'Numbered markers do not overlap');
  }
  console.log(`Overview ${width}×${height}: all worlds framed; ${markers.filter(m=>m.visible).length} separated markers`);
}
