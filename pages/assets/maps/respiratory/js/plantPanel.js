// ══════════════════════════════════════════════════════════
// js/plantPanel.js — Split-Screen Plant Detail Panel
//   Left:  Separate Three.js model viewer + interactive hotspots
//   Right: Tabbed information panel
// ══════════════════════════════════════════════════════════
import * as THREE from 'three';
import { unlockPointer } from './controls.js';

let modelScene    = null;
let modelCamera   = null;
let modelRenderer = null;
let modelGroup    = null;
let modelAnimId   = null;
let isDragging    = false;
let prevMouse     = { x: 0, y: 0 };
let modelRotation = { x: 0.2, y: 0 };
let modelScale    = 1.0;
let hotspotsData  = [];

// ── Hotspot color map ──
const HOTSPOT_COLORS = {
  stem:   { bg: '#7a5c3a', border: '#c4a882', label: 'Stem / Bark' },
  leaf:   { bg: '#2d6a2d', border: '#5aaa5a', label: 'Leaves' },
  flower: { bg: '#7a3a6a', border: '#d070c0', label: 'Flower' },
  fruit:  { bg: '#5a7a30', border: '#90c050', label: 'Fruit' },
  root:   { bg: '#5a4030', border: '#a08060', label: 'Root' },
};

// ── Hotspot 3D positions per plant part ──
// These are relative positions in model space that look good
const PART_POSITIONS = {
  stem:   new THREE.Vector3(0.05,  0.5,  0.2),
  leaf:   new THREE.Vector3(0.35,  0.7,  0.1),
  flower: new THREE.Vector3(-0.1,  1.05, 0.1),
  fruit:  new THREE.Vector3(0.3,   0.85, 0.15),
  root:   new THREE.Vector3(-0.15, 0.0,  0.2),
};

export function initPlantPanel(state) {
  // Listen for open/close events
  window.addEventListener('openPlantPanel', e => {
    openPanel(state, e.detail);
  });

  window.addEventListener('closePlantPanel', () => {
    closePanel(state);
  });

  // Close button
  document.getElementById('closePanelBtn').addEventListener('click', () => closePanel(state));

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.code === 'Escape' && state.panelOpen) closePanel(state);
  });

  // Tab switching
  document.getElementById('tabBar').addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderTab(state.activePlant, tab.dataset.tab);
  });

  // Action buttons
  document.getElementById('bookmarkBtn').addEventListener('click', () => toggleBookmark(state));
  document.getElementById('shareBtn').addEventListener('click', () => shareCurrentPlant(state));
  document.getElementById('notesBtn').addEventListener('click', () => openNotes(state));

  // Notes modal
  document.getElementById('saveNotesBtn').addEventListener('click', () => saveNotes(state));
  document.getElementById('cancelNotesBtn').addEventListener('click', () => closeNotes());
  document.getElementById('closeNotesBtn').addEventListener('click', () => closeNotes());

  // Hotspot close
  document.getElementById('closeHotspotBtn').addEventListener('click', () => {
    document.getElementById('hotspotPopup').classList.add('hidden');
  });

  // Model drag to rotate
  initModelDrag();
}

function initModelDrag() {
  const canvas = document.getElementById('modelCanvas');

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    modelRotation.y += dx * 0.012;
    modelRotation.x  = Math.max(-1.2, Math.min(1.2, modelRotation.x + dy * 0.012));
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  canvas.addEventListener('wheel', e => {
    modelScale = Math.max(0.5, Math.min(2.5, modelScale - e.deltaY * 0.001));
    if (modelGroup) modelGroup.scale.setScalar(modelScale);
  }, { passive: true });
}

// ─────────────────────────────────────────────────────────
// OPEN PANEL
// ─────────────────────────────────────────────────────────
function openPanel(state, plantData) {
  state.panelOpen  = true;
  state.activePlant = plantData;

  unlockPointer();

  // Blur the garden canvas
  document.getElementById('gardenCanvas').classList.add('blurred');

  // Show panel
  const panel = document.getElementById('plantPanel');
  panel.classList.remove('hidden');

  // Fill header
  document.getElementById('modelPlantName').textContent = plantData.name;
  document.getElementById('modelBotanicalName').textContent = plantData.botanicalName;

  // Right panel header
  document.getElementById('plantSystemBadge').textContent = '🌿 ' + plantData.ayushSystem.join(' · ');
  document.getElementById('plantCommonName').textContent = plantData.name;
  document.getElementById('plantBotanicalNameInfo').textContent = plantData.botanicalName;

  // Bookmark button state
  updateBookmarkBtn(state, plantData);

  // Reset tabs
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab[data-tab="overview"]').classList.add('active');
  renderTab(plantData, 'overview');

  // Build 3D model viewer
  initModelScene(plantData);

  // Create hotspots
  createHotspots(plantData);
}

// ─────────────────────────────────────────────────────────
// CLOSE PANEL
// ─────────────────────────────────────────────────────────
function closePanel(state) {
  state.panelOpen  = false;
  state.activePlant = null;

  document.getElementById('gardenCanvas').classList.remove('blurred');
  document.getElementById('plantPanel').classList.add('hidden');
  document.getElementById('hotspotPopup').classList.add('hidden');

  // Destroy model renderer
  if (modelAnimId) {
    cancelAnimationFrame(modelAnimId);
    modelAnimId = null;
  }
  if (modelRenderer) {
    modelRenderer.dispose();
    modelRenderer = null;
  }
  modelScene = modelCamera = modelGroup = null;
  modelScale = 1.0;
  modelRotation = { x: 0.2, y: 0 };

  // Clear hotspots
  document.getElementById('hotspotContainer').innerHTML = '';
  hotspotsData = [];

  // Re-lock pointer if user clicks garden
  const canvas = document.getElementById('gardenCanvas');
  canvas.addEventListener('click', () => canvas.requestPointerLock(), { once: true });
}

// ─────────────────────────────────────────────────────────
// 3D MODEL SCENE (LEFT PANEL)
// ─────────────────────────────────────────────────────────
function initModelScene(plantData) {
  const canvas = document.getElementById('modelCanvas');
  const container = document.getElementById('modelViewer');

  // Sizes
  const w = container.clientWidth;
  const h = container.clientHeight;

  // Scene
  modelScene = new THREE.Scene();
  modelScene.background = new THREE.Color(0x081510);

  // Fog
  modelScene.fog = new THREE.FogExp2(0x081510, 0.08);

  // Camera
  modelCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  modelCamera.position.set(0, 1.2, 3.2);
  modelCamera.lookAt(0, 0.8, 0);

  // Lighting
  const ambient = new THREE.AmbientLight(0x404040, 0.8);
  modelScene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.5);
  keyLight.position.set(3, 5, 4);
  modelScene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xc0e8ff, 0.4);
  fillLight.position.set(-3, 2, -2);
  modelScene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x80ff80, 0.3);
  rimLight.position.set(0, 3, -4);
  modelScene.add(rimLight);

  // Ground disc
  const groundGeo = new THREE.CircleGeometry(1.5, 32);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x1a3a1a });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  modelScene.add(ground);

  // Atmospheric particles (firefly effect)
  createParticles(modelScene);

  // Build the plant model (same builder as garden but standalone)
  modelGroup = buildModelPlant(plantData);
  modelGroup.scale.setScalar(1.4);

  // Center the model
  const bbox = new THREE.Box3().setFromObject(modelGroup);
  const center = bbox.getCenter(new THREE.Vector3());
  modelGroup.position.sub(center);
  modelGroup.position.y += 0.5;

  modelScene.add(modelGroup);

  // Renderer
  modelRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  modelRenderer.setSize(w, h);
  modelRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  modelRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  modelRenderer.toneMappingExposure = 1.2;

  // Handle resize
  const resizeObs = new ResizeObserver(() => {
    const nw = container.clientWidth;
    const nh = container.clientHeight;
    modelCamera.aspect = nw / nh;
    modelCamera.updateProjectionMatrix();
    modelRenderer.setSize(nw, nh);
  });
  resizeObs.observe(container);

  // Auto-rotate
  modelRotation.y = 0;

  // Animate
  function animateModel() {
    modelAnimId = requestAnimationFrame(animateModel);

    if (!isDragging) {
      modelRotation.y += 0.006;
    }

    if (modelGroup) {
      modelGroup.rotation.y = modelRotation.y;
      modelGroup.rotation.x = modelRotation.x;
    }

    // Update hotspot positions
    updateHotspotPositions(w, h);

    modelRenderer.render(modelScene, modelCamera);
  }
  animateModel();
}

function createParticles(scene) {
  const geo = new THREE.BufferGeometry();
  const count = 80;
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push(
      (Math.random() - 0.5) * 4,
      Math.random() * 3,
      (Math.random() - 0.5) * 4
    );
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x80ff80,
    size: 0.02,
    transparent: true,
    opacity: 0.5,
  });
  scene.add(new THREE.Points(geo, mat));
}

// Build model plant (same builders as plants.js, imported here)
function buildModelPlant(data) {
  // Dynamic import using same IDs
  const { buildPlantById } = getPlantBuilder();
  return buildPlantById(data);
}

function getPlantBuilder() {
  // Re-use the same logic inline (avoid circular import)
  return {
    buildPlantById: (data) => {
      // We need to call the same builder as plants.js
      // Use a global registry approach via custom event or just import
      // Since we can't easily re-import without circular deps, we inline a mini builder
      return buildInlineModel(data);
    }
  };
}

function buildInlineModel(data) {
  // Creates a higher-detail version of each plant for the panel view
  // We dynamically import from plants.js logic is already imported transitively
  // For the panel, we create a fresh instance of the same plant
  const event = new CustomEvent('buildPanelPlant', { detail: data });
  let result = null;

  // Use a synchronous workaround: create the group here based on plant ID
  return createDetailedModel(data);
}

function createDetailedModel(data) {
  const group = new THREE.Group();

  // Color from plant data
  const c = parseInt(data.colorHex.replace('#',''), 16);
  const leafMat  = new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide });
  const stemMat  = new THREE.MeshLambertMaterial({ color: darken(c, 0.5) });
  const stemMat2 = new THREE.MeshLambertMaterial({ color: 0x5a3820 });

  // Plant-specific detailed models for panel
  switch (data.id) {
    case 'tulsi': {
      buildDetailTulsi(group, leafMat, stemMat); break;
    }
    case 'ashwagandha': {
      buildDetailAshwagandha(group, leafMat, stemMat); break;
    }
    case 'neem': {
      buildDetailNeem(group, leafMat, stemMat2); break;
    }
    case 'turmeric': {
      buildDetailTurmeric(group, leafMat, stemMat); break;
    }
    case 'brahmi': {
      buildDetailBrahmi(group, leafMat, stemMat); break;
    }
    case 'aloe': {
      buildDetailAloe(group, leafMat, stemMat); break;
    }
    case 'giloy': {
      buildDetailGiloy(group, leafMat, stemMat); break;
    }
    case 'amla': {
      buildDetailAmla(group, leafMat, stemMat2); break;
    }
    case 'peppermint': {
      buildDetailPeppermint(group, leafMat, stemMat); break;
    }
    case 'calendula': {
      buildDetailCalendula(group, leafMat, stemMat); break;
    }
    default: {
      const sGeo = new THREE.CylinderGeometry(0.04, 0.07, 1.0, 7);
      group.add(new THREE.Mesh(sGeo, stemMat));
      for (let i=0;i<8;i++){
        const lg=new THREE.SphereGeometry(0.15,6,5);
        const l=new THREE.Mesh(lg,leafMat);
        const a=(i/8)*Math.PI*2;
        l.position.set(Math.cos(a)*0.4,0.5+Math.random()*0.5,Math.sin(a)*0.4);
        group.add(l);
      }
    }
  }

  // Root system visible at the base
  const rootMat = new THREE.MeshLambertMaterial({ color: 0xc4a882 });
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const rGeo = new THREE.CylinderGeometry(0.012, 0.006, 0.35, 4);
    const r = new THREE.Mesh(rGeo, rootMat);
    r.position.set(Math.cos(angle)*0.12, -0.15, Math.sin(angle)*0.12);
    r.rotation.z = Math.cos(angle) * 1.4;
    r.rotation.x = Math.sin(angle) * 1.4;
    group.add(r);
  }

  return group;
}

// Detailed model builders for panel (richer than garden models)
function buildDetailTulsi(g, lm, sm) {
  const pm = new THREE.MeshLambertMaterial({ color: 0x8b5cf6 });
  for (let i=0;i<7;i++){
    const a=(i/7)*Math.PI*2;
    const h=0.65+Math.random()*0.25;
    const sG=new THREE.CylinderGeometry(0.018,0.028,h,5);
    const s=new THREE.Mesh(sG,sm);
    s.position.set(Math.cos(a)*0.2,h/2,Math.sin(a)*0.2);
    s.rotation.z=(Math.random()-0.5)*0.4;
    g.add(s);
    for(let j=0;j<5;j++){
      const l=makeLeafShape(lm,0.13,0.09);
      const la=a+j*0.5;
      l.position.set(Math.cos(a)*0.2+(Math.random()-0.5)*0.15,h*(0.2+j*0.18),Math.sin(a)*0.2+(Math.random()-0.5)*0.1);
      l.rotation.y=la;l.rotation.z=0.3;g.add(l);
    }
    if(i%2===0){
      const spG=new THREE.CylinderGeometry(0.015,0.01,0.25,5);
      const sp=new THREE.Mesh(spG,pm);
      sp.position.set(Math.cos(a)*0.2,h+0.12,Math.sin(a)*0.2);g.add(sp);
      for(let k=0;k<5;k++){const fG=new THREE.SphereGeometry(0.022,5,4);const f=new THREE.Mesh(fG,pm);f.position.set(Math.cos(a)*0.2+(Math.random()-0.5)*0.04,h+0.05+k*0.05,Math.sin(a)*0.2+(Math.random()-0.5)*0.04);g.add(f);}
    }
  }
}

function buildDetailAshwagandha(g, lm, sm) {
  const bm=new THREE.MeshLambertMaterial({color:0xcc3300});
  const mG=new THREE.CylinderGeometry(0.045,0.075,1.0,7);
  g.add(Object.assign(new THREE.Mesh(mG,sm),{position:{x:0,y:0.5,z:0}}));
  for(let i=0;i<5;i++){
    const a=(i/5)*Math.PI*2;
    const bG=new THREE.CylinderGeometry(0.018,0.03,0.5,5);
    const br=new THREE.Mesh(bG,sm);
    br.position.set(Math.cos(a)*0.15,0.8,Math.sin(a)*0.15);
    br.rotation.z=Math.cos(a)*0.7;br.rotation.x=Math.sin(a)*0.7;g.add(br);
    for(let j=0;j<4;j++){const l=makeLeafShape(lm,0.18,0.12);l.position.set(Math.cos(a)*(0.18+j*0.1),0.8+j*0.12,Math.sin(a)*(0.18+j*0.1));l.rotation.y=a;g.add(l);}
    for(let b=0;b<4;b++){const bGeo=new THREE.SphereGeometry(0.035,6,5);const berry=new THREE.Mesh(bGeo,bm);berry.position.set(Math.cos(a)*0.28+(Math.random()-0.5)*0.06,1.1+Math.random()*0.15,Math.sin(a)*0.28+(Math.random()-0.5)*0.06);g.add(berry);}
  }
}

function buildDetailNeem(g, lm, sm) {
  const tG=new THREE.CylinderGeometry(0.1,0.18,2.0,8);
  g.add(Object.assign(new THREE.Mesh(tG,sm),{position:{x:0,y:1.0,z:0}}));
  const cps=[[0,2.8,0],[0.6,2.6,0.5],[-0.6,2.6,-0.4],[0.5,2.5,-0.5],[-0.4,2.7,0.5],[0,3.1,0.3]];
  cps.forEach(([x,y,z])=>{const r=0.6+Math.random()*0.3;const geo=new THREE.SphereGeometry(r,8,7);const c=new THREE.Mesh(geo,lm);c.position.set(x,y,z);c.scale.set(1,0.75,1);g.add(c);});
  for(let i=0;i<25;i++){const a=Math.random()*Math.PI*2;const r2=0.5+Math.random()*0.7;const l=makeLeafShape(lm,0.07,0.035);l.position.set(Math.cos(a)*r2,2.6+Math.random()*0.8,Math.sin(a)*r2);l.rotation.set(Math.random()*0.5,a,Math.random()*0.3);g.add(l);}
}

function buildDetailTurmeric(g, lm, sm) {
  const rm=new THREE.MeshLambertMaterial({color:0xe8a020});
  for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;const rG=new THREE.CapsuleGeometry(0.07,0.25,4,6);const r=new THREE.Mesh(rG,rm);r.position.set(Math.cos(a)*0.22,-0.05,Math.sin(a)*0.22);r.rotation.z=Math.cos(a)*1.4;r.rotation.x=Math.sin(a)*1.4;g.add(r);}
  for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;const h=1.1+Math.random()*0.3;const l=makeLargeLeafShape(lm,0.28,h);l.position.set(Math.cos(a)*0.12,h*0.5,Math.sin(a)*0.12);l.rotation.y=a;l.rotation.z=Math.cos(a)*0.35;g.add(l);}
  const spG=new THREE.CylinderGeometry(0.025,0.035,0.7,5);
  const fm=new THREE.MeshLambertMaterial({color:0xffe0b2});
  g.add(Object.assign(new THREE.Mesh(spG,new THREE.MeshLambertMaterial({color:0x6ab04c})),{position:{x:0,y:0.85,z:0}}));
  for(let i=0;i<7;i++){const fG=new THREE.SphereGeometry(0.07,6,5);const f=new THREE.Mesh(fG,fm);f.position.set((Math.random()-0.5)*0.1,0.95+i*0.09,(Math.random()-0.5)*0.1);g.add(f);}
}

function buildDetailBrahmi(g, lm, sm) {
  const fm=new THREE.MeshLambertMaterial({color:0xd0d8ff});
  for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2;const len=0.5+Math.random()*0.35;const sG=new THREE.CylinderGeometry(0.009,0.013,len,4);const s=new THREE.Mesh(sG,sm);s.rotation.z=Math.PI/2-0.1;s.rotation.y=a;s.position.set(Math.cos(a)*len/2,0.05,Math.sin(a)*len/2);g.add(s);
  for(let j=0;j<5;j++){const t=(j+1)/6;const lx=Math.cos(a)*len*t;const lz=Math.sin(a)*len*t;const lG=new THREE.CircleGeometry(0.08+Math.random()*0.03,8);const l=new THREE.Mesh(lG,lm);l.rotation.x=-Math.PI/2+(Math.random()-0.5)*0.3;l.position.set(lx,0.07,lz);g.add(l);if(Math.random()>0.55){const fG=new THREE.CircleGeometry(0.045,6);const f=new THREE.Mesh(fG,fm);f.rotation.x=-Math.PI/2;f.position.set(lx,0.1,lz);g.add(f);}}}
}

function buildDetailAloe(g, lm, sm) {
  const fm=new THREE.MeshLambertMaterial({color:0xff7c3a});
  for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2;const outer=i<7;const len=outer?0.75:0.5;const w=outer?0.14:0.1;const pts=[new THREE.Vector2(0,0),new THREE.Vector2(w,0.1),new THREE.Vector2(w*0.9,len*0.5),new THREE.Vector2(w*0.35,len),new THREE.Vector2(0,len*1.02)];const sh=new THREE.Shape(pts);const eG=new THREE.ExtrudeGeometry(sh,{depth:0.07,bevelEnabled:false});const l=new THREE.Mesh(eG,lm);l.position.set(Math.cos(a)*0.06,0.06,Math.sin(a)*0.06);l.rotation.y=-a+Math.PI/2;l.rotation.z=(outer?0.45:0.25)*Math.sign(Math.cos(a));l.rotation.x=outer?-0.28:-0.18;g.add(l);}
  const spkG=new THREE.CylinderGeometry(0.018,0.025,1.1,5);g.add(Object.assign(new THREE.Mesh(spkG,new THREE.MeshLambertMaterial({color:0x6ab04c})),{position:{x:0,y:0.75,z:0}}));
  for(let i=0;i<10;i++){const fG=new THREE.CylinderGeometry(0.022,0.028,0.12,5);const f=new THREE.Mesh(fG,fm);f.position.set((Math.random()-0.5)*0.09,1.05+i*0.06-0.28,(Math.random()-0.5)*0.09);g.add(f);}
}

function buildDetailGiloy(g, lm, sm) {
  const wm=new THREE.MeshLambertMaterial({color:0x7a6040});
  const stG=new THREE.CylinderGeometry(0.03,0.04,1.6,6);g.add(Object.assign(new THREE.Mesh(stG,wm),{position:{x:0,y:0.8,z:0}}));
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0.2,0.45,0.12),new THREE.Vector3(-0.15,0.9,0.18),new THREE.Vector3(0.15,1.35,-0.12),new THREE.Vector3(-0.1,1.6,0.1)]);
  const tG=new THREE.TubeGeometry(curve,35,0.014,6,false);g.add(new THREE.Mesh(tG,sm));
  for(let i=0;i<10;i++){const t=i/10;const pos=curve.getPoint(t);const l=makeHeartLeafShape(lm);l.position.copy(pos);l.position.x+=(Math.random()-0.5)*0.3;l.position.z+=(Math.random()-0.5)*0.3;l.rotation.y=Math.random()*Math.PI*2;l.rotation.x=(Math.random()-0.5)*0.6;l.scale.setScalar(0.9+Math.random()*0.7);g.add(l);}
}

function buildDetailAmla(g, lm, sm) {
  const fm=new THREE.MeshLambertMaterial({color:0x8db870});
  const tG=new THREE.CylinderGeometry(0.07,0.12,1.9,8);g.add(Object.assign(new THREE.Mesh(tG,sm),{position:{x:0,y:0.95,z:0}}));
  for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;const bG=new THREE.CylinderGeometry(0.018,0.035,0.7,5);const br=new THREE.Mesh(bG,sm);br.position.set(Math.cos(a)*0.18,1.7+Math.random()*0.3,Math.sin(a)*0.18);br.rotation.z=Math.cos(a)*0.75;br.rotation.x=Math.sin(a)*0.75;g.add(br);
  for(let j=0;j<16;j++){const la=Math.random()*Math.PI*2;const lG=new THREE.PlaneGeometry(0.07,0.028);const l=new THREE.Mesh(lG,lm);l.position.set(Math.cos(a)*(0.18+j*0.035),1.65+j*0.035+Math.random()*0.12,Math.sin(a)*(0.18+j*0.035));l.rotation.y=la;g.add(l);}
  for(let f=0;f<5;f++){const fG=new THREE.SphereGeometry(0.046,7,6);const fr=new THREE.Mesh(fG,fm);fr.position.set(Math.cos(a)*0.4+(Math.random()-0.5)*0.18,1.6+Math.random()*0.45,Math.sin(a)*0.4+(Math.random()-0.5)*0.18);g.add(fr);}}
}

function buildDetailPeppermint(g, lm, sm) {
  const pm=new THREE.MeshLambertMaterial({color:0x9b6cd8});
  for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;const r=0.13;const h=0.75+Math.random()*0.25;const sG=new THREE.BoxGeometry(0.028,h,0.028);const s=new THREE.Mesh(sG,sm);s.position.set(Math.cos(a)*r,h/2,Math.sin(a)*r);g.add(s);
  for(let n=0;n<6;n++){const ny=h*(0.18+n*0.15);for(let sd of[-1,1]){const l=makeLeafShape(lm,0.15,0.09);l.position.set(Math.cos(a)*r+sd*Math.sin(a)*0.14,ny,Math.sin(a)*r+sd*Math.cos(a)*0.14);l.rotation.y=a+sd*Math.PI/2;l.rotation.z=sd*0.3;g.add(l);}}
  for(let w=0;w<4;w++){for(let j=0;j<7;j++){const fa=(j/7)*Math.PI*2;const fG=new THREE.SphereGeometry(0.02,5,4);const f=new THREE.Mesh(fG,pm);f.position.set(Math.cos(a)*r+Math.cos(fa)*0.055,h-0.04+w*0.065,Math.sin(a)*r+Math.sin(fa)*0.055);g.add(f);}}}
}

function buildDetailCalendula(g, lm, sm) {
  const pm=new THREE.MeshLambertMaterial({color:0xff7c10,side:THREE.DoubleSide});
  const cm=new THREE.MeshLambertMaterial({color:0xe65010});
  for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2;const r=0.15;const h=0.7+Math.random()*0.28;const sG=new THREE.CylinderGeometry(0.018,0.025,h,5);const s=new THREE.Mesh(sG,sm);s.position.set(Math.cos(a)*r,h/2,Math.sin(a)*r);s.rotation.z=Math.cos(a)*0.18;g.add(s);
  for(let j=0;j<3;j++){const l=makeLeafShape(lm,0.16,0.07);l.position.set(Math.cos(a)*r+(Math.random()-0.5)*0.1,h*(0.3+j*0.2),Math.sin(a)*r);l.rotation.y=a+(Math.random()-0.5)*0.5;g.add(l);}
  const fx=Math.cos(a)*r,fz=Math.sin(a)*r,fy=h;
  for(let p=0;p<20;p++){const pa=(p/20)*Math.PI*2;const pG=new THREE.PlaneGeometry(0.065,0.2);const petal=new THREE.Mesh(pG,pm);petal.position.set(fx+Math.cos(pa)*0.14,fy,fz+Math.sin(pa)*0.14);petal.rotation.y=-pa;petal.rotation.x=-Math.PI/2+0.22;g.add(petal);}
  const dG=new THREE.CircleGeometry(0.09,12);const d=new THREE.Mesh(dG,cm);d.rotation.x=-Math.PI/2;d.position.set(fx,fy+0.012,fz);g.add(d);}
}

// ── Shape helpers for model builder ──
function makeLeafShape(mat, w, h) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(w/2, 0, w/2, h*0.4, 0, h);
  shape.bezierCurveTo(-w/2, h*0.4, -w/2, 0, 0, 0);
  return new THREE.Mesh(new THREE.ShapeGeometry(shape, 8), mat);
}

function makeLargeLeafShape(mat, w, h) {
  const shape = new THREE.Shape();
  shape.moveTo(0,0);
  shape.bezierCurveTo(w,0,w*1.1,h*0.5,w*0.3,h);
  shape.bezierCurveTo(0,h,-w*0.3,h,-w*0.3,h);
  shape.bezierCurveTo(-w*1.1,h*0.5,-w,0,0,0);
  return new THREE.Mesh(new THREE.ShapeGeometry(shape, 10), mat);
}

function makeHeartLeafShape(mat) {
  const shape = new THREE.Shape();
  const s=0.18;
  shape.moveTo(0,-s);
  shape.bezierCurveTo(-s*2,-s*2,-s*3,s,-s,s*1.5);
  shape.lineTo(0,s*2.5);
  shape.lineTo(s,s*1.5);
  shape.bezierCurveTo(s*3,s,s*2,-s*2,0,-s);
  return new THREE.Mesh(new THREE.ShapeGeometry(shape, 10), mat);
}

function darken(hexColor, factor) {
  const r = ((hexColor >> 16) & 255) * factor;
  const g = ((hexColor >> 8) & 255) * factor;
  const b = (hexColor & 255) * factor;
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
}

// ─────────────────────────────────────────────────────────
// HOTSPOT DOTS
// ─────────────────────────────────────────────────────────
function createHotspots(plantData) {
  const container = document.getElementById('hotspotContainer');
  container.innerHTML = '';
  hotspotsData = [];

  const parts = plantData.parts;

  Object.entries(parts).forEach(([partKey, partData]) => {
    const cfg = HOTSPOT_COLORS[partKey] || { bg: '#444', border: '#888', label: partKey };
    const pos3D = PART_POSITIONS[partKey] || new THREE.Vector3(0, 0.5, 0.2);

    // Create HTML dot
    const dot = document.createElement('button');
    dot.className = 'hotspot';
    dot.style.background = cfg.bg;
    dot.style.borderColor = cfg.border;
    dot.style.color = cfg.border;
    dot.innerHTML = `
      ${partData.icon || '●'}
      <span class="hotspot-label">${cfg.label}</span>
    `;
    dot.addEventListener('click', () => showHotspotPopup(partKey, partData));
    container.appendChild(dot);

    hotspotsData.push({ partKey, pos3D: pos3D.clone(), element: dot });
  });
}

function updateHotspotPositions(canvasW, canvasH) {
  if (!modelGroup || !modelCamera || hotspotsData.length === 0) return;

  const canvas = document.getElementById('modelCanvas');
  const rect = canvas.getBoundingClientRect();

  hotspotsData.forEach(({ pos3D, element }) => {
    // Transform pos3D by modelGroup's current rotation
    const worldPos = pos3D.clone();
    worldPos.applyEuler(modelGroup.rotation);
    worldPos.multiplyScalar(modelGroup.scale.x);
    worldPos.add(modelGroup.position);

    // Project to screen
    const projected = worldPos.clone().project(modelCamera);

    // Convert NDC to pixel coords
    const px = (projected.x * 0.5 + 0.5) * rect.width;
    const py = (-projected.y * 0.5 + 0.5) * rect.height;

    // Only show if in front (z < 1)
    if (projected.z < 1) {
      element.style.left = px + 'px';
      element.style.top  = py + 'px';
      element.style.display = 'flex';
    } else {
      element.style.display = 'none';
    }
  });
}

function showHotspotPopup(partKey, partData) {
  const popup = document.getElementById('hotspotPopup');
  document.getElementById('hotspotIcon').textContent = partData.icon || '🌿';
  document.getElementById('hotspotTitle').textContent = partData.name;

  const content = document.getElementById('hotspotContent');
  content.innerHTML = `
    <p class="hotspot-description">${partData.description}</p>

    <ul class="hotspot-benefits">
      ${partData.benefits.map(b => `<li>${b}</li>`).join('')}
    </ul>

    <div class="hotspot-prep">
      <div class="hotspot-prep-label">🍵 How to Use</div>
      <div class="hotspot-prep-text">${partData.preparation}</div>
    </div>
  `;

  popup.classList.remove('hidden');
}

// ─────────────────────────────────────────────────────────
// TAB CONTENT RENDERING
// ─────────────────────────────────────────────────────────
function renderTab(plantData, tabKey) {
  const content = document.getElementById('tabContent');
  if (!plantData) return;

  switch (tabKey) {
    case 'overview':   content.innerHTML = renderOverview(plantData); break;
    case 'medicinal':  content.innerHTML = renderMedicinal(plantData); break;
    case 'cultivation':content.innerHTML = renderCultivation(plantData); break;
    case 'recipes':    content.innerHTML = renderRecipes(plantData); break;
  }
}

function renderOverview(d) {
  return `
    <div class="tab-section">
      <h4>📖 About</h4>
      <p>${d.description}</p>
    </div>

    <div class="tab-section">
      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">Botanical Name</div>
          <div class="info-value" style="font-style:italic">${d.botanicalName}</div>
        </div>
        <div class="info-card">
          <div class="info-label">AYUSH System</div>
          <div class="info-value">${d.ayushSystem.join(', ')}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Habitat</div>
          <div class="info-value">${d.habitat}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Common Names</div>
          <div class="info-value">${d.commonNames.slice(0,3).join(', ')}</div>
        </div>
      </div>
    </div>

    <div class="tab-section">
      <h4>🌿 Plant Parts</h4>
      <p style="font-size:0.82rem;color:var(--clr-text-dim);margin-bottom:0.75rem">
        Click the glowing dots on the 3D model to explore each plant part in detail.
      </p>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
        ${Object.entries(d.parts).map(([k, v]) =>
          `<span class="use-tag">${v.icon} ${v.name}</span>`
        ).join('')}
      </div>
    </div>
  `;
}

function renderMedicinal(d) {
  const catIcons = {
    immunity: '🛡️', respiratory: '🫁', digestive: '🌿', skincare: '✨',
    mental: '🧠', antiinflammatory: '🔥', hormonal: '⚗️', physical: '💪',
    neuroprotective: '🧬', haircare: '💇', antiaging: '⏳', dental: '🦷',
    antimicrobial: '🔬', womenshealth: '🌸', metabolic: '⚡', pain: '💊'
  };

  return `
    <div class="tab-section">
      <h4>💊 Medicinal Properties</h4>
      <p style="font-size:0.82rem;color:var(--clr-text-dim);margin-bottom:1rem">
        Evidence-based and traditional medicinal uses across AYUSH systems.
      </p>
      ${Object.entries(d.medicinalUses).map(([cat, uses]) => `
        <div class="use-category">
          <h5>${catIcons[cat] || '🌿'} ${cat.charAt(0).toUpperCase() + cat.slice(1).replace(/([A-Z])/g, ' $1')}</h5>
          <div class="use-items">
            ${uses.map(u => `<span class="use-tag">✦ ${u}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderCultivation(d) {
  const items = [
    { icon: '🪨', label: 'Soil Type',     value: d.cultivation.soil },
    { icon: '🌤️', label: 'Climate',       value: d.cultivation.climate },
    { icon: '💧', label: 'Watering',      value: d.cultivation.watering },
    { icon: '📅', label: 'Season',        value: d.cultivation.season },
    { icon: '🌱', label: 'Propagation',   value: d.cultivation.propagation },
    { icon: '📏', label: 'Plant Spacing', value: d.cultivation.spacing || 'As needed' },
  ];

  return `
    <div class="tab-section">
      <h4>🌱 How to Grow ${d.name}</h4>
      <div class="cultivation-grid">
        ${items.map(item => `
          <div class="cultivation-item">
            <div class="c-icon">${item.icon}</div>
            <div class="c-label">${item.label}</div>
            <div class="c-value">${item.value}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderRecipes(d) {
  if (!d.recipes || d.recipes.length === 0) {
    return `<p class="empty-state">No recipes available for this plant yet.</p>`;
  }

  return `
    <div class="tab-section">
      <h4>🍵 Traditional Preparations</h4>
      ${d.recipes.map(r => `
        <div class="recipe-card">
          <h5>${r.name}</h5>
          <div class="recipe-section-label">Ingredients</div>
          <ul class="recipe-ingredients">
            ${r.ingredients.map(i => `<li>${i}</li>`).join('')}
          </ul>
          <div class="recipe-section-label">Method</div>
          <p class="recipe-method">${r.method}</p>
          <div class="recipe-benefit">✦ ${r.benefits}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─────────────────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────────────────
function toggleBookmark(state) {
  const plant = state.activePlant;
  if (!plant) return;

  const idx = state.bookmarks.indexOf(plant.id);
  if (idx === -1) {
    state.bookmarks.push(plant.id);
    showToast(`❤️ ${plant.name} bookmarked!`);
  } else {
    state.bookmarks.splice(idx, 1);
    showToast(`💔 ${plant.name} removed from bookmarks`);
  }
  localStorage.setItem('ayush_bookmarks', JSON.stringify(state.bookmarks));
  updateBookmarkBtn(state, plant);

  // Refresh bookmarks panel if open
  window.dispatchEvent(new CustomEvent('refreshBookmarks'));
}

function updateBookmarkBtn(state, plant) {
  const btn  = document.getElementById('bookmarkBtn');
  const icon = document.getElementById('bookmarkIcon');
  if (state.bookmarks.includes(plant.id)) {
    icon.textContent = '❤️';
    btn.classList.add('active');
  } else {
    icon.textContent = '🤍';
    btn.classList.remove('active');
  }
}

// ─────────────────────────────────────────────────────────
// SHARE
// ─────────────────────────────────────────────────────────
function shareCurrentPlant(state) {
  const plant = state.activePlant;
  if (!plant) return;

  const text = `🌿 Exploring ${plant.name} (${plant.botanicalName}) in the AYUSH Virtual Herbal Garden!\n\n${plant.description.slice(0, 120)}…\n\n#AYUSH #HerbalMedicine #VirtualGarden`;

  if (navigator.share) {
    navigator.share({ title: `AYUSH Garden — ${plant.name}`, text });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    showToast('📋 Plant info copied to clipboard!');
  }
}

// ─────────────────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────────────────
function openNotes(state) {
  const plant = state.activePlant;
  if (!plant) return;

  document.getElementById('notesPlantName').textContent = plant.name;
  document.getElementById('notesTextarea').value = state.notes[plant.id] || '';
  document.getElementById('notesOverlay').classList.remove('hidden');

  // Store current plant for save
  document.getElementById('notesOverlay').dataset.plantId = plant.id;
}

function saveNotes(state) {
  const plantId = document.getElementById('notesOverlay').dataset.plantId;
  const text    = document.getElementById('notesTextarea').value;
  if (plantId) {
    state.notes[plantId] = text;
    localStorage.setItem('ayush_notes', JSON.stringify(state.notes));
    showToast('📝 Notes saved!');
  }
  closeNotes();
}

function closeNotes() {
  document.getElementById('notesOverlay').classList.add('hidden');
}

// ─────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────
export function showToast(msg, duration = 2500) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => {
    toast.classList.add('exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}
