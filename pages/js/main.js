/**
 * Vatika (वाटिका) — Main Application Engine
 */

import { PLANTS_DATA, PLANT_PARTS_DETAILS, AYUSH_SYSTEMS_INFO } from './plant-data.js';
import { botanicalAudio } from './audio-synth.js';
import { PlantAnatomy3DViewer } from './three-garden.js';
import { AmbientBackgroundEngine } from './ambient-background.js';

document.addEventListener('DOMContentLoaded', () => {
  let plantViewer3D = null;
  let ambientBg = null;

  // 0. Initialize Full-Page Ambient Spores Background Engine
  const bgCanvas = document.getElementById('ambient-spores-canvas');
  if (bgCanvas) {
    ambientBg = new AmbientBackgroundEngine('ambient-spores-canvas');
  }

  // 1. Initialize Three.js 3D Plant Anatomy Viewer
  const stageContainer = document.getElementById('plant-3d-canvas-container');
  if (stageContainer && window.THREE) {
    plantViewer3D = new PlantAnatomy3DViewer('plant-3d-canvas-container', (selectedPart) => {
      updateAnatomyUI(selectedPart);
    });
  }

  // 2. Render AYUSH Knowledge Cards
  renderAyushCards();

  // Reset theme state to default dark mode
  localStorage.removeItem('vatika-theme');
  document.documentElement.removeAttribute('data-theme');
  document.body.classList.remove('light-mode');

  // 3. Setup Permanent Auto-Playing Ambient Nature Audio
  initPermanentAudio();

  // 4. Setup Plant Detail Dossier Modal
  initPlantDossierModal();

  // 5. Setup Interactive 3D Lighting & Shaders Controls
  initAnatomyLightingControls(plantViewer3D);

  // 6. Attach dossier openers on herbarium plates
  document.querySelectorAll('[data-open-plant]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.getAttribute('data-open-plant');
      openPlantModal(pId);
    });
  });

  // 7. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(5, 18, 11, 0.98)';
        navLinks.style.padding = '1.5rem';
        navLinks.style.borderBottom = '1.5px solid rgba(212, 175, 55, 0.3)';
        navLinks.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
      }
    });
  }
});

/* ==========================================================================
   RENDER AYUSH KNOWLEDGE CARDS
   ========================================================================== */
function renderAyushCards() {
  const container = document.getElementById('ayush-systems-container');
  if (!container) return;

  container.innerHTML = AYUSH_SYSTEMS_INFO.map(sys => `
    <div class="ayush-card ayush-theme-${sys.id}">
      <span class="ayush-card-badge">${sys.origin}</span>
      <h3 class="ayush-card-title">${sys.name}</h3>
      <div class="ayush-card-tagline">${sys.tagline}</div>
      <div class="ayush-card-concept"><strong>Core Principle:</strong> ${sys.coreConcept}</div>
      <p class="ayush-card-desc">${sys.description}</p>
      <div class="ayush-card-texts"><strong>Classical Codices:</strong> ${sys.keyTexts}</div>
    </div>
  `).join('');
}

/* ==========================================================================
   INTERACTIVE 3D ANATOMY LIGHTING & UI
   ========================================================================== */
function initAnatomyLightingControls(viewer) {
  document.querySelectorAll('[data-light]').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('[data-light]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const light = pill.getAttribute('data-light');
      if (viewer) viewer.setLightingMode(light);
    });
  });

  document.querySelectorAll('[data-view]').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('[data-view]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const mode = pill.getAttribute('data-view');
      if (viewer) viewer.setViewMode(mode);
    });
  });

  updateAnatomyUI('leaf');
}

function updateAnatomyUI(partKey) {
  const data = PLANT_PARTS_DETAILS[partKey];
  if (!data) return;

  const titleEl = document.getElementById('anatomy-part-title');
  const shortEl = document.getElementById('anatomy-part-short');
  const scienceEl = document.getElementById('anatomy-part-science');
  const ayushEl = document.getElementById('anatomy-part-ayush');
  const usesEl = document.getElementById('anatomy-part-uses');
  const extractEl = document.getElementById('anatomy-part-extraction');

  if (titleEl) titleEl.innerHTML = `${data.icon} ${data.name}`;
  if (shortEl) shortEl.textContent = data.short;
  if (scienceEl) scienceEl.textContent = data.scienceDescription;
  if (ayushEl) ayushEl.textContent = data.ayushWisdom;

  if (usesEl) {
    usesEl.innerHTML = data.keyMedicinalUses.map(u => `<li>${u}</li>`).join('');
  }
  if (extractEl) {
    extractEl.innerHTML = data.extractionMethods.map(m => `<span class="specimen-pill">${m}</span>`).join(' ');
  }
}

/* ==========================================================================
   PERMANENT AUTO-PLAYING AMBIENT NATURE AUDIO
   ========================================================================== */
function initPermanentAudio() {
  const startAudio = () => {
    if (!botanicalAudio.isPlaying) {
      botanicalAudio.play('morning');
    }
  };

  const events = ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'];
  const triggerHandler = () => {
    startAudio();
    events.forEach(evt => window.removeEventListener(evt, triggerHandler));
  };

  events.forEach(evt => window.addEventListener(evt, triggerHandler, { passive: true }));

  try {
    startAudio();
  } catch (e) {}
}

/* ==========================================================================
   PLANT DETAIL DOSSIER MODAL
   ========================================================================== */
function initPlantDossierModal() {
  const plantModal = document.getElementById('plant-modal-backdrop');

  document.querySelectorAll('.modal-close-btn, .modal-backdrop').forEach(closer => {
    closer.addEventListener('click', (e) => {
      if (e.target === closer || e.target.closest('.modal-close-btn')) {
        plantModal?.classList.remove('open');
      }
    });
  });
}

function openPlantModal(plantId) {
  const plant = PLANTS_DATA.find(p => p.id === plantId);
  if (!plant) return;

  const modal = document.getElementById('plant-modal-backdrop');
  const container = document.getElementById('plant-modal-content');
  if (!modal || !container) return;

  container.innerHTML = `
    <div class="modal-plant-grid">
      <div>
        <img class="modal-plant-img" src="${plant.image}" alt="${plant.name}">
        <div style="margin-top: 1.2rem; background: rgba(9, 30, 20, 0.78); padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.12);">
          <h4 style="font-size: 1.15rem; color: #FFFFFF; margin-bottom: 0.6rem;">Ayurvedic Bio-Energetics</h4>
          <p style="font-size: 0.88rem; margin-bottom: 0.35rem; color: var(--color-text-secondary);"><strong>Rasa (Taste):</strong> ${plant.ayurvedicProfile.rasa}</p>
          <p style="font-size: 0.88rem; margin-bottom: 0.35rem; color: var(--color-text-secondary);"><strong>Virya (Potency):</strong> ${plant.ayurvedicProfile.virya}</p>
          <p style="font-size: 0.88rem; margin-bottom: 0.35rem; color: var(--color-text-secondary);"><strong>Vipaka:</strong> ${plant.ayurvedicProfile.vipaka}</p>
          <p style="font-size: 0.88rem; margin-bottom: 0.35rem; color: var(--color-text-secondary);"><strong>Dosha Karma:</strong> ${plant.ayurvedicProfile.doshaKarma}</p>
        </div>
      </div>
      <div>
        <span class="label-eyebrow" style="margin-bottom: 0.2rem;">${plant.sanskritName}</span>
        <h2 style="font-size: 2.3rem; color: #FFFFFF; margin-bottom: 0.2rem;">${plant.name}</h2>
        <p style="font-style: italic; color: var(--color-sage); font-size: 1.15rem; margin-bottom: 1rem;">${plant.botanicalName}</p>
        <p style="font-size: 0.98rem; line-height: 1.65; color: var(--color-text-secondary); margin-bottom: 1.4rem;">${plant.shortDescription}</p>

        <h4 style="font-size: 1.15rem; color: #FFFFFF; margin-bottom: 0.6rem;">Key Bioactive Constituents</h4>
        <ul style="list-style: none; margin-bottom: 1.4rem;">
          ${plant.chemicalConstituents.map(c => `
            <li style="font-size: 0.9rem; margin-bottom: 0.4rem; padding-left: 1.2rem; position: relative; color: var(--color-text-secondary);">
              <span style="position: absolute; left: 0; color: var(--color-sage);">✦</span>
              <strong style="color: #FFFFFF;">${c.name}:</strong> ${c.role}
            </li>
          `).join('')}
        </ul>

        <h4 style="font-size: 1.15rem; color: #FFFFFF; margin-bottom: 0.6rem;">Classical Formulations</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.4rem;">
          ${plant.traditionalFormulations.map(f => `<span class="specimen-pill">${f}</span>`).join('')}
        </div>

        <div style="background: rgba(9, 30, 20, 0.85); border-left: 3.5px solid var(--color-jade); padding: 0.8rem 1rem; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 0.84rem; color: var(--color-text-secondary);">
          <strong style="color: var(--color-sage);">Educational Safety Note:</strong> ${plant.safetyNote}
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}
