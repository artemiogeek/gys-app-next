# 🗄️ Configuración de Base de Datos PostgreSQL - GYS App

## Estado Actual

✅ **PostgreSQL 17.6 instalado y ejecutándose**  
❌ **Base de datos no configurada** - Requiere configuración manual

---

## 📋 Pasos para Crear la Base de Datos

### **Paso 1: Obtener Contraseña de PostgreSQL**

Necesitas la contraseña del usuario `postgres` que se configuró durante la instalación de PostgreSQL.

**Si no recuerdas la contraseña:**
1. Busca en tu gestor de contraseñas
2. O reinicia la contraseña siguiendo la documentación de PostgreSQL

### **Paso 2: Conectar a PostgreSQL**

```powershell
# Conectar usando psql
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres
```

**Te pedirá la contraseña del usuario postgres.**

### **Paso 3: Crear las Bases de Datos**

Una vez conectado a PostgreSQL, ejecuta:

```sql
-- Crear base de datos principal
CREATE DATABASE gys_db;

-- Crear base de datos de testing
CREATE DATABASE gys_test_db;

-- Verificar que se crearon correctamente
\l

-- Salir de psql
\q
```

### **Paso 4: Actualizar Credenciales en .env**

Edita el archivo `.env` y actualiza las siguientes líneas:

```env
# Antes (valores por defecto)
DATABASE_URL="postgresql://username:password@localhost:5432/gys_db"
TEST_DATABASE_URL="postgresql://username:password@localhost:5432/gys_test_db"

# Después (con tus credenciales reales)
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA_AQUI@localhost:5432/gys_db"
TEST_DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA_AQUI@localhost:5432/gys_test_db"
```

### **Paso 5: Aplicar Esquema de Prisma**

```powershell
# Aplicar el esquema a la base de datos
npx prisma db push

# Verificar que las tablas se crearon
npx prisma studio
```

### **Paso 6: Verificar Conexión**

```powershell
# Probar la conexión
npx prisma db pull
```

**Si todo está correcto, deberías ver un mensaje de éxito.**

---

## 🔧 Comandos de Referencia Rápida

```powershell
# Conectar a PostgreSQL
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres

# Crear bases de datos (dentro de psql)
CREATE DATABASE gys_db;
CREATE DATABASE gys_test_db;

# Aplicar esquema Prisma
npx prisma db push

# Abrir Prisma Studio
npx prisma studio

# Verificar conexión
npx prisma db pull
```

---

## 🚨 Solución de Problemas

### Error: "Authentication failed"
- Verifica que la contraseña sea correcta
- Asegúrate de usar el usuario `postgres`

### Error: "Database does not exist"
- Ejecuta los comandos CREATE DATABASE
- Verifica que PostgreSQL esté ejecutándose

### Error: "Connection refused"
- Verifica que PostgreSQL esté ejecutándose:
  ```powershell
  Get-Service -Name *postgres*
  ```

---

## 📊 Esquema de Base de Datos

El proyecto incluye las siguientes entidades principales:

- **Usuarios y Autenticación** (User, Account, Session)
- **Clientes y Unidades** (Cliente, Unidad)
- **Catálogo** (CategoriaEquipo, CatalogoEquipo, Recurso)
- **Servicios** (CategoriaServicio, UnidadServicio)
- **Comercial** (Cotizacion, DetalleCotizacion)
- **Proyectos** (Proyecto, ListaEquipo, DetalleListaEquipo)
- **Logística** (Proveedor, Pedido, DetallePedido)
- **Aprovisionamiento** (OrdenCompra, DetalleOrdenCompra)

**Total: ~25 tablas** con relaciones y constraints definidos en `prisma/schema.prisma`

---

## ✅ Verificación Final

Una vez completados todos los pasos:

1. ✅ PostgreSQL conecta correctamente
2. ✅ Bases de datos `gys_db` y `gys_test_db` existen
3. ✅ Prisma puede conectarse sin errores
4. ✅ Todas las tablas están creadas
5. ✅ La aplicación funciona en http://localhost:3000

**¡Tu base de datos estará lista para usar!** 🎉