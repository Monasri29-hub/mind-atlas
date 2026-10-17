'use client';
import {useCallback,useEffect,useRef,useState,type MouseEvent} from 'react';
import dynamic from 'next/dynamic';
import SceneBoundary from './SceneBoundary';
import PortfolioSections,{ProjectDetails} from './PortfolioSections';
import {PortfolioHeader,PortfolioFooter,SceneTools,worlds} from './PortfolioNavigation';
import {projects,type PortfolioProject} from '../data/portfolio';

const SkyScene=dynamic(()=>import('./SkyScene'),{ssr:false});
export default function Portfolio(){
 const [active,setActive]=useState(0),[reduced,setReduced]=useState(false),[menu,setMenu]=useState(false),[selected,setSelected]=useState<PortfolioProject|null>(null),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[inspect,setInspect]=useState(false);
 const [traveling,setTraveling]=useState(false),[resetView,setResetView]=useState(0);
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLElement|null>(null),menuButton=useRef<HTMLButtonElement>(null),menuPanel=useRef<HTMLElement>(null),menuOpener=useRef<HTMLElement|null>(null);
 const go=useCallback((id:string,keepInspect=false,focus=true,record=true)=>{
  const index=worlds.findIndex(w=>w[0]===id),section=document.getElementById(id);if(index<0||!section)return;
  setActive(index);setMenu(false);if(!keepInspect)setInspect(false);
  // Move the document once; only the camera animates between distant destinations.
  section.scrollIntoView({behavior:'instant'});
  if(record&&location.hash!==`#${id}`)history.pushState(null,'',`#${id}`);
  if(focus&&!keepInspect)section.focus({preventScroll:true});
 },[]);
 useEffect(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)');setReduced(preference.matches);
  const update=()=>setReduced(preference.matches);preference.addEventListener('change',update);return()=>preference.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  const restore=()=>{const id=location.hash.slice(1)||'home';if(worlds.some(w=>w[0]===id))go(id,false,false,false)};
  restore();window.addEventListener('hashchange',restore);return()=>window.removeEventListener('hashchange',restore);
 },[go]);
 useEffect(()=>{
  if(inspect)return;let frame=0;
  const panels=Array.from(document.querySelectorAll<HTMLElement>('.chapter'));
  const update=()=>{frame=0;let index=0;panels.forEach((panel,i)=>{if(panel.getBoundingClientRect().top<=innerHeight*.25)index=i});setActive(index)};
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
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside)};
 },[menu]);
 useEffect(()=>{
  if(!inspect)return;const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!dialog.current?.open&&!menu)setInspect(false)};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);
 },[inspect,menu]);
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
 function sceneFailure(){setReady(true);setFailed(true);setInspect(false);setTraveling(false)}
 const world=worlds[active]?.[0]??'home';
 return <div className={`portfolio${reduced?' reduced':''}${failed?' webgl-fallback':''}${inspect?' inspecting':''}`} data-world={world} data-ready={ready&&!failed?'true':'false'} onClick={navigate}>
  <a className="skip" href="#projects">Skip to selected projects</a>
  <div className="sky-backdrop" aria-hidden="true"/>
  {(!ready||failed)&&<img className="world-still" src={`/${active===0?'overview':world}-world.webp`} alt="" aria-hidden="true"/>}
  {!failed&&<SceneBoundary onFail={sceneFailure}><SkyScene active={world} inspect={inspect} resetView={resetView} reduced={reduced} onTravel={setTraveling} onReady={()=>setReady(true)} onFail={sceneFailure} onProject={openProject} onWorld={id=>go(id,inspect,!inspect)}/></SceneBoundary>}
  <div className="reading-shade" aria-hidden="true"/>
  <PortfolioHeader active={active} menu={menu} onMenu={toggleMenu} reduced={reduced} onMotion={()=>setReduced(value=>!value)} buttonRef={menuButton} menuRef={menuPanel}/>
  <SceneTools active={world} ready={ready} failed={failed} inspect={inspect} traveling={traveling} onReset={()=>setResetView(value=>value+1)} onInspect={()=>{setMenu(false);setInspect(value=>!value)}} onWorld={id=>go(id,true,false)}/>
  <PortfolioSections onProject={openProject}/>
  <PortfolioFooter active={active} ready={ready} reduced={reduced} onMotion={()=>setReduced(value=>!value)} onMenu={toggleMenu} menu={menu}/>
  <ProjectDetails project={selected} dialogRef={dialog} onClose={closeProject}/>
 </div>;
}
