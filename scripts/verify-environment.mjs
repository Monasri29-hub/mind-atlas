import assert from 'node:assert/strict';
import * as T from 'three';
import {buildFloatingFoundation} from '../components/FloatingFoundation.ts';
import {arrivalPoint,buildSkyRoutes} from '../components/SkyRoutes.ts';
import {buildSkyEnvironment,cloudLayout} from '../components/SkyEnvironment.ts';
import {destinations,connections} from '../components/WorldCatalog.ts';

// Renderer-independent checks: no WebGL or browser behavior is simulated here.
const scenes=[];
for(const [i,d]of destinations.entries()){
 const root=new T.Group(),foundation=buildFloatingFoundation(root,d.r,d.squash,i*110+4);scenes.push(root);
 const cliff=foundation.getObjectByName('Eroded rock strata'),g=cliff.geometry,p=g.getAttribute('position'),c=g.getAttribute('color'),index=g.index;
 assert([...p.array,...c.array].every(Number.isFinite),`${d.id}: finite strata positions and color`);
 const edges=new Map(),a=new T.Vector3(),b=new T.Vector3(),v=new T.Vector3();
 for(let j=0;j<index.count;j+=3){
  const triangle=[index.getX(j),index.getX(j+1),index.getX(j+2)];
  a.fromBufferAttribute(p,triangle[1]).sub(v.fromBufferAttribute(p,triangle[0]));b.fromBufferAttribute(p,triangle[2]).sub(v);
  assert(a.cross(b).lengthSq()>1e-10,`${d.id}: no degenerate rock faces`);
  for(let k=0;k<3;k++){const x=triangle[k],y=triangle[(k+1)%3],key=[Math.min(x,y),Math.max(x,y)].join(':');edges.set(key,(edges.get(key)??0)+1)}
 }
 assert([...edges.values()].every(count=>count===2),`${d.id}: closed cliff shell without open seams`);
 assert(new Set([...c.array].map(n=>n.toFixed(3))).size>60,`${d.id}: geology has real color variation`);
 // The cap points upward; the tip cap points down. Side surfaces must not invert.
 const n=g.getAttribute('normal');assert(n.getY(p.count-2)>.99&&n.getY(p.count-1)<-.9,`${d.id}: cap winding faces outward`);
 const bounds=new T.Box3().setFromObject(root,true);assert(bounds.min.y<-d.r&&bounds.max.y<.7,`${d.id}: complete underside stays below architecture`);
 root.traverse(o=>{if(o instanceof T.InstancedMesh)for(let j=0;j<o.count;j++){const m=new T.Matrix4();o.getMatrixAt(j,m);assert(m.elements.every(Number.isFinite)&&m.determinant()>0,'Foliage and outcrop transforms preserve winding')}});
}
const routeScene=new T.Scene(),transit=buildSkyRoutes(routeScene);scenes.push(routeScene);
assert.equal(transit.routes.length,connections.length);
let routeDraws=0;transit.root.traverse(o=>{if(o instanceof T.Mesh)routeDraws++;if(o.geometry)assert([...o.geometry.getAttribute('position').array].every(Number.isFinite),'Finite transit geometry')});
assert(routeDraws<35,'Skywalk posts and edge lights are batched');
for(const [i,route]of transit.routes.entries()){
 const [a,b]=connections[i],from=destinations[a],to=destinations[b],start=arrivalPoint(from,to),end=arrivalPoint(to,from);
 assert(route.curve.getPoint(0).distanceTo(start)<1e-6&&route.curve.getPoint(1).distanceTo(end)<1e-6,'Route terminates at both real arrival points');
 for(const [world,p]of [[from,start],[to,end]]){
  const x=p.x-world.p[0],z=p.z-world.p[2];
  if(world.id==='technology'||world.id==='hackathons'){
   const w=world.id==='technology'?4.2:4.45,d=world.id==='technology'?3.65:3.45;assert(Math.abs(x)<w&&Math.abs(z)<d,'Industrial route meets the rectangular deck');
  }else assert((x/world.r)**2+(z/(world.r*world.squash))**2<.8,'Route meets the elliptical or round deck');
 }
 const old=route.dot.position.clone();transit.update(0,true);assert(route.dot.position.distanceTo(old)<1e-9,'Reduced motion holds transit signals');
}
const texture=new T.DataTexture(new Uint8Array([255,255,255,255]),1,1),skyScene=new T.Scene(),sky=buildSkyEnvironment(skyScene,texture);scenes.push(skyScene);
assert(cloudLayout.every(p=>p.y<=-14),'Cloud banks remain below the portfolio worlds');
assert(cloudLayout.filter(p=>p.far).length>=16,'Separate horizon cloud layer');
sky.update(50,false);assert(sky.clouds.some(s=>Math.abs(s.position.x-s.userData.baseX)>.1),'Clouds drift subtly');
sky.update(100,true);assert(sky.clouds.every(s=>s.position.x===s.userData.baseX),'Reduced motion restores a static cloud layout');
sky.setLimited(true);assert(sky.clouds.filter(s=>s.visible).length===19&&!sky.distant.visible,'Touch and mobile quality limits cloud overdraw and distant geometry');
sky.setLimited(false);assert(sky.clouds.every(s=>s.visible)&&sky.distant.visible,'Desktop quality can return after resizing');
assert(!sky.root.children.some(o=>o.userData.world),'Background settlements are not extra portfolio worlds');
const geometries=new Set(),materials=new Set();for(const scene of scenes)scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m)});
geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());texture.dispose();
console.log(`Eight closed, colored island foundations; nine correctly attached routes (${routeDraws} batched draws); cloud layers, quality switching, and reduced motion passed.`);
