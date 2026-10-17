import assert from 'node:assert/strict';
import {createRenderLoop,sceneQuality} from '../components/SceneRuntime.ts';
import {adjustOrbit,syncOrbitView} from '../components/CameraNavigation.ts';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

// Deterministic frame-driver test: no browser or emulated GPU is used.
let sequence=0,time=0,draws=0,animate=false,wakeInside=false;
const pending=new Map(),cancelled=[];
const loop=createRenderLoop({request(callback){const id=sequence++;pending.set(id,callback);return id},cancel(id){cancelled.push(id);pending.delete(id)}},()=>{draws++;if(wakeInside){loop.wake();loop.wake()}return animate});
const tick=()=>{const entry=pending.entries().next().value;assert(entry,'A requested frame exists');pending.delete(entry[0]);entry[1](time+=34)};
loop.wake();loop.wake();loop.wake();assert.equal(pending.size,1,'Repeated wakeups coalesce, including request ID zero');
tick();assert.equal(draws,1);assert.equal(pending.size,0,'An idle reduced-motion scene sleeps');
animate=true;loop.wake();tick();tick();assert.equal(pending.size,1,'Animation maintains exactly one pending frame');
loop.stop();assert.equal(pending.size,0,'Hidden/covered scenes can cancel pending work');assert(cancelled.length>0);
animate=false;loop.wake();tick();assert.equal(pending.size,0,'A scene can resume and settle again');
wakeInside=true;loop.wake();tick();assert.equal(pending.size,1,'Control updates during a draw never create duplicate frames');
wakeInside=false;tick();assert.equal(pending.size,0);
loop.wake();loop.dispose();loop.wake();assert.equal(pending.size,0,'Disposed scenes never restart');

let budgets=0;
assert.equal(sceneQuality(320,180,.25,false).pixelRatio,.25,'Low native ratios are not oversampled');
assert(Number.isFinite(sceneQuality(0,0,0,true).pixelRatio),'Unmeasured sizes and missing ratios remain finite');
for(const [width,height] of [[320,180],[390,272],[844,120],[960,320],[1363,860],[2560,1440],[3840,2160]])for(const dpr of [1,2,3])for(const limited of [false,true]){
 const quality=sceneQuality(width,height,dpr,limited),pixels=width*height*quality.pixelRatio**2;
 assert(Number.isFinite(quality.pixelRatio)&&quality.pixelRatio>0);
 assert(quality.pixelRatio<=dpr&&quality.pixelRatio<=(limited?1.25:1.65));
 assert(pixels<=(limited?900_000:2_000_000)+.001,'Framebuffer stays within the device pixel budget');
 assert.equal(quality.fps,limited?30:45);budgets++;
}

const initial={x:18,y:15,z:40,lx:2,ly:3,lz:4},target=new T.Vector3(initial.lx,initial.ly,initial.lz);
const camera=new T.PerspectiveCamera(42,1.4,.2,400),controls=new OrbitControls(camera);
controls.minDistance=8;controls.maxDistance=360;controls.maxPolarAngle=Math.PI*.49;
for(const action of ['left','right','up','down','in','out']){
 let view=initial;
 for(let i=0;i<100;i++){
  view=adjustOrbit(view,action);assert(Object.values(view).every(Number.isFinite));
  assert.deepEqual([view.lx,view.ly,view.lz],[initial.lx,initial.ly,initial.lz],'Accessible controls preserve the orbit pivot');
  const arm=new T.Vector3(view.x,view.y,view.z).sub(target),polar=new T.Spherical().setFromVector3(arm);
  assert(arm.length()>=8-1e-8&&arm.length()<=360+1e-8,'Repeated zoom stays within drag-control bounds');
  assert(polar.phi>=.05-1e-8&&polar.phi<=Math.PI*.49+1e-8,'Repeated rotation stays above the horizon');
 }
 syncOrbitView(camera,controls,view);
 assert(camera.position.distanceTo(new T.Vector3(view.x,view.y,view.z))<1e-7,'Button view agrees with actual OrbitControls');
 const projected=controls.target.clone().project(camera);assert(Math.abs(projected.x)<1e-7&&Math.abs(projected.y)<1e-7);
}
for(const [forward,back] of [['left','right'],['up','down'],['in','out']]){
 const view=adjustOrbit(adjustOrbit(initial,forward),back);
 assert(new T.Vector3(view.x,view.y,view.z).distanceTo(new T.Vector3(initial.x,initial.y,initial.z))<1e-7,'Opposite commands undo one another away from limits');
}
console.log(`Frame scheduling, pause/resume and disposal; ${budgets} viewport/DPI budgets; 600 bounded keyboard-view adjustments passed.`);
