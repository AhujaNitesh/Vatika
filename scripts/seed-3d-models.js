const { getPool, checkConnection } = require('../config/db');

const models = [
  { plant_id: 11, file_url: '/3-D Models/tulsi.glb', caption: 'Interactive 3D GLB Model of Tulsi' },
  { plant_id: 12, file_url: '/3-D Models/ashwagandha.glb', caption: 'Interactive 3D GLB Model of Ashwagandha' },
  { plant_id: 25, file_url: '/3-D Models/bacopa_monnieri_plant.glb', caption: 'Interactive 3D GLB Model of Brahmi' },
  { plant_id: 31, file_url: '/3-D Models/centella.glb', caption: 'Interactive 3D GLB Model of Gotu Kola / Mandukaparni' },
  { plant_id: 28, file_url: '/3-D Models/chamomile.glb', caption: 'Interactive 3D GLB Model of Chamomile' },
  { plant_id: 34, file_url: '/3-D Models/clove.glb', caption: 'Interactive 3D GLB Model of Clove' },
  { plant_id: 27, file_url: '/3-D Models/jatamansi.glb', caption: 'Interactive 3D GLB Model of Jatamansi' },
  { plant_id: 29, file_url: '/3-D Models/lavender.glb', caption: 'Interactive 3D GLB Model of Lavender' },
  { plant_id: 36, file_url: '/3-D Models/thyme_bush.glb', caption: 'Interactive 3D GLB Model of Thyme' },
  { plant_id: 22, file_url: '/3-D Models/Hibiscus rosa-sinensis.glb', caption: 'Interactive 3D GLB Model of Hibiscus' },
  { plant_id: 21, file_url: '/3-D Models/Jasmine Jasminum spp.glb', caption: 'Interactive 3D GLB Model of Jasmine' },
  { plant_id: 20, file_url: '/3-D Models/Rose Rosa spp.glb', caption: 'Interactive 3D GLB Model of Rose' }
];

async function seed3DModels() {
  const isConnected = await checkConnection();
  if (!isConnected) {
    console.error('[3D Seeder] Cannot connect to MySQL.');
    return;
  }

  const pool = getPool();
  console.log('[3D Seeder] Inserting 3D GLB model URLs into Aiven Cloud MySQL Media table...');

  for (const m of models) {
    const [existing] = await pool.query(
      `SELECT * FROM Media WHERE plant_id = ? AND media_type = '3D_Model'`,
      [m.plant_id]
    );

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO Media (plant_id, plant_part, media_type, file_url, caption) VALUES (?, 'General', '3D_Model', ?, ?)`,
        [m.plant_id, m.file_url, m.caption]
      );
      console.log(`[3D Seeder] Added 3D_Model for plant_id ${m.plant_id}: ${m.file_url}`);
    } else {
      await pool.query(
        `UPDATE Media SET file_url = ?, caption = ? WHERE plant_id = ? AND media_type = '3D_Model'`,
        [m.file_url, m.caption, m.plant_id]
      );
      console.log(`[3D Seeder] Updated 3D_Model for plant_id ${m.plant_id}: ${m.file_url}`);
    }
  }

  console.log('[3D Seeder] Successfully seeded all 12 3D GLB models into Aiven Cloud MySQL!');
}

if (require.main === module) {
  seed3DModels().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seed3DModels };
