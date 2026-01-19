# Generador de ABMs

¿Cansado de copiar y pegar el mismo ABM 50 veces? Yo también. Por eso hice esto.

---

## Primera vez (solo una vez en la vida)

Instalá esto y olvidate:

```bash
# Python
pip install sqlmodel alembic fastapi>=0.128.0 aiomysql passlib[bcrypt] python-jose

# Node
cd cli && npm install
```

---

## Quiero crear un ABM nuevo

Ponele que querés un ABM de Sucursales.

Abrí `cli/negocio.json` y agregá:

```json
{
  "name": "Sucursal",
  "plural": "sucursales",
  "table": "sucursales",
  "fields": "codigo:string:req nombre:string:req direccion:text",
  "icon": "MapPin"
}
```

Después:

```bash
cd cli
npm run sync:migrate
```

Abrí el browser en `/gestion/sucursales`. Ta listo.

---

## Ya tengo la tabla en MySQL

Perfecto, no la hagas de nuevo. Corré:

```bash
npx tsx generate-from-db.ts sucursales
```

Te escupe el JSON. Copialo al módulo y hacé:

```bash
npm run sync
```

Sin `:migrate` porque la tabla ya existe.

---

## ¿Cómo escribo los campos?

Es fácil: `nombre:tipo` y si es obligatorio le ponés `:req`

Ejemplos:

- `nombre:string:req` → Input obligatorio
- `email:email` → Input de email
- `precio:decimal` → Plata
- `cantidad:int` → Número entero
- `activo:bool` → Checkbox sí/no
- `fecha:date` → Calendario
- `notas:text` → Textarea grande
- `estado:enum(nuevo,usado)` → Combo con esas opciones
- `cliente_id:fk:Cliente` → Combo que trae los clientes de la base

---

## Quiero un Pedido con sus líneas adentro

Eso se llama master-detail. Así:

```json
{
  "name": "Pedido",
  "fields": "numero:string:req cliente_id:fk:Cliente:req",
  "masterDetail": true
},
{
  "name": "DetallePedido",
  "fields": "pedido_id:fk:Pedido:req producto_id:fk:Producto:req cantidad:int:req",
  "isDetail": true,
  "masterEntity": "Pedido"
}
```

Cuando abrís el Pedido, te aparece la grillita de productos abajo.

---

## Se rompió todo

Tranqui, pasa. Solución:

1. Borrá todas las tablas de la base
2. Borrá los archivos de `alembic/versions/`
3. Corré `npm run sync:migrate`

Arrancás de cero en 2 minutos.

---

## Para probar

```
Usuario: admin@demo.com
Clave: admin123
```

---

## TL;DR

| Querés... | Hacé... |
|-----------|---------|
| ABM nuevo | Editá el JSON → `npm run sync:migrate` |
| ABM de tabla que ya existe | `generate-from-db` → copiá JSON → `npm run sync` |
| Agregar un campo | Editá el JSON → `npm run sync:migrate` |
