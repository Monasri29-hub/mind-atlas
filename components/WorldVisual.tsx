const identities:Record<string,{number:string;label:string;position?:string;image?:string}>={
 home:{number:'00',label:'One atlas. Eight perspectives.',image:'/sky-world.webp'},
 psychology:{number:'01',label:'Psychology',position:'0% 0%'},
 ai:{number:'02',label:'Artificial intelligence',position:'33.333333% 0%'},
 projects:{number:'03',label:'Selected projects',image:'/project-atelier-art.webp'},
 culture:{number:'04',label:'Culture & creativity',position:'100% 0%'},
 hackathons:{number:'05',label:'Hackathons',position:'0% 100%'},
 research:{number:'06',label:'Research & discovery',position:'33.333333% 100%'},
 technology:{number:'07',label:'Technology',position:'66.666667% 100%'},
 future:{number:'08',label:'The next chapter',position:'100% 100%'}
};

/** Shared artwork stays in document flow; no fixed canvas can collide with the copy. */
export function WorldArtwork({world}:{world:string}){
 const identity=identities[world]??identities.home;
 return <div className={`world-art${identity.image?' world-art-single':''}`} style={identity.image?{backgroundImage:`url('${identity.image}')`}:{backgroundPosition:identity.position}} role="img" aria-label={`${identity.label}: a cinematic floating island above the clouds`}/>;
}

export default function WorldVisual({world,onExplore}:{world:string;onExplore:(id:string)=>void}){
 const identity=identities[world];
 return <figure className={`world-visual world-visual-${world}`}>
  <div className="world-art-frame"><WorldArtwork world={world}/></div>
  <figcaption><div><span className="world-visual-index">{identity.number} / 08</span><span className="world-visual-label">{identity.label}</span></div><button className="world-open" onClick={()=>onExplore(world)} aria-label={`Explore ${identity.label} in 3D`}>Explore in 3D <span aria-hidden="true">↗</span></button></figcaption>
 </figure>;
}
