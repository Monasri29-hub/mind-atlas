import * as T from 'three';
import {destinations,connections} from './WorldCatalog.ts';
import {skyWalk} from './WorldArchitecture.ts';
import {batchWorld} from './SceneBatch.ts';

export type SkyRoute={curve:T.CatmullRomCurve3;dot:T.Mesh;offset:number;from:string;to:string;kind:'bridge'|'energy'};
type Destination=typeof destinations[number];
const deckHeights:Record<string,number>={projects:.49,hackathons:.68,technology:.56};

/** Stay inside the architectural deck, including the gallery ellipse and industrial rectangles. */
export function arrivalPoint(world:Destination,toward:Destination){
 const delta=new T.Vector3(toward.p[0]-world.p[0],0,toward.p[2]-world.p[2]).normalize();
 let reach=world.r/Math.sqrt(delta.x**2+(delta.z/world.squash)**2)*.87;
 if(world.id==='technology'||world.id==='hackathons'){
  const w=world.id==='technology'?4.2:4.45,d=world.id==='technology'?3.65:3.45;
  reach=Math.min(w/Math.max(.0001,Math.abs(delta.x)),d/Math.max(.0001,Math.abs(delta.z)))*.9;
 }
 return new T.Vector3(world.p[0],world.p[1]+(deckHeights[world.id]??.43)+.035,world.p[2]).addScaledVector(delta,reach);
}

export function buildSkyRoutes(parent:T.Object3D){
 const root=new T.Group();root.name='Connected sky transit';parent.add(root);
 const deck=new T.MeshStandardMaterial({color:'#eee9dc',roughness:.58,metalness:.15});
 const silver=new T.MeshStandardMaterial({color:'#b7cbd1',roughness:.33,metalness:.55});
 const cyan=new T.MeshBasicMaterial({color:'#8de5ee',toneMapped:false}),rose=new T.MeshBasicMaterial({color:'#ebbadb',toneMapped:false});
 const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(.065,8,6);
 const routes:SkyRoute[]=[];
 for(const [i,[a,b]]of connections.entries()){
  const from=destinations[a],to=destinations[b],start=arrivalPoint(from,to),end=arrivalPoint(to,from),light=i%2?rose:cyan;
  const direction=end.clone().sub(start).normalize(),side=new T.Vector3(-direction.z,0,direction.x);
  const m1=start.clone().lerp(end,.34).addScaledVector(side,i%2?-.65:.65),m2=start.clone().lerp(end,.68).addScaledVector(side,i%2?-.65:.65);m1.y+=1.05;m2.y+=1.05;
  const points=[start,m1,m2,end],kind=i<6?'bridge':'energy';
  const routeGroup=new T.Group();routeGroup.name=`${from.short} to ${to.short}`;root.add(routeGroup);
  const curve=kind==='bridge'?skyWalk(routeGroup,points,.74,deck,true,light):new T.CatmullRomCurve3(points);
  if(kind==='energy')routeGroup.add(new T.Mesh(new T.TubeGeometry(curve,48,.021,5,false),light));
  // Landing sills lie on the deck, with short guide posts rather than another competing landmark.
  for(const [endpoint,other]of [[start,end],[end,start]]){
   const landing=new T.Group();landing.position.copy(endpoint);landing.rotation.y=Math.atan2(other.x-endpoint.x,other.z-endpoint.z);routeGroup.add(landing);
   const threshold=new T.Mesh(cube,deck);threshold.scale.set(1.12,.075,.8);threshold.position.y=-.03;landing.add(threshold);
   for(const side of [-1,1]){
    const post=new T.Mesh(cube,silver);post.scale.set(.045,.38,.045);post.position.set(side*.51,.17,.05);landing.add(post);
    const beacon=new T.Mesh(cube,light);beacon.scale.set(.055,.035,.055);beacon.position.set(side*.51,.38,.05);landing.add(beacon);
   }
  }
  const dot=new T.Mesh(sphere,light);dot.name='Transit signal';parent.add(dot);dot.position.copy(curve.getPoint(i*.13%1)).add(new T.Vector3(0,.1,0));
  routes.push({curve,dot,offset:i*.13,from:from.id,to:to.id,kind});
 }
 batchWorld(root,{animations:[],exhibits:[]});
 root.traverse(o=>{if(o instanceof T.Mesh){o.receiveShadow=true;o.castShadow=false}});
 return {root,routes,update:(elapsed:number,reduced:boolean)=>{
  if(reduced)return;
  routes.forEach(r=>{r.dot.position.copy(r.curve.getPoint((elapsed*.035+r.offset)%1));r.dot.position.y+=.1});
 }};
}
