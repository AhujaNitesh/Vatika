/**
 * Vatika - 3D Celestial Ayurvedic Pulley & Jadibuti Apothecary Engine
 * Builds an interactive 3D mechanical pulley apparatus with suspended brass & glass
 * capsules containing living Jadibuti (medicinal herbs), rotating gears, and vapor physics.
 */

class HeroPulleyEngine {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container || !window.THREE) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.gears = [];
    this.pulleyCables = [];
    this.capsules = [];
    this.vaporParticles = null;
    this.armillaryGroup = null;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.raycaster = new THREE.Raycaster();
    this.mouseVec = new THREE.Vector2(-999, -999);
    this.hoveredCapsule = null;
    this.time = 0;

    this.capsuleData = [
      {
        id: 'turmeric',
        title: 'Haridra & Ardraka (हरिद्रा)',
        name: 'Golden Curcumin Rhizome',
        sanskrit: 'दीपन • पाचन • शोथहर',
        compounds: 'Curcuminoids • Gingerol',
        x: -2.8,
        baseY: 0.2,
        color: 0xdeb638,
        herbalMeshType: 'rhizome'
      },
      {
        id: 'lotus_tulsi',
        title: 'Kamala & Tulasi (पद्म • सुरसा)',
        name: 'Sacred Bloom & Adaptogenic Leaf',
        sanskrit: 'हृद्य • ओजस्कर • मेध्य',
        compounds: 'Eugenol • Neferine • Flavonoids',
        x: 0,
        baseY: -0.2,
        color: 0xe88cb5,
        herbalMeshType: 'lotus_bloom'
      },
      {
        id: 'ashwagandha',
        title: 'Ashwagandha & Amalaki (अश्वगंधा)',
        name: 'Vitality Taproot & Vitamin C Drupe',
        sanskrit: 'रसायन • बल्य • शुक्रकर',
        compounds: 'Withanolides • Emblicanin',
        x: 2.8,
        baseY: 0.1,
        color: 0x58b97e,
        herbalMeshType: 'root_bundle'
      }
    ];

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x06140d, 0.08);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0.4, 7.2);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    this.setupLighting();

    // Celestial Background Armillary Rings
    this.buildArmillaryRings();

    // Overhead Brass Gantry & Mechanical Pulley Wheels
    this.buildPulleyGantry();

    // Suspended Jadibuti Terrarium Capsules
    this.buildJadibutiCapsules();

    // Aromatic Herbal Steam / Vapor Physics
    this.buildAromaticVapor();

    // Events
    this.setupEvents();

    // Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xdcf0e4, 0.9);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffae6, 2.2);
    sun.position.set(5, 8, 5);
    sun.castShadow = true;
    this.scene.add(sun);

    const goldPoint = new THREE.PointLight(0xffd700, 3.0, 12);
    goldPoint.position.set(0, 1.5, 2);
    this.scene.add(goldPoint);

    const emeraldPoint = new THREE.PointLight(0x2bb673, 2.5, 14);
    emeraldPoint.position.set(0, -2, 1);
    this.scene.add(emeraldPoint);
  }

  buildArmillaryRings() {
    this.armillaryGroup = new THREE.Group();
    this.armillaryGroup.position.set(0, 0.3, -2.5);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: false
    });

    // Outer Celestial Sphere Rings
    const ringRadii = [3.8, 3.3, 2.8, 2.3];
    ringRadii.forEach((r, i) => {
      const ringGeom = new THREE.TorusGeometry(r, 0.025, 16, 64);
      const ringMesh = new THREE.Mesh(ringGeom, goldMat);
      ringMesh.rotation.x = (i * Math.PI) / 4;
      ringMesh.rotation.y = (i * Math.PI) / 6;
      this.armillaryGroup.add(ringMesh);
    });

    // Center Alchemical Sun Core
    const sunGeom = new THREE.IcosahedronGeometry(0.55, 2);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xaa820a,
      emissiveIntensity: 0.6,
      wireframe: true
    });
    const sunCore = new THREE.Mesh(sunGeom, sunMat);
    this.armillaryGroup.add(sunCore);

    this.scene.add(this.armillaryGroup);
  }

  buildPulleyGantry() {
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc89d28,
      metalness: 0.9,
      roughness: 0.2
    });

    // Overhead Brass Support Truss Beam
    const beamGeom = new THREE.CylinderGeometry(0.08, 0.08, 9.0, 16);
    const mainBeam = new THREE.Mesh(beamGeom, brassMat);
    mainBeam.rotation.z = Math.PI / 2;
    mainBeam.position.set(0, 3.1, 0);
    this.scene.add(mainBeam);

    // Secondary lower guide rail
    const subBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 8.5, 16), brassMat);
    subBeam.rotation.z = Math.PI / 2;
    subBeam.position.set(0, 2.85, 0);
    this.scene.add(subBeam);

    // 3 Main Mechanical Pulley Wheel Assemblies
    const wheelPositions = [-2.8, 0, 2.8];
    wheelPositions.forEach((wx, idx) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(wx, 2.95, 0);

      // Grooved Pulley Sheave Wheel
      const sheaveOuter = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.06, 16, 32), brassMat);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 16), brassMat);
      hub.rotation.x = Math.PI / 2;
      wheelGroup.add(sheaveOuter, hub);

      // 6 Spokes
      for (let s = 0; s < 6; s++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.72, 8), brassMat);
        spoke.rotation.z = (s * Math.PI) / 3;
        wheelGroup.add(spoke);
      }

      // Cogged teeth around wheel
      for (let c = 0; c < 12; c++) {
        const cog = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.08), brassMat);
        const angle = (c / 12) * Math.PI * 2;
        cog.position.set(Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, 0);
        cog.rotation.z = angle;
        wheelGroup.add(cog);
      }

      this.scene.add(wheelGroup);
      this.gears.push({ group: wheelGroup, speed: idx % 2 === 0 ? 0.015 : -0.015 });
    });
  }

  buildJadibutiCapsules() {
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.05,
      transmission: 0.9,
      ior: 1.5,
      thickness: 0.5
    });

    this.capsuleData.forEach((data, index) => {
      const capsuleGroup = new THREE.Group();
      capsuleGroup.position.set(data.x, data.baseY, 0);
      capsuleGroup.userData = {
        dataIndex: index,
        baseY: data.baseY,
        baseX: data.x,
        angle: 0,
        isLifted: false
      };

      // 1. Suspension Cable / Chain (Three.js Line)
      const cableGeom = new THREE.BufferGeometry();
      const cablePoints = [new THREE.Vector3(0, 3.0 - data.baseY, 0), new THREE.Vector3(0, 0.95, 0)];
      cableGeom.setFromPoints(cablePoints);
      const cable = new THREE.Line(
        cableGeom,
        new THREE.LineBasicMaterial({ color: 0xd4af37, linewidth: 2 })
      );
      capsuleGroup.add(cable);

      // 2. Ornate Brass Suspension Cap & Pulley Hook
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.4, 16), brassMat);
      cap.position.y = 0.85;
      const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), brassMat);
      capRing.position.y = 1.05;
      capsuleGroup.add(cap, capRing);

      // 3. Transparent Spherical / Oval Glass Alembic Vessel
      const glassSphere = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), glassMat);
      glassSphere.position.y = 0;
      capsuleGroup.add(glassSphere);

      // 4. Brass Equatorial Girdle & Base Cage
      const girdle = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.035, 16, 32), brassMat);
      capsuleGroup.add(girdle);

      const cageRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.025, 16, 32), brassMat);
      cageRing1.rotation.y = Math.PI / 3;
      const cageRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.025, 16, 32), brassMat);
      cageRing2.rotation.y = -Math.PI / 3;
      capsuleGroup.add(cageRing1, cageRing2);

      const baseCup = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.25, 0.25, 16), brassMat);
      baseCup.position.y = -0.85;
      capsuleGroup.add(baseCup);

      // 5. INSIDE JADIBUTI SPECIMEN MESH (The Living Herb / Root / Blossom)
      const herbGroup = new THREE.Group();
      if (data.herbalMeshType === 'rhizome') {
        // Golden Turmeric / Ginger Rhizome Model
        const rhizomeMat = new THREE.MeshStandardMaterial({ color: 0xdfa028, roughness: 0.6 });
        for (let r = 0; r < 5; r++) {
          const rCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.3 + r * 0.15, -0.4, 0),
            new THREE.Vector3(0, -0.1 + r * 0.1, (r - 2) * 0.1),
            new THREE.Vector3(0.3 - r * 0.1, 0.3, 0)
          ]);
          const rMesh = new THREE.Mesh(new THREE.TubeGeometry(rCurve, 16, 0.08, 8, false), rhizomeMat);
          herbGroup.add(rMesh);
        }
      } else if (data.herbalMeshType === 'lotus_bloom') {
        // Sacred Pink Lotus & Fresh Tulsi Sprout
        const petalMat = new THREE.MeshStandardMaterial({ color: 0xe88cb5, roughness: 0.3, side: THREE.DoubleSide });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x2bb673, roughness: 0.4 });
        for (let p = 0; p < 12; p++) {
          const petal = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), petalMat);
          petal.scale.set(1.4, 0.4, 0.8);
          petal.position.set(Math.cos((p / 12) * Math.PI * 2) * 0.2, 0.05, Math.sin((p / 12) * Math.PI * 2) * 0.2);
          petal.rotation.y = (p / 12) * Math.PI * 2;
          petal.rotation.z = 0.5;
          herbGroup.add(petal);
        }
        // Center golden seed lotus carpel
        const center = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.15, 12), new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xaa820a, emissiveIntensity: 0.5 }));
        center.position.y = 0.05;
        herbGroup.add(center);
      } else {
        // Ashwagandha Root Bundle & Green Amla Berry
        const rootMat = new THREE.MeshStandardMaterial({ color: 0x8a6235, roughness: 0.8 });
        for (let rb = 0; rb < 8; rb++) {
          const rootC = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.3, 0),
            new THREE.Vector3((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3),
            new THREE.Vector3((Math.random() - 0.5) * 0.4, -0.45, (Math.random() - 0.5) * 0.4)
          ]);
          herbGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rootC, 12, 0.04, 6, false), rootMat));
        }
        // Amla green berries
        const amlaMat = new THREE.MeshStandardMaterial({ color: 0x76b852, roughness: 0.35 });
        const berry1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), amlaMat);
        berry1.position.set(0.15, 0.1, 0.1);
        const berry2 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), amlaMat);
        berry2.position.set(-0.15, 0.15, -0.05);
        herbGroup.add(berry1, berry2);
      }

      // Jadibuti Glow Core
      const glowPoint = new THREE.PointLight(data.color, 1.8, 2.5);
      glowPoint.position.y = 0;
      herbGroup.add(glowPoint);

      capsuleGroup.add(herbGroup);
      capsuleGroup.userData.herbGroup = herbGroup;
      capsuleGroup.userData.glowPoint = glowPoint;

      this.scene.add(capsuleGroup);
      this.capsules.push(capsuleGroup);
    });
  }

  buildAromaticVapor() {
    const particleCount = 120;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = Math.random() * 4 - 1.5;
      positions[i + 2] = (Math.random() - 0.5) * 3;
      opacities[i / 3] = Math.random() * 0.6 + 0.2;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.vaporParticles = new THREE.Points(
      geom,
      new THREE.PointsMaterial({
        color: 0xf7d774,
        size: 0.06,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      })
    );
    this.scene.add(this.vaporParticles);
  }

  setupEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;

      this.mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', () => {
      if (this.hoveredCapsule) {
        this.toggleCapsuleLift(this.hoveredCapsule);
      }
    });

    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  toggleCapsuleLift(capsule) {
    capsule.userData.isLifted = !capsule.userData.isLifted;
    const targetY = capsule.userData.isLifted
      ? capsule.userData.baseY + 0.65
      : capsule.userData.baseY;

    // Display interactive HUD card in DOM
    const data = this.capsuleData[capsule.userData.dataIndex];
    const hudEl = document.getElementById('jadibuti-hud-overlay');
    if (hudEl) {
      hudEl.innerHTML = `
        <div class="hud-capsule-card">
          <span class="hud-sanskrit">${data.sanskrit}</span>
          <h3 class="hud-title">${data.title}</h3>
          <div class="hud-meta">${data.name}</div>
          <p class="hud-compounds"><strong>Active Bio-Phytochemicals:</strong> ${data.compounds}</p>
          <div class="hud-badge">⚙️ Suspended Alchemical Capsule #${capsule.userData.dataIndex + 1}</div>
        </div>
      `;
      hudEl.classList.add('visible');
    }
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.time += 0.016;

    // Smooth mouse parallax
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.camera.position.x = this.mouse.x * 0.6;
    this.camera.position.y = 0.4 + this.mouse.y * 0.4;
    this.camera.lookAt(0, 0.2, 0);

    // Rotate Armillary rings
    if (this.armillaryGroup) {
      this.armillaryGroup.rotation.y = this.time * 0.15;
      this.armillaryGroup.rotation.x = Math.sin(this.time * 0.1) * 0.1;
    }

    // Rotate Gears
    this.gears.forEach(g => {
      g.group.rotation.z += g.speed;
    });

    // Sway and update Jadibuti Capsules
    this.capsules.forEach((capsule, idx) => {
      // Natural pendulum sway
      const swaySpeed = 1.2 + idx * 0.3;
      const swayAmp = 0.05 + Math.sin(this.time * 0.8 + idx) * 0.03;
      capsule.rotation.z = Math.sin(this.time * swaySpeed) * swayAmp + this.mouse.x * 0.08;
      capsule.rotation.x = Math.cos(this.time * swaySpeed * 0.8) * swayAmp;

      // Smooth lift transition if clicked
      const targetY = capsule.userData.isLifted
        ? capsule.userData.baseY + 0.65
        : capsule.userData.baseY;
      capsule.position.y += (targetY - capsule.position.y) * 0.08;

      // Slow specimen rotation inside glass
      if (capsule.userData.herbGroup) {
        capsule.userData.herbGroup.rotation.y += 0.012;
      }
    });

    // Drift Aromatic Vapor Particles upwards
    if (this.vaporParticles) {
      const pos = this.vaporParticles.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += 0.008;
        if (pos[i] > 3.0) {
          pos[i] = -1.5;
        }
      }
      this.vaporParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Raycast hover detection
    this.raycaster.setFromCamera(this.mouseVec, this.camera);
    const intersects = this.raycaster.intersectObjects(this.capsules, true);
    if (intersects.length > 0) {
      let rootCapsule = intersects[0].object;
      while (rootCapsule.parent && !this.capsules.includes(rootCapsule)) {
        rootCapsule = rootCapsule.parent;
      }
      this.hoveredCapsule = rootCapsule;
      document.body.style.cursor = 'pointer';
    } else {
      this.hoveredCapsule = null;
      document.body.style.cursor = 'default';
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.HeroPulleyEngine = HeroPulleyEngine;
export { HeroPulleyEngine };
