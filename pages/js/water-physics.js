/**
 * Real-Time Natural Botanical Water Droplet, Trail & Ripple Physics Engine
 * Simulates dewdrops with luminous fluid hydrodynamic trails and misty wakes
 * condensing on the floral canopy & rose, falling with gravity, and creating ripples.
 */

class WaterDropletSimulation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.drops = [];
    this.ripples = [];
    this.emitters = [];
    this.mistParticles = [];
    this.mouseTrails = [];
    this.width = 0;
    this.height = 0;
    this.time = 0;
    this.mouse = { x: -100, y: -100, prevX: -100, prevY: -100, isMoving: false };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Setup navbar drip emitter points across screen width
    this.setupEmitters();

    // Mouse interaction with fluid trails
    window.addEventListener('mousemove', (e) => {
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.isMoving = true;

      // Add mouse dewy trail particle
      if (Math.abs(this.mouse.x - this.mouse.prevX) > 4 || Math.abs(this.mouse.y - this.mouse.prevY) > 4) {
        this.mouseTrails.push({
          x: e.clientX,
          y: e.clientY,
          radius: 2 + Math.random() * 3,
          opacity: 0.6,
          life: 1.0,
          decay: 0.025 + Math.random() * 0.02
        });
      }
    });

    window.addEventListener('click', (e) => {
      // Create ripple on click
      this.createRipple(e.clientX, e.clientY, 24, 0.9);
      for (let i = 0; i < 6; i++) {
        this.createSplashParticle(e.clientX, e.clientY);
      }
    });

    // Start loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.setupEmitters();
  }

  setupEmitters() {
    this.emitters = [];
    const emitterCount = Math.max(10, Math.floor(this.width / 120));

    // Floral canopy / Navbar emitters
    for (let i = 0; i < emitterCount; i++) {
      this.emitters.push({
        x: (i + 0.5) * (this.width / emitterCount) + (Math.random() - 0.5) * 35,
        y: 68,
        growProgress: Math.random() * 0.85,
        growSpeed: 0.0035 + Math.random() * 0.0055,
        maxSize: 4.5 + Math.random() * 3.5,
        targetY: this.height * (0.55 + Math.random() * 0.4)
      });
    }
  }

  addCustomEmitter(x, y, targetY) {
    this.emitters.push({
      x: x,
      y: y,
      growProgress: Math.random() * 0.5,
      growSpeed: 0.0045 + Math.random() * 0.006,
      maxSize: 5 + Math.random() * 3,
      targetY: targetY || (y + 260 + Math.random() * 140)
    });
  }

  createDrop(x, y, size, targetY) {
    this.drops.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 0.35,
      vy: 1.0 + Math.random() * 0.6,
      gravity: 0.2 + Math.random() * 0.08,
      size: size,
      length: size * 1.6,
      targetY: targetY,
      opacity: 0.95,
      history: [] // Position history for fluid trail
    });
  }

  createRipple(x, y, maxRadius = 38, maxOpacity = 0.75) {
    this.ripples.push({
      x: x,
      y: y,
      radius: 2,
      maxRadius: maxRadius,
      speed: 0.8 + Math.random() * 0.6,
      opacity: maxOpacity,
      fadeRate: maxOpacity / (maxRadius / 0.8)
    });
  }

  createSplashParticle(x, y) {
    this.drops.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 3.5,
      vy: -(Math.random() * 2.8 + 1.8),
      gravity: 0.24,
      size: 2 + Math.random() * 2,
      length: 2,
      targetY: y + 45,
      opacity: 0.85,
      history: []
    });
  }

  update() {
    this.time += 0.016;

    // 1. Process Emitters (Drops condensing and falling)
    this.emitters.forEach(em => {
      em.growProgress += em.growSpeed;
      if (em.growProgress >= 1.0) {
        // Drop falls!
        this.createDrop(em.x, em.y, em.maxSize, em.targetY);
        em.growProgress = 0;
        em.maxSize = 4.5 + Math.random() * 3.5;
        em.growSpeed = 0.003 + Math.random() * 0.0055;
      }
    });

    // 2. Update Falling Drops and their Liquid Trails
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];

      // Save position to trail history
      d.history.unshift({ x: d.x, y: d.y, size: d.size });
      if (d.history.length > 10) {
        d.history.pop();
      }

      d.vy += d.gravity;
      d.x += d.vx;
      d.y += d.vy;
      d.length = Math.min(d.size * 3.6, d.size + d.vy * 1.8);

      // Emit subtle trailing mist micro-particle
      if (Math.random() > 0.6) {
        this.mistParticles.push({
          x: d.x + (Math.random() - 0.5) * 2,
          y: d.y - d.length * 0.5,
          size: 1 + Math.random() * 1.5,
          opacity: 0.6,
          decay: 0.04
        });
      }

      // Check for impact with water surface or target
      if (d.y >= d.targetY || d.y >= this.height) {
        this.createRipple(d.x, d.targetY || this.height - 10, d.size * 7.5, 0.8);
        for (let s = 0; s < 3; s++) {
          this.createSplashParticle(d.x, d.targetY || this.height - 10);
        }
        this.drops.splice(i, 1);
      }
    }

    // 3. Update Mist Micro-Particles
    for (let i = this.mistParticles.length - 1; i >= 0; i--) {
      const m = this.mistParticles[i];
      m.opacity -= m.decay;
      m.y += 0.2;
      if (m.opacity <= 0.02) {
        this.mistParticles.splice(i, 1);
      }
    }

    // 4. Update Mouse Trails
    for (let i = this.mouseTrails.length - 1; i >= 0; i--) {
      const mt = this.mouseTrails[i];
      mt.opacity -= mt.decay;
      mt.radius += 0.3;
      if (mt.opacity <= 0.02) {
        this.mouseTrails.splice(i, 1);
      }
    }

    // 5. Update Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += r.speed;
      r.opacity -= r.fadeRate;

      if (r.opacity <= 0.01 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Mouse Dewy Wake Trails
    this.mouseTrails.forEach(mt => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(mt.x, mt.y, mt.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(180, 235, 210, ${mt.opacity * 0.4})`;
      this.ctx.fill();
      this.ctx.restore();
    });

    // 2. Draw Mist Wake Particles
    this.mistParticles.forEach(m => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${m.opacity * 0.7})`;
      this.ctx.shadowColor = 'rgba(168, 220, 195, 0.8)';
      this.ctx.shadowBlur = 4;
      this.ctx.fill();
      this.ctx.restore();
    });

    // 3. Draw Condensing Dewdrops on Canopy/Navbar Edge
    this.emitters.forEach(em => {
      const currentSize = em.maxSize * Math.min(1, em.growProgress * 1.25);
      if (currentSize > 0.8) {
        const tearY = em.y + (em.growProgress > 0.55 ? (em.growProgress - 0.55) * 14 : 0);

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(em.x, tearY, currentSize, 0, Math.PI * 2);
        const grad = this.ctx.createRadialGradient(
          em.x - currentSize * 0.3,
          tearY - currentSize * 0.3,
          currentSize * 0.1,
          em.x,
          tearY,
          currentSize
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, 'rgba(195, 240, 220, 0.95)');
        grad.addColorStop(0.75, 'rgba(47, 107, 79, 0.75)');
        grad.addColorStop(1, 'rgba(18, 55, 42, 0.4)');

        this.ctx.fillStyle = grad;
        this.ctx.shadowColor = 'rgba(47, 107, 79, 0.35)';
        this.ctx.shadowBlur = 6;
        this.ctx.fill();

        // Glistening highlight glint
        this.ctx.beginPath();
        this.ctx.arc(em.x - currentSize * 0.35, tearY - currentSize * 0.35, currentSize * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.restore();
      }
    });

    // 4. Draw Falling Drops WITH LUMINOUS FLUID TRAILS
    this.drops.forEach(d => {
      // --- DRAW FLUID HYDRODYNAMIC TRAIL ---
      if (d.history.length > 1) {
        this.ctx.save();
        for (let h = 0; h < d.history.length - 1; h++) {
          const p1 = d.history[h];
          const p2 = d.history[h + 1];
          const trailProgress = h / d.history.length;
          const trailOpacity = (1 - trailProgress) * 0.65;
          const trailWidth = (1 - trailProgress) * (d.size * 0.9);

          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(180, 235, 215, ${trailOpacity})`;
          this.ctx.lineWidth = Math.max(1, trailWidth);
          this.ctx.lineCap = 'round';
          this.ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
          this.ctx.shadowBlur = 4;
          this.ctx.stroke();
        }
        this.ctx.restore();
      }

      // --- DRAW MAIN DROPLET HEAD ---
      this.ctx.save();
      this.ctx.translate(d.x, d.y);

      this.ctx.beginPath();
      this.ctx.moveTo(0, -d.length);
      this.ctx.bezierCurveTo(-d.size, -d.length * 0.3, -d.size * 1.25, d.size * 0.5, 0, d.size);
      this.ctx.bezierCurveTo(d.size * 1.25, d.size * 0.5, d.size, -d.length * 0.3, 0, -d.length);

      const dropGrad = this.ctx.createRadialGradient(-d.size * 0.25, 0, d.size * 0.1, 0, 0, d.size * 1.6);
      dropGrad.addColorStop(0, '#ffffff');
      dropGrad.addColorStop(0.45, 'rgba(180, 235, 210, 0.95)');
      dropGrad.addColorStop(0.85, 'rgba(47, 107, 79, 0.8)');
      dropGrad.addColorStop(1, 'rgba(18, 55, 42, 0.45)');

      this.ctx.fillStyle = dropGrad;
      this.ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      this.ctx.shadowBlur = 6;
      this.ctx.fill();

      // Specular bright glint
      this.ctx.beginPath();
      this.ctx.arc(-d.size * 0.3, 0, d.size * 0.38, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();

      this.ctx.restore();
    });

    // 5. Draw Concentric Liquid Expanding Ripples
    this.ripples.forEach(r => {
      this.ctx.save();
      // Primary outer ripple
      this.ctx.beginPath();
      this.ctx.ellipse(r.x, r.y, r.radius * 1.85, r.radius * 0.68, 0, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(47, 107, 79, ${r.opacity * 0.65})`;
      this.ctx.lineWidth = 2.0;
      this.ctx.shadowColor = '#ffffff';
      this.ctx.shadowBlur = 5;
      this.ctx.stroke();

      // Secondary caustic ripple
      if (r.radius > 6) {
        this.ctx.beginPath();
        this.ctx.ellipse(r.x, r.y, (r.radius - 6) * 1.85, (r.radius - 6) * 0.68, 0, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(201, 162, 39, ${r.opacity * 0.4})`;
        this.ctx.lineWidth = 1.3;
        this.ctx.stroke();
      }
      this.ctx.restore();
    });
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.update();
    this.draw();
  }
}

window.WaterDropletSimulation = WaterDropletSimulation;
export { WaterDropletSimulation };
