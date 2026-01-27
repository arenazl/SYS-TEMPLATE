# ⚠️ ERRORES COMUNES - LECTURA OBLIGATORIA

**IMPORTANTE:** Este documento es de **LECTURA OBLIGATORIA** antes de trabajar con el generador. Contiene TODOS los errores comunes que ya fueron resueltos anteriormente.

---

## 🚨 Reglas de Oro

1. **SIEMPRE** leer el modelo generado antes de escribir código custom
2. **NUNCA** asumir que un campo existe - verificarlo primero
3. **SIEMPRE** incluir el campo `activo` en los inserts del seed
4. **SIEMPRE** agregar `import sqlmodel` en las migraciones de Alembic

---

## 📋 Errores Documentados

### 1. Error: "name 'sqlmodel' is not defined" en migración Alembic

**Síntoma:**
```
NameError: name 'sqlmodel' is not defined
```

**Causa:**
Alembic autogenera migraciones con `sqlmodel.sql.sqltypes.AutoString()` pero no importa el módulo sqlmodel.

**Solución:**
Editar el archivo de migración generado en `backend/alembic/versions/XXXXX.py`:

```python
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel  # ← SIEMPRE agregar esta línea
```

**Prevención:**
- Después de ejecutar `alembic revision --autogenerate`, SIEMPRE editar el archivo antes de `alembic upgrade head`
- Convertir esto en un hábito automático

---

### 2. Error: "Field 'activo' doesn't have a default value"

**Síntoma:**
```
Error: Field 'activo' doesn't have a default value
```

**Causa:**
Todos los modelos generados tienen un campo `activo` obligatorio, pero el seed no lo está pasando en el INSERT.

**Solución:**
Incluir el campo `activo` en TODOS los inserts del seed:

```typescript
// ❌ INCORRECTO - falta activo
await connection.execute(
  `INSERT INTO habitaciones (numero, piso, tipo_habitacion_id, estado, organizacion_id)
   VALUES (?, ?, ?, ?, ?)`,
  [numero, piso, tipoId, estado, orgId]
);

// ✅ CORRECTO - incluye activo
await connection.execute(
  `INSERT INTO habitaciones (numero, piso, tipo_habitacion_id, estado, organizacion_id, activo)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [numero, piso, tipoId, estado, orgId, true]  // ← Siempre incluir activo: true
);
```

**Prevención:**
- Cuando escribas un seed, crear un checklist mental: "¿Incluí el campo activo?"
- Template estándar para inserts:

```typescript
const campos = ['nombre', 'codigo', 'organizacion_id', 'activo'];  // ← activo SIEMPRE
const valores = ['Nombre', 'COD', orgId, true];  // ← true SIEMPRE
```

---

### 3. Error: "object has no attribute 'campo'" en endpoints

**Síntoma:**
```
AttributeError: 'Organizacion' object has no attribute 'icono'
AttributeError: 'Usuario' object has no attribute 'avatar'
```

**Causa:**
Un endpoint está intentando acceder a un campo que NO existe en el modelo SQLModel generado. Esto pasa cuando:
- Copiás código de otro proyecto
- Asumís que un campo existe sin verificar
- Usás código custom sin revisar el modelo

**Solución:**
1. **VER** el modelo en `backend/models/entidad.py`
2. **VERIFICAR** qué campos realmente existen
3. **CORREGIR** el endpoint eliminando campos inexistentes

**Ejemplo Real:**

```python
# PASO 1: Ver el modelo (backend/models/organizacion.py)
class OrganizacionBase(SQLModel):
    nombre: str
    codigo: str
    titulo: str | None = None
    eslogan: str | None = None
    # ... NO HAY campo 'icono' aquí

# PASO 2: El endpoint está roto (backend/api/auth.py)
@router.get("/config")
async def get_public_config(db: AsyncSession = Depends(get_db)):
    org = await db.execute(...)
    return {
        "nombre": org.nombre,
        "icono": org.icono or "🏢",  # ❌ ERROR: campo no existe!
    }

# PASO 3: Corregir removiendo el campo
@router.get("/config")
async def get_public_config(db: AsyncSession = Depends(get_db)):
    org = await db.execute(...)
    return {
        "nombre": org.nombre,
        "titulo": org.titulo,  # ✅ Solo campos que existen
        "logo_url": org.logo_url
    }
```

**Prevención:**
- **REGLA DE ORO:** SIEMPRE revisar el modelo generado ANTES de escribir código custom
- **NUNCA** copiar/pegar código de otros proyectos sin adaptarlo
- Si necesitás un campo nuevo:
  1. Agregarlo al JSON de configuración
  2. Ejecutar `npm run sync:migrate`
  3. Recién ahí usarlo en tu código

**Checklist antes de escribir código custom:**
```
[ ] ¿Leí el modelo generado en backend/models/?
[ ] ¿Verifiqué que TODOS los campos que voy a usar existen?
[ ] ¿Probé el endpoint después de escribirlo?
```

---

### 4. Error: "Target database is not up to date" en migración

**Síntoma:**
```
ERROR [alembic.util.messaging] Target database is not up to date.
```

**Causa:**
- La base de datos está vacía (sin tabla `alembic_version`)
- Hay migraciones pendientes sin aplicar
- Conflicto entre versiones de Alembic

**Solución:**
```bash
# Opción 1: Limpiar y empezar de cero (RECOMENDADO)
cd cli && npx tsx clean-db.ts
rm -f backend/alembic/versions/*.py
cd backend && alembic revision --autogenerate -m "initial"
# (Editar archivo para agregar import sqlmodel)
alembic upgrade head

# Opción 2: Solo aplicar migraciones pendientes
cd backend && alembic upgrade head
```

**Prevención:**
- Mantener la base de datos sincronizada con las migraciones
- Ejecutar `alembic upgrade head` después de cada cambio
- En caso de duda, limpiar todo y regenerar

---

## 🔧 Script de Limpieza Total

Si todo se rompe y no sabés por dónde empezar:

```bash
# 1. Limpiar base de datos
cd cli
npx tsx clean-db.ts

# 2. Limpiar versiones de Alembic
rm -f ../backend/alembic/versions/*.py

# 3. Regenerar todo
npm run sync:migrate

# 4. IMPORTANTE: Editar la migración generada
# Abrir backend/alembic/versions/XXXXX.py
# Agregar: import sqlmodel

# 5. Aplicar migración
cd ../backend
alembic upgrade head

# 6. Cargar datos de prueba
cd ../cli
npx tsx seed-hotel.ts
```

---

## 📝 Checklist Pre-Desarrollo

Antes de empezar a trabajar:

- [ ] Leí `99_ERRORES_COMUNES.md` (este archivo)
- [ ] Verifiqué que la base está actualizada (`alembic upgrade head`)
- [ ] Revisé los modelos generados en `backend/models/`
- [ ] Tengo claro qué campos existen y cuáles no
- [ ] Si voy a hacer un seed, incluiré `activo: true` en todos los inserts
- [ ] Si voy a generar migraciones, agregaré `import sqlmodel`

---

## 🎯 Resumen: Los 4 Errores Más Comunes

| Error | Causa | Solución Rápida |
|-------|-------|-----------------|
| `name 'sqlmodel' is not defined` | Falta import en migración | Agregar `import sqlmodel` |
| `Field 'activo' doesn't have a default value` | Falta campo en INSERT | Incluir `activo: true` |
| `object has no attribute 'campo'` | Campo no existe en modelo | Revisar modelo y corregir código |
| `Target database is not up to date` | Base desincronizada | `clean-db.ts` + `sync:migrate` |

---

**RECORDÁ:** Este documento se actualiza con CADA error nuevo que aparezca. Si encontrás un error no documentado, agregalo aquí para la próxima vez.
