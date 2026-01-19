#!/usr/bin/env npx tsx
/**
 * SYNC - Comando único para regenerar TODO desde los JSONs
 *
 * Uso:
 *   npx tsx sync.ts              # Solo regenera código
 *   npx tsx sync.ts --migrate    # Regenera + crea migración + aplica
 *   npx tsx sync.ts --migrate --message "add sucursales"  # Con mensaje custom
 *
 * Hace:
 *  1. Regenera modelos SQLModel desde los JSONs
 *  2. Copia JSONs al frontend para DynamicABM
 *  3. Genera entityRegistry.ts
 *  4. (Con --migrate) Corre alembic autogenerate + upgrade
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawnSync } from 'child_process';

const CLI_PATH = __dirname;
const BACKEND_PATH = path.join(__dirname, '..', 'backend');
const FRONTEND_PATH = path.join(__dirname, '..', 'frontend', 'src');

// Colores para output
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const blue = (s: string) => `\x1b[34m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

function findJsonConfigs(): string[] {
  const files = fs.readdirSync(CLI_PATH);
  return files.filter(f => f.endsWith('.json') && !f.startsWith('package') && !f.startsWith('tsconfig'));
}

function runCommand(cmd: string, cwd: string, description: string): boolean {
  console.log(dim(`   $ ${cmd}`));
  try {
    execSync(cmd, { cwd, stdio: 'pipe' });
    return true;
  } catch (error: any) {
    console.log(red(`   ✗ Error: ${error.message}`));
    if (error.stdout) console.log(dim(error.stdout.toString()));
    if (error.stderr) console.log(red(error.stderr.toString()));
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const shouldMigrate = args.includes('--migrate') || args.includes('-m');
  const messageIdx = args.findIndex(a => a === '--message' || a === '-msg');
  const migrationMessage = messageIdx >= 0 ? args[messageIdx + 1] : 'sync';

  console.log('\n' + '='.repeat(50));
  console.log(blue('  🔄 SYNC - Sincronización desde JSONs'));
  console.log('='.repeat(50) + '\n');

  // 1. Encontrar todos los JSONs de configuración
  const jsonFiles = findJsonConfigs();
  if (jsonFiles.length === 0) {
    console.log(red('❌ No se encontraron archivos JSON de configuración'));
    process.exit(1);
  }

  console.log('📁 Archivos de configuración:');
  jsonFiles.forEach(f => console.log(`   • ${f}`));
  console.log('');

  // 2. Regenerar backend con SQLModel
  console.log(yellow('📦 [1/4] Regenerando backend (SQLModel)...'));
  try {
    const argsStr = jsonFiles.join(' ');
    execSync(`npx tsx generate-sqlmodel.ts ${argsStr}`, {
      cwd: CLI_PATH,
      stdio: 'inherit'
    });
  } catch (error) {
    console.log(red('❌ Error generando backend'));
    process.exit(1);
  }

  // 3. Copiar JSONs al frontend para DynamicABM
  console.log('\n' + yellow('📋 [2/4] Copiando JSONs al frontend...'));
  const configDir = path.join(FRONTEND_PATH, 'config', 'entities');
  fs.mkdirSync(configDir, { recursive: true });

  for (const jsonFile of jsonFiles) {
    const src = path.join(CLI_PATH, jsonFile);
    const dest = path.join(configDir, jsonFile);
    fs.copyFileSync(src, dest);
    console.log(`   ✓ ${jsonFile}`);
  }

  // 4. Generar índice de entidades para el frontend
  console.log('\n' + yellow('📝 [3/4] Generando entityRegistry.ts...'));
  generateEntityRegistry(jsonFiles, configDir);
  console.log('   ✓ entityRegistry.ts');

  // 5. Migraciones (si --migrate)
  if (shouldMigrate) {
    console.log('\n' + yellow('🗃️  [4/4] Ejecutando migraciones...'));

    // Verificar que alembic existe
    const alembicCheck = spawnSync('alembic', ['--version'], { cwd: BACKEND_PATH, shell: true });
    if (alembicCheck.status !== 0) {
      console.log(red('   ✗ Alembic no encontrado. Instalá con: pip install alembic'));
      process.exit(1);
    }

    // Crear migración
    console.log(`   Creando migración: "${migrationMessage}"...`);
    const revisionOk = runCommand(
      `alembic revision --autogenerate -m "${migrationMessage}"`,
      BACKEND_PATH,
      'Crear migración'
    );

    if (revisionOk) {
      // Aplicar migración
      console.log('   Aplicando migración...');
      const upgradeOk = runCommand('alembic upgrade head', BACKEND_PATH, 'Aplicar migración');

      if (upgradeOk) {
        console.log(green('   ✓ Migración aplicada'));
      }
    }
  } else {
    console.log('\n' + dim('💡 [4/4] Migraciones: omitidas (usá --migrate para incluirlas)'));
  }

  // Resumen final
  console.log('\n' + '='.repeat(50));
  console.log(green('  ✅ SYNC COMPLETADO'));
  console.log('='.repeat(50));

  console.log('\n📊 Resumen:');
  console.log(`   • Módulos procesados: ${jsonFiles.length}`);
  console.log(`   • Backend: SQLModel generado`);
  console.log(`   • Frontend: entityRegistry actualizado`);
  if (shouldMigrate) {
    console.log(`   • DB: Migración "${migrationMessage}" aplicada`);
  }

  if (!shouldMigrate) {
    console.log('\n' + dim('Para aplicar cambios a la DB:'));
    console.log(dim('   npx tsx sync.ts --migrate'));
    console.log(dim('   npx tsx sync.ts --migrate --message "descripción"'));
  }

  console.log('');
}

function generateEntityRegistry(jsonFiles: string[], configDir: string) {
  interface EntityConfig {
    name: string;
    plural: string;
    table: string;
    fields: string;
    icon: string;
    order: number;
    displayField?: string;
    masterDetail?: boolean;
    isDetail?: boolean;
    masterEntity?: string;
  }

  interface ModuleConfig {
    module: {
      name: string;
      path: string;
      folder: string;
      icon: string;
      description: string;
      requiredRole: string;
      containerStyle: string;
    };
    entities: EntityConfig[];
  }

  const allEntities: EntityConfig[] = [];
  const modules: ModuleConfig['module'][] = [];

  for (const jsonFile of jsonFiles) {
    const content = fs.readFileSync(path.join(CLI_PATH, jsonFile), 'utf-8');
    const config: ModuleConfig = JSON.parse(content);
    modules.push(config.module);
    allEntities.push(...config.entities);
  }

  // Generar el archivo TypeScript
  const registryPath = path.join(FRONTEND_PATH, 'config', 'entityRegistry.ts');

  const content = `/**
 * Entity Registry - Generado automáticamente por sync.ts
 * NO EDITAR MANUALMENTE - se regenera con: npx tsx cli/sync.ts
 */

// ============ TYPES ============
export interface FieldConfig {
  name: string;
  type: 'string' | 'text' | 'email' | 'int' | 'integer' | 'decimal' | 'float' | 'bool' | 'boolean' | 'date' | 'datetime' | 'json' | 'enum' | 'fk';
  required: boolean;
  fkEntity?: string;
  fkTable?: string;
  enumValues?: string[];
}

export interface EntityConfig {
  name: string;
  plural: string;
  table: string;
  fields: FieldConfig[];
  fieldsRaw: string;
  icon: string;
  order: number;
  displayField?: string;
  masterDetail?: boolean;
  isDetail?: boolean;
  masterEntity?: string;
}

export interface ModuleConfig {
  name: string;
  path: string;
  folder: string;
  icon: string;
  description: string;
  requiredRole: string;
  containerStyle: string;
}

// ============ FIELD PARSER ============
function parseFields(fieldsStr: string): FieldConfig[] {
  return fieldsStr.split(' ').filter(Boolean).map(fieldDef => {
    const parts = fieldDef.split(':');
    const name = parts[0];
    const type = parts[1];
    const isRequired = parts.includes('req');

    if (type === 'fk') {
      return {
        name,
        type: 'fk' as const,
        required: isRequired,
        fkEntity: parts[2],
        fkTable: parts[3] || parts[2]?.toLowerCase() + 's'
      };
    }

    const enumMatch = type?.match(/^enum\\((.+)\\)$/);
    if (enumMatch) {
      return {
        name,
        type: 'enum' as const,
        required: isRequired,
        enumValues: enumMatch[1].split(',')
      };
    }

    return {
      name,
      type: (type || 'string') as FieldConfig['type'],
      required: isRequired
    };
  });
}

// ============ RAW DATA ============
const modulesData: ModuleConfig[] = ${JSON.stringify(modules, null, 2)};

const entitiesData: Omit<EntityConfig, 'fields'>[] = ${JSON.stringify(
    allEntities.map(e => ({
      name: e.name,
      plural: e.plural,
      table: e.table,
      fieldsRaw: e.fields,
      icon: e.icon,
      order: e.order,
      displayField: e.displayField,
      masterDetail: e.masterDetail,
      isDetail: e.isDetail,
      masterEntity: e.masterEntity
    })),
    null,
    2
  )};

// ============ PARSED REGISTRY ============
export const entities: Record<string, EntityConfig> = {};
export const entitiesByPlural: Record<string, EntityConfig> = {};
export const modules: ModuleConfig[] = modulesData;

// Inicializar
for (const raw of entitiesData) {
  const entity: EntityConfig = {
    ...raw,
    fields: parseFields(raw.fieldsRaw)
  };
  entities[entity.name] = entity;
  entitiesByPlural[entity.plural] = entity;
}

// ============ HELPERS ============
export function getEntity(name: string): EntityConfig | undefined {
  return entities[name];
}

export function getEntityByPlural(plural: string): EntityConfig | undefined {
  return entitiesByPlural[plural];
}

export function getEntitiesForModule(modulePath: string): EntityConfig[] {
  return Object.values(entities).filter(e => !e.isDetail).sort((a, b) => a.order - b.order);
}

export function getDetailEntity(masterName: string): EntityConfig | undefined {
  return Object.values(entities).find(e => e.isDetail && e.masterEntity === masterName);
}
`;

  fs.writeFileSync(registryPath, content);
}

main().catch(console.error);
