#!/usr/bin/env npx tsx
/**
 * CLEAN-DB - Limpia todas las tablas de la base de datos
 *
 * Uso:
 *   npx tsx clean-db.ts
 */

import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

// Leer .env del backend
const envPath = path.join(__dirname, '..', 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parsear DATABASE_URL
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
if (!dbUrlMatch) {
  console.error('No se encontró DATABASE_URL en .env');
  process.exit(1);
}

const dbUrl = dbUrlMatch[1].trim();
// mysql+aiomysql://user:pass@host:port/dbname
const urlMatch = dbUrl.match(/mysql\+aiomysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  console.error('Formato de DATABASE_URL inválido');
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

async function cleanDatabase() {
  console.log('\n🗑️  CLEAN-DB - Limpiando base de datos...\n');
  console.log(`   Host: ${host}`);
  console.log(`   Database: ${database}\n`);

  const connection = await mysql.createConnection({
    host,
    port: parseInt(port),
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Deshabilitar foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Obtener todas las tablas
    const [tables] = await connection.execute(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`,
      [database]
    ) as any;

    if (tables.length === 0) {
      console.log('   ✓ La base de datos ya está vacía\n');
    } else {
      console.log(`   Borrando ${tables.length} tablas:\n`);

      for (const row of tables) {
        const tableName = row.TABLE_NAME || row.table_name;
        console.log(`   • DROP TABLE ${tableName}`);
        await connection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
      }

      console.log('\n   ✓ Todas las tablas eliminadas\n');
    }

    // Rehabilitar foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

cleanDatabase();
