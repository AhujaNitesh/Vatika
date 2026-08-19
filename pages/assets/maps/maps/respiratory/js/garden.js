// ══════════════════════════════════════════════════════════
// js/garden.js — Garden Environment: Terrain, Sky, Lighting,
//                Stone Path, Background Trees, Decorations
// ══════════════════════════════════════════════════════════
import * as THREE from 'three';

export function initGarden(state) {
  const { scene } = state;

  setupLighting(scene);
  createTerrain(scene);
  createStonePath(scene);
  createSkyDome(scene);
  createBorderTrees(scene);
  createGardenBorder(scene);
  createFountain(scene);
  createDecorations(scene);
}

// ── Lighting ──
function setupLighting(scene) {
  // Hemisphere (sky/ground)
  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x2d5a1f, 0.6);
  scene.add(hemi);

  // Ambient
  const ambient = new THREE.AmbientLight(0xfff5e6, 0.4);
  scene.add(ambient);

  // Directional sun
  const sun = new THREE.DirectionalLight(0xfff8e7, 1.4);
  sun.position.set(15, 30, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 100;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  // Soft fill from opposite side
  const fill = new THREE.DirectionalLight(0xc8e8ff, 0.3);
  fill.position.set(-10, 10, -20);
  scene.add(fill);
}

// ── Ground Terrain ──
function createTerrain(scene) {
  // Main grass ground
  const grassGeo = new THREE.PlaneGeometry(120, 120, 40, 40);

  // Subtle vertex displacement for natural look
  const pos = grassGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getY(i); // plane uses Y before rotation
    // Avoid path area (x near 0)
    if (Math.abs(x) > 3) {
      pos.setZ(i, (Math.sin(x * 0.3) * Math.cos(z * 0.3)) * 0.15);
    }
  }
  pos.needsUpdate = true;
  grassGeo.computeVertexNormals();

  const grassMat = new THREE.MeshLambertMaterial({
    color: 0x3a7a3a,
    side: THREE.FrontSide,
  });

  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  scene.add(grass);

  // Darker under-grass layer
  const underGeo = new THREE.PlaneGeometry(120, 120);
  const underMat = new THREE.MeshLambertMaterial({ color: 0x1e3d1e });
  const under = new THREE.Mesh(underGeo, underMat);
  under.rotation.x = -Math.PI / 2;
  under.position.y = -0.01;
  scene.add(under);
}

// ── Stone Path ──
function createStonePath(scene) {
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x9a8e7e });
  const mortarMat = new THREE.MeshLambertMaterial({ color: 0x7a7060 });

  // Central path running z: 18 → -20
  for (let z = 18; z >= -20; z -= 1.2) {
    // Two stones side by side
    for (let side of [-0.85, 0.85]) {
      const stoneGeo = new THREE.BoxGeometry(0.75 + Math.random() * 0.2, 0.08, 0.7 + Math.random() * 0.2);
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(side + (Math.random() - 0.5) * 0.2, 0.02, z + (Math.random() - 0.5) * 0.1);
      stone.rotation.y = (Math.random() - 0.5) * 0.3;
      stone.receiveShadow = true;
      scene.add(stone);
    }

    // Mortar fill between stones
    const mortarGeo = new THREE.BoxGeometry(0.3, 0.06, 0.65);
    const mortar = new THREE.Mesh(mortarGeo, mortarMat);
    mortar.position.set(0, 0.01, z);
    mortar.receiveShadow = true;
    scene.add(mortar);
  }

  // Cross paths at each row of plants
  for (let z of [5, -3, -11]) {
    for (let x = -9; x <= 9; x += 1.2) {
      if (Math.abs(x) < 1.5) continue; // skip central path
      const stoneGeo = new THREE.BoxGeometry(0.7 + Math.random() * 0.2, 0.07, 0.7 + Math.random() * 0.2);
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(x + (Math.random() - 0.5) * 0.1, 0.02, z + (Math.random() - 0.5) * 0.15);
      stone.rotation.y = (Math.random() - 0.5) * 0.4;
      stone.receiveShadow = true;
      scene.add(stone);
    }
  }
}

// ── Sky Dome ──
function createSkyDome(scene) {
  const skyGeo = new THREE.SphereGeometry(180, 32, 16);
  skyGeo.scale(-1, 1, 1); // invert for inside view

  const skyMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
  });

  // Create gradient colors
  const colors = [];
  const pos = skyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = (y + 180) / 360;
    // Bottom: warm horizon, Top: sky blue
    const r = THREE.MathUtils.lerp(0.6, 0.32, t);
    const g = THREE.MathUtils.lerp(0.75, 0.62, t);
    const b = THREE.MathUtils.lerp(0.85, 0.82, t);
    colors.push(r, g, b);
  }
  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // Sun disc
  const sunGeo = new THREE.CircleGeometry(4, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffde8, transparent: true, opacity: 0.85 });
  const sunDisc = new THREE.Mesh(sunGeo, sunMat);
  sunDisc.position.set(50, 80, -100);
  sunDisc.lookAt(0, 0, 0);
  scene.add(sunDisc);

  // Sun glow
  const glowGeo = new THREE.CircleGeometry(8, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff5c0, transparent: true, opacity: 0.3 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.copy(sunDisc.position);
  glow.lookAt(0, 0, 0);
  scene.add(glow);
}

// ── Border Trees (background atmosphere) ──
function createBorderTrees(scene) {
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3825 });
  const leafColors = [0x2d5a1f, 0x3a7030, 0x1e4a18, 0x2e6625];

  // Tree positions along the border
  const treePositions = [
    // Back
    [-18,0,-28],[-12,0,-28],[-6,0,-28],[0,0,-28],[6,0,-28],[12,0,-28],[18,0,-28],
    // Left
    [-22,0,-22],[-22,0,-12],[-22,0,-2],[-22,0,8],[-22,0,18],
    // Right
    [22,0,-22],[22,0,-12],[22,0,-2],[22,0,8],[22,0,18],
    // Front
    [-18,0,22],[-12,0,22],[-6,0,22],[6,0,22],[12,0,22],[18,0,22],
  ];

  treePositions.forEach(([x, y, z]) => {
    const group = new THREE.Group();
    const scale = 0.7 + Math.random() * 0.6;

    // Trunk
    const trunkH = 2.5 * scale + Math.random();
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.3, trunkH, 7);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    group.add(trunk);

    // Canopy layers
    const leafMat = new THREE.MeshLambertMaterial({ color: leafColors[Math.floor(Math.random() * leafColors.length)] });
    const numLayers = 2 + Math.floor(Math.random() * 2);
    for (let layer = 0; layer < numLayers; layer++) {
      const r = (1.8 - layer * 0.4) * scale;
      const h = (1.6 - layer * 0.2) * scale;
      const coneGeo = new THREE.ConeGeometry(r, h, 8);
      const cone = new THREE.Mesh(coneGeo, leafMat);
      cone.position.y = trunkH + layer * (h * 0.6);
      cone.castShadow = true;
      group.add(cone);
    }

    group.position.set(x + (Math.random() - 0.5) * 2, 0, z + (Math.random() - 0.5) * 2);
    scene.add(group);
  });
}

// ── Garden Border Wall ──
function createGardenBorder(scene) {
  const wallMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
  const wallH = 0.6;
  const wallT = 0.3;

  // Define border segments [x, z, width, depth]
  const segments = [
    [0, -22, 44, wallT],   // back
    [0, 20, 44, wallT],    // front
    [-22, -1, wallT, 42],  // left
    [22, -1, wallT, 42],   // right
  ];

  segments.forEach(([x, z, w, d]) => {
    const geo = new THREE.BoxGeometry(w, wallH, d);
    const wall = new THREE.Mesh(geo, wallMat);
    wall.position.set(x, wallH / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
  });

  // Corner pillars
  [[-22,-22],[22,-22],[-22,20],[22,20]].forEach(([x, z]) => {
    const pillarGeo = new THREE.BoxGeometry(0.6, wallH * 2, 0.6);
    const pillar = new THREE.Mesh(pillarGeo, wallMat);
    pillar.position.set(x, wallH, z);
    scene.add(pillar);
  });
}

// ── Central Fountain ──
function createFountain(scene) {
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x8a7d70 });
  const waterMat = new THREE.MeshLambertMaterial({ color: 0x4499bb, transparent: true, opacity: 0.75 });

  // Base ring
  const baseGeo = new THREE.TorusGeometry(1.5, 0.3, 8, 24);
  const base = new THREE.Mesh(baseGeo, stoneMat);
  base.rotation.x = -Math.PI / 2;
  base.position.set(0, 0.15, -7);
  base.receiveShadow = true;
  scene.add(base);

  // Water surface
  const waterGeo = new THREE.CircleGeometry(1.4, 24);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.16, -7);
  scene.add(water);

  // Center column
  const colGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.0, 8);
  const col = new THREE.Mesh(colGeo, stoneMat);
  col.position.set(0, 0.5, -7);
  col.castShadow = true;
  scene.add(col);

  // Top bowl
  const bowlGeo = new THREE.SphereGeometry(0.3, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const bowl = new THREE.Mesh(bowlGeo, stoneMat);
  bowl.position.set(0, 1.05, -7);
  scene.add(bowl);
}

// ── Decorative Elements ──
function createDecorations(scene) {
  // Small rocks scattered
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x7a7060 });
  const rockPositions = [
    [-3,0,8],[-7,0,2],[8,0,-6],[5,0,2],[-8,0,-5],[-3,0,-8],[7,0,-9],
    [10,0,3],[-10,0,0],[3,0,-15],[9,0,-14],[-9,0,-14],
  ];

  rockPositions.forEach(([x, y, z]) => {
    const s = 0.1 + Math.random() * 0.25;
    const geo = new THREE.SphereGeometry(s, 5, 4);
    const rock = new THREE.Mesh(geo, rockMat);
    rock.position.set(x + (Math.random()-0.5), s * 0.4, z + (Math.random()-0.5));
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.scale.set(1, 0.6 + Math.random() * 0.4, 1);
    rock.castShadow = true;
    scene.add(rock);
  });

  // Small decorative bushes
  const bushColors = [0x2d6a2d, 0x3a7a3a, 0x256025];
  const bushPositions = [
    [-16,0,-8],[-16,0,3],[16,0,-8],[16,0,3],[-16,0,-18],[16,0,-18],
    [-10,0,15],[10,0,15],[0,0,-20],[-15,0,10],[15,0,10],
  ];

  bushPositions.forEach(([x, y, z]) => {
    const bushMat = new THREE.MeshLambertMaterial({
      color: bushColors[Math.floor(Math.random() * bushColors.length)]
    });
    const s = 0.5 + Math.random() * 0.6;
    const geo = new THREE.SphereGeometry(s, 7, 6);
    const bush = new THREE.Mesh(geo, bushMat);
    bush.position.set(x, s * 0.7, z);
    bush.scale.set(1, 0.7, 1);
    bush.castShadow = true;
    scene.add(bush);
  });

  // Informational sign posts
  createSignPost(scene, 0, 14, 'Welcome to the\nAYUSH Virtual Garden');
}

function createSignPost(scene, x, z, text) {
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
  const signMat = new THREE.MeshLambertMaterial({ color: 0xf5e6c8 });

  // Post
  const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.5, 6);
  const post = new THREE.Mesh(postGeo, woodMat);
  post.position.set(x, 0.75, z);
  scene.add(post);

  // Sign board
  const boardGeo = new THREE.BoxGeometry(2.2, 0.8, 0.06);
  const board = new THREE.Mesh(boardGeo, signMat);
  board.position.set(x, 1.7, z);
  board.castShadow = true;
  scene.add(board);
}
