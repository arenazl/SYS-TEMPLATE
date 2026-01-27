# 🏛️ Morón

Completá estos valores antes  empezar. El agente usará estos datos para configurar todo el sistema.de

---

## Datos de la Aplicación

```
ICONO: 🏛️
NOMBRE_ORGANIZACION: Morón
TITULO: Morón
ESLOGAN: Plataforma integral de administración
DESCRIPCION: Sistema para gestión de operaciones
```

---

## Instrucciones para el Agente

Cuando el usuario pida "configurar el proyecto" o "aplicar la marca", usá los valores de arriba para actualizar:

1. **Base de datos** (tabla `organizaciones`):
   - Campo `titulo` = TITULO
   - Campo `eslogan` = ESLOGAN

2. **Frontend** (`frontend/index.html`):
   - `<title>` = TITULO
   - Meta description = ESLOGAN
   - Open Graph tags = TITULO y ESLOGAN

3. **Frontend** (`frontend/public/manifest.json`):
   - `name` = TITULO
   - `short_name` = Primera palabra del TITULO
   - `description` = ESLOGAN

4. **Backend** (`backend/main.py`):
   - FastAPI title = TITULO
   - FastAPI description = DESCRIPCION

5. **Seed** (`cli/seed.ts`):
   - Organización titulo = TITULO
   - Organización eslogan = ESLOGAN

---

## Después de completar

1. Editá los valores de arriba con los de tu proyecto
2. Pedile al agente: "Aplicá la configuración del proyecto"
3. Ejecutá el seed: `cd cli && npm run seed`
