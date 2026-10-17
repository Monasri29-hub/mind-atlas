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
 const [active,setActive]=useState(0),[reduced,setReduced]=useState(false),[menu,setMenu]=useState(false);
 const [selected,setSelected]=useState<PortfolioProject|null>(null),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[inspect,setInspect]=useState(false);
 const [sceneEpoch,setSceneEpoch]=useState(0),[preferencesReady,setPreferencesReady]=useState(false),[traveling,setTraveling]=useState(false),[resetView,setResetView]=useState(0);
 const [viewCommand,setViewCommand]=useState<{sequence:number;action:ViewAction}>({sequence:0,action:'left'});
 const focusFrame=useRef(0),dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLElement|null>(null);
 const menuButton=useRef<HTMLButtonElement>(null),menuPanel=useRef<HTMLElement>(null),menuOpener=useRef<HTMLElement|null>(null);
 const world=worlds[active][0];

 const go=useCallback((id:string,keepInspect=false,focus=true,record=true)=>{
  const index=worlds.findIndex(w=>w[0]===id),section=document.getElementById(id);
  if(index<0||!section)return;
  setActive(index);setMenu(false);if(!keepInspect)setInspect(false);
  if(record&&location.hash!==`#${id}`)history.pushState(null,'',`#${id}`);
  cancelAnimationFrame(focusFrame.current);
  if(focus&&!keepInspect)focusFrame.current=requestAnimationFrame(()=>section.focus({preventScroll:true}));
 },[]);

 const openWorld=useCallback((id:string)=>{
  const index=worlds.findIndex(w=>w[0]===id);if(index<0)return;
  if(failed){setReady(false);setFailed(false);setSceneEpoch(value=>value+1)}
  setActive(index);setMenu(false);setFailed(false);setInspect(true);
  cancelAnimationFrame(focusFrame.current);
  focusFrame.current=requestAnimationFrame(()=>document.querySelector<HTMLElement>('.scene-explore')?.focus({preventScroll:true}));
 },[failed]);

 useEffect(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{let stored:string|null=null;try{stored=localStorage.getItem('mind-atlas-motion')}catch{}
   setReduced(stored==='off'||(stored!=='on'&&preference.matches));
  };
  update();setPreferencesReady(true);preference.addEventListener('change',update);
  return()=>{preference.removeEventListener('change',update);cancelAnimationFrame(focusFrame.current)};
 },[]);
 useEffect(()=>{
  const restore=()=>{const id=location.hash.slice(1)||'home';if(worlds.some(w=>w[0]===id))go(id,false,false,false)};
  restore();window.addEventListener('hashchange',restore);return()=>window.removeEventListener('hashchange',restore);
 },[go]);
 // Reading never changes the world or interrupts the camera. Travel is explicit.
 useEffect(()=>{window.scrollTo({top:0,behavior:'auto'})},[active]);
 useEffect(()=>{if(!selected){dialog.current?.close();return}if(!dialog.current?.open)dialog.current?.showModal()},[selected]);
 useEffect(()=>{
  if(!inspect&&!selected)return;
  const root=document.documentElement,previousRoot=root.style.overflow,previousBody=document.body.style.overflow;
  root.style.overflow='hidden';document.body.style.overflow='hidden';
  return()=>{root.style.overflow=previousRoot;document.body.style.overflow=previousBody};
 },[inspect,selected]);
 useEffect(()=>{
  if(!menu)return;
  const frame=requestAnimationFrame(()=>menuPanel.current?.querySelector('a')?.focus());
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setMenu(false);(menuOpener.current??menuButton.current)?.focus()}};
  const outside=(event:PointerEvent|FocusEvent)=>{const target=event.target as Element;
   if(!menuPanel.current?.contains(target)&&!target.closest('[aria-controls="world-menu"]'))setMenu(false);
  };
  document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);document.addEventListener('focusin',outside);
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside)};
 },[menu]);
 useEffect(()=>{
  if(!inspect)return;
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!dialog.current?.open&&!menu)go(worlds[active][0],false,true,false)};
  window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);
 },[inspect,menu,active,go]);

 const openProject=useCallback((id:string)=>{
  const project=projects.find(p=>p.id===id);if(!project)return;
  opener.current=document.activeElement instanceof HTMLElement&&document.activeElement!==document.body?document.activeElement:document.querySelector<HTMLElement>('.scene-explore');
  setSelected(project);
 },[]);
 function closeProject(){dialog.current?.close();setSelected(null);opener.current?.focus({preventScroll:true})}
 function navigate(event:MouseEvent<HTMLDivElement>){
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=(event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
  if(!anchor||anchor.target||anchor.hasAttribute('download'))return;
  const id=anchor.getAttribute('href')!.slice(1);if(!worlds.some(w=>w[0]===id))return;
  const keepInspect=inspect&&!!anchor.closest('.world-navigation,.mobile-travel,.world-menu-links');
  event.preventDefault();go(id,keepInspect,!keepInspect);
 }
 function toggleMenu(){if(!menu)menuOpener.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setMenu(value=>!value)}
 function toggleMotion(){const next=!reduced;setReduced(next);try{localStorage.setItem('mind-atlas-motion',next?'off':'on')}catch{}}
 function sceneFailure(){setReady(false);setFailed(true);setTraveling(false);setInspect(false)}

 return <div className={`portfolio${reduced?' reduced':''}${inspect?' inspecting':''}`} data-world={world} data-ready={ready&&!failed?'true':'false'} onClick={navigate}>
  <a className="skip" href="#projects">Skip to selected projects</a>
  <div className="sky-backdrop" aria-hidden="true"/>
  <div className="world-stage" aria-label="Live 3D floating world">
   {(!ready||failed)&&<div className="scene-loading" role="status"><span className="loading-orbit" aria-hidden="true"/><strong>{failed?'3D could not start on this device.':'Building your view of the atlas…'}</strong><p>{failed?'Your portfolio details remain readable. Use Retry 3D to try again.':'Eight modeled worlds, connected above the clouds.'}</p></div>}
   {preferencesReady&&!failed&&<SceneBoundary key={sceneEpoch} onFail={sceneFailure}><SkyScene active={world} inspect={inspect} resetView={resetView} viewCommand={viewCommand} paused={menu||!!selected} reduced={reduced} onTravel={setTraveling} onReady={()=>setReady(true)} onFail={sceneFailure} onProject={openProject} onWorld={id=>go(id,inspect,!inspect)}/></SceneBoundary>}
  </div>
  <SceneTools active={world} ready={ready} failed={failed} inspect={inspect} traveling={traveling} onView={()=>{setReady(false);setFailed(false);setSceneEpoch(value=>value+1)}} onReset={()=>setResetView(value=>value+1)} onViewAction={action=>setViewCommand(value=>({sequence:value.sequence+1,action}))} onInspect={()=>inspect?go(world,false,true,false):openWorld(world)}/>
  <PortfolioHeader active={active} menu={menu} onMenu={toggleMenu} reduced={reduced} onMotion={toggleMotion} onExplore={()=>openWorld(world)} buttonRef={menuButton} menuRef={menuPanel}/>
  <PortfolioSections onProject={openProject} inspect={inspect} active={world}/>
  <PortfolioFooter active={active} ready={ready} reduced={reduced} onMotion={toggleMotion} onMenu={toggleMenu} menu={menu}/>
  <ProjectDetails project={selected} dialogRef={dialog} onClose={closeProject}/>
 </div>;
}
