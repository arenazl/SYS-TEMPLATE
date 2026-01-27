# Sistema de Temas Visual Avanzado

Sistema completo de personalización visual con 12 paletas de colores predefinidas y fondos personalizados para toda la aplicación.

---

## Características

### 1. Paletas de Colores (12 temas)
- **Light** - Claro profesional
- **Dark** - Oscuro elegante
- **Amber** - Ámbar cálido
- **Coffee** - Marrón café
- **Ocean** - Azul océano
- **Forest** - Verde bosque
- **Purple** - Púrpura vibrante
- **Rose** - Rosa elegante
- **Sunset** - Atardecer
- **Midnight** - Medianoche
- **Emerald** - Esmeralda
- **Crimson** - Carmesí

Cada paleta incluye:
- 4 colores principales
- Colores de fondo (primary, secondary, card)
- Colores de texto (primary, secondary)
- Color de acento/primario con hover
- Colores de sidebar
- Colores de bordes

### 2. Fondos Personalizados

**Fondo General**
- Imagen de fondo para toda la aplicación
- Control de opacidad (0-100%)
- Preview en tiempo real

**Fondo Sidebar**
- Imagen específica para la barra lateral
- Control de opacidad
- Filtro automático del color de acento
- Preview en tiempo real

**Fondo Topbar**
- Imagen específica para la barra superior
- Control de opacidad
- Filtro automático del color de acento
- Preview en tiempo real

---

## Arquitectura

### Frontend

**ThemeContext** (`frontend/src/contexts/ThemeContext.tsx`)
```typescript
interface ThemeContextType {
  theme: Theme;
  currentThemeId: string;
  setTheme: (themeId: string) => void;
  presets: ThemePreset[];
  backgrounds: ThemeBackgrounds;
  updateGeneralBg: (url: string | undefined) => void;
  updateSidebarBg: (url: string | undefined) => void;
  updateTopbarBg: (url: string | undefined) => void;
  updateGeneralOpacity: (opacity: number) => void;
  updateSidebarOpacity: (opacity: number) => void;
  updateTopbarOpacity: (opacity: number) => void;
}
```

**ThemePresets** (`frontend/src/config/themePresets.ts`)
```typescript
interface ThemeBackgrounds {
  generalBg?: string;
  generalBgOpacity: number;
  sidebarBg?: string;
  sidebarBgOpacity: number;
  topbarBg?: string;
  topbarBgOpacity: number;
}
```

**Persistencia**
- `localStorage.themeId` - ID del tema seleccionado
- `localStorage.themeBackgrounds` - Configuración de fondos (JSON)

### Backend

**API de Imágenes** (`backend/api/imagenes.py`)

```python
# Subir imagen a Cloudinary
POST /api/imagenes/upload
Form-data:
  - file: File (required)
  - folder: string (default: "general")

Response:
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "themes/abc123",
  "width": 1920,
  "height": 1080,
  "format": "jpg"
}

# Eliminar imagen
DELETE /api/imagenes/delete/{public_id}
```

**Configuración de Cloudinary** (`.env`)
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Componentes

### Card Component (`frontend/src/components/ui/Card.tsx`)

Componente reutilizable para tarjetas con 3 variantes:

```tsx
import Card from '@/components/ui/Card';

// Default - tarjeta básica
<Card>Content</Card>

// Glass - efecto glassmorphism
<Card variant="glass">Content</Card>

// Elevated - sombra pronunciada
<Card variant="elevated">Content</Card>

// Con hover effect
<Card variant="glass" hover>Content</Card>

// Clickable
<Card onClick={() => console.log('clicked')}>Content</Card>
```

**Props:**
- `variant?: 'default' | 'glass' | 'elevated'`
- `hover?: boolean` - Efecto de hover (scale + shadow)
- `onClick?: () => void` - Handler de click
- `className?: string` - Clases adicionales

### ConfiguracionTemas (`frontend/src/pages/auditoria/ConfiguracionTemas.tsx`)

Página completa de configuración de temas con:
- Grid de paletas con preview de colores
- Sección de fondos personalizados con upload
- Sliders de opacidad con preview en tiempo real
- Manejo de estados de carga (uploading)
- Validación de tipos de archivo
- Mensajes de error

---

## Uso

### 1. Acceder a la Configuración

Ir a: **Auditoría > Temas** (tab en la página de auditoría)

O directamente: `/gestion/auditoria` y seleccionar el tab "Temas"

### 2. Cambiar Paleta de Colores

1. Hacer click en cualquiera de las 12 paletas mostradas
2. El cambio se aplica inmediatamente
3. Se guarda automáticamente en localStorage

### 3. Configurar Fondos Personalizados

**Fondo General:**
1. Click en "Subir Imagen"
2. Seleccionar imagen (JPG, PNG, WEBP, GIF)
3. Ajustar opacidad con el slider
4. Ver preview en tiempo real

**Fondo Sidebar/Topbar:**
- Mismo proceso que fondo general
- Incluye filtro automático del color primario del tema

**Remover Fondo:**
- Click en botón "Remover" (aparece solo si hay imagen)

### 4. Usar el Theme en Componentes

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, backgrounds } = useTheme();

  return (
    <div style={{ backgroundColor: theme.card, color: theme.text }}>
      {/* Content */}
    </div>
  );
}
```

**Propiedades del Theme:**
```typescript
theme.background         // Fondo principal
theme.backgroundSecondary // Fondo secundario
theme.card              // Fondo de tarjetas
theme.text              // Color de texto principal
theme.textSecondary     // Color de texto secundario
theme.primary           // Color de acento
theme.primaryHover      // Color de acento en hover
theme.border            // Color de bordes
theme.sidebar           // Fondo de sidebar
theme.sidebarText       // Texto de sidebar
```

---

## Estilos CSS

Se agregaron estilos para el slider de opacidad en `frontend/src/index.css`:

```css
/* Custom range slider con hover effects */
input[type="range"]::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: currentColor;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}
```

---

## Layout con Backgrounds

El componente `Layout.tsx` aplica los fondos automáticamente:

1. **Fondo General** - Cubre toda la aplicación con z-index bajo
2. **Fondo Sidebar** - Con filtro del color primario (multiply blend)
3. **Fondo Topbar** - Con filtro del color primario (multiply blend)
4. **Contenido** - Sobre los fondos con z-index alto

---

## Cloudinary

### Configuración

1. Crear cuenta en [Cloudinary](https://cloudinary.com/)
2. Obtener credenciales (Cloud Name, API Key, API Secret)
3. Agregar al `.env`:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Carpetas

Las imágenes se organizan por carpetas:
- `themes/` - Fondos de temas
- `categorias/` - Imágenes de categorías
- `general/` - Imágenes generales

---

## Extensibilidad

### Agregar Nueva Paleta

Editar `frontend/src/config/themePresets.ts`:

```typescript
{
  id: 'my-theme',
  name: 'Mi Tema',
  palette: ['#color1', '#color2', '#color3', '#color4'],
  colors: {
    background: '#...',
    backgroundSecondary: '#...',
    contentBackground: '#...',
    card: '#...',
    sidebar: '#...',
    sidebarText: '#...',
    sidebarTextSecondary: '#...',
    text: '#...',
    textSecondary: '#...',
    primary: '#...',
    primaryHover: '#...',
    primaryText: '#...',
    border: '#...',
  }
}
```

### Agregar Nuevo Background

Extender la interfaz `ThemeBackgrounds` en `themePresets.ts` y agregar:
- Estado en `ThemeContext`
- Método `update*` en el context
- Sección en `ConfiguracionTemas.tsx`
- Aplicación en `Layout.tsx`

---

## Troubleshooting

### Las imágenes no se suben
- Verificar credenciales de Cloudinary en `.env`
- Verificar que `python-multipart` esté instalado
- Verificar que `cloudinary` esté instalado
- Ver logs del backend

### Los fondos no se muestran
- Verificar que las URLs sean válidas
- Abrir DevTools > Network para ver si se cargan
- Verificar z-index en Layout.tsx

### Los temas no se guardan
- Verificar localStorage en DevTools
- Verificar que ThemeProvider esté envolviendo la app
- Limpiar localStorage y recargar

---

## Performance

- Las imágenes se suben a Cloudinary (CDN global)
- Las configuraciones se guardan en localStorage (lectura instantánea)
- Los backgrounds usan `background-size: cover` optimizado
- Los filtros usan `mix-blend-mode` (acelerado por GPU)

---

## Seguridad

- Las imágenes pasan por validación de tipo de archivo
- Solo se permiten formatos: JPG, JPEG, PNG, WEBP, GIF
- El upload requiere autenticación (token JWT)
- Las URLs de Cloudinary son públicas pero no adivinables

---

## Recursos

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Context API](https://react.dev/reference/react/useContext)
