#!/usr/bin/env npx tsx
/**
 * RUN-TUTORIAL - Configura automáticamente el ejemplo del tutorial
 *
 * Uso:
 *   npx tsx run-tutorial.ts              # Ejecuta el tutorial completo
 *   npx tsx run-tutorial.ts --help       # Muestra esta ayuda
 *   npx tsx run-tutorial.ts --migrate    # Incluye migración de base de datos
 *
 * Este script:
 *  1. Genera el modelo SQLModel para la entidad Task del tutorial
 *  2. Copia la configuración al frontend para DynamicABM
 *  3. Genera las rutas y el registro de entidades
 *  4. (Opcional) Crea y aplica la migración de base de datos
 *
 * El resultado es una aplicación CRUD completa lista para usar.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const CLI_PATH = __dirname;
const BACKEND_PATH = path.join(__dirname, '..', 'backend');
const FRONTEND_PATH = path.join(__dirname, '..', 'frontend', 'src');
const TUTORIAL_FILE = 'tutorial-example.json';

// Colores para output
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const blue = (s: string) => `\x1b[34m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

function showHelp() {
  console.log(`
${bold('RUN-TUTORIAL')} - Configuración automática del tutorial

${yellow('Uso:')}
  npx tsx run-tutorial.ts              ${dim('# Ejecuta el tutorial completo')}
  npx tsx run-tutorial.ts --help       ${dim('# Muestra esta ayuda')}
  npx tsx run-tutorial.ts --migrate    ${dim('# Incluye migración de DB')}

${yellow('Descripción:')}
  Este script automatiza la generación de un CRUD completo a partir
  de la entidad de ejemplo "Task" definida en ${TUTORIAL_FILE}.

${yellow('Pasos que realiza:')}
  1. Genera modelo SQLModel (backend/models/task.py)
  2. Genera schema Pydantic (backend/schemas/task.py)
  3. Genera API endpoints (backend/api/tasks.py)
  4. Copia configuración al frontend
  5. Genera registro de entidades (entityRegistry.ts)
  6. ${dim('[Opcional]')} Crea migración Alembic y actualiza la base de datos

${yellow('Resultado:')}
  Una aplicación CRUD completa con:
  - Backend FastAPI funcional
  - Frontend React con DynamicABM
  - Rutas configuradas automáticamente
  - Base de datos sincronizada (si usaste --migrate)

${yellow('Próximos pasos después de ejecutar:')}
  1. Iniciar backend:  ${green('cd backend && uvicorn main:app --reload')}
  2. Iniciar frontend: ${green('cd frontend && npm run dev')}
  3. Visitar:          ${green('http://localhost:5173/gestion/tutorial/tasks')}

${dim('Para más información, consulta APP_GUIDE/00_GETTING_STARTED_TUTORIAL.md')}
`);
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

  // Manejar --help
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const shouldMigrate = args.includes('--migrate') || args.includes('-m');

  console.log('\n' + '='.repeat(60));
  console.log(blue('  🎓 TUTORIAL - Generando tu primera aplicación CRUD'));
  console.log('='.repeat(60) + '\n');

  console.log('¡Bienvenido al tutorial de SYS-TEMPLATE!');
  console.log('Vamos a generar una aplicación completa para gestionar tareas.\n');

  // Verificar que existe el archivo de tutorial
  const tutorialPath = path.join(CLI_PATH, TUTORIAL_FILE);
  if (!fs.existsSync(tutorialPath)) {
    console.log(red(`❌ Error: No se encontró ${TUTORIAL_FILE}`));
    console.log(dim('   Asegurate de estar en el directorio correcto.'));
    process.exit(1);
  }

  console.log(green(`✓ Encontrado: ${TUTORIAL_FILE}`));

  // Mostrar qué vamos a generar
  const config = JSON.parse(fs.readFileSync(tutorialPath, 'utf-8'));
  console.log(`\n${yellow('Entidad a generar:')}`);
  console.log(`   • Nombre: ${config.entities[0].name}`);
  console.log(`   • Tabla: ${config.entities[0].table}`);
  console.log(`   • Campos: ${config.entities[0].fields}`);
  console.log('');

  // Paso 1: Generar backend
  console.log(yellow('📦 [1/4] Generando backend (SQLModel + API)...'));
  try {
    execSync(`npx tsx generate-sqlmodel.ts ${TUTORIAL_FILE}`, {
      cwd: CLI_PATH,
      stdio: 'inherit'
    });
    console.log(green('   ✓ Backend generado correctamente'));
  } catch (error) {
    console.log(red('❌ Error generando backend'));
    process.exit(1);
  }

  // Paso 2: Copiar config al frontend
  console.log('\n' + yellow('📋 [2/4] Configurando frontend...'));
  const configDir = path.join(FRONTEND_PATH, 'config', 'entities');
  fs.mkdirSync(configDir, { recursive: true });

  const dest = path.join(configDir, TUTORIAL_FILE);
  fs.copyFileSync(tutorialPath, dest);
  console.log(green(`   ✓ ${TUTORIAL_FILE} copiado al frontend`));

  // Paso 3: Generar entityRegistry
  console.log('\n' + yellow('📝 [3/4] Generando registro de entidades...'));
  generateEntityRegistry([TUTORIAL_FILE], configDir);
  console.log(green('   ✓ entityRegistry.ts actualizado'));

  // Paso 4: Migraciones (opcional)
  if (shouldMigrate) {
    console.log('\n' + yellow('🗃️  [4/4] Ejecutando migraciones...'));

    console.log('   Creando migración: "add tutorial task entity"...');
    const revisionOk = runCommand(
      'alembic revision --autogenerate -m "add tutorial task entity"',
      BACKEND_PATH,
      'Crear migración'
    );

    if (revisionOk) {
      console.log('   Aplicando migración...');
      const upgradeOk = runCommand('alembic upgrade head', BACKEND_PATH, 'Aplicar migración');

      if (upgradeOk) {
        console.log(green('   ✓ Migración aplicada correctamente'));
      }
    }
  } else {
    console.log('\n' + dim('💡 [4/4] Migraciones: omitidas'));
    console.log(dim('   Tip: Usá --migrate para crear y aplicar la migración de DB'));
  }

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log(green('  ✅ ¡TUTORIAL COMPLETADO!'));
  console.log('='.repeat(60));

  console.log('\n' + bold('Archivos generados:'));
  console.log(`   ${green('✓')} backend/models/task.py`);
  console.log(`   ${green('✓')} backend/schemas/task.py`);
  console.log(`   ${green('✓')} backend/api/tasks.py`);
  console.log(`   ${green('✓')} frontend/src/config/entities/${TUTORIAL_FILE}`);
  console.log(`   ${green('✓')} frontend/src/config/entityRegistry.ts`);
  if (shouldMigrate) {
    console.log(`   ${green('✓')} backend/alembic/versions/[timestamp]_add_tutorial_task_entity.py`);
  }

  console.log('\n' + bold('Próximos pasos:'));
  console.log(`   1. ${yellow('Iniciar el backend:')}`);
  console.log(`      ${green('cd backend && uvicorn main:app --reload')}`);
  console.log(`\n   2. ${yellow('Iniciar el frontend:')}`);
  console.log(`      ${green('cd frontend && npm run dev')}`);
  console.log(`\n   3. ${yellow('Abrir en el navegador:')}`);
  console.log(`      ${green('http://localhost:5173/gestion/tutorial/tasks')}`);

  if (!shouldMigrate) {
    console.log('\n' + dim('Nota: Para aplicar los cambios a la base de datos, ejecutá:'));
    console.log(dim('   npx tsx run-tutorial.ts --migrate'));
  }

  console.log('\n' + dim('📚 Para más detalles, consultá APP_GUIDE/00_GETTING_STARTED_TUTORIAL.md'));
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
 * Entity Registry - Generado automáticamente por run-tutorial.ts
 * NO EDITAR MANUALMENTE - se regenera con: npx tsx cli/run-tutorial.ts
 */

// ============ TYPES ============

export interface EntityField {
  name: string;
  type: 'string' | 'int' | 'decimal' | 'bool' | 'date' | 'datetime' | 'text' | 'email' | 'fk' | 'enum';
  required?: boolean;
  fkEntity?: string;
  enumValues?: string[];
}

export interface EntityConfig {
  name: string;
  plural: string;
  table: string;
  fields: EntityField[];
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

// ============ PARSER ============

function parseFields(fieldsStr: string): EntityField[] {
  return fieldsStr.split(/\\s+/).filter(Boolean).map(fieldDef => {
    const parts = fieldDef.split(':');
    const name = parts[0];
    let type = parts[1] || 'string';
    const required = parts.includes('req');
    let fkEntity: string | undefined;
    let enumValues: string[] | undefined;

    // Manejar enums: estado:enum(pendiente,aprobado,rechazado)
    if (type.startsWith('enum(')) {
      const match = type.match(/enum\\(([^)]+)\\)/);
      if (match) {
        enumValues = match[1].split(',');
        type = 'enum';
      }
    }

    // Manejar FKs: cliente_id:fk:Cliente
    if (type === 'fk') {
      fkEntity = parts[2];
    }

    return {
      name,
      type: type as EntityField['type'],
      required,
      fkEntity,
      enumValues
    };
  });
}

// ============ DATA ============

export const ENTITIES: EntityConfig[] = ${JSON.stringify(
  allEntities.map(e => ({
    ...e,
    fields: '<<FIELDS>>'
  })), null, 2
).replace(/"<<FIELDS>>"/g, (_, idx) => {
  const entity = allEntities[Math.floor(idx / 100)]; // Aproximado, se arregla abajo
  return `parseFields("${entity.fields}")`;
})};

export const MODULES: ModuleConfig[] = ${JSON.stringify(modules, null, 2)};

// ============ HELPERS ============

export function getEntityConfig(entityName: string): EntityConfig | undefined {
  return ENTITIES.find(e => e.name === entityName);
}

export function getEntitiesByModule(modulePath: string): EntityConfig[] {
  const module = MODULES.find(m => m.path === modulePath);
  if (!module) return [];
  return ENTITIES.filter(e => {
    // Las entidades están ordenadas por módulo en el array
    return true; // Simplificado para el tutorial
  });
}

export function getAllEntities(): EntityConfig[] {
  return ENTITIES;
}

export function getAllModules(): ModuleConfig[] {
  return MODULES;
}
`;

  // Fix del mapeo de fields (reemplazar correctamente)
  const fixedContent = content.replace(
    /export const ENTITIES: EntityConfig\[\] = \[[\s\S]*?\];/,
    () => {
      const entitiesStr = allEntities.map(e => {
        const { fields, ...rest } = e;
        return `  {
    ...${JSON.stringify(rest, null, 4).replace(/\n/g, '\n    ')},
    fields: parseFields("${fields}")
  }`;
      }).join(',\n');
      return `export const ENTITIES: EntityConfig[] = [\n${entitiesStr}\n];`;
    }
  );

  fs.writeFileSync(registryPath, fixedContent, 'utf-8');
}

main().catch(error => {
  console.error(red('\n❌ Error fatal:'), error);
  process.exit(1);
});
