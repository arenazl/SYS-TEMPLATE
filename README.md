# SYS-TEMPLATE

[![Backend CI](https://github.com/arenazl/SYS-TEMPLATE/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/arenazl/SYS-TEMPLATE/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/arenazl/SYS-TEMPLATE/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/arenazl/SYS-TEMPLATE/actions/workflows/frontend-ci.yml)
[![Security Scan](https://github.com/arenazl/SYS-TEMPLATE/actions/workflows/security-scan.yml/badge.svg)](https://github.com/arenazl/SYS-TEMPLATE/actions/workflows/security-scan.yml)

Framework para generar aplicaciones con ABMs dinámicos.

---

## 🚀 Stack Tecnológico

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
| **CI/CD** | GitHub Actions |

---

## 📁 Estructura del Proyecto

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
├── .github/
│   └── workflows/       # GitHub Actions CI/CD
├── CLAUDE.md            # Instrucciones para Claude
├── Procfile             # Heroku
└── runtime.txt          # Python version
```

---

## 🛠️ Cómo Funciona el Generador

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

## 📝 Tipos de Campos Soportados

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

## 💻 Desarrollo Local

### Backend

```bash
cd backend
uvicorn main:app --reload
```

La API estará disponible en `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 🚢 Deployment

### Backend (Heroku)

```bash
git push heroku master
```

### Frontend (Netlify)

```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

## 🔄 CI/CD Pipeline

Este proyecto utiliza GitHub Actions para:

- **Backend CI**: Tests con pytest, cobertura de código y linting con ruff
- **Frontend CI**: Linting con ESLint, build validation y tests E2E con Playwright
- **Security Scan**: Escaneo de vulnerabilidades en dependencias (pip-audit y npm audit)
- **Staging Deployment**: Deploy automático a staging al hacer merge a main
- **Production Deployment**: Deploy manual a producción con aprobación requerida

Ver `.github/workflows/README.md` para más detalles sobre la configuración de CI/CD.

---

## 📚 Documentación

| Guía | Contenido |
|------|-----------|
| `13_GENERADOR.md` | Cómo usar el generador de ABMs |
| `03_STACK.md` | Stack tecnológico y configuración |
| `04_UI.md` | Sistema de diseño y componentes |
| `05_CREDENCIALES_DEPLOY.md` | Deploy en Heroku/Netlify/Aiven |
| `08_API_CLIENT.md` | Cliente API del frontend |

---

## 🤖 Comandos del Generador

```bash
# Generar todo (modelo + api + frontend + migración)
cd cli && npm run sync:migrate

# Solo sincronizar (sin migración)
cd cli && npm run sync

# Generar desde tabla existente
cd cli && npx tsx generate-from-db.ts nombre_tabla
```

---

## 📄 Licencia

Este proyecto es un framework template para desarrollo rápido de aplicaciones CRUD.

---

## 🔗 Repositorio

https://github.com/arenazl/SYS-TEMPLATE
