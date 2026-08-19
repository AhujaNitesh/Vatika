// ══════════════════════════════════════════════════════════
// js/main.js — Application Entry Point & Animation Loop
// ══════════════════════════════════════════════════════════
import * as THREE from 'three';
import { initGarden } from './garden.js';
import { createPlantMeshes } from './plants.js';
import { initControls, updateControls, lockPointer } from './controls.js';
import { initInteraction, updateInteraction } from './interaction.js';
import { initUI, updateMinimap } from './ui.js';
import { initPlantPanel } from './plantPanel.js';

// ── Global Application State ──
export const state = {
  scene: null,
  camera: null,
  renderer: null,
  clock: null,
  plants: [],           // [{ mesh: THREE.Group, data: plantData, bbox: THREE.Box3 }]
  isLocked: false,      // PointerLock active
  activePlant: null,    // Currently opened plant data
  hoveredPlant: null,   // Plant under crosshair
  panelOpen: false,
  allPlants: [],        // Raw JSON data
  bookmarks: JSON.parse(localStorage.getItem('ayush_bookmarks') || '[]'),
  notes: JSON.parse(localStorage.getItem('ayush_notes') || '{}'),
  tourActive: false,
  tourQueue: [],
  tourIndex: 0,
  keys: { w: false, a: false, s: false, d: false },
  mouseButton: { left: false },
  yawObject: null,      // Parent of camera for FPS control
};

async function init() {
  // ── Loading screen ──
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loadingScreen';
  loadingDiv.innerHTML = `
    <div class="loading-spinner"></div>
    <p class="loading-text">Growing your garden… 🌱</p>
  `;
  document.body.appendChild(loadingDiv);

  // ── Scene ──
  state.scene = new THREE.Scene();
  state.scene.fog = new THREE.FogExp2(0x87ceeb, 0.022);
  state.scene.background = new THREE.Color(0x6eb5d4);

  // ── Camera (eye height 1.7m) ──
  state.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 200);
  state.camera.position.set(0, 0, 0);

  // ── Yaw Object (FPS rig: yawObj rotates on Y, camera pitches on X) ──
  state.yawObject = new THREE.Object3D();
  state.yawObject.position.set(0, 1.7, 15);
  state.yawObject.add(state.camera);
  state.scene.add(state.yawObject);

  // ── Renderer ──
  const canvas = document.getElementById('gardenCanvas');
  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  state.renderer.shadowMap.enabled = true;
  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  state.renderer.toneMappingExposure = 0.9;

  // ── Clock ──
  state.clock = new THREE.Clock();

  // ── Load plant data from API ──
  try {
    const apiResp = await fetch('/api/gardens/skincare');
    const apiJson = await apiResp.json();
    if (apiJson && apiJson.data && apiJson.data.length > 0) {
      state.allPlants = apiJson.data.map((p, idx) => ({
        id: (p.common_name || `plant_${p.plant_id}`).toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: p.common_name,
        botanicalName: p.botanical_name,
        sanskritName: p.sanskrit_name || '',
        commonNames: [p.common_name, p.sanskrit_name || ''].filter(Boolean),
        ayushSystem: (p.traditional_systems || []).map(s => s.system_name),
        habitat: p.climate || 'Tropical and Subtropical',
        description: p.overall_traditional_uses || 'Traditional AYUSH medicinal flora.',
        colorHex: ['#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59'][idx % 5],
        position: [
          (idx % 4 - 1.5) * 6,
          0,
          (Math.floor(idx / 4) - 1) * 6
        ]
      }));
    } else {
      throw new Error('No API data returned');
    }
  } catch (err) {
    const resp = await fetch('./data/plants.json');
    const json = await resp.json();
    state.allPlants = json.plants;
  }

  // ── Build the garden environment ──
  initGarden(state);

  // ── Create plant 3D models and place in scene ──
  createPlantMeshes(state, state.allPlants);

  // ── Controls ──
  initControls(state);

  // ── Raycasting / Interaction ──
  initInteraction(state);

  // ── UI (search, bookmarks, tours, minimap) ──
  initUI(state);

  // ── Plant Panel ──
  initPlantPanel(state);

  // ── Start button ──
  document.getElementById('enterBtn').addEventListener('click', () => {
    document.getElementById('startOverlay').style.opacity = '0';
    document.getElementById('startOverlay').style.transition = 'opacity 0.6s';
    setTimeout(() => {
      document.getElementById('startOverlay').classList.add('hidden');
      lockPointer(state);
    }, 600);
  });

  // ── Resize ──
  window.addEventListener('resize', () => {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Remove loading screen ──
  setTimeout(() => {
    loadingDiv.classList.add('hidden');
    setTimeout(() => loadingDiv.remove(), 300);
  }, 600);

  // ── Start loop ──
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = state.clock.getDelta();

  if (!state.panelOpen) {
    updateControls(state, delta);
    updateInteraction(state);
    updateMinimap(state);
  }

  // Subtle plant sway animation
  const t = state.clock.elapsedTime;
  state.plants.forEach(({ mesh }) => {
    if (mesh.userData.swayable) {
      mesh.rotation.z = Math.sin(t * 0.8 + mesh.userData.swayOffset) * 0.018;
      mesh.rotation.x = Math.sin(t * 0.5 + mesh.userData.swayOffset) * 0.008;
    }
  });

  state.renderer.render(state.scene, state.camera);
}

init().catch(console.error);
