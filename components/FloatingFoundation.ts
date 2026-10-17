import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const rockMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.94,flatShading:true});
const boulderMaterial=new T.MeshStandardMaterial({color:'#acaaa0',roughness:.96,flatShading:true});
const foliageMaterial=new T.MeshStandardMaterial({color:'#ffffff',roughness:.94,flatShading:true});
const vineMaterial=new T.MeshStandardMaterial({color:'#557d67',roughness:1});
const boulderGeometry=new T.IcosahedronGeometry(1,1),leafGeometry=new T.IcosahedronGeometry(1,0);
const random=(n:number)=>{const a=Math.sin(n*127.1+311.7)*43758.5453;return a-Math.floor(a)};
const profile=[1,1.035,.99,.96,.82,.85,.66,.6,.43,.31,.19,.045];
const depths=[.02,-.075,-.19,-.29,-.37,-.46,-.57,-.68,-.79,-.9,-1.04,-1.17];

/** Closed, weathered strata with a planted lip; every world retains its own footprint. */
export function buildFloatingFoundation(parent:T.Group,radius:number,squash:number,seed=4){
 const root=new T.Group();root.name='Layered floating geology';root.userData.foundation=true;parent.add(root);
 const segments=64,positions:number[]=[],colors:number[]=[],indices:number[]=[];
 const top=new T.Color('#c4c0a8'),bottom=new T.Color('#687e88'),color=new T.Color();
 const rim=(a:number)=>1+Math.sin(a*5+seed)*.035+Math.cos(a*11-seed)*.022;
 for(let j=0;j<profile.length;j++)for(let i=0;i<segments;i++){
  const a=i/segments*Math.PI*2;
  const erosion=j===0?1:1+Math.sin(a*9+j*1.7+seed)*.035+Math.cos(a*17-j*.6)*.025;
  const r=radius*profile[j]*rim(a)*erosion,drop=j<2?0:Math.sin(a*7+seed+j*.25)*radius*.018;
  const drift=(j/(profile.length-1))**2;
  positions.push(Math.cos(a)*r+Math.sin(seed)*radius*.1*drift,depths[j]*radius+drop,Math.sin(a)*r*squash+Math.cos(seed)*radius*.08*drift);
  const strata=Math.sin(j*1.95+a*.8+seed)*.045+random(i+j*64+seed)*.055;
  color.copy(top).lerp(bottom,Math.min(1,j/(profile.length-1)*.92));
  color.offsetHSL(0,strata*.12,strata);
  // Moss grows in patches on the exposed upper cliff rather than coloring the entire rock green.
  if(j<3&&Math.sin(a*4+seed)+Math.cos(a*7-seed)>.6)color.lerp(new T.Color('#6e8462'),.45-j*.12);
  colors.push(color.r,color.g,color.b);
 }
 for(let j=0;j<profile.length-1;j++)for(let i=0;i<segments;i++){
  const a=j*segments+i,b=j*segments+(i+1)%segments,c=a+segments,d=b+segments;
  indices.push(a,b,c,b,d,c);
 }
 const topCenter=positions.length/3;positions.push(0,depths[0]*radius,0);colors.push(top.r,top.g,top.b);
 const tip=positions.length/3;positions.push(Math.sin(seed)*radius*.1,-radius*1.195,Math.cos(seed)*radius*.08);colors.push(bottom.r,bottom.g,bottom.b);
 for(let i=0;i<segments;i++){
  indices.push(topCenter,(i+1)%segments,i);
  const last=(profile.length-1)*segments;indices.push(tip,last+i,last+(i+1)%segments);
 }
 const geology=new T.BufferGeometry();geology.setAttribute('position',new T.Float32BufferAttribute(positions,3));geology.setAttribute('color',new T.Float32BufferAttribute(colors,3));geology.setIndex(indices);geology.computeVertexNormals();
 const cliff=new T.Mesh(geology,rockMaterial);cliff.name='Eroded rock strata';cliff.receiveShadow=true;root.add(cliff);

 // Embedded outcrops intersect the rock and break the silhouette without detached cone spikes.
 const outcrops=new T.InstancedMesh(boulderGeometry,boulderMaterial,22),transform=new T.Object3D();outcrops.name='Embedded cliff outcrops';
 for(let i=0;i<outcrops.count;i++){
  const level=2+i%7,a=i*2.399+seed,size=radius*(.065+random(i+seed)*.045),r=radius*profile[level]*rim(a)*.95;
  transform.position.set(Math.cos(a)*r,depths[level]*radius,Math.sin(a)*r*squash);transform.rotation.set(random(i)*.4,a,random(i+4)*.3);transform.scale.set(size,size*(1.15+random(i+20)),size*.85);transform.updateMatrix();outcrops.setMatrixAt(i,transform.matrix);
 }
 outcrops.receiveShadow=true;root.add(outcrops);

 const vines:T.BufferGeometry[]=[],leafCount=168,foliage=new T.InstancedMesh(leafGeometry,foliageMaterial,leafCount);foliage.name='Planted cliff edge';let leafIndex=0;
 for(let i=0;i<24;i++){
  const a=i/24*Math.PI*2+seed*.07,length=radius*(.13+random(i+seed+82)*.32),r=radius*rim(a)*1.005;
  const path=new T.CatmullRomCurve3([
   new T.Vector3(Math.cos(a)*r,.13,Math.sin(a)*r*squash),
   new T.Vector3(Math.cos(a)*r*1.015,-length*.42,Math.sin(a)*r*squash*1.015),
   new T.Vector3(Math.cos(a)*r*.89,-length,Math.sin(a)*r*squash*.89)
  ]);
  vines.push(new T.TubeGeometry(path,12,.014,4,false));
  for(let j=0;j<7;j++){
   const p=path.getPoint(j/7),size=radius*(.019+random(i*7+j)*.017);
   transform.position.copy(p).add(new T.Vector3((random(j+i)-.5)*.13,0,(random(j+i+9)-.5)*.13));transform.rotation.set(j*.8,a+j*.5,.3);transform.scale.set(size*1.25,size*.55,size);transform.updateMatrix();foliage.setMatrixAt(leafIndex,transform.matrix);
   foliage.setColorAt(leafIndex++,new T.Color().setHSL(.27+random(i+j)*.08,.18+random(i+10)*.12,.32+random(i+j+40)*.15));
  }
 }
 const merged=mergeGeometries(vines,false);vines.forEach(g=>g.dispose());
 if(merged){const trailing=new T.Mesh(merged,vineMaterial);trailing.name='Trailing cliff stems';root.add(trailing)}
 foliage.receiveShadow=true;root.add(foliage);
 return root;
}
