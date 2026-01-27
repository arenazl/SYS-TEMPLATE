/**
 * Entity Registry - Generado automáticamente por sync.ts
 * NO EDITAR MANUALMENTE - se regenera con: npx tsx cli/sync.ts
 */

// ============ TYPES ============
export interface FieldConfig {
  name: string;
  type: 'string' | 'text' | 'email' | 'int' | 'integer' | 'decimal' | 'float' | 'bool' | 'boolean' | 'date' | 'datetime' | 'json' | 'enum' | 'fk' | 'richtext' | 'file' | 'tags' | 'radio';
  required: boolean;
  fkEntity?: string;
  fkTable?: string;
  enumValues?: string[];
  controlType?: 'richtext' | 'file' | 'tags' | 'radio' | 'datepicker';
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
      // parts[3] puede ser la tabla o 'req'
      const explicitTable = parts[3] && parts[3] !== 'req' ? parts[3] : undefined;
      return {
        name,
        type: 'fk' as const,
        required: isRequired,
        fkEntity: parts[2],
        fkTable: explicitTable || parts[2]?.toLowerCase() + 's'
      };
    }

    const enumMatch = type?.match(/^enum\((.+)\)$/);
    if (enumMatch) {
      return {
        name,
        type: 'enum' as const,
        required: isRequired,
        enumValues: enumMatch[1].split(',')
      };
    }

    const radioMatch = type?.match(/^radio\((.+)\)$/);
    if (radioMatch) {
      return {
        name,
        type: 'radio' as const,
        required: isRequired,
        enumValues: radioMatch[1].split(','),
        controlType: 'radio'
      };
    }

    // Handle new control types: richtext, file, tags, datepicker
    const controlTypeMap: Record<string, FieldConfig['controlType']> = {
      'richtext': 'richtext',
      'file': 'file',
      'upload': 'file',
      'tags': 'tags',
      'datepicker': 'datepicker'
    };

    const controlType = controlTypeMap[type];
    if (controlType) {
      return {
        name,
        type: (type || 'string') as FieldConfig['type'],
        required: isRequired,
        controlType
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
const modulesData: ModuleConfig[] = [
  {
    "name": "Auditoria",
    "description": "Administración y seguridad del sistema",
    "icon": "Settings",
    "path": "auditoria",
    "folder": "auditoria",
    "requiredRole": "admin",
    "containerStyle": "tabs"
  },
  {
    "name": "Negocio",
    "description": "Gestión de clientes, productos y pedidos",
    "icon": "ShoppingBag",
    "path": "negocio",
    "folder": "negocio",
    "requiredRole": "usuario",
    "containerStyle": "dashboard"
  }
];

const entitiesData: Omit<EntityConfig, 'fields'>[] = [
  {
    "name": "Organizacion",
    "plural": "organizaciones",
    "table": "organizaciones",
    "fieldsRaw": "nombre:string:req codigo:string:req descripcion:text logo_url:string color_primario:string color_secundario:string direccion:string telefono:string email:email sitio_web:string",
    "icon": "Building2",
    "order": 1
  },
  {
    "name": "Usuario",
    "plural": "usuarios",
    "table": "usuarios",
    "fieldsRaw": "email:email:req password_hash:string:req nombre:string:req apellido:string:req telefono:string rol:enum(usuario,supervisor,admin):req organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Users",
    "order": 2
  },
  {
    "name": "Rol",
    "plural": "roles",
    "table": "roles",
    "fieldsRaw": "nombre:string:req codigo:string:req descripcion:text organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Shield",
    "order": 3
  },
  {
    "name": "Permiso",
    "plural": "permisos",
    "table": "permisos",
    "fieldsRaw": "nombre:string:req codigo:string:req modulo:string:req descripcion:text organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Key",
    "order": 4
  },
  {
    "name": "Rolpermiso",
    "plural": "rol_permisos",
    "table": "rol_permisos",
    "fieldsRaw": "rol_id:fk:Rol:roles:req permiso_id:fk:Permiso:permisos:req organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Link",
    "order": 5
  },
  {
    "name": "Menu",
    "plural": "menus",
    "table": "menus",
    "fieldsRaw": "nombre:string:req path:string:req icono:string orden:int parent_id:fk:Menu:menus organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Menu",
    "order": 6
  },
  {
    "name": "Menurol",
    "plural": "menu_roles",
    "table": "menu_roles",
    "fieldsRaw": "menu_id:fk:Menu:menus:req rol_id:fk:Rol:roles:req organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Link",
    "order": 7
  },
  {
    "name": "Logauditoria",
    "plural": "logs_auditoria",
    "table": "logs_auditoria",
    "fieldsRaw": "usuario_id:fk:Usuario:usuarios accion:string:req entidad:string entidad_id:int datos_anteriores:json datos_nuevos:json ip:string user_agent:string organizacion_id:fk:Organizacion:organizaciones",
    "icon": "FileText",
    "order": 8
  },
  {
    "name": "Sesion",
    "plural": "sesiones",
    "table": "sesiones",
    "fieldsRaw": "usuario_id:fk:Usuario:usuarios:req token:string:req ip:string user_agent:string expires_at:datetime organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Clock",
    "order": 9
  },
  {
    "name": "Parametro",
    "plural": "parametros",
    "table": "parametros",
    "fieldsRaw": "clave:string:req valor:text:req tipo:enum(string,number,boolean,json):req descripcion:text editable:bool organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Sliders",
    "order": 10
  },
  {
    "name": "Notificacion",
    "plural": "notificaciones",
    "table": "notificaciones",
    "fieldsRaw": "usuario_id:fk:Usuario:usuarios:req titulo:string:req mensaje:text tipo:enum(info,success,warning,error) leida:bool organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Bell",
    "order": 11
  },
  {
    "name": "Categoria",
    "plural": "categorias",
    "table": "categorias",
    "fieldsRaw": "nombre:string:req descripcion:text color:string",
    "icon": "Tag",
    "order": 1
  },
  {
    "name": "Producto",
    "plural": "productos",
    "table": "productos",
    "fieldsRaw": "codigo:string nombre:string:req descripcion:text precio:decimal:req costo:decimal stock:integer stock_minimo:integer categoria_id:fk:Categoria",
    "icon": "Box",
    "order": 2
  },
  {
    "name": "Cliente",
    "plural": "clientes",
    "table": "clientes",
    "fieldsRaw": "codigo:string nombre:string:req razon_social:string cuit:string email:email telefono:string direccion:text ciudad:string provincia:string tipo:enum(minorista,mayorista,distribuidor)",
    "icon": "Users",
    "order": 3
  },
  {
    "name": "Proveedor",
    "plural": "proveedores",
    "table": "proveedores",
    "fieldsRaw": "codigo:string nombre:string:req razon_social:string cuit:string contacto:string telefono:string email:email direccion:text notas:text",
    "icon": "Truck",
    "order": 4
  },
  {
    "name": "Pedido",
    "plural": "pedidos",
    "table": "pedidos",
    "fieldsRaw": "numero:string:req fecha:date:req fecha_entrega:date cliente_id:fk:Cliente:req estado:enum(pendiente,confirmado,preparando,enviado,entregado,cancelado):req subtotal:decimal descuento:decimal total:decimal notas:text",
    "icon": "ShoppingCart",
    "order": 5,
    "masterDetail": true
  },
  {
    "name": "DetallePedido",
    "plural": "detalles_pedido",
    "table": "detalles_pedido",
    "fieldsRaw": "pedido_id:fk:Pedido:req producto_id:fk:Producto:req cantidad:decimal:req precio_unitario:decimal:req descuento:decimal subtotal:decimal:req",
    "icon": "ListOrdered",
    "order": 5.1,
    "isDetail": true,
    "masterEntity": "Pedido"
  },
  {
    "name": "Compra",
    "plural": "compras",
    "table": "compras",
    "fieldsRaw": "numero:string:req fecha:date:req fecha_recepcion:date proveedor_id:fk:Proveedor:req estado:enum(pendiente,parcial,recibido,cancelado):req subtotal:decimal descuento:decimal total:decimal notas:text",
    "icon": "Receipt",
    "order": 6
  },
  {
    "name": "Movimiento",
    "plural": "movimientos",
    "table": "movimientos",
    "fieldsRaw": "fecha:datetime:req tipo:enum(entrada,salida,ajuste_positivo,ajuste_negativo):req producto_id:fk:Producto:req cantidad:integer:req stock_anterior:integer stock_posterior:integer motivo:string referencia:string",
    "icon": "ArrowLeftRight",
    "order": 7
  }
];

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
