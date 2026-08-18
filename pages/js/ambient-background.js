/**
 * Vatika - Full-Page Ambient Spore & Botanical Particulate Engine
 * Lightweight canvas particle system creating organic bioluminescent herbal spores
 * and celestial light particles across the entire viewport.
 */

class AmbientBackgroundEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.spores = [];
    this.width = 0;
    this.height = 0;
    this.mouse = { x: -1000, y: -1000, radius: 140 };
    this.time = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.createSpores();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.createSpores();
  }

  createSpores() {
    this.spores = [];
    const count = Math.min(65, Math.floor((this.width * this.height) / 22000));

    for (let i = 0; i < count; i++) {
      this.spores.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.25 - Math.random() * 0.45,
        radius: 1.2 + Math.random() * 2.6,
        baseRadius: 1.2 + Math.random() * 2.6,
        alpha: 0.2 + Math.random() * 0.6,
        baseAlpha: 0.2 + Math.random() * 0.6,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2,
        isGold: Math.random() > 0.45 // 55% gold, 45% jade
      });
    }
  }

  update() {
    this.time += 0.016;

    for (let i = 0; i < this.spores.length; i++) {
      const s = this.spores[i];

      // Natural upward drift and gentle sine wave sway
      s.y += s.vy;
      s.x += s.vx + Math.sin(this.time + s.pulseOffset) * 0.25;

      // Wrap around edges
      if (s.y < -20) {
        s.y = this.height + 20;
        s.x = Math.random() * this.width;
      }
      if (s.x < -20) s.x = this.width + 20;
      if (s.x > this.width + 20) s.x = -20;

      // Mouse proximity interaction (gently repels / illuminates spores)
      const dx = this.mouse.x - s.x;
      const dy = this.mouse.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.mouse.radius) {
        const force = (1 - dist / this.mouse.radius) * 1.5;
        s.x -= (dx / dist) * force;
        s.y -= (dy / dist) * force;
        s.alpha = Math.min(0.95, s.baseAlpha + 0.4);
      } else {
        s.alpha = s.baseAlpha + Math.sin(this.time * s.pulseSpeed * 60 + s.pulseOffset) * 0.15;
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.spores.length; i++) {
      const s = this.spores[i];

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);

      const color = s.isGold
        ? `rgba(247, 215, 116, ${Math.max(0.05, s.alpha)})`
        : `rgba(43, 182, 115, ${Math.max(0.05, s.alpha)})`;

      this.ctx.fillStyle = color;
      this.ctx.shadowColor = s.isGold ? 'rgba(212, 175, 55, 0.8)' : 'rgba(43, 182, 115, 0.8)';
      this.ctx.shadowBlur = s.radius * 3;
      this.ctx.fill();

      // Delicate bright core
      if (s.radius > 2.0) {
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, s.radius * 0.4, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, s.alpha + 0.3)})`;
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.update();
    this.draw();
  }
}

window.AmbientBackgroundEngine = AmbientBackgroundEngine;
export { AmbientBackgroundEngine };
