'use client';
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {gsap} from 'gsap';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {buildMindGarden,buildIntelligenceNexus,buildProjectAtelier,buildCulturalCrossroads,buildInventionYard,buildObservatory,buildSystemsNexus,buildOpenHorizon,buildFloatingFoundation,skyWalk,type WorldAnimation} from './WorldArchitecture';
import {destinations,connections,overview,worldView} from './WorldCatalog';
import {batchWorld} from './SceneBatch';
type Props={reduced:boolean;active:string;inspect:boolean;onReady:()=>void;onFail:()=>void;onProject:(id:string)=>void;onWorld:(id:string)=>void};
const rnd=(i:number)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n)};
export default function SkyScene(props:Props){
 const canvas=useRef<HTMLCanvasElement>(null),labels=useRef<HTMLDivElement>(null),current=useRef(props);current.current=props;
 useEffect(()=>{if(!canvas.current)return;let renderer:T.WebGLRenderer;try{renderer=new T.WebGLRenderer({canvas:canvas.current,alpha:true,antialias:true,powerPreference:'high-performance'});}catch{current.current.onFail();return;}
 const mobile=innerWidth<720;const viewport=()=>canvas.current!.getBoundingClientRect();let rect=viewport();renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.65));renderer.setSize(rect.width,rect.height,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 const scene=new T.Scene();scene.fog=new T.FogExp2('#d6eaf2',.004);const camera=new T.PerspectiveCamera(40,rect.width/rect.height,.2,350);const sunlight=new T.DirectionalLight('#fff0dc',3.1);sunlight.position.set(-30,60,30);scene.add(sunlight,new T.HemisphereLight('#edf6ff','#6e7d82',2));const rim=new T.DirectionalLight('#a5ddf4',1.2);rim.position.set(30,12,-30);scene.add(rim);
 const white=new T.MeshStandardMaterial({color:'#ede9df',metalness:.15,roughness:.55});
 const pink=new T.MeshBasicMaterial({color:'#f3acda'}),cyan=new T.MeshBasicMaterial({color:'#92ebf6'});
 const sphere=new T.IcosahedronGeometry(1,1);
 const groups:T.Group[]=[],clickables:T.Object3D[]=[],architectureAnimations:WorldAnimation[]=[],routes:{curve:T.CatmullRomCurve3;dot:T.Mesh;offset:number}[]=[];
 function mesh(g:T.BufferGeometry,m:T.Material,parent:T.Object3D,x=0,y=0,z=0,sx=1,sy=1,sz=1){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
 const builders:Record<string,(parent:T.Group)=>{animations:WorldAnimation[];exhibits:T.Object3D[]}>={
  psychology:buildMindGarden,ai:buildIntelligenceNexus,projects:buildProjectAtelier,
  culture:buildCulturalCrossroads,hackathons:buildInventionYard,research:buildObservatory,
  technology:buildSystemsNexus,future:buildOpenHorizon
 };
 destinations.forEach((d,i)=>{
  const g=new T.Group();g.position.set(...d.p as [number,number,number]);g.userData={world:d.id,baseY:d.p[1]};scene.add(g);groups.push(g);clickables.push(g);
  buildFloatingFoundation(g,d.r,d.id==='projects'?.72:d.id==='psychology'?.8:1,i*110+4);
  const built=builders[d.id](g);batchWorld(g,built);architectureAnimations.push(...built.animations);clickables.push(...built.exhibits);
 });
 function connect(aIndex:number,bIndex:number,i:number){
 const a=destinations[aIndex],b=destinations[bIndex];
 const delta=new T.Vector3(b.p[0]-a.p[0],0,b.p[2]-a.p[2]).normalize();
 const av=new T.Vector3(a.p[0],a.p[1]+.43,a.p[2]).addScaledVector(delta,a.r*.85);
 const bv=new T.Vector3(b.p[0],b.p[1]+.43,b.p[2]).addScaledVector(delta,-b.r*.85);
 const mid=av.clone().lerp(bv,.5);mid.y+=1.2;
 const curve=i<6?skyWalk(scene,[av,mid,bv],.65,white,i<3,i%2?pink:cyan):new T.CatmullRomCurve3([av,mid,bv]);
 if(i>=6)mesh(new T.TubeGeometry(curve,40,.025,5,false),i%2?pink:cyan,scene);
 const dot=mesh(sphere,cyan,scene,0,0,0,.07,.07,.07);routes.push({curve,dot,offset:i*.13});
 }
 connections.forEach(([a,b],i)=>connect(a,b,i));
 // Atmospheric cloud sprites: soft depth without expensive volumetric ray marching.
 const cloudCanvas=document.createElement('canvas');cloudCanvas.width=128;cloudCanvas.height=128;const ctx=cloudCanvas.getContext('2d')!;const gradient=ctx.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(255,255,255,.7)');gradient.addColorStop(.35,'rgba(246,253,255,.45)');gradient.addColorStop(1,'rgba(244,252,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const texture=new T.CanvasTexture(cloudCanvas);const clouds:T.Sprite[]=[];for(let i=0;i<(mobile?30:75);i++){const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,color:'#f0fbff',transparent:true,opacity:.45,depthWrite:false}));sprite.position.set((rnd(i+5000)-.5)*140,-8-rnd(i+5300)*10,(rnd(i+6000)-.5)*140);const size=10+rnd(i+5500)*20;sprite.scale.set(size*1.8,size,1);scene.add(sprite);clouds.push(sprite);}
 // Chapter changes drive a short camera flight; each chapter then holds its world.
 const controls=new OrbitControls(camera,canvas.current);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;controls.minDistance=8;controls.maxDistance=100;controls.maxPolarAngle=Math.PI*.49;controls.enabled=false;
 const target=new T.Vector3();camera.position.set(overview.x,overview.y,overview.z);
 let dirty=true,lastWorld='',lastInspect=false;
 let scrollTween:gsap.core.Tween|undefined;
 const flight={x:overview.x,y:overview.y,z:overview.z,lx:overview.lx,ly:overview.ly,lz:overview.lz};
 function waypoint(){return worldView(current.current.active,rect.width/rect.height)}
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
  if(reduced!==lastReduced){if(reduced){scrollTween?.kill();Object.assign(flight,waypoint())}dirty=true;lastReduced=reduced}
  if(reduced&&!dirty)return;
  if(!reduced)elapsed+=dt;
  if(inspect){if(scrollTween?.isActive()){camera.position.set(flight.x,flight.y,flight.z);controls.target.set(flight.lx,flight.ly,flight.lz)}controls.update();}
  else{camera.position.set(flight.x+(reduced?0:pointerX),flight.y+(reduced?0:pointerY),flight.z);target.set(flight.lx,flight.ly,flight.lz);camera.lookAt(target);}
  groups.forEach((g,i)=>{g.visible=world==='home'||g.userData.world===world||g.position.distanceTo(camera.position)<35;g.position.y=g.userData.baseY+(reduced?0:Math.sin(elapsed*.35+i)*.07)});
  if(!reduced){architectureAnimations.forEach(a=>a.object.rotation[a.axis]+=dt*a.speed);routes.forEach(r=>r.dot.position.copy(r.curve.getPoint((elapsed*.04+r.offset)%1)));}
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
 return <><canvas ref={canvas} className="sky-canvas" aria-label="Eight connected floating worlds, each with distinct architecture. Five projects share one Project Atelier. Use Explore in 3D to orbit; all portfolio details are available in the content panels." role="img"/><div ref={labels} className="island-labels"/></>
}
