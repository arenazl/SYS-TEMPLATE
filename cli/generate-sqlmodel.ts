#!/usr/bin/env npx tsx
/**
 * Generador de CRUDs con SQLModel v1
 *
 * Genera backend usando SQLModel (modelo+schema unificado) y API genérica
 *
 * El frontend NO se genera - usa DynamicABM que interpreta el JSON en runtime
 *
 * Uso: npx tsx generate-sqlmodel.ts <archivo.json>
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

// Global para acceder a las entidades durante el parsing
let currentEntities: EntityConfig[] = [];

// ==================== FIELD PARSING ====================

function parseFields(fieldsStr: string): ParsedField[] {
  return fieldsStr.split(' ').filter(Boolean).map(fieldDef => {
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

    return { name, type, required: isRequired };
  });
}

function getPythonType(field: ParsedField): string {
  const map: Record<string, string> = {
    string: 'str',
    text: 'str',
    integer: 'int',
    int: 'int',
    decimal: 'float',
    float: 'float',
    bool: 'bool',
    boolean: 'bool',
    datetime: 'datetime',
    date: 'date',
    email: 'EmailStr',
    json: 'dict',  // Se maneja especialmente en getFieldDefinition
    enum: 'str',
    fk: 'int'
  };
  return map[field.type] || 'str';
}

function getFieldDefinition(field: ParsedField): string {
  const pyType = getPythonType(field);
  const optional = !field.required;

  if (field.type === 'fk' && field.fkTable) {
    if (optional) {
      return `${field.name}: int | None = Field(default=None, foreign_key="${field.fkTable}.id")`;
    }
    return `${field.name}: int = Field(foreign_key="${field.fkTable}.id")`;
  }

  // Campos JSON usan sa_type=JSON de SQLAlchemy
  if (field.type === 'json') {
    if (optional) {
      return `${field.name}: dict | None = Field(default=None, sa_type=JSON)`;
    }
    return `${field.name}: dict = Field(sa_type=JSON)`;
  }

  if (optional) {
    return `${field.name}: ${pyType} | None = None`;
  }
  return `${field.name}: ${pyType}`;
}

function getDisplayField(entity: EntityConfig): string {
  if (entity.displayField) return entity.displayField;
  const fields = parseFields(entity.fields);
  const nombreField = fields.find(f => f.name === 'nombre' || f.name === 'name');
  if (nombreField) return nombreField.name;
  const stringField = fields.find(f => f.type === 'string');
  return stringField?.name || 'id';
}

// ==================== SQLMODEL GENERATOR ====================

function generateSQLModel(entity: EntityConfig, allEntities: EntityConfig[]): string {
  const fields = parseFields(entity.fields);
  const needsEmailStr = fields.some(f => f.type === 'email');
  const needsDatetime = fields.some(f => f.type === 'datetime' || f.type === 'date');
  const needsJson = fields.some(f => f.type === 'json');
  const fkFields = fields.filter(f => f.type === 'fk' && f.fkModel);
  const needsActivo = !entity.isDetail;

  // Imports
  const imports: string[] = ['from sqlmodel import SQLModel, Field, Relationship'];
  imports.push('from typing import Optional, List, TYPE_CHECKING');
  if (needsDatetime) imports.push('from datetime import datetime, date');
  if (needsEmailStr) imports.push('from pydantic import EmailStr');
  if (needsJson) imports.push('from sqlalchemy import JSON');

  // TYPE_CHECKING imports para evitar circular imports
  const typeCheckingImports = fkFields.map(f =>
    `    from .${f.fkModel!.toLowerCase()} import ${f.fkModel}`
  ).join('\n');

  // Base fields (sin id, sin relaciones)
  const baseFields = fields.map(f => `    ${getFieldDefinition(f)}`).join('\n');

  // Relationship definitions
  const relationships = fkFields.map(f => {
    const relName = f.name.replace(/_id$/, '');
    return `    ${relName}: Optional["${f.fkModel}"] = Relationship()`;
  });

  // Si es master, agregar relación con detalles
  if (entity.masterDetail) {
    const detailEntity = allEntities.find(e => e.isDetail && e.masterEntity === entity.name);
    if (detailEntity) {
      relationships.push(`    detalles: List["${detailEntity.name}"] = Relationship(back_populates="${entity.name.toLowerCase()}")`);
    }
  }

  // Si es detalle, agregar back_populates al master
  if (entity.isDetail && entity.masterEntity) {
    const masterLower = entity.masterEntity.toLowerCase();
    const idx = relationships.findIndex(r => r.includes(`"${entity.masterEntity}"`));
    if (idx >= 0) {
      relationships[idx] = `    ${masterLower}: Optional["${entity.masterEntity}"] = Relationship(back_populates="detalles")`;
    }
  }

  const relationshipsStr = relationships.length > 0
    ? '\n    # Relationships\n' + relationships.join('\n')
    : '';

  return `"""SQLModel para ${entity.name} - Generado automáticamente"""
${imports.join('\n')}

if TYPE_CHECKING:
${typeCheckingImports || '    pass'}


# ============ Base (campos compartidos) ============
class ${entity.name}Base(SQLModel):
${baseFields}


# ============ Modelo de tabla ============
class ${entity.name}(${entity.name}Base, table=True):
    __tablename__ = "${entity.table}"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")${needsActivo ? '\n    activo: bool = Field(default=True)' : ''}
${relationshipsStr}


# ============ Schemas para API ============
class ${entity.name}Create(${entity.name}Base):
    """Para crear - campos requeridos según definición"""
    pass


class ${entity.name}Update(SQLModel):
    """Para actualizar - todos opcionales"""
${fields.map(f => `    ${f.name}: ${getPythonType(f)} | None = None`).join('\n')}


class ${entity.name}Response(${entity.name}Base):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None${needsActivo ? '\n    activo: bool' : ''}
`;
}

// ==================== API GENERATOR ====================

function generateApi(entity: EntityConfig, allEntities: EntityConfig[]): string {
  const nameLower = entity.name.toLowerCase();
  const fields = parseFields(entity.fields);
  const fkFields = fields.filter(f => f.type === 'fk' && f.fkModel);
  const needsActivo = !entity.isDetail;

  // Selectinload para relaciones
  const selectinloads = fkFields.map(f => {
    const relName = f.name.replace(/_id$/, '');
    return `selectinload(${entity.name}.${relName})`;
  });
  const optionsStr = selectinloads.length > 0
    ? `.options(${selectinloads.join(', ')})`
    : '';
  const selectinloadImport = selectinloads.length > 0 ? 'from sqlalchemy.orm import selectinload' : '';

  // Para detalles, agregar filtro por master_id
  const masterField = entity.isDetail ? fields.find(f => f.fkModel === entity.masterEntity) : null;
  const masterFilterParam = masterField ? `\n    ${masterField.name}: int | None = None,` : '';
  const masterFilterQuery = masterField ? `
    if ${masterField.name} is not None:
        query = query.where(${entity.name}.${masterField.name} == ${masterField.name})` : '';

  const activoParam = needsActivo ? `\n    activo: bool | None = None,` : '';
  const activoFilter = needsActivo ? `
    if activo is not None:
        query = query.where(${entity.name}.activo == activo)` : '';

  // Serialización de relaciones
  const serializeRelations = fkFields.map(f => {
    const relEntity = allEntities.find(e => e.name === f.fkModel);
    if (!relEntity) return '';
    const relName = f.name.replace(/_id$/, '');
    const displayField = getDisplayField(relEntity);
    return `    if item.${relName}:
        data["${relName}"] = {"id": item.${relName}.id, "${displayField}": item.${relName}.${displayField}}`;
  }).filter(Boolean);

  const serializeFn = fkFields.length > 0 ? `
def serialize(item: ${entity.name}) -> dict:
    data = item.model_dump()
${serializeRelations.join('\n')}
    return data
` : '';

  const itemsSerializer = fkFields.length > 0 ? '[serialize(item) for item in items]' : '[item.model_dump() for item in items]';
  const singleSerializer = fkFields.length > 0 ? 'serialize(item)' : 'item';

  // Delete: hard delete para detalles, soft delete para masters
  const deleteLogic = entity.isDetail
    ? `    await db.delete(item)
    await db.commit()
    return {"message": "Eliminado"}`
    : `    item.activo = False
    await db.commit()
    return {"message": "Desactivado"}`;

  return `"""API ${entity.name} - Generado automáticamente"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
${selectinloadImport}

from core.database import get_db
from core.security import get_current_user
from models.${nameLower} import ${entity.name}, ${entity.name}Create, ${entity.name}Update

router = APIRouter(prefix="/${entity.plural}")
${serializeFn}

@router.get("")
async def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),${activoParam}${masterFilterParam}
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(${entity.name})${optionsStr}.where(
        ${entity.name}.organizacion_id == current_user.organizacion_id
    )${activoFilter}${masterFilterQuery}

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    query = query.offset(skip).limit(limit).order_by(${entity.name}.id.desc())
    result = await db.execute(query)
    items = result.scalars().all()

    return {"items": ${itemsSerializer}, "total": total}


@router.get("/{id}")
async def obtener(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(${entity.name})${optionsStr}.where(
            ${entity.name}.id == id,
            ${entity.name}.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return ${singleSerializer}


@router.post("")
async def crear(
    data: ${entity.name}Create,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = ${entity.name}(**data.model_dump(), organizacion_id=current_user.organizacion_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Creado"}


@router.put("/{id}")
async def actualizar(
    id: int,
    data: ${entity.name}Update,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(${entity.name}).where(
            ${entity.name}.id == id,
            ${entity.name}.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Actualizado"}


@router.delete("/{id}")
async def eliminar(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(${entity.name}).where(
            ${entity.name}.id == id,
            ${entity.name}.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
${deleteLogic}
`;
}

// ==================== FILE UPDATES ====================

function updateModelsInit(entities: EntityConfig[]): void {
  const initPath = path.join(BACKEND_PATH, 'models', '__init__.py');

  // Importar todos los modelos y schemas desde cada archivo
  const imports = entities.map(e =>
    `from .${e.name.toLowerCase()} import ${e.name}, ${e.name}Create, ${e.name}Update, ${e.name}Response`
  ).join('\n');

  const exports = entities.flatMap(e => [
    `"${e.name}"`,
    `"${e.name}Create"`,
    `"${e.name}Update"`,
    `"${e.name}Response"`,
  ]);

  const content = `"""Modelos SQLModel - Generado automáticamente"""
from .enums import RolUsuario

${imports}

__all__ = [
    "RolUsuario",
${exports.map(e => `    ${e},`).join('\n')}
]
`;
  fs.writeFileSync(initPath, content);
  console.log('  ✓ models/__init__.py');
}

function updateApiInit(entities: EntityConfig[]): void {
  const initPath = path.join(BACKEND_PATH, 'api', '__init__.py');
  const imports = entities.map(e =>
    `from .${e.plural} import router as ${e.plural}_router`
  ).join('\n');
  const includes = entities.map(e =>
    `api_router.include_router(${e.plural}_router, tags=["${e.name}"])`
  ).join('\n');

  const content = `"""API Router - Generado automáticamente"""
from fastapi import APIRouter
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

  console.log('\n🚀 Generador SQLModel v1');
  console.log('========================\n');

  if (args.length === 0) {
    console.log('Uso: npx tsx generate-sqlmodel.ts <archivo.json> [archivo2.json ...]');
    console.log('\nGenera:');
    console.log('  - Modelos SQLModel (modelo + schema unificado)');
    console.log('  - APIs FastAPI');
    console.log('\nEl frontend usa DynamicABM (no se generan archivos)');
    process.exit(1);
  }

  // Cargar todos los configs
  const allEntities: EntityConfig[] = [];
  const configs: ModuleConfig[] = [];

  for (const arg of args) {
    const configPath = path.join(__dirname, arg);
    if (!fs.existsSync(configPath)) {
      console.error(`⚠ Archivo no encontrado: ${configPath}`);
      continue;
    }
    const config: ModuleConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    configs.push(config);
    allEntities.push(...config.entities);
  }

  currentEntities = allEntities;

  // Generar
  console.log('📦 Generando backend con SQLModel...\n');

  for (const config of configs) {
    console.log(`📁 Módulo: ${config.module.name}`);

    for (const entity of config.entities) {
      const modelPath = path.join(BACKEND_PATH, 'models', `${entity.name.toLowerCase()}.py`);
      const apiPath = path.join(BACKEND_PATH, 'api', `${entity.plural}.py`);

      fs.writeFileSync(modelPath, generateSQLModel(entity, allEntities));
      fs.writeFileSync(apiPath, generateApi(entity, allEntities));

      console.log(`  ✓ ${entity.name} (modelo + schema + api)`);
    }
  }

  console.log('\n📝 Actualizando __init__.py...');
  updateModelsInit(allEntities);
  updateApiInit(allEntities);

  // Eliminar carpeta schemas (ya no se necesita)
  const schemasPath = path.join(BACKEND_PATH, 'schemas');
  if (fs.existsSync(schemasPath)) {
    console.log('\n🗑️  La carpeta schemas/ ya no es necesaria (SQLModel unifica modelo+schema)');
    console.log('   Podés eliminarla manualmente: rm -rf backend/schemas');
  }

  console.log('\n✅ Backend generado!');
  console.log('\nPróximos pasos:');
  console.log('  1. pip install sqlmodel');
  console.log('  2. alembic revision --autogenerate -m "sqlmodel migration"');
  console.log('  3. alembic upgrade head');
}

main().catch(console.error);
