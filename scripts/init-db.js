const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { dbConfig } = require('../config/db');

function splitSqlStatementsRespectQuotes(sql) {
  const statements = [];
  let current = '';
  let inString = false;
  let escape = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    if (escape) {
      current += char;
      escape = false;
      continue;
    }

    if (char === '\\') {
      current += char;
      escape = true;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      current += char;
      continue;
    }

    if (char === ';' && !inString) {
      if (current.trim()) {
        statements.push(current.trim());
      }
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

async function initDatabase() {
  console.log('--- Vatika Live Cloud MySQL Seeder Utility ---');
  const sqlFilePath = path.join(__dirname, '..', 'info_db', 'HERBAL_PLANTS.sql');

  if (!fs.existsSync(sqlFilePath)) {
    console.error(`[Error] SQL file not found at path: ${sqlFilePath}`);
    return false;
  }

  console.log(`Reading SQL script from: ${sqlFilePath}`);
  const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

  const statements = splitSqlStatementsRespectQuotes(sqlScript);
  console.log(`Parsed ${statements.length} quote-safe SQL statements to execute.`);

  console.log(`Connecting to Cloud MySQL server at ${dbConfig.host}:${dbConfig.port}...`);

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected! Executing schema DDL and plant seed data on Aiven Cloud MySQL...');

    let executed = 0;
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      // Skip empty or comment-only statements
      const clean = stmt.replace(/^--.*$/gm, '').trim();
      if (!clean) continue;

      try {
        await connection.query(stmt);
        executed++;
      } catch (err) {
        console.warn(`[SQL Notice] Statement ${i + 1} warning (${err.message}).`);
      }
    }

    console.log(`✅ Successfully executed ${executed} statements on Aiven Cloud MySQL!`);
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Cloud MySQL database:', error.message);
    return false;
  }
}

if (require.main === module) {
  initDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { initDatabase };
