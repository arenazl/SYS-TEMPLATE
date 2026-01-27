# Tutorial: Tu Primera App en 15 Minutos

Primera vez con SYS-TEMPLATE? Este tutorial te lleva de cero a una app funcionando en 15 minutos.

---

## Tutorial Interactivo (Recomendado)

La forma más rápida de aprender es haciendo. Tenemos un tutorial interactivo paso a paso.

**Ingresá a la app y andá a:**

```
http://localhost:5173/gestion/getting-started
```

O hacé click en "Tutorial" en el menú lateral.

El tutorial interactivo te va a guiar por:
- ✅ Definir tu primera entidad
- ✅ Generar el código automáticamente
- ✅ Ver tu ABM funcionando
- ✅ Entender cómo sigue

**Tiempo estimado:** 10-15 minutos

---

## Prefiero Leer Primero

Ok, acá va el resumen rápido.

### Paso 1: Instalá las Dependencias (solo una vez)

```bash
# Python
pip install sqlmodel alembic fastapi>=0.128.0 aiomysql passlib[bcrypt] python-jose

# Node (en la carpeta cli)
cd cli && npm install
```

---

### Paso 2: Definí Tu Entidad

Abrí `cli/tutorial-example.json` (o `cli/negocio.json` para tu proyecto real).

Ejemplo: ABM de Tareas

```json
{
  "name": "Tarea",
  "plural": "tareas",
  "table": "tareas",
  "fields": "titulo:string:req descripcion:text completada:bool fecha_vencimiento:date",
  "icon": "CheckSquare"
}
```

**Traducción:**
- `titulo` → input de texto (obligatorio)
- `descripcion` → textarea grande
- `completada` → checkbox sí/no
- `fecha_vencimiento` → selector de fecha

---

### Paso 3: Generá el Código

```bash
cd cli
npm run sync:migrate
```

Esto genera automáticamente:
- ✅ Modelo Python (SQLModel)
- ✅ API REST (FastAPI)
- ✅ Página de ABM (React)
- ✅ Migración de base de datos (Alembic)

---

### Paso 4: Levantá la App

Dos terminales:

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Abrí: `http://localhost:5173`

---

### Paso 5: Probá Tu ABM

1. Logueate con:
   - **Usuario:** `admin@demo.com`
   - **Clave:** `admin123`

2. Andá a tu entidad en el menú (ej: "Tareas")

3. Hacé click en "Nuevo" → Completá el form → Guardá

4. Editá, borrá, buscá. Todo funciona.

---

## ¿Y Ahora?

Ya tenés tu primer ABM andando. Podés:

- **Agregar más campos:** Editá el JSON y corré `npm run sync:migrate`
- **Crear otra entidad:** Agregá otro objeto al JSON
- **Entender el generador:** Leé `APP_GUIDE/13_GENERADOR.md`
- **Personalizar el UI:** Leé `APP_GUIDE/04_UI.md`

---

## Tipos de Campos Más Comunes

| Sintaxis | Resultado | Uso |
|----------|-----------|-----|
| `nombre:string:req` | Input obligatorio | Nombres, códigos |
| `email:email` | Input con validación | Emails |
| `precio:decimal` | Input numérico | Plata, medidas |
| `cantidad:int` | Input entero | Cantidades |
| `activo:bool` | Checkbox | Sí/No, Activo/Inactivo |
| `fecha:date` | Calendario | Fechas |
| `descripcion:text` | Textarea | Textos largos |
| `estado:enum(a,b,c)` | Select | Opciones fijas |
| `cliente_id:fk:Cliente` | Select con datos | Relaciones |

---

## Troubleshooting Rápido

### "No se generó nada"
```bash
# Verificá que estés en la carpeta cli
cd cli
npm run sync:migrate
```

### "Error de base de datos"
```bash
# Borrá las migraciones y arrancá de cero
rm backend/alembic/versions/*.py
cd cli && npm run sync:migrate
```

### "No veo mi entidad en el menú"
- Refrescá el browser (Ctrl+R)
- Verificá que el backend esté corriendo
- Revisá la consola del browser (F12) por errores

### "Quiero empezar de cero"
```bash
# Borrá todo y regenerá
rm -rf backend/alembic/versions/*.py
# Borrá las tablas en MySQL/phpMyAdmin
cd cli && npm run sync:migrate
```

---

## Próximos Pasos

| Querés... | Leé... |
|-----------|--------|
| Entender el generador a fondo | `13_GENERADOR.md` |
| Ver qué tecnologías usa | `03_STACK.md` |
| Personalizar el diseño | `04_UI.md` |
| Hacer deploy | `05_CREDENCIALES_DEPLOY.md` |
| Entender el flujo | `00_COMO_USAR.md` |

---

## TL;DR

```bash
# 1. Instalá (una vez)
pip install sqlmodel alembic fastapi>=0.128.0 aiomysql
cd cli && npm install

# 2. Definí tu entidad en cli/negocio.json

# 3. Generá
cd cli && npm run sync:migrate

# 4. Levantá
# Terminal 1:
cd backend && uvicorn main:app --reload
# Terminal 2:
cd frontend && npm run dev

# 5. Abrí http://localhost:5173
```

**¿Primera vez?** Mejor hacé el [tutorial interactivo](#tutorial-interactivo-recomendado) 👆
