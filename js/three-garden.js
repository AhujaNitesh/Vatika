/**
 * Vatika (वाटिका) — Premium 3D Botanical Anatomy Engine
 * Features: Rich Vibrant Colors, Connected Anatomical Plant Hierarchy,
 * Dynamic Solar Lighting, Bioluminescent Floating Pollen, & Interactive Hotspots.
 */

class PlantAnatomy3DViewer {
  constructor(canvasContainerId, onPartSelectedCallback) {
    this.container = document.getElementById(canvasContainerId);
    this.onPartSelected = onPartSelectedCallback;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.plantGroup = null;
    this.particles = null;
    this.pedestalRing = null;
    this.parts = {};
    
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.targetRotation = { x: 0.12, y: 0.35 };
    this.currentRotation = { x: 0.12, y: 0.35 };
    this.autoRotate = true;
    this.lightMode = 'morning';
    this.viewMode = 'botanical';
    this.activePart = 'leaf';
    this.cameraTarget = new THREE.Vector3(0, 0.45, 0);
    this.currentCameraTarget = new THREE.Vector3(0, 0.45, 0);
    this.targetCameraPos = new THREE.Vector3(0, 0.55, 3.4);
    this.time = 0;
    this.leafMeshes = [];

    // Hotspot 3D Coordinates & Meta
    this.hotspotDefs = {
      root: {
        id: 'root',
        pos: new THREE.Vector3(0, -0.65, 0.2),
        name: 'Root System (मूल - Moola)',
        badge: '🌱 Earth Element • Ojas',
        desc: 'Grounding taproot reservoir storing adaptogenic withanolides & minerals to nourish nervous stability and build Ojas.',
        compounds: ['Withanolides', 'Saponins', 'Inulin'],
        targetPos: new THREE.Vector3(0, -0.65, 1.9),
        lookTarget: new THREE.Vector3(0, -0.65, 0)
      },
      stem: {
        id: 'stem',
        pos: new THREE.Vector3(0, 0.35, 0.1),
        name: 'Stem & Bark (काण्ड - Kanda)',
        badge: '🌿 Vascular Highway • Tannins',
        desc: 'Structural cambium packed with astringent tannins & protective resins that tone vascular tissues and support gut integrity.',
        compounds: ['Tannins', 'Resins', 'Bio-Alkaloids'],
        targetPos: new THREE.Vector3(0, 0.4, 2.1),
        lookTarget: new THREE.Vector3(0, 0.35, 0)
      },
      leaf: {
        id: 'leaf',
        pos: new THREE.Vector3(0.38, 0.72, 0.18),
        name: 'Leaf (पत्र - Patra)',
        badge: '🍃 Solar Prana • Essential Oils',
        desc: 'Solar photosynthetic leaves dense with secretory trichomes, volatile eugenol terpenes, and respiratory clearers.',
        compounds: ['Eugenol', 'Rosmarinic Acid', 'Ursolic Acid'],
        targetPos: new THREE.Vector3(0.45, 0.75, 1.8),
        lookTarget: new THREE.Vector3(0.25, 0.7, 0)
      },
      flower: {
        id: 'flower',
        pos: new THREE.Vector3(0, 1.48, 0.05),
        name: 'Flower (पुष्प - Pushpa)',
        badge: '🌸 Cooling • Heart Opening',
        desc: 'Delicate blossom spikes rich in soothing flavonoids and anthocyanins that pacify fiery Pitta and calm the mind.',
        compounds: ['Flavonoids', 'Anthocyanins', 'Luteolin'],
        targetPos: new THREE.Vector3(0, 1.5, 1.6),
        lookTarget: new THREE.Vector3(0, 1.45, 0)
      },
      fruit: {
        id: 'fruit',
        pos: new THREE.Vector3(0.28, 0.58, 0.22),
        name: 'Fruit (फल - Phala)',
        badge: '🍎 Cellular Antioxidants',
        desc: 'Succulent seed guardians loaded with bio-chelated vitamin C, fruit acids, and longevity enzymes.',
        compounds: ['Emblicanin', 'Ascorbic Acid', 'Gallic Acid'],
        targetPos: new THREE.Vector3(0.35, 0.62, 1.6),
        lookTarget: new THREE.Vector3(0.2, 0.58, 0.15)
      },
      seed: {
        id: 'seed',
        pos: new THREE.Vector3(-0.15, 1.25, 0.12),
        name: 'Seed (बीज - Beeja)',
        badge: '🌰 Generative Vitality',
        desc: 'Embryonic seed storehouses holding omega lipids, reproductive vitality (Shukra Dhatu), and neuro-lipids.',
        compounds: ['Phytosterols', 'Fixed Oils', 'Mucilage'],
        targetPos: new THREE.Vector3(-0.25, 1.3, 1.5),
        lookTarget: new THREE.Vector3(-0.15, 1.25, 0)
      }
    };

    this.hotspotElements = {};
    this.cloudPopupEl = null;

    if (this.container && window.THREE) {
      this.init();
    }
  }

  init() {
    const parent = this.container.parentElement;
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 550;

    // Scene setup with atmospheric deep midnight green background
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x061910, 0.08);

    // Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.copy(this.targetCameraPos);

    // WebGL Renderer with High Dynamic Range Tone Mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    this.setupLighting();

    // Build 3D Plant Model & Atmospheric Scene
    this.buildProceduralPlant();
    this.buildPollenParticles();
    this.buildPedestal();

    // Hotspot DOM Overlay
    this.buildHotspotOverlay(parent);

    // Events & Auto-Resizing
    this.setupEvents();
    this.setupResizeObserver();

    // Initial focus on leaf
    setTimeout(() => {
      this.focusPart('leaf');
    }, 350);

    // Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Ambient light - warm leaf canopy glow
    this.ambientLight = new THREE.AmbientLight(0xdcfce7, 1.1);
    this.scene.add(this.ambientLight);

    // Main Sunlight - Rich Warm Solar Rays
    this.mainSun = new THREE.DirectionalLight(0xfffbeb, 2.5);
    this.mainSun.position.set(4, 9, 5);
    this.mainSun.castShadow = true;
    this.mainSun.shadow.mapSize.width = 2048;
    this.mainSun.shadow.mapSize.height = 2048;
    this.scene.add(this.mainSun);

    // Rim Light - Vivid Emerald Edge Glow
    this.rimLight = new THREE.DirectionalLight(0x34d399, 1.4);
    this.rimLight.position.set(-5, 4, -4);
    this.scene.add(this.rimLight);

    // Point Light - Under-Canopy Warm Fill
    this.fillLight = new THREE.PointLight(0xf59e0b, 1.6, 10);
    this.fillLight.position.set(0, -0.4, 2.2);
    this.scene.add(this.fillLight);
  }

  setLightingMode(mode) {
    this.lightMode = mode;
    if (mode === 'morning') {
      this.ambientLight.color.setHex(0xdcfce7);
      this.ambientLight.intensity = 1.1;
      this.mainSun.color.setHex(0xfffbeb);
      this.mainSun.intensity = 2.5;
      this.mainSun.position.set(4, 8, 5);
      this.rimLight.color.setHex(0x34d399);
      this.rimLight.intensity = 1.4;
    } else if (mode === 'noon') {
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 1.35;
      this.mainSun.color.setHex(0xffffff);
      this.mainSun.intensity = 3.0;
      this.mainSun.position.set(0.2, 10, 1);
      this.rimLight.color.setHex(0xa7f3d0);
    } else if (mode === 'dusk') {
      this.ambientLight.color.setHex(0x7c2d12);
      this.ambientLight.intensity = 0.75;
      this.mainSun.color.setHex(0xf97316);
      this.mainSun.intensity = 2.6;
      this.mainSun.position.set(-6, 3, 2);
      this.rimLight.color.setHex(0xfacc15);
    } else if (mode === 'biolum') {
      this.ambientLight.color.setHex(0x022c22);
      this.ambientLight.intensity = 0.5;
      this.mainSun.color.setHex(0x10b981);
      this.mainSun.intensity = 1.2;
      this.rimLight.color.setHex(0x06b6d4);
      this.fillLight.color.setHex(0x3b82f6);
      this.fillLight.intensity = 3.2;
    }
  }

  setViewMode(mode) {
    this.viewMode = mode;
    const isWire = mode === 'wireframe';
    const isXray = mode === 'xray';

    this.plantGroup.traverse((child) => {
      if (child.isMesh && child.userData.materialRef) {
        if (isWire) {
          child.material.wireframe = true;
          child.material.emissive.setHex(0x10b981);
          child.material.emissiveIntensity = 0.4;
        } else if (isXray) {
          child.material.wireframe = false;
          child.material.transparent = true;
          child.material.opacity = 0.55;
          child.material.emissive.setHex(0x34d399);
          child.material.emissiveIntensity = child.userData.part === this.activePart ? 1.3 : 0.35;
        } else {
          child.material.wireframe = false;
          child.material.transparent = false;
          child.material.opacity = 1.0;
          child.material.emissive.setHex(child.userData.part === this.activePart ? 0xf59e0b : 0x000000);
          child.material.emissiveIntensity = child.userData.part === this.activePart ? 0.35 : 0.0;
        }
      }
    });
  }

  buildPedestal() {
    // Elegant Dark Obsidian Pot / Pedestal
    const potGeo = new THREE.CylinderGeometry(1.2, 0.9, 0.45, 48);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x0a1f16,
      roughness: 0.4,
      metalness: 0.4,
      emissive: 0x04130d,
      emissiveIntensity: 0.5
    });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = -0.58;
    pot.receiveShadow = true;
    this.plantGroup.add(pot);

    // Soil Top Disc
    const soilGeo = new THREE.CylinderGeometry(1.18, 1.18, 0.05, 32);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x271c19, roughness: 0.9 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = -0.37;
    this.plantGroup.add(soil);

    // Glowing Gold Trim Ring
    const ringGeo = new THREE.RingGeometry(0.88, 1.22, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });
    this.pedestalRing = new THREE.Mesh(ringGeo, ringMat);
    this.pedestalRing.rotation.x = Math.PI / 2;
    this.pedestalRing.position.y = -0.35;
    this.plantGroup.add(this.pedestalRing);
  }

  buildPollenParticles() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3.4;
      positions[i * 3 + 1] = -0.4 + Math.random() * 2.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.4;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const mat = new THREE.PointsMaterial({
      color: 0xfcd34d,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, mat);
    this.plantGroup.add(this.particles);
  }

  createOrganicLeafGeometry() {
    // Sleek, elegant, realistic 3D leaf shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.12, 0.2, 0.14, 0.5, 0, 0.85);
    shape.bezierCurveTo(-0.14, 0.5, -0.12, 0.2, 0, 0);

    const extrudeSettings = {
      depth: 0.01,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.004,
      bevelThickness: 0.004
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  buildProceduralPlant() {
    this.plantGroup = new THREE.Group();
    this.scene.add(this.plantGroup);

    // --- 1. ROOT SYSTEM (🌱 Root) ---
    const rootGroup = new THREE.Group();
    rootGroup.userData = { part: 'root' };
    const rootMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.75,
      metalness: 0.1
    });

    const rootCount = 14;
    for (let i = 0; i < rootCount; i++) {
      const angle = (i / rootCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const length = 0.75 + Math.random() * 0.45;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.37, 0),
        new THREE.Vector3(Math.cos(angle) * 0.25, -0.58 - Math.random() * 0.18, Math.sin(angle) * 0.25),
        new THREE.Vector3(Math.cos(angle) * (0.5 + Math.random() * 0.3), -0.88 - length * 0.35, Math.sin(angle) * (0.5 + Math.random() * 0.3))
      ]);
      const rootGeom = new THREE.TubeGeometry(curve, 24, 0.04 * (1 - i / (rootCount * 1.4)), 8, false);
      const rootMesh = new THREE.Mesh(rootGeom, rootMat.clone());
      rootMesh.userData = { part: 'root', materialRef: true };
      rootGroup.add(rootMesh);
    }
    this.plantGroup.add(rootGroup);
    this.parts.root = { group: rootGroup };

    // --- 2. STEM & BRANCHES (🌿 Stem) ---
    const stemGroup = new THREE.Group();
    stemGroup.userData = { part: 'stem' };
    
    // Rich Emerald/Jade Bark Material
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.45,
      metalness: 0.15
    });

    // Main Central Trunk Curve
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.37, 0),
      new THREE.Vector3(0.04, 0.18, -0.02),
      new THREE.Vector3(-0.05, 0.65, 0.04),
      new THREE.Vector3(0.03, 1.12, -0.02),
      new THREE.Vector3(0, 1.5, 0)
    ]);
    const stemMesh = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 40, 0.075, 14, false), stemMat.clone());
    stemMesh.castShadow = true;
    stemMesh.receiveShadow = true;
    stemMesh.userData = { part: 'stem', materialRef: true };
    stemGroup.add(stemMesh);

    // Attached Branches
    const branches = [
      { y: 0.35, angle: 0.6, rotZ: 0.55, length: 0.65 },
      { y: 0.62, angle: 2.7, rotZ: -0.6, length: 0.6 },
      { y: 0.88, angle: 4.2, rotZ: 0.5, length: 0.55 },
      { y: 1.15, angle: 1.5, rotZ: -0.48, length: 0.48 }
    ];

    const branchEndPoints = [];

    branches.forEach(bc => {
      const bCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(bc.length * 0.45, 0.08, 0),
        new THREE.Vector3(bc.length, 0.18, 0)
      ]);
      const bMesh = new THREE.Mesh(new THREE.TubeGeometry(bCurve, 20, 0.035, 8, false), stemMat.clone());
      bMesh.position.set(0, bc.y, 0);
      bMesh.rotation.y = bc.angle;
      bMesh.rotation.z = bc.rotZ;
      bMesh.userData = { part: 'stem', materialRef: true };
      stemGroup.add(bMesh);

      // Store exact end positions of branches for leaf & fruit attachment
      const endVec = new THREE.Vector3(bc.length, 0.18, 0);
      endVec.applyAxisAngle(new THREE.Vector3(0, 0, 1), bc.rotZ);
      endVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), bc.angle);
      endVec.add(new THREE.Vector3(0, bc.y, 0));
      branchEndPoints.push({ pos: endVec, angle: bc.angle, rotZ: bc.rotZ });
    });

    this.plantGroup.add(stemGroup);
    this.parts.stem = { group: stemGroup };

    // --- 3. LEAVES (🍃 Leaf) --- Clean 4 Leaves Setup
    const leafGroup = new THREE.Group();
    leafGroup.userData = { part: 'leaf' };
    const leafGeom = this.createOrganicLeafGeometry();

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.22,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    // Clean 4 Leaves Attached Directly to Branch Tips
    const leafConfigs = [
      { pos: branchEndPoints[0].pos, rotX: 0.2, rotY: branchEndPoints[0].angle, rotZ: -0.5, scale: 0.72 },
      { pos: branchEndPoints[1].pos, rotX: -0.2, rotY: branchEndPoints[1].angle, rotZ: 0.5, scale: 0.72 },
      { pos: branchEndPoints[2].pos, rotX: 0.3, rotY: branchEndPoints[2].angle, rotZ: -0.4, scale: 0.68 },
      { pos: branchEndPoints[3].pos, rotX: -0.3, rotY: branchEndPoints[3].angle, rotZ: 0.4, scale: 0.65 }
    ];

    this.leafMeshes = [];
    leafConfigs.forEach((lc, idx) => {
      const lMesh = new THREE.Mesh(leafGeom, leafMat.clone());
      lMesh.position.copy(lc.pos);
      lMesh.rotation.set(lc.rotX, lc.rotY, lc.rotZ);
      lMesh.scale.set(lc.scale, lc.scale, lc.scale);
      lMesh.castShadow = true;
      lMesh.receiveShadow = true;
      lMesh.userData = { part: 'leaf', materialRef: true, baseRotZ: lc.rotZ, idx };
      leafGroup.add(lMesh);
      this.leafMeshes.push(lMesh);
    });

    this.plantGroup.add(leafGroup);
    this.parts.leaf = { group: leafGroup };

    // --- 4. FLOWERS (🌸 Flower) ---
    const flowerGroup = new THREE.Group();
    flowerGroup.userData = { part: 'flower' };

    // Vibrant Magenta & Coral Blossom Petals with Glowing Golden Core
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.25,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.8
    });

    const createFlowerSpike = (x, y, z, scale = 1.0) => {
      const fGroup = new THREE.Group();
      fGroup.position.set(x, y, z);
      fGroup.scale.set(scale, scale, scale);
      
      // Central Pedicel Stem
      const pedicel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.5, 8), stemMat.clone());
      fGroup.add(pedicel);

      // Florets spiral around pedicel
      for (let i = 0; i < 18; i++) {
        const floret = new THREE.Group();
        const floretY = (i / 18) * 0.45 - 0.2;
        const floretAngle = (i * 2.4);
        
        for (let p = 0; p < 5; p++) {
          const petal = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), petalMat.clone());
          petal.scale.set(1.6, 0.45, 0.85);
          petal.position.x = 0.038;
          petal.rotation.z = (p / 5) * Math.PI * 2;
          floret.add(petal);
        }
        
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), centerMat.clone());
        floret.add(core);

        floret.position.set(Math.cos(floretAngle) * 0.05, floretY, Math.sin(floretAngle) * 0.05);
        floret.rotation.y = floretAngle;
        fGroup.add(floret);
      }
      return fGroup;
    };

    // Flower spikes attached directly to top canopy
    flowerGroup.add(
      createFlowerSpike(0, 1.52, 0, 1.1),
      createFlowerSpike(0.28, 1.25, 0.1, 0.82),
      createFlowerSpike(-0.25, 1.28, -0.1, 0.85)
    );

    flowerGroup.traverse(c => { if (c.isMesh) c.userData = { part: 'flower', materialRef: true }; });
    this.plantGroup.add(flowerGroup);
    this.parts.flower = { group: flowerGroup };

    // --- 5. FRUIT (🍎 Fruit) ---
    const fruitGroup = new THREE.Group();
    fruitGroup.userData = { part: 'fruit' };
    
    // High-Gloss Ruby & Jade Medicinal Berries
    const fruitMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.15,
      metalness: 0.15
    });

    const fruitPositions = [
      branchEndPoints[0].pos.clone().add(new THREE.Vector3(0, -0.08, 0.05)),
      branchEndPoints[0].pos.clone().add(new THREE.Vector3(0.06, -0.1, -0.05)),
      branchEndPoints[1].pos.clone().add(new THREE.Vector3(-0.05, -0.08, 0.05)),
      branchEndPoints[2].pos.clone().add(new THREE.Vector3(0.05, -0.08, 0.05))
    ];

    fruitPositions.forEach(fp => {
      // Petiole Stem connecting fruit to branch
      const pCurve = new THREE.CatmullRomCurve3([
        fp.clone().add(new THREE.Vector3(0, 0.08, 0)),
        fp
      ]);
      const pMesh = new THREE.Mesh(new THREE.TubeGeometry(pCurve, 8, 0.012, 6, false), stemMat.clone());
      fruitGroup.add(pMesh);

      // Berry Sphere
      const fMesh = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), fruitMat.clone());
      fMesh.position.copy(fp);
      fMesh.castShadow = true;
      fMesh.userData = { part: 'fruit', materialRef: true };
      fruitGroup.add(fMesh);
    });

    this.plantGroup.add(fruitGroup);
    this.parts.fruit = { group: fruitGroup };

    // --- 6. SEEDS (🌰 Seed) ---
    const seedGroup = new THREE.Group();
    seedGroup.userData = { part: 'seed' };

    const seedMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.45,
      metalness: 0.2
    });

    const seedPositions = [
      new THREE.Vector3(-0.15, 1.25, 0.12),
      new THREE.Vector3(-0.18, 1.28, 0.08),
      new THREE.Vector3(0.15, 1.26, -0.1)
    ];

    seedPositions.forEach(sp => {
      const sMesh = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.065, 8), seedMat.clone());
      sMesh.position.copy(sp);
      sMesh.userData = { part: 'seed', materialRef: true };
      seedGroup.add(sMesh);
    });

    this.plantGroup.add(seedGroup);
    this.parts.seed = { group: seedGroup };
  }

  buildHotspotOverlay(parentContainer) {
    if (!parentContainer) return;

    let overlay = parentContainer.querySelector('.hotspot-screen-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'hotspot-screen-overlay';
      overlay.style.position = 'absolute';
      overlay.style.inset = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '20';
      parentContainer.appendChild(overlay);
    }

    this.cloudPopupEl = document.createElement('div');
    this.cloudPopupEl.className = 'hotspot-cloud-popup';
    this.cloudPopupEl.innerHTML = `
      <button class="cloud-popup-close" title="Close Popup">&times;</button>
      <div class="cloud-popup-badge" id="cloud-badge"></div>
      <h4 class="cloud-popup-title" id="cloud-title"></h4>
      <p class="cloud-popup-desc" id="cloud-desc"></p>
      <div class="cloud-popup-compounds" id="cloud-compounds"></div>
    `;
    overlay.appendChild(this.cloudPopupEl);

    this.cloudPopupEl.querySelector('.cloud-popup-close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.cloudPopupEl.classList.remove('visible');
    });

    Object.keys(this.hotspotDefs).forEach(partKey => {
      const def = this.hotspotDefs[partKey];
      const dot = document.createElement('div');
      dot.className = 'hotspot-interactive-dot';
      dot.style.pointerEvents = 'auto';
      dot.innerHTML = `
        <div class="dot-beacon-ring"></div>
        <div class="dot-core-circle"></div>
        <span class="dot-label-pill">${def.name.split(' ')[0]}</span>
      `;

      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        this.focusPart(partKey);
      });

      overlay.appendChild(dot);
      this.hotspotElements[partKey] = dot;
    });
  }

  focusPart(partKey) {
    const def = this.hotspotDefs[partKey];
    if (!def) return;

    this.activePart = partKey;
    this.autoRotate = false;

    this.targetCameraPos.copy(def.targetPos);
    this.cameraTarget.copy(def.lookTarget);

    this.setViewMode(this.viewMode);

    if (this.cloudPopupEl) {
      document.getElementById('cloud-badge').textContent = def.badge;
      document.getElementById('cloud-title').textContent = def.name;
      document.getElementById('cloud-desc').textContent = def.desc;
      document.getElementById('cloud-compounds').innerHTML = def.compounds
        .map(c => `<span class="cloud-compound-tag">${c}</span>`)
        .join('');
      this.cloudPopupEl.classList.add('visible');
    }

    if (this.onPartSelected) {
      this.onPartSelected(partKey);
    }
  }

  updateHotspotsScreenPositions() {
    if (!this.container || !this.camera || !this.plantGroup) return;

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    Object.keys(this.hotspotDefs).forEach(partKey => {
      const def = this.hotspotDefs[partKey];
      const dotEl = this.hotspotElements[partKey];
      if (!dotEl) return;

      const worldPos = def.pos.clone().applyMatrix4(this.plantGroup.matrixWorld);
      const screenPos = worldPos.clone().project(this.camera);

      if (screenPos.z > 1) {
        dotEl.style.display = 'none';
        return;
      }

      dotEl.style.display = 'grid';
      const x = (screenPos.x * 0.5 + 0.5) * w;
      const y = (-(screenPos.y * 0.5) + 0.5) * h;

      dotEl.style.left = `${x}px`;
      dotEl.style.top = `${y}px`;

      if (this.activePart === partKey && this.cloudPopupEl) {
        this.cloudPopupEl.style.left = `${x}px`;
        this.cloudPopupEl.style.top = `${y}px`;
      }
    });
  }

  setupResizeObserver() {
    if (!this.container) return;
    const updateSize = () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w > 0 && h > 0) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    };

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => updateSize());
      ro.observe(this.container);
    } else {
      window.addEventListener('resize', updateSize);
    }
  }

  setupEvents() {
    const el = this.renderer.domElement;

    // Mouse Controls
    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.targetRotation.y += deltaX * 0.008;
      this.targetRotation.x = Math.max(-0.6, Math.min(0.8, this.targetRotation.x + deltaY * 0.008));
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch Controls
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.autoRotate = false;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.targetRotation.y += deltaX * 0.008;
      this.targetRotation.x = Math.max(-0.6, Math.min(0.8, this.targetRotation.x + deltaY * 0.008));
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Zoom Wheel
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.002;
      this.targetCameraPos.z = Math.max(1.4, Math.min(5.5, this.targetCameraPos.z + zoomFactor));
    }, { passive: false });
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.time += 0.015;

    // Smooth camera motion
    this.camera.position.lerp(this.targetCameraPos, 0.06);
    this.currentCameraTarget.lerp(this.cameraTarget, 0.06);
    this.camera.lookAt(this.currentCameraTarget);

    // Auto Rotation
    if (this.autoRotate && !this.isDragging) {
      this.targetRotation.y += 0.004;
    }
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.08;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.08;

    if (this.plantGroup) {
      this.plantGroup.rotation.y = this.currentRotation.y;
      this.plantGroup.rotation.x = this.currentRotation.x;
    }

    // Leaf Breeze Swaying Animation
    if (this.leafMeshes) {
      this.leafMeshes.forEach(leaf => {
        const idx = leaf.userData.idx || 0;
        leaf.rotation.z = leaf.userData.baseRotZ + Math.sin(this.time * 2.2 + idx) * 0.04;
      });
    }

    // Pedestal Ring Rotation
    if (this.pedestalRing) {
      this.pedestalRing.rotation.z = this.time * 0.18;
    }

    // Rising Pollen Fireflies
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += 0.0035;
        if (positions[i * 3 + 1] > 2.2) {
          positions[i * 3 + 1] = -0.4;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    // Update 2D hotspots
    this.updateHotspotsScreenPositions();

    this.renderer.render(this.scene, this.camera);
  }
}

window.PlantAnatomy3DViewer = PlantAnatomy3DViewer;
export { PlantAnatomy3DViewer };
