import assert from 'node:assert/strict';
import * as T from 'three';
import { destinations, connections, SCENE_FOV, placeMarkers } from '../components/WorldCatalog.ts';
import * as architecture from '../components/WorldArchitecture.ts';
import { batchWorld } from '../components/SceneBatch.ts';
import { frameObjects } from '../components/SceneFraming.ts';
import {solidRibbon,arcTerrace} from '../components/WorldForms.ts';

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
// Check closed architectural bands and terraces before they are batched into the worlds.
const forms=new T.Group(),material=new T.MeshBasicMaterial();
solidRibbon(forms,[new T.Vector3(-1,0,0),new T.Vector3(0,2,0),new T.Vector3(1,0,0)],.2,.08,material,32,new T.Vector3(0,0,1));
arcTerrace(forms,1,2,.3,.15,.1,Math.PI*1.4,material,32);
forms.traverse(o=>{if(!o.geometry)return;const g=o.geometry,p=g.getAttribute('position'),edges=new Map();
 for(let i=0;i<g.index.count;i+=3){const triangle=[g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2)];
  const a=new T.Vector3().fromBufferAttribute(p,triangle[0]),b=new T.Vector3().fromBufferAttribute(p,triangle[1]),c=new T.Vector3().fromBufferAttribute(p,triangle[2]);
  assert(b.sub(a).cross(c.sub(a)).lengthSq()>1e-10,'Architectural forms have no degenerate faces');
  for(let j=0;j<3;j++){const a=triangle[j],b=triangle[(j+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(':');const edge=edges.get(key)??{count:0,direction:0};edge.count++;edge.direction+=a<b?1:-1;edges.set(key,edge)}
 }
 assert([...edges.values()].every(e=>e.count===2&&e.direction===0),'Architectural forms are closed with consistent winding');g.dispose();
});material.dispose();
const allWorlds=[];
function eachVertex(group,visit){
 const instance=new T.Matrix4(),matrix=new T.Matrix4(),point=new T.Vector3();
 group.updateWorldMatrix(true,true);group.traverse(object=>{
  if(!object.geometry)return;const positions=object.geometry.getAttribute('position');
  for(let i=0;i<(object instanceof T.InstancedMesh?object.count:1);i++){
   if(object instanceof T.InstancedMesh){object.getMatrixAt(i,instance);matrix.multiplyMatrices(object.matrixWorld,instance)}else matrix.copy(object.matrixWorld);
   for(let j=0;j<positions.count;j++)visit(point.fromBufferAttribute(positions,j).applyMatrix4(matrix));
  }
 });
}
for (const [i, d] of destinations.entries()) {
  const group = new T.Group(); group.position.set(...d.p);
  architecture.buildFloatingFoundation(group, d.r, d.id === 'projects' ? .72 : d.id === 'psychology' ? .8 : 1, i * 110 + 4);
  const built = builders[i](group); architecture.finishWorld(group,d.id,d.r); group.updateMatrixWorld(true);
  const refinement=group.children.find(child=>child.userData.modeledDetail===d.id);
  assert(refinement&&refinement.children.length>=3,`${d.id}: has purpose-specific modeled refinements`);
  refinement.traverse(object=>{if(object.geometry)assert(!(object.geometry instanceof T.PlaneGeometry),`${d.id}: refinement uses 3D mesh geometry, not island pictures`)});
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
  if(built.exhibits.length){
   const view=frameObjects([group],d.id,1.3),camera=new T.PerspectiveCamera(SCENE_FOV,1.3,.2,400);camera.position.set(view.x,view.y,view.z);camera.lookAt(view.lx,view.ly,view.lz);camera.updateMatrixWorld(true);
   for(const exhibit of built.exhibits){
    // Open pavilions have empty bounding-box centers. Test actual visible surfaces through the real chapter camera.
    let reachable=false;exhibit.traverse(o=>{if(reachable||!o.geometry)return;const p=o.geometry.getAttribute('position');
     for(let j=0;j<p.count&&!reachable;j+=Math.max(1,Math.floor(p.count/12))){
      const point=new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(o.matrixWorld).project(camera);ray.setFromCamera(new T.Vector2(point.x,point.y),camera);
      const hit=ray.intersectObject(group,true)[0];let target=hit?.object;while(target&&!target.userData.project)target=target.parent;
      reachable=target?.userData.project===exhibit.userData.project;
     }
    });assert(reachable,`${exhibit.userData.project}: selectable from the actual chapter camera without another exhibit blocking it`);
   }
  }
  for (const aspect of [.6, .72, 1.3, 2.5, 4.5, 7]) {
    const view = frameObjects([group],d.id,aspect), camera = new T.PerspectiveCamera(SCENE_FOV, aspect, .2, 400);
    camera.position.set(view.x, view.y, view.z); camera.lookAt(view.lx, view.ly, view.lz); camera.updateMatrixWorld(true);
    let extent = 0;
    eachVertex(group,p=>{
        p.project(camera);
        assert(p.z > -1 && p.z < 1, `${d.id}: visible depth`);
        extent = Math.max(extent, Math.abs(p.x), Math.abs(p.y));
    });
    assert(extent < 1.04, `${d.id}: chapter framing clipped at aspect ${aspect} (${extent.toFixed(3)})`);
  }
  console.log(`${d.id}: ${originalObjects} → ${meshes} geometry objects, ${Math.round(triangles)} triangles; framing and selection OK`);
}
console.log('All eight worlds are connected; all five projects remain in one gallery.');
for(const [width,height]of [[1363,860],[929,628],[666,628],[390,422],[360,320],[390,265],[844,120]]){
  const camera=new T.PerspectiveCamera(SCENE_FOV,width/height,.2,400),view=frameObjects(allWorlds,'home',width/height);
  camera.position.set(view.x,view.y,view.z);camera.lookAt(view.lx,view.ly,view.lz);camera.updateMatrixWorld(true);
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  allWorlds.forEach(group=>eachVertex(group,p=>{
      p.project(camera);
      assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,'Overview keeps every island in frame');
      assert(p.z>-1&&p.z<1,'Overview keeps every island within camera depth');
      minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
  }));
  assert(Math.max(maxX-minX,maxY-minY)>1.25,'Overview uses the available frame');
  const obstacle={left:width-300,top:12,right:width-12,bottom:128};
  const points=destinations.map(d=>{const p=new T.Vector3(d.p[0],d.p[1]-d.r*.18,d.p[2]+d.r*d.squash*.88).project(camera);return {x:(p.x*.5+.5)*width,y:(-p.y*.5+.5)*height,visible:true}});
  const markers=placeMarkers(points,width,height,[obstacle]);
  assert(markers.filter(m=>m.visible).length>=(height<180?3:6),'Compact views retain useful beacons; full destination navigation remains in HTML');
  for(const [i,m]of markers.entries())if(m.visible){
    assert(m.x>=25&&m.x<=width-25&&m.y>=25&&m.y<=height-25,'Marker stays within the scene');
    assert(m.x+20<obstacle.left||m.x-20>obstacle.right||m.y+20<obstacle.top||m.y-20>obstacle.bottom,'Marker clears scene controls');
    for(const other of markers.slice(i+1))if(other.visible)assert(Math.hypot(m.x-other.x,m.y-other.y)>=51,'Numbered markers do not overlap');
  }
  console.log(`Overview ${width}×${height}: all worlds framed; ${markers.filter(m=>m.visible).length} separated markers`);
}
