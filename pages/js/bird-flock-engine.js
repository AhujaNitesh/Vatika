/**
 * Vatika - Aerodynamic Black Bird Flight & Wingtip Trail Simulation Engine
 * Simulates silhouetted birds with dynamic articulated black wings flying in
 * natural varied directions, soaring, banking, and leaving fluid aerodynamic trails.
 */

class BirdFlightEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.birds = [];
    this.trails = [];
    this.width = 0;
    this.height = 0;
    this.mouse = { x: -1000, y: -1000, isNear: false };
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

    // Spawn flock of birds with varied directions and altitudes
    this.spawnBirds(14);

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  spawnBirds(count) {
    this.birds = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.2 + Math.random() * 2.8;

      this.birds.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        targetAngle: angle,
        currentAngle: angle,
        speed: speed,
        size: 14 + Math.random() * 16,
        wingSpan: 24 + Math.random() * 22,
        wingPhase: Math.random() * Math.PI * 2,
        flapSpeed: 0.12 + Math.random() * 0.08,
        gliding: false,
        glideTimer: Math.random() * 120,
        trailHistory: []
      });
    }
  }

  update() {
    this.time += 0.016;

    this.birds.forEach(b => {
      // 1. Flight Dynamics & Direction Variation
      if (Math.random() < 0.015) {
        b.targetAngle += (Math.random() - 0.5) * 1.4;
      }

      // 2. Mouse avoidance (gently bank away)
      const dx = b.x - this.mouse.x;
      const dy = b.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180 && dist > 1) {
        const avoidAngle = Math.atan2(dy, dx);
        b.targetAngle = avoidAngle;
        b.speed = Math.min(6.5, b.speed + 0.15);
      } else {
        b.speed = Math.max(2.2, b.speed - 0.02);
      }

      // Smooth angle interpolation (banking)
      let diff = b.targetAngle - b.currentAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      b.currentAngle += diff * 0.04;

      b.vx = Math.cos(b.currentAngle) * b.speed;
      b.vy = Math.sin(b.currentAngle) * b.speed;

      b.x += b.vx;
      b.y += b.vy;

      // Wrap around screen edges
      const margin = 80;
      if (b.x < -margin) b.x = this.width + margin;
      if (b.x > this.width + margin) b.x = -margin;
      if (b.y < -margin) b.y = this.height + margin;
      if (b.y > this.height + margin) b.y = -margin;

      // 3. Wing Flapping vs Gliding Cycle
      b.glideTimer--;
      if (b.glideTimer <= 0) {
        b.gliding = !b.gliding;
        b.glideTimer = b.gliding ? 40 + Math.random() * 80 : 60 + Math.random() * 120;
      }

      if (!b.gliding) {
        b.wingPhase += b.flapSpeed;
      }

      const wingYOffset = Math.sin(b.wingPhase);

      // 4. Calculate Wingtip positions for aerodynamic trails
      const perpAngle = b.currentAngle + Math.PI / 2;
      const wingExtent = b.wingSpan * 0.85;

      const tip1X = b.x + Math.cos(perpAngle) * wingExtent;
      const tip1Y = b.y + Math.sin(perpAngle) * wingExtent + wingYOffset * 4;

      const tip2X = b.x - Math.cos(perpAngle) * wingExtent;
      const tip2Y = b.y - Math.sin(perpAngle) * wingExtent + wingYOffset * 4;

      // Save wingtip trail points
      b.trailHistory.unshift({
        tip1X, tip1Y, tip2X, tip2Y,
        bodyX: b.x, bodyY: b.y,
        alpha: 0.55
      });

      if (b.trailHistory.length > 24) {
        b.trailHistory.pop();
      }

      // Also emit faint smoke puff particles
      if (Math.random() > 0.4) {
        this.trails.push({
          x: (tip1X + tip2X) / 2,
          y: (tip1Y + tip2Y) / 2,
          vx: -b.vx * 0.15 + (Math.random() - 0.5) * 0.2,
          vy: -b.vy * 0.15 + (Math.random() - 0.5) * 0.2,
          radius: 2.5 + Math.random() * 3.5,
          alpha: 0.35,
          decay: 0.015 + Math.random() * 0.01
        });
      }
    });

    // 5. Update Smoke Trails
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const t = this.trails[i];
      t.x += t.vx;
      t.y += t.vy;
      t.radius += 0.2;
      t.alpha -= t.decay;

      if (t.alpha <= 0.01) {
        this.trails.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Smoke Puff Trails
    this.trails.forEach(t => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(18, 30, 24, ${t.alpha * 0.6})`;
      this.ctx.fill();
      this.ctx.restore();
    });

    // 2. Draw Aerodynamic Wingtip Ribbon Trails
    this.birds.forEach(b => {
      if (b.trailHistory.length > 2) {
        // Left Wingtip Trail
        this.ctx.save();
        this.ctx.beginPath();
        for (let i = 0; i < b.trailHistory.length - 1; i++) {
          const pt = b.trailHistory[i];
          const fade = (1 - i / b.trailHistory.length) * 0.4;
          if (i === 0) this.ctx.moveTo(pt.tip1X, pt.tip1Y);
          else this.ctx.lineTo(pt.tip1X, pt.tip1Y);
        }
        this.ctx.strokeStyle = 'rgba(15, 25, 20, 0.35)';
        this.ctx.lineWidth = 1.8;
        this.ctx.stroke();

        // Right Wingtip Trail
        this.ctx.beginPath();
        for (let i = 0; i < b.trailHistory.length - 1; i++) {
          const pt = b.trailHistory[i];
          if (i === 0) this.ctx.moveTo(pt.tip2X, pt.tip2Y);
          else this.ctx.lineTo(pt.tip2X, pt.tip2Y);
        }
        this.ctx.strokeStyle = 'rgba(15, 25, 20, 0.35)';
        this.ctx.lineWidth = 1.8;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // 3. Draw Black Wing-like Bird Silhouette Structure
      this.ctx.save();
      this.ctx.translate(b.x, b.y);
      this.ctx.rotate(b.currentAngle);

      const wingY = Math.sin(b.wingPhase) * 9;
      const wingSpan = b.wingSpan;
      const bodyLen = b.size;

      // Pure sleek black color with sharp avian silhouette
      this.ctx.fillStyle = '#060a08';
      this.ctx.strokeStyle = '#060a08';
      this.ctx.lineWidth = 2.5;

      // Central Torso
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, bodyLen * 0.6, bodyLen * 0.16, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Left Wing (Articulated curved black wing blade)
      this.ctx.beginPath();
      this.ctx.moveTo(bodyLen * 0.2, 0);
      this.ctx.quadraticCurveTo(
        -bodyLen * 0.1,
        -wingSpan * 0.6 + wingY * 0.5,
        -bodyLen * 0.3,
        -wingSpan + wingY
      );
      this.ctx.quadraticCurveTo(
        -bodyLen * 0.4,
        -wingSpan * 0.5 + wingY * 0.4,
        -bodyLen * 0.3,
        0
      );
      this.ctx.closePath();
      this.ctx.fill();

      // Right Wing (Articulated curved black wing blade)
      this.ctx.beginPath();
      this.ctx.moveTo(bodyLen * 0.2, 0);
      this.ctx.quadraticCurveTo(
        -bodyLen * 0.1,
        wingSpan * 0.6 - wingY * 0.5,
        -bodyLen * 0.3,
        wingSpan - wingY
      );
      this.ctx.quadraticCurveTo(
        -bodyLen * 0.4,
        wingSpan * 0.5 - wingY * 0.4,
        -bodyLen * 0.3,
        0
      );
      this.ctx.closePath();
      this.ctx.fill();

      // Tail Feathers
      this.ctx.beginPath();
      this.ctx.moveTo(-bodyLen * 0.4, 0);
      this.ctx.lineTo(-bodyLen * 0.75, -bodyLen * 0.2);
      this.ctx.lineTo(-bodyLen * 0.65, 0);
      this.ctx.lineTo(-bodyLen * 0.75, bodyLen * 0.2);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.update();
    this.draw();
  }
}

window.BirdFlightEngine = BirdFlightEngine;
export { BirdFlightEngine };
