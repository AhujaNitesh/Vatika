const fs = require('fs');

['neuro', 'skincare', 'immunity', 'respiratory', 'digestive'].forEach(m => {
  const filePath = 'assets/maps/' + m + '/index.html';
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace buildDetailedPlantMesh with immediate placeholder + async GLB swap
  const oldFuncStart = "function buildDetailedPlantMesh(data) {\n      const grp = new THREE.Group();";
  const newFuncStart = `function buildDetailedPlantMesh(data) {
      const grp = new THREE.Group();
      const proceduralMesh = buildProceduralPlantMesh(data);
      proceduralMesh.name = 'placeholder';
      grp.add(proceduralMesh);`;

  if (content.includes(oldFuncStart) && !content.includes("proceduralMesh.name = 'placeholder'")) {
    content = content.replace(oldFuncStart, newFuncStart);

    // Update loader success callback to remove placeholder
    const oldSuccess = "grp.add(model);";
    const newSuccess = `const ph = grp.getObjectByName('placeholder');
            if (ph) grp.remove(ph);
            grp.add(model);`;

    if (content.includes(oldSuccess)) {
      content = content.replace(oldSuccess, newSuccess);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Updated smooth 3D GLB model loading & instant plant visibility in:', filePath);
  }
});
