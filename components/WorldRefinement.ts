import * as T from 'three';

const pearl=new T.MeshStandardMaterial({color:'#e6e2d8',roughness:.42,metalness:.18});
const metal=new T.MeshStandardMaterial({color:'#718e9d',roughness:.3,metalness:.65});
const gold=new T.MeshStandardMaterial({color:'#c4a16c',roughness:.4,metalness:.6});
const dark=new T.MeshStandardMaterial({color:'#203f50',roughness:.48});
const rose=new T.MeshStandardMaterial({color:'#cba4c6',roughness:.45});
const orange=new T.MeshStandardMaterial({color:'#ce805b',roughness:.5});
const cyan=new T.MeshStandardMaterial({color:'#70d9e5',emissive:'#46c5df',emissiveIntensity:.45,roughness:.3,metalness:.25});
const glass=new T.MeshStandardMaterial({color:'#b8e6ec',transparent:true,opacity:.22,roughness:.16,depthWrite:false});
const sphere=new T.SphereGeometry(1,16,12),box=new T.BoxGeometry(1,1,1);
const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);

/** Actual mesh details extend the eight landmarks; no illustrated island planes. */
export function refineWorld(parent:T.Group,id:string){
 const root=new T.Group();root.name=`${id}: modeled architectural details`;root.userData.modeledDetail=id;parent.add(root);
 const mesh=(geometry:T.BufferGeometry,material:T.Material,p:T.Vector3,scale?:[number,number,number])=>{const object=new T.Mesh(geometry,material);object.position.copy(p);if(scale)object.scale.set(...scale);root.add(object);return object};
 const ball=(p:T.Vector3,r:number,material:T.Material=cyan)=>mesh(sphere,material,p,[r,r,r]);
 const block=(p:T.Vector3,size:[number,number,number],material:T.Material=pearl)=>mesh(box,material,p,size);
 const curve=(points:T.Vector3[],material:T.Material=metal,r=.018)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),40,r,6,false),material,v(0,0,0));
 const rod=(a:T.Vector3,b:T.Vector3,r=.025,material:T.Material=metal)=>{const direction=b.clone().sub(a),object=mesh(new T.CylinderGeometry(r,r,direction.length(),8),material,a.clone().add(b).multiplyScalar(.5));object.quaternion.setFromUnitVectors(v(0,1,0),direction.normalize());return object};
 const hoop=(p:T.Vector3,r:number,material:T.Material=cyan,tube=.012)=>mesh(new T.TorusGeometry(r,tube,6,64),material,p);

 switch(id){
  case 'psychology':{
   root.name='Cognitive garden: reflection ripples, memory lattices and thought paths';
   for(const r of [1.7,2.1,2.45]){const ripple=hoop(v(.2,.775,.4),r,cyan,.009);ripple.rotation.x=Math.PI/2;ripple.scale.y=.68}
   for(const [x,z]of [[-4,-.3],[3.7,.4]]){
    for(let i=0;i<5;i++){const p=v(x-.2+i*.09,1.55+Math.sin(i*1.3)*.23,z+.13);ball(p,.026,i%2?rose:cyan);if(i)rod(v(x-.2+(i-1)*.09,1.55+Math.sin((i-1)*1.3)*.23,z+.13),p,.009,rose)}
   }
   for(const side of [-1,1])curve([v(side*3.7,.5,1.8),v(side*3,.55,2.45),v(side*1.5,.6,3.05)],rose,.025);
   break;
  }
  case 'ai':{
   root.name='Intelligence lab: volumetric interfaces and routed inference channels';
   for(const side of [-1,1]){
    const x=side*4.1;block(v(x,1.9,1.4),[1.15,1.35,.055],glass);
    for(let i=0;i<4;i++){block(v(x,2.35-i*.25,1.44),[.78-i*.11,.025,.025],cyan);ball(v(x-.43,2.35-i*.25,1.46),.035)}
    curve([v(side*2.1,1.08,.05),v(side*2.5,1.08,.85),v(x,1.08,1.4)],cyan,.025);
   }
   for(let i=0;i<12;i++){const a=i/12*Math.PI*2;block(v(Math.cos(a)*1.9,1.12,Math.sin(a)*1.9),[.07,.03,.2],metal).rotation.y=-a}
   break;
  }
  case 'projects':{
   root.name='Project gallery: five connected pergola bays and shared exhibition spine';
   for(const z of [-3.65,-3.4,-3.15])curve([v(-5.6,2.85,z+.5),v(-2.8,3.25,z),v(0,3.55,z-.2),v(2.9,3.25,z),v(5.6,2.85,z+.5)],pearl,.035);
   for(const x of [-5.6,-2.8,2.8,5.6])rod(v(x,.6,-3.15),v(x,2.85,-3.15),.025,gold);
   for(const side of [-1,1])curve([v(side*1.3,.54,3.3),v(side*3,.54,3),v(side*5,.54,2)],cyan,.014);
   break;
  }
  case 'culture':{
   root.name='Cultural pavilion: brass global armillary and acoustic detailing';
   const center=v(-3,1.75,-.05);
   for(let i=0;i<4;i++){const ring=hoop(center,.72,gold,.018);ring.rotation.y=i*Math.PI/4}
   for(const y of [-.35,0,.35]){const ring=hoop(center.clone().add(v(0,y,0)),Math.sqrt(.72**2-y*y),gold,.012);ring.rotation.x=Math.PI/2}
   rod(v(-3,.5,-.05),v(-3,1.05,-.05),.05,gold);
   for(let i=0;i<7;i++)block(v(2+i*.18,.75,1.3),[.07,.18+i*.06,.22],i%2?rose:gold);
   break;
  }
  case 'hackathons':{
   root.name='Invention yard: articulated fabrication arms and illuminated test pads';
   for(const side of [-1,1]){
    const a=v(side*3.2,.85,-.3),b=v(side*3.25,2.0,-.65),c=v(side*2.5,2.65,-.55),d=v(side*1.95,2.35,-.2);
    mesh(new T.CylinderGeometry(.4,.5,.28,24),dark,v(side*3.2,.74,-.3));
    for(const [from,to]of [[a,b],[b,c],[c,d]]){rod(from,to,.09,orange);ball(from,.15,metal)}ball(d,.12,dark);
    for(const dz of [-.12,.12])rod(d.clone().add(v(0,0,dz)),d.clone().add(v(-side*.25,-.22,dz)),.025,metal);
   }
   for(let i=0;i<3;i++){const ring=hoop(v(-2.6+i*2.55,.72,1.7),.75,cyan,.012);ring.rotation.x=Math.PI/2}
   break;
  }
  case 'research':{
   root.name='Observatory: calibrated dome ribs and three-dimensional knowledge instrument';
   for(const a of [2.9,3.8,4.7,5.6])curve(Array.from({length:13},(_,i)=>{const t=i/12*Math.PI/2;return v(-1.8+Math.cos(a)*1.8*Math.sin(t),1.4+1.8*Math.cos(t),-.65+Math.sin(a)*1.8*Math.sin(t))}),metal,.012);
   const p=v(.45,1.3,1.65);
   for(let i=0;i<3;i++){const ring=hoop(p,.56+i*.04,gold,.012);ring.rotation.set(.4+i*.65,i*.7,.3)}
   ball(p,.11,rose);rod(v(.45,.55,1.65),v(.45,.7,1.65),.06,gold);
   break;
  }
  case 'technology':{
   root.name='Systems infrastructure: service ports, layered cable routing and module sockets';
   for(let i=0;i<3;i++){
    const x=-2.35+i*1.75;
    for(let j=0;j<4;j++){block(v(x-.28+j*.18,2.7,.015),[.1,.11,.04],gold);ball(v(x-.28+j*.18,2.87,.015),.025)}
    curve([v(x,1.2,1.1),v(x,1.45,1.4),v(x+.35,2.15,1.2),v(x+.35,2.65,.1)],cyan,.018);
   }
   for(let i=0;i<6;i++)block(v(-3.4,1.1+i*.5,-1.49),[.25,.12,.025],i%2?cyan:metal);
   break;
  }
  case 'future':{
   root.name='Open horizon: geographic meridians and three open destination thresholds';
   const earth=parent.getObjectByName('Future Earth perspective');
   if(earth)for(let i=0;i<6;i++){const line=new T.Mesh(new T.TorusGeometry(1.975,.006,5,72),gold);line.rotation.y=i*Math.PI/6;earth.add(line)}
   for(let i=0;i<3;i++){
    const end=v(3.5+i*.55,3.2+i*.85,-2.6+i*1.45);
    curve([end.clone().add(v(-.18,-.28,0)),end.clone().add(v(-.18,.2,0)),end.clone().add(v(0,.36,0)),end.clone().add(v(.18,.2,0)),end.clone().add(v(.18,-.28,0))],i%2?cyan:gold,.018);
   }
   break;
  }
 }
 return root;
}
