import assert from 'node:assert/strict';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {captureView,syncOrbitView,createCameraFlight} from '../components/CameraNavigation.ts';
import {destinations,SCENE_FOV} from '../components/WorldCatalog.ts';
import {frameObjects} from '../components/SceneFraming.ts';

// OrbitControls supports a null DOM element. This tests its real camera math, not a browser.
const camera=new T.PerspectiveCamera(SCENE_FOV,1.4,.2,400);
camera.position.set(90,40,90);
const controls=new OrbitControls(camera);
controls.enableDamping=true;controls.minDistance=8;controls.maxDistance=360;controls.maxPolarAngle=Math.PI*.49;
let transitions=0;
for(const aspect of [.72,1.4,2.5])for(const d of destinations){
 camera.aspect=aspect;camera.updateProjectionMatrix();
 // A proxy volume is sufficient here: construction/framing has separate geometry checks.
 const root=new T.Group();root.position.set(...d.p);
 const mesh=new T.Mesh(new T.BoxGeometry(d.r*2,d.height+d.r,d.r*2*d.squash),new T.MeshBasicMaterial());root.add(mesh);
 const view=frameObjects([root],d.id,aspect);
 syncOrbitView(camera,controls,view);
 assert(camera.position.distanceTo(new T.Vector3(view.x,view.y,view.z))<1e-7,`${d.id}: instant navigation moves the camera`);
 assert(controls.target.distanceTo(new T.Vector3(view.lx,view.ly,view.lz))<1e-7,`${d.id}: instant navigation moves the orbit pivot`);
 const projection=controls.target.clone().project(camera);
 assert(Math.abs(projection.x)<1e-7&&Math.abs(projection.y)<1e-7,`${d.id}: camera faces the new world`);
 assert.equal(controls.enableDamping,true,'Controller preferences survive navigation');
 // Simulate an inspected viewpoint away from the preset, then begin the next flight there.
 camera.position.add(new T.Vector3(3,1,-2));controls.update();
 const origin=captureView(camera,controls.target),eye=camera.position.clone(),target=controls.target.clone();
 syncOrbitView(camera,controls,origin);
 assert(camera.position.distanceTo(eye)<1e-7,'A new flight starts at the inspected position without snapping');
 assert(controls.target.distanceTo(target)<1e-7,'Stopping motion preserves the inspected pivot');
 mesh.geometry.dispose();mesh.material.dispose();transitions++;
}
console.log(`${transitions} instant world transitions and inspected-camera handoffs passed with real OrbitControls.`);

// Include reversed and opposite viewing arms, as visitors can orbit behind a world.
const views=[
 {x:0,y:15,z:40,lx:0,ly:0,lz:0},
 {x:30,y:25,z:-60,lx:30,ly:10,lz:-20},
 {x:0,y:15,z:-40,lx:0,ly:0,lz:0},
 {x:0,y:-15,z:-40,lx:0,ly:0,lz:0},
];
let routes=0;
for(const from of views)for(const to of views){
 const route=createCameraFlight(from,to);
 assert.deepEqual(route.sample(0),from);assert.deepEqual(route.sample(1),to);
 assert.deepEqual(route.sample(-1),from);assert.deepEqual(route.sample(2),to);
 let previous=route.sample(0);
 for(let i=1;i<=100;i++){
  const view=route.sample(i/100);assert(Object.values(view).every(Number.isFinite),'Flights remain finite through opposite views');
  const eye=new T.Vector3(view.x,view.y,view.z),pivot=new T.Vector3(view.lx,view.ly,view.lz);
  assert(eye.distanceTo(pivot)>=8,'Camera arm never collapses into the island');
  assert(eye.distanceTo(new T.Vector3(previous.x,previous.y,previous.z))<5,'Sampled flight remains continuous');
  previous=view;
 }
 const interrupted=route.sample(.37),replacement=createCameraFlight(interrupted,from);
 assert.deepEqual(replacement.sample(0),interrupted,'Rapid retargeting starts exactly at the interrupted view');
 assert(route.duration>=.65&&route.duration<=1.5,'Travel stays short and bounded');routes++;
}
console.log(`${routes} curved camera flights passed endpoint, continuity, interruption, and pivot-clearance checks.`);
