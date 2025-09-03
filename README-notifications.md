# 🚀 Sistema de Notificaciones - Cortinova

## 📋 Resumen

Sistema completo de notificaciones en tiempo real implementado para el backend de Cortinova, con soporte para:

- ✅ **SSE (Server-Sent Events)** - Notificaciones en tiempo real
- ✅ **Push Notifications** - Notificaciones push para PWA
- ✅ **Configuración por usuario** - Preferencias personalizadas
- ✅ **Eventos del negocio** - Notificaciones automáticas
- ✅ **Validación con Zod** - Validación robusta de datos
- ✅ **Logging con Winston** - Logs estructurados
- ✅ **Autenticación JWT** - Seguridad integrada

## 🏗️ Arquitectura

```
src/
├── entities/
│   ├── Notifications.ts          # Entidad principal de notificaciones
│   ├── NotificationSettings.ts   # Configuración por usuario
│   └── PushSubscription.ts       # Suscripciones push
├── services/
│   ├── NotificationService.ts    # Lógica de negocio principal
│   ├── SSEService.ts            # Manejo de conexiones SSE
│   ├── PushNotificationService.ts # Push notifications
│   └── LoggerService.ts         # Logging estructurado
├── controllers/
│   └── notificationController.ts # Controladores de la API
└── routes/
    └── notificationRoutes.ts     # Definición de rutas
```

## 🚀 Instalación Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Generar claves VAPID
```bash
npm run generate-vapid
```

### 3. Configurar variables de entorno
```env
# VAPID Keys (generadas en el paso anterior)
VAPID_PUBLIC_KEY=tu_clave_publica_aqui
VAPID_PRIVATE_KEY=tu_clave_privada_aqui
VAPID_EMAIL=notifications@cortinova.com

# Logging
LOG_LEVEL=info
```

### 4. Crear tablas en la base de datos
```sql
-- Ejecutar los scripts SQL de docs/notifications-api.md
```

### 5. Integrar rutas en el servidor principal
```typescript
// En src/index.ts o donde configures las rutas
import notificationRoutes from './routes/notificationRoutes';

app.use('/api/notifications', notificationRoutes);
```

## 🎯 Características Principales

### 1. **SSE - Tiempo Real**
- Conexiones persistentes con reconexión automática
- Ping cada 30 segundos para mantener conexión viva
- Limpieza automática de conexiones inactivas
- Soporte para múltiples conexiones por usuario

### 2. **Push Notifications**
- Web Push API con VAPID
- Suscripciones por dispositivo/usuario
- Limpieza automática de suscripciones inválidas
- Soporte para acciones en notificaciones

### 3. **Configuración Flexible**
- Preferencias por usuario
- Umbral de stock configurable
- Habilitar/deshabilitar tipos de notificación
- Configuración de sonidos

### 4. **Eventos del Negocio**
- Stock bajo automático
- Nuevas medidas registradas
- Pedidos listos
- Notificaciones del sistema

## 📱 Uso en el Frontend

### Conexión SSE
```javascript
const eventSource = new EventSource('/api/notifications/stream/123');

eventSource.addEventListener('notification', (event) => {
  const notification = JSON.parse(event.data);
  showNotification(notification);
});
```

### Push Notifications
```javascript
// Solicitar permisos
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    subscribeToPush();
  }
});

// Suscribir
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey
  });
  
  // Enviar al servidor
  await fetch('/api/notifications/123/push/subscribe', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(subscription)
  });
}
```

## 🔧 Integración con Eventos Existentes

### Ejemplo: Notificar al crear presupuesto
```typescript
// En presupuestoController.ts
import { NotificationService } from '../services/NotificationService';

const notificationService = new NotificationService();

// Después de crear el presupuesto exitosamente
await notificationService.notifySistema(
  user_id,
  `Presupuesto Creado #${numeroPresupuesto}`,
  `Presupuesto creado para ${cliente.nombre} por $${total}`,
  `/presupuestos/${presupuestoId}`
);
```

### Ejemplo: Notificar stock bajo
```typescript
// En productController.ts después de una venta
if (stockActual <= stockThreshold) {
  await notificationService.notifyStockBajo(
    user_id,
    producto,
    stockActual,
    stockThreshold
  );
}
```

## 📊 Monitoreo

### Logs Estructurados
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs

### Métricas Disponibles
- Conexiones SSE activas
- Suscripciones push válidas
- Tasa de entrega de notificaciones
- Errores por tipo

### Endpoint de Estadísticas
```bash
GET /api/notifications/:user_id/stats
```

## 🔒 Seguridad

- ✅ Autenticación JWT requerida
- ✅ Validación de datos con Zod
- ✅ Sanitización de inputs
- ✅ Rate limiting (recomendado)
- ✅ CORS configurado

## 🚨 Manejo de Errores

### Respuestas Consistentes
```json
{
  "success": false,
  "error": "Descripción del error",
  "details": "Detalles adicionales"
}
```

### Logs de Error
Todos los errores se registran con:
- Timestamp
- Stack trace
- Contexto del error
- Datos relevantes

## 📈 Performance

### Optimizaciones Implementadas
- Índices en base de datos
- Paginación eficiente
- Limpieza automática de conexiones
- Manejo asíncrono de notificaciones

### Recomendaciones
- Usar Redis para escalabilidad (opcional)
- Implementar rate limiting
- Monitorear uso de memoria
- Configurar timeouts apropiados

## 🔄 Migración de Datos

### Scripts SQL
```sql
-- Ver docs/notifications-api.md para scripts completos
```

### Backup Recomendado
```bash
# Antes de ejecutar las migraciones
mysqldump -u root -p cortinova > backup_before_notifications.sql
```

## 📝 Próximos Pasos

### Funcionalidades Futuras
- [ ] Notificaciones por email
- [ ] Plantillas de notificación
- [ ] Programación de notificaciones
- [ ] Analytics avanzados
- [ ] Integración con Slack/Discord

### Mejoras Técnicas
- [ ] Redis para escalabilidad
- [ ] WebSockets como alternativa a SSE
- [ ] Compresión de datos
- [ ] Cache de configuraciones

## 🤝 Contribución

### Estándares de Código
- TypeScript estricto
- Validación con Zod
- Logging estructurado
- Manejo de errores consistente
- Documentación JSDoc

### Testing
```bash
# Agregar tests unitarios
npm test

# Tests de integración
npm run test:integration
```

## 📞 Soporte

### Documentación Completa
- [API Documentation](docs/notifications-api.md)
- [Ejemplos de Uso](docs/examples.md)
- [Troubleshooting](docs/troubleshooting.md)

### Logs de Debug
```bash
# Habilitar logs detallados
LOG_LEVEL=debug npm run dev
```

---

**¡El sistema de notificaciones está listo para usar! 🎉**

Para más información, consulta la [documentación completa](docs/notifications-api.md).
