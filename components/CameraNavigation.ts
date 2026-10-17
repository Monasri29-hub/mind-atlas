import {Quaternion,Vector3,type PerspectiveCamera} from 'three';
import type {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export type CameraView={x:number;y:number;z:number;lx:number;ly:number;lz:number};

/** Rotate the viewing arm while translating its pivot: never fly through the pivot. */
export function createCameraFlight(from:CameraView,to:CameraView){
 const start=new Vector3(from.lx,from.ly,from.lz),end=new Vector3(to.lx,to.ly,to.lz);
 const arm=new Vector3(from.x,from.y,from.z).sub(start),finish=new Vector3(to.x,to.y,to.z).sub(end);
 const radius=arm.length(),endRadius=finish.length(),direction=arm.normalize();
 const rotation=new Quaternion().setFromUnitVectors(direction,finish.normalize());
 const orientation=new Quaternion(),pivot=new Vector3(),eye=new Vector3();
 const distance=new Vector3(from.x,from.y,from.z).distanceTo(new Vector3(to.x,to.y,to.z));
 return {duration:Math.min(1.5,Math.max(.65,.65+distance*.008)),sample(progress:number):CameraView{
  const t=Math.max(0,Math.min(1,progress));
  if(t===0)return {...from};if(t===1)return {...to};
  pivot.lerpVectors(start,end,t);orientation.identity().slerp(rotation,t);
  const length=radius+(endRadius-radius)*t+Math.sin(Math.PI*t)*Math.min(6,distance*.06);
  eye.copy(direction).applyQuaternion(orientation).multiplyScalar(length).add(pivot);
  return {x:eye.x,y:eye.y,z:eye.z,lx:pivot.x,ly:pivot.y,lz:pivot.z};
 }};
}

/** Begin a new flight at the actual inspected camera, not its old preset. */
export function captureView(camera:PerspectiveCamera,target:Vector3):CameraView{
 return {x:camera.position.x,y:camera.position.y,z:camera.position.z,lx:target.x,ly:target.y,lz:target.z};
}

/** Instant navigation moves both the camera and its orbit pivot, clearing old input. */
export function syncOrbitView(camera:PerspectiveCamera,controls:OrbitControls,view:CameraView){
 const damping=controls.enableDamping;
 controls.enableDamping=false;
 controls.update();
 camera.position.set(view.x,view.y,view.z);
 controls.target.set(view.lx,view.ly,view.lz);
 controls.update();
 controls.enableDamping=damping;
 camera.updateMatrixWorld(true);
}
