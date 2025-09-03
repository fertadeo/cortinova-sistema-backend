# API de Notificaciones - Cortinova Sistema

## 📋 Descripción General

Sistema completo de notificaciones en tiempo real con soporte para:
- **SSE (Server-Sent Events)** - Notificaciones en tiempo real
- **Push Notifications** - Notificaciones push para PWA
- **Configuración por usuario** - Preferencias personalizadas
- **Eventos del negocio** - Notificaciones automáticas

## 🚀 Configuración Inicial

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
# VAPID Keys para Push Notifications
VAPID_PUBLIC_KEY=tu_clave_publica_aqui
VAPID_PRIVATE_KEY=tu_clave_privada_aqui
VAPID_EMAIL=notifications@cortinova.com

# Logging
LOG_LEVEL=info
```

### 4. Crear tablas en la base de datos
```sql
-- Tabla principal de notificaciones
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  type ENUM('stock_bajo', 'nuevo_cliente', 'pedido_listo', 'nueva_medida', 'pedido_atrasado', 'presupuesto_disponible', 'venta_realizada', 'sistema') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  action_url VARCHAR(500) NULL,
  action_text VARCHAR(100) NULL,
  metadata JSON NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_user_type (user_id, type),
  INDEX idx_created_at (created_at),
  INDEX idx_expires_at (expires_at)
);

-- Configuración por usuario
CREATE TABLE notification_settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  stock_threshold INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suscripciones push para PWA
CREATE TABLE push_subscriptions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  UNIQUE KEY unique_endpoint (endpoint)
);
```

## 🔌 Endpoints

### Autenticación
Todos los endpoints requieren un token JWT válido en el header:
```
Authorization: Bearer <token>
```

### 1. SSE - Stream de Notificaciones en Tiempo Real

#### GET `/api/notifications/stream/:user_id`
Stream de notificaciones en tiempo real usando Server-Sent Events.

**Headers requeridos:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Eventos recibidos:**
- `connected` - Conexión establecida
- `notification` - Nueva notificación
- `ping` - Mantener conexión viva

**Ejemplo de uso en JavaScript:**
```javascript
const eventSource = new EventSource('/api/notifications/stream/123');

eventSource.onopen = () => {
  console.log('Conexión SSE establecida');
};

eventSource.addEventListener('connected', (event) => {
  const data = JSON.parse(event.data);
  console.log('Conectado con ID:', data.clientId);
});

eventSource.addEventListener('notification', (event) => {
  const notification = JSON.parse(event.data);
  console.log('Nueva notificación:', notification);
  // Mostrar notificación en la UI
});

eventSource.addEventListener('ping', (event) => {
  // Mantener conexión viva
});

eventSource.onerror = (error) => {
  console.error('Error SSE:', error);
  // Reconectar automáticamente
};
```

### 2. CRUD de Notificaciones

#### GET `/api/notifications/:user_id`
Obtener notificaciones del usuario con paginación y filtros.

**Query Parameters:**
- `page` (number, default: 1) - Página actual
- `limit` (number, default: 20) - Elementos por página
- `type` (string) - Filtrar por tipo de notificación
- `is_read` (boolean) - Filtrar por estado de lectura
- `is_archived` (boolean) - Filtrar por estado de archivado

**Ejemplo:**
```bash
GET /api/notifications/123?page=1&limit=10&type=stock_bajo&is_read=false
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "user_id": "123",
      "type": "stock_bajo",
      "title": "Stock Bajo - Tela Premium",
      "message": "Quedan solo 5 unidades",
      "priority": "high",
      "action_url": "/stock/456",
      "action_text": "Gestionar Stock",
      "metadata": {
        "producto_id": "456",
        "stock_actual": 5
      },
      "is_read": false,
      "is_archived": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### POST `/api/notifications/:user_id/create`
Crear una nueva notificación.

**Body:**
```json
{
  "type": "sistema",
  "title": "Nueva Versión Disponible",
  "message": "Ya se encuentra disponible el módulo de presupuestos",
  "priority": "medium",
  "action_url": "/actualizaciones",
  "action_text": "Ver Cambios",
  "metadata": {
    "version": "2.1.0",
    "features": ["presupuestos", "reportes"]
  }
}
```

#### PATCH `/api/notifications/:id/read`
Marcar una notificación como leída.

#### PATCH `/api/notifications/:id/archive`
Archivar una notificación.

#### PATCH `/api/notifications/read-all`
Marcar todas las notificaciones del usuario como leídas.

#### DELETE `/api/notifications/:id`
Eliminar una notificación.

### 3. Configuración de Usuario

#### GET `/api/notifications/:user_id/settings`
Obtener configuración de notificaciones del usuario.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user_id": "123",
    "email_enabled": true,
    "push_enabled": true,
    "sound_enabled": true,
    "stock_threshold": 10
  }
}
```

#### PUT `/api/notifications/:user_id/settings`
Actualizar configuración de notificaciones.

**Body:**
```json
{
  "email_enabled": true,
  "push_enabled": false,
  "sound_enabled": true,
  "stock_threshold": 15
}
```

### 4. Push Notifications (PWA)

#### POST `/api/notifications/:user_id/push/subscribe`
Suscribir a push notifications.

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "p256dh": "BEl62iUYgUivxIkv69yViEuiBIa1...",
  "auth": "tBHI64YXsNHdqXM..."
}
```

#### DELETE `/api/notifications/:user_id/push/unsubscribe`
Desuscribir de push notifications.

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

#### POST `/api/notifications/:user_id/push/test`
Enviar notificación de prueba.

**Body:**
```json
{
  "title": "Notificación de Prueba",
  "message": "Esta es una notificación de prueba"
}
```

### 5. Estadísticas

#### GET `/api/notifications/:user_id/stats`
Obtener estadísticas de notificaciones.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "sse": {
      "totalClients": 5,
      "userConnections": 3
    },
    "push": {
      "totalSubscriptions": 10,
      "uniqueUsers": 8
    },
    "user_settings": {
      "email_enabled": true,
      "push_enabled": true,
      "sound_enabled": true,
      "stock_threshold": 10
    }
  }
}
```

## 🎯 Eventos del Negocio

### 1. Stock Bajo
```javascript
// Cuando se realiza una venta y el stock queda bajo
await notificationService.notifyStockBajo(
  user_id,
  producto,
  stockActual,
  stockThreshold
);
```

### 2. Nueva Medida
```javascript
// Cuando se registra una nueva medida
await notificationService.notifyNuevaMedida(
  user_id,
  medida,
  cliente
);
```

### 3. Pedido Listo
```javascript
// Cuando un pedido se marca como finalizado
await notificationService.notifyPedidoListo(
  user_id,
  pedido,
  cliente
);
```

### 4. Notificación del Sistema
```javascript
// Notificación personalizada del desarrollador
await notificationService.notifySistema(
  user_id,
  "Nueva Versión Disponible",
  "Ya se encuentra disponible el módulo de presupuestos",
  "/actualizaciones"
);
```

## 📱 Integración con PWA

### 1. Solicitar permisos
```javascript
if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      // Suscribir a push notifications
      subscribeToPushNotifications();
    }
  });
}
```

### 2. Suscribir a push notifications
```javascript
async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });

    // Enviar suscripción al servidor
    await fetch('/api/notifications/123/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
      })
    });
  } catch (error) {
    console.error('Error al suscribir:', error);
  }
}
```

### 3. Service Worker para push notifications
```javascript
// service-worker.js
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    title: data.title,
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    actions: data.actions,
    requireInteraction: data.requireInteraction
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' && event.notification.data.action_url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.action_url)
    );
  }
});
```

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
# Base de datos
DB_HOST_DEV=localhost
DB_USER_DEV=root
DB_PASSWORD_DEV=password
DB_NAME_DEV=cortinova_dev

# JWT
JWT_SECRET=tu_jwt_secret_aqui

# VAPID Keys
VAPID_PUBLIC_KEY=tu_clave_publica_aqui
VAPID_PRIVATE_KEY=tu_clave_privada_aqui
VAPID_EMAIL=notifications@cortinova.com

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

### Logs
Los logs se guardan en:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs

### Monitoreo
- Conexiones SSE activas
- Suscripciones push válidas
- Rendimiento de envío de notificaciones
- Errores de validación y base de datos

## 🚨 Manejo de Errores

### Códigos de Error Comunes
- `400` - Datos de entrada inválidos
- `401` - Token de autenticación inválido
- `404` - Recurso no encontrado
- `500` - Error interno del servidor

### Respuestas de Error
```json
{
  "success": false,
  "error": "Descripción del error",
  "details": "Detalles adicionales (opcional)"
}
```

## 📊 Monitoreo y Métricas

### Métricas Disponibles
- Número de conexiones SSE activas
- Número de suscripciones push
- Tasa de entrega de notificaciones
- Tiempo de respuesta de la API
- Errores por tipo

### Logs Estructurados
Todos los eventos importantes se registran con:
- Timestamp
- Nivel de log
- Contexto del evento
- Datos relevantes
- Stack trace (para errores)
