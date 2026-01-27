# Generador de ABMs

¿Cansado de copiar y pegar el mismo ABM 50 veces? Yo también. Por eso hice esto.

---

## Primera vez (solo una vez en la vida)

Instalá esto y olvidate:

```bash
# Python
pip install sqlmodel alembic fastapi>=0.128.0 aiomysql passlib[bcrypt] python-jose

# Node
cd cli && npm install
```

---

## Quiero crear un ABM nuevo

Ponele que querés un ABM de Sucursales.

Abrí `cli/negocio.json` y agregá:

```json
{
  "name": "Sucursal",
  "plural": "sucursales",
  "table": "sucursales",
  "fields": "codigo:string:req nombre:string:req direccion:text",
  "icon": "MapPin"
}
```

Después:

```bash
cd cli
npm run sync:migrate
```

Abrí el browser en `/gestion/sucursales`. Ta listo.

---

## Ya tengo la tabla en MySQL

Perfecto, no la hagas de nuevo. Corré:

```bash
npx tsx generate-from-db.ts sucursales
```

Te escupe el JSON. Copialo al módulo y hacé:

```bash
npm run sync
```

Sin `:migrate` porque la tabla ya existe.

---

## ¿Cómo escribo los campos?

Es fácil: `nombre:tipo` y si es obligatorio le ponés `:req`

Ejemplos:

- `nombre:string:req` → Input obligatorio
- `email:email` → Input de email
- `precio:decimal` → Plata
- `cantidad:int` → Número entero
- `activo:bool` → Checkbox sí/no
- `fecha:date` → Calendario
- `notas:text` → Textarea grande
- `estado:enum(nuevo,usado)` → Combo con esas opciones
- `cliente_id:fk:Cliente:clientes` → FK opcional (combo con clientes)
- `cliente_id:fk:Cliente:clientes:req` → FK requerido

### Formato de FK

```
campo_id:fk:Entidad:tabla:req
         │    │      │     │
         │    │      │     └── opcional: si es requerido
         │    │      └──────── nombre de la tabla en la DB
         │    └─────────────── nombre de la entidad (PascalCase)
         └──────────────────── siempre "fk"
```

**IMPORTANTE:** Siempre incluir el nombre de la tabla, no solo la entidad.

### ⚠️ Error común con FK

```
❌ INCORRECTO: cliente_id:fk:Cliente:req
   El sistema interpreta "req" como nombre de tabla y falla

✅ CORRECTO: cliente_id:fk:Cliente:clientes:req
   Incluye el nombre de la tabla antes de :req
```

---

## Quiero un Pedido con sus líneas adentro

Eso se llama master-detail. Así:

```json
{
  "name": "Pedido",
  "plural": "pedidos",
  "table": "pedidos",
  "fields": "numero:string:req cliente_id:fk:Cliente:clientes:req",
  "masterDetail": true
},
{
  "name": "DetallePedido",
  "plural": "detalles_pedido",
  "table": "detalles_pedido",
  "fields": "pedido_id:fk:Pedido:pedidos:req producto_id:fk:Producto:productos:req cantidad:int:req",
  "isDetail": true,
  "masterEntity": "Pedido"
}
```

Cuando abrís el Pedido, te aparece la grillita de productos abajo.

---

## Se rompió todo

Tranqui, pasa. Solución:

1. Borrá todas las tablas de la base
2. Borrá los archivos de `alembic/versions/`
3. Corré `npm run sync:migrate`

Arrancás de cero en 2 minutos.

---

## Para probar

```
Usuario: admin@demo.com
Clave: admin123
```

---

## TL;DR

| Querés... | Hacé... |
|-----------|---------|
| ABM nuevo | Editá el JSON → `npm run sync:migrate` |
| ABM de tabla que ya existe | `generate-from-db` → copiá JSON → `npm run sync` |
| Agregar un campo | Editá el JSON → `npm run sync:migrate` |

---

## Troubleshooting - Errores Comunes

### Error: "name 'sqlmodel' is not defined" en migración Alembic

**Síntoma:**
```
NameError: name 'sqlmodel' is not defined
```

**Causa:** Alembic autogenera migraciones con `sqlmodel.sql.sqltypes.AutoString()` pero no importa el módulo.

**Solución:**
Editar el archivo de migración generado en `backend/alembic/versions/XXXXX.py` y agregar:

```python
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel  # ← Agregar esta línea
```

**Prevención:** Este error se corrige automáticamente editando la migración antes de ejecutar `alembic upgrade head`.

---

### Error: "Field 'activo' doesn't have a default value"

**Síntoma:**
```
Error: Field 'activo' doesn't have a default value
```

**Causa:** El modelo tiene un campo `activo` obligatorio pero no se está pasando en el INSERT del seed.

**Solución:**
Asegurate de incluir el campo `activo` en TODOS los inserts del seed:

```typescript
await connection.execute(
  `INSERT INTO habitaciones (numero, piso, tipo_habitacion_id, estado, organizacion_id, activo)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [numero, piso, tipoId, estado, orgId, true]  // ← Incluir activo: true
);
```

---

### Error: "Target database is not up to date" en migración

**Síntoma:**
```
ERROR [alembic.util.messaging] Target database is not up to date.
```

**Causa:** La base de datos está vacía (sin tabla `alembic_version`) o hay migraciones pendientes.

**Solución:**
```bash
# 1. Limpiar todo
cd cli && npx tsx clean-db.ts

# 2. Borrar versiones antiguas
rm -f backend/alembic/versions/*.py

# 3. Regenerar migración inicial
cd backend && alembic revision --autogenerate -m "initial"

# 4. Aplicar migración
alembic upgrade head
```

---

### Error: "object has no attribute 'campo'" en endpoints

**Síntoma:**
```
AttributeError: 'Organizacion' object has no attribute 'icono'
```

**Causa:** Un endpoint está intentando acceder a un campo que NO existe en el modelo SQLModel generado.

**Solución:**
1. Verificar el modelo en `backend/models/entidad.py` para ver qué campos tiene
2. Editar el endpoint que está fallando (normalmente en `backend/api/`)
3. Remover o corregir la referencia al campo inexistente

**Ejemplo:**
```python
# ❌ INCORRECTO - campo 'icono' no existe en Organizacion
return {
    "nombre": org.nombre,
    "icono": org.icono or "🏢",  # ← Este campo no existe!
}

# ✅ CORRECTO - solo usar campos que existen
return {
    "nombre": org.nombre,
    "titulo": org.titulo,
    "logo_url": org.logo_url
}
```

**Prevención:**
- Revisar SIEMPRE el modelo generado antes de escribir código custom
- Si necesitás un campo nuevo, agregarlo al JSON y regenerar con `npm run sync:migrate`

---

### Script de Limpieza Rápida

Si todo se rompe, usá este script:

```bash
# Limpiar base de datos completamente
cd cli
npx tsx clean-db.ts

# Limpiar versiones de Alembic
rm -f ../backend/alembic/versions/*.py

# Regenerar todo
npm run sync:migrate

# Cargar datos de prueba
npx tsx seed-hotel.ts
```
