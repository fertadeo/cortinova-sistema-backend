# 📢 API de Notificaciones Globales - Sin Autenticación

## **🎯 Características Principales**

- **Notificaciones Globales**: Todas las notificaciones son visibles para todos los usuarios
- **Estado de Lectura Individual**: Cada usuario mantiene su propio estado de lectura
- **Sin Autenticación**: Los endpoints de lectura no requieren bearer token
- **Tiempo Real**: SSE para notificaciones en vivo
- **Push Notifications**: Soporte para PWA
- **🎵 Sonidos**: Audio automático según prioridad de notificación

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

## **🎵 Implementación del Sonido**

### **1. Servicio de Audio (AudioService.ts)**

```typescript
export class AudioService {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.initializeAudio();
  }

  // Reproducir sonido según prioridad
  async playNotificationSound(priority: string = 'medium'): Promise<void> {
    if (!this.isEnabled || !this.audioContext) return;

    let soundName = 'notification';
    
    switch (priority) {
      case 'urgent':
      case 'high':
        soundName = 'alert';
        break;
      case 'medium':
        soundName = 'notification';
        break;
      case 'low':
        soundName = 'success';
        break;
    }

    // Reproducir sonido
    const audioBuffer = this.audioBuffers.get(soundName);
    if (audioBuffer) {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      gainNode.gain.value = this.volume;
      
      source.start(0);
    }
  }

  // Fallback: beep simple
  playBeep(frequency: number = 800, duration: number = 200): void {
    if (!this.isEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }
}
```

### **2. Archivos de Sonido Requeridos**

Crear la carpeta `public/sounds/` con estos archivos:
```
public/
└── sounds/
    ├── notification.mp3    # Sonido por defecto
    ├── alert.mp3          # Para prioridad alta/urgente
    ├── success.mp3        # Para prioridad baja
    └── warning.mp3        # Para advertencias
```

## **🎯 Código JavaScript Completo para el Frontend (Con Sonido)**

### **1. Servicio de Notificaciones con Audio**

```javascript
class NotificationService {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.tempUserId = null;
    this.audioService = new AudioService();
    this.soundEnabled = true;
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
      
      // Reproducir sonido
      this.playNotificationSound(notification.priority);
      
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

  // Reproducir sonido de notificación
  async playNotificationSound(priority = 'medium') {
    if (!this.soundEnabled) return;

    try {
      // Intentar reproducir sonido personalizado
      await this.audioService.playNotificationSound(priority);
    } catch (error) {
      console.warn('Error al reproducir sonido personalizado, usando beep:', error);
      // Fallback: beep simple
      this.audioService.playBeep();
    }
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

  // Configurar sonido
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    this.audioService.setEnabled(enabled);
    console.log(`🔊 Sonido ${enabled ? 'habilitado' : 'deshabilitado'}`);
  }

  // Configurar volumen
  setVolume(volume) {
    this.audioService.setVolume(volume);
  }

  // Desconectar
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.isConnected = false;
    }
    if (this.audioService) {
      this.audioService.dispose();
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

// Controles de audio
window.toggleSound = function() {
  const soundButton = document.getElementById('sound-toggle');
  const isEnabled = soundButton.textContent.includes('🔊');
  notificationService.setSoundEnabled(!isEnabled);
  soundButton.textContent = isEnabled ? '🔇' : '🔊';
};

window.setVolume = function(volume) {
  notificationService.setVolume(volume / 100);
};

// Cargar notificaciones al cargar la página
document.addEventListener('DOMContentLoaded', loadNotifications);
```

### **3. HTML con Controles de Audio**

```html
<!-- Componente de notificaciones con controles de audio -->
<div class="notifications-container">
  <div class="notifications-header">
    <h3>Notificaciones</h3>
    <div class="notification-actions">
      <button onclick="markAllAsRead()" class="btn btn-sm btn-secondary">
        Marcar todas como leídas
      </button>
      <button onclick="markGlobalAsRead()" class="btn btn-sm btn-info">
        Marcar globales como leídas
      </button>
      <button id="sound-toggle" onclick="toggleSound()" class="btn btn-sm btn-outline-primary">
        🔊
      </button>
      <input type="range" min="0" max="100" value="50" onchange="setVolume(this.value)" 
             class="volume-slider" title="Volumen">
      <span id="notification-badge" class="badge badge-danger">0</span>
    </div>
  </div>
  
  <div id="notification-list" class="notification-list">
    <!-- Las notificaciones se cargarán aquí dinámicamente -->
  </div>
</div>

<!-- CSS para controles de audio -->
<style>
.notifications-container {
  max-width: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.notification-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.notification-item.read {
  opacity: 0.7;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
}

.volume-slider {
  width: 80px;
  margin: 0 10px;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
```

## **🚀 Ejemplo de POST para Crear Medida (Frontend)**

### **1. Formulario HTML para Medida**

```html
<form id="medidaForm" class="medida-form">
  <div class="form-group">
    <label for="cliente_nombre">Nombre del Cliente</label>
    <input type="text" id="cliente_nombre" name="cliente_nombre" required>
  </div>
  
  <div class="form-group">
    <label for="elemento">Elemento a Medir</label>
    <select id="elemento" name="elemento" required>
      <option value="">Seleccionar elemento</option>
      <option value="cortina_roller">Cortina Roller</option>
      <option value="cortina_venetiana">Cortina Veneciana</option>
      <option value="cortina_blackout">Cortina Blackout</option>
      <option value="cortina_screen">Cortina Screen</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="ubicacion">Ubicación</label>
    <input type="text" id="ubicacion" name="ubicacion" placeholder="Ej: Sala de estar">
  </div>
  
  <div class="form-group">
    <label for="medido_por">Medido por</label>
    <input type="text" id="medido_por" name="medido_por" placeholder="Tu nombre">
  </div>
  
  <button type="submit" class="btn btn-primary">Registrar Medida</button>
</form>
```

### **2. JavaScript para Enviar Medida**

```javascript
// Manejar envío del formulario de medida
document.getElementById('medidaForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const medidaData = {
    cliente_nombre: formData.get('cliente_nombre'),
    elemento: formData.get('elemento'),
    ubicacion: formData.get('ubicacion'),
    medido_por: formData.get('medido_por')
  };

  try {
    console.log('📏 Enviando medida:', medidaData);
    
    const response = await fetch('/api/notifications/medida', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(medidaData)
    });

    const result = await response.json();
    
    if (result.success) {
      // Mostrar mensaje de éxito
      showSuccess('Medida registrada exitosamente');
      
      // La notificación se enviará automáticamente desde el backend
      // y llegará via SSE a todos los usuarios conectados
      // El sonido se reproducirá automáticamente
      
      // Limpiar formulario
      this.reset();
      
      // Redirigir o mostrar confirmación
      showNotification({
        title: 'Medida Registrada',
        message: `Se ha registrado la medida para ${medidaData.cliente_nombre}`,
        type: 'success'
      });
      
    } else {
      showError('Error al registrar la medida: ' + result.error);
    }
  } catch (error) {
    console.error('Error al enviar medida:', error);
    showError('Error de conexión al registrar la medida');
  }
});

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

function showNotification(notification) {
  if (window.Toastify) {
    Toastify({
      text: notification.message,
      duration: 4000,
      gravity: "top",
      position: "right",
      backgroundColor: notification.type === 'success' ? "#28a745" : "#ffc107"
    }).showToast();
  }
}
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

## **🎯 Resumen de la Implementación del Sonido**

1. **✅ AudioService**: Servicio completo para manejar audio en el frontend
2. **✅ Sonidos por Prioridad**: Diferentes sonidos según la importancia de la notificación
3. **✅ Fallback**: Beep simple si no se pueden cargar los archivos de audio
4. **✅ Controles**: Botones para habilitar/deshabilitar y controlar volumen
5. **✅ Integración**: Se reproduce automáticamente al recibir notificaciones via SSE

## **⚠️ Consideraciones de Seguridad**

- Los endpoints de **lectura** son públicos
- Los endpoints de **escritura** (crear, archivar, eliminar) requieren autenticación
- Los usuarios temporales solo pueden marcar como leídas, no pueden modificar contenido
- El sistema genera IDs temporales únicos para cada cliente

¿Te gustaría que probemos algún endpoint específico o necesitas ayuda con la implementación del sonido en el frontend?

