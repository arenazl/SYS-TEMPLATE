/**
 * Convierte un archivo SQL a database_schema_ai.json
 *
 * Uso: npx tsx sql-to-schema-json.ts ../backend/DBschema/clitester_db.sql
 */

import fs from 'fs';
import path from 'path';

interface Column {
  name: string;
  sqlType: string;
  nullable: boolean;
  isPrimary: boolean;
  autoIncrement: boolean;
  isFK: boolean;
  fkTable?: string;
  fkColumn?: string;
  defaultValue?: string;
  unique?: boolean;
}

interface Table {
  name: string;
  columns: Column[];
  foreignKeys: Array<{
    column: string;
    refTable: string;
    refColumn: string;
  }>;
  uniqueKeys: string[];
}

function parseSQLFile(sqlContent: string): Table[] {
  const tables: Table[] = [];
  const tableRegex = /CREATE TABLE ["'](\w+)["']\s*\(([\s\S]*?)\);/g;

  let match;
  while ((match = tableRegex.exec(sqlContent)) !== null) {
    const tableName = match[1];
    const tableContent = match[2];

    if (tableName === 'alembic_version') continue;

    const columns: Column[] = [];
    const foreignKeys: Array<{ column: string; refTable: string; refColumn: string }> = [];
    const uniqueKeys: string[] = [];

    const lines = tableContent.split('\n').map(l => l.trim());

    for (const line of lines) {
      // Parse column definition
      const columnMatch = line.match(/^["'](\w+)["']\s+(\w+(?:\(\d+\))?)\s*(.*?)(?:,|$)/);
      if (columnMatch) {
        const colName = columnMatch[1];
        const colType = columnMatch[2];
        const constraints = columnMatch[3];

        columns.push({
          name: colName,
          sqlType: colType,
          nullable: !constraints.includes('NOT NULL'),
          isPrimary: constraints.includes('PRIMARY KEY') || colName === 'id',
          autoIncrement: constraints.includes('AUTO_INCREMENT') || colName === 'id',
          isFK: false,
          unique: constraints.includes('UNIQUE')
        });

        if (constraints.includes('UNIQUE')) {
          uniqueKeys.push(colName);
        }
      }

      // Parse foreign keys
      const fkMatch = line.match(/CONSTRAINT\s+["']\w+["']\s+FOREIGN KEY\s+\(["'](\w+)["']\)\s+REFERENCES\s+["'](\w+)["']\s+\(["'](\w+)["']\)/);
      if (fkMatch) {
        foreignKeys.push({
          column: fkMatch[1],
          refTable: fkMatch[2],
          refColumn: fkMatch[3]
        });
      }

      // Parse KEY for indexes
      const keyMatch = line.match(/KEY\s+["']?\w+["']?\s+\(["'](\w+)["']\)/);
      if (keyMatch && !uniqueKeys.includes(keyMatch[1])) {
        // Tracked for indexes later
      }
    }

    // Mark FK columns
    for (const fk of foreignKeys) {
      const col = columns.find(c => c.name === fk.column);
      if (col) {
        col.isFK = true;
        col.fkTable = fk.refTable;
        col.fkColumn = fk.refColumn;
      }
    }

    tables.push({
      name: tableName,
      columns,
      foreignKeys,
      uniqueKeys
    });
  }

  return tables;
}

function sqlTypeToSchemaType(sqlType: string): string {
  const lower = sqlType.toLowerCase();

  if (lower.includes('varchar')) return `varchar(${lower.match(/\((\d+)\)/)?.[1] || '255'})`;
  if (lower.includes('int')) return 'int';
  if (lower === 'tinyint(1)') return 'boolean';
  if (lower.includes('float') || lower.includes('decimal')) return 'float';
  if (lower === 'date') return 'date';
  if (lower === 'datetime' || lower.includes('timestamp')) return 'datetime';
  if (lower === 'json') return 'json';
  if (lower.includes('text')) return 'text';

  return 'varchar(255)';
}

function getColumnDescription(tableName: string, columnName: string): string | undefined {
  const descriptions: Record<string, Record<string, string>> = {
    'organizaciones': {
      'nombre': 'Nombre de la organización',
      'codigo': 'Código único de la organización',
      'color_primario': 'Color primario del tema',
      'color_secundario': 'Color secundario del tema'
    },
    'usuarios': {
      'email': 'Email del usuario (único)',
      'nombre': 'Nombre del usuario',
      'apellido': 'Apellido del usuario',
      'rol': 'Rol del usuario en el sistema'
    },
    'habitaciones': {
      'numero': 'Número de habitación',
      'estado': 'Estado actual de la habitación'
    },
    'reservas': {
      'codigo': 'Código único de la reserva',
      'fecha_entrada': 'Fecha de check-in',
      'fecha_salida': 'Fecha de check-out',
      'precio_total': 'Precio total de la reserva'
    }
  };

  return descriptions[tableName]?.[columnName];
}

function getTableDescription(tableName: string): string {
  const descriptions: Record<string, string> = {
    'organizaciones': 'Organizaciones/hoteles que usan el sistema',
    'usuarios': 'Usuarios del sistema',
    'habitaciones': 'Habitaciones del hotel',
    'tipos_habitacion': 'Tipos y categorías de habitaciones',
    'huespedes': 'Huéspedes del hotel',
    'reservas': 'Reservas de habitaciones',
    'acompanantes': 'Acompañantes en las reservas',
    'departamentos': 'Departamentos de la organización',
    'empleados': 'Empleados del hotel',
    'categorias_servicio': 'Categorías de servicios',
    'servicios': 'Servicios adicionales del hotel',
    'consumos': 'Consumos de servicios por los huéspedes',
    'tareas_limpieza': 'Tareas de limpieza de habitaciones',
    'mantenimientos': 'Mantenimientos de habitaciones e instalaciones',
    'proveedores': 'Proveedores del hotel',
    'inventario': 'Inventario de productos y suministros',
    'movimientos_inventario': 'Movimientos de inventario',
    'facturas': 'Facturas de las reservas',
    'detalles_factura': 'Detalles de las facturas',
    'pagos': 'Pagos de facturas',
    'eventos': 'Eventos y salones',
    'quejas': 'Quejas y reclamos de huéspedes',
    'roles': 'Roles de usuarios',
    'permisos': 'Permisos del sistema',
    'rol_permisos': 'Relación entre roles y permisos',
    'menus': 'Menús de navegación',
    'menu_roles': 'Relación entre menús y roles',
    'parametros': 'Parámetros de configuración',
    'notificaciones': 'Notificaciones del sistema',
    'logs_auditoria': 'Logs de auditoría',
    'sesiones': 'Sesiones de usuarios'
  };

  return descriptions[tableName] || `Tabla ${tableName}`;
}

function detectEnumValues(tableName: string, columnName: string): string[] | null {
  const enums: Record<string, Record<string, string[]>> = {
    'habitaciones': {
      'estado': ['disponible', 'ocupada', 'mantenimiento', 'limpieza', 'reservada']
    },
    'huespedes': {
      'tipo_documento': ['dni', 'pasaporte', 'cedula']
    },
    'reservas': {
      'estado': ['pendiente', 'confirmada', 'checkin', 'checkout', 'cancelada', 'noshow'],
      'regimen': ['solo_habitacion', 'desayuno', 'media_pension', 'pension_completa', 'all_inclusive']
    },
    'empleados': {
      'turno': ['manana', 'tarde', 'noche', 'rotativo']
    },
    'tareas_limpieza': {
      'estado': ['pendiente', 'en_proceso', 'completada', 'inspeccionada'],
      'tipo': ['diaria', 'checkin', 'checkout', 'profunda']
    },
    'mantenimientos': {
      'tipo': ['preventivo', 'correctivo', 'urgente'],
      'estado': ['reportado', 'asignado', 'en_proceso', 'completado', 'cancelado'],
      'prioridad': ['baja', 'media', 'alta', 'critica']
    },
    'eventos': {
      'tipo': ['conferencia', 'boda', 'cumpleanos', 'corporativo', 'otro'],
      'montaje': ['teatro', 'escuela', 'u', 'banquete', 'coctel'],
      'estado': ['cotizado', 'reservado', 'confirmado', 'realizado', 'cancelado']
    },
    'quejas': {
      'categoria': ['habitacion', 'servicio', 'limpieza', 'personal', 'ruido', 'otro'],
      'prioridad': ['baja', 'media', 'alta'],
      'estado': ['recibida', 'en_proceso', 'resuelta', 'cerrada']
    },
    'facturas': {
      'estado': ['pendiente', 'pagada', 'parcial', 'anulada'],
      'metodo_pago': ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'cheque']
    },
    'pagos': {
      'metodo': ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'cheque'],
      'estado': ['pendiente', 'aprobado', 'rechazado']
    },
    'inventario': {
      'categoria': ['limpieza', 'amenities', 'mantenimiento', 'cocina', 'bar', 'otros'],
      'unidad': ['unidad', 'kg', 'litro', 'caja', 'paquete']
    },
    'movimientos_inventario': {
      'tipo': ['entrada', 'salida', 'ajuste']
    },
    'tipos_habitacion': {
      'vista': ['ciudad', 'jardin', 'piscina', 'mar']
    },
    'servicios': {
      'unidad': ['unidad', 'hora', 'dia', 'persona']
    },
    'usuarios': {
      'rol': ['admin', 'gerente', 'recepcionista', 'empleado', 'usuario']
    },
    'parametros': {
      'tipo': ['string', 'int', 'float', 'bool', 'json']
    }
  };

  return enums[tableName]?.[columnName];
}

function tablesToSchemaJSON(tables: Table[]): any {
  const entities: any = {};

  const centralEntities = ['organizaciones', 'usuarios', 'habitaciones', 'reservas', 'huespedes'];

  for (const table of tables) {
    const columns: any = {};
    const relationships: any = {};

    for (const col of table.columns) {
      const colDef: any = {
        type: sqlTypeToSchemaType(col.sqlType),
        nullable: col.nullable
      };

      if (col.autoIncrement) colDef.auto_increment = true;
      if (col.unique) colDef.unique = true;

      const desc = getColumnDescription(table.name, col.name);
      if (desc) colDef.description = desc;

      if (col.isFK && col.fkTable && col.fkColumn) {
        colDef.foreign_key = `${col.fkTable}.${col.fkColumn}`;
        relationships[col.name.replace('_id', '')] = {
          type: 'belongs_to',
          target: col.fkTable,
          foreign_key: col.name
        };
      }

      // Detect enums
      const enumValues = detectEnumValues(table.name, col.name);
      if (enumValues) {
        colDef.type = 'enum';
        colDef.values = enumValues;
      }

      // Default for common columns
      if (col.name === 'activo' && !col.nullable) {
        colDef.default = true;
      }
      if (col.name === 'created_at' || col.name === 'updated_at') {
        colDef.default = 'CURRENT_TIMESTAMP';
      }

      columns[col.name] = colDef;
    }

    entities[table.name] = {
      description: getTableDescription(table.name),
      table: table.name,
      primary_key: 'id',
      columns
    };

    if (Object.keys(relationships).length > 0) {
      entities[table.name].relationships = relationships;
    }

    if (table.uniqueKeys.length > 0) {
      entities[table.name].indexes = table.uniqueKeys;
    }

    if (centralEntities.includes(table.name)) {
      entities[table.name].is_central_entity = true;
    }
  }

  return {
    schema_version: '1.0',
    database: 'hotel_management_system',
    description: 'Sistema completo de gestión hotelera con reservas, servicios, inventario y personal',
    entities
  };
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Uso: npx tsx sql-to-schema-json.ts <archivo.sql>');
  process.exit(1);
}

const sqlPath = args[0];
const outputPath = path.join(__dirname, '..', 'backend', 'DBschema', 'database_schema_ai.json');

if (!fs.existsSync(sqlPath)) {
  console.error(`❌ Archivo no encontrado: ${sqlPath}`);
  process.exit(1);
}

console.log(`📖 Leyendo SQL desde: ${sqlPath}`);
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

console.log(`🔍 Parseando tablas...`);
const tables = parseSQLFile(sqlContent);

console.log(`✅ ${tables.length} tablas encontradas`);
tables.forEach(t => console.log(`   - ${t.name} (${t.columns.length} columnas)`));

console.log(`\n📝 Generando database_schema_ai.json...`);
const schema = tablesToSchemaJSON(tables);

fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2), 'utf-8');

console.log(`✅ Schema JSON generado en: ${outputPath}`);
console.log(`\n✨ Listo! El archivo puede ser usado por el chat BI para entender la estructura de la BD.`);
