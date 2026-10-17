import * as T from 'three';
import {solidRibbon,arcTerrace} from './WorldForms.ts';

/** Shared materials, with a different architectural vocabulary for every world. */
export type WorldAnimation = { object: T.Object3D; axis: 'y' | 'z'; speed: number };
export type WorldBuild = { animations: WorldAnimation[]; exhibits: T.Object3D[] };

const pearl = new T.MeshStandardMaterial({ color: '#f3efe5', roughness: .6, metalness: .08 });
const stone = new T.MeshStandardMaterial({ color: '#d8cdbb', roughness: .87 });
const silver = new T.MeshStandardMaterial({ color: '#b5cbd3', roughness: .28, metalness: .65 });
const glass = new T.MeshStandardMaterial({ color: '#b7e3ed', roughness: .18, metalness: .12, transparent: true, opacity: .3, depthWrite: false });
const ink = new T.MeshStandardMaterial({ color: '#193e52', roughness: .4 });
const rose = new T.MeshStandardMaterial({ color: '#d4a9bf', roughness: .6 });
const lavender = new T.MeshStandardMaterial({ color: '#b8a6d1', roughness: .5 });
const leaf = new T.MeshStandardMaterial({ color: '#6e9275', roughness: .94 });
const cyan = new T.MeshBasicMaterial({ color: '#73e7f7' });
const pink = new T.MeshBasicMaterial({ color: '#eea1d5' });
const violet = new T.MeshBasicMaterial({ color: '#c1a7ef' });
const amber = new T.MeshBasicMaterial({ color: '#f4ca95' });
const cube = new T.BoxGeometry(1, 1, 1);
const orb = new T.SphereGeometry(1, 12, 9);
const point = (x: number, y: number, z: number) => new T.Vector3(x, y, z);
const ribbonPearl=new T.MeshStandardMaterial({color:'#ede8f1',metalness:.28,roughness:.34});
const canopyGeometry=new T.IcosahedronGeometry(1,1),canopyMaterial=new T.MeshStandardMaterial({color:'#ffffff',roughness:.86});

/** Complete the terraces with edge detailing, structural supports, and energy seams. */
export function finishWorld(parent: T.Group, id: string, radius: number) {
  const colors:Record<string,string>={psychology:'#e494d5',ai:'#66dff7',projects:'#b5a3ed',culture:'#e8b579',hackathons:'#f2a278',research:'#b6a4e9',technology:'#7dd8c2',future:'#f2d5a0'};
  const light=new T.MeshBasicMaterial({color:colors[id],toneMapped:false});
  const halo=new T.MeshBasicMaterial({color:colors[id],transparent:true,opacity:.12,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  const squash=id==='projects'?.72:id==='psychology'?.8:1;
  const r=radius-.15,deckY=id==='hackathons'?.68:id==='technology'?.56:id==='projects'?.49:.43;
  let edge:T.Vector3[];
  if(id==='technology'||id==='hackathons'){
    const w=id==='technology'?4.2:4.45,d=id==='technology'?3.65:3.45;
    edge=[point(-w,deckY,-d),point(w,deckY,-d),point(w,deckY,d),point(-w,deckY,d)];
    // Straight industrial edges retain the modular footprint.
    for(let i=0;i<4;i++)strut(parent,edge[i],edge[(i+1)%4],light,.025);
  }else{
    const sides=id==='ai'?6:64;
    edge=Array.from({length:sides},(_,i)=>{const a=i/sides*Math.PI*2;return point(Math.sin(a)*r,deckY,Math.cos(a)*r*squash)});
    if(id==='ai')for(let i=0;i<6;i++)strut(parent,edge[i],edge[(i+1)%6],light,.028);
    else tube(parent,edge,light,.025,true);
  }
  // Structural fins and light seams descend through the floating rock.
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2+.3,dx=Math.cos(a),dz=Math.sin(a)*squash;
    strut(parent,point(dx*radius*.85,-.08,dz*radius*.85),point(dx*radius*.54,-radius*.4,dz*radius*.54),silver,.04);
    if(i%2===0){
      const vein=[point(dx*radius*.96,-.2,dz*radius*.96),point(dx*radius*.75,-radius*.36,dz*radius*.75),point(dx*radius*.42,-radius*.72,dz*radius*.42)];
      tube(parent,vein,light,.022);tube(parent,vein,halo,.085);
    }
  }
  // Low viewing rails on the front side, with a generous central arrival opening.
  if(!['ai','technology','hackathons'].includes(id))for(const start of [.09*Math.PI,.66*Math.PI]){
    const pts=Array.from({length:17},(_,i)=>{const a=start+i/16*Math.PI*.24;return point(Math.cos(a)*r*.96,deckY+.42,Math.sin(a)*r*squash*.96)});
    tube(parent,pts,silver,.018);
    for(let i=0;i<pts.length;i+=4)column(parent,pts[i].x,pts[i].z,deckY,.42,.018,silver);
  }
}

export {buildFloatingFoundation} from './FloatingFoundation.ts';

function mesh(parent: T.Object3D, geometry: T.BufferGeometry, material: T.Material, p = [0, 0, 0], s = [1, 1, 1]) {
  const object = new T.Mesh(geometry, material);
  object.position.set(...p as [number, number, number]);
  object.scale.set(...s as [number, number, number]);
  parent.add(object);
  return object;
}
function box(parent: T.Object3D, material: T.Material, p: number[], s: number[]) {
  return mesh(parent, cube, material, p, s);
}
function ball(parent: T.Object3D, material: T.Material, p: number[], s: number[]) {
  return mesh(parent, orb, material, p, s);
}
function tube(parent: T.Object3D, points: T.Vector3[], material: T.Material, radius = .035, closed = false) {
  return mesh(parent, new T.TubeGeometry(new T.CatmullRomCurve3(points, closed), Math.max(24, points.length * 4), radius, 6, closed), material);
}
function stroke(parent: T.Object3D, points: T.Vector3[], color: string, opacity = 1) {
  const line = new T.Line(new T.BufferGeometry().setFromPoints(points), new T.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
  parent.add(line);
  return line;
}
function column(parent: T.Object3D, x: number, z: number, y: number, height: number, radius = .07, material: T.Material = pearl) {
  return mesh(parent, new T.CylinderGeometry(radius, radius * 1.05, height, 10), material, [x, y + height / 2, z]);
}
function disc(parent: T.Object3D, radius: number, height: number, p: number[], material: T.Material = pearl, sides = 64) {
  return mesh(parent, new T.CylinderGeometry(radius, radius, height, sides), material, p);
}
function ring(parent: T.Object3D, radius: number, p: number[], material: T.Material, thickness = .04) {
  const object = mesh(parent, new T.TorusGeometry(radius, thickness, 8, 72), material, p);
  object.rotation.x = Math.PI / 2;
  return object;
}
function roundedSlab(parent: T.Object3D, width: number, depth: number, height: number, y: number, material: T.Material, x = 0, z = 0) {
  const shape = new T.Shape();
  const r = Math.min(.65, depth / 3, width / 3), w = width / 2, d = depth / 2;
  shape.moveTo(-w + r, -d); shape.lineTo(w - r, -d); shape.quadraticCurveTo(w, -d, w, -d + r);
  shape.lineTo(w, d - r); shape.quadraticCurveTo(w, d, w - r, d); shape.lineTo(-w + r, d);
  shape.quadraticCurveTo(-w, d, -w, d - r); shape.lineTo(-w, -d + r); shape.quadraticCurveTo(-w, -d, -w + r, -d);
  const object = mesh(parent, new T.ExtrudeGeometry(shape, { depth: height, bevelEnabled: true, bevelSize: .05, bevelThickness: .04, bevelSegments: 2, steps: 1, curveSegments: 12 }), material, [x, y, z]);
  object.rotation.x = -Math.PI / 2;
  return object;
}

/** A flat, walkable ribbon with lit edges, rather than a tube posing as a bridge. */
export function skyWalk(parent: T.Object3D, points: T.Vector3[], width: number, material: T.Material = pearl, rails = false, light: T.Material = cyan) {
  const curve = new T.CatmullRomCurve3(points);
  const vertices: number[] = [], indices: number[] = [], left: T.Vector3[] = [], right: T.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const p = curve.getPoint(i / 64), tangent = curve.getTangent(i / 64);
    const side = new T.Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(width / 2);
    const l = p.clone().add(side), r = p.clone().sub(side);
    left.push(l); right.push(r); vertices.push(l.x, l.y, l.z, r.x, r.y, r.z);
    if (i < 64) { const k = i * 2; indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  // Surface winding is upward. Keep the underside visible during camera flights.
  const deckMaterial = material.clone(); deckMaterial.side = T.DoubleSide;
  mesh(parent, geometry, deckMaterial);
  tube(parent, left, light, .025); tube(parent, right, light, .025);
  if (rails) {
    for (const edge of [left, right]) {
      tube(parent, edge.map(p => p.clone().add(point(0, .42, 0))), silver, .018);
      for (let i = 0; i <= 64; i += 8) column(parent, edge[i].x, edge[i].z, edge[i].y, .42, .013, silver);
    }
  }
  return curve;
}

function tree(parent:T.Object3D,x:number,z:number,size=1,blossom=false,y=.38){
  column(parent,x,z,y,size*.92,size*.048,stone);
  for(let i=0;i<5;i++){const a=i*2.399;strut(parent,point(x,y+size*.45,z),point(x+Math.cos(a)*size*.42,y+size*(.9+(i%2)*.12),z+Math.sin(a)*size*.38),stone,size*.023)}
  const canopy=new T.InstancedMesh(canopyGeometry,canopyMaterial,32),transform=new T.Object3D();
  for(let i=0;i<32;i++){
    const a=i*2.399,r=Math.sqrt((i+.5)/32)*size*.6;
    transform.position.set(x+Math.cos(a)*r,y+size*(1.12+Math.sin(i*1.7)*.17),z+Math.sin(a)*r*.85);transform.rotation.set(i*.7,a,i*.3);transform.scale.set(size*.23,size*(.18+(i%3)*.025),size*.22);transform.updateMatrix();canopy.setMatrixAt(i,transform.matrix);
    canopy.setColorAt(i,new T.Color().setHSL(blossom?.79+(i%4)*.012:.27+(i%4)*.018,blossom?.25:.2,blossom?.67+(i%3)*.045:.36+(i%3)*.06));
  }
  canopy.name=blossom?'Lavender flowering canopy':'Branched garden canopy';parent.add(canopy);
}

function planter(parent: T.Object3D, x: number, z: number, size = .6, y = .35, bloom = false) {
  disc(parent, size, .22, [x, y, z], stone, 24);
  const leaves = new T.InstancedMesh(orb, bloom ? rose : leaf, 12);
  const transform = new T.Object3D();
  for (let i = 0; i < 12; i++) {
    const a = i * 2.399, r = Math.sqrt(i / 12) * size * .8;
    transform.position.set(x + Math.cos(a) * r, y + .2 + (i % 3) * .06, z + Math.sin(a) * r);
    transform.scale.set(.17, .14, .17); transform.updateMatrix(); leaves.setMatrixAt(i, transform.matrix);
  }
  parent.add(leaves);
}
function sign(parent: T.Object3D, text: string, x: number, y: number, z: number, width = 1.5, color = '#17384d') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 112;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.fillStyle = '#f4f0e7'; ctx.fillRect(0, 0, 512, 112);
  ctx.fillStyle = color; ctx.font = '500 35px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 57, 490);
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
  const label = mesh(parent, new T.PlaneGeometry(width, width * 112 / 512), new T.MeshBasicMaterial({ map: texture, side: T.DoubleSide }), [x, y, z]);
  label.userData.label = text;
  return label;
}

/** A full profile formed from sculpted contour bands, with cognition visible in the open volume. */
function neuralSilhouette(parent:T.Object3D){
  const sculpture=new T.Group();sculpture.name='Ribbon profile sculpture';sculpture.position.set(-.35,0,-.45);sculpture.rotation.y=-.12;parent.add(sculpture);
  const outline=[[-2.2,.94],[-1.5,1.55],[-.64,2.65],[-.62,3.55],[-1.3,4.25],[-1.48,5.25],[-1.12,6.05],[-.35,6.5],[.55,6.43],[1.08,6.05],[1.2,5.55],[1.13,5.23],[1.54,4.85],[1.2,4.73],[1.27,4.5],[1.08,4.22],[.55,4.03],[.49,3.37],[.94,2.55],[1.72,1.55],[2.55,.94]];
  for(let i=0;i<25;i++){
    const depth=(i-12)/12,volume=Math.sqrt(Math.max(0,1-depth*depth));
    const points=outline.map(([x,y])=>point(y<3.4?x*(.84+volume*.16):x*(.72+volume*.28),y<3.4?y:4.75+(y-4.75)*(.87+volume*.13),depth*.9+Math.sin(y*.8+i*.08)*.04));
    const band=solidRibbon(sculpture,points,i%4===0?.095:.062,.026,i%5===0?lavender:ribbonPearl,100,point(0,0,1));band.name='Flowing facial contour band';
  }
  const nodes=[[-.8,5.25,.44],[-.32,5.8,.5],[.35,5.8,.52],[.72,5.27,.52],[.35,4.7,.55],[-.32,4.6,.48],[-.6,5,.64],[.13,5.2,.78],[.1,4.05,.5]];
  nodes.forEach((p,i)=>{ball(sculpture,i%3?cyan:pink,p,[.045,.045,.045]);if(i)stroke(sculpture,[point(...nodes[(i-1)%7] as [number,number,number]),point(...p as [number,number,number])],i%2?'#9bdfe5':'#c9b1e3',.8)});
  disc(parent,1.65,.16,[-.35,.88,-.45],ribbonPearl).scale.z=.76;
}

export function buildMindGarden(parent:T.Group):WorldBuild{
  const animations:WorldAnimation[]=[];parent.userData.identity='flowing human-profile garden';
  const terrace=disc(parent,5.35,.2,[0,.3,0],pearl);terrace.scale.z=.8;
  const upper=disc(parent,3.9,.22,[.05,.57,-.15],stone);upper.scale.z=.8;
  const pool=disc(parent,2.65,.07,[.2,.73,.4],new T.MeshStandardMaterial({color:'#71b8c6',roughness:.13,metalness:.48}));pool.scale.z=.68;
  ring(parent,2.7,[.2,.77,.4],ribbonPearl,.085).scale.y=.68;
  neuralSilhouette(parent);
  for(const [x,z,height,width]of [[-3.5,-1.55,4.9,1.45],[-2.5,-2.1,5.6,1.35],[2.9,-1.9,3.5,1.1]]){
    solidRibbon(parent,[point(x-width/2,.6,z),point(x-width/2,height*.7,z),point(x,height,z),point(x+width/2,height*.7,z),point(x+width/2,.6,z)],.17,.1,ribbonPearl,56,point(0,0,1));
  }
  skyWalk(parent,[point(-4.8,.46,1.6),point(-3,.6,1.8),point(-2.3,.8,2.6),point(.6,.84,2.8),point(3.7,.6,1.6)],.65,pearl,false,pink);
  skyWalk(parent,[point(-4.1,.46,-.9),point(-2.6,.7,-2.35),point(.6,.74,-2.65),point(3.7,.5,-1.3)],.62,pearl,false,cyan);
  // Four memory fragments leave the human profile clearly readable.
  for(const [i,[x,y,z]]of [[-4,1.8,-.3],[-2.9,2.5,-2.5],[2.6,2.3,-2.2],[3.7,1.9,.4]].entries()){
    const shard=new T.Group();shard.position.set(x,y,z);shard.rotation.set(.04,i%2?.12:-.12,(i-1.5)*.055);parent.add(shard);
    roundedSlab(shard,.65,.16,1.12,-.5,glass); // Frosted vertical fragment.
    box(shard,lavender,[0,.05,0],[.055,.68,.2]);
    tube(shard,[point(-.2,-.35,.13),point(.2,-.35,.13),point(.23,.5,.13)],pink,.018);
    animations.push({object:shard,axis:'y',speed:i%2?.023:-.023});
  }
  tree(parent,-3.65,-.45,1.15,true,.5);tree(parent,3.55,-1.05,.85,true,.5);
  for(const [i,[x,z]]of [[-4.1,1.9],[-2.3,3.1],[1.9,3.1],[4.3,.6],[1.8,-3]].entries()){
    planter(parent,x,z,.36,.47,i%2===0);column(parent,x,z,.55,.4,.025,silver);ball(parent,i%2?amber:pink,[x,.98,z],[.11,.16,.11]);
  }
  skyWalk(parent,[point(-5.4,.43,2.4),point(-4.3,.48,2),point(-3.1,.6,1.8)],.8,pearl,true);
  return {animations,exhibits:[]};
}

function tower(parent:T.Object3D,x:number,z:number,height:number,width=.95){
  // Split tapered blades and recessed glazing give the city a vertical exoskeleton.
  for(const side of [-1,1]){
    const shape=new T.Shape();shape.moveTo(-width*.2,0);shape.lineTo(width*.2,0);shape.lineTo(width*.11,height*.94);shape.lineTo(-width*.14,height);shape.closePath();
    const blade=mesh(parent,new T.ExtrudeGeometry(shape,{depth:width*.55,bevelEnabled:true,bevelSize:.035,bevelThickness:.03,bevelSegments:2,steps:1}),pearl,[x+side*width*.4,.65,z-width*.28]);blade.rotation.z=side*-.035;
  }
  box(parent,glass,[x,height*.47+.65,z],[width*.65,height*.9,width*.44]);
  for(let j=0;j<7;j++){const y=.8+j*height/7;box(parent,silver,[x,y,z],[width*1.3,.065,width*.75]);box(parent,cyan,[x+width*.68,y+.07,z],[.025,.05,width*.35])}
  tube(parent,[point(x,.7,z+width*.36),point(x,height*.6,z+width*.3),point(x,height+.6,z+width*.2)],cyan,.022);
}
export function buildIntelligenceNexus(parent:T.Group):WorldBuild{
  const animations:WorldAnimation[]=[];parent.userData.identity='vertical intelligence engine';
  disc(parent,6.3,.22,[0,.3,0],pearl,6);
  const deck=disc(parent,4.7,.25,[0,.56,-.25],stone,6);deck.rotation.y=Math.PI/6;
  roundedSlab(parent,7.8,2.1,.2,.7,ink,0,-2.3);
  [[-3.25,-1.3,7.4,1.1],[-1.8,-2.9,9.1,.95],[2.5,-2.25,6.7,1.05],[4.05,-.9,4.9,.85]].forEach(([x,z,h,w])=>tower(parent,x,z,h,w));
  disc(parent,2.05,.25,[0,.9,-.05],ink,12);ring(parent,2.1,[0,1.05,-.05],cyan,.035);
  const core=new T.Group();core.name='Suspended inference engine';core.position.set(0,4.35,-.05);parent.add(core);
  mesh(core,new T.OctahedronGeometry(1.05,0),new T.MeshStandardMaterial({color:'#8ccbd9',roughness:.23,metalness:.6}));
  const shell=new T.IcosahedronGeometry(1.4,1);mesh(core,shell,new T.MeshStandardMaterial({color:'#b2e4ec',transparent:true,opacity:.16,roughness:.2,depthWrite:false}));
  core.add(new T.LineSegments(new T.EdgesGeometry(shell),new T.LineBasicMaterial({color:'#b8f2fb',transparent:true,opacity:.7})));
  ring(core,.55,[0,0,0],cyan,.035).rotation.x=.4;
  animations.push({object:core,axis:'y',speed:.08});
  for(let i=0;i<3;i++){
    const gimbal=new T.Group();gimbal.position.set(0,4.35,-.05);gimbal.rotation.set(.35+i*.63,i*.8,.25+i*.45);parent.add(gimbal);
    const arc=mesh(gimbal,new T.TorusGeometry(1.8+i*.2,.07,7,80,Math.PI*1.76),pearl);arc.rotation.z=i;
    const light=mesh(gimbal,new T.TorusGeometry(1.8+i*.2,.018,5,80,Math.PI*1.76),cyan);light.position.z=.06;light.rotation.z=i;
  }
  for(const side of [-1,1])solidRibbon(parent,[point(side*1.7,1.1,-.1),point(side*2.35,2.6,-.1),point(side*1.9,5.9,-.1),point(side*.9,6.7,-.1)],.13,.15,silver,48,point(0,0,1));
  for(let i=0;i<4;i++){
    const x=-3.1+i*2.05,z=3+Math.sin(i/3*Math.PI)*.35;
    roundedSlab(parent,1.25,1.1,.16,.72,pearl,x,z);box(parent,ink,[x,1.06,z],[.88,.42,.75]);
    const object=mesh(parent,i%2?new T.OctahedronGeometry(.27):new T.IcosahedronGeometry(.27,0),cyan,[x,1.7,z]);animations.push({object,axis:'y',speed:.16});
    for(const side of [-1,1])column(parent,x+side*.46,z-.2,.95,1.05,.025,silver);
    sign(parent,['INPUT','MODEL','EVALUATE','OUTPUT'][i],x,1.12,z+.48,1.15);
    if(i<3)tube(parent,[point(x+.55,1.28,z),point(x+1,1.28,z+.15),point(x+1.5,1.28,3+Math.sin((i+1)/3*Math.PI)*.35)],cyan,.035);
  }
  const nodes:T.Vector3[]=[];
  for(let i=0;i<13;i++){const a=i*2.399,p=point(4.25+Math.cos(a)*(.45+i%3*.22),3.2+Math.sin(a)*.95,1.2+Math.sin(i*.9)*.4);nodes.push(p);ball(parent,cyan,p.toArray(),[.06,.06,.06]);if(i)stroke(parent,[nodes[Math.floor((i-1)/2)],p],'#72cddd',.85)}
  disc(parent,1,.12,[4.25,.8,1.2],ink,12);
  skyWalk(parent,[point(-5.9,.43,2.6),point(-4.6,.6,2.2),point(-3.8,.72,2.8)],.85,pearl,true);
  return {animations,exhibits:[]};
}

function exhibitHand(parent: T.Object3D) {
  const hand = new T.Group(); hand.position.set(0, .8, 0); hand.rotation.z = -.08; parent.add(hand);
  const bronze = new T.MeshStandardMaterial({ color: '#bb9468', roughness: .4, metalness: .65 });
  box(hand, bronze, [0, .35, 0], [.52, .7, .18]);
  for (let i = 0; i < 4; i++) {
    const x = -.22 + i * .145, h = [.55, .72, .68, .48][i];
    const finger = mesh(hand, new T.CapsuleGeometry(.052, h, 3, 6), bronze, [x, .7 + h / 2, 0]); finger.rotation.z = (.5 - i / 3) * .12;
    ball(hand, cyan, [x, .72, .105], [.035, .035, .035]); ball(hand, cyan, [x, .7 + h, .07], [.025, .025, .025]);
    stroke(hand, [point(0, .18, .12), point(x, .72, .12), point(x, .7 + h, .08)], '#8ce8ed');
  }
  const thumb = mesh(hand, new T.CapsuleGeometry(.065, .43, 3, 6), bronze, [-.41, .45, .03]); thumb.rotation.z = -.7;
  ball(hand, cyan, [-.49, .61, .1], [.035, .035, .035]);
}
function roomExhibit(parent: T.Object3D) {
  roundedSlab(parent, 1.8, 1.2, .08, .65, pearl);
  box(parent, stone, [0, 1.1, -.55], [1.8, .9, .08]);
  box(parent, lavender, [0, .93, -.2], [1.3, .28, .5]);
  box(parent, lavender, [0, 1.13, -.42], [1.3, .4, .13]);
  for (const x of [-.65, .65]) box(parent, lavender, [x, 1.04, -.15], [.14, .35, .6]);
  disc(parent, .3, .08, [.1, .92, .4], stone, 24);
  column(parent, .1, .4, .7, .2, .03);
  ball(parent, leaf, [.67, 1.35, -.35], [.14, .28, .14]);
}
function newsExhibit(parent: T.Object3D, animations: WorldAnimation[]) {
  box(parent, stone, [0, .9, 0], [1.7, .15, .8]);
  for (const x of [-.6, .6]) column(parent, x, 0, .35, .5, .045);
  for (let i = 0; i < 5; i++) {
    const paper = box(parent, i % 2 ? pearl : glass, [-.65 + i * .3, 1.35 + Math.sin(i) * .25, -.2], [.35, .5, .025]); paper.rotation.z = (i - 2) * -.13;
    box(paper, cyan, [0, .05, .6], [.65, .05, .04]);
  }
  const digest = box(parent, ink, [.35, 1.26, .2], [.58, .54, .05]);
  for (let i = 0; i < 3; i++) box(digest, cyan, [0, .22 - i * .2, .55], [.72, .045, .03]);
  const halo = ring(parent, .33, [-.5, 1.35, .1], cyan, .018); animations.push({ object: halo, axis: 'z', speed: .1 });
}
function puzzleExhibit(parent: T.Object3D) {
  box(parent, pearl, [0, .66, 0], [1.8, .16, .9]);
  const mats = [lavender, new T.MeshStandardMaterial({ color: '#ddb66b', roughness: .6 }), cyan];
  for (let i = 0; i < 6; i++) {
    const x = (i % 3 - 1) * .48, y = .9 + Math.floor(i / 3) * .5;
    mesh(parent, i % 3 === 0 ? cube : i % 3 === 1 ? new T.OctahedronGeometry(.23) : orb, mats[i % 3], [x, y, -.05], i % 3 === 1 ? [1, 1, 1] : [.3, .3, .3]);
  }
  box(parent, glass, [0, 1.3, -.42], [1.55, 1.4, .035]);
}
function artifactExhibit(parent: T.Object3D) {
  const clay = new T.MeshStandardMaterial({ color: '#cda883', roughness: .85 });
  const profile = [new T.Vector2(.12, 0), new T.Vector2(.27, .15), new T.Vector2(.29, .37), new T.Vector2(.14, .55), new T.Vector2(.12, .7), new T.Vector2(.18, .75)];
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * .6;
    disc(parent, .24, .45, [x, .6, 0], stone, 16);
    mesh(parent, new T.LatheGeometry(profile, 16), i === 2 ? glass : clay, [x, .85, 0], [.7, .7, .7]);
  }
}

export function buildProjectAtelier(parent:T.Group):WorldBuild{
  const animations:WorldAnimation[]=[],exhibits:T.Object3D[]=[];parent.userData.identity='open five-bay project exhibition';
  const base=disc(parent,7.35,.26,[0,.35,0],pearl);base.scale.z=.72;
  // One floor and a shared curved gallery spine connect five purpose-designed bays.
  const gallerySpine=[point(-6.1,2.7,-2.45),point(-3.1,3.2,-3.5),point(.1,3.45,-3.8),point(3.3,3.15,-3.35),point(6.2,2.6,-2.1)];
  solidRibbon(parent,gallerySpine,.28,.13,ribbonPearl,80,point(0,1,0));
  for(const [x,z]of [[-5.8,-2.45],[-2.7,-3.5],[2.8,-3.4],[5.9,-2.15]])column(parent,x,z,.5,2.35,.045,silver);
  const names=['EmotiSpace','SignSpell AI','AI News Digest','Learning to learn','Cultural Memory'],ids=['emotispace','signspell','news','benchmark','culture'];
  const positions=[[-4.9,-.95],[-2.5,-2],[0,-2.45],[2.55,-1.95],[4.95,-.85]];
  const accents=[rose,cyan,violet,amber,lavender];
  for(let i=0;i<5;i++){
    const g=new T.Group();g.name=names[i]+' exhibit';g.position.set(positions[i][0],.45,positions[i][1]);g.rotation.y=(i-2)*-.07;g.userData={world:'projects',project:ids[i]};parent.add(g);exhibits.push(g);
    roundedSlab(g,2.18,2,.1,.13,stone);
    if(i===0){
      roomExhibit(g);
      solidRibbon(g,[point(-1,1.1,-.72),point(-.85,2.5,-.72),point(.25,2.8,-.72),point(1,2.25,-.72)],.18,.12,ribbonPearl,40,point(0,0,1));
      box(g,rose,[.62,1.75,-.63],[.45,.65,.05]);ring(g,.16,[.62,1.78,-.58],pink,.012).rotation.x=0;
    }
    if(i===1){
      disc(g,.64,.15,[0,.43,0],pearl);exhibitHand(g);
      solidRibbon(g,[point(-.95,.3,-.5),point(-.95,2.15,-.5),point(0,2.9,-.5),point(.95,2.15,-.5),point(.95,.3,-.5)],.12,.11,silver,48,point(0,0,1));
      for(const x of [-.86,.86])box(g,cyan,[x,1.6,-.4],[.025,.75,.04]);
    }
    if(i===2){
      newsExhibit(g,animations);
      for(let j=0;j<3;j++)solidRibbon(g,[point(-.85+j*.1,2.2+j*.13,-.75),point(0,2.7+j*.13,-.7),point(.9-j*.1,2.1+j*.13,-.75)],.16,.025,i%2?pearl:lavender,24,point(0,1,0));
    }
    if(i===3){
      puzzleExhibit(g);
      for(const x of [-.9,.9]){box(g,ink,[x,1.15,-.65],[.09,1.8,.12]);box(g,amber,[x,2.1,-.65],[.17,.1,.17])}
      strut(g,point(-.9,2.1,-.65),point(.9,2.1,-.65),silver,.028);
      for(let j=0;j<3;j++)box(g,amber,[-.6+j*.55,.35,.55],[.28,.025,.18]);
    }
    if(i===4){
      artifactExhibit(g);
      for(const x of [-.9,.9])column(g,x,-.6,.2,2.25,.055,stone);
      solidRibbon(g,[point(-1,2.45,-.6),point(0,2.8,-.6),point(1,2.45,-.6)],.22,.14,stone,32,point(0,1,0));
    }
    const plaque=sign(g,names[i],0,.64,1.03,2.05);if(plaque)plaque.rotation.x=-.12;
    tube(g,[point(-.95,.26,.95),point(0,.26,1.01),point(.95,.26,.95)],accents[i],.023);
    skyWalk(parent,[point(g.position.x,.5,g.position.z+.9),point(g.position.x*.7,.53,1.1),point(g.position.x*.25,.56,2.2)],.32,pearl,false,accents[i]);
  }
  // An open folio anchors a shared court without becoming another intelligence core.
  disc(parent,.95,.2,[0,.6,2.2],stone);
  const folio=new T.Group();folio.position.set(0,.85,2.2);parent.add(folio);
  for(const side of [-1,1]){
    const page=new T.Group();page.rotation.z=side*-.23;folio.add(page);
    box(page,pearl,[side*.52,.52,0],[1,1.4,.055]);box(page,glass,[side*.52,.53,.04],[.84,1.22,.025]);
    for(let j=0;j<4;j++)box(page,j===0?lavender:silver,[side*.52,.95-j*.25,.07],[.65,.035,.018]);
  }
  skyWalk(parent,[point(-3,.43,4.5),point(-2.35,.5,3.3),point(-1.05,.56,2.3)],.9,pearl,true);
  for(const [x,z]of [[-5.9,1.25],[5.9,1.05]])tree(parent,x,z,.9,false,.5);
  for(const x of [-3.5,3.5])planter(parent,x,2.5,.4,.5,true);
  return {animations,exhibits};
}

const clay = new T.MeshStandardMaterial({ color: '#c88163', roughness: .8 });
const brass = new T.MeshStandardMaterial({ color: '#d0b17b', metalness: .5, roughness: .4 });
const teal = new T.MeshStandardMaterial({ color: '#5eaaa4', metalness: .25, roughness: .45 });
const coral = new T.MeshStandardMaterial({ color: '#e79269', roughness: .55 });

function arcPoints(radius: number, y: number, start: number, length: number, z = 0) {
  return Array.from({ length: 41 }, (_, i) => {
    const a = start + i / 40 * length;
    return point(Math.cos(a) * radius, y, Math.sin(a) * radius + z);
  });
}
function strut(parent: T.Object3D, a: T.Vector3, b: T.Vector3, material: T.Material, radius = .035) {
  const direction = b.clone().sub(a);
  const rod = mesh(parent, new T.CylinderGeometry(radius, radius, direction.length(), 6), material);
  rod.position.copy(a).add(b).multiplyScalar(.5);
  rod.quaternion.setFromUnitVectors(point(0, 1, 0), direction.normalize());
  return rod;
}

/** Broad woven bands, warm amphitheatre steps, and music-shaped space. */
export function buildCulturalCrossroads(parent:T.Group):WorldBuild{
  const animations:WorldAnimation[]=[];parent.userData.identity='woven arts pavilion and amphitheatre';
  disc(parent,4.95,.24,[0,.28,0],stone);
  for(let i=0;i<4;i++)arcTerrace(parent,2.05+i*.5,2.48+i*.5,.55+i*.17,.17,Math.PI*.94,Math.PI*1.4,i%2?pearl:clay);
  const stage=disc(parent,1.75,.18,[0,.64,-.5],clay);stage.scale.z=.82;
  for(let i=0;i<14;i++){
    const a=i/14*Math.PI*2;
    const points=[
      point(Math.cos(a)*2.6,.72,Math.sin(a)*2.25-.65),
      point(Math.cos(a+.17)*3,2.5,Math.sin(a+.17)*2.5-.65),
      point(Math.cos(a+.65)*1.9,4.5+Math.sin(a)*.16,Math.sin(a+.65)*1.6-.65),
      point(Math.cos(a+1.15)*.66,5.18,Math.sin(a+1.15)*.66-.65)
    ];
    solidRibbon(parent,points,.24,.065,i%3===0?clay:i%3===1?pearl:brass,64);
    if(i%2===0)tube(parent,points,amber,.015);
  }
  const lantern=new T.Group();lantern.name='Woven connection lantern';lantern.position.set(0,2.5,-.65);parent.add(lantern);
  for(let i=0;i<5;i++){const hoop=mesh(lantern,new T.TorusGeometry(.72,.022,5,48),i%2?brass:teal);hoop.rotation.y=i*Math.PI/5}
  ball(lantern,amber,[0,0,0],[.13,.3,.13]);animations.push({object:lantern,axis:'y',speed:.035});
  for(let i=0;i<3;i++){
    const x=-3.4+i*.65,folio=new T.Group();folio.position.set(x,1.65,1.35);folio.rotation.y=.22;parent.add(folio);
    roundedSlab(folio,.53,.13,1.35,-.65,brass);box(folio,[clay,teal,rose][i],[0,0,.08],[.42,1.15,.025]);ring(folio,.15,[0,.15,.11],amber,.018).rotation.x=0;column(parent,x,1.35,.5,.55,.035,brass);
  }
  for(let j=0;j<5;j++)tube(parent,Array.from({length:21},(_,i)=>point(1.65+i*.115,1.3+j*.13+Math.sin(i*.2)*.34,2.2-Math.sin(i*.13)*.25)),brass,.016);
  for(let i=0;i<5;i++){const x=1.85+i*.43,y=1.45+(i%3)*.2;ball(parent,clay,[x,y,2.05],[.11,.075,.055]);column(parent,x+.08,2.05,y,.45,.013,brass)}
  skyWalk(parent,[point(-1.1,.43,4.6),point(-.4,.5,3),point(.3,.65,1.7)],.9,pearl,false,amber);
  tree(parent,-3.8,-1.6,.85,false,.5);tree(parent,3.6,-1.7,.7,false,.5);
  sign(parent,'ART · MUSIC · STORIES',-.4,.95,3.15,2.5);
  return {animations,exhibits:[]};
}

/** An angular invention gantry with engineered prototypes and active work stations. */
export function buildInventionYard(parent:T.Group):WorldBuild{
  const animations:WorldAnimation[]=[];parent.userData.identity='asymmetric kinetic fabrication yard';
  roundedSlab(parent,9.1,7.2,.25,.3,ink);roundedSlab(parent,8.5,6.6,.1,.56,pearl);
  // A rising open truss replaces the rectangular crane silhouette.
  const left=point(-3.55,4.4,-1.65),right=point(2.8,6,-1.65);
  for(const [foot,top]of [[point(-3.7,.65,-1.65),left],[point(3.3,.65,-1.65),right]]){
    strut(parent,foot,top,coral,.1);
    for(const dz of [-1,1])strut(parent,foot.clone().add(point(0,0,dz)),top.clone().lerp(foot,.4),silver,.055);
  }
  for(const z of [-1.9,-1.4]){strut(parent,left.clone().setZ(z),right.clone().setZ(z),coral,.075);strut(parent,left.clone().add(point(0,.43,z-left.z)),right.clone().add(point(0,.43,z-right.z)),coral,.06)}
  for(let i=0;i<9;i++){
    const a=left.clone().lerp(right,i/9),b=left.clone().lerp(right,(i+1)/9);b.y+=.43;
    strut(parent,a,b,brass,.025);strut(parent,a.clone().add(point(0,.43,0)),b.clone().add(point(0,-.43,0)),silver,.02);
  }
  const suspension=left.clone().lerp(right,.63);box(parent,ink,suspension.toArray(),[.62,.3,.58]);strut(parent,suspension,point(.45,3.5,-1.65),silver,.025);
  const prototype=new T.Group();prototype.name='Suspended kinetic prototype';prototype.position.set(.45,3.35,-1.65);parent.add(prototype);
  box(prototype,ink,[0,0,0],[.64,.25,.75]);box(prototype,coral,[0,.2,0],[.42,.13,.48]);
  for(const x of [-1,1])for(const z of [-1,1]){
    strut(prototype,point(0,0,0),point(x*.75,0,z*.6),coral,.055);
    const rotor=ring(prototype,.32,[x*.75,.03,z*.6],silver,.035);rotor.rotation.x+=.08;
    box(prototype,teal,[x*.75,.04,z*.6],[.5,.025,.065]);ball(prototype,cyan,[x*.75,.1,z*.6],[.045,.045,.045]);
  }
  animations.push({object:prototype,axis:'y',speed:.26});
  const positions=[[-2.55,1.5],[-.1,2.2],[2.6,1.4]];
  positions.forEach(([x,z],i)=>{
    const station=new T.Group();station.position.set(x,0,z);parent.add(station);
    roundedSlab(station,1.85,1.15,.13,1.1,stone);
    for(const dx of [-.65,.65])box(station,ink,[dx,.88,0],[.1,.65,.75]);
    box(station,ink,[-.4,1.5,-.32],[.65,.48,.07]);box(station,cyan,[-.4,1.5,-.27],[.5,.31,.015]);
    const part=new T.Group();part.position.set(.4,1.6,.04);station.add(part);
    if(i===0){box(part,glass,[0,0,0],[.48,.5,.4]);stroke(part,[point(-.2,-.2,.25),point(.2,.2,.25)],'#f1c69b')}
    if(i===1){box(part,teal,[0,-.1,0],[.5,.22,.4]);for(const dx of [-.3,.3])ball(part,ink,[dx,-.2,0],[.09,.09,.09])}
    if(i===2){ring(part,.3,[0,0,0],coral,.045).rotation.x=.5;ball(part,cyan,[0,0,0],[.08,.08,.08])}
    animations.push({object:part,axis:'y',speed:.12+i*.05});sign(station,['IDEATE','BUILD','ITERATE'][i],0,.86,.61,1.3);
  });
  box(parent,ink,[-3,1.9,-2.65],[1.6,1.5,.12]);for(let i=0;i<3;i++)box(parent,i%2?cyan:amber,[-3.4+i*.4,2.1-i*.2,-2.55],[.28,.42,.03]);
  for(let i=0;i<4;i++)box(parent,i%2?coral:teal,[3.3,.85+(i%2)*.45,-2.4+Math.floor(i/2)*.75],[.65,.42,.6]);
  for(let i=0;i<11;i++)box(parent,amber,[-3.8+i*.7,.69,.15],[.32,.018,.07]);
  skyWalk(parent,[point(0,.58,3.7),point(0,.68,3.1),point(-1.1,.7,.5)],.75,pearl,false,pink);
  return {animations,exhibits:[]};
}

/** A slotted observatory and a planar celestial atlas, with a quiet reading foreground. */
export function buildObservatory(parent:T.Group):WorldBuild{
  const animations:WorldAnimation[]=[];parent.userData.identity='slotted observatory and celestial atlas';
  disc(parent,5.1,.22,[0,.28,0],pearl);
  const observatory=new T.Group();observatory.name='Open-slit research observatory';observatory.position.set(-1.8,0,-.65);parent.add(observatory);
  for(let i=0;i<3;i++)disc(observatory,2.05-i*.17,.15,[0,.48+i*.15,0],stone);
  disc(observatory,1.76,.65,[0,1.05,0],pearl);
  for(let i=0;i<5;i++){
    const phi=Math.PI*.88+i*Math.PI*.3;
    mesh(observatory,new T.SphereGeometry(1.78,12,12,phi,Math.PI*.272,0,Math.PI/2),i%2?stone:pearl,[0,1.38,0]);
  }
  ring(observatory,1.8,[0,1.4,0],silver,.035);
  const telescope=new T.Group();telescope.name='Visible telescope barrel';telescope.position.set(0,1.65,0);telescope.rotation.set(.64,.3,0);observatory.add(telescope);
  column(telescope,0,0,0,2.5,.22,pearl);column(telescope,0,0,2.15,.4,.32,ink);disc(telescope,.255,.025,[0,2.57,0],teal);
  for(const y of [.3,1.8])ring(telescope,.24,[0,y,0],silver,.035);
  strut(observatory,point(-.6,.95,0),point(-.4,2.1,0),silver,.045);strut(observatory,point(.6,.95,0),point(.4,2.1,0),silver,.045);
  const atlas=new T.Group();atlas.name='Celestial knowledge atlas';atlas.position.set(1.65,3.6,-1.55);atlas.rotation.set(-.06,.14,-.17);parent.add(atlas);
  for(const r of [1.6,2.35])mesh(atlas,new T.TorusGeometry(r,.025,5,80),r<2?silver:brass);
  for(let i=0;i<36;i++){
    const a=i/36*Math.PI*2,r=i%3===0?.16:.08;
    strut(atlas,point(Math.cos(a)*2.24,Math.sin(a)*2.24,0),point(Math.cos(a)*(2.24-r),Math.sin(a)*(2.24-r),0),silver,.009);
  }
  const nodes=[point(-1.7,.65,.03),point(-.7,1.5,.03),point(.1,.8,.03),point(1.4,1.1,.03),point(1.75,-.2,.03),point(.75,-.55,.03),point(.15,-1.5,.03),point(-1.2,-.8,.03),point(-.4,-.1,.03)];
  for(const [a,b]of [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[2,8],[5,8],[7,8]])stroke(atlas,[nodes[a],nodes[b]],'#a19abb',.85);
  nodes.forEach((p,i)=>ball(atlas,i%3?violet:cyan,p.toArray(),[.045,.045,.045]));animations.push({object:atlas,axis:'z',speed:.008});
  for(const [i,[x,z]]of [[-2.8,2.3],[-.4,3.1],[2.2,2.6]].entries()){
    const desk=disc(parent,.62,.13,[x,1.1,z],stone,24);column(parent,x,z,.45,.6,.06,silver);
    for(let j=0;j<3;j++){const book=box(parent,j%2?lavender:pearl,[x,1.23+j*.075,z],[.6,.06,.4]);book.rotation.y=j*.12}
    const cluster=[point(x-.25,1.8,z),point(x+.2,2.1,z-.12),point(x+.42,1.7,z+.05)];
    cluster.forEach((p,j)=>{ball(parent,violet,p.toArray(),[.025,.025,.025]);if(j)stroke(parent,[cluster[j-1],p],'#aaa1bf',.5)});
  }
  arcTerrace(parent,3.55,4.1,.5,.1,.12,Math.PI*.8,stone,48);
  skyWalk(parent,[point(-3.4,.43,3.1),point(-1.8,.5,2.65),point(.6,.5,2.1),point(3.8,.43,.9)],.55,pearl,false,violet);
  sign(parent,'ASK · TEST · LEARN',-.5,.85,3.75,2);planter(parent,-3.8,-2.3,.4);planter(parent,3.8,-1.7,.4);
  return {animations,exhibits:[]};
}

/** Exposed horizontal computing layers are linked through a visible infrastructure spine. */
export function buildSystemsNexus(parent:T.Group):WorldBuild{
  const animations:WorldAnimation[]=[];parent.userData.identity='cantilevered modular systems infrastructure';
  roundedSlab(parent,8.6,7.5,.24,.3,ink);
  roundedSlab(parent,7.6,5.7,.12,.66,stone,-.2,0);
  const levels=[{y:2.25,w:6.3,d:4.4,x:-.5,z:-.3},{y:3.9,w:4.9,d:3.2,x:-1,z:-.7}];
  for(const level of levels){
    const {y,w,d,x,z}=level;
    for(const dx of [-1,1])box(parent,silver,[x+dx*w/2,y,z],[.09,.13,d]);
    for(const dz of [-1,1])box(parent,silver,[x,y,z+dz*d/2],[w,.13,.09]);
    roundedSlab(parent,w-.15,1.2,.1,y,pearl,x,z-.25);
    for(const dx of [-1,1])strut(parent,point(x+dx*(w/2-.3),.8,z-d/2+.2),point(x+dx*(w/2-.3),y,z-d/2+.2),silver,.055);
  }
  box(parent,ink,[-3.4,2.8,-1.8],[.42,4.1,.5]);
  for(let i=0;i<3;i++){
    const x=-3.52+i*.12;
    tube(parent,[point(x,.8,1.5),point(x,1.3,-1.5),point(x,2.2,-1.8),point(x,3.8,-1.8),point(-1.9+i*.3,4,-1.7)],i%2?amber:cyan,.025);
  }
  for(let j=0;j<3;j++){
    const x=-2.35+j*1.75;
    disc(parent,.43,.6,[x,1.12,.5],teal,20);for(let k=0;k<3;k++)ring(parent,.44,[x,.92+k*.2,.5],cyan,.012);
    box(parent,ink,[x,2.65,-.45],[1.05,.5,.85]);box(parent,teal,[x,2.94,-.45],[.73,.08,.61]);
    for(const side of [-1,1])for(let k=0;k<4;k++)box(parent,brass,[x+side*.57,2.75,-.72+k*.17],[.12,.035,.05]);
    const px=-2.4+j*1.45;box(parent,pearl,[px,4.52,-.85],[.92,.95,.1]);box(parent,teal,[px,4.52,-.79],[.75,.74,.02]);
    for(let k=0;k<3;k++)box(parent,cyan,[px,4.75-k*.21,-.77],[.5,.025,.015]);
    if(j<2){tube(parent,[point(x+.45,1.1,1),point(x+.85,1.1,1.2),point(x+1.3,1.1,1)],cyan,.03);tube(parent,[point(x+.5,2.65,.2),point(x+.87,2.65,.5),point(x+1.25,2.65,.2)],amber,.025)}
  }
  sign(parent,'DATA · SQL · POSTGRESQL',-.3,1.02,2.45,4.6);
  sign(parent,'MODELS · PYTHON · OLLAMA',-.4,2.42,1.85,4.2);
  sign(parent,'APPLICATIONS · FLASK · DJANGO',-.9,4.08,.96,3.9);
  // A compact modular tool bus sits beside the infrastructure, not around an AI core.
  const bus=new T.Group();bus.name='Orbiting modular tool bus';bus.position.set(2.9,2.6,.5);parent.add(bus);
  tube(bus,[point(-.75,0,-.65),point(.75,0,-.65),point(.75,0,.65),point(-.75,0,.65)],silver,.025,true);
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2;box(bus,teal,[Math.cos(a)*.78,0,Math.sin(a)*.65],[.35,.28,.35]);box(bus,cyan,[Math.cos(a)*.78,.15,Math.sin(a)*.65],[.2,.02,.2])}
  animations.push({object:bus,axis:'y',speed:.06});
  skyWalk(parent,[point(0,.56,3.6),point(0,.7,3),point(-1.2,.8,2)],.8,pearl,false,cyan);
  return {animations,exhibits:[]};
}

/** Stylized geographic patches. Decorative global perspective, not a navigational map. */
function earth(parent: T.Object3D, radius: number) {
  const globe = new T.Group(); parent.add(globe);
  mesh(globe, new T.SphereGeometry(radius, 36, 24), new T.MeshStandardMaterial({ color: '#75bbce', roughness: .4, metalness: .12 }));
  const land = new T.MeshStandardMaterial({ color: '#a2bca0', roughness: .85 });
  const continents = [
    [[-165,65],[-130,72],[-105,55],[-65,48],[-80,20],[-100,12],[-118,30],[-145,48]],
    [[-80,10],[-54,4],[-35,-7],[-50,-30],[-68,-55],[-76,-25]],
    [[-16,35],[20,38],[48,12],[35,-30],[18,-36],[-2,-3]],
    [[-10,36],[-6,58],[30,70],[70,56],[105,72],[155,52],[125,20],[100,5],[75,8],[50,35],[32,42]],
    [[112,-12],[142,-10],[154,-28],[137,-40],[115,-31]],
  ];
  const onSphere = (lon: number, lat: number) => {
    const a = lon * Math.PI / 180, b = lat * Math.PI / 180, r = radius + .055;
    return point(Math.cos(b) * Math.sin(a) * r, Math.sin(b) * r, Math.cos(b) * Math.cos(a) * r);
  };
  for (const contour of continents) {
    const points = contour.map(([lon, lat]) => new T.Vector2(lon, lat));
    const triangles = T.ShapeUtils.triangulateShape(points, []);
    // Subdivide in longitude/latitude so larger land polygons conform to the globe.
    const positions: number[] = [];
    for (const triangle of triangles) {
      const [a, b, c] = triangle.map(i => points[i]); const divisions = 12;
      const p = (u: number, v: number) => onSphere(a.x + (b.x - a.x) * u + (c.x - a.x) * v, a.y + (b.y - a.y) * u + (c.y - a.y) * v);
      const face = (a: T.Vector3, b: T.Vector3, c: T.Vector3) => {
        const outward = b.clone().sub(a).cross(c.clone().sub(a)).dot(a) > 0;
        positions.push(...a.toArray(), ...(outward ? b : c).toArray(), ...(outward ? c : b).toArray());
      };
      for (let row = 0; row < divisions; row++) for (let col = 0; col < divisions - row; col++) {
        const u = row / divisions, v = col / divisions, d = 1 / divisions;
        face(p(u, v), p(u + d, v), p(u, v + d));
        if (row + col < divisions - 1) face(p(u + d, v), p(u + d, v + d), p(u, v + d));
      }
    }
    const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); geometry.computeVertexNormals(); mesh(globe, geometry, land);
  }
  for (let i = -2; i <= 2; i++) {
    const lat = i * Math.PI / 6;
    ring(globe, Math.cos(lat) * (radius + .025), [0, Math.sin(lat) * (radius + .025), 0], new T.MeshBasicMaterial({ color: '#c3edf2', transparent: true, opacity: .25 }), .009);
  }
  return globe;
}

/** A stepped crescent, a supported Earth, and routes deliberately left unfinished. */
export function buildOpenHorizon(parent:T.Group):WorldBuild{
  const animations:WorldAnimation[]=[];parent.userData.identity='open crescent and global future routes';
  disc(parent,5.45,.2,[0,.28,0],pearl);
  for(let i=0;i<3;i++){
    arcTerrace(parent,3.65-i*.48,4.18-i*.48,.52+i*.18,.16,-.05,Math.PI*1.35,i%2?pearl:stone,80);
    tube(parent,arcPoints(4.16-i*.48,.54+i*.18,-.05,Math.PI*1.35),amber,.015);
  }
  const globe=earth(parent,1.95);globe.name='Future Earth perspective';globe.position.set(-1.35,3.35,-.7);globe.rotation.z=.23;animations.push({object:globe,axis:'y',speed:.025});
  const cradle=mesh(parent,new T.TorusGeometry(2.15,.06,8,80,Math.PI*1.4),brass,[-1.35,3.35,-.7]);cradle.rotation.z=-.7;
  column(parent,-1.35,-.7,.45,.95,.09,brass);disc(parent,.75,.14,[-1.35,.5,-.7],stone);
  const labels=['HIGHER STUDIES','DEEPER RESEARCH','GLOBAL EXPLORATION'];
  for(let i=0;i<3;i++){
    const end=point(3.5+i*.55,3.2+i*.85,-2.6+i*1.45),start=point(-.25,.7,1.2);
    const points=[start,point(1.2,1.1+i*.25,.6-i*.5),point(2.3,2.4+i*.45,end.z+.5),end];
    tube(parent,points,i%2?cyan:amber,.025);
    // Separate dashes continue beyond an open destination marker: these are aspirations.
    const direction=end.clone().sub(points[2]).normalize();
    for(let j=1;j<=4;j++){const from=end.clone().addScaledVector(direction,j*.2);strut(parent,from,from.clone().addScaledVector(direction,.08),i%2?cyan:amber,.012)}
    const marker=mesh(parent,new T.TorusGeometry(.16,.016,5,24,Math.PI*1.5),pearl,end.toArray());marker.rotation.z=i*.7;
    sign(parent,labels[i],-2.3+i*2.3,.88,3.35,1.95);
  }
  skyWalk(parent,[point(-1.7,.43,4.7),point(-2.6,.56,3),point(-2.8,.72,.8)],.8,pearl,true,amber);
  for(const x of [-4.2,-3.1])planter(parent,x,-1.5,.35,.5);
  return {animations,exhibits:[]};
}

