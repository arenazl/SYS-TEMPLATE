# CREDENCIALES Y DEPLOY

## 1. Arquitectura de Infraestructura

```
                              INTERNET
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    NETLIFY      │     │     HEROKU      │     │     AIVEN       │
│   (Frontend)    │────►│    (Backend)    │────►│   (Database)    │
│                 │     │                 │     │                 │
│ [app].netlify   │     │ [api].heroku    │     │ mysql.aiven     │
│     .app        │     │   .com          │     │  cloud.com      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        │               │   CLOUDINARY    │
        │               │  (File Storage) │
        │               └─────────────────┘
```

---

## 2. Credenciales por Servicio

> **IMPORTANTE:** No commitear credenciales reales a repositorios públicos.

### 2.1 Aiven (MySQL)

Obtener desde: https://console.aiven.io → Tu Servicio → Overview

```env
DB_HOST=[tu-proyecto].e.aivencloud.com
DB_PORT=23108
DB_USER=avnadmin
DB_PASSWORD=[COMPLETAR]
DB_NAME=[nombre_proyecto]
```

**Crear base de datos:**
```sql
CREATE DATABASE nombre_proyecto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2 Cloudinary (Storage)

Obtener desde: https://cloudinary.com/console → Dashboard

```env
CLOUDINARY_CLOUD_NAME=[COMPLETAR]
CLOUDINARY_API_KEY=[COMPLETAR]
CLOUDINARY_API_SECRET=[COMPLETAR]
```

**Límites Free:** 25 GB storage, 25 GB bandwidth/mes

### 2.3 Seguridad

```env
SECRET_KEY=[COMPLETAR]
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**Generar clave segura:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2.4 App Config

```env
APP_NAME=[NombreApp]
APP_VERSION=1.0.0
APP_DEBUG=False
```

---

## 3. Deploy Backend (Heroku)

### 3.1 Setup Inicial

```bash
# Instalar CLI
npm install -g heroku
heroku login

# Crear app
cd backend
heroku create [nombre-api]
```

### 3.2 Configurar Variables

```bash
# Database
heroku config:set DB_HOST=[host].aivencloud.com
heroku config:set DB_PORT=23108
heroku config:set DB_NAME=[db]
heroku config:set DB_USER=avnadmin
heroku config:set DB_PASSWORD=[password]

# Security
heroku config:set SECRET_KEY=[tu-clave]
heroku config:set ALGORITHM=HS256
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES=1440

# App
heroku config:set APP_NAME=[NombreApp]
heroku config:set APP_DEBUG=False

# CORS (importante!)
heroku config:set CORS_ORIGINS='["https://[tu-app].netlify.app","http://localhost:5173"]'

# Cloudinary
heroku config:set CLOUDINARY_CLOUD_NAME=[cloud]
heroku config:set CLOUDINARY_API_KEY=[key]
heroku config:set CLOUDINARY_API_SECRET=[secret]
```

### 3.3 Archivos Requeridos

**Procfile:**
```
web: uvicorn main:app --host=0.0.0.0 --port=${PORT:-5000}
```

**runtime.txt:**
```
python-3.11.7
```

### 3.4 Deploy

```bash
git add .
git commit -m "Ready for deploy"
git push heroku master
```

### 3.5 Comandos Útiles

```bash
heroku logs --tail              # Logs en tiempo real
heroku restart                  # Reiniciar
heroku run "python script.py"   # Ejecutar comando
heroku config                   # Ver variables
```

---

## 4. Deploy Frontend (Netlify)

### 4.1 Setup Inicial

```bash
npm install -g netlify-cli
netlify login

cd frontend
netlify sites:create --name [mi-app]
```

### 4.2 Configurar Variables

```bash
netlify env:set VITE_API_URL https://[mi-api].herokuapp.com
```

### 4.3 netlify.toml

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4.4 Deploy

```bash
npm run build
netlify deploy --prod --dir=dist
```

### 4.5 Comandos Útiles

```bash
netlify status          # Estado del sitio
netlify open            # Abrir en browser
netlify deploys         # Ver historial
```

---

## 5. APIs de IA (Opcionales)

### 5.1 Groq (Llama - Gratis)

Obtener desde: https://console.groq.com/keys

```env
GROQ_API_KEY=[COMPLETAR]
```

| Modelo | Tokens/min | Uso |
|--------|------------|-----|
| `llama-3.1-70b-versatile` | 6,000 | Mejor calidad |
| `llama-3.1-8b-instant` | 30,000 | Más rápido |

**Límites free:** 14,400 requests/día, sin tarjeta

### 5.2 Gemini (Google - Gratis)

Obtener desde: https://aistudio.google.com/apikey

```env
GEMINI_API_KEY=[COMPLETAR]
GEMINI_MODEL=gemini-2.0-flash
```

| Modelo | Descripción |
|--------|-------------|
| `gemini-2.0-flash` | Rápido y económico |
| `gemini-2.5-pro` | Mayor calidad |

**Límites free:** 15 RPM, 1M tokens/día

### 5.3 Grok (xAI)

Obtener desde: https://console.x.ai/

```env
GROK_API_KEY=[COMPLETAR]
GROK_MODEL=grok-3-mini
```

---

## 6. Mapas (Sin API Key)

Leaflet + OpenStreetMap es **100% gratuito**.

```bash
npm install leaflet react-leaflet @types/leaflet
```

**Tiles disponibles:**
| Provider | URL |
|----------|-----|
| OpenStreetMap | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |
| CartoDB Light | `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png` |
| CartoDB Dark | `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png` |

---

## 7. Flujo de Deploy Completo

### Primera Vez

```bash
# 1. Aiven - Crear servicio MySQL y base de datos

# 2. Heroku
cd backend
heroku create [mi-api]
heroku config:set [todas las variables]
git push heroku master

# 3. Crear tablas
heroku run "alembic upgrade head"

# 4. Netlify
cd frontend
netlify sites:create --name [mi-app]
netlify env:set VITE_API_URL https://[mi-api].herokuapp.com
npm run build
netlify deploy --prod --dir=dist

# 5. Actualizar CORS
heroku config:set CORS_ORIGINS='["https://[mi-app].netlify.app"]'
```

### Deploys Posteriores

```bash
# Backend
cd backend && git push heroku master

# Frontend
cd frontend && npm run build && netlify deploy --prod --dir=dist
```

---

## 8. Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| `H10 - App crashed` | Error en código | `heroku logs --tail` |
| `CORS error` | Origins mal configurados | Verificar `CORS_ORIGINS` |
| `Connection refused` | Credenciales DB incorrectas | Verificar variables |
| `401 Unauthorized` | Token expirado/SECRET_KEY | Verificar `SECRET_KEY` |
| `Build failed` | Error en build | Ver logs de Netlify |

---

## 9. Checklist

### Pre-Deploy
- [ ] Variables de entorno definidas
- [ ] Procfile y netlify.toml creados
- [ ] Build de frontend exitoso

### Servicios
- [ ] Aiven: MySQL creado y credenciales copiadas
- [ ] Heroku: App creada y variables configuradas
- [ ] Netlify: Site creado y VITE_API_URL configurado
- [ ] Cloudinary: Cuenta creada (si usas uploads)

### Post-Deploy
- [ ] API respondiendo (`/docs`)
- [ ] Frontend cargando
- [ ] Login funcionando
- [ ] CORS configurado

---

## 10. URLs de Referencia

| Servicio | Consola | Docs |
|----------|---------|------|
| Aiven | https://console.aiven.io | https://docs.aiven.io/docs/products/mysql |
| Heroku | https://dashboard.heroku.com | https://devcenter.heroku.com/articles/getting-started-with-python |
| Netlify | https://app.netlify.com | https://docs.netlify.com |
| Cloudinary | https://cloudinary.com/console | https://cloudinary.com/documentation |
