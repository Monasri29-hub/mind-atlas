'use client';
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {buildMindGarden,buildIntelligenceNexus,buildProjectAtelier,buildFloatingFoundation,skyWalk,type WorldAnimation} from './WorldArchitecture';
type Props={reduced:boolean;active:string;inspect:boolean;onReady:()=>void;onFail:()=>void;onProject:(id:string)=>void;onWorld:(id:string)=>void};
const destinations=[{id:'psychology',name:'THE MIND GARDEN',p:[-18,1,12],r:5.5},{id:'ai',name:'INTELLIGENCE NEXUS',p:[4,3,-6],r:6.5},{id:'projects',name:'THE PROJECT ATELIER',p:[20,0,18],r:7.5},{id:'culture',name:'CULTURE',p:[-24,4,-17],r:4.5},{id:'hackathons',name:'HACKATHONS',p:[29,5,-10],r:4.8},{id:'research',name:'RESEARCH',p:[0,7,-35],r:5},{id:'technology',name:'TECHNOLOGY',p:[-30,2,-39],r:4.5},{id:'future',name:'NEXT CHAPTER',p:[24,9,-45],r:5}];
const rnd=(i:number)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n)};
export default function SkyScene(props:Props){
 const canvas=useRef<HTMLCanvasElement>(null),labels=useRef<HTMLDivElement>(null),current=useRef(props);current.current=props;
 useEffect(()=>{if(!canvas.current)return;let renderer:T.WebGLRenderer;try{renderer=new T.WebGLRenderer({canvas:canvas.current,alpha:true,antialias:true,powerPreference:'high-performance'});}catch{current.current.onFail();return;}
 gsap.registerPlugin(ScrollTrigger);const mobile=innerWidth<720;const viewport=()=>canvas.current!.getBoundingClientRect();let rect=viewport();renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.65));renderer.setSize(rect.width,rect.height,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 const scene=new T.Scene();scene.fog=new T.FogExp2('#d6eaf2',.004);const camera=new T.PerspectiveCamera(40,rect.width/rect.height,.2,350);const sunlight=new T.DirectionalLight('#fff0dc',3.1);sunlight.position.set(-30,60,30);scene.add(sunlight,new T.HemisphereLight('#edf6ff','#6e7d82',2));const rim=new T.DirectionalLight('#a5ddf4',1.2);rim.position.set(30,12,-30);scene.add(rim);
 const white=new T.MeshStandardMaterial({color:'#ede9df',metalness:.15,roughness:.55});const glass=new T.MeshStandardMaterial({color:'#7bb2c8',metalness:.42,roughness:.24});const stone=new T.MeshStandardMaterial({color:'#67747a',roughness:.94,flatShading:true});const grass=new T.MeshStandardMaterial({color:'#739279',roughness:.95,flatShading:true});const pink=new T.MeshBasicMaterial({color:'#f3acda'}),cyan=new T.MeshBasicMaterial({color:'#92ebf6'});const gold=new T.MeshStandardMaterial({color:'#d9c4a2',metalness:.45,roughness:.4});
 const box=new T.BoxGeometry(1,1,1),sphere=new T.IcosahedronGeometry(1,1);const groups:T.Group[]=[],clickables:T.Object3D[]=[],rotators:T.Object3D[]=[],architectureAnimations:WorldAnimation[]=[],routes:{curve:T.CatmullRomCurve3;dot:T.Mesh;offset:number}[]=[];
 function mesh(g:T.BufferGeometry,m:T.Material,parent:T.Object3D,x=0,y=0,z=0,sx=1,sy=1,sz=1){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
 function line(points:T.Vector3[],color:string,parent:T.Object3D,opacity=.65){const o=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color,transparent:true,opacity}));parent.add(o);return o;}
 function ring(parent:T.Object3D,r:number,y:number,mat:T.Material,thickness=.025){const o=mesh(new T.TorusGeometry(r,thickness,5,80),mat,parent,0,y);o.rotation.x=Math.PI/2;return o;}
 function beam(parent:T.Object3D,x:number,y:number,z:number,height:number,mat:T.Material){mesh(new T.CylinderGeometry(.023,.04,height,5),mat,parent,x,y+height/2,z);mesh(new T.CylinderGeometry(.12,.2,height,6),new T.MeshBasicMaterial({color:mat===pink?'#ff74d0':'#6deeff',transparent:true,opacity:.12,depthWrite:false}),parent,x,y+height/2,z);}
 function island(x:number,y:number,z:number,r:number,seed:number,id:string){const g=new T.Group();g.position.set(x,y,z);g.userData={world:id,baseY:y};scene.add(g);groups.push(g);const detailed=['psychology','ai','projects'].includes(id);
 if(detailed)buildFloatingFoundation(g,r,id==='projects'?.72:id==='psychology'?.8:1,seed);
 else {mesh(new T.CylinderGeometry(r,r*.18,r*1.3,13,3),stone,g,0,-r*.64);}
 if(!detailed){mesh(new T.CylinderGeometry(r*1.02,r,.27,id==='hackathons'?6:id==='technology'?4:32),white,g,0,.03);ring(g,r*.91,.21,cyan,.023);}

 for(let k=0;k<(detailed?0:13);k++){const a=k/13*Math.PI*2;const radius=r*(.76+rnd(k+seed)*.16);const h=r*(.3+rnd(k+seed+15));mesh(new T.ConeGeometry(.12+rnd(k+seed+11)*.27,h,5),stone,g,Math.cos(a)*radius,-h*.65,Math.sin(a)*radius);if(k%3===0)beam(g,Math.cos(a)*radius,-h*1.5,Math.sin(a)*radius,h*1.3,cyan);}
 for(let k=0;k<(detailed?0:(mobile?13:28));k++){const a=rnd(k+seed+340)*Math.PI*2,rr=r*(.65+rnd(k+seed+630)*.27);const h=.12+rnd(k+seed+330)*.3;mesh(sphere,grass,g,Math.cos(a)*rr,h*.5+.15,Math.sin(a)*rr,h*1.3,h,h*1.3);}
 clickables.push(g);return g;}
 // Topic-specific architectural vocabularies. Only AI uses a city skyline.
 const rose=new T.MeshStandardMaterial({color:'#d8a3cb',roughness:.45,metalness:.2});
 const amber=new T.MeshStandardMaterial({color:'#e9a66f',roughness:.4,metalness:.3});
 const violet=new T.MeshBasicMaterial({color:'#bcabff'});
 const teal=new T.MeshStandardMaterial({color:'#51bba9',roughness:.4,metalness:.4});
 function ribbon(g:T.Object3D,points:T.Vector3[],mat:T.Material,thickness=.055){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),45,thickness,7,false),mat,g)}
 function globe(g:T.Object3D,y:number,r:number){const orb=new T.Group();orb.position.y=y;g.add(orb);mesh(new T.SphereGeometry(r,32,20),new T.MeshStandardMaterial({color:'#358caa',metalness:.3,roughness:.3,transparent:true,opacity:.84}),orb);for(let i=0;i<6;i++){const m=mesh(new T.TorusGeometry(r*1.012,.017,4,70),gold,orb);m.rotation.y=i*Math.PI/6;}for(let i=-2;i<=2;i++){const lat=i*Math.PI/7;ring(orb,Math.cos(lat)*r*1.018,Math.sin(lat)*r,cyan,.015);}orb.userData.speed=.000035;rotators.push(orb);return orb}
 destinations.forEach((d,i)=>{
 const g=island(d.p[0],d.p[1],d.p[2],d.r,i*110+4,d.id);
 if(d.id==='psychology'||d.id==='ai'||d.id==='projects'){
 const built=d.id==='psychology'?buildMindGarden(g):d.id==='ai'?buildIntelligenceNexus(g):buildProjectAtelier(g);
 architectureAnimations.push(...built.animations);clickables.push(...built.exhibits);
 }
 if(d.id==='culture'){
 // Open amphitheatre and musical ribbons around an armillary globe.
 for(let j=0;j<4;j++){const tier=mesh(new T.TorusGeometry(2+j*.4,.18,8,60,Math.PI*1.5),j%2?gold:amber,g,0,.35+j*.24);tier.rotation.x=Math.PI/2;}
 globe(g,2.8,1.35);
 for(let j=0;j<3;j++){const pts=[];for(let k=0;k<22;k++){const x=-3.5+k/3;pts.push(new T.Vector3(x,1+j*.55+Math.sin(x*1.25)*.55,2.4+j*.1))}ribbon(g,pts,j%2?rose:gold,.055)}
 for(let j=0;j<4;j++){const a=j/4*Math.PI*2;const arch=mesh(new T.TorusGeometry(.7,.13,10,36,Math.PI),amber,g,Math.cos(a)*3.5,.4,Math.sin(a)*3.5);arch.rotation.y=a;}
 }
 if(d.id==='hackathons'){
 const deck=mesh(box,glass,g,0,.2,0,6,.25,5);ring(g,2.3,.55,amber,.15);
 for(let j=0;j<4;j++){const x=j%2?2.3:-2.3,z=j<2?-1.6:1.6;mesh(box,white,g,x,1,z,1.4,.16,1);mesh(box,glass,g,x,.6,z,.15,.8,.6);const prototype=mesh(new T.OctahedronGeometry(.45),j%2?pink:amber,g,x,1.6,z);prototype.userData.speed=.00065;rotators.push(prototype);}
 mesh(box,amber,g,-3,2.8,0,.18,5,.18);mesh(box,amber,g,0,5.3,0,6.2,.18,.18);mesh(box,white,g,1.6,4.3,0,.05,2,.05);const moving=mesh(new T.TorusKnotGeometry(.65,.12,60,8),pink,g,1.6,3.2,0);moving.userData.speed=.0005;rotators.push(moving);
 }
 if(d.id==='research'){
 mesh(new T.CylinderGeometry(1.5,1.8,.65,32),white,g,-1,.5,0);mesh(new T.SphereGeometry(1.4,24,16,0,Math.PI*2,0,Math.PI/2),glass,g,-1,.8,0);
 const telescope=new T.Group();g.add(telescope);telescope.position.set(-1,1.5,0);telescope.rotation.z=-.6;mesh(new T.CylinderGeometry(.27,.4,2.4,16),white,telescope,0,1);
 const starMap=new T.Group();g.add(starMap);starMap.position.set(.7,3.8,0);const stars=[];for(let j=0;j<18;j++){const a=j*2.399;const p=new T.Vector3(Math.cos(a)*(1+j*.11),Math.sin(a)*(1+j*.08),Math.sin(j)*.6);stars.push(p);mesh(sphere,violet,starMap,p.x,p.y,p.z,.07,.07,.07);if(j>0)line([stars[j-1],p],'#b8b0f8',starMap,.6)}starMap.userData.speed=.000022;rotators.push(starMap);const arc=mesh(new T.TorusGeometry(3.8,.035,6,90,Math.PI*1.7),violet,g,0,3);arc.rotation.y=.35;
 }
 if(d.id==='technology'){
 // Layered frameworks, with distributed modules connected across levels.
 for(let layer=0;layer<3;layer++){const framework=new T.Group();g.add(framework);framework.position.y=.6+layer*1.1;framework.rotation.y=layer*.22;const edge=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(5-layer*.6,.15,3.5)),new T.LineBasicMaterial({color:'#5adebf'}));framework.add(edge);for(let j=0;j<4;j++){const x=j%2?1.4:-1.4,z=j<2?-1:1;mesh(box,teal,framework,x,.3,z,.55,.5,.65);line([new T.Vector3(x,.3,z),new T.Vector3(0,.3,0)],'#77efe1',framework)}mesh(box,white,framework,0,.4,0,.75,.7,.75);}
 const orbit=new T.Group();g.add(orbit);orbit.position.y=2.8;for(let j=0;j<6;j++){const a=j/6*Math.PI*2;mesh(box,j%2?teal:white,orbit,Math.cos(a)*3.3,Math.sin(a)*.4,Math.sin(a)*3.3,.35,.35,.35)}orbit.userData.speed=.00015;rotators.push(orbit);
 }
 if(d.id==='future'){
 // Sparse open horizon: a globe and incomplete routes rather than buildings.
 globe(g,3.4,2.1);mesh(new T.CylinderGeometry(2.5,2.8,.15,48),white,g,0,.4);ring(g,2.7,.55,gold,.035);
 for(let j=0;j<4;j++){const angle=-1+j*.7;const points=[new T.Vector3(0,.6,0),new T.Vector3(Math.cos(angle)*3,2,Math.sin(angle)*3),new T.Vector3(Math.cos(angle)*8,4+j*.6,Math.sin(angle)*8)];ribbon(g,points,j%2?cyan:gold,.025);const p=points[2];mesh(new T.SphereGeometry(.1,8,6),gold,g,p.x,p.y,p.z);}
 }
 });
 function connect(aIndex:number,bIndex:number,i:number){
 const a=destinations[aIndex],b=destinations[bIndex];
 const delta=new T.Vector3(b.p[0]-a.p[0],0,b.p[2]-a.p[2]).normalize();
 const av=new T.Vector3(a.p[0],a.p[1]+.43,a.p[2]).addScaledVector(delta,a.r*.85);
 const bv=new T.Vector3(b.p[0],b.p[1]+.43,b.p[2]).addScaledVector(delta,-b.r*.85);
 const mid=av.clone().lerp(bv,.5);mid.y+=1.2;
 const curve=i<3?skyWalk(scene,[av,mid,bv],.65,white,true,i%2?pink:cyan):new T.CatmullRomCurve3([av,mid,bv]);
 if(i>=3)mesh(new T.TubeGeometry(curve,40,.025,5,false),i%2?pink:cyan,scene);
 const dot=mesh(sphere,cyan,scene,0,0,0,.07,.07,.07);routes.push({curve,dot,offset:i*.13});
 }
 [[0,1],[1,2],[2,0],[0,3],[1,4],[3,5],[5,6],[5,7],[4,7]].forEach(([a,b],i)=>connect(a,b,i));
 // Atmospheric cloud sprites: soft depth without expensive volumetric ray marching.
 const cloudCanvas=document.createElement('canvas');cloudCanvas.width=128;cloudCanvas.height=128;const ctx=cloudCanvas.getContext('2d')!;const gradient=ctx.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(255,255,255,.7)');gradient.addColorStop(.35,'rgba(246,253,255,.45)');gradient.addColorStop(1,'rgba(244,252,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const texture=new T.CanvasTexture(cloudCanvas);const clouds:T.Sprite[]=[];for(let i=0;i<(mobile?30:75);i++){const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,color:'#f0fbff',transparent:true,opacity:.45,depthWrite:false}));sprite.position.set((rnd(i+5000)-.5)*140,-8-rnd(i+5300)*10,(rnd(i+6000)-.5)*140);const size=10+rnd(i+5500)*20;sprite.scale.set(size*1.8,size,1);scene.add(sprite);clouds.push(sprite);}
 // Chapter changes drive a short camera flight; each chapter then holds its world.
 const controls=new OrbitControls(camera,canvas.current);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;controls.minDistance=8;controls.maxDistance=100;controls.maxPolarAngle=Math.PI*.49;controls.enabled=false;
 const overview={x:65,y:48,z:87,lx:0,ly:0,lz:-13};
 const target=new T.Vector3();camera.position.set(overview.x,overview.y,overview.z);
 let dirty=true,lastWorld='',lastInspect=false;
 let scrollTween:gsap.core.Tween|undefined;
 const flight={x:overview.x,y:overview.y,z:overview.z,lx:overview.lx,ly:overview.ly,lz:overview.lz};
 function waypoint(){
  const d=destinations.find(d=>d.id===current.current.active);if(!d)return overview;
  const narrow=rect.width/rect.height<1;const distance=d.id==='projects'?1.18:d.id==='ai'?1.3:1.04;
  return {x:d.p[0]+12*distance,y:d.p[1]+(d.id==='ai'?11:9)*distance,z:d.p[2]+(narrow?34:28)*distance,lx:d.p[0],ly:d.p[1]+1.2,lz:d.p[2]};
 }
 const labelElements=destinations.map(d=>{const el=document.createElement('button');el.className='island-label';el.textContent=d.name;el.setAttribute('aria-label',`Visit ${d.name.toLowerCase()}`);el.onclick=()=>current.current.onWorld(d.id);labels.current?.appendChild(el);return el});
 let pointerX=0,pointerY=0;
 const onPointer=(e:PointerEvent)=>{pointerX=((e.clientX-rect.left)/rect.width-.5)*.45;pointerY=((e.clientY-rect.top)/rect.height-.5)*.2};
 canvas.current.addEventListener('pointermove',onPointer,{passive:true});
 const ray=new T.Raycaster(),ndc=new T.Vector2();let startX=0,startY=0;
 const onDown=(e:PointerEvent)=>{startX=e.clientX;startY=e.clientY};
 const onClick=(e:MouseEvent)=>{
  if(Math.hypot(e.clientX-startX,e.clientY-startY)>6)return;
  ndc.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(ndc,camera);
  const hit=ray.intersectObjects(clickables,true).find(hit=>{let p:T.Object3D|null=hit.object;while(p){if(!p.visible)return false;p=p.parent}return true});
  if(hit){let o:T.Object3D|null=hit.object;while(o&&!o.userData.project&&!o.userData.world)o=o.parent;if(o?.userData.project)current.current.onProject(o.userData.project);else if(o?.userData.world&&current.current.active==='home')current.current.onWorld(o.userData.world)}
 };
 canvas.current.addEventListener('pointerdown',onDown);canvas.current.addEventListener('click',onClick);
 let raf=0,last=0,elapsed=0,lastReduced=false;const v=new T.Vector3(),clock=new T.Clock();
 const wake=()=>{dirty=true};controls.addEventListener('change',wake);
 function frame(time:number){
  raf=requestAnimationFrame(frame);
  if(document.hidden||time-last<1000/(mobile?30:45))return;
  const dt=Math.min(clock.getDelta(),.05);last=time;
  const reduced=current.current.reduced;
  const world=current.current.active,inspect=current.current.inspect;
  if(world!==lastWorld||inspect!==lastInspect){
   rect=viewport();camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.setSize(rect.width,rect.height,false);
   scrollTween?.kill();const next=waypoint();
   if(reduced)Object.assign(flight,next);else scrollTween=gsap.to(flight,{...next,duration:1.65,ease:'power2.inOut',onUpdate:wake});
   controls.enabled=inspect;canvas.current!.style.touchAction=inspect?'none':'pan-y';controls.target.set(next.lx,next.ly,next.lz);lastWorld=world;lastInspect=inspect;dirty=true;
  }
  if(reduced!==lastReduced){dirty=true;lastReduced=reduced}
  if(reduced&&!dirty)return;
  if(!reduced)elapsed+=dt;
  if(inspect){if(scrollTween?.isActive()){camera.position.set(flight.x,flight.y,flight.z);controls.target.set(flight.lx,flight.ly,flight.lz)}controls.update();}
  else{camera.position.set(flight.x+(reduced?0:pointerX),flight.y+(reduced?0:pointerY),flight.z);target.set(flight.lx,flight.ly,flight.lz);camera.lookAt(target);}
  groups.forEach((g,i)=>{g.visible=world==='home'||g.userData.world===world||g.position.distanceTo(camera.position)<35;g.position.y=g.userData.baseY+(reduced?0:Math.sin(elapsed*.35+i)*.07)});
  if(!reduced){rotators.forEach((o,i)=>o.rotation.y=elapsed*(o.userData.speed??.0001)*1000*(i%2?-1:1));architectureAnimations.forEach(a=>a.object.rotation[a.axis]+=dt*a.speed);routes.forEach(r=>r.dot.position.copy(r.curve.getPoint((elapsed*.04+r.offset)%1)));}
  renderer.render(scene,camera);dirty=false;
  destinations.forEach((d,i)=>{
   v.set(d.p[0],d.p[1]+d.r*.6+2,d.p[2]).project(camera);
   const x=(v.x*.5+.5)*rect.width+rect.left,y=(-v.y*.5+.5)*rect.height+rect.top;
   const show=!mobile&&world==='home'&&v.z<1&&Math.abs(v.x)<.85&&Math.abs(v.y)<.8;
   labelElements[i].style.visibility=show?'visible':'hidden';labelElements[i].style.pointerEvents=show?'auto':'none';
   labelElements[i].style.transform=`translate(${x}px,${y}px)`;
  });
 }
 const resize=()=>{rect=viewport();camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.setSize(rect.width,rect.height,false);lastWorld='';dirty=true};
 window.addEventListener('resize',resize);const canvasNode=canvas.current;
 const ro=new ResizeObserver(resize);ro.observe(canvasNode);
 const contextLost=(e:Event)=>{e.preventDefault();current.current.onFail()};
 canvasNode.addEventListener('webglcontextlost',contextLost);raf=requestAnimationFrame(frame);current.current.onReady();
 return()=>{cancelAnimationFrame(raf);scrollTween?.kill();ro.disconnect();controls.removeEventListener('change',wake);controls.dispose();window.removeEventListener('resize',resize);canvasNode.removeEventListener('pointermove',onPointer);canvasNode.removeEventListener('pointerdown',onDown);canvasNode.removeEventListener('click',onClick);canvasNode.removeEventListener('webglcontextlost',contextLost);labelElements.forEach(e=>e.remove());
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
 scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Sprite){if('geometry'in o)geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{materials.add(m);if('map'in m&&m.map instanceof T.Texture)textures.add(m.map)})}});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();};
 },[]);
 return <><canvas ref={canvas} className="sky-canvas" aria-label="Interactive sky universe. Psychology: the Mind Garden. AI: the Intelligence Nexus. Projects: one connected Project Atelier. Use Explore in 3D to orbit." role="img"/><div ref={labels} className="island-labels"/></>
}
