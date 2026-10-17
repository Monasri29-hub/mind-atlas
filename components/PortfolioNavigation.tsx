import type {RefObject} from 'react';
import type {ViewAction} from './CameraNavigation';

export const worlds=[['home','Overview'],['psychology','Psychology'],['ai','AI'],['projects','Projects'],['culture','Culture'],['hackathons','Hackathons'],['research','Research'],['technology','Technology'],['future','Future']] as const;
const sceneNames:Record<string,[string,string]>={home:['The Mind Atlas','Eight worlds of connected curiosity'],psychology:['The Mind Garden','Psychology'],ai:['Intelligence Nexus','Artificial intelligence'],projects:['The Project Atelier','Selected projects'],culture:['Cultural Crossroads','Culture'],hackathons:['The Invention Yard','Hackathons'],research:['The Observatory','Research'],technology:['The Systems Nexus','Technology'],future:['The Open Horizon','Next chapter']};
type MenuProps={active:number;menu:boolean;onMenu:()=>void;reduced:boolean;onMotion:()=>void;onExplore?:()=>void;buttonRef:RefObject<HTMLButtonElement|null>;menuRef:RefObject<HTMLElement|null>};

export function PortfolioHeader({active,menu,onMenu,reduced,onMotion,onExplore,buttonRef,menuRef}:MenuProps){
 return <header className="header">
  <a className="brand" href="#home" aria-label="Mind Atlas, Monasri’s portfolio overview"><svg className="brand-symbol" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="13"/><ellipse cx="24" cy="24" rx="23" ry="7" transform="rotate(-28 24 24)"/><circle className="orbit-point" cx="43" cy="14" r="3"/></svg><span>MIND ATLAS<span className="brand-small">MONASRI</span></span></a>
  <nav className="professional-nav" aria-label="Main navigation"><a href="#projects">Projects</a><a href="#psychology">About</a><a href="#research">Research</a><a href="#future">Contact <span aria-hidden="true">↗</span></a></nav>
  <button ref={buttonRef} className="menu-button" onClick={onMenu} aria-expanded={menu} aria-controls="world-menu"><span className="menu-desktop-label">{menu?'Close':'Worlds'}</span><span className="menu-mobile-label">{menu?'Close':'Menu'}</span><span aria-hidden="true">{menu?'×':'☰'}</span></button>
  <nav ref={menuRef} id="world-menu" hidden={!menu} className="world-menu" aria-label="All worlds and profile links">
   <p className="content-label">Choose a world</p><div className="world-menu-links">{worlds.map(([id,label],i)=><a key={id} href={`#${id}`} aria-current={active===i?'location':undefined}><span className="menu-number" aria-hidden="true">{String(i).padStart(2,'0')}</span><span>{label}</span><span aria-hidden="true">↗</span></a>)}</div>
   <div className="menu-profiles"><a href="https://www.linkedin.com/in/kundeti-monasri-3650ba326" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://github.com/Monasri29-hub" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>
   <button className="menu-motion" onClick={onMotion} aria-pressed={reduced}>Reduce motion <span>{reduced?'On':'Off'}</span></button>
   {onExplore&&<button className="menu-explore" onClick={onExplore}>Orbit current world <span aria-hidden="true">↗</span></button>}
  </nav>
 </header>;
}

export function PortfolioFooter({active,reduced,onMotion,onMenu,menu,ready}:{active:number;reduced:boolean;onMotion:()=>void;onMenu:()=>void;menu:boolean;ready:boolean}){
 const previous=worlds[active-1],next=worlds[active+1]??worlds[0];
 return <footer className="travel-bar">
  <span className="travel-status">{!ready?'Opening the atlas…':active===0?'ONE CONNECTED ATLAS':`WORLD ${String(active).padStart(2,'0')} / 08`}</span>
  <nav className="world-navigation" aria-label="World navigation">{worlds.map(([id,label],i)=><a key={id} href={`#${id}`} aria-current={active===i?'location':undefined}><span className="nav-number" aria-hidden="true">{String(i).padStart(2,'0')}</span><span>{label}</span></a>)}</nav>
  <button className="motion-toggle" onClick={onMotion} aria-pressed={reduced}>Motion {reduced?'off':'on'} <span aria-hidden="true">{reduced?'▷':'Ⅱ'}</span></button>
  <nav className="mobile-travel" aria-label="World navigation on mobile">
   {previous?<a href={`#${previous[0]}`} aria-label={`Previous world: ${previous[1]}`}><span aria-hidden="true">←</span><span>{previous[1]}</span></a>:<span className="travel-start">Overview</span>}
   <button onClick={onMenu} aria-expanded={menu} aria-controls="world-menu" aria-label={`Choose a world. Current: ${worlds[active][1]}`}><strong>{worlds[active][1]}</strong><span>{active===0?'Whole atlas':`${active} / 8 worlds`} <span aria-hidden="true">⌃</span></span></button>
   <a href={`#${next[0]}`} aria-label={active===8?'Return to overview':`Next world: ${next[1]}`}><span>{next[1]}</span><span aria-hidden="true">{active===8?'↑':'→'}</span></a>
  </nav>
 </footer>;
}

export function SceneTools({active,ready,failed,inspect=false,traveling,onView,onViewAction,onReset,onInspect}:{active:string;ready:boolean;failed:boolean;inspect?:boolean;traveling:boolean;onView:()=>void;onViewAction:(action:ViewAction)=>void;onReset:()=>void;onInspect:()=>void}){
 const name=sceneNames[active]??sceneNames.home;
 return <aside className="scene-tools" aria-label={`3D controls: ${name[0]}`}>
  <div className="scene-heading"><span className="scene-state" aria-hidden="true" data-loading={!ready||traveling}/><span className="scene-location">{name[0]}</span></div>
  <div className="scene-controls">{failed?<button className="scene-explore" onClick={onView}>Retry 3D ↗</button>:<button className="scene-explore" onClick={onInspect} disabled={!ready&&!inspect} aria-pressed={inspect}>{inspect?'← Read details':'Orbit world ↗'}</button>}{inspect&&<button className="scene-reset" onClick={onReset} disabled={!ready}>Reset <span aria-hidden="true">↺</span></button>}</div>
  {inspect&&ready&&!failed&&<details className="view-adjustments"><summary>Adjust view</summary><p className="scene-instructions" id="orbit-help">Drag to orbit, pinch or scroll to zoom, or use the buttons below. Esc returns to the details.</p><div className="scene-orbit-controls" role="group" aria-label="Orbit and zoom controls" aria-describedby="orbit-help">{([['left','Orbit left'],['right','Orbit right'],['up','Look up'],['down','Look down'],['in','Zoom in'],['out','Zoom out']] as [ViewAction,string][]).map(([action,label])=><button key={action} onClick={()=>onViewAction(action)}>{label}</button>)}</div></details>}
  <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{failed?`3D is unavailable. Portfolio details remain readable.`:ready?(traveling?`Travelling to ${name[0]}.`:`${name[0]} ready.`):'Opening the live 3D world.'}</span>
 </aside>;
}
