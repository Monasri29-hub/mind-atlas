import * as T from 'three';

/** A solid architectural band with real width and thickness, rather than a glowing line. */
export function solidRibbon(parent:T.Object3D,points:T.Vector3[],width:number,thickness:number,material:T.Material,segments=64,planeNormal?:T.Vector3){
 const curve=new T.CatmullRomCurve3(points,false,'centripetal'),frames=curve.computeFrenetFrames(segments,false);
 const positions:number[]=[],uv:number[]=[],indices:number[]=[],side=new T.Vector3(),depth=new T.Vector3();
 for(let i=0;i<=segments;i++){
  const p=curve.getPoint(i/segments),tangent=curve.getTangent(i/segments);
  if(planeNormal){side.crossVectors(tangent,planeNormal);if(side.lengthSq()<.00001)side.copy(frames.normals[i]);side.normalize()}else side.copy(frames.normals[i]);
  depth.crossVectors(tangent,side).normalize();
  for(const [w,d]of [[1,1],[-1,1],[-1,-1],[1,-1]]){
   positions.push(p.x+side.x*width*w/2+depth.x*thickness*d/2,p.y+side.y*width*w/2+depth.y*thickness*d/2,p.z+side.z*width*w/2+depth.z*thickness*d/2);uv.push(i/segments,w>0?1:0);
  }
  if(i<segments)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4;indices.push(a,b,a+4,b,b+4,a+4)}
 }
 indices.push(0,3,2,0,2,1);const end=segments*4;indices.push(end,end+1,end+2,end,end+2,end+3);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 const object=new T.Mesh(g,material);parent.add(object);return object;
}

/** Flat stepped seating and crescent terraces with closed tops, risers, and soffits. */
export function arcTerrace(parent:T.Object3D,inner:number,outer:number,y:number,height:number,start:number,span:number,material:T.Material,segments=64){
 const positions:number[]=[],uv:number[]=[],indices:number[]=[];
 for(let i=0;i<=segments;i++){
  const a=start+i/segments*span;
  for(const [r,py]of [[outer,y],[inner,y],[outer,y-height],[inner,y-height]]){positions.push(Math.cos(a)*r,py,Math.sin(a)*r);uv.push(i/segments,r===outer?1:0)}
  if(i<segments){const k=i*4;indices.push(k,k+1,k+4,k+4,k+1,k+5,k+2,k+6,k+3,k+6,k+7,k+3,k,k+4,k+2,k+4,k+6,k+2,k+1,k+3,k+5,k+5,k+3,k+7)}
 }
 indices.push(0,2,1,1,2,3);const end=segments*4;indices.push(end,end+1,end+2,end+1,end+3,end+2);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const mesh=new T.Mesh(g,material);parent.add(mesh);return mesh;
}
