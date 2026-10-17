'use client';
import {useCallback,useEffect,useRef,useState,type MouseEvent} from 'react';
import dynamic from 'next/dynamic';
import SceneBoundary from './SceneBoundary';
import PortfolioSections,{ProjectDetails} from './PortfolioSections';
import {PortfolioHeader,PortfolioFooter,SceneTools,worlds} from './PortfolioNavigation';
import {projects,type PortfolioProject} from '../data/portfolio';
import type {ViewAction} from './CameraNavigation';

const SkyScene=dynamic(()=>import('./SkyScene'),{ssr:false});
export default function Portfolio(){
 const [active,setActive]=useState(0),[reduced,setReduced]=useState(false),[menu,setMenu]=useState(false),[selected,setSelected]=useState<PortfolioProject|null>(null),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[inspect,setInspect]=useState(false);
 const [traveling,setTraveling]=useState(false),[resetView,setResetView]=useState(0);
 const [preferencesReady,setPreferencesReady]=useState(false),[illustrated,setIllustrated]=useState(false),[viewCommand,setViewCommand]=useState<{sequence:number;action:ViewAction}>({sequence:0,action:'left'});
 const [sceneCovered,setSceneCovered]=useState(false);
 const focusFrame=useRef(0);
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLElement|null>(null),menuButton=useRef<HTMLButtonElement>(null),menuPanel=useRef<HTMLElement>(null),menuOpener=useRef<HTMLElement|null>(null);
 const go=useCallback((id:string,keepInspect=false,focus=true,record=true)=>{
  const index=worlds.findIndex(w=>w[0]===id),section=document.getElementById(id);if(index<0||!section)return;
  setActive(index);setMenu(false);if(!keepInspect)setInspect(false);
  // Move the document once; only the camera animates between distant destinations.
  section.scrollIntoView({behavior:'instant'});
  if(record&&location.hash!==`#${id}`)history.pushState(null,'',`#${id}`);
  cancelAnimationFrame(focusFrame.current);
  if(focus&&!keepInspect)focusFrame.current=requestAnimationFrame(()=>section.focus({preventScroll:true}));
 },[]);
 useEffect(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const read=(key:string)=>{try{return localStorage.getItem(key)}catch{return null}};
  const motion=()=>read('mind-atlas-motion');
  const stored=motion();setReduced(stored==='off'||(stored!=='on'&&preference.matches));
  const view=read('mind-atlas-view'),connection=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection;
  setIllustrated(view==='illustrated'||(view!=='3d'&&!!connection?.saveData));setPreferencesReady(true);
  const update=()=>{const value=motion();setReduced(value==='off'||(value!=='on'&&preference.matches))};
  preference.addEventListener('change',update);return()=>{preference.removeEventListener('change',update);cancelAnimationFrame(focusFrame.current)};
 },[]);
 useEffect(()=>{
  const restore=()=>{const id=location.hash.slice(1)||'home';if(worlds.some(w=>w[0]===id))go(id,false,false,false)};
  restore();window.addEventListener('hashchange',restore);return()=>window.removeEventListener('hashchange',restore);
 },[go]);
 useEffect(()=>{
  if(inspect)return;let frame=0;
  const panels=Array.from(document.querySelectorAll<HTMLElement>('.chapter'));
  const update=()=>{frame=0;let index=0;panels.forEach((panel,i)=>{if(panel.getBoundingClientRect().top<=innerHeight*.25)index=i});setActive(index);
   const stage=document.querySelector('.sky-canvas,.world-still')?.getBoundingClientRect(),header=document.querySelector('.header')?.getBoundingClientRect();
   setSceneCovered(innerWidth<=960&&!!stage&&panels.some(chapter=>{const panel=chapter.querySelector('.reading-panel')!.getBoundingClientRect();return panel.top<stage.bottom&&panel.bottom>(header?.bottom??64)}));
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  schedule();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule)};
 },[inspect]);
 useEffect(()=>{
  if(!selected){dialog.current?.close();return}
  if(!dialog.current?.open)dialog.current?.showModal();
 },[selected]);
 useEffect(()=>{
  if(!inspect&&!selected)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous};
 },[inspect,selected]);
 useEffect(()=>{
  if(!menu)return;
  const frame=requestAnimationFrame(()=>menuPanel.current?.querySelector('a')?.focus());
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setMenu(false);(menuOpener.current??menuButton.current)?.focus()}};
  const outside=(event:PointerEvent)=>{const target=event.target as Element;if(!menuPanel.current?.contains(target)&&!target.closest('[aria-controls="world-menu"]'))setMenu(false)};
  document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);
  const blur=(event:FocusEvent)=>{const target=event.target as Element;if(!menuPanel.current?.contains(target)&&!target.closest('[aria-controls="world-menu"]'))setMenu(false)};
  document.addEventListener('focusin',blur);
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',blur)};
 },[menu]);
 useEffect(()=>{
  if(!inspect)return;const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!dialog.current?.open&&!menu)go(worlds[active][0],false,true,false)};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);
 },[inspect,menu,active,go]);
 const openProject=useCallback((id:string)=>{
  const project=projects.find(p=>p.id===id);if(!project)return;
  opener.current=document.activeElement instanceof HTMLElement&&document.activeElement!==document.body?document.activeElement:document.querySelector<HTMLElement>('.scene-explore');setSelected(project);
 },[]);
 function closeProject(){dialog.current?.close();setSelected(null);opener.current?.focus({preventScroll:true})}
 function navigate(event:MouseEvent<HTMLDivElement>){
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=(event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');if(!anchor||anchor.target||anchor.hasAttribute('download'))return;
  const id=anchor.getAttribute('href')!.slice(1);if(!worlds.some(w=>w[0]===id))return;
  event.preventDefault();go(id);
 }
 function toggleMenu(){if(!menu)menuOpener.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setMenu(value=>!value)}
 function toggleMotion(){const next=!reduced;setReduced(next);try{localStorage.setItem('mind-atlas-motion',next?'off':'on')}catch{}}
 function toggleView(){const next=failed?false:!illustrated;setIllustrated(next);setInspect(false);setFailed(false);setReady(false);setTraveling(false);try{localStorage.setItem('mind-atlas-view',next?'illustrated':'3d')}catch{}}
 function enterInspection(){setMenu(false);setSceneCovered(false);setInspect(true);cancelAnimationFrame(focusFrame.current);focusFrame.current=requestAnimationFrame(()=>document.querySelector<HTMLElement>('.scene-explore')?.focus({preventScroll:true}))}
 function sceneFailure(){setReady(true);setFailed(true);setInspect(false);setTraveling(false)}
 const world=worlds[active]?.[0]??'home';
 const staticView=illustrated||failed;
 return <div className={`portfolio${reduced?' reduced':''}${failed?' webgl-fallback':''}${inspect?' inspecting':''}`} data-world={world} data-ready={ready&&!failed?'true':'false'} onClick={navigate}>
  <a className="skip" href="#projects">Skip to selected projects</a>
  <div className="sky-backdrop" aria-hidden="true"/>
  {(!ready||staticView)&&<img className="world-still" src={`/${active===0?'overview':world}-world.webp`} width={active===0?1363:1250} height={active===0?860:1000} decoding="async" fetchPriority="high" alt="" aria-hidden="true"/>}
  {preferencesReady&&!illustrated&&!failed&&<SceneBoundary onFail={sceneFailure}><SkyScene active={world} inspect={inspect} resetView={resetView} viewCommand={viewCommand} paused={menu||!!selected||(!inspect&&sceneCovered)} reduced={reduced} onTravel={setTraveling} onReady={()=>setReady(true)} onFail={sceneFailure} onProject={openProject} onWorld={id=>go(id,inspect,!inspect)}/></SceneBoundary>}
  <div className="reading-shade" aria-hidden="true"/>
  <PortfolioHeader active={active} menu={menu} onMenu={toggleMenu} reduced={reduced} onMotion={toggleMotion} illustrated={staticView} onView={toggleView} onExplore={!staticView?enterInspection:undefined} buttonRef={menuButton} menuRef={menuPanel}/>
  <SceneTools active={world} ready={ready} failed={failed} illustrated={illustrated} covered={sceneCovered&&!inspect} onView={toggleView} inspect={inspect} traveling={traveling} onReset={()=>setResetView(value=>value+1)} onViewAction={action=>setViewCommand(value=>({sequence:value.sequence+1,action}))} onInspect={()=>inspect?go(world,false,true,false):enterInspection()} onWorld={id=>go(id,true,false)}/>
  <PortfolioSections onProject={openProject} inspect={inspect}/>
  <PortfolioFooter active={active} ready={ready||staticView} reduced={reduced} onMotion={toggleMotion} onMenu={toggleMenu} menu={menu}/>
  <ProjectDetails project={selected} dialogRef={dialog} onClose={closeProject}/>
 </div>;
}
