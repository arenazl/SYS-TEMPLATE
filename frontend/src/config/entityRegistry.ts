/**
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
  return fieldsStr.split(/\s+/).filter(Boolean).map(fieldDef => {
    const parts = fieldDef.split(':');
    const name = parts[0];
    let type = parts[1] || 'string';
    const required = parts.includes('req');
    let fkEntity: string | undefined;
    let enumValues: string[] | undefined;

    // Manejar enums: estado:enum(pendiente,aprobado,rechazado)
    if (type.startsWith('enum(')) {
      const match = type.match(/enum\(([^)]+)\)/);
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

export const ENTITIES: EntityConfig[] = [
  {
    ...{
        "name": "Task",
        "plural": "tasks",
        "table": "tasks",
        "icon": "CheckSquare",
        "order": 1
    },
    fields: parseFields("titulo:string:req descripcion:text completada:bool fecha_vencimiento:date")
  }
];

export const MODULES: ModuleConfig[] = [
  {
    "name": "Tutorial",
    "description": "Ejemplo simple para aprender a usar el generador",
    "icon": "GraduationCap",
    "path": "tutorial",
    "folder": "tutorial",
    "requiredRole": "usuario",
    "containerStyle": "dashboard"
  }
];

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
