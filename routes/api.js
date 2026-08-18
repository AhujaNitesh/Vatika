const express = require('express');
const router = express.Router();
const { getPool, checkConnection } = require('../config/db');
const { loadMockDataFromSql } = require('../config/mock-db');
const { initDatabase } = require('../scripts/init-db');

const sanitizeId = (id) => parseInt(id, 10) || 0;

// Garden mapping definitions matching user's 50 plants structure
const GARDEN_PLANT_MAP = {
  digestive: {
    category_name: 'Digestive Health',
    plant_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  immunity: {
    category_name: 'Immunity & General Wellness',
    plant_ids: [11, 12, 39, 3, 13, 14, 2, 15, 38, 16] // Kalmegh (38) replacing duplicate Giloy/Guduchi
  },
  skincare: {
    category_name: 'Skin Care',
    plant_ids: [17, 13, 2, 18, 19, 20, 21, 22, 23, 24]
  },
  neuro: {
    category_name: 'Mental Wellness & Stress',
    plant_ids: [25, 12, 26, 27, 11, 28, 29, 30, 20, 31]
  },
  respiratory: {
    category_name: 'Respiratory Wellness',
    plant_ids: [11, 1, 9, 32, 10, 33, 34, 35, 36, 37]
  }
};

// GET /api/config - Public Environment Configuration
router.get('/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null
  });
});

// GET /api/status - DB Connection Check
router.get('/status', async (req, res) => {
  const isConnected = await checkConnection();
  if (isConnected) {
    try {
      const pool = getPool();
      const [rows] = await pool.query('SELECT COUNT(*) AS total_plants FROM Plant');
      return res.json({
        status: 'ok',
        connected: true,
        source: 'MySQL Live Database (Aiven Cloud)',
        database: process.env.DB_NAME || 'virtual_herbal_garden',
        total_plants: rows[0].total_plants
      });
    } catch (err) {
      return res.json({ status: 'warning', connected: true, source: 'Fallback SQL Data (In-Memory)', message: err.message });
    }
  } else {
    const mock = loadMockDataFromSql();
    return res.json({
      status: 'notice',
      connected: false,
      source: 'Parsed SQL Data (In-Memory Fallback)',
      total_plants: mock.plants.length,
      message: 'MySQL server is not connected. Serving 39 plant details parsed directly from info_db/HERBAL_PLANTS.sql.'
    });
  }
});

// GET /api/gardens/:gardenType - Get 10 specific plants for garden bed
router.get('/gardens/:gardenType', async (req, res) => {
  const gardenKey = req.params.gardenType.toLowerCase();
  const gardenInfo = GARDEN_PLANT_MAP[gardenKey] || GARDEN_PLANT_MAP.digestive;

  const isConnected = await checkConnection();
  if (isConnected) {
    try {
      const pool = getPool();
      const placeholders = gardenInfo.plant_ids.map(() => '?').join(',');
      const [plants] = await pool.query(
        `SELECT * FROM Plant WHERE plant_id IN (${placeholders}) ORDER BY FIELD(plant_id, ${placeholders})`,
        [...gardenInfo.plant_ids, ...gardenInfo.plant_ids]
      );

      for (let plant of plants) {
        const [uses] = await pool.query(
          `SELECT mu.use_id, mu.category_name FROM MedicinalUse mu JOIN Plant_MedicinalUse pmu ON mu.use_id = pmu.use_id WHERE pmu.plant_id = ?`,
          [plant.plant_id]
        );
        const [systems] = await pool.query(
          `SELECT ts.system_id, ts.system_name FROM TraditionalSystem ts JOIN Plant_TraditionalSystem pts ON ts.system_id = pts.system_id WHERE pts.plant_id = ?`,
          [plant.plant_id]
        );
        const [media] = await pool.query(
          `SELECT media_id, plant_part, media_type, file_url, caption FROM Media WHERE plant_id = ?`,
          [plant.plant_id]
        );

        const [leaves] = await pool.query('SELECT * FROM Leaf WHERE plant_id = ?', [plant.plant_id]);
        const [flowers] = await pool.query('SELECT * FROM Flower WHERE plant_id = ?', [plant.plant_id]);
        const [stems] = await pool.query('SELECT * FROM Stem WHERE plant_id = ?', [plant.plant_id]);
        const [barks] = await pool.query('SELECT * FROM Bark WHERE plant_id = ?', [plant.plant_id]);
        const [roots] = await pool.query('SELECT * FROM Root WHERE plant_id = ?', [plant.plant_id]);
        const [fruits] = await pool.query('SELECT * FROM Fruit WHERE plant_id = ?', [plant.plant_id]);
        const [seeds] = await pool.query('SELECT * FROM Seed WHERE plant_id = ?', [plant.plant_id]);

        plant.medicinal_uses = uses;
        plant.traditional_systems = systems;
        plant.media = media;
        plant.anatomy = {
          leaf: leaves[0] || null,
          flower: flowers[0] || null,
          stem: stems[0] || null,
          bark: barks[0] || null,
          root: roots[0] || null,
          fruit: fruits[0] || null,
          seed: seeds[0] || null
        };
      }

      return res.json({
        status: 'success',
        source: 'MySQL Live Database (Aiven Cloud)',
        garden: gardenKey,
        category_name: gardenInfo.category_name,
        count: plants.length,
        data: plants
      });
    } catch (err) {
      console.warn('[API Warning] Garden live MySQL error, fallback to memory:', err.message);
    }
  }

  // Fallback
  const mock = loadMockDataFromSql();
  const plants = mock.plants.filter(p => gardenInfo.plant_ids.includes(p.plant_id));

  res.json({
    status: 'success',
    source: 'Parsed SQL Data (In-Memory Fallback)',
    garden: gardenKey,
    category_name: gardenInfo.category_name,
    count: plants.length,
    data: plants
  });
});

// GET /api/plants - Get plants list
router.get('/plants', async (req, res) => {
  const { q, category, system, garden, limit = 50, offset = 0 } = req.query;
  const isConnected = await checkConnection();

  const cleanLimit = Math.max(1, parseInt(limit, 10) || 50);
  const cleanOffset = Math.max(0, parseInt(offset, 10) || 0);

  if (isConnected) {
    try {
      const pool = getPool();
      let sql = `
        SELECT DISTINCT 
          p.plant_id,
          p.common_name,
          p.botanical_name,
          p.sanskrit_name,
          p.hindi_regional_name,
          p.plant_family,
          p.plant_type,
          p.overall_traditional_uses,
          p.climate,
          p.created_at
        FROM Plant p
        LEFT JOIN Plant_MedicinalUse pmu ON p.plant_id = pmu.plant_id
        LEFT JOIN MedicinalUse mu ON pmu.use_id = mu.use_id
        LEFT JOIN Plant_TraditionalSystem pts ON p.plant_id = pts.plant_id
        LEFT JOIN TraditionalSystem ts ON pts.system_id = ts.system_id
        WHERE 1=1
      `;
      const params = [];

      if (q) {
        sql += ` AND (p.common_name LIKE ? OR p.botanical_name LIKE ? OR p.sanskrit_name LIKE ? OR p.hindi_regional_name LIKE ? OR p.overall_traditional_uses LIKE ?)`;
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (category) {
        sql += ` AND (mu.category_name LIKE ? OR mu.use_id = ?)`;
        params.push(`%${category}%`, sanitizeId(category));
      }

      if (system) {
        sql += ` AND (ts.system_name LIKE ? OR ts.system_id = ?)`;
        params.push(`%${system}%`, sanitizeId(system));
      }

      if (garden) {
        const info = GARDEN_PLANT_MAP[garden.toLowerCase()];
        if (info) {
          const placeholders = info.plant_ids.map(() => '?').join(',');
          sql += ` AND p.plant_id IN (${placeholders})`;
          params.push(...info.plant_ids);
        }
      }

      sql += ` ORDER BY p.plant_id ASC LIMIT ${cleanLimit} OFFSET ${cleanOffset}`;

      const [plants] = await pool.query(sql, params);

      for (let plant of plants) {
        const [uses] = await pool.query(
          `SELECT mu.use_id, mu.category_name FROM MedicinalUse mu JOIN Plant_MedicinalUse pmu ON mu.use_id = pmu.use_id WHERE pmu.plant_id = ?`,
          [plant.plant_id]
        );
        const [systems] = await pool.query(
          `SELECT ts.system_id, ts.system_name FROM TraditionalSystem ts JOIN Plant_TraditionalSystem pts ON ts.system_id = pts.system_id WHERE pts.plant_id = ?`,
          [plant.plant_id]
        );
        const [media] = await pool.query(
          `SELECT media_id, plant_part, media_type, file_url, caption FROM Media WHERE plant_id = ?`,
          [plant.plant_id]
        );

        plant.medicinal_uses = uses;
        plant.traditional_systems = systems;
        plant.media = media;
      }

      return res.json({
        status: 'success',
        source: 'MySQL Live Database (Aiven Cloud)',
        count: plants.length,
        data: plants
      });
    } catch (err) {
      console.warn('[API Warning] Live MySQL query error, using SQL file fallback:', err.message);
    }
  }

  // Fallback
  const mock = loadMockDataFromSql();
  let result = [...mock.plants];

  if (q) {
    const term = q.toLowerCase();
    result = result.filter(p =>
      p.common_name.toLowerCase().includes(term) ||
      p.botanical_name.toLowerCase().includes(term) ||
      p.sanskrit_name.toLowerCase().includes(term) ||
      p.overall_traditional_uses.toLowerCase().includes(term)
    );
  }

  if (garden) {
    const info = GARDEN_PLANT_MAP[garden.toLowerCase()];
    if (info) {
      result = result.filter(p => info.plant_ids.includes(p.plant_id));
    }
  }

  res.json({
    status: 'success',
    source: 'Parsed SQL Data (In-Memory Fallback)',
    count: result.length,
    data: result.slice(cleanOffset, cleanOffset + cleanLimit)
  });
});

// GET /api/search - Quick Search
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.json({ status: 'success', count: 0, data: [] });
  }

  const isConnected = await checkConnection();
  if (isConnected) {
    try {
      const pool = getPool();
      const searchTerm = `%${q}%`;
      const [rows] = await pool.query(
        `SELECT plant_id, common_name, botanical_name, sanskrit_name, hindi_regional_name, overall_traditional_uses 
         FROM Plant 
         WHERE common_name LIKE ? OR botanical_name LIKE ? OR sanskrit_name LIKE ? OR hindi_regional_name LIKE ? OR overall_traditional_uses LIKE ?
         LIMIT 20`,
        [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
      );
      return res.json({ status: 'success', source: 'MySQL Live Database (Aiven Cloud)', query: q, count: rows.length, data: rows });
    } catch (err) {}
  }

  const mock = loadMockDataFromSql();
  const term = q.toLowerCase();
  const rows = mock.plants.filter(p =>
    p.common_name.toLowerCase().includes(term) ||
    p.botanical_name.toLowerCase().includes(term) ||
    p.sanskrit_name.toLowerCase().includes(term) ||
    p.overall_traditional_uses.toLowerCase().includes(term)
  );

  res.json({ status: 'success', source: 'Parsed SQL Data (In-Memory Fallback)', query: q, count: rows.length, data: rows });
});

// GET /api/plants/:id - Single Plant Details with full anatomy
router.get('/plants/:id', async (req, res) => {
  const plantId = sanitizeId(req.params.id);
  const isConnected = await checkConnection();

  if (isConnected) {
    try {
      const pool = getPool();
      let [rows] = [];
      if (plantId > 0) {
        [rows] = await pool.query('SELECT * FROM Plant WHERE plant_id = ?', [plantId]);
      } else {
        [rows] = await pool.query('SELECT * FROM Plant WHERE botanical_name = ? OR common_name = ?', [req.params.id, req.params.id]);
      }

      if (rows.length > 0) {
        const plant = rows[0];
        const pid = plant.plant_id;

        const [leaves] = await pool.query('SELECT * FROM Leaf WHERE plant_id = ?', [pid]);
        const [flowers] = await pool.query('SELECT * FROM Flower WHERE plant_id = ?', [pid]);
        const [stems] = await pool.query('SELECT * FROM Stem WHERE plant_id = ?', [pid]);
        const [barks] = await pool.query('SELECT * FROM Bark WHERE plant_id = ?', [pid]);
        const [roots] = await pool.query('SELECT * FROM Root WHERE plant_id = ?', [pid]);
        const [fruits] = await pool.query('SELECT * FROM Fruit WHERE plant_id = ?', [pid]);
        const [seeds] = await pool.query('SELECT * FROM Seed WHERE plant_id = ?', [pid]);

        const [systems] = await pool.query(
          'SELECT ts.* FROM TraditionalSystem ts JOIN Plant_TraditionalSystem pts ON ts.system_id = pts.system_id WHERE pts.plant_id = ?',
          [pid]
        );
        const [uses] = await pool.query(
          'SELECT mu.* FROM MedicinalUse mu JOIN Plant_MedicinalUse pmu ON mu.use_id = pmu.use_id WHERE pmu.plant_id = ?',
          [pid]
        );
        const [media] = await pool.query('SELECT * FROM Media WHERE plant_id = ?', [pid]);

        plant.anatomy = {
          leaf: leaves[0] || null,
          flower: flowers[0] || null,
          stem: stems[0] || null,
          bark: barks[0] || null,
          root: roots[0] || null,
          fruit: fruits[0] || null,
          seed: seeds[0] || null
        };
        plant.traditional_systems = systems;
        plant.medicinal_uses = uses;
        plant.media = media;

        return res.json({ status: 'success', source: 'MySQL Live Database (Aiven Cloud)', data: plant });
      }
    } catch (err) {}
  }

  const mock = loadMockDataFromSql();
  const plant = mock.plants.find(p => p.plant_id === plantId || p.common_name.toLowerCase() === req.params.id.toLowerCase() || p.botanical_name.toLowerCase() === req.params.id.toLowerCase());

  if (plant) {
    return res.json({ status: 'success', source: 'Parsed SQL Data (In-Memory Fallback)', data: plant });
  }

  res.status(404).json({ status: 'error', message: 'Plant not found' });
});

// GET /api/categories
router.get('/categories', async (req, res) => {
  const isConnected = await checkConnection();
  if (isConnected) {
    try {
      const pool = getPool();
      const [categories] = await pool.query('SELECT * FROM MedicinalUse ORDER BY use_id');
      const [systems] = await pool.query('SELECT * FROM TraditionalSystem ORDER BY system_id');
      return res.json({ status: 'success', source: 'MySQL Live Database (Aiven Cloud)', medicinal_use_categories: categories, traditional_systems: systems });
    } catch (err) {}
  }

  const mock = loadMockDataFromSql();
  res.json({ status: 'success', source: 'Parsed SQL Data (In-Memory Fallback)', medicinal_use_categories: mock.categories, traditional_systems: mock.systems });
});

// GET /api/tours
router.get('/tours', async (req, res) => {
  const mock = loadMockDataFromSql();
  res.json({ status: 'success', count: mock.tours.length, data: mock.tours });
});

// POST /api/init-db
router.post('/init-db', async (req, res) => {
  try {
    const success = await initDatabase();
    if (success) {
      res.json({ status: 'success', message: 'Database initialized and seeded successfully.' });
    } else {
      res.status(500).json({ status: 'error', message: 'Failed to initialize database. Check MySQL server status.' });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
