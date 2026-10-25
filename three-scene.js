import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

const canvas = document.querySelector('#carCanvas');
const host = document.querySelector('#stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#111316');
scene.fog = new THREE.FogExp2('#111316', .025);
const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
camera.position.set(7.9, 3.65, 8.9);
const controls = new OrbitControls(camera, canvas);
controls.enablePan = false;
controls.target.set(0, .72, 0);
controls.enableDamping = true;
controls.dampingFactor = .055;
controls.minDistance = 6;
controls.maxDistance = 17;
controls.minPolarAngle = .72;
controls.maxPolarAngle = 1.48;
controls.maxAzimuthAngle = Math.PI * .85;
controls.minAzimuthAngle = -Math.PI * .85;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
RectAreaLightUniformsLib.init();
scene.add(new THREE.HemisphereLight('#dce7ff', '#211b1c', 2.1));
function area(color, intensity, x, y, z, sx, sy) {
  const light = new THREE.RectAreaLight(color, intensity, sx, sy);
  light.position.set(x, y, z); light.lookAt(0, .5, 0); scene.add(light);
}
area('#fff0df', 15, -2, 6, 3, 8, 2.5);
area('#8cbcff', 11, 1, 4, -5, 7, 2);
area('#ff554b', 9, 0, 3.5, 6, 5, 1.1);
area('#ffffff', 5, 7, 2.5, 1, 3, 1.4);
const key = new THREE.DirectionalLight('#ffe3d3', 4.2);
key.position.set(-4, 8, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -8; key.shadow.camera.right = 8; key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
scene.add(key);

const floorMat = new THREE.MeshStandardMaterial({ color: '#191a1d', metalness: .72, roughness: .27 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), floorMat);
floor.rotation.x = -Math.PI / 2; floor.position.y = -.025; floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.GridHelper(80, 80, '#323438', '#27292d');
grid.position.y = -.018; grid.material.transparent = true; grid.material.opacity = .28; scene.add(grid);

const car = new THREE.Group(); scene.add(car);
const paint = new THREE.MeshPhysicalMaterial({ color: '#d91f2b', metalness: .82, roughness: .19, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.8 });
const darkPaint = new THREE.MeshPhysicalMaterial({ color: '#111419', metalness: .68, roughness: .28, clearcoat: .65 });
const glass = new THREE.MeshPhysicalMaterial({ color: '#17242c', metalness: .48, roughness: .1, clearcoat: 1, transmission: .04, envMapIntensity: 2 });
const rubber = new THREE.MeshStandardMaterial({ color: '#101113', roughness: .83 });
const alloy = new THREE.MeshStandardMaterial({ color: '#bdc3c4', metalness: .94, roughness: .2 });
const blackMetal = new THREE.MeshStandardMaterial({ color: '#272b30', metalness: .82, roughness: .27 });
const redGlow = new THREE.MeshBasicMaterial({ color: '#ee4843', transparent: true, opacity: .8 });
function mesh(geometry, material, parent = car, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material); object.position.set(...position); object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
}
function latheBody() {
  // Hand-shaped cross sections create a continuous, curved low coupe body.
  const sections = [
    [-3.65,.50,.45,.54],[-3.5,.62,.61,.66],[-3.05,.73,.68,.75],[-2.45,.79,.70,.79],
    [-1.7,.82,.71,.82],[-.8,.80,.71,.79],[.15,.79,.73,.8],[1.1,.82,.73,.82],
    [2.0,.83,.71,.82],[2.8,.78,.67,.78],[3.35,.68,.57,.7],[3.55,.46,.45,.56]
  ];
  const verts = [], indices = [];
  const ring = 32;
  for (const [x, halfWidth, top, bottom] of sections) {
    for (let j=0;j<ring;j++) {
      const a = j / ring * Math.PI * 2;
      const s = Math.sin(a), c = Math.cos(a);
      const z = s * halfWidth * (Math.abs(c) < .2 ? .92 : 1);
      const y = (s >= 0 ? bottom : top) + (s >= 0 ? 1 : -1) * Math.pow(Math.abs(c), 1.7) * (s >= 0 ? .08 : .06);
      verts.push(x, y, z);
    }
  }
  for (let i=0;i<sections.length-1;i++) for(let j=0;j<ring;j++) {
    const a=i*ring+j,b=i*ring+(j+1)%ring,c=(i+1)*ring+(j+1)%ring,d=(i+1)*ring+j;
    indices.push(a,b,d,b,c,d);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();
  mesh(g,paint);
}
latheBody();

function makeWindow(points) {
  const shape = new THREE.Shape();
  points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y)); shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape, 12);
  const obj = mesh(geometry, glass); obj.rotation.y = Math.PI / 2; return obj;
}
// Roof canopy: curved coupe greenhouse, split into windshield, roof, and rear glass.
const roofShape = new THREE.Shape();
roofShape.moveTo(-1.55,.81);roofShape.quadraticCurveTo(-1.2,1.67,-.35,1.76);roofShape.lineTo(.72,1.74);roofShape.quadraticCurveTo(1.42,1.62,1.8,.82);roofShape.lineTo(1.48,.85);roofShape.quadraticCurveTo(1.15,1.43,.61,1.49);roofShape.lineTo(-.38,1.5);roofShape.quadraticCurveTo(-1.02,1.4,-1.27,.84);roofShape.closePath();
const roof = mesh(new THREE.ExtrudeGeometry(roofShape,{depth:1.12,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.055,bevelThickness:.04}),paint,car,[0,0,-.56]);
roof.castShadow=true;
// Glazing follows each side of the canopy.
for(const side of [-1,1]) {
  const windowShape=new THREE.Shape(); windowShape.moveTo(-1.16,1.05);windowShape.quadraticCurveTo(-.92,1.46,-.35,1.52);windowShape.lineTo(.62,1.52);windowShape.quadraticCurveTo(1.14,1.42,1.48,1.04);windowShape.lineTo(.45,1.08);windowShape.lineTo(-.7,1.08);windowShape.closePath();
  const pane=mesh(new THREE.ShapeGeometry(windowShape,16),glass,car,[0,0,side*.574]); pane.material.side=THREE.DoubleSide;
  const trim = new THREE.Mesh(new THREE.BoxGeometry(2.1,.035,.035),blackMetal);trim.position.set(.05,1.08,side*.59);car.add(trim);
}
// Broad slanted windshield and rear screen.
const wind=mesh(new THREE.PlaneGeometry(1.15,.66),glass,car,[-1.04,1.19,0]);wind.rotation.z=-.54;wind.rotation.y=Math.PI/2;wind.material.side=THREE.DoubleSide;
const backGlass=mesh(new THREE.PlaneGeometry(.95,.55),glass,car,[1.22,1.18,0]);backGlass.rotation.z=.58;backGlass.rotation.y=Math.PI/2;backGlass.material.side=THREE.DoubleSide;

// Flares, skirts and front/rear aero details.
for (const x of [-2.15,2.05]) {
  for (const side of [-1,1]) {
    const flare=mesh(new THREE.TorusGeometry(.69,.055,10,48,Math.PI),paint,car,[x,.43,side*.68]);flare.rotation.z=Math.PI;
    const lip=mesh(new THREE.BoxGeometry(1.25,.09,.14),darkPaint,car,[x,.16,side*.73]);
  }
}
mesh(new THREE.BoxGeometry(1.1,.11,1.7),darkPaint,car,[-3.45,.4,0]);
mesh(new THREE.BoxGeometry(.75,.14,1.68),blackMetal,car,[3.18,.33,0]);
mesh(new THREE.BoxGeometry(.72,.09,1.55),darkPaint,car,[3.42,.41,0]);
// Rear wing on two sculpted mounts.
for(const z of [-.44,.44])mesh(new THREE.BoxGeometry(.08,.42,.08),blackMetal,car,[2.72,1.02,z]);
mesh(new THREE.BoxGeometry(.56,.1,1.56),darkPaint,car,[2.78,1.24,0]);

const wheelGroups=[];
function buildWheel(x,z) {
  const group=new THREE.Group();group.position.set(x,.47,z);car.add(group);wheelGroups.push(group);
  const tire=mesh(new THREE.CylinderGeometry(.57,.57,.34,48,1),rubber,group);tire.rotation.x=Math.PI/2;
  const sidewall=mesh(new THREE.CylinderGeometry(.48,.48,.36,48,1),blackMetal,group);sidewall.rotation.x=Math.PI/2;
  const disc=mesh(new THREE.CylinderGeometry(.395,.395,.37,48,1),alloy,group);disc.rotation.x=Math.PI/2;
  const hub=mesh(new THREE.CylinderGeometry(.09,.09,.39,24),blackMetal,group);hub.rotation.x=Math.PI/2;
  for(let i=0;i<10;i++){
    const a=i*Math.PI/5;
    const spoke=mesh(new THREE.BoxGeometry(.055,.62,.055),alloy,group,[Math.sin(a)*.15,Math.cos(a)*.15,z<0?-.02:.02]);
    spoke.rotation.z=-a;
  }
  const rotor=mesh(new THREE.CylinderGeometry(.31,.31,.02,40),blackMetal,group,[0,0,z<0?-.18:.18]);rotor.rotation.x=Math.PI/2;
  for(let j=0;j<8;j++){const a=j*Math.PI/4;const hole=mesh(new THREE.SphereGeometry(.017,8,8),rubber,group,[Math.sin(a)*.335,Math.cos(a)*.335,z<0?-.205:.205]);}
  return group;
}
buildWheel(-2.14,-.71);buildWheel(-2.14,.71);buildWheel(2.08,-.71);buildWheel(2.08,.71);

// Lighting details and vents.
for(const side of [-1,1]){
  const head=mesh(new THREE.BoxGeometry(.08,.13,.68),new THREE.MeshBasicMaterial({color:'#dff8ff'}),car,[-3.31,.69,side*.43]);head.rotation.x=side*.16;
  const tail=mesh(new THREE.BoxGeometry(.07,.13,.65),new THREE.MeshBasicMaterial({color:'#ff202a'}),car,[3.34,.69,side*.43]);
  const vent=mesh(new THREE.BoxGeometry(.035,.34,.15),blackMetal,car,[.88,.7,side*.805]);vent.rotation.x=.22;
}
// Underglow panel and colored point lights update from customization controls.
const underglow=mesh(new THREE.BoxGeometry(4.9,.015,1.05),redGlow,car,[-.05,.035,0]);
const glowLight=new THREE.PointLight('#ee4843',4,5,2);glowLight.position.set(0,.3,0);car.add(glowLight);
// Subtle overhead showroom arch.
const arches=new THREE.Group();scene.add(arches);
for(let i=0;i<6;i++){const arc=new THREE.Mesh(new THREE.TorusGeometry(8+i*.48,.018,4,100,Math.PI),new THREE.MeshBasicMaterial({color:i%2?'#565960':'#8b3434',transparent:true,opacity:.26}));arc.rotation.x=Math.PI/2;arc.position.set(0,4.7-i*.3,-7-i*.4);arches.add(arc);}

function resize(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}
animate();

window.addEventListener('atelier:reset-view',()=>{camera.position.set(7.9,3.65,8.9);controls.target.set(0,.72,0);controls.update();});

window.addEventListener('atelier:paint', e=>{paint.color.set(e.detail.color);paint.roughness=e.detail.finish==='satin'?.34:e.detail.finish==='metallic'?.14:.19;paint.metalness=e.detail.finish==='metallic'?.95:.82;});
window.addEventListener('atelier:wheels', e=>{for(const w of wheelGroups){w.children.forEach((o,i)=>{if(i>=2)o.visible=e.detail.type!=='disc';});}});
window.addEventListener('atelier:glow', e=>{underglow.visible=e.detail.enabled;glowLight.visible=e.detail.enabled;glowLight.color.set(e.detail.color);underglow.material.color.set(e.detail.color);});
window.addEventListener('atelier:stance', e=>{car.position.y=(50-e.detail.value)*.0025;});
window.addEventListener('atelier:view', e=>{
  const targets={side:new THREE.Vector3(8,3.6,8.5),front:new THREE.Vector3(-.2,2.5,10.5),rear:new THREE.Vector3(.2,2.5,-10.5)};
  const target=targets[e.detail.view];const start=camera.position.clone();const began=performance.now();
  function tween(now){const t=Math.min(1,(now-began)/650);const ease=1-Math.pow(1-t,3);camera.position.lerpVectors(start,target,ease);controls.target.set(0,.72,0);if(t<1)requestAnimationFrame(tween);}
  requestAnimationFrame(tween);
});
