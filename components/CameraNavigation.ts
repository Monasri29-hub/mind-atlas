import type {PerspectiveCamera,Vector3} from 'three';
import type {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export type CameraView={x:number;y:number;z:number;lx:number;ly:number;lz:number};

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
