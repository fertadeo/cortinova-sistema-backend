# 🔧 Solución de Problemas: Error ECONNRESET

## **Descripción del Error**
El error `ECONNRESET` indica que la conexión a la base de datos MySQL se perdió o no se pudo establecer correctamente.

## **Causas Comunes**

### 1. **Base de Datos No Inicializada**
- MySQL no está ejecutándose
- Credenciales incorrectas
- Base de datos no existe

### 2. **Tablas Faltantes**
- Las tablas de notificaciones no existen
- Estructura de tablas incorrecta

### 3. **Configuración de Conexión**
- Variables de entorno faltantes
- Timeout de conexión
- Configuración de red

## **Pasos para Solucionar**

### **Paso 1: Verificar la Base de Datos**
```bash
# Ejecutar el script de verificación
npm run check-db
```

### **Paso 2: Si las Tablas No Existen**
```bash
# Conectar a MySQL y ejecutar el script
mysql -u tu_usuario -p tu_base_de_datos < scripts/check-notifications-tables.sql
```

### **Paso 3: Verificar Variables de Entorno**
Asegúrate de que tu archivo `.env` contenga:

```env
# Base de datos de desarrollo
DB_HOST_DEV=localhost
DB_USER_DEV=tu_usuario
DB_PASSWORD_DEV=tu_password
DB_NAME_DEV=tu_base_de_datos

# Base de datos de producción (opcional)
DB_HOST_PROD=tu_host_prod
DB_USER_PROD=tu_usuario_prod
DB_PASSWORD_PROD=tu_password_prod
DB_NAME_PROD=tu_base_de_datos_prod
```

### **Paso 4: Verificar que MySQL Esté Ejecutándose**
```bash
# En Windows
net start mysql

# En macOS/Linux
sudo systemctl start mysql
# o
sudo service mysql start
```

### **Paso 5: Probar Conexión Manual**
```bash
mysql -u tu_usuario -p -h localhost
```

## **Verificaciones Adicionales**

### **1. Verificar Puertos**
```bash
# Verificar si MySQL está escuchando en el puerto 3306
netstat -an | grep 3306
```

### **2. Verificar Permisos de Usuario**
```sql
-- En MySQL, verificar permisos
SHOW GRANTS FOR 'tu_usuario'@'localhost';
```

### **3. Verificar Configuración de TypeORM**
Revisar `src/config/database.ts`:
- Configuración correcta de entidades
- Variables de entorno correctas
- Configuración de logging

## **Logs de Depuración**

### **Habilitar Logs Detallados**
En `src/config/database.ts`, cambiar:
```typescript
logging: true, // Cambiar de false a true
```

### **Verificar Logs del Servidor**
```bash
# Ejecutar el servidor con logs detallados
NODE_ENV=development npm run dev
```

## **Soluciones Específicas**

### **Error: "ER_NO_SUCH_TABLE"**
```sql
-- Ejecutar este script para crear las tablas
SOURCE scripts/check-notifications-tables.sql;
```

### **Error: "ER_ACCESS_DENIED_ERROR"**
```sql
-- Crear usuario con permisos
CREATE USER 'tu_usuario'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON tu_base_de_datos.* TO 'tu_usuario'@'localhost';
FLUSH PRIVILEGES;
```

### **Error: "ECONNREFUSED"**
- Verificar que MySQL esté ejecutándose
- Verificar el puerto (por defecto 3306)
- Verificar firewall/antivirus

## **Prevención**

### **1. Pool de Conexiones**
Considerar usar un pool de conexiones para mejor manejo:

```typescript
// En database.ts
export const AppDataSource = new DataSource({
  // ... otras configuraciones
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  }
});
```

### **2. Health Check**
Implementar un endpoint de health check:

```typescript
// En routes/health.ts
router.get('/health', async (req, res) => {
  try {
    await AppDataSource.query('SELECT 1');
    res.json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'ERROR', database: 'disconnected' });
  }
});
```

### **3. Reintentos Automáticos**
El código ya incluye reintentos automáticos en `NotificationService.ts`.

## **Comandos Útiles**

```bash
# Verificar estado de MySQL
sudo systemctl status mysql

# Reiniciar MySQL
sudo systemctl restart mysql

# Ver logs de MySQL
sudo tail -f /var/log/mysql/error.log

# Verificar variables de entorno
node -e "require('dotenv').config(); console.log(process.env.DB_HOST_DEV)"
```

## **Contacto**
Si el problema persiste, revisa:
1. Logs del servidor
2. Logs de MySQL
3. Configuración de red
4. Variables de entorno

---

**¡Con estos pasos deberías poder resolver el error ECONNRESET!** 🚀

