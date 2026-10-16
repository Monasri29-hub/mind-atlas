import * as T from 'three';
import {SCENE_FOV} from './WorldCatalog.ts';

/** Fit the actual geometry, including instances, instead of an oversized island box. */
export function frameObjects(objects:T.Object3D[],id:string,aspect:number){
 const direction=new T.Vector3(...(id==='home'?[.16,.34,1]:[.43,.3,1]) as [number,number,number]).normalize();
 const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),direction).normalize();
 const up=new T.Vector3().crossVectors(direction,right).normalize();
 const min=new T.Vector3(Infinity,Infinity,Infinity),max=new T.Vector3(-Infinity,-Infinity,-Infinity);
 const p=new T.Vector3(),q=new T.Vector3(),matrix=new T.Matrix4(),instance=new T.Matrix4();
 function visit(callback:(point:T.Vector3)=>void){
  for(const root of objects){root.updateWorldMatrix(true,true);root.traverse(object=>{
   const drawable=object as T.Mesh;if(!drawable.geometry)return;
   const positions=drawable.geometry.getAttribute('position');if(!positions)return;
   const count=object instanceof T.InstancedMesh?object.count:1;
   for(let i=0;i<count;i++){
    if(object instanceof T.InstancedMesh){object.getMatrixAt(i,instance);matrix.multiplyMatrices(object.matrixWorld,instance)}else matrix.copy(object.matrixWorld);
    for(let j=0;j<positions.count;j++){p.fromBufferAttribute(positions,j).applyMatrix4(matrix);callback(p)}
   }
  })}
 }
 visit(p=>{q.set(p.dot(right),p.dot(up),p.dot(direction));min.min(q);max.max(q)});
 const center=min.clone().add(max).multiplyScalar(.5);
 const target=right.clone().multiplyScalar(center.x).addScaledVector(up,center.y).addScaledVector(direction,center.z);
 const tan=Math.tan(SCENE_FOV*Math.PI/360);let distance=8;
 visit(p=>{
  q.copy(p).sub(target);const depth=q.dot(direction);
  distance=Math.max(distance,depth+Math.abs(q.dot(right))/(tan*aspect*.88),depth+Math.abs(q.dot(up))/(tan*.8));
 });
 const eye=target.clone().addScaledVector(direction,distance+.4);
 return {x:eye.x,y:eye.y,z:eye.z,lx:target.x,ly:target.y,lz:target.z};
}
