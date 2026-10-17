import assert from 'node:assert/strict';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {captureView,syncOrbitView} from '../components/CameraNavigation.ts';
import {destinations,SCENE_FOV} from '../components/WorldCatalog.ts';
import {frameObjects} from '../components/SceneFraming.ts';

// OrbitControls supports a null DOM element. This tests its real camera math, not a browser.
const camera=new T.PerspectiveCamera(SCENE_FOV,1.4,.2,400);
camera.position.set(90,40,90);
const controls=new OrbitControls(camera);
controls.enableDamping=true;controls.minDistance=8;controls.maxDistance=220;controls.maxPolarAngle=Math.PI*.49;
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
