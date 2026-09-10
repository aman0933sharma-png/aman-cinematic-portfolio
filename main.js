import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const canvas = document.getElementById("scene");
const loader = document.getElementById("loader");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05060a, 0.045);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);
camera.position.set(0, 0.4, 8);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.7, 0.2);
composer.addPass(bloom);

scene.add(new THREE.AmbientLight(0x1a2233, 0.7));
const key = new THREE.PointLight(0xd4b15f, 18, 24);
key.position.set(4, 3, 4);
scene.add(key);
const rim = new THREE.PointLight(0x4a6cff, 8, 20);
rim.position.set(-6, -1, 2);
scene.add(rim);

const group = new THREE.Group();
scene.add(group);

const goldMat = new THREE.MeshStandardMaterial({
  color: 0xd4b15f,
  metalness: 0.92,
  roughness: 0.22,
  emissive: 0x3a2a0a,
  emissiveIntensity: 0.25,
});
const steelMat = new THREE.MeshStandardMaterial({
  color: 0x8aa0c0,
  metalness: 0.85,
  roughness: 0.28,
});
const darkMat = new THREE.MeshStandardMaterial({
  color: 0x11151d,
  metalness: 0.6,
  roughness: 0.4,
});

function addRing(r, tube, y, rot) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 16, 80), goldMat);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.position.y = y;
  group.add(m);
  return m;
}
const rings = [
  addRing(2.4, 0.018, 0.2, [1.2, 0.2, 0.4]),
  addRing(3.4, 0.012, -0.4, [0.4, 1.1, 0.2]),
  addRing(1.6, 0.02, 0.8, [1.6, 0.5, 0.1]),
];

const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.55, 0.12, 160, 16), steelMat);
knot.position.set(-3.2, 1.1, -1.2);
group.add(knot);

const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), darkMat);
box.position.set(3.4, -0.8, -0.6);
group.add(box);
const box2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.45), goldMat);
box2.position.set(2.6, 1.6, -1.8);
group.add(box2);

const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), steelMat);
ico.position.set(-2.8, -1.3, 0.4);
group.add(ico);

const count = 900;
const positions = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 28;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const points = new THREE.Points(
  pGeo,
  new THREE.PointsMaterial({ color: 0xd4b15f, size: 0.018, transparent: true, opacity: 0.55 })
);
scene.add(points);

const mouse = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.0045;
  group.rotation.y = t * 0.35 + mouse.x * 0.15;
  group.rotation.x = mouse.y * 0.08;
  rings[0].rotation.z += 0.002;
  rings[1].rotation.y -= 0.0015;
  rings[2].rotation.x += 0.0025;
  knot.rotation.x += 0.006;
  knot.rotation.y += 0.004;
  box.rotation.y += 0.008;
  box.rotation.x += 0.004;
  box2.rotation.y -= 0.01;
  ico.rotation.z += 0.007;
  points.rotation.y = t * 0.08;
  const scroll = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
  camera.position.z = 8 - scroll * 1.6;
  camera.position.y = 0.4 + scroll * 0.8;
  camera.lookAt(0, scroll * 0.4, 0);
  composer.render();
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("load", () => {
  setTimeout(() => loader.classList.add("done"), 1700);
});
