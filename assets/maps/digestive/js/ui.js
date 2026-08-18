// ══════════════════════════════════════════════════════════
// js/ui.js — Search, Bookmarks Panel, Tours Panel, Minimap
// ══════════════════════════════════════════════════════════
import { showToast } from './plantPanel.js';

const TOURS = [
  {
    id: 'immunity',
    name: 'Immunity Boosters',
    icon: '🛡️',
    desc: 'Explore the most powerful plants for building a strong immune system — from Tulsi to Giloy.',
    plants: ['tulsi', 'giloy', 'amla', 'neem'],
  },
  {
    id: 'skincare',
    name: 'Skin & Beauty',
    icon: '✨',
    desc: 'Discover plants used for centuries to achieve glowing, healthy, blemish-free skin.',
    plants: ['neem', 'turmeric', 'aloe', 'calendula'],
  },
  {
    id: 'brain',
    name: 'Mind & Memory',
    icon: '🧠',
    desc: 'Brain-boosting adaptogens that sharpen focus, reduce stress, and improve cognitive performance.',
    plants: ['brahmi', 'ashwagandha', 'peppermint'],
  },
  {
    id: 'digestive',
    name: 'Digestive Health',
    icon: '🌿',
    desc: 'Ancient remedies for gut health, digestion, and detoxification of the digestive system.',
    plants: ['peppermint', 'turmeric', 'aloe', 'giloy'],
  },
  {
    id: 'antiaging',
    name: 'Anti-Aging Rasayana',
    icon: '⏳',
    desc: 'Traditional rasayana herbs for longevity, vitality, and youthful energy.',
    plants: ['amla', 'ashwagandha', 'tulsi', 'brahmi'],
  },
];

let activeTourIndex = 0;
let activeTourData  = null;
let tourPlantQueue  = [];

export function initUI(state) {
  initSearch(state);
  initBookmarksPanel(state);
  initToursPanel(state);
  initTopButtons(state);

  // Listen for bookmark refresh
  window.addEventListener('refreshBookmarks', () => renderBookmarksList(state));
}

// ─────────────────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────────────────
function initSearch(state) {
  const input   = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();

    if (!q) {
      results.classList.add('hidden');
      return;
    }

    const matches = state.allPlants.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.botanicalName.toLowerCase().includes(q) ||
      p.commonNames.some(n => n.toLowerCase().includes(q)) ||
      p.ayushSystem.some(s => s.toLowerCase().includes(q)) ||
      Object.values(p.medicinalUses).some(arr => arr.some(u => u.toLowerCase().includes(q)))
    );

    if (matches.length === 0) {
      results.innerHTML = '<div class="search-result-item" style="opacity:0.5">No plants found</div>';
    } else {
      results.innerHTML = matches.map(p => `
        <div class="search-result-item" data-id="${p.id}">
          <span class="search-result-icon">🌿</span>
          <div>
            <div class="search-result-name">${highlight(p.name, q)}</div>
            <div class="search-result-sub">${p.botanicalName} · ${p.ayushSystem.join(', ')}</div>
          </div>
        </div>
      `).join('');

      // Click result → teleport to plant + open panel
      results.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const plant = state.allPlants.find(p => p.id === item.dataset.id);
          if (plant) {
            // Teleport camera near the plant
            const [px, , pz] = plant.position;
            state.yawObject.position.set(px, 1.7, pz + 3.5);
            // Open panel
            window.dispatchEvent(new CustomEvent('openPlantPanel', { detail: plant }));
            results.classList.add('hidden');
            input.value = '';
          }
        });
      });
    }

    results.classList.remove('hidden');
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!document.getElementById('searchContainer').contains(e.target)) {
      results.classList.add('hidden');
    }
  });

  // Keyboard navigation
  input.addEventListener('keydown', e => {
    if (e.code === 'Escape') {
      input.value = '';
      results.classList.add('hidden');
    }
  });
}

function highlight(text, query) {
  const re = new RegExp(`(${query})`, 'gi');
  return text.replace(re, '<mark style="background:rgba(80,200,100,0.3);color:inherit;border-radius:2px">$1</mark>');
}

// ─────────────────────────────────────────────────────────
// TOP ACTION BUTTONS
// ─────────────────────────────────────────────────────────
function initTopButtons(state) {
  // Bookmarks
  document.getElementById('bookmarksBtn').addEventListener('click', () => {
    const panel = document.getElementById('bookmarksPanel');
    const toursPanel = document.getElementById('toursPanel');
    toursPanel.classList.add('hidden');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      renderBookmarksList(state);
    }
  });

  document.getElementById('closeBookmarksBtn').addEventListener('click', () => {
    document.getElementById('bookmarksPanel').classList.add('hidden');
  });

  // Tours
  document.getElementById('toursBtn').addEventListener('click', () => {
    const panel = document.getElementById('toursPanel');
    const bPanel = document.getElementById('bookmarksPanel');
    bPanel.classList.add('hidden');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      renderToursList(state);
    }
  });

  document.getElementById('closeToursBtn').addEventListener('click', () => {
    document.getElementById('toursPanel').classList.add('hidden');
  });

  // Audio toggle
  let audioEnabled = false;
  const audioBtn = document.getElementById('audioBtn');
  audioBtn.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    audioBtn.textContent = audioEnabled ? '🔊' : '🔈';
    if (audioEnabled) {
      startAmbientAudio();
    } else {
      stopAmbientAudio();
    }
    showToast(audioEnabled ? '🔊 Ambient sounds on' : '🔈 Ambient sounds off');
  });
}

// ─────────────────────────────────────────────────────────
// BOOKMARKS PANEL
// ─────────────────────────────────────────────────────────
function renderBookmarksList(state) {
  const list = document.getElementById('bookmarksList');

  if (state.bookmarks.length === 0) {
    list.innerHTML = '<p class="empty-state">No bookmarks yet.<br>Click ❤️ on any plant to save it.</p>';
    return;
  }

  const bookmarkedPlants = state.allPlants.filter(p => state.bookmarks.includes(p.id));
  list.innerHTML = bookmarkedPlants.map(p => `
    <div class="bookmark-card" data-id="${p.id}">
      <span class="bookmark-card-icon">🌿</span>
      <div>
        <div class="bookmark-card-name">${p.name}</div>
        <div class="bookmark-card-system">${p.botanicalName} · ${p.ayushSystem.join(', ')}</div>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.bookmark-card').forEach(card => {
    card.addEventListener('click', () => {
      const plant = state.allPlants.find(p => p.id === card.dataset.id);
      if (plant) {
        const [px, , pz] = plant.position;
        state.yawObject.position.set(px, 1.7, pz + 3.5);
        window.dispatchEvent(new CustomEvent('openPlantPanel', { detail: plant }));
        document.getElementById('bookmarksPanel').classList.add('hidden');
      }
    });
  });
}

// ─────────────────────────────────────────────────────────
// TOURS PANEL
// ─────────────────────────────────────────────────────────
function renderToursList(state) {
  const list = document.getElementById('toursList');
  list.innerHTML = TOURS.map(tour => {
    const plantNames = tour.plants
      .map(id => state.allPlants.find(p => p.id === id)?.name || id)
      .join(', ');

    return `
      <div class="tour-card" data-tour-id="${tour.id}">
        <div class="tour-icon">${tour.icon}</div>
        <div class="tour-name">${tour.name}</div>
        <div class="tour-desc">${tour.desc}</div>
        <div class="tour-plants">
          ${tour.plants.map(id => {
            const p = state.allPlants.find(pl => pl.id === id);
            return p ? `<span class="tour-plant-chip">🌿 ${p.name}</span>` : '';
          }).join('')}
        </div>
        <button class="tour-start-btn" data-tour-id="${tour.id}">
          🗺️ Start Tour →
        </button>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.tour-start-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const tourId = btn.dataset.tourId;
      startTour(state, tourId);
    });
  });
}

function startTour(state, tourId) {
  const tour = TOURS.find(t => t.id === tourId);
  if (!tour) return;

  document.getElementById('toursPanel').classList.add('hidden');

  activeTourData  = tour;
  activeTourIndex = 0;
  state.tourActive = true;
  tourPlantQueue   = tour.plants;

  // Create tour overlay if not exists
  ensureTourOverlay();
  showTourStep(state);
}

function ensureTourOverlay() {
  if (document.getElementById('tourOverlay')) return;

  const el = document.createElement('div');
  el.id = 'tourOverlay';
  el.innerHTML = `
    <div id="tourProgress">
      <div id="tourTitle"></div>
      <div id="tourStep"></div>
      <div id="tourProgressBar">
        <div id="tourProgressFill" style="width:0%"></div>
      </div>
    </div>
    <button id="tourNextBtn">Next →</button>
    <button id="tourExitBtn">✕ Exit</button>
  `;
  document.body.appendChild(el);

  document.getElementById('tourNextBtn').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('closePlantPanel'));
    setTimeout(() => nextTourStep(window._tourState), 400);
  });

  document.getElementById('tourExitBtn').addEventListener('click', () => {
    endTour(window._tourState);
  });
}

function showTourStep(state) {
  window._tourState = state;

  const plantId = tourPlantQueue[activeTourIndex];
  const plant   = state.allPlants.find(p => p.id === plantId);
  if (!plant) { endTour(state); return; }

  // Update overlay
  document.getElementById('tourOverlay').classList.remove('hidden');
  document.getElementById('tourTitle').textContent = `🗺️ ${activeTourData.name}`;
  document.getElementById('tourStep').textContent  = `Plant ${activeTourIndex + 1} of ${tourPlantQueue.length}: ${plant.name}`;

  const pct = ((activeTourIndex) / tourPlantQueue.length) * 100;
  document.getElementById('tourProgressFill').style.width = pct + '%';

  // Teleport camera to plant
  const [px, , pz] = plant.position;
  state.yawObject.position.set(px, 1.7, pz + 3.5);

  // Look at plant
  const dy = plant.position[1] + 0.8 - state.yawObject.position.y;
  state.camera.rotation.x = Math.atan2(dy, 3.5) * -1;

  // Open plant panel after short delay
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('openPlantPanel', { detail: plant }));
  }, 600);

  // Update next button label
  const isLast = activeTourIndex >= tourPlantQueue.length - 1;
  document.getElementById('tourNextBtn').textContent = isLast ? '✓ Finish' : 'Next →';
}

function nextTourStep(state) {
  activeTourIndex++;
  if (activeTourIndex >= tourPlantQueue.length) {
    endTour(state);
    return;
  }
  showTourStep(state);
}

function endTour(state) {
  state.tourActive = false;
  const overlay = document.getElementById('tourOverlay');
  if (overlay) overlay.classList.add('hidden');
  window.dispatchEvent(new CustomEvent('closePlantPanel'));
  showToast('🗺️ Tour complete! Keep exploring the garden.');
}

// ─────────────────────────────────────────────────────────
// MINIMAP
// ─────────────────────────────────────────────────────────
export function updateMinimap(state) {
  const canvas = document.getElementById('minimapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Garden bounds: -22 to 22 in X, -22 to 20 in Z
  const toMapX = (worldX) => ((worldX + 22) / 44) * W;
  const toMapY = (worldZ) => ((worldZ + 22) / 44) * H;

  // Background
  ctx.fillStyle = 'rgba(8, 20, 10, 0.92)';
  ctx.fillRect(0, 0, W, H);

  // Garden boundary
  ctx.strokeStyle = 'rgba(80, 160, 80, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  // Central path
  ctx.strokeStyle = 'rgba(160, 140, 100, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W/2, toMapY(20));
  ctx.lineTo(W/2, toMapY(-22));
  ctx.stroke();

  // Plant dots
  state.plants.forEach(({ data }) => {
    const [px, , pz] = data.position;
    const mx = toMapX(px);
    const my = toMapY(pz);
    const c  = parseInt(data.colorHex.replace('#',''), 16);
    const r  = ((c >> 16) & 255);
    const g2 = ((c >> 8) & 255);
    const b  = (c & 255);

    // Glow
    const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 6);
    grad.addColorStop(0, `rgba(${r},${g2},${b},0.8)`);
    grad.addColorStop(1, `rgba(${r},${g2},${b},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mx, my, 6, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = `rgb(${r},${g2},${b})`;
    ctx.beginPath();
    ctx.arc(mx, my, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Player position
  const px = toMapX(state.yawObject.position.x);
  const py = toMapY(state.yawObject.position.z);

  // Player glow
  const pGrad = ctx.createRadialGradient(px, py, 0, px, py, 8);
  pGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.arc(px, py, 8, 0, Math.PI * 2);
  ctx.fill();

  // Player arrow (direction indicator)
  const yaw = state.yawObject.rotation.y;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-yaw);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(-3, 4);
  ctx.lineTo(0, 2);
  ctx.lineTo(3, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─────────────────────────────────────────────────────────
// AMBIENT AUDIO (Web Audio API)
// ─────────────────────────────────────────────────────────
let audioCtx = null;
let audioNodes = [];

function startAmbientAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Wind noise
  const windBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
  const data = windBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }

  const windSrc = audioCtx.createBufferSource();
  windSrc.buffer = windBuf;
  windSrc.loop = true;

  const windFilter = audioCtx.createBiquadFilter();
  windFilter.type = 'lowpass';
  windFilter.frequency.value = 400;

  const windGain = audioCtx.createGain();
  windGain.gain.value = 0.04;

  windSrc.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(audioCtx.destination);
  windSrc.start();
  audioNodes.push(windSrc, windFilter, windGain);

  // Bird chirps (random interval)
  scheduleBirdChirp();
}

function scheduleBirdChirp() {
  if (!audioCtx) return;
  const delay = 3000 + Math.random() * 5000;
  setTimeout(() => {
    if (!audioCtx) return;
    playBirdChirp();
    scheduleBirdChirp();
  }, delay);
}

function playBirdChirp() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.setValueAtTime(1800 + Math.random() * 600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2400 + Math.random() * 400, audioCtx.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.28);
}

function stopAmbientAudio() {
  audioNodes.forEach(n => {
    try { n.disconnect(); } catch (e) {}
  });
  audioNodes = [];
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}
