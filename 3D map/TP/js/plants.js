// ══════════════════════════════════════════════════════════
// js/plants.js — Procedural 3D Plant Models + Placement
// ══════════════════════════════════════════════════════════
import * as THREE from 'three';

// ── Main entry: create all plant models and add to scene ──
export function createPlantMeshes(state, plantsData) {
  plantsData.forEach(plantData => {
    const group = buildPlant(plantData);
    const [px, py, pz] = plantData.position;
    group.position.set(px, py, pz);

    // Metadata
    group.userData.plantId   = plantData.id;
    group.userData.swayable  = true;
    group.userData.swayOffset = Math.random() * Math.PI * 2;

    // Mark every mesh inside so raycasting can identify which plant was hit
    group.traverse(child => {
      if (child.isMesh) {
        child.userData.plantId   = plantData.id;
        child.userData.plantData = plantData;
        child.castShadow         = true;
        child.receiveShadow      = true;
      }
    });

    // Compute bounding box for collision
    const bbox = new THREE.Box3().setFromObject(group);

    state.plants.push({ mesh: group, data: plantData, bbox });
    state.scene.add(group);

    // Label (floating plant name)
    addPlantLabel(state, group, plantData);
  });
}

// ── Route to specific plant builder ──
function buildPlant(data) {
  switch (data.id) {
    case 'tulsi':       return buildTulsi(data);
    case 'ashwagandha': return buildAshwagandha(data);
    case 'neem':        return buildNeem(data);
    case 'turmeric':    return buildTurmeric(data);
    case 'brahmi':      return buildBrahmi(data);
    case 'aloe':        return buildAloeVera(data);
    case 'giloy':       return buildGiloy(data);
    case 'amla':        return buildAmla(data);
    case 'peppermint':  return buildPeppermint(data);
    case 'calendula':   return buildCalendula(data);
    default:            return buildGenericPlant(data);
  }
}

// ─────────────────────────────────────────────────────────
// PLANT BUILDERS
// ─────────────────────────────────────────────────────────

// ── TULSI (Holy Basil) — bushy multi-stemmed herb ──
function buildTulsi(data) {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshLambertMaterial({ color: 0x4a6741 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x2d8a4e, side: THREE.DoubleSide });
  const flowerMat = new THREE.MeshLambertMaterial({ color: 0x8b5cf6 });

  // Multiple stems
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const r = 0.15;
    const stemH = 0.5 + Math.random() * 0.3;
    const stemGeo = new THREE.CylinderGeometry(0.015, 0.025, stemH, 5);
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.set(Math.cos(angle) * r, stemH / 2, Math.sin(angle) * r);
    stem.rotation.z = (Math.random() - 0.5) * 0.4;
    group.add(stem);

    // Leaf pairs on each stem
    for (let j = 0; j < 4; j++) {
      const leafY = stemH * (0.3 + j * 0.2);
      for (let side of [-1, 1]) {
        const leaf = makeOvalLeaf(leafMat, 0.12, 0.08);
        leaf.position.set(
          Math.cos(angle) * r + side * 0.12,
          leafY,
          Math.sin(angle) * r
        );
        leaf.rotation.z = side * 0.6;
        leaf.rotation.y = angle;
        group.add(leaf);
      }
    }

    // Flower spike at top
    if (i % 2 === 0) {
      const spikeGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.25, 5);
      const spike = new THREE.Mesh(spikeGeo, flowerMat);
      spike.position.set(Math.cos(angle) * r, stemH + 0.12, Math.sin(angle) * r);
      group.add(spike);

      // Small flowers on spike
      for (let k = 0; k < 4; k++) {
        const fGeo = new THREE.SphereGeometry(0.025, 5, 4);
        const f = new THREE.Mesh(fGeo, flowerMat);
        f.position.set(
          Math.cos(angle) * r + (Math.random()-0.5)*0.05,
          stemH + 0.05 + k * 0.055,
          Math.sin(angle) * r + (Math.random()-0.5)*0.05
        );
        group.add(f);
      }
    }
  }

  // Central bushy leaves
  for (let i = 0; i < 12; i++) {
    const leaf = makeOvalLeaf(leafMat, 0.14, 0.1);
    const angle = (i / 12) * Math.PI * 2;
    leaf.position.set(Math.cos(angle) * 0.25, 0.3 + Math.random() * 0.3, Math.sin(angle) * 0.25);
    leaf.rotation.set(Math.random()*0.5, angle, Math.random()*0.3);
    group.add(leaf);
  }

  // Name plate at base
  addNamePlate(group, data.name, 0x2d8a4e);

  return group;
}

// ── ASHWAGANDHA — stout hairy plant with red berries ──
function buildAshwagandha(data) {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshLambertMaterial({ color: 0x7a8f5a });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x4a6e30, side: THREE.DoubleSide });
  const berryMat = new THREE.MeshLambertMaterial({ color: 0xcc3300 });

  // Main stem
  const mainGeo = new THREE.CylinderGeometry(0.035, 0.06, 0.9, 6);
  const main = new THREE.Mesh(mainGeo, stemMat);
  main.position.y = 0.45;
  group.add(main);

  // Branches
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const branchH = 0.4 + Math.random() * 0.2;
    const brGeo = new THREE.CylinderGeometry(0.015, 0.025, branchH, 5);
    const br = new THREE.Mesh(brGeo, stemMat);
    br.position.set(Math.cos(angle) * 0.12, 0.7, Math.sin(angle) * 0.12);
    br.rotation.z = Math.cos(angle) * 0.6;
    br.rotation.x = Math.sin(angle) * 0.6;
    group.add(br);

    // Leaves on branch
    for (let j = 0; j < 3; j++) {
      const leaf = makeOvalLeaf(leafMat, 0.16, 0.1);
      const lAngle = angle + j * 1.2;
      leaf.position.set(
        Math.cos(angle) * (0.12 + j * 0.08),
        0.7 + j * 0.1,
        Math.sin(angle) * (0.12 + j * 0.08)
      );
      leaf.rotation.y = lAngle;
      leaf.rotation.z = 0.3;
      group.add(leaf);
    }

    // Berries
    for (let b = 0; b < 3; b++) {
      const bGeo = new THREE.SphereGeometry(0.03, 6, 5);
      const berry = new THREE.Mesh(bGeo, berryMat);
      berry.position.set(
        Math.cos(angle) * 0.22 + (Math.random()-0.5)*0.05,
        0.95 + Math.random() * 0.1,
        Math.sin(angle) * 0.22 + (Math.random()-0.5)*0.05
      );
      group.add(berry);
    }
  }

  // Root hint at base
  const rootMat = new THREE.MeshLambertMaterial({ color: 0xc4a882 });
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const rGeo = new THREE.CylinderGeometry(0.02, 0.01, 0.25, 4);
    const root = new THREE.Mesh(rGeo, rootMat);
    root.position.set(Math.cos(angle) * 0.1, -0.1, Math.sin(angle) * 0.1);
    root.rotation.z = Math.cos(angle) * 1.2;
    root.rotation.x = Math.sin(angle) * 1.2;
    group.add(root);
  }

  addNamePlate(group, data.name, 0x4a6e30);
  return group;
}

// ── NEEM — tall tree ──
function buildNeem(data) {
  const group = new THREE.Group();
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3825 });
  const leafMat  = new THREE.MeshLambertMaterial({ color: 0x1e5e18 });
  const leaf2Mat = new THREE.MeshLambertMaterial({ color: 0x267520 });

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.08, 0.15, 2.5, 8);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.25;
  group.add(trunk);

  // Upper trunk fork
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const forkGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.8, 6);
    const fork = new THREE.Mesh(forkGeo, trunkMat);
    fork.position.set(Math.cos(angle)*0.15, 2.8, Math.sin(angle)*0.15);
    fork.rotation.z = Math.cos(angle)*0.5;
    fork.rotation.x = Math.sin(angle)*0.5;
    group.add(fork);
  }

  // Canopy clusters
  const canopyPositions = [
    [0,3.4,0], [0.5,3.2,0.5],[-0.5,3.2,-0.5],[0.6,3.0,-0.4],
    [-0.4,3.1,0.6],[0,3.6,0.3],[0.3,3.5,-0.4]
  ];

  canopyPositions.forEach(([x, y, z]) => {
    const r = 0.55 + Math.random() * 0.35;
    const lMat = Math.random() > 0.5 ? leafMat : leaf2Mat;
    const geo = new THREE.SphereGeometry(r, 7, 6);
    const cluster = new THREE.Mesh(geo, lMat);
    cluster.position.set(x, y, z);
    cluster.scale.set(1, 0.75, 1);
    group.add(cluster);
  });

  // Dangling small leaf clusters
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r2 = 0.5 + Math.random() * 0.6;
    const leaf = makeOvalLeaf(leafMat, 0.08, 0.04);
    leaf.position.set(
      Math.cos(angle) * r2,
      2.8 + Math.random() * 0.8,
      Math.sin(angle) * r2
    );
    leaf.rotation.set(Math.random()*0.5, angle, Math.random()*0.3);
    group.add(leaf);
  }

  addNamePlate(group, data.name, 0x1e5e18, 0.2);
  return group;
}

// ── TURMERIC — rhizome plant with large leaves ──
function buildTurmeric(data) {
  const group = new THREE.Group();
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x2e7a30, side: THREE.DoubleSide });
  const rhizomeMat = new THREE.MeshLambertMaterial({ color: 0xe8a020 });
  const flowerMat = new THREE.MeshLambertMaterial({ color: 0xffe0b2 });

  // Rhizome at base
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const rGeo = new THREE.CapsuleGeometry(0.06, 0.2, 4, 6);
    const r = new THREE.Mesh(rGeo, rhizomeMat);
    r.position.set(Math.cos(angle) * 0.18, -0.02, Math.sin(angle) * 0.18);
    r.rotation.z = Math.cos(angle) * 1.3;
    r.rotation.x = Math.sin(angle) * 1.3;
    group.add(r);
  }

  // Large banana-like leaves emerging from center
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const leafH = 0.9 + Math.random() * 0.3;
    const leaf = makeLargeLeaf(leafMat, 0.22, leafH);
    leaf.position.set(Math.cos(angle) * 0.1, leafH * 0.5, Math.sin(angle) * 0.1);
    leaf.rotation.y = angle;
    leaf.rotation.z = Math.cos(angle) * 0.3;
    group.add(leaf);
  }

  // Central flower spike
  const spikeMat = new THREE.MeshLambertMaterial({ color: 0x6ab04c });
  const spikeGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.6, 5);
  const spike = new THREE.Mesh(spikeGeo, spikeMat);
  spike.position.y = 0.7;
  group.add(spike);

  for (let i = 0; i < 5; i++) {
    const fGeo = new THREE.SphereGeometry(0.06, 6, 5);
    const f = new THREE.Mesh(fGeo, flowerMat);
    f.position.set((Math.random()-0.5)*0.08, 0.8 + i*0.08, (Math.random()-0.5)*0.08);
    group.add(f);
  }

  addNamePlate(group, data.name, 0xe8a020);
  return group;
}

// ── BRAHMI — low creeping ground cover ──
function buildBrahmi(data) {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshLambertMaterial({ color: 0x5a9050 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x40c060, side: THREE.DoubleSide });
  const flowerMat = new THREE.MeshLambertMaterial({ color: 0xd0d8ff });

  // Creeping stems radiating outward
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const length = 0.4 + Math.random() * 0.3;

    // Stem segment
    const sGeo = new THREE.CylinderGeometry(0.008, 0.012, length, 4);
    const stem = new THREE.Mesh(sGeo, stemMat);
    stem.rotation.z = Math.PI / 2 - 0.1;
    stem.rotation.y = angle;
    stem.position.set(Math.cos(angle) * length/2, 0.04, Math.sin(angle) * length/2);
    group.add(stem);

    // Small round leaves along stem
    for (let j = 0; j < 4; j++) {
      const t = (j + 1) / 5;
      const lx = Math.cos(angle) * length * t;
      const lz = Math.sin(angle) * length * t;
      const lGeo = new THREE.CircleGeometry(0.07 + Math.random()*0.03, 8);
      const leaf = new THREE.Mesh(lGeo, leafMat);
      leaf.rotation.x = -Math.PI/2 + (Math.random()-0.5)*0.3;
      leaf.position.set(lx, 0.06, lz);
      group.add(leaf);

      // Occasional flower
      if (Math.random() > 0.6) {
        const fGeo = new THREE.CircleGeometry(0.04, 6);
        const f = new THREE.Mesh(fGeo, flowerMat);
        f.rotation.x = -Math.PI/2;
        f.position.set(lx, 0.09, lz);
        group.add(f);
      }
    }
  }

  addNamePlate(group, data.name, 0x40c060, -0.05);
  return group;
}

// ── ALOE VERA — succulent rosette ──
function buildAloeVera(data) {
  const group = new THREE.Group();
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x7abf8a, side: THREE.DoubleSide });
  const spotMat = new THREE.MeshLambertMaterial({ color: 0x8fd0a0 });
  const flowerMat = new THREE.MeshLambertMaterial({ color: 0xff7c3a });

  // Rosette of thick succulent leaves
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const outerR = i < 6 ? 0.35 : 0.15;
    const leafLen = i < 6 ? 0.65 : 0.45;
    const leafW = 0.12;

    // Thick aloe leaf shape
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(leafW, 0.1),
      new THREE.Vector2(leafW * 0.9, leafLen * 0.5),
      new THREE.Vector2(leafW * 0.4, leafLen),
      new THREE.Vector2(0, leafLen * 1.02),
    ];
    const shape = new THREE.Shape(points);
    const extGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: false
    });
    const leaf = new THREE.Mesh(extGeo, leafMat);
    leaf.position.set(Math.cos(angle) * 0.05, 0.05, Math.sin(angle) * 0.05);
    leaf.rotation.y = -angle + Math.PI / 2;
    leaf.rotation.z = (i < 6 ? 0.4 : 0.2) * Math.sign(Math.cos(angle));
    leaf.rotation.x = i < 6 ? -0.25 : -0.15;
    group.add(leaf);
  }

  // Flower spike
  const spikeGeo = new THREE.CylinderGeometry(0.015, 0.02, 1.0, 5);
  const spikeMat = new THREE.MeshLambertMaterial({ color: 0x6ab04c });
  const spike = new THREE.Mesh(spikeGeo, spikeMat);
  spike.position.y = 0.7;
  group.add(spike);

  // Orange tubular flowers
  for (let i = 0; i < 8; i++) {
    const fGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.1, 5);
    const f = new THREE.Mesh(fGeo, flowerMat);
    f.position.set(
      (Math.random()-0.5)*0.08,
      1.0 + i*0.06 - 0.25,
      (Math.random()-0.5)*0.08
    );
    group.add(f);
  }

  addNamePlate(group, data.name, 0x7abf8a);
  return group;
}

// ── GILOY — vine / climbing plant ──
function buildGiloy(data) {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshLambertMaterial({ color: 0x6b8c5a });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x2a7d3a, side: THREE.DoubleSide });
  const supportMat = new THREE.MeshLambertMaterial({ color: 0x7a6040 });

  // Wooden support stake
  const stakeGeo = new THREE.CylinderGeometry(0.025, 0.035, 1.5, 5);
  const stake = new THREE.Mesh(stakeGeo, supportMat);
  stake.position.y = 0.75;
  group.add(stake);

  // Climbing vine spiraling up the stake
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.15, 0.4, 0.1),
    new THREE.Vector3(-0.1, 0.8, 0.15),
    new THREE.Vector3(0.12, 1.2, -0.1),
    new THREE.Vector3(-0.08, 1.5, 0.08),
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 30, 0.012, 5, false);
  const vine = new THREE.Mesh(tubeGeo, stemMat);
  group.add(vine);

  // Heart-shaped leaves along vine
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const pos = curve.getPoint(t);
    const leaf = makeHeartLeaf(leafMat);
    leaf.position.copy(pos);
    leaf.position.x += (Math.random()-0.5) * 0.25;
    leaf.position.z += (Math.random()-0.5) * 0.25;
    leaf.rotation.y = Math.random() * Math.PI * 2;
    leaf.rotation.x = (Math.random()-0.5) * 0.6;
    leaf.scale.setScalar(0.8 + Math.random() * 0.6);
    group.add(leaf);
  }

  addNamePlate(group, data.name, 0x2a7d3a);
  return group;
}

// ── AMLA — small tree ──
function buildAmla(data) {
  const group = new THREE.Group();
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6b4823 });
  const leafMat  = new THREE.MeshLambertMaterial({ color: 0x3a8a3a, side: THREE.DoubleSide });
  const fruitMat = new THREE.MeshLambertMaterial({ color: 0x8db870 });

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.055, 0.1, 1.8, 7);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.9;
  group.add(trunk);

  // Branches
  const branchAngles = [0, 1.2, 2.4, 3.6, 4.8];
  branchAngles.forEach((angle, i) => {
    const bLen = 0.5 + Math.random() * 0.3;
    const bGeo = new THREE.CylinderGeometry(0.015, 0.03, bLen, 5);
    const branch = new THREE.Mesh(bGeo, trunkMat);
    branch.position.set(Math.cos(angle)*0.15, 1.6 + Math.random()*0.3, Math.sin(angle)*0.15);
    branch.rotation.z = Math.cos(angle) * 0.7;
    branch.rotation.x = Math.sin(angle) * 0.7;
    group.add(branch);

    // Pinnate leaves (many tiny)
    for (let j = 0; j < 14; j++) {
      const leafAngle = Math.random() * Math.PI * 2;
      const lGeo = new THREE.PlaneGeometry(0.06, 0.025);
      const leaf = new THREE.Mesh(lGeo, leafMat);
      leaf.position.set(
        Math.cos(angle)*(0.15+j*0.03),
        1.55 + j*0.03 + Math.random()*0.1,
        Math.sin(angle)*(0.15+j*0.03)
      );
      leaf.rotation.y = leafAngle;
      leaf.rotation.z = 0.2;
      group.add(leaf);
    }

    // Fruits
    for (let f = 0; f < 4; f++) {
      const fGeo = new THREE.SphereGeometry(0.04, 6, 5);
      const fruit = new THREE.Mesh(fGeo, fruitMat);
      fruit.position.set(
        Math.cos(angle)*0.35 + (Math.random()-0.5)*0.15,
        1.5 + Math.random()*0.4,
        Math.sin(angle)*0.35 + (Math.random()-0.5)*0.15
      );
      group.add(fruit);
    }
  });

  addNamePlate(group, data.name, 0x3a8a3a, 0.2);
  return group;
}

// ── PEPPERMINT — erect aromatic herb ──
function buildPeppermint(data) {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshLambertMaterial({ color: 0x7a3490 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x20c060, side: THREE.DoubleSide });
  const flowerMat = new THREE.MeshLambertMaterial({ color: 0x9b6cd8 });

  // Multiple square stems
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const r = 0.1;
    const stemH = 0.7 + Math.random() * 0.25;
    const sGeo = new THREE.BoxGeometry(0.025, stemH, 0.025);
    const stem = new THREE.Mesh(sGeo, stemMat);
    stem.position.set(Math.cos(angle)*r, stemH/2, Math.sin(angle)*r);
    stem.rotation.y = angle;
    group.add(stem);

    // Opposite leaf pairs at nodes
    const nodeCount = 5;
    for (let n = 0; n < nodeCount; n++) {
      const nodeY = stemH * (0.2 + n * 0.16);
      for (let side of [-1, 1]) {
        const leaf = makeOvalLeaf(leafMat, 0.13, 0.08);
        leaf.position.set(
          Math.cos(angle)*r + side * Math.sin(angle) * 0.12,
          nodeY,
          Math.sin(angle)*r + side * Math.cos(angle) * 0.12
        );
        leaf.rotation.y = angle + side * Math.PI/2;
        leaf.rotation.z = side * 0.3;
        group.add(leaf);
      }
    }

    // Flower whorls at top
    for (let w = 0; w < 3; w++) {
      for (let j = 0; j < 6; j++) {
        const fAngle = (j / 6) * Math.PI * 2;
        const fGeo = new THREE.SphereGeometry(0.018, 5, 4);
        const f = new THREE.Mesh(fGeo, flowerMat);
        f.position.set(
          Math.cos(angle)*r + Math.cos(fAngle)*0.05,
          stemH - 0.05 + w*0.06,
          Math.sin(angle)*r + Math.sin(fAngle)*0.05
        );
        group.add(f);
      }
    }
  }

  addNamePlate(group, data.name, 0x20c060);
  return group;
}

// ── CALENDULA — daisy-like flower ──
function buildCalendula(data) {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshLambertMaterial({ color: 0x5a7830 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x4a7025, side: THREE.DoubleSide });
  const petalMat = new THREE.MeshLambertMaterial({ color: 0xff7c10, side: THREE.DoubleSide });
  const centerMat = new THREE.MeshLambertMaterial({ color: 0xe65010 });
  const budMat = new THREE.MeshLambertMaterial({ color: 0xff9930 });

  // 3 flower stems
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const r = 0.12;
    const stemH = 0.6 + Math.random() * 0.25;

    const sGeo = new THREE.CylinderGeometry(0.015, 0.022, stemH, 5);
    const stem = new THREE.Mesh(sGeo, stemMat);
    stem.position.set(Math.cos(angle)*r, stemH/2, Math.sin(angle)*r);
    stem.rotation.z = Math.cos(angle)*0.15;
    group.add(stem);

    // Leaves on stem
    for (let j = 0; j < 3; j++) {
      const leaf = makeOvalLeaf(leafMat, 0.14, 0.06);
      leaf.position.set(Math.cos(angle)*r+(Math.random()-0.5)*0.08, stemH*(0.3+j*0.2), Math.sin(angle)*r);
      leaf.rotation.y = angle + (Math.random()-0.5)*0.5;
      leaf.rotation.z = (Math.random()-0.5)*0.5;
      group.add(leaf);
    }

    // Daisy flower at top
    const flowerX = Math.cos(angle)*r;
    const flowerZ = Math.sin(angle)*r;
    const flowerY = stemH;

    // Ray petals (orange)
    const petalCount = 16;
    for (let p = 0; p < petalCount; p++) {
      const pAngle = (p / petalCount) * Math.PI * 2;
      const pGeo = new THREE.PlaneGeometry(0.06, 0.17);
      const petal = new THREE.Mesh(pGeo, petalMat);
      petal.position.set(
        flowerX + Math.cos(pAngle) * 0.12,
        flowerY,
        flowerZ + Math.sin(pAngle) * 0.12
      );
      petal.rotation.y = -pAngle;
      petal.rotation.x = -Math.PI/2 + 0.2;
      group.add(petal);
    }

    // Center disc
    const discGeo = new THREE.CircleGeometry(0.075, 12);
    const disc = new THREE.Mesh(discGeo, centerMat);
    disc.rotation.x = -Math.PI/2;
    disc.position.set(flowerX, flowerY + 0.01, flowerZ);
    group.add(disc);
  }

  addNamePlate(group, data.name, 0xff7c10);
  return group;
}

// ── GENERIC PLANT (fallback) ──
function buildGenericPlant(data) {
  const group = new THREE.Group();
  const color = parseInt(data.colorHex.replace('#',''), 16);
  const mat = new THREE.MeshLambertMaterial({ color });
  const stemGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.8, 6);
  const stem = new THREE.Mesh(stemGeo, mat);
  stem.position.y = 0.4;
  group.add(stem);
  for (let i = 0; i < 6; i++) {
    const leaf = makeOvalLeaf(mat, 0.15, 0.1);
    const angle = (i/6)*Math.PI*2;
    leaf.position.set(Math.cos(angle)*0.2, 0.4+Math.random()*0.3, Math.sin(angle)*0.2);
    group.add(leaf);
  }
  addNamePlate(group, data.name, color);
  return group;
}

// ─────────────────────────────────────────────────────────
// GEOMETRY HELPERS
// ─────────────────────────────────────────────────────────

function makeOvalLeaf(mat, width, height) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width/2, 0, width/2, height*0.4, 0, height);
  shape.bezierCurveTo(-width/2, height*0.4, -width/2, 0, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 8);
  return new THREE.Mesh(geo, mat);
}

function makeLargeLeaf(mat, width, height) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width, 0, width*1.1, height*0.5, width*0.3, height);
  shape.bezierCurveTo(0, height, -width*0.3, height, -width*0.3, height);
  shape.bezierCurveTo(-width*1.1, height*0.5, -width, 0, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 10);
  return new THREE.Mesh(geo, mat);
}

function makeHeartLeaf(mat) {
  const shape = new THREE.Shape();
  const s = 0.15;
  shape.moveTo(0, -s);
  shape.bezierCurveTo(-s*2, -s*2, -s*3, s, -s, s*1.5);
  shape.lineTo(0, s*2.5);
  shape.lineTo(s, s*1.5);
  shape.bezierCurveTo(s*3, s, s*2, -s*2, 0, -s);
  const geo = new THREE.ShapeGeometry(shape, 10);
  return new THREE.Mesh(geo, mat);
}

// ── Floating name plate below plant ──
function addNamePlate(group, name, color, yOffset = 0) {
  // Create a canvas texture for the name
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(10, 25, 12, 0.82)';
  ctx.beginPath();
  ctx.roundRect(4, 4, 248, 56, 12);
  ctx.fill();

  ctx.strokeStyle = `#${color.toString(16).padStart(6,'0')}`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(4, 4, 248, 56, 12);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  const planeGeo = new THREE.PlaneGeometry(0.9, 0.22);
  const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  const plate = new THREE.Mesh(planeGeo, planeMat);
  plate.position.set(0, yOffset - 0.15, 0);
  plate.rotation.x = -Math.PI / 8;
  plate.userData.isNamePlate = true;
  group.add(plate);
}

// ── Floating plant label (larger, visible from distance) ──
function addPlantLabel(state, group, data) {
  // Small floating marker above plant
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Glowing dot
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  const c = parseInt(data.colorHex.replace('#',''), 16);
  const r = ((c >> 16) & 255);
  const g = ((c >> 8) & 255);
  const b = (c & 255);
  gradient.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
  gradient.addColorStop(0.5, `rgba(${r},${g},${b},0.4)`);
  gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(0.5, 0.5);
  const mat = new THREE.MeshBasicMaterial({
    map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide
  });
  const sprite = new THREE.Mesh(geo, mat);
  sprite.position.y = 2.2;
  sprite.userData.isMarker = true;
  group.add(sprite);
}
