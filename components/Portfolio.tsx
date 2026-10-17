'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import SceneBoundary from './SceneBoundary';
import PortfolioSections,{ProjectDetails} from './PortfolioSections';
import {PortfolioHeader,PortfolioFooter,SceneTools,worlds} from './PortfolioNavigation';
import {projects,type PortfolioProject} from '../data/portfolio';

const SkyScene=dynamic(()=>import('./SkyScene'),{ssr:false});
export default function Portfolio(){
 const [active,setActive]=useState(0),[reduced,setReduced]=useState(false),[menu,setMenu]=useState(false),[selected,setSelected]=useState<PortfolioProject|null>(null),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[inspect,setInspect]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLElement|null>(null),menuButton=useRef<HTMLButtonElement>(null),menuPanel=useRef<HTMLElement>(null);
 useEffect(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)');setReduced(preference.matches);
  const update=()=>setReduced(preference.matches);preference.addEventListener('change',update);return()=>preference.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const id=entry.target.closest('.chapter')?.id,index=worlds.findIndex(w=>w[0]===id);if(index>=0)setActive(index)})},{rootMargin:'-16% 0px -38% 0px',threshold:0});
  document.querySelectorAll('.reading-panel').forEach(panel=>observer.observe(panel));return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  if(!selected){dialog.current?.close();return}
  const previousOverflow=document.body.style.overflow;if(!dialog.current?.open)dialog.current?.showModal();document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previousOverflow};
 },[selected]);
 useEffect(()=>{
  if(!menu)return;
  const frame=requestAnimationFrame(()=>menuPanel.current?.querySelector('a')?.focus());
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setMenu(false);menuButton.current?.focus()}};
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
 function go(id:string){document.getElementById(id)?.scrollIntoView({behavior:reduced?'instant':'smooth'});setMenu(false)}
 function readPortfolio(){setInspect(false);setMenu(false)}
 function sceneFailure(){setReady(true);setFailed(true);setInspect(false)}
 const world=worlds[active]?.[0]??'home';
 return <div className={`portfolio${reduced?' reduced':''}${failed?' webgl-fallback':''}${inspect?' inspecting':''}`} data-world={world} data-ready={ready&&!failed?'true':'false'}>
  <a className="skip" href="#projects" onClick={readPortfolio}>Skip to selected projects</a>
  <div className="sky-backdrop" aria-hidden="true"/>
  {(!ready||failed)&&<img className="world-still" src={`/${active===0?'overview':world}-world.webp`} alt="" aria-hidden="true"/>}
  {!failed&&<SceneBoundary onFail={sceneFailure}><SkyScene active={world} inspect={inspect} reduced={reduced} onReady={()=>setReady(true)} onFail={sceneFailure} onProject={openProject} onWorld={go}/></SceneBoundary>}
  <div className="reading-shade" aria-hidden="true"/>
  <PortfolioHeader active={active} menu={menu} onMenu={()=>setMenu(value=>!value)} onRead={readPortfolio} reduced={reduced} onMotion={()=>setReduced(value=>!value)} buttonRef={menuButton} menuRef={menuPanel}/>
  <SceneTools active={world} ready={ready} failed={failed} inspect={inspect} onInspect={()=>{setMenu(false);setInspect(value=>!value)}} onWorld={go}/>
  <PortfolioSections onProject={openProject}/>
  <PortfolioFooter active={active} ready={ready} reduced={reduced} onMotion={()=>setReduced(value=>!value)} onMenu={()=>setMenu(value=>!value)} menu={menu}/>
  <ProjectDetails project={selected} dialogRef={dialog} onClose={closeProject}/>
 </div>;
}
