# 🗑️ API de Eliminación de Notificaciones - Cortinova

## **🎯 Características Principales**

- **Eliminación Individual**: Eliminar una notificación específica
- **Eliminación Múltiple**: Eliminar varias notificaciones en una operación
- **Acceso Público**: Endpoints sin autenticación para usuarios temporales
- **Acceso Autenticado**: Endpoints con autenticación para usuarios registrados
- **Manejo Inteligente**: Diferencia entre notificaciones globales y específicas

## **🔗 Endpoints PÚBLICOS (Sin Autenticación)**

### **1. Eliminar Notificación Individual**

```http
DELETE /api/notifications/{notification_id}
```

**⚠️ IMPORTANTE**: No requiere `Authorization: Bearer {token}`

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Notificación eliminada exitosamente",
  "data": {
    "notification_id": "uuid-123",
    "user_id": "temp_abc123def456",
    "deleted_at": "2024-01-15T11:30:00Z"
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

## **🔐 Endpoints que SÍ Requieren Autenticación**

### **2. Eliminar Notificación Individual (Autenticado)**

```http
DELETE /api/notifications/{notification_id}
Authorization: Bearer {token}
```

### **3. Eliminar Múltiples Notificaciones**

```http
DELETE /api/notifications/delete-multiple
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
  "message": "3 notificaciones eliminadas exitosamente",
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
  "message": "2 notificaciones eliminadas exitosamente",
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

### **1. Servicio de Eliminación de Notificaciones**

```javascript
class NotificationDeleteService {
  
  // Eliminar notificación individual (SIN autenticación)
  async deleteNotification(notificationId) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
        // NO se incluye Authorization header
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Notificación eliminada:', notificationId);
        // Remover de la UI
        this.removeNotificationFromUI(notificationId);
        return result;
      } else {
        console.error('❌ Error al eliminar:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  }

  // Eliminar múltiples notificaciones (REQUIERE autenticación)
  async deleteMultipleNotifications(notificationIds, token) {
    try {
      const response = await fetch('/api/notifications/delete-multiple', {
        method: 'DELETE',
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
        console.log(`✅ ${result.data.success_count} notificaciones eliminadas`);
        // Remover de la UI
        result.data.success_ids.forEach(id => {
          this.removeNotificationFromUI(id);
        });
        return result;
      } else {
        console.error('❌ Error al eliminar múltiples:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error al eliminar múltiples notificaciones:', error);
      throw error;
    }
  }

  // Remover notificación de la UI
  removeNotificationFromUI(notificationId) {
    const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
    if (notificationElement) {
      // Animación de desvanecimiento
      notificationElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      notificationElement.style.opacity = '0';
      notificationElement.style.transform = 'translateX(-100%)';
      
      // Remover después de la animación
      setTimeout(() => {
        notificationElement.remove();
        this.updateNotificationCount();
      }, 300);
    }
  }

  // Actualizar contador de notificaciones
  async updateNotificationCount() {
    try {
      const response = await fetch('/api/notifications?limit=1');
      const result = await response.json();
      
      if (result.success) {
        const count = result.data.length;
        const badge = document.getElementById('notification-badge');
        if (badge) {
          badge.textContent = count;
          badge.style.display = count > 0 ? 'block' : 'none';
        }
      }
    } catch (error) {
      console.error('Error al actualizar contador:', error);
    }
  }

  // Confirmar eliminación con diálogo
  async confirmDeleteNotification(notificationId, notificationTitle) {
    const confirmed = confirm(`¿Estás seguro de que quieres eliminar la notificación "${notificationTitle}"?\n\nEsta acción no se puede deshacer.`);
    
    if (confirmed) {
      try {
        await this.deleteNotification(notificationId);
        showSuccess('Notificación eliminada exitosamente');
      } catch (error) {
        showError('Error al eliminar notificación: ' + error.message);
      }
    }
  }

  // Confirmar eliminación múltiple con diálogo
  async confirmDeleteMultiple(notificationIds, count) {
    const confirmed = confirm(`¿Estás seguro de que quieres eliminar ${count} notificaciones?\n\nEsta acción no se puede deshacer.`);
    
    if (confirmed) {
      try {
        const token = getAuthToken();
        if (!token) {
          showError('Se requiere autenticación para eliminar múltiples notificaciones');
          return;
        }

        const result = await this.deleteMultipleNotifications(notificationIds, token);
        
        if (result.data.failed_count > 0) {
          showWarning(`${result.data.success_count} eliminadas, ${result.data.failed_count} fallaron`);
        } else {
          showSuccess(`${result.data.success_count} notificaciones eliminadas exitosamente`);
        }
      } catch (error) {
        showError('Error al eliminar notificaciones: ' + error.message);
      }
    }
  }
}
```

### **2. HTML con Botones de Eliminación**

```html
<!-- Componente de notificación con botones de eliminación -->
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
    
    <button class="btn btn-sm btn-danger btn-delete" 
            onclick="confirmDeleteNotification('uuid-123', 'Nueva Medida Tomada')">
      Eliminar
    </button>
  </div>
</div>

<!-- Acciones masivas -->
<div class="bulk-actions hidden" id="bulk-actions">
  <span id="selected-count">0 seleccionadas</span>
  <button class="btn btn-sm btn-secondary" onclick="archiveSelected()">
    Archivar Seleccionadas
  </button>
  <button class="btn btn-sm btn-danger" onclick="deleteSelected()">
    Eliminar Seleccionadas
  </button>
  <button class="btn btn-sm btn-outline-secondary" onclick="clearSelection()">
    Limpiar Selección
  </button>
</div>
```

### **3. Funciones Globales para los Botones**

```javascript
// Instanciar el servicio
const deleteService = new NotificationDeleteService();

// Funciones globales para los botones
window.confirmDeleteNotification = function(notificationId, notificationTitle) {
  deleteService.confirmDeleteNotification(notificationId, notificationTitle);
};

window.confirmDeleteMultiple = function() {
  const selectedIds = getSelectedNotificationIds();
  if (selectedIds.length === 0) {
    showError('Selecciona al menos una notificación');
    return;
  }
  
  deleteService.confirmDeleteMultiple(selectedIds, selectedIds.length);
};

window.deleteSelected = function() {
  const selectedIds = getSelectedNotificationIds();
  if (selectedIds.length === 0) {
    showError('Selecciona al menos una notificación');
    return;
  }

  const confirmed = confirm(`¿Eliminar ${selectedIds.length} notificaciones seleccionadas?\n\nEsta acción no se puede deshacer.`);
  
  if (confirmed) {
    deleteService.confirmDeleteMultiple(selectedIds, selectedIds.length);
  }
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

// Funciones de utilidad para mostrar mensajes
function showSuccess(message) {
  if (window.Toastify) {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "#28a745"
    }).showToast();
  } else {
    alert('✅ ' + message);
  }
}

function showError(message) {
  if (window.Toastify) {
    Toastify({
      text: message,
      duration: 5000,
      gravity: "top",
      position: "right",
      backgroundColor: "#dc3545"
    }).showToast();
  } else {
    alert('❌ ' + message);
  }
}

function showWarning(message) {
  if (window.Toastify) {
    Toastify({
      text: message,
      duration: 4000,
      gravity: "top",
      position: "right",
      backgroundColor: "#ffc107",
      color: "#000"
    }).showToast();
  } else {
    alert('⚠️ ' + message);
  }
}
```

### **4. CSS para Estados de Eliminación**

```css
.notification-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  transition: all 0.3s ease;
  position: relative;
}

.notification-item.deleting {
  opacity: 0;
  transform: translateX(-100%);
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

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.notification-actions .btn {
  font-size: 12px;
  padding: 4px 8px;
}

.btn-delete {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-delete:hover {
  background-color: #c82333;
  border-color: #bd2130;
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
  position: sticky;
  top: 0;
  z-index: 100;
}

.bulk-actions.hidden {
  display: none;
}

.bulk-actions .btn {
  font-size: 12px;
  padding: 6px 12px;
}

/* Animación de eliminación */
@keyframes slideOutLeft {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-100%);
  }
}

.notification-item.deleting {
  animation: slideOutLeft 0.3s ease forwards;
}

/* Estilo para notificaciones seleccionadas */
.notification-item.selected {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .notification-actions .btn {
    width: 100%;
    font-size: 11px;
  }
  
  .bulk-actions {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
}
```

### **5. Funcionalidad de Selección Múltiple**

```javascript
// Manejo de selección múltiple
class NotificationSelectionManager {
  constructor() {
    this.selectedIds = new Set();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Escuchar cambios en checkboxes
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('notification-checkbox')) {
        this.handleCheckboxChange(e.target);
      }
    });

    // Botón "Seleccionar todo"
    document.addEventListener('click', (e) => {
      if (e.target.id === 'select-all') {
        this.selectAll();
      } else if (e.target.id === 'clear-selection') {
        this.clearSelection();
      }
    });
  }

  handleCheckboxChange(checkbox) {
    const notificationId = checkbox.value;
    const notificationElement = checkbox.closest('.notification-item');

    if (checkbox.checked) {
      this.selectedIds.add(notificationId);
      notificationElement.classList.add('selected');
    } else {
      this.selectedIds.delete(notificationId);
      notificationElement.classList.remove('selected');
    }

    this.updateBulkActions();
  }

  selectAll() {
    const checkboxes = document.querySelectorAll('.notification-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = true;
      this.handleCheckboxChange(checkbox);
    });
  }

  clearSelection() {
    const checkboxes = document.querySelectorAll('.notification-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
      this.handleCheckboxChange(checkbox);
    });
  }

  updateBulkActions() {
    const bulkActions = document.getElementById('bulk-actions');
    const selectedCount = document.getElementById('selected-count');

    if (this.selectedIds.size > 0) {
      bulkActions.classList.remove('hidden');
      selectedCount.textContent = `${this.selectedIds.size} seleccionadas`;
    } else {
      bulkActions.classList.add('hidden');
    }
  }

  getSelectedIds() {
    return Array.from(this.selectedIds);
  }
}

// Inicializar el gestor de selección
const selectionManager = new NotificationSelectionManager();

// Función para obtener IDs seleccionados (actualizada)
function getSelectedNotificationIds() {
  return selectionManager.getSelectedIds();
}
```

## **🧪 Ejemplos de Uso**

### **1. Eliminar Notificación Individual (Sin Autenticación)**

```bash
curl -X DELETE \
  http://localhost:3000/api/notifications/uuid-123
```

### **2. Eliminar Notificación Individual (Con Autenticación)**

```bash
curl -X DELETE \
  http://localhost:3000/api/notifications/uuid-123 \
  -H "Authorization: Bearer {token}"
```

### **3. Eliminar Múltiples Notificaciones (Con Autenticación)**

```bash
curl -X DELETE \
  http://localhost:3000/api/notifications/delete-multiple \
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
| `DELETE_ERROR` | Error al eliminar notificación individual |
| `DELETE_MULTIPLE_ERROR` | Error al eliminar múltiples notificaciones |

## **🎯 Resumen de Funcionalidades**

1. **✅ Eliminación Individual**: Eliminar una notificación específica
2. **✅ Eliminación Múltiple**: Eliminar varias notificaciones simultáneamente
3. **✅ Acceso Público**: Endpoints sin autenticación para usuarios temporales
4. **✅ Acceso Autenticado**: Endpoints con JWT para usuarios registrados
5. **✅ Manejo Inteligente**: Diferencia entre notificaciones globales y específicas
6. **✅ Manejo de Errores**: Respuestas detalladas con códigos específicos
7. **✅ UI Actualizada**: Código JavaScript para actualizar la interfaz
8. **✅ Selección Múltiple**: Funcionalidad completa de selección masiva
9. **✅ Animaciones**: Transiciones suaves para eliminación
10. **✅ Confirmaciones**: Diálogos de confirmación antes de eliminar

## **⚠️ Consideraciones Importantes**

- **Notificaciones Globales**: Se elimina solo el registro de lectura del usuario en `notification_read_status`
- **Notificaciones Específicas**: Se elimina completamente de la tabla `notifications`
- **Sin Autenticación**: Los endpoints públicos generan IDs temporales únicos
- **Con Autenticación**: Los endpoints autenticados usan el `user_id` del token JWT
- **Operación Atómica**: Las operaciones múltiples manejan errores parciales
- **Irreversible**: La eliminación no se puede deshacer
- **Confirmación**: Se recomienda usar diálogos de confirmación en el frontend

## **🔄 Diferencias entre Archivado y Eliminación**

| Operación | Notificaciones Globales | Notificaciones Específicas | Reversible |
|-----------|-------------------------|----------------------------|------------|
| **Archivar** | Marca como leída en `notification_read_status` | Marca `is_archived = true` | ✅ Sí |
| **Eliminar** | Elimina registro de `notification_read_status` | Elimina de `notifications` | ❌ No |

¿Te gustaría que probemos algún endpoint específico o necesitas ayuda con la implementación en el frontend?
