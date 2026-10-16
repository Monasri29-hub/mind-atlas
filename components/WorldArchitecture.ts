import * as T from 'three';

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

export function buildFloatingFoundation(parent: T.Group, radius: number, squash: number, seed = 4) {
  const rockMaterial = new T.MeshStandardMaterial({ color: '#737d7f', roughness: .98, flatShading: true });
  const geometry = new T.CylinderGeometry(radius, radius * .16, radius * 1.15, 19, 4);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), a = Math.atan2(z, x), y = pos.getY(i);
    const level = (y + radius * .575) / (radius * 1.15);
    const jitter = 1 + Math.sin(a * 5 + seed + level * 3) * .11 + Math.cos(a * 9 - seed) * .06;
    const vertical = y + Math.sin(a * 6 + seed) * radius * .065 * (1 - level);
    pos.setXYZ(i, x * jitter, vertical, z * jitter * squash);
  }
  geometry.computeVertexNormals();
  mesh(parent, geometry, rockMaterial, [0, -radius * .57, 0]);
  // Irregular embedded boulders break up the continuous cone silhouette.
  const boulderGeometry = new T.IcosahedronGeometry(1, 1);
  for (let i = 0; i < 27; i++) {
    const a = i * 2.399 + seed, level = .2 + (i % 4) * .16;
    const r = radius * (1 - level * .65), size = radius * (.08 + (i % 3) * .025);
    mesh(parent, boulderGeometry, rockMaterial, [Math.cos(a) * r, -radius * level, Math.sin(a) * r * squash], [size, size * 1.4, size * .85]);
  }
  for (let i = 0; i < 15; i++) {
    const a = i / 15 * Math.PI * 2, length = radius * (.16 + (Math.sin(i * 4.7) + 1) * .12);
    mesh(parent, new T.ConeGeometry(radius * .085, length, 5), rockMaterial, [Math.cos(a) * radius * .78, -length * .6, Math.sin(a) * radius * .78 * squash], [1, -1, 1]);
    if (i % 2 === 0) {
      const vine = [point(Math.cos(a) * radius * .93, -.15, Math.sin(a) * radius * .93 * squash), point(Math.cos(a) * radius * .89, -.65, Math.sin(a) * radius * .89 * squash), point(Math.cos(a) * radius * .86, -1.35, Math.sin(a) * radius * .86 * squash)];
      tube(parent, vine, leaf, .07);
    }
  }
}

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

function tree(parent: T.Object3D, x: number, z: number, size = 1, blossom = false, y = .38) {
  column(parent, x, z, y, size * .85, size * .055, stone);
  ball(parent, blossom ? rose : leaf, [x, y + size, z], [size * .45, size * .48, size * .42]);
  ball(parent, blossom ? lavender : leaf, [x - size * .24, y + size * 1.22, z + .12], [size * .35, size * .3, size * .36]);
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

function flowingRoof(parent: T.Object3D, x: number, z: number, width: number, depth: number, y: number, material: T.Material = pearl) {
  const vertices: number[] = [], indices: number[] = [];
  const count = 32;
  for (let i = 0; i <= count; i++) {
    const u = i / count, px = (u - .5) * width;
    const wave = Math.sin(u * Math.PI) * .68 + Math.sin(u * Math.PI * 3) * .17;
    vertices.push(px, y + wave, -depth / 2, px, y + wave + .15, depth / 2);
    if (i < count) { const k = i * 2; indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(vertices, 3)); geo.setIndex(indices); geo.computeVertexNormals();
  const mat = material.clone(); mat.side = T.DoubleSide;
  const roof = mesh(parent, geo, mat, [x, 0, z]);
  for (const dz of [-depth / 2, depth / 2]) {
    const pts = Array.from({ length: 25 }, (_, i) => { const u = i / 24; return point(x + (u - .5) * width, y + Math.sin(u * Math.PI) * .68 + Math.sin(u * Math.PI * 3) * .17 + (dz > 0 ? .15 : 0), z + dz); });
    tube(parent, pts, stone, .055);
  }
  return roof;
}

/** An abstract human silhouette made from facial contours, not a rotating brain orb. */
function neuralSilhouette(parent: T.Object3D, animations: WorldAnimation[]) {
  const bust = new T.Group(); bust.position.set(0, 0, -.4); bust.rotation.y = -.35; parent.add(bust);
  const geo = new T.SphereGeometry(1, 32, 26), pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const nx = pos.getX(i), ny = pos.getY(i), nz = pos.getZ(i);
    const front = Math.max(0, nz);
    const nose = Math.exp(-Math.pow(nx / .18, 2) - Math.pow((ny + .08) / .2, 2)) * .42 * front;
    const brow = Math.exp(-Math.pow((ny - .15) / .1, 2)) * .07 * front;
    const chin = ny < -.45 ? .86 : 1;
    pos.setXYZ(i, nx * .9 * chin, ny * 1.25, nz * .88 + nose + brow);
  }
  geo.computeVertexNormals();
  mesh(bust, geo, new T.MeshStandardMaterial({ color: '#c9b6df', transparent: true, opacity: .22, roughness: .5, depthWrite: false }), [0, 4.7, 0]);
  const wire = new T.LineSegments(new T.WireframeGeometry(geo), new T.LineBasicMaterial({ color: '#c2a1e1', transparent: true, opacity: .75 })); wire.position.y = 4.7; bust.add(wire);
  // Legible facial contour filaments make the centerpiece read as a person.
  tube(bust, [point(0, 5.52, .62), point(0, 5.16, .86), point(0, 4.67, 1.25), point(0, 4.48, .91), point(0, 4.23, .86), point(0, 3.69, .45)], pink, .028);
  for (const side of [-1, 1]) {
    tube(bust, [point(side * .15, 4.98, .91), point(side * .37, 5.04, .88), point(side * .57, 4.97, .76)], violet, .025);
    tube(bust, [point(0, 4.27, .88), point(side * .22, 4.3, .84), point(side * .33, 4.25, .78)], pink, .021);
  }
  // A narrow neck fans into open shoulders in continuous, flowing filaments.
  for (let i = 0; i < 28; i++) {
    const a = i / 28 * Math.PI * 2;
    tube(bust, [point(Math.cos(a) * 1.9, .8, Math.sin(a) * .8), point(Math.cos(a) * 1.6, 1.7, Math.sin(a) * .7), point(Math.cos(a) * .37, 2.8, Math.sin(a) * .34), point(Math.cos(a) * .32, 3.6, Math.sin(a) * .4)], i % 4 === 0 ? pink : violet, .018);
  }
  for (let i = 0; i < 22; i++) {
    const a = i * 2.399, py = Math.sin(a) * .9;
    ball(bust, i % 3 ? violet : pink, [Math.cos(a) * .78, 4.7 + py, .45 + Math.sin(i * .9) * .38], [.035, .035, .035]);
  }
  const halo = ring(bust, 1.05, [0, 4.75, -.1], new T.MeshBasicMaterial({ color: '#e5c4ed', transparent: true, opacity: .35 }), .012);
  halo.rotation.x = .6; halo.rotation.z = .7;
  animations.push({ object: halo, axis: 'y', speed: .07 });
}

export function buildMindGarden(parent: T.Group): WorldBuild {
  const animations: WorldAnimation[] = [];
  const terrace = disc(parent, 5.35, .2, [0, .3, 0], pearl); terrace.scale.set(1, 1, .8);
  const upper = disc(parent, 3.7, .22, [.1, .62, -.3], stone); upper.scale.z = .8;
  const pool = disc(parent, 1.95, .08, [0, .81, .15], new T.MeshStandardMaterial({ color: '#7cbcc9', roughness: .16, metalness: .42 })); pool.scale.z = .7;
  ring(parent, 2, [0, .86, .15], pearl, .12).scale.y = .7;
  neuralSilhouette(parent, animations);
  const paths = [
    [point(-5.2, .47, 2), point(-3.4, .6, .7), point(-2.8, .83, -1.1), point(-.7, .89, -1.8), point(2.8, .74, -.9), point(4.9, .5, .7)],
    [point(-4.4, .49, 2.5), point(-2.7, .6, 3), point(.4, .74, 2.2), point(2.9, .68, 1.2), point(3.4, .5, -2.3)],
  ];
  paths.forEach((p, i) => skyWalk(parent, p, .65, pearl, false, i ? cyan : pink));
  // Floating frosted memory fragments occupy a single arc behind the silhouette.
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * .12 + i / 8 * Math.PI * .8;
    const shard = new T.Group(); shard.position.set(Math.cos(a) * 3.15, 2.2 + Math.sin(a) * 3, -1.8); shard.rotation.set(.08, (i - 4) * .12, (i % 3 - 1) * .13); parent.add(shard);
    box(shard, glass, [0, 0, 0], [.55 + i % 2 * .15, .9, .045]);
    stroke(shard, [point(-.3, -.45, .03), point(-.33, .4, .03), point(.24, .5, .03), point(.32, -.35, .03), point(-.3, -.45, .03)], '#d2b7d9', .85);
    tube(shard, [point(-.1, -.3, .04), point(.03, .03, .04), point(-.08, .3, .04)], rose, .014);
  }
  for (let i = 0; i < 13; i++) {
    const a = i / 13 * Math.PI * 2, x = Math.cos(a) * 4.35, z = Math.sin(a) * 3.3;
    planter(parent, x, z, .43, .54, i % 3 === 0);
    if (i % 2 === 0) {
      ball(parent, i % 3 ? pink : amber, [x, 1, z], [.18, .18, .18]);
      ring(parent, .2, [x, .88, z], pearl, .028);
    }
  }
  tree(parent, -3.6, -1.1, 1.25, true, .7); tree(parent, 3.45, -2.4, 1, true, .7);
  roundedSlab(parent, 2.2, 1.55, .12, .7, pearl, -3.2, .1);
  flowingRoof(parent, -3.2, -.1, 2.4, 1.9, 2.05);
  column(parent, -4.1, -.8, .75, 1.35); column(parent, -2.2, -.8, .75, 1.35);
  box(parent, rose, [-3.2, 1, -.4], [1.5, .25, .48]);
  box(parent, pearl, [-3.2, .88, .2], [1.1, .12, .45]);
  skyWalk(parent, [point(-6, .3, 3.4), point(-4.9, .45, 3), point(-3.5, .55, 2.2)], .85, pearl, true);
  return { animations, exhibits: [] };
}

function tower(parent: T.Object3D, x: number, z: number, height: number, width = .95) {
  box(parent, glass, [x, height / 2 + .6, z], [width, height, width * .8]);
  for (const dx of [-1, 1]) for (const dz of [-1, 1]) box(parent, pearl, [x + dx * width / 2, height / 2 + .6, z + dz * width * .4], [.07, height + .2, .07]);
  for (let y = .7; y < height + .6; y += .55) {
    box(parent, silver, [x, y, z], [width + .08, .07, width * .8 + .08]);
    box(parent, cyan, [x + width * .52, y + .08, z], [.025, .035, width * .55]);
  }
  box(parent, pearl, [x, height + .73, z], [width + .14, .2, width * .8 + .14]);
}
export function buildIntelligenceNexus(parent: T.Group): WorldBuild {
  const animations: WorldAnimation[] = [];
  disc(parent, 6.3, .22, [0, .3, 0], pearl, 6);
  const deck = disc(parent, 4.7, .25, [0, .56, -.25], stone, 6); deck.rotation.y = Math.PI / 6;
  roundedSlab(parent, 7.8, 2.1, .2, .7, pearl, 0, -2.3);
  [[-3.2, -1.4, 7.4, 1.15], [-1.75, -2.8, 9.2, .95], [2.6, -2.2, 6.3, 1.15], [4.15, -.7, 5.1, .85]].forEach(([x, z, h, w]) => tower(parent, x, z, h, w));
  disc(parent, 2.1, .25, [0, .9, -.1], pearl);
  ring(parent, 2.12, [0, 1.04, -.1], cyan, .035);
  const core = new T.Group(); core.position.set(0, 4.6, -.1); parent.add(core);
  const poly = new T.IcosahedronGeometry(1.25, 1);
  mesh(core, poly, new T.MeshStandardMaterial({ color: '#7acddf', transparent: true, opacity: .45, metalness: .45, roughness: .2, depthWrite: false }));
  const edges = new T.LineSegments(new T.EdgesGeometry(poly), new T.LineBasicMaterial({ color: '#c4f7ff' })); core.add(edges);
  const positions = poly.attributes.position;
  for (let i = 0; i < positions.count; i += 9) ball(core, cyan, [positions.getX(i), positions.getY(i), positions.getZ(i)], [.035, .035, .035]);
  animations.push({ object: core, axis: 'y', speed: .12 });
  for (const y of [2.9, 4.6, 6.3]) { ring(parent, 1.8, [0, y, -.1], pearl, .095); ring(parent, 1.86, [0, y + .05, -.1], cyan, .02); }
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; column(parent, Math.cos(a) * 1.76, Math.sin(a) * 1.76 - .1, 1.05, 5.25, .055, silver); }
  // Four visible processing stations define an ordered model pipeline.
  for (let i = 0; i < 4; i++) {
    const x = -3.2 + i * 2.1;
    roundedSlab(parent, 1.15, 1.1, .15, .75, pearl, x, 3.1);
    box(parent, glass, [x, 1.45, 3.1], [.85, 1.1, .85]);
    const e = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(.85, 1.1, .85)), new T.LineBasicMaterial({ color: '#9bd3df' })); e.position.set(x, 1.45, 3.1); parent.add(e);
    const shape = mesh(parent, i % 2 ? new T.OctahedronGeometry(.26) : new T.IcosahedronGeometry(.26, 0), cyan, [x, 1.5, 3.1]);
    animations.push({ object: shape, axis: 'y', speed: .2 });
    sign(parent, ['INPUT', 'MODEL', 'EVALUATE', 'OUTPUT'][i], x, 1, 3.68, 1);
    if (i < 3) tube(parent, [point(x + .5, 1.4, 3.1), point(x + 1, 1.4, 3.1), point(x + 1.6, 1.4, 3.1)], cyan, .055);
  }
  // Sparse knowledge graph in its own space, rather than in front of the core.
  const nodes: T.Vector3[] = [];
  for (let i = 0; i < 13; i++) {
    const a = i * 2.399; const p = point(4.2 + Math.cos(a) * (i % 3 * .28 + .45), 3.5 + Math.sin(a) * 1.05, 1.25 + Math.sin(i * .9) * .4); nodes.push(p);
    ball(parent, cyan, p.toArray(), [.065, .065, .065]);
    if (i) stroke(parent, [nodes[Math.floor((i - 1) / 2)], p], '#72cddd', .85);
  }
  ring(parent, 1.25, [4.2, .85, 1.25], cyan, .025);
  for (const x of [-5, 5]) { tree(parent, x, -1.4, .85); planter(parent, x, 2, .4); }
  skyWalk(parent, [point(-6.5, .3, 3.3), point(-5.4, .4, 2.5), point(-4, .6, 1.7)], .9, pearl, true);
  return { animations, exhibits: [] };
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

export function buildProjectAtelier(parent: T.Group): WorldBuild {
  const animations: WorldAnimation[] = [], exhibits: T.Object3D[] = [];
  const base = disc(parent, 7.35, .26, [0, .35, 0], pearl); base.scale.z = .72;
  roundedSlab(parent, 12.6, 3.1, .2, .65, stone, 0, -1.55);
  // One continuous roof and one floor unite all five exhibitions.
  flowingRoof(parent, 0, -1.65, 13.2, 3.9, 3.15);
  box(parent, glass, [0, 1.85, -3.12], [12.5, 2.3, .055]);
  for (let i = 0; i < 6; i++) column(parent, -6.1 + i * 2.44, -3.1, .7, 2.7, .07);
  for (const x of [-6.15, 6.15]) column(parent, x, .15, .7, 2.6, .065);
  const names = ['EmotiSpace', 'SignSpell AI', 'AI News Digest', 'Learning to learn', 'Cultural Memory'];
  const ids = ['emotispace', 'signspell', 'news', 'benchmark', 'culture'];
  for (let i = 0; i < 5; i++) {
    const g = new T.Group(); g.position.set(-4.9 + i * 2.45, .45, -1.6); g.userData = { world: 'projects', project: ids[i] }; parent.add(g); exhibits.push(g);
    roundedSlab(g, 2.1, 1.7, .08, .2, pearl);
    sign(g, names[i], 0, 2.3, -.95, 2.1);
    if (i === 0) roomExhibit(g);
    if (i === 1) { disc(g, .65, .18, [0, .5, 0], stone); exhibitHand(g); }
    if (i === 2) newsExhibit(g, animations);
    if (i === 3) puzzleExhibit(g);
    if (i === 4) artifactExhibit(g);
    ring(g, .75, [0, .3, 0], i % 2 ? cyan : pink, .018);
  }
  // Open glass folio in the shared courtyard: a portfolio, not an AI core.
  disc(parent, 1, .24, [0, .62, 1.5], stone);
  const folio = new T.Group(); folio.position.set(0, 1.35, 1.5); parent.add(folio);
  for (const side of [-1, 1]) {
    const page = new T.Group(); page.rotation.z = side * -.2; folio.add(page);
    box(page, glass, [side * .34, .35, 0], [.67, 1.1, .04]);
    for (let i = 0; i < 4; i++) box(page, cyan, [side * .34, .68 - i * .18, .035], [.45, .018, .018]);
    stroke(page, [point(0, -.2, 0), point(side * .67, -.2, 0), point(side * .67, .9, 0), point(0, .9, 0)], '#a8dce9');
  }
  ring(parent, 1.1, [0, .8, 1.5], cyan, .025);
  skyWalk(parent, [point(-6, .65, .7), point(-2.5, .7, .4), point(.5, .7, .4), point(4.9, .65, .7)], .9, pearl, false, pink);
  skyWalk(parent, [point(-3.2, .3, 5.5), point(-2.9, .5, 3.7), point(-1.7, .7, 2.5)], 1, pearl, true);
  for (const x of [-5.8, -3.5, 3.5, 5.8]) planter(parent, x, 2.15, .47, .55, x < 0);
  tree(parent, -6, -.6, 1.1); tree(parent, 5.9, -.6, 1); tree(parent, 3.8, -3.55, .85);
  return { animations, exhibits };
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

/** A warm, open performance pavilion: woven ribs, acoustic waves, and an art court. */
export function buildCulturalCrossroads(parent: T.Group): WorldBuild {
  const animations: WorldAnimation[] = [];
  disc(parent, 4.95, .24, [0, .28, 0], stone);
  // Semicircular steps face the stage; the front stays open to the sky.
  for (let i = 0; i < 4; i++) {
    const tier = mesh(parent, new T.TorusGeometry(2.2 + i * .48, .19, 8, 52, Math.PI * 1.22), i % 2 ? clay : pearl, [0, .55 + i * .18, 0]);
    tier.rotation.x = Math.PI / 2; tier.rotation.z = -.35;
  }
  const stage = disc(parent, 1.8, .2, [0, .62, .1], clay); stage.scale.z = .8;
  // Interlaced petal ribs, rather than towers or a closed technological dome.
  for (let i = 0; i < 11; i++) {
    const a = i / 11 * Math.PI * 2;
    const points = Array.from({ length: 25 }, (_, k) => {
      const t = k / 24, theta = a + t * 1.35, radius = 2.85 * Math.sin(t * Math.PI * .84);
      return point(Math.cos(theta) * radius, 4.9 - t * 4, Math.sin(theta) * radius - .6);
    });
    tube(parent, points, i % 3 === 0 ? brass : pearl, .075);
    if (i % 2 === 0) tube(parent, points.map(p => p.clone().add(point(.06, 0, 0))), amber, .018);
  }
  // A globe-like woven lantern symbolizes connection without repeating Future's Earth.
  const lantern = new T.Group(); lantern.position.set(0, 2.7, -.5); parent.add(lantern);
  for (let i = 0; i < 5; i++) {
    const hoop = mesh(lantern, new T.TorusGeometry(.78, .025, 6, 48), i % 2 ? brass : teal);
    hoop.rotation.y = i * Math.PI / 5;
  }
  ring(lantern, .8, [0, 0, 0], brass, .035);
  animations.push({ object: lantern, axis: 'y', speed: .045 });
  // Art folios and a flowing, spatial music staff on opposite sides of the court.
  for (let i = 0; i < 3; i++) {
    const folio = new T.Group(); folio.position.set(-3.35 + i * .65, 1.7, 1.15); folio.rotation.y = .35; parent.add(folio);
    box(folio, brass, [0, 0, 0], [.57, 1.4, .08]);
    box(folio, [clay, teal, rose][i], [0, 0, .055], [.43, 1.24, .035]);
    ring(folio, .14, [0, .15, .1], amber, .018).rotation.x = 0;
    column(parent, folio.position.x, folio.position.z, .4, .65, .04);
  }
  for (let j = 0; j < 5; j++) {
    tube(parent, Array.from({ length: 21 }, (_, i) => point(1.6 + i * .12, 1.2 + j * .14 + Math.sin(i * .18) * .32, 1.95)), brass, .013);
  }
  for (let i = 0; i < 5; i++) {
    const x = 1.9 + i * .43, y = 1.3 + (i % 3) * .2;
    ball(parent, clay, [x, y, 1.94], [.1, .07, .045]); column(parent, x + .08, 1.94, y, .45, .014, brass);
  }
  skyWalk(parent, [point(-1.2, .46, 4.6), point(-.4, .6, 2.9), point(.7, .72, 1.3)], .9, pearl, false, amber);
  for (const [x, z] of [[-3.7, -1.8], [3.7, -1.5], [3.9, 1], [-2, 3.4]]) tree(parent, x, z, .8, x < 0);
  sign(parent, 'ART · MUSIC · STORIES', 0, .95, 3.2, 2.5);
  return { animations, exhibits: [] };
}

/** An asymmetric workshop with visible bracing, build benches, and a kinetic prototype. */
export function buildInventionYard(parent: T.Group): WorldBuild {
  const animations: WorldAnimation[] = [];
  roundedSlab(parent, 9.1, 7.2, .25, .3, ink);
  roundedSlab(parent, 8.5, 6.6, .1, .56, pearl);
  // Offset open gantry. Triangular braces keep its identity industrial and energetic.
  for (const x of [-3.4, 2.7]) {
    box(parent, coral, [x, 2.9, -1.6], [.2, 4.6, .2]);
    strut(parent, point(x, .65, -2.7), point(x, 3, -1.6), silver, .065);
    strut(parent, point(x, .65, -.5), point(x, 3, -1.6), silver, .065);
  }
  box(parent, coral, [-.35, 5.2, -1.6], [6.8, .28, .32]);
  for (let i = 0; i < 7; i++) {
    strut(parent, point(-3.3 + i * .88, 5, -1.6), point(-2.86 + i * .88, 5.45, -1.6), brass, .025);
  }
  box(parent, ink, [.8, 4.95, -1.6], [.65, .3, .6]);
  strut(parent, point(.8, 4.8, -1.6), point(.8, 3.5, -1.6), silver, .025);
  const suspended = new T.Group(); suspended.position.set(.8, 3, -1.6); parent.add(suspended);
  mesh(suspended, new T.TorusKnotGeometry(.62, .105, 64, 8), coral);
  const cage = mesh(suspended, new T.IcosahedronGeometry(.95, 0), new T.MeshBasicMaterial({ color: '#74cddd', wireframe: true }));
  cage.rotation.z = .3; animations.push({ object: suspended, axis: 'y', speed: .32 });
  // Distinct prototype benches along an L-shaped working aisle.
  const positions = [[-2.6, 1.65], [-.1, 2.3], [2.7, 1.45]];
  positions.forEach(([x, z], i) => {
    const station = new T.Group(); station.position.set(x, 0, z); parent.add(station);
    roundedSlab(station, 1.85, 1.15, .13, 1.15, stone);
    for (const dx of [-.65, .65]) box(station, ink, [dx, .9, 0], [.1, .65, .75]);
    box(station, ink, [-.4, 1.55, -.3], [.65, .48, .07]);
    box(station, cyan, [-.4, 1.55, -.25], [.5, .31, .015]);
    const prototype = new T.Group(); prototype.position.set(.4, 1.7, .05); station.add(prototype);
    if (i === 0) mesh(prototype, new T.OctahedronGeometry(.3), pink);
    if (i === 1) { box(prototype, teal, [0, -.1, 0], [.5, .22, .4]); for (const dx of [-.3, .3]) ball(prototype, ink, [dx, -.2, 0], [.09, .09, .09]); }
    if (i === 2) { ring(prototype, .3, [0, 0, 0], coral, .06).rotation.x = .5; ball(prototype, cyan, [0, 0, 0], [.1, .1, .1]); }
    animations.push({ object: prototype, axis: 'y', speed: .2 + i * .06 });
    sign(station, ['IDEATE', 'BUILD', 'ITERATE'][i], 0, .9, .61, 1.3);
  });
  // Challenge board, supply modules, and dashed build-lane markings.
  box(parent, ink, [-3, 2.05, -2.5], [1.7, 1.65, .12]);
  for (let i = 0; i < 3; i++) box(parent, i % 2 ? cyan : amber, [-3.4 + i * .4, 2.25 - i * .2, -2.4], [.28, .45, .03]);
  for (let i = 0; i < 4; i++) box(parent, i % 2 ? coral : teal, [3.35, .85 + (i % 2) * .45, -2.4 + Math.floor(i / 2) * .75], [.7, .45, .65]);
  for (let i = 0; i < 11; i++) box(parent, amber, [-3.8 + i * .7, .69, .25], [.32, .018, .07]);
  skyWalk(parent, [point(0, .58, 4.5), point(0, .68, 3.5), point(-1.2, .7, .5)], .75, pearl, false, pink);
  return { animations, exhibits: [] };
}

/** A deliberately sparse observatory with a tilted celestial atlas and knowledge clusters. */
export function buildObservatory(parent: T.Group): WorldBuild {
  const animations: WorldAnimation[] = [];
  disc(parent, 5.1, .22, [0, .28, 0], pearl);
  for (let i = 0; i < 3; i++) disc(parent, 2.1 - i * .18, .16, [-1.6, .48 + i * .15, -.5], stone);
  disc(parent, 1.5, .7, [-1.6, 1.12, -.5], pearl);
  const dome = mesh(parent, new T.SphereGeometry(1.48, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), glass, [-1.6, 1.46, -.5]);
  for (let i = 0; i < 5; i++) {
    const rib = mesh(parent, new T.TorusGeometry(1.5, .025, 5, 40, Math.PI), silver, [-1.6, 1.46, -.5]); rib.rotation.y = i * Math.PI / 5;
  }
  dome.rotation.y = .2;
  const telescope = new T.Group(); telescope.position.set(-1.6, 1.7, -.5); telescope.rotation.z = -.8; telescope.rotation.y = -.2; parent.add(telescope);
  column(telescope, 0, 0, 0, 2.5, .23, pearl); column(telescope, 0, 0, 2.2, .35, .34, ink);
  disc(telescope, .26, .02, [0, 2.56, 0], cyan);
  // Atlas is set behind the observatory, leaving a quiet front reading terrace.
  const atlas = new T.Group(); atlas.position.set(1.2, 3.35, -1.1); atlas.rotation.set(.12, .2, -.18); parent.add(atlas);
  for (const r of [1.55, 2.6]) mesh(atlas, new T.TorusGeometry(r, .024, 5, 80), r < 2 ? silver : brass);
  const nodes = [point(-1.8, .8, 0), point(-.8, 1.65, .15), point(.1, .9, .1), point(1.6, 1.25, -.1), point(2, -.15, 0), point(.8, -.6, .15), point(.1, -1.65, 0), point(-1.25, -.9, -.15), point(-.4, -.15, .2)];
  for (const [a, b] of [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[2,8],[5,8],[7,8]]) stroke(atlas, [nodes[a], nodes[b]], '#938ab7', .8);
  nodes.forEach((p, i) => { ball(atlas, i % 3 ? violet : cyan, p.toArray(), [.065, .065, .065]); ring(atlas, .13, p.toArray(), pearl, .018).rotation.x = 0; });
  animations.push({ object: atlas, axis: 'y', speed: .018 });
  for (let i = 0; i < 3; i++) {
    const a = .1 + i * 1.05, x = Math.cos(a) * 3.6, z = Math.sin(a) * 3.2;
    disc(parent, .52, .38, [x, .6, z], stone, 24);
    for (let j = 0; j < 3; j++) { const book = box(parent, j % 2 ? lavender : pearl, [x, .86 + j * .08, z], [.58, .065, .4]); book.rotation.y = j * .15; }
  }
  skyWalk(parent, [point(-3.4, .43, 3.6), point(-1.8, .5, 2.65), point(.6, .5, 2.15), point(3.6, .43, 1.1)], .6, pearl, false, violet);
  sign(parent, 'ASK · TEST · LEARN', -.6, .9, 2.7, 2);
  planter(parent, -3.6, -2.3, .45); planter(parent, 3.8, -1.4, .4);
  return { animations, exhibits: [] };
}

/** An exposed systems section: connected application, model, and data layers. */
export function buildSystemsNexus(parent: T.Group): WorldBuild {
  const animations: WorldAnimation[] = [];
  roundedSlab(parent, 8.6, 7.5, .24, .3, ink);
  const layers = [
    { y: .65, width: 7.7, depth: 5.8, x: -.2, z: 0, label: 'DATA · SQL · POSTGRESQL' },
    { y: 2.15, width: 6.5, depth: 4.6, x: -.6, z: -.4, label: 'MODELS · PYTHON · OLLAMA' },
    { y: 3.65, width: 5.2, depth: 3.5, x: -1.1, z: -.85, label: 'APPLICATIONS · FLASK · DJANGO' },
  ];
  for (const [i, level] of layers.entries()) {
    const { y, width, depth, x, z } = level;
    roundedSlab(parent, width, depth, .12, y, i === 0 ? stone : glass, x, z);
    const frame = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(width, .13, depth)), new T.LineBasicMaterial({ color: '#3d9a94' }));
    frame.position.set(x, y + .07, z); parent.add(frame);
    for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
      if (i < 2) column(parent, x + dx * (width / 2 - .3), z + dz * (depth / 2 - .3), y + .12, 1.4, .04, silver);
    }
    for (let j = 0; j < 3; j++) {
      const px = x - width * .28 + j * width * .28;
      if (i === 0) {
        disc(parent, .42, .55, [px, y + .42, z], teal, 24);
        for (let k = 0; k < 3; k++) ring(parent, .43, [px, y + .22 + k * .2, z], cyan, .014);
      } else if (i === 1) {
        box(parent, ink, [px, y + .38, z], [.85, .5, .8]);
        for (let k = 0; k < 3; k++) box(parent, cyan, [px - .22 + k * .22, y + .65, z], [.1, .025, .4]);
      } else {
        box(parent, pearl, [px, y + .6, z], [.9, .85, .1]);
        box(parent, teal, [px, y + .61, z + .06], [.73, .6, .02]);
        for (let k = 0; k < 3; k++) box(parent, cyan, [px, y + .82 - k * .18, z + .08], [.5, .025, .015]);
      }
      if (j < 2) tube(parent, [point(px + .4, y + .2, z + .6), point(px + width * .14, y + .2, z + .9), point(px + width * .28 - .4, y + .2, z + .6)], cyan, .025);
    }
    sign(parent, level.label, x, y + .35, z + depth / 2 + .02, width * .85);
  }
  // Visible risers carry information between levels rather than arbitrary logo orbits.
  for (const x of [2.7, 3.4]) {
    tube(parent, [point(x, .8, 1.7), point(x + .25, 1.35, 1.7), point(x, 2.35, 1), point(x - .7, 3, .8), point(x - 1.2, 3.9, .3)], x < 3 ? cyan : amber, .045);
  }
  const toolBus = new T.Group(); toolBus.position.set(2.9, 2.6, -.6); parent.add(toolBus);
  ring(toolBus, 1.1, [0, 0, 0], silver, .02).rotation.z = .35;
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI * 2;
    box(toolBus, teal, [Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1], [.32, .3, .32]);
  }
  animations.push({ object: toolBus, axis: 'y', speed: .08 });
  skyWalk(parent, [point(0, .45, 4.4), point(0, .65, 3.2), point(-1.2, .8, 2.3)], .85, pearl, false, cyan);
  return { animations, exhibits: [] };
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

/** An open crescent terrace, with three unfinished routes toward future possibilities. */
export function buildOpenHorizon(parent: T.Group): WorldBuild {
  const animations: WorldAnimation[] = [];
  disc(parent, 5.45, .2, [0, .28, 0], pearl);
  // The low crescent leaves most of the sky visible; no gateway or central skyscraper.
  for (let i = 0; i < 3; i++) {
    skyWalk(parent, arcPoints(4.6 - i * .46, .48 + i * .2, -.05, Math.PI * 1.3), .42, i % 2 ? stone : pearl, false, amber);
  }
  const globe = earth(parent, 1.85); globe.position.set(-.6, 3.6, -.7); globe.rotation.z = .23;
  animations.push({ object: globe, axis: 'y', speed: .035 });
  const cradle = mesh(parent, new T.TorusGeometry(2.15, .055, 8, 72, Math.PI * 1.55), brass, [-.6, 3.6, -.7]); cradle.rotation.z = -.6;
  column(parent, -.6, -.7, .45, .85, .1, brass);
  const labels = ['HIGHER STUDIES', 'DEEPER RESEARCH', 'GLOBAL EXPLORATION'];
  for (let i = 0; i < 3; i++) {
    const x = 1.7 + i * 1.05, z = -2.9 + i * 1.6;
    const points = [point(-.6, .65, 1), point(x - .8, 1.5 + i * .3, z + .8), point(x + .6, 3.5 + i * .55, z)];
    tube(parent, points, i % 2 ? cyan : amber, .025);
    ball(parent, pearl, [x + .6, 3.5 + i * .55, z], [.09, .09, .09]);
    // Dashed continuations communicate aspiration, rather than achieved destinations.
    for (let k = 1; k <= 4; k++) {
      const a = points[2].clone().add(point(k * .19, k * .18, -.03 * k));
      strut(parent, a, a.clone().add(point(.07, .07, -.01)), i % 2 ? cyan : amber, .016);
    }
    sign(parent, labels[i], x, .78, 2.1 + i * .46, 1.7);
  }
  skyWalk(parent, [point(-1.7, .45, 4.8), point(-2.7, .65, 3.1), point(-2.7, .72, .8)], .85, pearl, true, amber);
  for (const x of [-3.7, -2.5]) planter(parent, x, -1.8, .45, .5);
  return { animations, exhibits: [] };
}

