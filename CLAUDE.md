# SYS-TEMPLATE

Framework para generar aplicaciones con ABMs dinámicos.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS 4 |
| **Backend** | FastAPI + Python 3.11 |
| **ORM** | SQLModel (SQLAlchemy + Pydantic) |
| **Database** | MySQL (Aiven) |
| **Migraciones** | Alembic |
| **File Storage** | Cloudinary |
| **Hosting Frontend** | Netlify |
| **Hosting Backend** | Heroku |

---

## Estructura del Proyecto

```
SYS-TEMPLATE/
├── APP_GUIDE/           # Documentación del framework
│   ├── 00_COMO_USAR.md
│   ├── 03_STACK.md
│   ├── 04_UI.md
│   ├── 05_CREDENCIALES_DEPLOY.md
│   ├── 08_API_CLIENT.md
│   └── 13_GENERADOR.md  # Guía principal del generador
├── backend/             # API FastAPI
│   ├── api/             # Endpoints (generados)
│   ├── models/          # Modelos SQLModel (generados)
│   ├── schemas/         # Schemas Pydantic (generados)
│   ├── core/            # Database, security, config
│   ├── services/        # imagen_service (Cloudinary)
│   └── alembic/         # Migraciones
├── cli/                 # Generador de código
│   ├── generate-crud.ts      # Genera API + Frontend
│   ├── generate-sqlmodel.ts  # Genera modelos Python
│   ├── sync.ts               # Sincroniza todo
│   ├── auditoria.json        # Módulo de auditoría
│   └── negocio.json          # Módulo de negocio
├── frontend/            # React + Tailwind
│   └── src/
│       ├── components/
│       │   ├── DynamicABM/   # Componente ABM dinámico
│       │   ├── Layout.tsx
│       │   ├── Sidebar.tsx
│       │   ├── Topbar.tsx
│       │   └── ui/           # Componentes genéricos
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── Login.tsx
│       │   └── auditoria/    # Páginas generadas
│       └── config/
│           └── entityRegistry.ts  # Registro de entidades
├── CLAUDE.md            # Este archivo
├── Procfile             # Heroku
└── runtime.txt          # Python version
```

---

## Cómo Funciona el Generador

### 1. Definir entidad en JSON

Editar `cli/negocio.json`:

```json
{
  "name": "Producto",
  "plural": "productos",
  "table": "productos",
  "fields": "codigo:string:req nombre:string:req precio:decimal activo:bool",
  "icon": "Package"
}
```

### 2. Ejecutar el generador

```bash
cd cli
npm run sync:migrate
```

### 3. Resultado

Se genera automáticamente:
- `backend/models/producto.py` - Modelo SQLModel
- `backend/schemas/producto.py` - Schema Pydantic
- `backend/api/productos.py` - CRUD endpoints
- `frontend/src/pages/.../ProductoABM.tsx` - Página ABM
- Migración Alembic
- Rutas y navegación

---

## Tipos de Campos Soportados

| Sintaxis | Tipo Python | Input Frontend |
|----------|-------------|----------------|
| `nombre:string` | `str` | Input texto |
| `nombre:string:req` | `str` (required) | Input requerido |
| `email:email` | `str` | Input email |
| `precio:decimal` | `float` | Input número |
| `cantidad:int` | `int` | Input entero |
| `activo:bool` | `bool` | Checkbox |
| `fecha:date` | `date` | Datepicker |
| `notas:text` | `str` | Textarea |
| `estado:enum(a,b,c)` | `Enum` | Select |
| `cliente_id:fk:Cliente` | `int` (FK) | Select con datos |

---

## Instrucciones para Claude

### REGLA PRINCIPAL
ANTES de realizar cualquier tarea, SIEMPRE leer `APP_GUIDE/13_GENERADOR.md` para entender cómo funciona el generador.

### Comportamiento esperado
1. Leer la guía relevante ANTES de actuar
2. NO preguntar información que ya está en las guías
3. Usar el generador para crear nuevas entidades (no crear manualmente)
4. Mantener las guías actualizadas cuando haya cambios

### Comandos principales

```bash
# Generar todo (modelo + api + frontend + migración)
cd cli && npm run sync:migrate

# Solo sincronizar (sin migración)
cd cli && npm run sync

# Generar desde tabla existente
cd cli && npx tsx generate-from-db.ts nombre_tabla
```

### Para desarrollo local

```bash
# Backend
cd backend && uvicorn main:app --reload

# Frontend
cd frontend && npm run dev
```

### Para deploy

```bash
# Backend (Heroku)
git push heroku master

# Frontend (Netlify)
cd frontend && npm run build && netlify deploy --prod --dir=dist
```

---

## Documentación

| Guía | Contenido |
|------|-----------|
| `13_GENERADOR.md` | Cómo usar el generador de ABMs |
| `03_STACK.md` | Stack tecnológico y configuración |
| `04_UI.md` | Sistema de diseño y componentes |
| `05_CREDENCIALES_DEPLOY.md` | Deploy en Heroku/Netlify/Aiven |
| `08_API_CLIENT.md` | Cliente API del frontend |

---

## Repositorio

https://github.com/arenazl/SYS-TEMPLATE
