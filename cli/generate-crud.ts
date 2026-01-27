#!/usr/bin/env npx tsx
/**
 * Generador de CRUDs v3
 *
 * Genera backend (model, schema, api) y frontend (ABM usando ABMPage)
 * CON SOPORTE PARA:
 * - FK → ComboBox que carga datos relacionados
 * - Enum → Select con opciones
 * - Master-Detail → Formulario con detalle inline y cálculo de totales
 * - joinedload para eager loading de relaciones
 *
 * Uso: npx tsx generate-crud.ts <archivo.json>
 */

import * as fs from 'fs';
import * as path from 'path';

interface ModuleConfig {
  module: {
    name: string;
    description: string;
    icon: string;
    path: string;
    folder: string;
    requiredRole: string;
    containerStyle: 'tabs' | 'dashboard';
  };
  entities: EntityConfig[];
}

interface EntityConfig {
  name: string;
  plural: string;
  table: string;
  fields: string;
  icon: string;
  order: number;
  displayField?: string;
  // Master-Detail
  masterDetail?: boolean;
  isDetail?: boolean;
  masterEntity?: string;
}

interface ParsedField {
  name: string;
  type: string;
  required: boolean;
  fkModel?: string;
  fkTable?: string;
  enumValues?: string[];
}

// Paths
const BACKEND_PATH = path.join(__dirname, '..', 'backend');
const FRONTEND_PATH = path.join(__dirname, '..', 'frontend', 'src');

// Global para acceder a las entidades durante el parsing
let currentEntities: EntityConfig[] = [];

// ==================== FIELD PARSING ====================

function parseFields(fieldsStr: string): ParsedField[] {
  return fieldsStr.split(' ').map(fieldDef => {
    const parts = fieldDef.split(':');
    const name = parts[0];
    const type = parts[1];
    const isRequired = parts.includes('req');

    if (type === 'fk') {
      const fkModel = parts[2];
      const relEntity = currentEntities.find(e => e.name === fkModel);
      const fkTable = relEntity?.table || fkModel.toLowerCase() + 's';
      return { name, type: 'fk', required: isRequired, fkModel, fkTable };
    }

    const enumMatch = type?.match(/^enum\((.+)\)$/);
    if (enumMatch) {
      return { name, type: 'enum', required: isRequired, enumValues: enumMatch[1].split(',') };
    }

    const radioMatch = type?.match(/^radio\((.+)\)$/);
    if (radioMatch) {
      return { name, type: 'radio', required: isRequired, enumValues: radioMatch[1].split(',') };
    }

    // Handle new control types
    const controlTypes = ['datepicker', 'richtext', 'file', 'upload', 'tags'];
    if (controlTypes.includes(type)) {
      // For file/upload, normalize to 'file'
      const normalizedType = (type === 'upload') ? 'file' : type;
      return { name, type: normalizedType, required: isRequired };
    }

    return { name, type, required: isRequired };
  });
}

function getSqlAlchemyType(field: ParsedField): string {
  const map: Record<string, string> = {
    string: 'String(255)', text: 'Text', integer: 'Integer', int: 'Integer',
    decimal: 'Float', float: 'Float', bool: 'Boolean', boolean: 'Boolean',
    datetime: 'DateTime', date: 'Date', email: 'String(255)', json: 'JSON',
    enum: 'String(50)', fk: 'Integer',
    // New control types
    datepicker: 'Date', richtext: 'Text', file: 'String(255)', tags: 'JSON', radio: 'String(50)'
  };
  return map[field.type] || 'String(255)';
}

function getPydanticType(field: ParsedField): string {
  const map: Record<string, string> = {
    string: 'str', text: 'str', integer: 'int', int: 'int',
    decimal: 'float', float: 'float', bool: 'bool', boolean: 'bool',
    datetime: 'datetime', date: 'date', email: 'EmailStr', json: 'dict',
    enum: 'str', fk: 'int',
    // New control types
    datepicker: 'date', richtext: 'str', file: 'str', tags: 'list[str]', radio: 'str'
  };
  return map[field.type] || 'str';
}

function getTsType(field: ParsedField): string {
  const map: Record<string, string> = {
    string: 'string', text: 'string', email: 'string', enum: 'string', radio: 'string',
    integer: 'number', int: 'number', decimal: 'number', float: 'number', fk: 'number',
    bool: 'boolean', boolean: 'boolean',
    datetime: 'string', date: 'string', datepicker: 'string', json: 'Record<string, any>',
    // New control types
    richtext: 'string', file: 'string', tags: 'string[]'
  };
  return map[field.type] || 'string';
}

function toLabel(name: string): string {
  return name.replace(/_id$/, '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function getDisplayField(entity: EntityConfig): string {
  if (entity.displayField) return entity.displayField;
  const fields = parseFields(entity.fields);
  const nombreField = fields.find(f => f.name === 'nombre' || f.name === 'name');
  if (nombreField) return nombreField.name;
  const stringField = fields.find(f => f.type === 'string');
  return stringField?.name || 'id';
}

// ==================== BACKEND GENERATORS ====================

function generateModel(entity: EntityConfig, allEntities: EntityConfig[]): string {
  const fields = parseFields(entity.fields);
  const imports = new Set(['Column', 'Integer', 'String', 'Boolean', 'ForeignKey', 'DateTime']);
  const relationships: string[] = [];

  fields.forEach(f => {
    if (f.type === 'text') imports.add('Text');
    if (f.type === 'json') imports.add('JSON');
    if (f.type === 'decimal' || f.type === 'float') imports.add('Float');
    if (f.type === 'date') imports.add('Date');
    if (f.type === 'fk' && f.fkModel) {
      const relName = f.name.replace(/_id$/, '');
      relationships.push(`    ${relName} = relationship("${f.fkModel}", lazy="joined")`);
    }
  });

  // Si es master, agregar relación con detalles
  if (entity.masterDetail) {
    const detailEntity = allEntities.find(e => e.isDetail && e.masterEntity === entity.name);
    if (detailEntity) {
      relationships.push(`    detalles = relationship("${detailEntity.name}", back_populates="${entity.name.toLowerCase()}", lazy="joined")`);
    }
  }

  // Si es detalle, agregar back_populates al master
  if (entity.isDetail && entity.masterEntity) {
    const masterLower = entity.masterEntity.toLowerCase();
    // Buscar y modificar la relación existente del master
    const masterFkIdx = relationships.findIndex(r => r.includes(`"${entity.masterEntity}"`));
    if (masterFkIdx >= 0) {
      relationships[masterFkIdx] = `    ${masterLower} = relationship("${entity.masterEntity}", back_populates="detalles")`;
    }
  }

  const columns = fields.map(f => {
    const sqlType = getSqlAlchemyType(f);
    const nullable = f.required ? 'False' : 'True';
    if (f.type === 'fk' && f.fkTable) {
      return `    ${f.name} = Column(Integer, ForeignKey("${f.fkTable}.id"), nullable=${nullable})`;
    }
    return `    ${f.name} = Column(${sqlType}, nullable=${nullable})`;
  });

  // Determinar si necesita activo (los detalles normalmente no)
  const needsActivo = !entity.isDetail;

  return `"""Modelo ${entity.name}"""
from sqlalchemy import ${Array.from(imports).join(', ')}
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class ${entity.name}(Base):
    __tablename__ = "${entity.table}"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=True)

${columns.join('\n')}
${needsActivo ? '\n    activo = Column(Boolean, default=True)' : ''}
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    organizacion = relationship("Organizacion")
${relationships.join('\n')}
`;
}

function generateSchema(entity: EntityConfig): string {
  const fields = parseFields(entity.fields);
  const needsEmailStr = fields.some(f => f.type === 'email');
  const needsDatetime = fields.some(f => f.type === 'datetime');
  const needsDate = fields.some(f => f.type === 'date');

  const imports: string[] = ['BaseModel', 'ConfigDict'];
  if (needsEmailStr) imports.push('EmailStr');

  const extraImports: string[] = [];
  if (needsDatetime || needsDate) extraImports.push('from datetime import datetime, date');

  const createFields = fields.map(f => {
    const pyType = getPydanticType(f);
    const optional = f.required ? '' : ' | None = None';
    return `    ${f.name}: ${pyType}${optional}`;
  });

  const updateFields = fields.map(f => {
    const pyType = getPydanticType(f);
    return `    ${f.name}: ${pyType} | None = None`;
  });

  const needsActivo = !entity.isDetail;

  return `"""Schemas ${entity.name}"""
from pydantic import ${imports.join(', ')}
from typing import Optional
${extraImports.join('\n')}

class ${entity.name}Base(BaseModel):
${createFields.join('\n')}

class ${entity.name}Create(${entity.name}Base):
    pass

class ${entity.name}Update(BaseModel):
${updateFields.join('\n')}

class ${entity.name}Response(${entity.name}Base):
    id: int
    organizacion_id: int | None = None${needsActivo ? '\n    activo: bool' : ''}
    model_config = ConfigDict(from_attributes=True)
`;
}

function generateApi(entity: EntityConfig, allEntities: EntityConfig[]): string {
  const nameLower = entity.name.toLowerCase();
  const fields = parseFields(entity.fields);
  const fkFields = fields.filter(f => f.type === 'fk' && f.fkModel);
  const hasJoinedLoads = fkFields.length > 0;

  const joinedLoadImport = hasJoinedLoads ? 'from sqlalchemy.orm import joinedload' : '';
  const joinedLoads = fkFields.map(f => {
    const relName = f.name.replace(/_id$/, '');
    return `joinedload(${entity.name}.${relName})`;
  });
  const optionsStr = hasJoinedLoads ? `.options(${joinedLoads.join(', ')})` : '';

  // Para detalles, agregar filtro por master_id
  const masterField = entity.isDetail ? fields.find(f => f.fkModel === entity.masterEntity) : null;
  const masterFilterParam = masterField ? `\n    ${masterField.name}: Optional[int] = None,` : '';
  const masterFilterQuery = masterField ? `
    if ${masterField.name} is not None:
        query = query.where(${entity.name}.${masterField.name} == ${masterField.name})` : '';

  // Serialización
  const serializeRelations = fkFields.map(f => {
    const relEntity = allEntities.find(e => e.name === f.fkModel);
    if (!relEntity) return '';
    const relName = f.name.replace(/_id$/, '');
    const displayField = getDisplayField(relEntity);
    return `    if hasattr(item, '${relName}') and item.${relName}:
        data['${relName}'] = {'id': item.${relName}.id, '${displayField}': item.${relName}.${displayField}}`;
  }).filter(Boolean);

  const needsActivo = !entity.isDetail;
  const activoField = needsActivo ? `        'activo': item.activo,\n` : '';
  const activoParam = needsActivo ? `\n    activo: Optional[bool] = None,` : '';
  const activoFilter = needsActivo ? `
    if activo is not None:
        query = query.where(${entity.name}.activo == activo)` : '';

  const serializeFn = hasJoinedLoads ? `
def serialize_${nameLower}(item):
    data = {
        'id': item.id,
        'organizacion_id': item.organizacion_id,
${activoField}${fields.map(f => `        '${f.name}': item.${f.name},`).join('\n')}
    }
${serializeRelations.join('\n')}
    return data
` : '';

  const itemsSerializer = hasJoinedLoads ? `[serialize_${nameLower}(item) for item in items]` : 'items';

  // Delete: hard delete para detalles, soft delete para masters
  const deleteLogic = entity.isDetail
    ? `    await db.delete(item)
    await db.commit()
    return {"message": "Eliminado"}`
    : `    item.activo = False
    await db.commit()
    return {"message": "${entity.name} eliminado"}`;

  return `"""API ${entity.name}"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
${joinedLoadImport}

from core.database import get_db
from core.security import get_current_user
from models.${nameLower} import ${entity.name}
from schemas.${nameLower} import ${entity.name}Create, ${entity.name}Update, ${entity.name}Response

router = APIRouter(prefix="/${entity.plural}")
${serializeFn}
@router.get("")
async def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),${activoParam}${masterFilterParam}
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(${entity.name})${optionsStr}.where(${entity.name}.organizacion_id == current_user.organizacion_id)${activoFilter}${masterFilterQuery}

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    query = query.offset(skip).limit(limit).order_by(${entity.name}.id.desc())
    result = await db.execute(query)
    items = result.unique().scalars().all()
    return {"items": ${itemsSerializer}, "total": total}

@router.get("/{id}")
async def obtener(id: int, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    result = await db.execute(select(${entity.name})${optionsStr}.where(${entity.name}.id == id, ${entity.name}.organizacion_id == current_user.organizacion_id))
    item = result.unique().scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return ${hasJoinedLoads ? `serialize_${nameLower}(item)` : 'item'}

@router.post("")
async def crear(data: ${entity.name}Create, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    item = ${entity.name}(**data.model_dump(), organizacion_id=current_user.organizacion_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Creado"}

@router.put("/{id}")
async def actualizar(id: int, data: ${entity.name}Update, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    result = await db.execute(select(${entity.name}).where(${entity.name}.id == id, ${entity.name}.organizacion_id == current_user.organizacion_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Actualizado"}

@router.delete("/{id}")
async def eliminar(id: int, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    result = await db.execute(select(${entity.name}).where(${entity.name}.id == id, ${entity.name}.organizacion_id == current_user.organizacion_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
${deleteLogic}
`;
}

// ==================== FRONTEND GENERATOR ====================

function generateFrontendABM(entity: EntityConfig, allEntities: EntityConfig[]): string {
  const fields = parseFields(entity.fields);
  const visibleFields = fields.filter(f => !['password_hash', 'organizacion_id'].includes(f.name));
  const fkFields = fields.filter(f => f.type === 'fk' && f.fkModel);

  // Detectar si es master-detail
  const detailEntity = entity.masterDetail
    ? allEntities.find(e => e.isDetail && e.masterEntity === entity.name)
    : null;
  const isMasterDetail = !!detailEntity;

  let detailFields: ParsedField[] = [];
  let detailFkFields: ParsedField[] = [];
  let detailMasterFk: ParsedField | undefined;

  if (isMasterDetail && detailEntity) {
    detailFields = parseFields(detailEntity.fields);
    detailFkFields = detailFields.filter(f => f.type === 'fk' && f.fkModel && f.fkModel !== entity.name);
    detailMasterFk = detailFields.find(f => f.fkModel === entity.name);
  }

  // Combinar FKs de master y detalle
  const allFkFields = isMasterDetail ? [...fkFields, ...detailFkFields] : fkFields;

  // Interfaces para FK
  const relatedInterfaces = allFkFields.map(f => {
    const relEntity = allEntities.find(e => e.name === f.fkModel);
    if (!relEntity) return '';
    const displayField = getDisplayField(relEntity);
    if (f.fkModel === 'Producto') {
      return `interface ${f.fkModel}Option { id: number; ${displayField}: string; precio?: number; }`;
    }
    return `interface ${f.fkModel}Option { id: number; ${displayField}: string; }`;
  }).filter(Boolean);

  // States para combos
  const relatedStates = allFkFields.map(f => {
    const varName = toCamelCase(f.name.replace(/_id$/, '') + 'Options');
    return `  const [${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}] = useState<${f.fkModel}Option[]>([]);`;
  });

  // Fetches para combos
  const relatedFetches = allFkFields.map(f => {
    const relEntity = allEntities.find(e => e.name === f.fkModel);
    if (!relEntity) return '';
    const varName = toCamelCase(f.name.replace(/_id$/, '') + 'Options');
    const setterName = 'set' + varName.charAt(0).toUpperCase() + varName.slice(1);
    return `    api.get('/${relEntity.plural}?limit=500&activo=true').then(r => ${setterName}(r.data.items || [])).catch(() => {});`;
  }).filter(Boolean);

  // Interface del master
  const interfaceFields = fields.map(f => {
    if (f.type === 'fk' && f.fkModel) {
      const relEntity = allEntities.find(e => e.name === f.fkModel);
      const relName = f.name.replace(/_id$/, '');
      const displayField = relEntity ? getDisplayField(relEntity) : 'nombre';
      return `  ${f.name}${f.required ? '' : '?'}: ${getTsType(f)};\n  ${relName}?: { id: number; ${displayField}: string };`;
    }
    return `  ${f.name}${f.required ? '' : '?'}: ${getTsType(f)};`;
  }).join('\n');

  // Interface del detalle (si aplica)
  let detailInterface = '';
  if (isMasterDetail && detailEntity) {
    const detailInterfaceFields = detailFields.filter(f => f.fkModel !== entity.name).map(f => {
      if (f.type === 'fk' && f.fkModel) {
        const relEntity = allEntities.find(e => e.name === f.fkModel);
        const relName = f.name.replace(/_id$/, '');
        const displayField = relEntity ? getDisplayField(relEntity) : 'nombre';
        return `  ${f.name}${f.required ? '' : '?'}: number;\n  ${relName}?: { id: number; ${displayField}: string };`;
      }
      return `  ${f.name}${f.required ? '' : '?'}: ${getTsType(f)};`;
    }).join('\n');

    detailInterface = `
interface ${detailEntity.name} {
  id?: number;
${detailInterfaceFields}
}`;
  }

  // Form fields del master (sin totales que se calculan automáticamente si es master-detail)
  const excludeFromForm = isMasterDetail ? ['subtotal', 'total'] : [];
  const formFields = visibleFields
    .filter(f => !excludeFromForm.includes(f.name))
    .map(f => {
      if (f.type === 'fk' && f.fkModel) {
        const relEntity = allEntities.find(e => e.name === f.fkModel);
        if (!relEntity) return '';
        const displayField = getDisplayField(relEntity);
        const varName = toCamelCase(f.name.replace(/_id$/, '') + 'Options');
        return `            <ABMSelect label="${toLabel(f.name)}" value={formData.${f.name}?.toString() || ''} onChange={(e) => setFormData({...formData, ${f.name}: e.target.value ? Number(e.target.value) : undefined})} options={${varName}.map(o => ({ value: o.id.toString(), label: o.${displayField} }))} placeholder="Seleccionar..." ${f.required ? 'required' : ''} />`;
      }
      if (f.type === 'enum' && f.enumValues) {
        const options = f.enumValues.map(v => `{ value: '${v}', label: '${v.charAt(0).toUpperCase() + v.slice(1)}' }`).join(', ');
        return `            <ABMSelect label="${toLabel(f.name)}" value={formData.${f.name} || ''} onChange={(e) => setFormData({...formData, ${f.name}: e.target.value})} options={[${options}]} placeholder="Seleccionar..." ${f.required ? 'required' : ''} />`;
      }
      if (f.type === 'text') {
        return `            <ABMTextarea label="${toLabel(f.name)}" value={formData.${f.name} || ''} onChange={(e) => setFormData({...formData, ${f.name}: e.target.value})} rows={2} />`;
      }
      if (f.type === 'date') {
        return `            <ABMInput label="${toLabel(f.name)}" type="date" value={formData.${f.name} || ''} onChange={(e) => setFormData({...formData, ${f.name}: e.target.value})} ${f.required ? 'required' : ''} />`;
      }
      if (f.type === 'datetime') {
        return `            <ABMInput label="${toLabel(f.name)}" type="datetime-local" value={formData.${f.name} || ''} onChange={(e) => setFormData({...formData, ${f.name}: e.target.value})} ${f.required ? 'required' : ''} />`;
      }
      const isNumeric = ['integer', 'int', 'decimal', 'float'].includes(f.type);
      const inputType = f.type === 'email' ? 'email' : isNumeric ? 'number' : 'text';
      const step = ['decimal', 'float'].includes(f.type) ? 'step="0.01"' : '';
      return `            <ABMInput label="${toLabel(f.name)}" type="${inputType}" ${step} value={formData.${f.name}${isNumeric ? ' ?? ""' : ' || ""'}} onChange={(e) => setFormData({...formData, ${f.name}: ${isNumeric ? 'e.target.value ? Number(e.target.value) : undefined' : 'e.target.value'}})} ${f.required ? 'required' : ''} />`;
    }).filter(Boolean).join('\n');

  // Columnas de tabla
  const tableFields = visibleFields.filter(f => !['subtotal', 'descuento', 'notas'].includes(f.name) && f.type !== 'text').slice(0, 5);
  const columns = tableFields.map(f => {
    if (f.type === 'fk' && f.fkModel) {
      const relEntity = allEntities.find(e => e.name === f.fkModel);
      if (!relEntity) return `    { key: '${f.name}', header: '${toLabel(f.name)}' },`;
      const displayField = getDisplayField(relEntity);
      const relName = f.name.replace(/_id$/, '');
      return `    { key: '${f.name}', header: '${toLabel(f.name)}', render: (item: ${entity.name}) => item.${relName}?.${displayField} || '-' },`;
    }
    if (f.type === 'enum') {
      return `    { key: '${f.name}', header: '${toLabel(f.name)}', render: (item: ${entity.name}) => <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getEstadoColor(item.${f.name} || ''), color: '#fff' }}>{item.${f.name}}</span> },`;
    }
    if (['decimal', 'float'].includes(f.type)) {
      return `    { key: '${f.name}', header: '${toLabel(f.name)}', render: (item: ${entity.name}) => '$' + (item.${f.name}?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00') },`;
    }
    return `    { key: '${f.name}', header: '${toLabel(f.name)}' },`;
  }).join('\n');

  // Estados y lógica de detalle
  let detailStates = '';
  let detailCalcs = '';
  let detailHandlers = '';
  let detailFormUI = '';
  let detailSubmitLogic = '';
  let detailEditLoad = '';

  if (isMasterDetail && detailEntity) {
    // Detectar el FK principal del detalle (el que NO es el master) - GENÉRICO
    const itemFk = detailFkFields[0]; // Primer FK que no es el master
    if (!itemFk) {
      console.warn(`  ⚠ ${detailEntity.name} no tiene FK de item (solo master)`);
    }

    const itemEntity = itemFk ? allEntities.find(e => e.name === itemFk.fkModel) : null;
    const itemDisplayField = itemEntity ? getDisplayField(itemEntity) : 'nombre';
    const itemFkName = itemFk?.name || 'item_id'; // ej: producto_id, servicio_id
    const itemRelName = itemFkName.replace(/_id$/, ''); // ej: producto, servicio
    const itemVarName = toCamelCase(itemRelName + 'Options'); // ej: productoOptions
    const itemLabel = toLabel(itemRelName); // ej: "Producto", "Servicio"

    // Detectar si el item tiene campo precio
    const itemFields = itemEntity ? parseFields(itemEntity.fields) : [];
    const hasPrecio = itemFields.some(f => f.name === 'precio');

    // Detectar campos numéricos del detalle para el form
    const cantidadField = detailFields.find(f => f.name === 'cantidad');
    const precioField = detailFields.find(f => f.name === 'precio_unitario');
    const subtotalField = detailFields.find(f => f.name === 'subtotal');
    const descuentoField = detailFields.find(f => f.name === 'descuento');

    detailStates = `
  // Detalles inline
  const [detalles, setDetalles] = useState<${detailEntity.name}[]>([]);
  const [detalleForm, setDetalleForm] = useState<Partial<${detailEntity.name}>>({${cantidadField ? ' cantidad: 1' : ''} });`;

    detailCalcs = subtotalField ? `
  // Calcular totales
  const subtotal = detalles.reduce((sum, d) => sum + (d.subtotal || 0), 0);
  const descuento = formData.descuento || 0;
  const total = subtotal - descuento;` : '';

    detailHandlers = `
  // Handlers de detalle
  const handleItemChange = (itemId: string) => {
    const item = ${itemVarName}.find(p => p.id === parseInt(itemId));
    setDetalleForm({
      ...detalleForm,
      ${itemFkName}: itemId ? Number(itemId) : undefined,${hasPrecio && precioField ? `
      precio_unitario: item?.precio || 0,` : ''}
    });
  };

  const agregarDetalle = () => {
    if (!detalleForm.${itemFkName}${cantidadField ? ' || !detalleForm.cantidad' : ''}${precioField ? ' || !detalleForm.precio_unitario' : ''}) {
      toast.error('Complete los campos requeridos');
      return;
    }
    if (detalles.some(d => d.${itemFkName} === detalleForm.${itemFkName})) {
      toast.error('El item ya está agregado');
      return;
    }
    const item = ${itemVarName}.find(p => p.id === detalleForm.${itemFkName});
    const nuevoDetalle: ${detailEntity.name} = {
      ${itemFkName}: detalleForm.${itemFkName},
      ${itemRelName}: item ? { id: item.id, ${itemDisplayField}: item.${itemDisplayField} } : undefined,${cantidadField ? `
      cantidad: detalleForm.cantidad,` : ''}${precioField ? `
      precio_unitario: detalleForm.precio_unitario,` : ''}${descuentoField ? `
      descuento: detalleForm.descuento || 0,` : ''}${subtotalField && cantidadField && precioField ? `
      subtotal: (detalleForm.cantidad || 0) * (detalleForm.precio_unitario || 0),` : ''}
    };
    setDetalles([...detalles, nuevoDetalle]);
    setDetalleForm({${cantidadField ? ' cantidad: 1' : ''} });
  };

  const eliminarDetalle = (index: number) => setDetalles(detalles.filter((_, i) => i !== index));
${cantidadField && subtotalField ? `
  const actualizarCantidad = (index: number, cantidad: number) => {
    if (cantidad <= 0) return;
    const nuevos = [...detalles];
    nuevos[index].cantidad = cantidad;
    nuevos[index].subtotal = cantidad * (nuevos[index].precio_unitario || 0);
    setDetalles(nuevos);
  };` : ''}`;

    // UI del detalle - genérica
    const selectOptions = hasPrecio
      ? `{${itemVarName}.map(p => <option key={p.id} value={p.id}>{p.${itemDisplayField}} (\${p.precio?.toFixed(2) || '0'})</option>)}`
      : `{${itemVarName}.map(p => <option key={p.id} value={p.id}>{p.${itemDisplayField}}</option>)}`;

    const itemDisplay = `{det.${itemRelName}?.${itemDisplayField} || \`#\${det.${itemFkName}}\`}`;

    detailFormUI = `
          {/* Sección Detalle */}
          <div style={{ borderTop: \`1px solid \${theme.border}\`, paddingTop: '1rem', marginTop: '1rem' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: theme.textSecondary }}>Detalle</h3>
            <div className="flex gap-2 mb-4">
              <select value={detalleForm.${itemFkName} || ''} onChange={(e) => handleItemChange(e.target.value)} className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: theme.backgroundSecondary, border: \`1px solid \${theme.border}\`, color: theme.text }}>
                <option value="">${itemLabel}...</option>
                ${selectOptions}
              </select>${cantidadField ? `
              <input type="number" min="1" value={detalleForm.cantidad || ''} onChange={(e) => setDetalleForm({ ...detalleForm, cantidad: Number(e.target.value) })} placeholder="Cant" className="w-20 px-3 py-2 rounded-lg text-sm text-center" style={{ backgroundColor: theme.backgroundSecondary, border: \`1px solid \${theme.border}\`, color: theme.text }} />` : ''}${precioField ? `
              <input type="number" step="0.01" value={detalleForm.precio_unitario || ''} onChange={(e) => setDetalleForm({ ...detalleForm, precio_unitario: Number(e.target.value) })} placeholder="Precio" className="w-28 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: theme.backgroundSecondary, border: \`1px solid \${theme.border}\`, color: theme.text }} />` : ''}
              <button type="button" onClick={agregarDetalle} className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#22c55e' }}><Plus className="w-5 h-5" /></button>
            </div>
            {detalles.length === 0 ? (
              <div className="text-center py-6 text-sm" style={{ color: theme.textSecondary }}>No hay items</div>
            ) : (
              <div className="space-y-2">
                {detalles.map((det, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSecondary }}>
                    <div className="flex-1">
                      <div className="font-medium text-sm" style={{ color: theme.text }}>${itemDisplay}</div>${precioField && cantidadField ? `
                      <div className="text-xs" style={{ color: theme.textSecondary }}>\${det.precio_unitario?.toFixed(2)} x {det.cantidad}</div>` : ''}
                    </div>${cantidadField && subtotalField ? `
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => actualizarCantidad(idx, (det.cantidad || 1) - 1)} className="w-8 h-8 flex items-center justify-center rounded" style={{ backgroundColor: theme.border }}>-</button>
                      <span className="w-8 text-center text-sm font-medium" style={{ color: theme.text }}>{det.cantidad}</span>
                      <button type="button" onClick={() => actualizarCantidad(idx, (det.cantidad || 0) + 1)} className="w-8 h-8 flex items-center justify-center rounded" style={{ backgroundColor: theme.border }}>+</button>
                    </div>
                    <div className="w-24 text-right font-medium text-sm" style={{ color: theme.text }}>\${det.subtotal?.toFixed(2)}</div>` : ''}
                    <button type="button" onClick={() => eliminarDetalle(idx)} className="p-2 rounded-lg text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}${subtotalField ? `
            {detalles.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: \`1px solid \${theme.border}\` }}>
                <div className="flex justify-between text-sm mb-1"><span style={{ color: theme.textSecondary }}>Subtotal:</span><span style={{ color: theme.text }}>\${subtotal.toFixed(2)}</span></div>
                {descuento > 0 && <div className="flex justify-between text-sm mb-1 text-red-500"><span>Descuento:</span><span>-\${descuento.toFixed(2)}</span></div>}
                <div className="flex justify-between text-lg font-bold"><span style={{ color: theme.text }}>Total:</span><span style={{ color: theme.primary }}>\${total.toFixed(2)}</span></div>
              </div>
            )}` : ''}
          </div>`;

    detailSubmitLogic = `
      if (detalles.length === 0) {
        toast.error('Agregue al menos un item');
        return;
      }${subtotalField ? `
      const masterData = { ...formData, subtotal, total };` : `
      const masterData = { ...formData };`}`;

    detailEditLoad = `
    // Cargar detalles
    try {
      const res = await api.get(\`/${detailEntity.plural}?${detailMasterFk?.name}=\${item.id}&limit=500\`);
      setDetalles((res.data.items || []).map((d: any) => ({ ...d, subtotal: (d.cantidad || 0) * (d.precio_unitario || 0) })));
    } catch { setDetalles([]); }`;
  }

  // Imports adicionales para master-detail
  const extraImports = isMasterDetail ? ", Plus, X" : "";

  // Initial form con fecha si tiene campo fecha
  const hasDateField = fields.some(f => f.name === 'fecha' && f.type === 'date');
  const hasEstadoField = fields.find(f => f.name === 'estado' && f.type === 'enum');
  let initialFormData = '{}';
  if (hasDateField || hasEstadoField) {
    const parts = [];
    if (hasDateField) parts.push("fecha: new Date().toISOString().split('T')[0]");
    if (hasEstadoField) parts.push(`estado: '${hasEstadoField.enumValues?.[0] || 'pendiente'}'`);
    initialFormData = `{ ${parts.join(', ')} }`;
  }

  // Submit handler
  let submitHandler = '';
  if (isMasterDetail && detailEntity) {
    submitHandler = `
  const handleSubmit = async () => {${detailSubmitLogic}
    setSaving(true);
    try {
      if (editing) {
        await api.put(\`/${entity.plural}/\${editing.id}\`, masterData);
        const existingRes = await api.get(\`/${detailEntity.plural}?${detailMasterFk?.name}=\${editing.id}&limit=500\`);
        for (const det of existingRes.data.items || []) await api.delete(\`/${detailEntity.plural}/\${det.id}\`);
        for (const det of detalles) await api.post('/${detailEntity.plural}', { ...det, ${detailMasterFk?.name}: editing.id });
      } else {
        const res = await api.post('/${entity.plural}', masterData);
        for (const det of detalles) await api.post('/${detailEntity.plural}', { ...det, ${detailMasterFk?.name}: res.data.id });
      }
      toast.success(editing ? 'Actualizado' : 'Creado');
      setSheetOpen(false);
      setFormData(${initialFormData});
      setDetalles([]);
      setEditing(null);
      fetchData();
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };`;
  } else {
    submitHandler = `
  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(\`/${entity.plural}/\${editing.id}\`, formData);
      } else {
        await api.post('/${entity.plural}', formData);
      }
      toast.success(editing ? 'Actualizado' : 'Creado');
      setSheetOpen(false);
      setFormData({});
      setEditing(null);
      fetchData();
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };`;
  }

  // Edit handler
  let editHandler = '';
  if (isMasterDetail) {
    editHandler = `
  const handleEdit = async (item: ${entity.name}) => {
    setEditing(item);
    setFormData(item);${detailEditLoad}
    setSheetOpen(true);
  };`;
  } else {
    editHandler = `
  const handleEdit = (item: ${entity.name}) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };`;
  }

  // Add handler
  let addHandler = '';
  if (isMasterDetail) {
    addHandler = `
  const handleAdd = () => {
    setEditing(null);
    setFormData(${initialFormData});
    setDetalles([]);
    setDetalleForm({ cantidad: 1 });
    setSheetOpen(true);
  };`;
  } else {
    addHandler = `
  const handleAdd = () => {
    setEditing(null);
    setFormData(${initialFormData});
    setSheetOpen(true);
  };`;
  }

  // getEstadoColor helper
  const hasEnumEstado = fields.some(f => f.name === 'estado' && f.type === 'enum');
  const estadoColorHelper = hasEnumEstado ? `
const getEstadoColor = (estado: string) => {
  const colors: Record<string, string> = {
    pendiente: '#f59e0b', confirmado: '#3b82f6', preparando: '#8b5cf6',
    enviado: '#06b6d4', entregado: '#22c55e', cancelado: '#ef4444',
    parcial: '#f59e0b', recibido: '#22c55e'
  };
  return colors[estado] || '#6b7280';
};
` : '';

  return `import { useState, useEffect } from 'react';
import { ${entity.icon}, Pencil, Trash2${extraImports} } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../lib/api';
import { ABMPage, ABMCard, ABMCardActions, ABMTable, ABMTableAction, ABMInput, ABMTextarea, ABMSelect, ABMSheetFooter, ABMBadge } from '../../components/ui/ABMPage';

${[...new Set(relatedInterfaces)].join('\n')}
${detailInterface}
interface ${entity.name} {
  id: number;
${interfaceFields}
  activo: boolean;
}
${estadoColorHelper}
export default function ${entity.name}ABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<${entity.name}[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<${entity.name} | null>(null);
  const [formData, setFormData] = useState<Partial<${entity.name}>>(${initialFormData});
  const [saving, setSaving] = useState(false);
${relatedStates.join('\n')}${detailStates}

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/${entity.plural}?limit=100');
      setItems(res.data.items || []);
    } catch { toast.error('Error al cargar'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
${relatedFetches.join('\n')}
  }, []);

  const filteredItems = items.filter(item => {
    if (!search) return true;
    return Object.values(item).some(val => String(val).toLowerCase().includes(search.toLowerCase()));
  });
${detailCalcs}${detailHandlers}
${submitHandler}
${editHandler}

  const handleDelete = async (id: number) => {
    try { await api.delete(\`/${entity.plural}/\${id}\`); toast.success('Eliminado'); fetchData(); }
    catch { toast.error('Error al eliminar'); }
  };
${addHandler}

  const columns = [
    { key: 'id', header: 'ID' },
${columns}
    { key: 'activo', header: 'Estado', render: (item: ${entity.name}) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <ABMPage
      title="${entity.plural.charAt(0).toUpperCase() + entity.plural.slice(1)}"
      icon={<${entity.icon} className="h-5 w-5" />}
      buttonLabel="Nuevo"
      onAdd={handleAdd}
      searchPlaceholder="Buscar..."
      searchValue={search}
      onSearchChange={setSearch}
      loading={loading}
      isEmpty={filteredItems.length === 0}
      emptyMessage="No hay registros"
      sheetOpen={sheetOpen}
      sheetTitle={editing ? 'Editar' : 'Nuevo'}
      onSheetClose={() => setSheetOpen(false)}
      sheetContent={
        <div className="space-y-4">
${formFields}${detailFormUI}
        </div>
      }
      sheetFooter={<ABMSheetFooter onCancel={() => setSheetOpen(false)} onSave={handleSubmit} saving={saving} />}
      tableView={<ABMTable data={filteredItems} columns={columns} keyExtractor={(item) => item.id} onRowClick={handleEdit} actions={(item) => (<><ABMTableAction icon={<Pencil className="h-4 w-4" />} onClick={() => handleEdit(item)} title="Editar" /><ABMTableAction icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(item.id)} title="Eliminar" variant="danger" /></>)} />}
    >
      {filteredItems.map((item, index) => (
        <ABMCard key={item.id} onClick={() => handleEdit(item)} index={index}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: \`\${theme.primary}15\` }}>
                <${entity.icon} className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>{item.${fields[0]?.name || 'id'} || 'ID: ' + item.id}</h3>
                ${hasEnumEstado ? `<span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getEstadoColor(item.estado || '') }}>{item.estado}</span>` : ''}
              </div>
            </div>
            <ABMBadge active={item.activo} />
          </div>
          <div className="flex justify-end mt-3 pt-3" style={{ borderTop: \`1px solid \${theme.border}\` }}>
            <ABMCardActions onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />
          </div>
        </ABMCard>
      ))}
    </ABMPage>
  );
}
`;
}

// ==================== FILE UPDATES ====================

function updateModelsInit(entities: EntityConfig[]): void {
  const initPath = path.join(BACKEND_PATH, 'models', '__init__.py');
  let existingContent = fs.existsSync(initPath) ? fs.readFileSync(initPath, 'utf-8') : '';

  const baseImports = ['from .enums import RolUsuario'];
  const baseExports = ['"RolUsuario"'];

  if (existingContent.includes('from .usuario import Usuario')) {
    baseImports.push('from .usuario import Usuario');
    baseExports.push('"Usuario"');
  }
  if (existingContent.includes('from .organizacion import Organizacion')) {
    baseImports.push('from .organizacion import Organizacion');
    baseExports.push('"Organizacion"');
  }

  const imports = entities.map(e => `from .${e.name.toLowerCase()} import ${e.name}`).join('\n');
  const exports = entities.map(e => `    "${e.name}",`).join('\n');

  const content = `# Modelos - Generado por CLI
${baseImports.join('\n')}

${imports}

__all__ = [
${baseExports.map(e => `    ${e},`).join('\n')}
${exports}
]
`;
  fs.writeFileSync(initPath, content);
  console.log('  ✓ models/__init__.py');
}

function updateSchemasInit(entities: EntityConfig[]): void {
  const initPath = path.join(BACKEND_PATH, 'schemas', '__init__.py');
  const imports = entities.map(e => `from .${e.name.toLowerCase()} import ${e.name}Create, ${e.name}Update, ${e.name}Response`).join('\n');
  const exports = entities.map(e => `    "${e.name}Create", "${e.name}Update", "${e.name}Response",`).join('\n');
  const content = `# Schemas - Generado por CLI
${imports}

__all__ = [
${exports}
]
`;
  fs.writeFileSync(initPath, content);
  console.log('  ✓ schemas/__init__.py');
}

function updateApiInit(entities: EntityConfig[]): void {
  const initPath = path.join(BACKEND_PATH, 'api', '__init__.py');
  const imports = entities.map(e => `from .${e.plural} import router as ${e.plural}_router`).join('\n');
  const includes = entities.map(e => `api_router.include_router(${e.plural}_router, tags=["${e.name}"])`).join('\n');
  const content = `from fastapi import APIRouter
from .auth import router as auth_router
from .ws import router as ws_router

${imports}

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(ws_router, tags=["WebSocket"])

${includes}
`;
  fs.writeFileSync(initPath, content);
  console.log('  ✓ api/__init__.py');
}

// ==================== MAIN ====================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Uso: npx tsx generate-crud.ts <archivo.json>');
    console.log('\nSoporte de Tipos:');
    console.log('  - FK (ComboBox)');
    console.log('  - Enum/Radio (Select/RadioGroup)');
    console.log('  - DatePicker (date input)');
    console.log('  - RichText (WYSIWYG editor)');
    console.log('  - File (file upload)');
    console.log('  - Tags (tag input)');
    console.log('  - Master-Detail (inline form)');
    process.exit(1);
  }

  const configPath = path.join(__dirname, args[0]);
  if (!fs.existsSync(configPath)) {
    console.error(`Error: Archivo no encontrado: ${configPath}`);
    process.exit(1);
  }

  const config: ModuleConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  currentEntities = config.entities;

  const masterDetailEntities = config.entities.filter(e => e.masterDetail);
  const detailEntities = config.entities.filter(e => e.isDetail);

  console.log(`\n🚀 Generando CRUDs para: ${config.module.name}`);
  console.log(`   Entidades: ${config.entities.length}`);
  if (masterDetailEntities.length > 0) {
    console.log(`   Master-Detail: ${masterDetailEntities.map(e => e.name).join(', ')}`);
  }
  console.log('');

  const frontendDir = path.join(FRONTEND_PATH, 'pages', config.module.folder);
  fs.mkdirSync(frontendDir, { recursive: true });

  // Backend
  console.log('📦 Backend...');
  for (const entity of config.entities) {
    const modelPath = path.join(BACKEND_PATH, 'models', `${entity.name.toLowerCase()}.py`);
    const schemaPath = path.join(BACKEND_PATH, 'schemas', `${entity.name.toLowerCase()}.py`);
    const apiPath = path.join(BACKEND_PATH, 'api', `${entity.plural}.py`);

    fs.writeFileSync(modelPath, generateModel(entity, config.entities));
    fs.writeFileSync(schemaPath, generateSchema(entity));
    fs.writeFileSync(apiPath, generateApi(entity, config.entities));
    console.log(`  ✓ ${entity.name}`);
  }

  updateModelsInit(config.entities);
  updateSchemasInit(config.entities);
  updateApiInit(config.entities);

  // Frontend - saltar entidades de detalle
  console.log('\n📱 Frontend...');
  for (const entity of config.entities) {
    if (entity.isDetail) {
      console.log(`  ⏭ ${entity.name} (detalle de ${entity.masterEntity})`);
      continue;
    }

    const abmPath = path.join(frontendDir, `${entity.name}ABM.tsx`);
    fs.writeFileSync(abmPath, generateFrontendABM(entity, config.entities));

    if (entity.masterDetail) {
      const detail = detailEntities.find(d => d.masterEntity === entity.name);
      console.log(`  ✓ ${entity.name}ABM.tsx (con ${detail?.name || 'detalle'} inline)`);
    } else {
      console.log(`  ✓ ${entity.name}ABM.tsx`);
    }
  }

  console.log('\n✅ Listo!');
}

main().catch(console.error);
