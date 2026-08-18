/**
 * Interactive Virtual Herbal Garden - 3D Sanctuary Walkthrough Simulator
 * An interactive 3D botanical garden environment where users can explore beds,
 * click plant markers, inspect medicinal species, and experience atmospheric lighting.
 */

class VirtualGardenWalkthrough {
  constructor(canvasContainerId, onPlantClicked) {
    this.container = document.getElementById(canvasContainerId);
    this.onPlantClicked = onPlantClicked;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.plantMarkers = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.time = 0;
    this.isExploring = false;
    this.cameraMode = 'orbit'; // 'orbit', 'free'
    this.controls = {
      isMouseDown: false,
      prevX: 0,
      prevY: 0,
      theta: 0.8,
      phi: 0.35,
      radius: 14,
      target: new THREE.Vector3(0, 0, 0)
    };

    if (this.container && window.THREE) {
      this.init();
    }
  }

  init() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xe8dec8, 0.035);
    this.scene.background = new THREE.Color(0xf4f0e6);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    this.updateCameraPos();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Environment Lighting
    this.setupEnvironment();

    // Build Garden Terrain & Zones
    this.buildGardenSanctuary();

    // Events
    this.setupEvents();

    // Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupEnvironment() {
    const hemi = new THREE.HemisphereLight(0xfff8ea, 0x2f6b4f, 1.2);
    this.scene.add(hemi);

    this.sun = new THREE.DirectionalLight(0xffecd2, 2.2);
    this.sun.position.set(15, 25, 10);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 80;
    const d = 25;
    this.sun.shadow.camera.left = -d;
    this.sun.shadow.camera.right = d;
    this.sun.shadow.camera.top = d;
    this.sun.shadow.camera.bottom = -d;
    this.scene.add(this.sun);
  }

  buildGardenSanctuary() {
    // 1. Garden Ground Lawn
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4a7c59,
      roughness: 0.9,
      metalness: 0.05
    });
    const groundGeom = new THREE.PlaneGeometry(80, 80, 40, 40);
    // Add subtle terrain undulation
    const pos = groundGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      pos.setZ(i, Math.sin(vx * 0.15) * Math.cos(vy * 0.15) * 0.4);
    }
    groundGeom.computeVertexNormals();

    const groundMesh = new THREE.Mesh(groundGeom, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // 2. Cobblestone Pathways
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xd6cbb8, roughness: 0.85 });
    const mainPathGeom = new THREE.RingGeometry(4.5, 7.5, 32);
    const mainPath = new THREE.Mesh(mainPathGeom, pathMat);
    mainPath.rotation.x = -Math.PI / 2;
    mainPath.position.y = 0.02;
    mainPath.receiveShadow = true;
    this.scene.add(mainPath);

    // 3. Central Sacred Water Pond with Lily Pads
    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x225544,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const pondMesh = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.15, 32), pondMat);
    pondMesh.position.y = 0.06;
    this.scene.add(pondMesh);

    // Pond Stone Rim
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x9a9182, roughness: 0.9 });
    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.25, 12, 32), rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.1;
    this.scene.add(rimMesh);

    // 4. Distant Traditional AYUSH Pavilion / Mandapam
    this.buildPavilion(0, 0, -18);

    // 5. Four Herbal Garden Beds & Interactive Plant Markers
    const plantBeds = [
      { id: 'tulsi', name: 'Tulsi Sanctuary', botanical: 'Ocimum sanctum', x: 6, z: -4, color: 0x2f6b4f, icon: '🌿' },
      { id: 'ashwagandha', name: 'Ashwagandha Bed', botanical: 'Withania somnifera', x: 6, z: 4, color: 0xc9a227, icon: '🌱' },
      { id: 'aloe-vera', name: 'Aloe Cooling Oasis', botanical: 'Aloe barbadensis', x: -6, z: 4, color: 0x3f8a65, icon: '🍃' },
      { id: 'neem', name: 'Nimba Grove', botanical: 'Azadirachta indica', x: -6, z: -4, color: 0x1f5438, icon: '🌲' },
      { id: 'amla', name: 'Amalaki Orchard', botanical: 'Phyllanthus emblica', x: 0, z: 8.5, color: 0x6e9c4b, icon: '🍎' },
      { id: 'ginger-turmeric', name: 'Golden Rhizome Bed', botanical: 'Zingiber & Curcuma', x: -9.5, z: 0, color: 0xda9100, icon: '🌾' },
      { id: 'brahmi', name: 'Brahmi Wetland Basin', botanical: 'Bacopa monnieri', x: 9.5, z: 0, color: 0x55aa77, icon: '💧' }
    ];

    plantBeds.forEach(bed => {
      this.createPlantBed(bed);
    });

    // 6. Atmospheric Floating Golden Motes & Mist
    this.createFloatingPollen();
  }

  buildPavilion(x, y, z) {
    const pavGroup = new THREE.Group();
    pavGroup.position.set(x, y, z);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe0d7c7, roughness: 0.8 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6d4c38, roughness: 0.7 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x935134, roughness: 0.6 });

    // Plinth Platform
    const base = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 10), stoneMat);
    base.position.y = 0.4;
    base.receiveShadow = true;
    pavGroup.add(base);

    // 4 Pillars
    const pillarGeom = new THREE.CylinderGeometry(0.3, 0.35, 4.5, 16);
    const pillarPositions = [
      [-4, 2.65, -4], [4, 2.65, -4], [-4, 2.65, 4], [4, 2.65, 4]
    ];
    pillarPositions.forEach(p => {
      const pill = new THREE.Mesh(pillarGeom, stoneMat);
      pill.position.set(p[0], p[1], p[2]);
      pill.castShadow = true;
      pavGroup.add(pill);
    });

    // Classical Tiered Pavilion Roof
    const roofBase = new THREE.Mesh(new THREE.BoxGeometry(11, 0.4, 11), woodMat);
    roofBase.position.y = 5.1;
    pavGroup.add(roofBase);

    const roofPyramid = new THREE.Mesh(new THREE.ConeGeometry(8.5, 3.2, 4), roofMat);
    roofPyramid.position.y = 6.9;
    roofPyramid.rotation.y = Math.PI / 4;
    roofPyramid.castShadow = true;
    pavGroup.add(roofPyramid);

    // Golden Kalash Finial on Top
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.8, roughness: 0.2 });
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), goldMat);
    finial.position.y = 8.6;
    pavGroup.add(finial);

    this.scene.add(pavGroup);
  }

  createPlantBed(bed) {
    const bedGroup = new THREE.Group();
    bedGroup.position.set(bed.x, 0, bed.z);

    // Wooden / Stone Raised Planter Border
    const planterMat = new THREE.MeshStandardMaterial({ color: 0x5a4635, roughness: 0.85 });
    const border = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.4, 24), planterMat);
    border.position.y = 0.2;
    border.castShadow = true;
    border.receiveShadow = true;
    bedGroup.add(border);

    // Soil
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x2b1e16, roughness: 0.95 });
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 0.35, 24), soilMat);
    soil.position.y = 0.22;
    bedGroup.add(soil);

    // Stylized botanical shrubs
    const shrubMat = new THREE.MeshStandardMaterial({ color: bed.color, roughness: 0.6 });
    for (let i = 0; i < 7; i++) {
      const r = 0.4 + Math.random() * 0.35;
      const shrub = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), shrubMat);
      const angle = (i / 7) * Math.PI * 2;
      const dist = 0.6 + Math.random() * 0.8;
      shrub.position.set(Math.cos(angle) * dist, 0.4 + r * 0.8, Math.sin(angle) * dist);
      shrub.castShadow = true;
      bedGroup.add(shrub);
    }

    // Interactive Floating 3D Marker Pin
    const markerGroup = new THREE.Group();
    markerGroup.position.set(0, 2.2, 0);

    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xc9a227,
      emissive: 0x8a6200,
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.3
    });

    const pinGeom = new THREE.OctahedronGeometry(0.3, 0);
    const pinMesh = new THREE.Mesh(pinGeom, pinMat);
    markerGroup.add(pinMesh);

    // Glowing Aura Ring
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc9a227,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.5, 16), ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    markerGroup.add(ringMesh);

    markerGroup.userData = {
      isMarker: true,
      plantId: bed.id,
      plantName: bed.name,
      botanicalName: bed.botanical
    };

    bedGroup.add(markerGroup);
    this.plantMarkers.push(markerGroup);

    this.scene.add(bedGroup);
  }

  createFloatingPollen() {
    const pGeom = new THREE.BufferGeometry();
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 40;
      pos[i + 1] = Math.random() * 10 + 0.2;
      pos[i + 2] = (Math.random() - 0.5) * 40;
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffd166,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    this.pollen = new THREE.Points(pGeom, pMat);
    this.scene.add(this.pollen);
  }

  setupEvents() {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      this.controls.isMouseDown = true;
      this.controls.prevX = e.clientX;
      this.controls.prevY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.controls.isMouseDown) {
        // Check hover over 3D markers
        const rect = el.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.checkMarkerHover();
        return;
      }

      const dx = e.clientX - this.controls.prevX;
      const dy = e.clientY - this.controls.prevY;

      this.controls.theta -= dx * 0.006;
      this.controls.phi = Math.max(0.12, Math.min(1.2, this.controls.phi + dy * 0.006));

      this.controls.prevX = e.clientX;
      this.controls.prevY = e.clientY;

      this.updateCameraPos();
    });

    window.addEventListener('mouseup', () => {
      this.controls.isMouseDown = false;
    });

    // Click marker
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      for (let hit of intersects) {
        let curr = hit.object;
        while (curr && !curr.userData?.isMarker && curr.parent) {
          curr = curr.parent;
        }
        if (curr && curr.userData?.isMarker) {
          if (this.onPlantClicked) {
            this.onPlantClicked(curr.userData.plantId);
          }
          break;
        }
      }
    });

    // Zoom
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.controls.radius = Math.max(6, Math.min(30, this.controls.radius + e.deltaY * 0.015));
      this.updateCameraPos();
    }, { passive: false });

    // Resize
    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  checkMarkerHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    let hovered = false;

    for (let hit of intersects) {
      let curr = hit.object;
      while (curr && !curr.userData?.isMarker && curr.parent) {
        curr = curr.parent;
      }
      if (curr && curr.userData?.isMarker) {
        document.body.style.cursor = 'pointer';
        hovered = true;
        break;
      }
    }
    if (!hovered) {
      document.body.style.cursor = 'default';
    }
  }

  updateCameraPos() {
    const x = this.controls.radius * Math.sin(this.controls.theta) * Math.cos(this.controls.phi);
    const y = this.controls.radius * Math.sin(this.controls.phi) + 1.2;
    const z = this.controls.radius * Math.cos(this.controls.theta) * Math.cos(this.controls.phi);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.controls.target);
  }

  flyToPlant(plantId) {
    const marker = this.plantMarkers.find(m => m.userData.plantId === plantId);
    if (!marker) return;

    const worldPos = new THREE.Vector3();
    marker.getWorldPosition(worldPos);

    this.controls.target.copy(worldPos);
    this.controls.radius = 7.5;
    this.controls.phi = 0.4;
    this.updateCameraPos();
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.time += 0.02;

    // Pulse & bob plant markers
    this.plantMarkers.forEach((m, idx) => {
      m.position.y = 2.2 + Math.sin(this.time * 2 + idx * 0.8) * 0.15;
      m.children[0].rotation.y = this.time * 1.5;
      m.children[1].scale.setScalar(1 + Math.sin(this.time * 3 + idx) * 0.15);
    });

    // Slow ambient pollen drift
    if (this.pollen) {
      this.pollen.rotation.y = this.time * 0.02;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.VirtualGardenWalkthrough = VirtualGardenWalkthrough;
export { VirtualGardenWalkthrough };
