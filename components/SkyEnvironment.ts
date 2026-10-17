import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const random=(n:number)=>{const a=Math.sin(n*127.1+311.7)*43758.5453;return a-Math.floor(a)};

/** Shaded, irregular billows: bright upper faces and cool, softly fading undersides. */
export function createCloudTexture(){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Cloud texture canvas unavailable');
 const puffs=Array.from({length:28},(_,i)=>({x:55+random(i+18)*400,y:90+random(i+60)*70,r:32+random(i+12)*40}));
 puffs.sort((a,b)=>b.y-a.y);
 for(const puff of puffs){
  const g=ctx.createRadialGradient(puff.x-puff.r*.2,puff.y-puff.r*.3,puff.r*.12,puff.x,puff.y,puff.r);
  g.addColorStop(0,'rgba(255,253,243,.94)');g.addColorStop(.4,'rgba(249,251,249,.88)');g.addColorStop(.7,'rgba(209,229,241,.6)');g.addColorStop(1,'rgba(174,208,231,0)');
  ctx.fillStyle=g;ctx.fillRect(puff.x-puff.r,puff.y-puff.r,puff.r*2,puff.r*2);
 }
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=true;texture.minFilter=T.LinearMipmapLinearFilter;return texture;
}

export const cloudLayout=Array.from({length:38},(_,i)=>{
 const far=i>=18;
 return {x:(random(i+5000)-.5)*(far?280:150),y:far?-23-random(i+5300)*12:-14-random(i+5300)*9,z:far?-80-random(i+6000)*100:(random(i+6000)-.5)*120-15,size:far?26+random(i+5500)*20:13+random(i+5500)*13,far};
});

/** Background scenery is separate from the navigable geometry and its camera bounds. */
export function buildSkyEnvironment(scene:T.Scene,cloudTexture:T.Texture,initialLimited=false){
 const root=new T.Group();root.name='Layered sky atmosphere';root.userData.environment=true;scene.add(root);
 const nearMaterial=new T.SpriteMaterial({map:cloudTexture,color:'#ffffff',transparent:true,opacity:.43,depthWrite:false});
 const farMaterial=new T.SpriteMaterial({map:cloudTexture,color:'#dcebf4',transparent:true,opacity:.57,depthWrite:false});
 const clouds=cloudLayout.map((p,i)=>{
  const sprite=new T.Sprite(p.far?farMaterial:nearMaterial);sprite.name=p.far?'Horizon cloud bank':'Lower cloud bank';sprite.position.set(p.x,p.y,p.z);sprite.scale.set(p.size*2.15,p.size,1);sprite.userData.baseX=p.x;sprite.userData.index=i;root.add(sprite);return sprite;
 });
 const distant=new T.Group();distant.name='Distant sky settlements';root.add(distant);
 const rock=new T.MeshStandardMaterial({color:'#8aa5ad',roughness:1,flatShading:true}),pearl=new T.MeshStandardMaterial({color:'#cedbdb',roughness:.8});
 const rocks:T.BufferGeometry[]=[],structures:T.BufferGeometry[]=[],matrix=new T.Matrix4();
 const cone=new T.ConeGeometry(1,1,9,3),slab=new T.CylinderGeometry(1,1,.09,18),tower=new T.BoxGeometry(1,1,1);
 for(let i=0;i<9;i++){
  const x=(i-4)*27+random(i+2)*9,y=-3+random(i+7)*13,z=-92-random(i+3)*55,size=1.5+random(i+21)*2.3;
  const place=(source:T.BufferGeometry,target:T.BufferGeometry[],px:number,py:number,pz:number,sx:number,sy:number,sz:number)=>{matrix.compose(new T.Vector3(px,py,pz),new T.Quaternion(),new T.Vector3(sx,sy,sz));target.push(source.clone().applyMatrix4(matrix))};
  // Positive scales and an explicit rotation keep surface winding correct.
  const underside=cone.clone().rotateX(Math.PI);place(underside,rocks,x,y-size*.75,z,size,size*1.5,size*.78);underside.dispose();
  place(slab,structures,x,y,z,size,size,size*.78);
  for(let j=0;j<3+i%3;j++){
   const h=size*(.5+random(i*8+j+92)*1.35),a=j*2.399;
   place(tower,structures,x+Math.cos(a)*size*.46,y+h/2,z+Math.sin(a)*size*.35,.16+size*.08,h,.14+size*.08);
  }
 }
 for(const [pieces,material]of [[rocks,rock],[structures,pearl]] as [T.BufferGeometry[],T.Material][]){
  const geometry=mergeGeometries(pieces,false);pieces.forEach(p=>p.dispose());if(geometry)distant.add(new T.Mesh(geometry,material));
 }
 cone.dispose();slab.dispose();tower.dispose();
 let limited=initialLimited;
 const setLimited=(value:boolean)=>{limited=value;clouds.forEach((s,i)=>{s.visible=!value||i%2===0});distant.visible=!value};
 setLimited(initialLimited);
 return {root,clouds,distant,setLimited,update:(elapsed:number,reduced:boolean)=>{
  clouds.forEach((s,i)=>{if(!s.visible)return;s.position.x=s.userData.baseX+(reduced?0:Math.sin(elapsed*.018+i)*1.1)});
 },get limited(){return limited}};
}
