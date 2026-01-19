/**
 * generate-from-db.ts
 *
 * Lee una tabla de la DB y genera la configuración JSON de la entidad.
 *
 * Uso: npx tsx cli/generate-from-db.ts <nombre_tabla>
 * Ejemplo: npx tsx cli/generate-from-db.ts productos
 */

import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Mapeo de tipos MySQL → DSL
const typeMap: Record<string, string> = {
  'int': 'int',
  'bigint': 'int',
  'smallint': 'int',
  'tinyint': 'bool',
  'float': 'decimal',
  'double': 'decimal',
  'decimal': 'decimal',
  'varchar': 'string',
  'char': 'string',
  'text': 'text',
  'mediumtext': 'text',
  'longtext': 'text',
  'date': 'date',
  'datetime': 'datetime',
  'timestamp': 'datetime',
  'json': 'json',
  'boolean': 'bool',
  'enum': 'enum'
};

interface ColumnInfo {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}

interface FKInfo {
  COLUMN_NAME: string;
  REFERENCED_TABLE_NAME: string;
  REFERENCED_COLUMN_NAME: string;
}

async function generateFromDB(tableName: string) {
  // Parsear DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL no encontrada en .env');
    process.exit(1);
  }

  // mysql+aiomysql://user:pass@host:port/db → mysql://user:pass@host:port/db
  const cleanUrl = dbUrl.replace('mysql+aiomysql://', 'mysql://');
  const url = new URL(cleanUrl);

  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1)
  });

  try {
    // 1. Obtener columnas
    const [columns] = await connection.execute<mysql.RowDataPacket[]>(
      `DESCRIBE ${tableName}`
    );

    // 2. Obtener foreign keys
    const [fks] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [url.pathname.slice(1), tableName]);

    const fkMap = new Map<string, string>();
    for (const fk of fks as FKInfo[]) {
      fkMap.set(fk.COLUMN_NAME, fk.REFERENCED_TABLE_NAME);
    }

    // 3. Generar campos DSL
    const fields: string[] = [];
    const skipFields = ['id', 'activo', 'created_at', 'updated_at', 'organizacion_id'];

    for (const col of columns as ColumnInfo[]) {
      if (skipFields.includes(col.Field)) continue;

      const isRequired = col.Null === 'NO' && col.Default === null;
      let fieldDef = col.Field;

      // Es FK?
      if (fkMap.has(col.Field)) {
        const refTable = fkMap.get(col.Field)!;
        const entityName = toPascalCase(refTable.replace(/s$/, '')); // productos → Producto
        fieldDef += `:fk:${entityName}`;
      }
      // Es enum?
      else if (col.Type.startsWith('enum')) {
        const enumMatch = col.Type.match(/enum\((.+)\)/);
        if (enumMatch) {
          const values = enumMatch[1].replace(/'/g, '').split(',');
          fieldDef += `:enum(${values.join(',')})`;
        }
      }
      // Tipo normal
      else {
        const mysqlType = col.Type.split('(')[0].toLowerCase();
        const dslType = typeMap[mysqlType] || 'string';

        // Email heuristic
        if (col.Field === 'email' || col.Field.endsWith('_email')) {
          fieldDef += ':email';
        } else {
          fieldDef += `:${dslType}`;
        }
      }

      if (isRequired) {
        fieldDef += ':req';
      }

      fields.push(fieldDef);
    }

    // 4. Generar JSON
    const entityName = toPascalCase(tableName.replace(/s$/, '')); // productos → Producto
    const icon = guessIcon(tableName);

    const entity = {
      name: entityName,
      plural: tableName,
      table: tableName,
      fields: fields.join(' '),
      icon: icon,
      order: 1
    };

    console.log('\n✅ Entidad generada:\n');
    console.log(JSON.stringify(entity, null, 2));
    console.log('\n📋 Copiá esto a tu archivo JSON de módulo.\n');

  } finally {
    await connection.end();
  }
}

// Helpers
function toPascalCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function guessIcon(tableName: string): string {
  const iconMap: Record<string, string> = {
    'usuarios': 'Users',
    'clientes': 'Users',
    'productos': 'Package',
    'pedidos': 'ShoppingCart',
    'compras': 'Receipt',
    'ventas': 'DollarSign',
    'categorias': 'Tag',
    'proveedores': 'Truck',
    'empleados': 'UserCheck',
    'facturas': 'FileText',
    'pagos': 'CreditCard',
    'inventario': 'Warehouse',
    'movimientos': 'ArrowLeftRight',
    'roles': 'Shield',
    'permisos': 'Key',
    'configuracion': 'Settings',
    'reportes': 'BarChart',
    'notificaciones': 'Bell',
  };
  return iconMap[tableName] || 'FileText';
}

// Main
const tableName = process.argv[2];
if (!tableName) {
  console.log('Uso: npx tsx cli/generate-from-db.ts <nombre_tabla>');
  console.log('Ejemplo: npx tsx cli/generate-from-db.ts productos');
  process.exit(1);
}

generateFromDB(tableName).catch(console.error);
