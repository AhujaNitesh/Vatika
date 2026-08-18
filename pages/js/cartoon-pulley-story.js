/**
 * Vatika - Cartoon Pulley & Jadibuti Story Animation Engine
 * Story Loop:
 * 1. Cute Herbalist Apprentice pulls heavy pulley rope with basket of Jadibuti.
 * 2. Basket reaches peak, rope slips, basket falls & herbs scatter everywhere with physics!
 * 3. Sweeper sweeps the mess away with cartoon speed lines.
 * 4. Crisp glowing tagline reveals ("Exploring the Living Wonders of Botany...").
 * 5. Loops smoothly with alternating Ayurvedic taglines!
 */

class CartoonPulleyStory {
  constructor(stageContainerId) {
    this.stage = document.getElementById(stageContainerId);
    if (!this.stage) return;

    this.state = 'pulling'; // pulling -> slipping -> scattering -> sweeping -> revealing -> resetting
    this.taglines = [
      "Exploring the Living Wonders of Botany...",
      "Unearthing 5,000 Years of Sacred Jadibuti...",
      "Dissecting Cellular Secrets in 3D Anatomy...",
      "Cultivating Your Personal Herbal Sanctuary..."
    ];
    this.currentTaglineIndex = 0;
    this.pulleyProgress = 0; // 0 to 100
    this.scatteredHerbs = [];
    this.loopTimer = null;
    this.rafId = null;

    this.jadibutiTypes = [
      { name: 'Tulsi Leaf', icon: '🍃', color: '#2bb673', size: 36 },
      { name: 'Golden Turmeric', icon: '🥔', color: '#dfa028', size: 40 },
      { name: 'Sacred Lotus', icon: '🌸', color: '#f093b0', size: 42 },
      { name: 'Ashwagandha Root', icon: '🪵', color: '#8a6235', size: 38 },
      { name: 'Amla Berry', icon: '🟢', color: '#76b852', size: 30 },
      { name: 'Neem Sprig', icon: '🌿', color: '#1b6344', size: 38 },
      { name: 'Ginger Rhizome', icon: '🫚', color: '#c6923e', size: 40 },
      { name: 'Hibiscus Flower', icon: '🌺', color: '#e63946', size: 44 }
    ];

    this.init();
  }

  init() {
    this.buildStageHTML();
    this.cacheDOMElements();
    this.bindEvents();
    this.startStoryLoop();
  }

  buildStageHTML() {
    this.stage.innerHTML = `
      <div class="cartoon-theater">
        <!-- Overhead Wooden Pulley Gantry with Rotating Wheel -->
        <div class="gantry-beam">
          <div class="pulley-wheel-assembly" id="pulley-wheel">
            <div class="pulley-wheel-rim">
              <span class="spoke s1"></span>
              <span class="spoke s2"></span>
              <span class="spoke s3"></span>
            </div>
          </div>
          <!-- Pulley Rope -->
          <svg class="pulley-rope-svg" id="rope-svg" viewBox="0 0 800 500" preserveAspectRatio="none">
            <!-- Left line to character, right line to basket -->
            <path id="rope-path-left" d="M 390,45 L 210,380" stroke="#d4af37" stroke-width="4.5" stroke-linecap="round"/>
            <path id="rope-path-right" d="M 410,45 L 410,360" stroke="#d4af37" stroke-width="4.5" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- The Suspended Jadibuti Basket -->
        <div class="jadibuti-basket" id="jadibuti-basket">
          <div class="basket-ropes">
            <span class="basket-hanger-line"></span>
          </div>
          <div class="basket-container-box">
            <div class="basket-overflow-herbs">
              <span class="herb-item h1">🍃</span>
              <span class="herb-item h2">🥔</span>
              <span class="herb-item h3">🌸</span>
              <span class="herb-item h4">🪵</span>
              <span class="herb-item h5">🟢</span>
              <span class="herb-item h6">🌿</span>
            </div>
            <div class="woven-basket-body">
              <div class="basket-weave-pattern"></div>
              <span class="basket-label">जड़ी-बूटी</span>
            </div>
          </div>
        </div>

        <!-- The Herbalist Apprentice Cartoon Character ("Vati") -->
        <div class="cartoon-character" id="apprentice-character">
          <div class="character-sweat-drops" id="sweat-drops">
            <span class="sweat s1">💧</span>
            <span class="sweat s2">💦</span>
          </div>
          <div class="character-expression-bubble" id="char-bubble">
            <span class="bubble-text" id="bubble-text">Huuufff... 🌿</span>
          </div>

          <!-- Character Vector Body -->
          <div class="char-body-wrap">
            <!-- Head & Bandana -->
            <div class="char-head">
              <div class="char-hair"></div>
              <div class="char-leaf-bandana">
                <span class="bandana-leaf">🌱</span>
              </div>
              <div class="char-face">
                <div class="char-eyes" id="char-eyes">
                  <span class="eye eye-l"><span class="pupil"></span></span>
                  <span class="eye eye-r"><span class="pupil"></span></span>
                </div>
                <div class="char-mouth" id="char-mouth"></div>
                <div class="char-blush blush-l"></div>
                <div class="char-blush blush-r"></div>
              </div>
            </div>

            <!-- Torso & Ayurvedic Tunic -->
            <div class="char-torso">
              <div class="char-robe"></div>
              <!-- Arms pulling rope -->
              <div class="char-arm arm-left" id="arm-left">
                <div class="char-hand"></div>
              </div>
              <div class="char-arm arm-right" id="arm-right">
                <div class="char-hand"></div>
              </div>
            </div>

            <!-- Legs & Wooden Clogs -->
            <div class="char-legs">
              <div class="leg leg-l"></div>
              <div class="leg leg-r"></div>
            </div>
          </div>
        </div>

        <!-- Scattered Falling Herbs Layer (Populated during crash) -->
        <div class="scattered-herbs-field" id="herbs-field"></div>

        <!-- Cartoon Sweeper Character ("Broom Sweeper") -->
        <div class="cartoon-sweeper" id="cartoon-sweeper">
          <div class="sweeper-speech">Clean sweep! 🧹✨</div>
          <div class="sweeper-figure">
            <div class="sweeper-cap">🍃</div>
            <div class="sweeper-body">
              <div class="broom-tool">
                <div class="broom-handle"></div>
                <div class="broom-bristles"></div>
                <div class="dust-swirls">💨✨</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Glowing Central Tagline Reveal Stage -->
        <div class="center-reveal-stage" id="reveal-stage">
          <div class="sparkle-cluster">✦ ✧ ✦</div>
          <h2 class="reveal-tagline-text" id="reveal-tagline">Exploring the Living Wonders of Botany...</h2>
          <div class="reveal-sub-hint">🌿 Sacred Wisdom • 3D Anatomy • Living Specimens</div>
        </div>

        <!-- Interactive Story Controller -->
        <div class="story-controls-dock">
          <button class="btn-story-action" id="btn-trigger-slip">💥 Drop Basket Now!</button>
          <button class="btn-story-action" id="btn-restart-story">🔄 Replay Story</button>
        </div>
      </div>
    `;
  }

  cacheDOMElements() {
    this.wheel = document.getElementById('pulley-wheel');
    this.basket = document.getElementById('jadibuti-basket');
    this.ropeLeft = document.getElementById('rope-path-left');
    this.ropeRight = document.getElementById('rope-path-right');
    this.char = document.getElementById('apprentice-character');
    this.charBubble = document.getElementById('char-bubble');
    this.bubbleText = document.getElementById('bubble-text');
    this.charEyes = document.getElementById('char-eyes');
    this.charMouth = document.getElementById('char-mouth');
    this.sweat = document.getElementById('sweat-drops');
    this.herbsField = document.getElementById('herbs-field');
    this.sweeper = document.getElementById('cartoon-sweeper');
    this.revealStage = document.getElementById('reveal-stage');
    this.revealTagline = document.getElementById('reveal-tagline');
    this.btnDrop = document.getElementById('btn-trigger-slip');
    this.btnReplay = document.getElementById('btn-restart-story');
  }

  bindEvents() {
    if (this.btnDrop) {
      this.btnDrop.addEventListener('click', () => {
        if (this.state === 'pulling') {
          this.triggerBasketSlip();
        }
      });
    }

    if (this.btnReplay) {
      this.btnReplay.addEventListener('click', () => {
        this.resetStory();
      });
    }

    // Click character to make him pull harder
    if (this.char) {
      this.char.addEventListener('click', () => {
        if (this.state === 'pulling') {
          this.pulleyProgress = Math.min(85, this.pulleyProgress + 25);
          this.bubbleText.textContent = "Heaaave-ho! 💪🌿";
        }
      });
    }
  }

  startStoryLoop() {
    this.state = 'pulling';
    this.pulleyProgress = 0;
    this.revealStage.classList.remove('active');
    this.sweeper.classList.remove('active');
    this.char.classList.remove('shocked', 'fallen');
    this.basket.classList.remove('falling', 'flipped');
    this.herbsField.innerHTML = '';

    // Start pulling animation
    let lastTime = performance.now();

    const loop = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (this.state === 'pulling') {
        this.pulleyProgress += dt * 26; // reaches top in ~3.8s

        // Update wheel rotation
        const rot = (this.pulleyProgress / 100) * 720;
        if (this.wheel) this.wheel.style.transform = `rotate(${rot}deg)`;

        // Update basket height (moves from bottom to top)
        const basketBottom = 80 + (this.pulleyProgress / 100) * 220; // 80px to 300px
        if (this.basket) this.basket.style.bottom = `${basketBottom}px`;

        // Update rope paths
        this.updateRopeGraphics(basketBottom);

        // Character pulling effort
        if (this.pulleyProgress < 35) {
          this.bubbleText.textContent = "Pulling fresh Jadibuti... 🌱";
          this.char.classList.remove('sweating');
        } else if (this.pulleyProgress < 75) {
          this.bubbleText.textContent = "Heaaavy herbs! 💦";
          this.char.classList.add('sweating');
        } else {
          this.bubbleText.textContent = "Almost at the top!! 🌿✨";
        }

        // Trigger slip at apex!
        if (this.pulleyProgress >= 90) {
          this.triggerBasketSlip();
          return;
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  updateRopeGraphics(basketBottom) {
    if (!this.ropeRight) return;
    // Right rope end follows basket hanger
    const targetY = 500 - basketBottom - 60;
    this.ropeRight.setAttribute('d', `M 410,45 L 410,${Math.max(45, targetY)}`);
  }

  triggerBasketSlip() {
    this.state = 'slipping';
    if (this.rafId) cancelAnimationFrame(this.rafId);

    // 1. Character shocked reaction
    this.bubbleText.textContent = "OH NO! ROPE SLIPPED! 😱💥";
    this.char.classList.add('shocked');

    // 2. Basket flips and falls
    this.basket.classList.add('falling', 'flipped');

    // 3. Scatter Jadibuti everywhere across stage
    setTimeout(() => {
      this.explodeJadibuti();
    }, 450);
  }

  explodeJadibuti() {
    this.state = 'scattering';
    this.herbsField.innerHTML = '';

    const herbCount = 28;
    const basketRect = this.basket.getBoundingClientRect();
    const stageRect = this.stage.getBoundingClientRect();

    const originX = basketRect.left - stageRect.left + 50;
    const originY = basketRect.top - stageRect.top + 40;

    for (let i = 0; i < herbCount; i++) {
      const type = this.jadibutiTypes[i % this.jadibutiTypes.length];
      const herbEl = document.createElement('div');
      herbEl.className = 'scattered-herb-particle';
      herbEl.innerHTML = `<span>${type.icon}</span>`;
      herbEl.style.left = `${originX}px`;
      herbEl.style.top = `${originY}px`;
      herbEl.style.fontSize = `${type.size}px`;

      this.herbsField.appendChild(herbEl);

      // Random physics trajectory
      const angle = (Math.random() * Math.PI) - (Math.PI * 0.1); // upwards / sideways arc
      const velocity = 250 + Math.random() * 420;
      const vx = Math.cos(angle) * velocity * (Math.random() > 0.5 ? 1 : -1);
      const vy = -Math.sin(angle) * velocity;
      const targetX = originX + vx * 0.9 + (Math.random() - 0.5) * 100;
      const targetY = stageRect.height - 80 - Math.random() * 60; // floor landing
      const rot = (Math.random() - 0.5) * 720;

      // Animate particle falling to floor
      herbEl.animate([
        { transform: 'translate(0, 0) rotate(0deg) scale(0.6)', opacity: 1 },
        { transform: `translate(${vx * 0.5}px, ${vy * 0.5}px) rotate(${rot * 0.5}deg) scale(1.3)`, offset: 0.4 },
        { transform: `translate(${targetX - originX}px, ${targetY - originY}px) rotate(${rot}deg) scale(1)`, opacity: 1 }
      ], {
        duration: 950 + Math.random() * 300,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        fill: 'forwards'
      });
    }

    // After crash, start Sweeper Scene
    setTimeout(() => {
      this.startSweepingScene();
    }, 1400);
  }

  startSweepingScene() {
    this.state = 'sweeping';
    this.sweeper.classList.add('active');
    this.char.classList.add('fallen');
    this.bubbleText.textContent = "Oops... 🧹😅";

    // Sweep animation across the stage
    this.sweeper.animate([
      { left: '-180px' },
      { left: '110%' }
    ], {
      duration: 2200,
      easing: 'easeInOutQuad',
      fill: 'forwards'
    });

    // Fade out scattered herbs as broom passes
    setTimeout(() => {
      const herbs = document.querySelectorAll('.scattered-herb-particle');
      herbs.forEach((h, idx) => {
        setTimeout(() => {
          h.classList.add('swept-away');
        }, idx * 40);
      });
    }, 600);

    // After sweep, reveal Tagline
    setTimeout(() => {
      this.revealCleanTagline();
    }, 2400);
  }

  revealCleanTagline() {
    this.state = 'revealing';
    this.sweeper.classList.remove('active');
    this.herbsField.innerHTML = '';

    // Set current tagline
    const text = this.taglines[this.currentTaglineIndex];
    this.revealTagline.textContent = text;
    this.revealStage.classList.add('active');

    // Typewriter / Sparkle reveal
    this.currentTaglineIndex = (this.currentTaglineIndex + 1) % this.taglines.length;

    // Hold tagline for 4.5 seconds, then reset and loop!
    this.loopTimer = setTimeout(() => {
      this.resetStory();
    }, 4800);
  }

  resetStory() {
    if (this.loopTimer) clearTimeout(this.loopTimer);
    if (this.rafId) cancelAnimationFrame(this.rafId);

    this.revealStage.classList.remove('active');
    this.sweeper.classList.remove('active');
    this.char.classList.remove('shocked', 'fallen', 'sweating');
    this.basket.classList.remove('falling', 'flipped');

    // Smooth reset
    setTimeout(() => {
      this.startStoryLoop();
    }, 600);
  }
}

window.CartoonPulleyStory = CartoonPulleyStory;
export { CartoonPulleyStory };
