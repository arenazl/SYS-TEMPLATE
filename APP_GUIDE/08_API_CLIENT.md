# API Client (Frontend)

Este documento describe cómo funciona el cliente API en el frontend y cómo interactuar con el backend.

---

## Configuración Base

### URL de la API

```typescript
// frontend/src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

### Variables de Entorno

```bash
# frontend/.env.local (desarrollo)
VITE_API_URL=http://localhost:8000/api

# frontend/.env.production (producción)
VITE_API_URL=https://tu-backend.herokuapp.com/api
```

### Instancia de Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };
```

---

## Interceptores

### Request Interceptor (Token JWT)

Agrega automáticamente el token de autenticación a cada request:

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor (Manejo de 401)

Redirige al login si el token expiró o es inválido:

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Endpoints Automáticos (Generados)

Cuando usás el generador de ABMs (`npm run sync`), se crean automáticamente endpoints CRUD para cada entidad.

### Patrón de Endpoints Generados

Para una entidad `Producto`:

| Método | Endpoint | Descripción | Params/Body |
|--------|----------|-------------|-------------|
| GET | `/api/productos` | Listar todos | `?activo=true/false` |
| GET | `/api/productos/{id}` | Obtener uno por ID | - |
| POST | `/api/productos` | Crear nuevo | `{ nombre, precio, ... }` |
| PUT | `/api/productos/{id}` | Actualizar completo | `{ nombre, precio, ... }` |
| DELETE | `/api/productos/{id}` | Eliminar (soft delete) | - |

### Ejemplo: Cliente API Genérico

```typescript
// frontend/src/lib/api.ts
export const createCrudApi = (entityPlural: string) => ({
  getAll: (activo?: boolean) =>
    api.get(`/${entityPlural}`, {
      params: activo !== undefined ? { activo } : {}
    }),

  getOne: (id: number) =>
    api.get(`/${entityPlural}/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post(`/${entityPlural}`, data),

  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/${entityPlural}/${id}`, data),

  delete: (id: number) =>
    api.delete(`/${entityPlural}/${id}`),
});

// Uso
export const productosApi = createCrudApi('productos');
export const clientesApi = createCrudApi('clientes');
export const reservasApi = createCrudApi('reservas');
```

---

## Endpoints de Autenticación

### `/api/auth/login` - POST

Iniciar sesión con email y password:

```typescript
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({
      username: email,
      password
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
};

// Uso
const response = await authApi.login('admin@hotel.com', 'admin123');
const { access_token, user } = response.data;
localStorage.setItem('token', access_token);
localStorage.setItem('user', JSON.stringify(user));
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@hotel.com",
    "nombre": "Admin",
    "apellido": "Sistema",
    "rol": "admin",
    "organizacion_id": 1
  }
}
```

### `/api/auth/me` - GET

Obtener datos del usuario autenticado:

```typescript
export const authApi = {
  me: () => api.get('/auth/me'),
};

// Uso
const response = await authApi.me();
const user = response.data;
```

**Response:**
```json
{
  "id": 1,
  "email": "admin@hotel.com",
  "nombre": "Admin",
  "apellido": "Sistema",
  "rol": "admin",
  "organizacion_id": 1,
  "organizacion": {
    "nombre": "Hotel Las Margaritas",
    "titulo": "Las Margaritas",
    "eslogan": "Donde todos tus sueños se cumplen"
  }
}
```

---

## Subida de Archivos (Cloudinary)

### Endpoint `/api/imagen/upload` - POST

```typescript
export const imagenApi = {
  upload: async (file: File, carpeta?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (carpeta) {
      formData.append('carpeta', carpeta);
    }

    return api.post('/imagen/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Uso en un componente
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const response = await imagenApi.upload(file, 'productos');
    const imageUrl = response.data.url;
    // Guardar imageUrl en el formulario
  } catch (error) {
    console.error('Error subiendo imagen:', error);
  }
};
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/productos/abc123.jpg",
  "public_id": "productos/abc123",
  "width": 1920,
  "height": 1080,
  "format": "jpg"
}
```

---

## Master-Detail (Facturas)

Para entidades con relación master-detail (ej: Factura + DetalleFactura):

```typescript
export const facturasApi = {
  // CRUD básico
  ...createCrudApi('facturas'),

  // Obtener factura con sus detalles
  getConDetalles: (id: number) =>
    api.get(`/facturas/${id}/detalles`),

  // Crear factura con detalles
  createConDetalles: (data: {
    factura: Record<string, unknown>;
    detalles: Record<string, unknown>[];
  }) => api.post('/facturas/con-detalles', data),
};

// Uso
const response = await facturasApi.createConDetalles({
  factura: {
    cliente_id: 1,
    fecha: '2025-01-20',
    total: 1500
  },
  detalles: [
    { producto_id: 1, cantidad: 2, precio_unitario: 500 },
    { producto_id: 3, cantidad: 1, precio_unitario: 500 }
  ]
});
```

---

## Manejo de Errores

### Códigos HTTP Comunes

| Código | Significado | Acción |
|--------|-------------|--------|
| 200 | OK | Éxito |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Validar datos enviados |
| 401 | Unauthorized | Token inválido/expirado (redirect a login) |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 422 | Validation Error | Errores de validación Pydantic |
| 500 | Server Error | Error interno del servidor |

### Captura de Errores en Componentes

```typescript
try {
  await productosApi.create({ nombre: '', precio: -10 });
} catch (error: any) {
  if (error.response?.status === 422) {
    // Error de validación
    const validationErrors = error.response.data.detail;
    console.error('Errores de validación:', validationErrors);
  } else if (error.response?.status === 401) {
    // Token expirado - ya se maneja en interceptor
  } else {
    console.error('Error desconocido:', error.message);
  }
}
```

---

## Filtros Multi-Tenant Automáticos

El backend filtra automáticamente por `organizacion_id` del usuario autenticado.

```typescript
// Frontend: simplemente hace GET /api/productos
const response = await productosApi.getAll();

// Backend: automáticamente filtra
// SELECT * FROM productos WHERE organizacion_id = <org_del_usuario_logueado>
```

**NO necesitás** pasar `organizacion_id` manualmente en los requests. El backend lo maneja automáticamente usando el token JWT.

---

## Ejemplo Completo: CRUD de Producto

```typescript
import { productosApi } from '@/lib/api';

// Listar todos (solo de mi organización)
const response = await productosApi.getAll();
const productos = response.data;

// Obtener uno
const producto = await productosApi.getOne(1);

// Crear
const nuevoProducto = await productosApi.create({
  codigo: 'PROD-001',
  nombre: 'Producto Demo',
  precio: 1500.00,
  activo: true
});

// Actualizar
await productosApi.update(1, {
  nombre: 'Producto Actualizado',
  precio: 1800.00
});

// Eliminar (soft delete)
await productosApi.delete(1);
```

---

## Componente DynamicABM

El componente `DynamicABM` consume automáticamente estos endpoints usando el `entityPlural` del registro de entidades:

```typescript
// frontend/src/config/entityRegistry.ts
export const entityRegistry = {
  'Producto': {
    singular: 'Producto',
    plural: 'productos',  // ← Usado para construir /api/productos
    // ...
  }
};
```

El componente hace:
```typescript
const api = createCrudApi(entity.plural);
const response = await api.getAll();
```

---

## TL;DR

| Querés... | Hacé... |
|-----------|---------|
| Agregar endpoint custom | Crear función en `api.ts` |
| Consumir entidad generada | `createCrudApi('nombre_plural')` |
| Subir imagen | `imagenApi.upload(file, 'carpeta')` |
| Login | `authApi.login(email, password)` |
| Usuario actual | `authApi.me()` |
| Master-detail | Crear endpoint custom en backend + frontend |

---

## Variables de Entorno Importantes

```bash
# Desarrollo
VITE_API_URL=http://localhost:8000/api

# Producción
VITE_API_URL=https://tu-app.herokuapp.com/api
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
```
