"""
Seed inicial para el sistema.

Crea:
- 1 Organización de ejemplo
- Roles y permisos básicos
- 1 Usuario admin
- Parámetros del sistema

Uso:
    python seed.py
"""

import asyncio
from sqlalchemy import select
from core.database import AsyncSessionLocal, init_db
from core.security import get_password_hash
from models import Organizacion, Usuario, Rol, Permiso, Parametro


async def seed():
    print("Inicializando base de datos...")
    await init_db()

    async with AsyncSessionLocal() as db:
        # Verificar si ya existe data
        result = await db.execute(select(Organizacion))
        if result.scalar_one_or_none():
            print("Ya existe data en la base de datos. Abortando seed.")
            return

        # 1. Organización default
        print("Creando organización...")
        org = Organizacion(
            nombre="Mi Empresa",
            codigo="default",
            descripcion="Organización principal",
            color_primario="#3B82F6",
            color_secundario="#1E40AF",
            activo=True
        )
        db.add(org)
        await db.flush()

        # 2. Roles básicos
        print("Creando roles...")
        roles_data = [
            {"nombre": "Administrador", "codigo": "admin", "descripcion": "Acceso total al sistema"},
            {"nombre": "Supervisor", "codigo": "supervisor", "descripcion": "Gestión de usuarios y reportes"},
            {"nombre": "Usuario", "codigo": "usuario", "descripcion": "Acceso básico"},
        ]
        for r in roles_data:
            rol = Rol(organizacion_id=org.id, **r, activo=True)
            db.add(rol)

        # 3. Permisos básicos
        print("Creando permisos...")
        permisos_data = [
            {"nombre": "Ver usuarios", "codigo": "usuarios.ver", "modulo": "usuarios"},
            {"nombre": "Crear usuarios", "codigo": "usuarios.crear", "modulo": "usuarios"},
            {"nombre": "Editar usuarios", "codigo": "usuarios.editar", "modulo": "usuarios"},
            {"nombre": "Eliminar usuarios", "codigo": "usuarios.eliminar", "modulo": "usuarios"},
            {"nombre": "Ver configuración", "codigo": "config.ver", "modulo": "config"},
            {"nombre": "Editar configuración", "codigo": "config.editar", "modulo": "config"},
        ]
        for p in permisos_data:
            permiso = Permiso(organizacion_id=org.id, **p, activo=True)
            db.add(permiso)

        # 4. Usuario admin
        print("Creando usuario admin...")
        admin = Usuario(
            organizacion_id=org.id,
            email="admin@admin.com",
            password_hash=get_password_hash("admin123"),
            nombre="Admin",
            apellido="Sistema",
            rol="admin",
            activo=True
        )
        db.add(admin)

        # 5. Usuario normal
        print("Creando usuario demo...")
        user = Usuario(
            organizacion_id=org.id,
            email="usuario@demo.com",
            password_hash=get_password_hash("123456"),
            nombre="Usuario",
            apellido="Demo",
            rol="usuario",
            activo=True
        )
        db.add(user)

        # 6. Parámetros del sistema
        print("Creando parámetros...")
        params_data = [
            {"clave": "app_name", "valor": "Mi App", "tipo": "string", "descripcion": "Nombre de la aplicación", "editable": True},
            {"clave": "items_per_page", "valor": "20", "tipo": "number", "descripcion": "Items por página", "editable": True},
            {"clave": "allow_register", "valor": "true", "tipo": "boolean", "descripcion": "Permitir registro público", "editable": True},
        ]
        for p in params_data:
            param = Parametro(organizacion_id=org.id, **p, activo=True)
            db.add(param)

        await db.commit()

        print("\n" + "="*50)
        print("  SEED COMPLETADO")
        print("="*50)
        print(f"\n  Organización: {org.nombre} (ID: {org.id})")
        print(f"\n  Usuarios creados:")
        print(f"    - admin@admin.com / admin123 (Admin)")
        print(f"    - usuario@demo.com / 123456 (Usuario)")
        print(f"\n  Roles: {len(roles_data)}")
        print(f"  Permisos: {len(permisos_data)}")
        print(f"  Parámetros: {len(params_data)}")
        print("\n" + "="*50 + "\n")


if __name__ == "__main__":
    asyncio.run(seed())
