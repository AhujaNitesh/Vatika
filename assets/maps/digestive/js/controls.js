// ══════════════════════════════════════════════════════════
// js/controls.js — First-Person WASD + PointerLock Controls
// ══════════════════════════════════════════════════════════
import * as THREE from 'three';

const MOVE_SPEED   = 5.0;    // units/sec
const SPRINT_MULT  = 1.8;
const PITCH_LIMIT  = 1.4;    // radians (±~80°)
const PLAYER_RADIUS = 1.0;   // collision sphere radius

// Garden bounds
const BOUNDS = { minX: -20, maxX: 20, minZ: -21, maxZ: 19 };

export function initControls(state) {
  const canvas = document.getElementById('gardenCanvas');

  // ── Key state ──
  document.addEventListener('keydown', e => {
    if (state.panelOpen) return;
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    state.keys.w = true; break;
      case 'KeyS': case 'ArrowDown':  state.keys.s = true; break;
      case 'KeyA': case 'ArrowLeft':  state.keys.a = true; break;
      case 'KeyD': case 'ArrowRight': state.keys.d = true; break;
      case 'ShiftLeft': state.keys.shift = true; break;
      case 'Escape':
        if (state.panelOpen) closePanelFromKey(state);
        break;
    }
  });

  document.addEventListener('keyup', e => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    state.keys.w = false; break;
      case 'KeyS': case 'ArrowDown':  state.keys.s = false; break;
      case 'KeyA': case 'ArrowLeft':  state.keys.a = false; break;
      case 'KeyD': case 'ArrowRight': state.keys.d = false; break;
      case 'ShiftLeft': state.keys.shift = false; break;
    }
  });

  // ── PointerLock ──
  canvas.addEventListener('click', () => {
    if (!state.panelOpen && !state.isLocked) {
      lockPointer(state);
    }
  });

  document.addEventListener('pointerlockchange', () => {
    state.isLocked = (document.pointerLockElement === canvas);
    const crosshair = document.getElementById('crosshair');
    if (state.isLocked) {
      crosshair.classList.add('visible');
    } else {
      crosshair.classList.remove('visible');
    }
  });

  document.addEventListener('pointerlockerror', () => {
    console.warn('PointerLock request failed');
  });

  // ── Mouse look (only when locked) ──
  document.addEventListener('mousemove', e => {
    if (!state.isLocked || state.panelOpen) return;
    const sens = 0.002;
    state.yawObject.rotation.y  -= e.movementX * sens;
    state.camera.rotation.x      = Math.max(
      -PITCH_LIMIT,
      Math.min(PITCH_LIMIT, state.camera.rotation.x - e.movementY * sens)
    );
  });
}

export function lockPointer(state) {
  const canvas = document.getElementById('gardenCanvas');
  canvas.requestPointerLock();
}

export function unlockPointer() {
  if (document.pointerLockElement) document.exitPointerLock();
}

// ── Per-frame movement update ──
export function updateControls(state, delta) {
  if (!state.isLocked || state.panelOpen) return;

  const speed = MOVE_SPEED * (state.keys.shift ? SPRINT_MULT : 1) * delta;

  // Build direction vector in local yaw space
  const dir = new THREE.Vector3();

  if (state.keys.w) dir.z -= 1;
  if (state.keys.s) dir.z += 1;
  if (state.keys.a) dir.x -= 1;
  if (state.keys.d) dir.x += 1;

  if (dir.lengthSq() === 0) return;

  dir.normalize().applyEuler(state.yawObject.rotation).multiplyScalar(speed);
  dir.y = 0; // no vertical movement

  const newX = state.yawObject.position.x + dir.x;
  const newZ = state.yawObject.position.z + dir.z;

  // Boundary collision
  const clampedX = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, newX));
  const clampedZ = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, newZ));

  // Plant collision detection
  const newPos = new THREE.Vector3(clampedX, state.yawObject.position.y, clampedZ);
  if (!checkPlantCollision(state, newPos)) {
    state.yawObject.position.x = clampedX;
    state.yawObject.position.z = clampedZ;
  } else {
    // Try sliding: X only
    const slideX = new THREE.Vector3(clampedX, state.yawObject.position.y, state.yawObject.position.z);
    if (!checkPlantCollision(state, slideX)) {
      state.yawObject.position.x = clampedX;
    }
    // Try sliding: Z only
    const slideZ = new THREE.Vector3(state.yawObject.position.x, state.yawObject.position.y, clampedZ);
    if (!checkPlantCollision(state, slideZ)) {
      state.yawObject.position.z = clampedZ;
    }
  }
}

function checkPlantCollision(state, newPos) {
  for (const { bbox } of state.plants) {
    // Expand bbox slightly for buffer
    const expanded = bbox.clone().expandByScalar(0.2);
    if (expanded.containsPoint(newPos)) {
      return true; // collision
    }
  }
  return false;
}

function closePanelFromKey(state) {
  // Emit a custom event that plantPanel.js can listen to
  window.dispatchEvent(new CustomEvent('closePlantPanel'));
}
