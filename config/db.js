const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function getDbConfig() {
  const databaseUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

  let config = {};

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      config = {
        host: url.hostname,
        port: parseInt(url.port || '3306', 10),
        user: url.username,
        password: url.password,
        database: url.pathname.replace(/^\//, '')
      };
    } catch (e) {
      console.warn('[MySQL Warning] Failed to parse DATABASE_URL, using individual env vars.');
    }
  }

  if (!config.host) {
    config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'virtual_herbal_garden'
    };
  }

  config.waitForConnections = true;
  config.connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10);
  config.queueLimit = 0;
  config.multipleStatements = true;

  // Cloud SSL Certificate Support (info_db/ca.pem)
  const caPaths = [
    path.join(__dirname, '..', 'info_db', 'ca.pem'),
    path.join(__dirname, '..', 'ca.pem')
  ];

  let caCert = null;
  for (const caPath of caPaths) {
    if (fs.existsSync(caPath)) {
      caCert = fs.readFileSync(caPath);
      console.log(`[SSL] Using CA certificate from ${caPath}`);
      break;
    }
  }

  if (caCert) {
    config.ssl = {
      ca: caCert,
      rejectUnauthorized: true
    };
  } else if (process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production') {
    config.ssl = {
      rejectUnauthorized: false
    };
  }

  return config;
}

const dbConfig = getDbConfig();
let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

async function query(sql, params) {
  const connectionPool = getPool();
  const [rows] = await connectionPool.execute(sql, params);
  return rows;
}

async function checkConnection() {
  try {
    const connectionPool = getPool();
    const connection = await connectionPool.getConnection();
    console.log(`[MySQL] Connected successfully to database '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (err) {
    console.warn(`[MySQL Warning] Connection failed (${err.code || err.message}).`);
    return false;
  }
}

async function autoSeedIfEmpty() {
  const isConnected = await checkConnection();
  if (!isConnected) return false;

  try {
    const pool = getPool();
    const [rows] = await pool.query("SHOW TABLES LIKE 'Plant'");
    if (rows.length === 0) {
      console.log('🌱 Production MySQL database is empty. Executing auto-seeder from HERBAL_PLANTS.sql...');
      const sqlPath = path.join(__dirname, '..', 'info_db', 'HERBAL_PLANTS.sql');
      if (fs.existsSync(sqlPath)) {
        const sqlScript = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sqlScript);
        console.log('✅ Production MySQL database seeded successfully with 39 plants and tables!');
        return true;
      }
    }
  } catch (err) {
    console.error('[Auto-Seed Warning]', err.message);
  }
  return false;
}

async function ensureUserAuthSchema() {
  const isConnected = await checkConnection();
  if (!isConnected) return false;

  try {
    const pool = getPool();
    const [userTableExists] = await pool.query("SHOW TABLES LIKE 'User'");
    if (userTableExists.length === 0) {
      console.log('[Auth Migration] Creating User table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS User (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NULL,
          full_name VARCHAR(150) NULL,
          role VARCHAR(50) DEFAULT 'student',
          google_id VARCHAR(255) NULL UNIQUE,
          reset_token VARCHAR(255) NULL,
          reset_token_expires DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ [Auth Migration] User table created.');
      return true;
    }

    const [columns] = await pool.query("DESCRIBE User");
    const colNames = columns.map(c => c.Field);

    // Ensure password_hash allows NULL for Google OAuth accounts
    const passCol = columns.find(c => c.Field === 'password_hash');
    if (passCol && passCol.Null === 'NO') {
      console.log('[Auth Migration] Modifying password_hash column to allow NULL for Google OAuth users...');
      await pool.query("ALTER TABLE User MODIFY COLUMN password_hash VARCHAR(255) NULL");
    }

    const alterations = [];
    if (!colNames.includes('full_name')) alterations.push("ADD COLUMN full_name VARCHAR(150) NULL");
    if (!colNames.includes('role')) alterations.push("ADD COLUMN role VARCHAR(50) DEFAULT 'student'");
    if (!colNames.includes('google_id')) alterations.push("ADD COLUMN google_id VARCHAR(255) NULL UNIQUE");
    if (!colNames.includes('reset_token')) alterations.push("ADD COLUMN reset_token VARCHAR(255) NULL");
    if (!colNames.includes('reset_token_expires')) alterations.push("ADD COLUMN reset_token_expires DATETIME NULL");

    if (alterations.length > 0) {
      console.log(`[Auth Migration] Adding missing User table columns: ${alterations.join(', ')}`);
      await pool.query(`ALTER TABLE User ${alterations.join(', ')}`);
      console.log('✅ [Auth Migration] User table schema updated successfully.');
    }
    return true;
  } catch (err) {
    console.error('[Auth Migration Error]', err.message);
    return false;
  }
}

module.exports = {
  getPool,
  query,
  checkConnection,
  autoSeedIfEmpty,
  ensureUserAuthSchema,
  dbConfig
};
