const fs = require('fs');

['neuro', 'skincare', 'immunity', 'respiratory', 'digestive'].forEach(m => {
  const filePath = 'assets/maps/' + m + '/index.html';
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix plantsToRender mapping in createBotanicalPlants to include media, anatomy, and rawPlantData
  const oldMapPattern = `ayushSystem: (p.traditional_systems || []).map(s => s.system_name),`;
  const newMapPattern = `ayushSystem: (p.traditional_systems || []).map(s => s.system_name),
            media: p.media || [],
            anatomy: p.anatomy || {},
            rawPlantData: p,`;

  if (content.includes(oldMapPattern) && !content.includes('media: p.media')) {
    content = content.replace(oldMapPattern, newMapPattern);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Added media & DB fields mapping in:', filePath);
  }
});
