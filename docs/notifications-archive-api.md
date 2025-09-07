# 📁 API de Archivado de Notificaciones - Cortinova

## **🎯 Características Principales**

- **Archivado Individual**: Archivar una notificación específica
- **Archivado Múltiple**: Archivar varias notificaciones en una operación
- **Operación Combinada**: Marcar como leída Y archivar en una sola acción
- **Acceso Público**: Endpoints sin autenticación para usuarios temporales
- **Acceso Autenticado**: Endpoints con autenticación para usuarios registrados

## **🔗 Endpoints PÚBLICOS (Sin Autenticación)**

### **1. Archivar Notificación Individual**

```http
PATCH /api/notifications/{notification_id}/archive
```

**⚠️ IMPORTANTE**: No requiere `Authorization: Bearer {token}`

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Notificación archivada exitosamente",
  "data": {
    "notification_id": "uuid-123",
    "user_id": "temp_abc123def456",
    "archived_at": "2024-01-15T11:30:00Z"
  }
}
```

**Respuesta de Error:**
```json
{
  "success": false,
  "error": "NOTIFICATION_NOT_FOUND",
  "message": "Notificación no encontrada"
}
```

### **2. Marcar como Leída Y Archivar (Operación Combinada)**

```http
PATCH /api/notifications/{notification_id}/read-and-archive
```

**⚠️ IMPORTANTE**: No requiere `Authorization: Bearer {token}`

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Notificación marcada como leída y archivada exitosamente",
  "data": {
    "notification_id": "uuid-123",
    "user_id": "temp_abc123def456",
    "marked_as_read": true,
    "archived": true,
    "notification": {
      "id": "uuid-123",
      "type": "nueva_medida",
      "title": "Nueva Medida Tomada",
      "is_global": true
    },
    "processed_at": "2024-01-15T11:30:00Z"
  }
}
```

## **🔐 Endpoints que SÍ Requieren Autenticación**

### **3. Archivar Notificación (Autenticado)**

```http
PATCH /api/notifications/{notification_id}/archive
Authorization: Bearer {token}
```

### **4. Marcar como Leída Y Archivar (Autenticado)**

```http
PATCH /api/notifications/{notification_id}/read-and-archive
Authorization: Bearer {token}
```

### **5. Archivar Múltiples Notificaciones**

```http
PATCH /api/notifications/archive-multiple
Authorization: Bearer {token}
Content-Type: application/json

{
  "notification_ids": [
    "uuid-123",
    "uuid-456",
    "uuid-789"
  ]
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "3 notificaciones archivadas exitosamente",
  "data": {
    "user_id": "user123",
    "total_requested": 3,
    "success_count": 3,
    "failed_count": 0,
    "success_ids": [
      "uuid-123",
      "uuid-456",
      "uuid-789"
    ],
    "failed_ids": [],
    "processed_at": "2024-01-15T11:30:00Z"
  }
}
```

**Respuesta con Errores Parciales:**
```json
{
  "success": true,
  "message": "2 notificaciones archivadas exitosamente",
  "data": {
    "user_id": "user123",
    "total_requested": 3,
    "success_count": 2,
    "failed_count": 1,
    "success_ids": [
      "uuid-123",
      "uuid-456"
    ],
    "failed_ids": [
      "uuid-789"
    ],
    "processed_at": "2024-01-15T11:30:00Z"
  }
}
```

## **🎯 Código JavaScript para el Frontend**

### **1. Función para Archivar Notificación Individual**

```javascript
class NotificationArchiveService {
  
  // Archivar notificación individual (SIN autenticación)
  async archiveNotification(notificationId) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/archive`, {
        method: 'PATCH'
        // NO se incluye Authorization header
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Notificación archivada:', notificationId);
        // Actualizar UI
        this.updateNotificationUI(notificationId, 'archived');
        return result;
      } else {
        console.error('❌ Error al archivar:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error al archivar notificación:', error);
      throw error;
    }
  }

  // Marcar como leída Y archivar en una operación (SIN autenticación)
  async markAsReadAndArchive(notificationId) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read-and-archive`, {
        method: 'PATCH'
        // NO se incluye Authorization header
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Notificación marcada como leída y archivada:', notificationId);
        // Actualizar UI
        this.updateNotificationUI(notificationId, 'read_and_archived');
        return result;
      } else {
        console.error('❌ Error al procesar:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error al marcar como leída y archivar:', error);
      throw error;
    }
  }

  // Archivar múltiples notificaciones (REQUIERE autenticación)
  async archiveMultipleNotifications(notificationIds, token) {
    try {
      const response = await fetch('/api/notifications/archive-multiple', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notification_ids: notificationIds
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${result.data.success_count} notificaciones archivadas`);
        // Actualizar UI
        result.data.success_ids.forEach(id => {
          this.updateNotificationUI(id, 'archived');
        });
        return result;
      } else {
        console.error('❌ Error al archivar múltiples:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error al archivar múltiples notificaciones:', error);
      throw error;
    }
  }

  // Actualizar UI de notificación
  updateNotificationUI(notificationId, action) {
    const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
    if (!notificationElement) return;

    switch (action) {
      case 'archived':
        notificationElement.classList.add('archived');
        notificationElement.classList.remove('unread');
        // Ocultar botones de acción
        const archiveBtn = notificationElement.querySelector('.btn-archive');
        const readBtn = notificationElement.querySelector('.btn-read');
        if (archiveBtn) archiveBtn.style.display = 'none';
        if (readBtn) readBtn.style.display = 'none';
        break;
        
      case 'read_and_archived':
        notificationElement.classList.add('read', 'archived');
        notificationElement.classList.remove('unread');
        // Ocultar todos los botones
        const allBtns = notificationElement.querySelectorAll('.btn');
        allBtns.forEach(btn => btn.style.display = 'none');
        break;
    }
  }
}
```

### **2. HTML con Botones de Archivado**

```html
<!-- Componente de notificación con botones de archivado -->
<div class="notification-item unread" data-notification-id="uuid-123">
  <div class="notification-content">
    <h4>Nueva Medida Tomada</h4>
    <p>Se han tomado nuevas medidas para Juan Pérez</p>
    <small>Hace 5 minutos</small>
  </div>
  
  <div class="notification-actions">
    <button class="btn btn-sm btn-primary btn-read" 
            onclick="markAsRead('uuid-123')">
      Marcar como leída
    </button>
    
    <button class="btn btn-sm btn-secondary btn-archive" 
            onclick="archiveNotification('uuid-123')">
      Archivar
    </button>
    
    <button class="btn btn-sm btn-success btn-read-archive" 
            onclick="markAsReadAndArchive('uuid-123')">
      Leer y Archivar
    </button>
  </div>
</div>
```

### **3. Funciones Globales para los Botones**

```javascript
// Instanciar el servicio
const archiveService = new NotificationArchiveService();

// Funciones globales para los botones
window.archiveNotification = function(notificationId) {
  archiveService.archiveNotification(notificationId)
    .then(result => {
      showSuccess('Notificación archivada exitosamente');
      updateNotificationCount();
    })
    .catch(error => {
      showError('Error al archivar notificación: ' + error.message);
    });
};

window.markAsReadAndArchive = function(notificationId) {
  archiveService.markAsReadAndArchive(notificationId)
    .then(result => {
      showSuccess('Notificación procesada exitosamente');
      updateNotificationCount();
    })
    .catch(error => {
      showError('Error al procesar notificación: ' + error.message);
    });
};

window.archiveSelectedNotifications = function() {
  const selectedIds = getSelectedNotificationIds();
  if (selectedIds.length === 0) {
    showError('Selecciona al menos una notificación');
    return;
  }

  const token = getAuthToken(); // Función para obtener el token
  if (!token) {
    showError('Se requiere autenticación para archivar múltiples notificaciones');
    return;
  }

  archiveService.archiveMultipleNotifications(selectedIds, token)
    .then(result => {
      showSuccess(`${result.data.success_count} notificaciones archivadas`);
      updateNotificationCount();
    })
    .catch(error => {
      showError('Error al archivar notificaciones: ' + error.message);
    });
};

// Función para obtener IDs seleccionados
function getSelectedNotificationIds() {
  const checkboxes = document.querySelectorAll('.notification-checkbox:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

// Función para obtener token de autenticación
function getAuthToken() {
  return localStorage.getItem('auth_token');
}
```

### **4. CSS para Estados de Archivado**

```css
.notification-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  transition: all 0.3s ease;
}

.notification-item.unread {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.notification-item.read {
  opacity: 0.7;
  background-color: #f8f9fa;
}

.notification-item.archived {
  opacity: 0.5;
  background-color: #f5f5f5;
  border-left: 4px solid #6c757d;
}

.notification-item.read.archived {
  opacity: 0.3;
  background-color: #e9ecef;
  border-left: 4px solid #495057;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.notification-actions .btn {
  font-size: 12px;
  padding: 4px 8px;
}

/* Ocultar botones después de archivar */
.notification-item.archived .btn-archive,
.notification-item.archived .btn-read {
  display: none !important;
}

.notification-item.read.archived .btn {
  display: none !important;
}

/* Estilo para selección múltiple */
.notification-checkbox {
  margin-right: 10px;
}

.bulk-actions {
  padding: 10px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  gap: 10px;
  align-items: center;
}

.bulk-actions.hidden {
  display: none;
}
```

## **🧪 Ejemplos de Uso**

### **1. Archivar Notificación Individual (Sin Autenticación)**

```bash
curl -X PATCH \
  http://localhost:3000/api/notifications/uuid-123/archive
```

### **2. Marcar como Leída Y Archivar (Sin Autenticación)**

```bash
curl -X PATCH \
  http://localhost:3000/api/notifications/uuid-123/read-and-archive
```

### **3. Archivar Múltiples Notificaciones (Con Autenticación)**

```bash
curl -X PATCH \
  http://localhost:3000/api/notifications/archive-multiple \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "notification_ids": [
      "uuid-123",
      "uuid-456",
      "uuid-789"
    ]
  }'
```

## **📊 Códigos de Error**

| Código | Descripción |
|--------|-------------|
| `NOTIFICATION_NOT_FOUND` | La notificación no existe |
| `USER_ID_REQUIRED` | Se requiere ID de usuario (para endpoints públicos) |
| `INVALID_NOTIFICATION_IDS` | Array de IDs inválido |
| `ARCHIVE_ERROR` | Error al archivar notificación |
| `MARK_READ_ARCHIVE_ERROR` | Error al procesar operación combinada |
| `ARCHIVE_MULTIPLE_ERROR` | Error al archivar múltiples notificaciones |

## **🎯 Resumen de Funcionalidades**

1. **✅ Archivado Individual**: Archivar una notificación específica
2. **✅ Operación Combinada**: Marcar como leída Y archivar en una acción
3. **✅ Archivado Múltiple**: Archivar varias notificaciones simultáneamente
4. **✅ Acceso Público**: Endpoints sin autenticación para usuarios temporales
5. **✅ Manejo de Errores**: Respuestas detalladas con códigos específicos
6. **✅ UI Actualizada**: Código JavaScript para actualizar la interfaz
7. **✅ Estados Visuales**: CSS para mostrar diferentes estados de notificación

## **⚠️ Consideraciones Importantes**

- **Notificaciones Globales**: Se archivan individualmente por usuario usando `notification_read_status`
- **Notificaciones Específicas**: Se archivan directamente en la tabla `notifications`
- **Sin Autenticación**: Los endpoints públicos generan IDs temporales únicos
- **Con Autenticación**: Los endpoints autenticados usan el `user_id` del token JWT
- **Operación Atómica**: Las operaciones combinadas son transaccionales

¿Te gustaría que probemos algún endpoint específico o necesitas ayuda con la implementación en el frontend?
