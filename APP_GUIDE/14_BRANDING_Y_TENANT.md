# Branding y Sistema Multi-Tenant

## ⚠️ IMPORTANTE: Tabla de Organizaciones

La tabla `organizaciones` es la **tabla TENANT** de este sistema.

- **Multi-tenant**: Todos los datos están aislados por `organizacion_id`
- **Todas las entidades** de negocio DEBEN tener el campo `organizacion_id:fk:Organizacion:organizaciones:req`
- **Aislamiento automático**: El sistema filtra automáticamente por la organización del usuario autenticado
- **Seguridad**: Un usuario solo puede ver datos de su propia organización

---

## Estructura de la Tabla Organizaciones

```sql
CREATE TABLE organizaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255),
  eslogan VARCHAR(255),
  descripcion TEXT,
  logo_url VARCHAR(500),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Campos de Branding

| Campo | Uso | Ejemplo |
|-------|-----|---------|
| `nombre` | Nombre completo | "Hotel Las Margaritas" |
| `codigo` | Identificador único | "MARGARITAS" |
| `titulo` | Título corto (navbar, emails) | "Las Margaritas" |
| `eslogan` | Tagline/slogan | "Donde todos tus sueños se cumplen" |
| `descripcion` | Descripción completa | "Hotel Las Margaritas - Tu destino perfecto" |
| `logo_url` | URL del logo (Cloudinary) | "https://res.cloudinary.com/..." |

---

## Proceso de Branding Completo

### 1. Actualizar Datos de Organización

Editar `cli/seed.ts` o `cli/seed-hotel.ts`:

```typescript
const [result] = await connection.execute(
  `INSERT INTO organizaciones (nombre, codigo, titulo, eslogan, descripcion, logo_url, activo)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    'Hotel Las Margaritas',           // nombre
    'MARGARITAS',                      // codigo
    'Las Margaritas',                  // titulo
    'Donde todos tus sueños se cumplen', // eslogan
    'Hotel Las Margaritas - Tu destino perfecto', // descripcion
    'https://res.cloudinary.com/...',  // logo_url (opcional)
    true                               // activo
  ]
);
```

### 2. Actualizar Meta Tags en HTML

Editar `frontend/index.html`:

```html
<head>
  <!-- Title -->
  <title>Hotel Las Margaritas</title>

  <!-- Primary Meta Tags -->
  <meta name="title" content="Hotel Las Margaritas" />
  <meta name="description" content="Donde todos tus sueños se cumplen" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Hotel Las Margaritas" />
  <meta property="og:description" content="Donde todos tus sueños se cumplen" />
  <meta property="og:image" content="/icon-notification.png" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="Hotel Las Margaritas" />
  <meta property="twitter:description" content="Donde todos tus sueños se cumplen" />
  <meta property="twitter:image" content="/icon-notification.png" />
</head>
```

### 3. Actualizar Manifest PWA

Editar `frontend/public/manifest.json`:

```json
{
  "name": "Hotel Las Margaritas",
  "short_name": "Las Margaritas",
  "description": "Donde todos tus sueños se cumplen",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-notification.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "utilities"],
  "lang": "es-AR"
}
```

### 4. Layout Dinámico (Ya Implementado)

El `Layout.tsx` ya consume dinámicamente los datos de la organización:

```typescript
// En Layout.tsx
const { organization } = useOrganization();

// Automáticamente muestra:
{organization?.titulo || organization?.nombre}
```

Ubicación: Vértice superior izquierdo junto al logo/icono.

---

## Iconografía

### Generar Iconos Custom

Si tenés un logo custom, usar:

```bash
cd frontend
npm run generate-icons
```

Este script:
1. Lee tu imagen base desde `/public/logo.png`
2. Genera todos los tamaños necesarios (72x72, 96x96, 128x128, etc.)
3. Los guarda en `/public/icons/`
4. Actualiza automáticamente el `manifest.json`

### Ubicación de Iconos

```
frontend/public/
├── icon-notification.png  # 512x512 (principal)
├── favicon.ico
├── favicon.png
├── favicon.svg
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

---

## Checklist de Branding

- [ ] Actualizar datos en `organizaciones` (seed)
- [ ] Actualizar `<title>` en `frontend/index.html`
- [ ] Actualizar meta tags Open Graph
- [ ] Actualizar meta tags Twitter
- [ ] Actualizar `manifest.json`
- [ ] Subir logo a Cloudinary (opcional)
- [ ] Actualizar `logo_url` en organizaciones
- [ ] Generar iconos con `npm run generate-icons`
- [ ] Verificar que Layout muestre nombre correctamente

---

## Multi-Tenant: Cómo Funciona

### En el Backend

Cada endpoint automáticamente filtra por organización:

```python
# En backend/api/productos.py (auto-generado)
@router.get("/")
async def listar_productos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Solo productos de la organización del usuario
    productos = db.exec(
        select(Producto).where(
            Producto.organizacion_id == current_user.organizacion_id
        )
    ).all()
    return productos
```

### En el Frontend

El contexto `OrganizationContext` provee los datos:

```typescript
// En cualquier componente
import { useOrganization } from '../contexts/OrganizationContext';

function MiComponente() {
  const { organization } = useOrganization();

  return (
    <div>
      <h1>{organization?.nombre}</h1>
      <p>{organization?.eslogan}</p>
    </div>
  );
}
```

---

## ⚠️ Reglas Importantes

1. **NUNCA crear entidades sin `organizacion_id`**
   - Todas las tablas de negocio deben tener este campo
   - Es obligatorio (`:req`) en el JSON del generador

2. **NO compartir datos entre organizaciones**
   - El sistema garantiza aislamiento automático
   - Los usuarios solo ven datos de su organización

3. **Auditoría es global**
   - El módulo `auditoria` NO filtra por organización
   - Logs de auditoría son transversales

---

## Ejemplo Completo: Hotel

```json
// cli/negocio.json
{
  "name": "Habitacion",
  "plural": "habitaciones",
  "table": "habitaciones",
  "fields": "numero:string:req piso:int tipo_habitacion_id:fk:TipoHabitacion:tipos_habitacion:req organizacion_id:fk:Organizacion:organizaciones:req",
  "icon": "BedDouble"
}
```

```typescript
// cli/seed-hotel.ts
await connection.execute(
  `INSERT INTO habitaciones (numero, piso, tipo_habitacion_id, organizacion_id, activo)
   VALUES (?, ?, ?, ?, ?)`,
  ['101', 1, tipoId, orgId, true]  // orgId = ID de "Las Margaritas"
);
```

El resultado: Habitación 101 pertenece a "Hotel Las Margaritas" y solo usuarios de esa organización pueden verla/editarla.

---

## TL;DR

| Querés... | Hacé... |
|-----------|---------|
| Cambiar nombre del negocio | Editar `organizaciones` en seed → correr seed |
| Actualizar slogan | Editar `organizaciones.eslogan` → correr seed |
| Cambiar meta tags | Editar `frontend/index.html` |
| Actualizar PWA | Editar `frontend/public/manifest.json` |
| Nuevo logo | Subir a Cloudinary → actualizar `logo_url` |
| Generar iconos | `cd frontend && npm run generate-icons` |
| Crear nueva entidad | SIEMPRE incluir `organizacion_id:fk:Organizacion:organizaciones:req` |
