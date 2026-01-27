# SETUP INICIAL

Requisitos obligatorios para que el sistema funcione desde el primer uso.

---

## 1. Seed de Usuarios

El sistema DEBE incluir un script de seed que cree automáticamente:

### Organización Demo
```
Nombre: Demo
Código: DEMO
```

### 3 Usuarios de Prueba

| Usuario | Email | Password | Rol | Acceso |
|---------|-------|----------|-----|--------|
| Admin | admin@demo.com | admin123 | admin | TODO (incluye Configuración) |
| Supervisor | supervisor@demo.com | super123 | supervisor | Gestión + Configuración |
| Usuario | usuario@demo.com | user123 | usuario | Solo Gestión (sin Configuración) |

### Permisos por Rol

```
┌─────────────────────────────────────────────────────────────┐
│                    MATRIZ DE PERMISOS                        │
├─────────────────────────────────────────────────────────────┤
│                          │ usuario │ supervisor │   admin   │
├──────────────────────────┼─────────┼────────────┼───────────┤
│ Dashboard                │    ✓    │     ✓      │     ✓     │
│ ABMs de Negocio          │    ✓    │     ✓      │     ✓     │
│ Configuración/Auditoría  │    ✗    │     ✓      │     ✓     │
│ Gestión de Usuarios      │    ✗    │     ✗      │     ✓     │
└──────────────────────────┴─────────┴────────────┴───────────┘
```

---

## 2. Login Rápido (Quick Login)

En la pantalla de login, mostrar **3 botones** para facilitar pruebas:

```
┌─────────────────────────────────────────────┐
│              Iniciar Sesión                 │
│                                             │
│  [Email: ________________]                  │
│  [Password: ______________]                 │
│                                             │
│         [ Iniciar Sesión ]                  │
│                                             │
│  ─────────────────────────────────────────  │
│           Acceso rápido (demo)              │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Admin  │ │  Super  │ │ Usuario │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
└─────────────────────────────────────────────┘
```

### Comportamiento
- Al hacer click en un botón, completa email y password automáticamente
- O directamente hace login con esas credenciales
- Los botones deben verse como un "atajo" o acceso rápido
- Solo mostrar en entorno de desarrollo (opcional)

---

## 3. Script de Seed

### Ubicación
```
cli/seed.ts
```

### Ejecución
```bash
# Desarrollo local
cd cli
npm run seed

# Después de deploy en Heroku
# (el seed se conecta directamente a la DB via DATABASE_URL)
```

### Qué hace
1. Lee `DATABASE_URL` del archivo `backend/.env`
2. Crea la organización "Demo" si no existe
3. Crea 3 roles (admin, supervisor, usuario)
4. Crea 3 usuarios con passwords hasheados (bcrypt)

### Output esperado
```
🌱 SEED - Creando datos iniciales

📦 Creando organización...
   ✓ Organización creada (id: 1)

👥 Creando roles...
   ✓ Rol "admin" creado
   ✓ Rol "supervisor" creado
   ✓ Rol "usuario" creado

👤 Creando usuarios...
   ✓ Usuario "admin@demo.com" creado (admin)
   ✓ Usuario "supervisor@demo.com" creado (supervisor)
   ✓ Usuario "usuario@demo.com" creado (usuario)

✅ SEED COMPLETADO
```

---

## 4. Validación de Acceso en Frontend

### Sidebar.tsx
El menú de Configuración/Auditoría debe verificar el rol:

```tsx
// Solo mostrar si el usuario es admin o supervisor
{(user?.rol === 'admin' || user?.rol === 'supervisor') && (
  <ConfigSection />
)}
```

### Rutas Protegidas
```tsx
// En el router, proteger rutas de configuración
<Route
  path="/gestion/auditoria/*"
  element={
    <RequireRole roles={['admin', 'supervisor']}>
      <AuditoriaPage />
    </RequireRole>
  }
/>
```

---

## 5. Checklist

Antes de considerar el setup completo:

- [ ] Script seed.py creado
- [ ] Organización demo existe
- [ ] 3 usuarios creados (admin, supervisor, usuario)
- [ ] Botones de quick login en pantalla de login
- [ ] Menú Configuración oculto para rol "usuario"
- [ ] Rutas de auditoría protegidas por rol

---

## 6. Notas

- Las contraseñas del seed son solo para desarrollo
- En producción, cambiar contraseñas inmediatamente
- El quick login puede ocultarse con variable de entorno `VITE_SHOW_QUICK_LOGIN=false`
