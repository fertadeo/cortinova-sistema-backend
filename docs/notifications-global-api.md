# 📢 API de Notificaciones Globales - Sin Autenticación

## **🎯 Características Principales**

- **Notificaciones Globales**: Todas las notificaciones son visibles para todos los usuarios
- **Estado de Lectura Individual**: Cada usuario mantiene su propio estado de lectura
- **Sin Autenticación**: Los endpoints de lectura no requieren bearer token
- **Tiempo Real**: SSE para notificaciones en vivo
- **Push Notifications**: Soporte para PWA

## **🔗 Endpoints PÚBLICOS (Sin Autenticación)**

### **1. Obtener Todas las Notificaciones Globales**

```http
GET /api/notifications?page=1&limit=20&type=sistema&priority=high
```

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 20)
- `type` (string): Filtrar por tipo (`sistema`, `stock_bajo`, `nueva_medida`, etc.)
- `is_archived` (boolean): Filtrar por estado archivado
- `priority` (string): Filtrar por prioridad (`low`, `medium`, `high`, `urgent`)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "type": "sistema",
      "title": "Mantenimiento Programado",
      "message": "El sistema estará en mantenimiento...",
      "priority": "medium",
      "action_url": "/notificaciones",
      "action_text": "Ver Detalles",
      "metadata": {"maintenance": true},
      "is_global": true,
      "created_by": "user123",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### **2. Conectar al Stream SSE (Tiempo Real)**

```http
GET /api/notifications/stream
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Eventos SSE que recibirás:**
```
event: notification
data: {
  "id": "uuid-789",
  "type": "nueva_medida",
  "title": "Nueva Medida Registrada",
  "message": "Se ha registrado una nueva medida para el cliente Carlos López",
  "priority": "medium",
  "action_url": "/presupuestos/nuevo?medida_id=789",
      "action_text": "Crear Presupuesto",
      "metadata": {
        "medida_id": 789,
        "cliente_id": 123,
        "cliente_nombre": "Carlos López"
      }
    }
```

## **📖 Endpoints de Estado de Lectura (SIN Autenticación)**

### **3. Marcar Notificación Específica como Leída**

```http
PATCH /api/notifications/{notification_id}/read
```

**⚠️ IMPORTANTE**: No requiere `Authorization: Bearer {token}`

**Respuesta:**
```json
{
  "success": true,
  "message": "Notificación marcada como leída",
  "data": {
    "notification_id": "uuid-123",
    "user_id": "temp_abc123def456",
    "marked_at": "2024-01-15T11:30:00Z"
  }
}
```

### **4. Marcar TODAS las Notificaciones como Leídas**

```http
PATCH /api/notifications/read-all
```

**⚠️ IMPORTANTE**: No requiere `Authorization: Bearer {token}`

**Respuesta:**
```json
{
  "success": true,
  "message": "15 notificaciones marcadas como leídas",
  "data": {
    "user_id": "temp_abc123def456",
    "total": 15,
    "marked_at": "2024-01-15T11:30:00Z"
  }
}
```

### **5. Marcar Solo Notificaciones Globales como Leídas**

```http
PATCH /api/notifications/read-global
```

**⚠️ IMPORTANTE**: No requiere `Authorization: Bearer {token}`

**Respuesta:**
```json
{
  "success": true,
  "message": "8 notificaciones globales marcadas como leídas",
  "data": {
    "user_id": "temp_abc123def456",
    "globalNotifications": 8,
    "marked_at": "2024-01-15T11:30:00Z"
  }
}
```

## **🔐 Endpoints que SÍ Requieren Autenticación**

### **Crear Notificación Global**
```http
POST /api/notifications/create
Authorization: Bearer {token}
```

### **Configuración de Usuario**
```http
GET /api/notifications/{user_id}/settings
Authorization: Bearer {token}
```

### **Push Notifications**
```http
POST /api/notifications/{user_id}/push/subscribe
Authorization: Bearer {token}
```

## **🎯 Código JavaScript para el Frontend (Sin Autenticación)**

### **1. Conectar al Stream SSE (Tiempo Real)**

```javascript
class NotificationService {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.tempUserId = null;
  }

  // Conectar al stream SSE
  connectToStream() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource('/api/notifications/stream');
    
    this.eventSource.addEventListener('notification', (event) => {
      const notification = JSON.parse(event.data);
      console.log('Nueva notificación recibida:', notification);
      
      // Mostrar notificación en tiempo real
      this.showNotification(notification);
      
      // Actualizar contador de notificaciones no leídas
      this.updateNotificationCount();
    });

    this.eventSource.addEventListener('open', () => {
      console.log('Conexión SSE establecida');
      this.isConnected = true;
    });

    this.eventSource.addEventListener('error', (error) => {
      console.error('Error en SSE:', error);
      this.isConnected = false;
      
      // Reintentar conexión después de 5 segundos
      setTimeout(() => {
        this.connectToStream();
      }, 5000);
    });
  }

  // Obtener notificaciones
  async getNotifications(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/notifications?${params}`);
    return await response.json();
  }

  // Marcar como leída (SIN autenticación)
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
        // NO se incluye Authorization header
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('Notificación marcada como leída');
        // Actualizar UI
        this.updateNotificationUI(notificationId, true);
      }
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Marcar todas como leídas (SIN autenticación)
  async markAllAsRead() {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH'
        // NO se incluye Authorization header
      });
      
      const result = await response.json();
      if (result.success) {
        console.log(`${result.data.total} notificaciones marcadas como leídas`);
        // Actualizar toda la UI
        this.updateAllNotificationsAsRead();
      }
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Marcar solo globales como leídas (SIN autenticación)
  async markGlobalAsRead() {
    try {
      const response = await fetch('/api/notifications/read-global', {
        method: 'PATCH'
        // NO se incluye Authorization header
      });
      
      const result = await response.json();
      if (result.success) {
        console.log(`${result.data.globalNotifications} notificaciones globales marcadas como leídas`);
        // Actualizar UI de notificaciones globales
        this.updateGlobalNotificationsAsRead();
      }
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Mostrar notificación en la UI
  showNotification(notification) {
    // Crear elemento de notificación
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification notification-${notification.priority}`;
    notificationElement.innerHTML = `
      <div class="notification-header">
        <h4>${notification.title}</h4>
        <span class="notification-time">${new Date(notification.created_at).toLocaleTimeString()}</span>
      </div>
      <p>${notification.message}</p>
      ${notification.action_url ? `<a href="${notification.action_url}" class="btn btn-primary">${notification.action_text}</a>` : ''}
    `;

    // Agregar a la lista de notificaciones
    const notificationList = document.getElementById('notification-list');
    if (notificationList) {
      notificationList.insertBefore(notificationElement, notificationList.firstChild);
    }

    // Mostrar toast/alert
    this.showToast(notification);
  }

  // Mostrar toast/alert
  showToast(notification) {
    if (window.Toastify) {
      Toastify({
        text: notification.message,
        duration: 5000,
        gravity: "top",
        position: "right",
        backgroundColor: this.getPriorityColor(notification.priority),
        stopOnFocus: true
      }).showToast();
    } else {
      // Toast nativo
      alert(`${notification.title}: ${notification.message}`);
    }
  }

  // Obtener color según prioridad
  getPriorityColor(priority) {
    const colors = {
      'low': '#28a745',
      'medium': '#ffc107',
      'high': '#fd7e14',
      'urgent': '#dc3545'
    };
    return colors[priority] || colors.medium;
  }

  // Actualizar UI de notificación
  updateNotificationUI(notificationId, isRead) {
    const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
    if (notificationElement) {
      if (isRead) {
        notificationElement.classList.remove('unread');
        notificationElement.classList.add('read');
      } else {
        notificationElement.classList.remove('read');
        notificationElement.classList.add('unread');
      }
    }
  }

  // Actualizar todas las notificaciones como leídas
  updateAllNotificationsAsRead() {
    const unreadElements = document.querySelectorAll('.notification.unread');
    unreadElements.forEach(element => {
      element.classList.remove('unread');
      element.classList.add('read');
    });
    
    // Actualizar contador
    this.updateNotificationCount();
  }

  // Actualizar solo notificaciones globales como leídas
  updateGlobalNotificationsAsRead() {
    const globalElements = document.querySelectorAll('.notification[data-is-global="true"].unread');
    globalElements.forEach(element => {
      element.classList.remove('unread');
      element.classList.add('read');
    });
    
    // Actualizar contador
    this.updateNotificationCount();
  }

  // Actualizar contador de notificaciones
  async updateNotificationCount() {
    try {
      const response = await this.getNotifications({ is_read: false, limit: 1 });
      const count = response.pagination?.total || 0;
      
      const badge = document.getElementById('notification-badge');
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
      }
    } catch (error) {
      console.error('Error al actualizar contador:', error);
    }
  }

  // Desconectar
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.isConnected = false;
    }
  }
}
```

### **2. Inicializar el Servicio**

```javascript
// Inicializar cuando se carga la página
const notificationService = new NotificationService();

// Conectar al stream en tiempo real
notificationService.connectToStream();

// Cargar notificaciones existentes
async function loadNotifications() {
  try {
    const response = await notificationService.getNotifications({
      is_read: false,
      limit: 10
    });
    
    // Renderizar notificaciones en la UI
    renderNotifications(response.data);
    
    // Actualizar contador
    notificationService.updateNotificationCount();
  } catch (error) {
    console.error('Error al cargar notificaciones:', error);
  }
}

// Renderizar notificaciones
function renderNotifications(notifications) {
  const container = document.getElementById('notification-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  notifications.forEach(notification => {
    const element = createNotificationElement(notification);
    container.appendChild(element);
  });
}

// Crear elemento de notificación
function createNotificationElement(notification) {
  const element = document.createElement('div');
  element.className = `notification-item ${notification.is_read_by_user ? 'read' : 'unread'}`;
  element.setAttribute('data-notification-id', notification.id);
  element.setAttribute('data-is-global', notification.is_global);
  
  element.innerHTML = `
    <div class="notification-content">
      <h4>${notification.title}</h4>
      <p>${notification.message}</p>
      <small>${new Date(notification.created_at).toLocaleString()}</small>
    </div>
    <div class="notification-actions">
      ${!notification.is_read_by_user ? 
        `<button onclick="markAsRead('${notification.id}')" class="btn btn-sm btn-primary">Marcar como leída</button>` : 
        '<span class="text-muted">Leída</span>'
      }
    </div>
  `;
  return element;
}

// Funciones globales para los botones
window.markAsRead = function(notificationId) {
  notificationService.markAsRead(notificationId);
};

window.markAllAsRead = function() {
  notificationService.markAllAsRead();
};

window.markGlobalAsRead = function() {
  notificationService.markGlobalAsRead();
};

// Cargar notificaciones al cargar la página
document.addEventListener('DOMContentLoaded', loadNotifications);
```

## **🧪 Prueba los Endpoints (Sin Autenticación)**

### **Marcar una notificación como leída:**
```bash
curl -X PATCH \
  http://localhost:3000/api/notifications/uuid-123/read
```

### **Marcar todas como leídas:**
```bash
curl -X PATCH \
  http://localhost:3000/api/notifications/read-all
```

### **Marcar solo globales como leídas:**
```bash
curl -X PATCH \
  http://localhost:3000/api/notifications/read-global
```

## **🎯 Ventajas del Sistema Sin Autenticación**

1. **Acceso Universal**: Cualquier usuario puede marcar notificaciones como leídas
2. **Simplicidad**: No se requiere manejo de tokens en el frontend
3. **Identificación Temporal**: Cada usuario recibe un ID temporal basado en IP y User-Agent
4. **Persistencia**: El estado de lectura se mantiene para cada usuario temporal
5. **Seguridad**: Solo operaciones de lectura están disponibles sin autenticación

## **⚠️ Consideraciones de Seguridad**

- Los endpoints de **lectura** son públicos
- Los endpoints de **escritura** (crear, archivar, eliminar) requieren autenticación
- Los usuarios temporales solo pueden marcar como leídas, no pueden modificar contenido
- El sistema genera IDs temporales únicos para cada cliente

¿Te gustaría que probemos algún endpoint específico o necesitas ayuda con la implementación en el frontend?

