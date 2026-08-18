const fs = require('fs');
const path = require('path');

let mockData = null;

function loadMockDataFromSql() {
  if (mockData) return mockData;

  const sqlFilePath = path.join(__dirname, '..', 'info_db', 'HERBAL_PLANTS.sql');
  if (!fs.existsSync(sqlFilePath)) {
    console.warn('[Mock DB] HERBAL_PLANTS.sql not found.');
    return { plants: [], categories: [], systems: [], media: [] };
  }

  const content = fs.readFileSync(sqlFilePath, 'utf8');

  // Parse Categories
  const categories = [
    { use_id: 1, category_name: 'Digestive Health', description: 'Plants promoting gut health, digestion, appetite, and metabolic support' },
    { use_id: 2, category_name: 'Immunity & General Wellness', description: 'Rasayana herbs that strengthen the immune response and vitality' },
    { use_id: 3, category_name: 'Skin Care', description: 'Herbs that cleanse the blood, reduce inflammation, and enhance skin radiance' },
    { use_id: 4, category_name: 'Mental Wellness & Stress', description: 'Medhya Rasayanas that reduce anxiety, boost memory, and relieve stress' },
    { use_id: 5, category_name: 'Respiratory Wellness', description: 'Plants used for throat relief, bronchodilation, and respiratory immunity' }
  ];

  // Parse Systems
  const systems = [
    { system_id: 1, system_name: 'Ayurveda' },
    { system_id: 2, system_name: 'Yoga & Naturopathy' },
    { system_id: 3, system_name: 'Unani' },
    { system_id: 4, system_name: 'Siddha' },
    { system_id: 5, system_name: 'Homeopathy' }
  ];

  // Parse Plant Insert Lines
  const plants = [];
  const plantRegex = /\((\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g;

  let match;
  while ((match = plantRegex.exec(content)) !== null) {
    plants.push({
      plant_id: parseInt(match[1], 10),
      common_name: match[2],
      botanical_name: match[3],
      sanskrit_name: match[4],
      hindi_regional_name: match[5],
      plant_family: match[6],
      plant_type: match[7],
      geographic_distribution: match[8],
      climate: match[9],
      soil_requirements: match[10],
      overall_traditional_uses: match[11],
      cultivation_method: match[12],
      created_at: new Date().toISOString()
    });
  }

  // Category Link Map (Category ID -> Plant IDs)
  const categoryPlantMap = {
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    2: [11, 12, 3, 13, 14, 2, 15, 16, 38, 17, 39],
    3: [13, 2, 18, 19, 20, 21, 22, 23, 24, 17],
    4: [25, 12, 26, 27, 11, 28, 29, 30, 20, 31],
    5: [11, 1, 9, 32, 10, 33, 34, 35, 36, 37]
  };

  // Attach Categories & Systems to plants
  plants.forEach(plant => {
    plant.medicinal_uses = [];
    plant.traditional_systems = [{ system_id: 1, system_name: 'Ayurveda' }];

    // Attach categories based on mapping
    for (const [useId, pIds] of Object.entries(categoryPlantMap)) {
      if (pIds.includes(plant.plant_id)) {
        const catObj = categories.find(c => c.use_id === parseInt(useId, 10));
        if (catObj) plant.medicinal_uses.push(catObj);
      }
    }

    // Default image file matching plant common_name
    const imageName = plant.common_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    plant.media = [
      {
        media_id: plant.plant_id,
        plant_part: 'General',
        media_type: 'Image',
        file_url: `assets/images/${imageName}.jpg`,
        caption: `${plant.common_name} (${plant.botanical_name})`
      }
    ];

    plant.anatomy = {
      leaf: { leaf_shape: 'Lanceolate', leaf_colour: 'Green', traditional_uses: plant.overall_traditional_uses, is_traditionally_consumed: true },
      flower: { flower_colour: 'White/Yellow', fragrance: 'Fragrant', is_used_traditionally: true },
      stem: { stem_type: 'Herbaceous', stem_colour: 'Green', woody_or_herbaceous: 'Herbaceous' },
      root: { root_type: 'Taproot', aroma_taste: 'Aromatic' },
      fruit: { fruit_type: 'Medicinal', taste_description: 'Bitter/Aromatic' },
      seed: { seed_shape: 'Small', seed_colour: 'Brown' }
    };
  });

  mockData = {
    plants,
    categories,
    systems,
    tours: [
      {
        tour_id: 1,
        tour_name: 'Digestive & Metabolic Wisdom Tour',
        theme: 'Agni Deepana',
        description: 'Guided exploration of herbs targeting digestive fire and metabolism',
        plants: plants.filter(p => [1, 2, 3, 4, 5].includes(p.plant_id))
      },
      {
        tour_id: 2,
        tour_name: 'Immunity & Rejuvenation Tour',
        theme: 'Rasayana',
        description: 'Guided tour of adaptogens and immune-modulating flora',
        plants: plants.filter(p => [11, 12, 13, 17, 39].includes(p.plant_id))
      }
    ]
  };

  return mockData;
}

module.exports = {
  loadMockDataFromSql
};
