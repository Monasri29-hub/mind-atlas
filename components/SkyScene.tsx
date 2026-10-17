'use client';
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {gsap} from 'gsap';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {buildMindGarden,buildIntelligenceNexus,buildProjectAtelier,buildCulturalCrossroads,buildInventionYard,buildObservatory,buildSystemsNexus,buildOpenHorizon,buildFloatingFoundation,finishWorld,type WorldAnimation} from './WorldArchitecture';
import {destinations,SCENE_FOV,placeMarkers} from './WorldCatalog';
import {createCloudTexture,buildSkyEnvironment} from './SkyEnvironment';
import {buildSkyRoutes} from './SkyRoutes';
import {batchWorld} from './SceneBatch';
import {frameObjects} from './SceneFraming';
import {captureView,syncOrbitView} from './CameraNavigation';
type Props={reduced:boolean;active:string;inspect:boolean;onReady:()=>void;onFail:()=>void;onProject:(id:string)=>void;onWorld:(id:string)=>void};
export default function SkyScene(props:Props){
 const canvas=useRef<HTMLCanvasElement>(null),labels=useRef<HTMLDivElement>(null),current=useRef(props);current.current=props;
 useEffect(()=>{if(!canvas.current)return;let renderer:T.WebGLRenderer;try{renderer=new T.WebGLRenderer({canvas:canvas.current,alpha:true,antialias:true,powerPreference:'high-performance'});}catch{current.current.onFail();return;}
 let alive=true,reportedReady=false;let mobile=innerWidth<=720;const coarse=matchMedia('(pointer: coarse)');const limited=()=>mobile||coarse.matches;const viewport=()=>canvas.current!.getBoundingClientRect();let rect=viewport();renderer.setPixelRatio(Math.min(devicePixelRatio,limited()?1.25:1.65));renderer.setSize(rect.width,rect.height,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const scene=new T.Scene();scene.fog=new T.Fog('#a7cee3',130,330);const camera=new T.PerspectiveCamera(SCENE_FOV,rect.width/rect.height,.2,400);
 const sunlight=new T.DirectionalLight('#fff0d9',3.1);sunlight.position.set(-35,65,35);sunlight.castShadow=true;sunlight.shadow.mapSize.set(2048,2048);sunlight.shadow.bias=-.0002;sunlight.shadow.normalBias=.035;sunlight.shadow.camera.near=.5;sunlight.shadow.camera.far=180;
 scene.add(sunlight,sunlight.target,new T.HemisphereLight('#e5f3ff','#5a7381',1.25));const rim=new T.DirectionalLight('#b8def2',.65);rim.position.set(35,18,-35);scene.add(rim);
 renderer.shadowMap.enabled=!limited();renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
 const skyReflection=new T.TextureLoader().load('/sky-atmosphere.webp',texture=>{if(!alive){texture.dispose();return}texture.mapping=T.EquirectangularReflectionMapping;texture.colorSpace=T.SRGBColorSpace;scene.environment=texture;scene.environmentIntensity=.3;dirty=true});
 const groups:T.Group[]=[],clickables:T.Object3D[]=[],architectureAnimations:WorldAnimation[]=[];
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
 const transit=buildSkyRoutes(scene),atmosphere=buildSkyEnvironment(scene,createCloudTexture(),limited());
 function updateLighting(){
  const selected=current.current.active==='home'?groups:groups.filter(g=>g.userData.world===current.current.active);
  const center=new T.Box3().setFromObject(selected[0],true);
  selected.slice(1).forEach(g=>center.union(new T.Box3().setFromObject(g,true)));
  const focus=center.getCenter(new T.Vector3()),extent=current.current.active==='home'?65:(destinations.find(d=>d.id===current.current.active)?.r??6)*1.7;
  sunlight.target.position.copy(focus);sunlight.position.copy(focus).add(new T.Vector3(-35,65,35));sunlight.target.updateMatrixWorld();
  Object.assign(sunlight.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent});sunlight.shadow.camera.updateProjectionMatrix();
  renderer.shadowMap.enabled=!limited();renderer.shadowMap.needsUpdate=true;
 }
 groups.forEach(g=>g.traverse(o=>{
  if(!(o instanceof T.Mesh))return;o.receiveShadow=true;
  const material=Array.isArray(o.material)?o.material[0]:o.material;
  o.castShadow=!(o instanceof T.InstancedMesh)&&!material.transparent&&!(material instanceof T.MeshBasicMaterial)&&!('vertexColors'in material&&material.vertexColors);
 }));
 updateLighting();
 // Chapter changes drive a short camera flight; each chapter then holds its world.
 const controls=new OrbitControls(camera,canvas.current);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;controls.minDistance=8;controls.maxDistance=360;controls.maxPolarAngle=Math.PI*.49;controls.enabled=false;
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
   measureToolbar();updateLighting();scrollTween?.kill();const next=waypoint();
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
  // Follow the actual camera distance so haze never jumps at a chapter boundary.
  if(scene.fog instanceof T.Fog){scene.fog.near=Math.max(45,camera.position.distanceTo(inspect?controls.target:target)*.76);scene.fog.far=scene.fog.near+190}
  groups.forEach((g,i)=>{g.position.y=g.userData.baseY+(reduced?0:Math.sin(elapsed*.35+i)*.07)});
  if(!reduced)architectureAnimations.forEach(a=>a.object.rotation[a.axis]+=dt*a.speed);
  atmosphere.update(elapsed,reduced);transit.update(elapsed,reduced);
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
 const resize=()=>{mobile=innerWidth<=720;rect=viewport();camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,limited()?1.25:1.65));renderer.setSize(rect.width,rect.height,false);atmosphere.setLimited(limited());updateLighting();lastWorld='';dirty=true};
 window.addEventListener('resize',resize);const canvasNode=canvas.current;
 const ro=new ResizeObserver(resize);ro.observe(canvasNode);
 const toolbarObserver=new ResizeObserver(()=>{measureToolbar();dirty=true});const toolbar=document.querySelector('.scene-tools');if(toolbar)toolbarObserver.observe(toolbar);
 const contextLost=(e:Event)=>{e.preventDefault();current.current.onFail()};
 canvasNode.addEventListener('webglcontextlost',contextLost);raf=requestAnimationFrame(frame);
 return()=>{alive=false;cancelAnimationFrame(raf);scrollTween?.kill();ro.disconnect();toolbarObserver.disconnect();controls.removeEventListener('change',wake);controls.removeEventListener('start',onOrbitStart);controls.dispose();window.removeEventListener('resize',resize);canvasNode.removeEventListener('pointermove',onPointer);canvasNode.removeEventListener('pointerdown',onDown);canvasNode.removeEventListener('click',onClick);canvasNode.removeEventListener('webglcontextlost',contextLost);labelElements.forEach(e=>e.remove());
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
 scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Sprite){if('geometry'in o)geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{materials.add(m);if('map'in m&&m.map instanceof T.Texture)textures.add(m.map)})}});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());skyReflection.dispose();sunlight.shadow.dispose();renderer.dispose();};
 },[]);
 return <><canvas ref={canvas} className="sky-canvas" aria-label="Eight connected floating worlds, each with distinct architecture. Five projects share one Project Atelier. Use Explore in 3D to orbit; all portfolio details are available in the content panels." role="img"/><div ref={labels} className="island-labels"/></>
}
