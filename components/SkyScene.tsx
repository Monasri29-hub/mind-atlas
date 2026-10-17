'use client';
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {gsap} from 'gsap';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {buildMindGarden,buildIntelligenceNexus,buildProjectAtelier,buildCulturalCrossroads,buildInventionYard,buildObservatory,buildSystemsNexus,buildOpenHorizon,buildFloatingFoundation,finishWorld,skyWalk,type WorldAnimation} from './WorldArchitecture';
import {destinations,connections,SCENE_FOV,placeMarkers} from './WorldCatalog';
import {batchWorld} from './SceneBatch';
import {frameObjects} from './SceneFraming';
import {captureView,syncOrbitView} from './CameraNavigation';
type Props={reduced:boolean;active:string;inspect:boolean;onReady:()=>void;onFail:()=>void;onProject:(id:string)=>void;onWorld:(id:string)=>void};
const rnd=(i:number)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n)};
export default function SkyScene(props:Props){
 const canvas=useRef<HTMLCanvasElement>(null),labels=useRef<HTMLDivElement>(null),current=useRef(props);current.current=props;
 useEffect(()=>{if(!canvas.current)return;let renderer:T.WebGLRenderer;try{renderer=new T.WebGLRenderer({canvas:canvas.current,alpha:true,antialias:true,powerPreference:'high-performance'});}catch{current.current.onFail();return;}
 let alive=true,reportedReady=false;let mobile=innerWidth<=720;const coarse=matchMedia('(pointer: coarse)');const limited=()=>mobile||coarse.matches;const viewport=()=>canvas.current!.getBoundingClientRect();let rect=viewport();renderer.setPixelRatio(Math.min(devicePixelRatio,limited()?1.25:1.65));renderer.setSize(rect.width,rect.height,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const scene=new T.Scene();scene.fog=new T.Fog('#acd5e7',100,260);const camera=new T.PerspectiveCamera(SCENE_FOV,rect.width/rect.height,.2,400);const sunlight=new T.DirectionalLight('#fff0dc',2.6);sunlight.position.set(-30,60,30);scene.add(sunlight,new T.HemisphereLight('#edf6ff','#536d80',1.65));const rim=new T.DirectionalLight('#a5ddf4',.85);rim.position.set(30,12,-30);scene.add(rim);
 const skyReflection=new T.TextureLoader().load('/sky-atmosphere.webp',texture=>{if(!alive){texture.dispose();return}texture.mapping=T.EquirectangularReflectionMapping;texture.colorSpace=T.SRGBColorSpace;scene.environment=texture;scene.environmentIntensity=.35;dirty=true});
 const white=new T.MeshStandardMaterial({color:'#ede9df',metalness:.15,roughness:.55});
 const pink=new T.MeshBasicMaterial({color:'#f188cb',toneMapped:false}),cyan=new T.MeshBasicMaterial({color:'#77e8ff',toneMapped:false});
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
  buildFloatingFoundation(g,d.r,d.squash,i*110+4);
  const built=builders[d.id](g);finishWorld(g,d.id,d.r);batchWorld(g,built);architectureAnimations.push(...built.animations);clickables.push(...built.exhibits);
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
 // A small number of billowed cloud banks gives depth without washing out the worlds.
 const cloudCanvas=document.createElement('canvas');cloudCanvas.width=256;cloudCanvas.height=160;
 const ctx=cloudCanvas.getContext('2d')!;
 for(const [x,y,r]of [[55,95,48],[91,70,53],[140,64,58],[187,85,48],[218,101,34]]){
  const gradient=ctx.createRadialGradient(x,y,r*.15,x,y,r);
  gradient.addColorStop(0,'rgba(255,254,246,.72)');gradient.addColorStop(.55,'rgba(236,246,250,.5)');gradient.addColorStop(1,'rgba(215,235,246,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,256,160);
 }
 const texture=new T.CanvasTexture(cloudCanvas);texture.colorSpace=T.SRGBColorSpace;
 const clouds:T.Sprite[]=[];
 for(let i=0;i<(mobile?14:28);i++){
  const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,color:'#f4faff',transparent:true,opacity:.55,depthWrite:false}));
  sprite.position.set((rnd(i+5000)-.5)*140,-12-rnd(i+5300)*12,(rnd(i+6000)-.5)*130-12);
  const size=12+rnd(i+5500)*13;sprite.scale.set(size*1.9,size,1);scene.add(sprite);clouds.push(sprite);
 }
 // Chapter changes drive a short camera flight; each chapter then holds its world.
 const controls=new OrbitControls(camera,canvas.current);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;controls.minDistance=8;controls.maxDistance=220;controls.maxPolarAngle=Math.PI*.49;controls.enabled=false;
 const frameCache=new Map<string,ReturnType<typeof frameObjects>>();
 function waypoint(){const id=current.current.active,key=id+':'+(rect.width/rect.height).toFixed(3);let view=frameCache.get(key);if(!view){view=frameObjects(id==='home'?groups:groups.filter(g=>g.userData.world===id),id,rect.width/rect.height);frameCache.set(key,view)}return view}
 const overview=waypoint();const target=new T.Vector3(overview.lx,overview.ly,overview.lz);syncOrbitView(camera,controls,overview);
 let dirty=true,lastWorld='',lastInspect=false;
 let markerObstacles:{left:number;top:number;right:number;bottom:number}[]=[];
 const measureToolbar=()=>{markerObstacles=Array.from(document.querySelectorAll('.scene-heading,.scene-controls,.scene-destinations')).map(el=>{const r=el.getBoundingClientRect();return {left:r.left-rect.left-8,top:r.top-rect.top-8,right:r.right-rect.left+8,bottom:r.bottom-rect.top+8}})};
 let scrollTween:gsap.core.Tween|undefined;
 const flight={x:overview.x,y:overview.y,z:overview.z,lx:overview.lx,ly:overview.ly,lz:overview.lz};
 const labelElements=destinations.map((d,i)=>{
  const el=document.createElement('button');el.className='island-label';
  const number=document.createElement('span');number.textContent=String(i+1).padStart(2,'0');number.setAttribute('aria-hidden','true');
  const name=document.createElement('span');name.className='marker-name';name.textContent=d.name;name.setAttribute('aria-hidden','true');
  el.append(number,name);el.setAttribute('aria-label',`Visit ${d.short}: ${d.name}`);el.onclick=()=>current.current.onWorld(d.id);labels.current?.appendChild(el);return el;
 });

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
 const onOrbitStart=()=>{scrollTween?.kill();dirty=true};controls.addEventListener('start',onOrbitStart);
 function frame(time:number){
  raf=requestAnimationFrame(frame);
  if(document.hidden||time-last<1000/(limited()?30:45))return;
  const dt=Math.min(clock.getDelta(),.05);last=time;
  const reduced=current.current.reduced;
  const world=current.current.active,inspect=current.current.inspect;
  if(world!==lastWorld||inspect!==lastInspect){
   rect=viewport();camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.setSize(rect.width,rect.height,false);
   measureToolbar();scrollTween?.kill();const next=waypoint();
   const origin=captureView(camera,lastInspect?controls.target:target);if(!inspect&&!reduced){origin.x-=pointerX;origin.y-=pointerY}Object.assign(flight,origin);
   if(reduced||!reportedReady){Object.assign(flight,next);syncOrbitView(camera,controls,next)}
   else{syncOrbitView(camera,controls,origin);scrollTween=gsap.to(flight,{...next,duration:1.1,ease:'power2.inOut',onUpdate:wake})}
   controls.enabled=inspect;canvas.current!.style.touchAction=inspect?'none':'pan-y';lastWorld=world;lastInspect=inspect;dirty=true;
  }
  if(reduced!==lastReduced){if(reduced){const next=inspect&&!scrollTween?.isActive()?captureView(camera,controls.target):waypoint();scrollTween?.kill();Object.assign(flight,next);syncOrbitView(camera,controls,flight)}dirty=true;lastReduced=reduced}
  if(reduced&&!dirty)return;
  if(!reduced)elapsed+=dt;
  if(inspect){if(scrollTween?.isActive()){camera.position.set(flight.x,flight.y,flight.z);controls.target.set(flight.lx,flight.ly,flight.lz)}controls.update();}
  else{camera.position.set(flight.x+(reduced?0:pointerX),flight.y+(reduced?0:pointerY),flight.z);target.set(flight.lx,flight.ly,flight.lz);camera.lookAt(target);}
  groups.forEach((g,i)=>{g.position.y=g.userData.baseY+(reduced?0:Math.sin(elapsed*.35+i)*.07)});
  if(!reduced){architectureAnimations.forEach(a=>a.object.rotation[a.axis]+=dt*a.speed);routes.forEach(r=>r.dot.position.copy(r.curve.getPoint((elapsed*.04+r.offset)%1)));}
  try{renderer.render(scene,camera)}catch{current.current.onFail();return}dirty=false;if(!reportedReady){reportedReady=true;current.current.onReady()}
  const markers=placeMarkers(destinations.map((d,i)=>{
   groups[i].localToWorld(v.set(0,-d.r*.18,d.r*d.squash*.88)).project(camera);
   return {x:Math.max(!inspect&&!mobile?rect.width*.12:25,(v.x*.5+.5)*rect.width),y:(-v.y*.5+.5)*rect.height,visible:world==='home'&&v.z>-1&&v.z<1&&Math.abs(v.x)<.96&&Math.abs(v.y)<.92};
  }),rect.width,rect.height,markerObstacles);
  markers.forEach((p,i)=>{
   const el=labelElements[i];el.style.visibility=p.visible?'visible':'hidden';el.style.pointerEvents=p.visible?'auto':'none';
   el.style.transform=`translate3d(${p.x+rect.left-18}px,${p.y+rect.top-18}px,0)`;
  });

 }
 const resize=()=>{mobile=innerWidth<=720;rect=viewport();camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,limited()?1.25:1.65));renderer.setSize(rect.width,rect.height,false);lastWorld='';dirty=true};
 window.addEventListener('resize',resize);const canvasNode=canvas.current;
 const ro=new ResizeObserver(resize);ro.observe(canvasNode);
 const toolbarObserver=new ResizeObserver(()=>{measureToolbar();dirty=true});const toolbar=document.querySelector('.scene-tools');if(toolbar)toolbarObserver.observe(toolbar);
 const contextLost=(e:Event)=>{e.preventDefault();current.current.onFail()};
 canvasNode.addEventListener('webglcontextlost',contextLost);raf=requestAnimationFrame(frame);
 return()=>{alive=false;cancelAnimationFrame(raf);scrollTween?.kill();ro.disconnect();toolbarObserver.disconnect();controls.removeEventListener('change',wake);controls.removeEventListener('start',onOrbitStart);controls.dispose();window.removeEventListener('resize',resize);canvasNode.removeEventListener('pointermove',onPointer);canvasNode.removeEventListener('pointerdown',onDown);canvasNode.removeEventListener('click',onClick);canvasNode.removeEventListener('webglcontextlost',contextLost);labelElements.forEach(e=>e.remove());
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
 scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Sprite){if('geometry'in o)geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{materials.add(m);if('map'in m&&m.map instanceof T.Texture)textures.add(m.map)})}});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());skyReflection.dispose();renderer.dispose();};
 },[]);
 return <><canvas ref={canvas} className="sky-canvas" aria-label="Eight connected floating worlds, each with distinct architecture. Five projects share one Project Atelier. Use Explore in 3D to orbit; all portfolio details are available in the content panels." role="img"/><div ref={labels} className="island-labels"/></>
}
