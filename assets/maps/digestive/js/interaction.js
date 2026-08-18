// ══════════════════════════════════════════════════════════
// js/interaction.js — Raycasting: hover tooltip & click-to-open
// ══════════════════════════════════════════════════════════
import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0); // screen center for crosshair

let clickTimeout = null;

export function initInteraction(state) {
  // Click to open plant panel
  document.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (state.panelOpen) return;
    if (!state.isLocked) return;

    // Small delay to distinguish click from drag
    clickTimeout = setTimeout(() => {
      if (state.hoveredPlant) {
        openPlantPanel(state, state.hoveredPlant);
      }
    }, 80);
  });

  document.addEventListener('mouseup', () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }
  });
}

export function updateInteraction(state) {
  if (state.panelOpen || !state.isLocked) return;

  // Cast ray from center of screen
  raycaster.setFromCamera(CENTER, state.camera);

  // Get all plant meshes for intersection test
  const meshes = [];
  state.plants.forEach(p => {
    p.mesh.traverse(child => {
      if (child.isMesh && !child.userData.isNamePlate && !child.userData.isMarker) {
        meshes.push(child);
      }
    });
  });

  const hits = raycaster.intersectObjects(meshes, false);

  const crosshair = document.getElementById('crosshair');
  const tooltip   = document.getElementById('plantTooltip');

  if (hits.length > 0) {
    const hit = hits[0];
    const plantId = hit.object.userData.plantId;
    const plant   = state.plants.find(p => p.data.id === plantId);

    if (plant && hit.distance < 8) {
      // Show tooltip
      state.hoveredPlant = plant.data;

      document.getElementById('tooltipName').textContent = plant.data.name;
      document.getElementById('tooltipSub').textContent  = plant.data.botanicalName;
      tooltip.classList.remove('hidden');
      crosshair.classList.add('on-plant');
    } else {
      clearHover(state, tooltip, crosshair);
    }
  } else {
    clearHover(state, tooltip, crosshair);
  }
}

function clearHover(state, tooltip, crosshair) {
  state.hoveredPlant = null;
  tooltip.classList.add('hidden');
  crosshair.classList.remove('on-plant');
}

function openPlantPanel(state, plantData) {
  state.activePlant = plantData;
  window.dispatchEvent(new CustomEvent('openPlantPanel', { detail: plantData }));
}
