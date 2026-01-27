/**
 * Genera schema.json con estructura y datos de ejemplo para el sistema de BI con IA
 *
 * Uso: npx tsx generate-schema-json.ts
 */

import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

// Leer .env del backend y parsear DATABASE_URL
function loadEnv(): { host: string; port: number; user: string; password: string; database: string } {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: No existe backend/.env');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf-8');

  // Buscar DATABASE_URL
  const match = content.match(/DATABASE_URL=mysql\+aiomysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(\S+)/);
  if (!match) {
    console.error('Error: No se encontró DATABASE_URL válida en .env');
    process.exit(1);
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5]
  };
}

const DB_CONFIG = loadEnv();

async function generateSchemaJson() {
  console.log('🔍 Conectando a la base de datos...');
  console.log(`   Host: ${DB_CONFIG.host}`);
  console.log(`   Database: ${DB_CONFIG.database}\n`);

  const connection = await mysql.createConnection({
    ...DB_CONFIG,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Obtener todas las tablas
    const [tables] = await connection.execute<mysql.RowDataPacket[]>(
      'SHOW TABLES'
    );

    const schema: Record<string, any[]> = {};

    console.log(`📊 Procesando ${tables.length} tablas...\n`);

    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0] as string;

      // Saltar tabla de alembic
      if (tableName === 'alembic_version') continue;

      console.log(`  📋 ${tableName}...`);

      // Obtener datos de ejemplo (max 5 registros)
      try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
          `SELECT * FROM \`${tableName}\` LIMIT 5`
        );

        // Convertir a formato JSON serializable
        schema[tableName] = rows.map(row => {
          const cleanRow: Record<string, any> = {};
          for (const [key, value] of Object.entries(row)) {
            if (value instanceof Date) {
              cleanRow[key] = value.toISOString();
            } else if (typeof value === 'bigint') {
              cleanRow[key] = value.toString();
            } else if (Buffer.isBuffer(value)) {
              cleanRow[key] = value.toString('utf-8');
            } else {
              cleanRow[key] = value;
            }
          }
          return cleanRow;
        });

        console.log(`     ✓ ${rows.length} registros de ejemplo`);
      } catch (error: any) {
        console.error(`     ✗ Error en ${tableName}:`, error.message);
        schema[tableName] = [];
      }
    }

    // Guardar schema.json
    const outputPath = path.join(__dirname, '..', 'backend', 'schema.json');
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2), 'utf-8');

    console.log(`\n✅ Schema generado exitosamente:`);
    console.log(`   📁 ${outputPath}`);
    console.log(`   📊 ${Object.keys(schema).length} tablas procesadas`);
    console.log(`   💾 ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

  } finally {
    await connection.end();
  }
}

// Ejecutar
generateSchemaJson().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
