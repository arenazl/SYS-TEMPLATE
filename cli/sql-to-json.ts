/**
 * Convierte un archivo SQL a JSON para el generador de ABMs
 *
 * Uso: npx tsx sql-to-json.ts ../backend/DBschema/clitester_db.sql
 */

import fs from 'fs';
import path from 'path';

// Mapeo de tipos SQL a tipos del generador
const TYPE_MAPPING: Record<string, string> = {
  'varchar': 'string',
  'int': 'int',
  'tinyint(1)': 'bool',
  'float': 'decimal',
  'date': 'date',
  'datetime': 'datetime',
  'json': 'json',
  'text': 'text'
};

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  isFK: boolean;
  fkTable?: string;
  fkColumn?: string;
}

interface Table {
  name: string;
  columns: Column[];
  foreignKeys: Array<{
    column: string;
    refTable: string;
    refColumn: string;
  }>;
}

function parseSQLFile(sqlContent: string): Table[] {
  const tables: Table[] = [];

  // Regex para encontrar CREATE TABLE statements
  const tableRegex = /CREATE TABLE ["'](\w+)["']\s*\(([\s\S]*?)\);/g;

  let match;
  while ((match = tableRegex.exec(sqlContent)) !== null) {
    const tableName = match[1];
    const tableContent = match[2];

    // Ignorar tablas internas
    if (tableName === 'alembic_version') continue;

    const columns: Column[] = [];
    const foreignKeys: Array<{ column: string; refTable: string; refColumn: string }> = [];

    // Parsear columnas
    const lines = tableContent.split('\n').map(l => l.trim());

    for (const line of lines) {
      // Detectar columnas
      const columnMatch = line.match(/^["'](\w+)["']\s+(\w+(?:\(\d+\))?)\s*(.*?)(?:,|$)/);
      if (columnMatch) {
        const colName = columnMatch[1];
        const colType = columnMatch[2];
        const constraints = columnMatch[3];

        // Ignorar columnas autogeneradas
        if (['id', 'organizacion_id', 'activo'].includes(colName)) continue;

        columns.push({
          name: colName,
          type: colType,
          nullable: !constraints.includes('NOT NULL'),
          isPrimary: constraints.includes('PRIMARY KEY'),
          isFK: false
        });
      }

      // Detectar foreign keys
      const fkMatch = line.match(/CONSTRAINT\s+["']\w+["']\s+FOREIGN KEY\s+\(["'](\w+)["']\)\s+REFERENCES\s+["'](\w+)["']\s+\(["'](\w+)["']\)/);
      if (fkMatch) {
        foreignKeys.push({
          column: fkMatch[1],
          refTable: fkMatch[2],
          refColumn: fkMatch[3]
        });
      }
    }

    // Marcar columnas con FK
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
      foreignKeys
    });
  }

  return tables;
}

function convertColumnType(sqlType: string): string {
  const baseType = sqlType.toLowerCase().replace(/\(\d+\)/, '');
  return TYPE_MAPPING[baseType] || 'string';
}

function detectEnumValues(tableName: string, columnName: string): string[] | null {
  // Valores conocidos de enums basados en el negocio.json original
  const enumValues: Record<string, Record<string, string[]>> = {
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
    }
  };

  return enumValues[tableName]?.[columnName] || null;
}

function singularToPlural(singular: string): string {
  // Conversiones conocidas
  const plurals: Record<string, string> = {
    'tipo_habitacion': 'tipos_habitacion',
    'categoria_servicio': 'categorias_servicio',
    'tarea_limpieza': 'tareas_limpieza',
    'movimiento_inventario': 'movimientos_inventario',
    'detalle_factura': 'detalles_factura',
    'log_auditoria': 'logs_auditoria',
    'menu_rol': 'menu_roles',
    'rol_permiso': 'rol_permisos'
  };

  return plurals[singular] || singular + 's';
}

function tableNameToEntityName(tableName: string): string {
  // Convertir snake_case a PascalCase
  return tableName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function guessIcon(tableName: string): string {
  const icons: Record<string, string> = {
    'tipos_habitacion': 'Bed',
    'habitaciones': 'DoorOpen',
    'huespedes': 'Users',
    'reservas': 'Calendar',
    'acompanantes': 'UserPlus',
    'departamentos': 'Briefcase',
    'empleados': 'UserCog',
    'categorias_servicio': 'FolderTree',
    'servicios': 'Sparkles',
    'consumos': 'Receipt',
    'tareas_limpieza': 'Sparkle',
    'mantenimientos': 'Wrench',
    'proveedores': 'Truck',
    'inventario': 'Package',
    'movimientos_inventario': 'ArrowLeftRight',
    'facturas': 'FileText',
    'detalles_factura': 'ListOrdered',
    'pagos': 'DollarSign',
    'eventos': 'PartyPopper',
    'quejas': 'MessageSquareWarning',
    'organizaciones': 'Building',
    'usuarios': 'User',
    'roles': 'Shield',
    'permisos': 'Key',
    'menus': 'Menu',
    'parametros': 'Settings',
    'notificaciones': 'Bell',
    'logs_auditoria': 'FileSearch',
    'sesiones': 'Laptop'
  };

  return icons[tableName] || 'Folder';
}

function tablesToJSON(tables: Table[], moduleName: string = "Hotel"): any {
  const entities = tables
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((table, idx) => {
      const fields: string[] = [];

      for (const col of table.columns) {
        let fieldDef = col.name;

        // Tipo
        if (col.isFK && col.fkTable) {
          // Foreign key
          const refEntity = tableNameToEntityName(col.fkTable);
          fieldDef += `:fk:${refEntity}:${col.fkTable}`;
        } else {
          // Tipo normal
          const enumValues = detectEnumValues(table.name, col.name);
          if (enumValues) {
            fieldDef += `:enum(${enumValues.join(',')})`;
          } else {
            fieldDef += `:${convertColumnType(col.type)}`;
          }
        }

        // Required
        if (!col.nullable) {
          fieldDef += ':req';
        }

        fields.push(fieldDef);
      }

      return {
        name: tableNameToEntityName(table.name),
        plural: table.name,
        table: table.name,
        fields: fields.join(' '),
        icon: guessIcon(table.name),
        order: idx + 1
      };
    });

  return {
    module: {
      name: moduleName,
      description: `Sistema completo de gestión - Generado desde SQL`,
      icon: "Building2",
      path: moduleName.toLowerCase(),
      folder: moduleName.toLowerCase(),
      requiredRole: "usuario",
      containerStyle: "dashboard"
    },
    entities
  };
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Uso: npx tsx sql-to-json.ts <archivo.sql> [nombre-modulo]');
  process.exit(1);
}

const sqlPath = args[0];
const moduleName = args[1] || 'Hotel';
const outputPath = path.join(__dirname, `${moduleName.toLowerCase()}-generated.json`);

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

console.log(`\n📝 Generando JSON...`);
const json = tablesToJSON(tables, moduleName);

fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), 'utf-8');

console.log(`✅ JSON generado en: ${outputPath}`);
console.log(`\n🚀 Próximos pasos:`);
console.log(`   1. Revisar el archivo ${outputPath}`);
console.log(`   2. Ajustar iconos, orden y campos si es necesario`);
console.log(`   3. Renombrar a negocio.json o auditoria.json`);
console.log(`   4. Ejecutar: npm run sync:migrate`);
