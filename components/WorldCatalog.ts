/** Camera bounds are shared by rendering, marker placement, and verification. */
export const SCENE_FOV = 42;
export const destinations = [
 {id:'psychology',name:'The Mind Garden',short:'Psychology',p:[-17,1,17],r:5.5,squash:.8,height:6.5},
 {id:'ai',name:'Intelligence Nexus',short:'AI',p:[2,4.5,-2],r:6.5,squash:1,height:10.3},
 {id:'projects',name:'The Project Atelier',short:'Projects',p:[18,0,21],r:7.5,squash:.72,height:4.7},
 {id:'culture',name:'The Cultural Crossroads',short:'Culture',p:[-25,5,-9],r:5,squash:1,height:5.4},
 {id:'hackathons',name:'The Invention Yard',short:'Hackathons',p:[28,6,-4],r:5.6,squash:1,height:6},
 {id:'research',name:'The Observatory',short:'Research',p:[-4,10,-26],r:5.2,squash:1,height:6.4},
 {id:'technology',name:'The Systems Nexus',short:'Technology',p:[-24,8,-35],r:5.2,squash:1,height:5.1},
 {id:'future',name:'The Open Horizon',short:'Next chapter',p:[23,12,-36],r:5.6,squash:1,height:6.5},
];
export const connections = [[0,1],[1,2],[2,0],[0,3],[1,4],[3,5],[5,6],[5,7],[4,7]];
/** Compact numbered beacons stay separated instead of covering the architecture. */
export function placeMarkers(points:{x:number;y:number;visible:boolean}[],width:number,height:number,obstacles:{left:number;top:number;right:number;bottom:number}[]=[]){
 const placed:{x:number;y:number;visible:boolean}[]=[],gap=52,inset=25;
 for(const p of points){
 let x=Math.max(inset,Math.min(width-inset,p.x)),y=Math.max(inset,Math.min(height-inset,p.y));
 if(p.visible){let candidate:{x:number;y:number}|undefined;
 // Prefer the original horizontal alignment; compact stages can use adjacent columns.
 for(const dx of [0,1,-1,2,-2]){
  const px=x+dx*gap;if(px<inset||px>width-inset)continue;
  const offset=[0,1,-1,2,-2,3,-3,4,-4].find(offset=>{
   const py=y+offset*gap;return py>=inset&&py<=height-inset&&placed.every(other=>!other.visible||Math.hypot(px-other.x,py-other.y)>=gap)&&obstacles.every(o=>px+22<o.left||px-22>o.right||py+22<o.top||py-22>o.bottom)});
  if(offset!==undefined){candidate={x:px,y:y+offset*gap};break}
 }
 if(!candidate){placed.push({x,y,visible:false});continue}x=candidate.x;y=candidate.y;}
 placed.push({x,y,visible:p.visible});
 }return placed;
}
