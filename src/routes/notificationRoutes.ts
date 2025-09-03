import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticateToken, noAuth } from '../middlewares/auth';

const router = Router();

// ========================================
// RUTAS PÚBLICAS (sin autenticación)
// ========================================

// SSE - Stream de notificaciones globales en tiempo real
router.get('/stream', notificationController.streamNotifications);

// Obtener notificaciones globales
router.get('/', notificationController.getAllNotifications);

// Gestión de estado de lectura (SIN autenticación - acceso público)
router.patch('/:id/read', noAuth, notificationController.markAsRead);
router.patch('/read-all', noAuth, notificationController.markAllAsRead);
router.patch('/read-global', noAuth, notificationController.markGlobalAsRead);

// Endpoints de prueba (sin autenticación)
router.get('/test/connection', notificationController.testConnection);
router.get('/test/sse-stats', notificationController.testSSEConnection);
router.post('/test/sse', notificationController.testSSE);
router.post('/test/create-global', notificationController.testCreateGlobalNotification);
router.post('/test/medida-notification', notificationController.testCreateMedidaWithNotification);

// Endpoint para notificaciones de medidas (sin autenticación)
router.post('/medida', notificationController.createMedidaNotification);

// ========================================
// RUTAS QUE REQUIEREN AUTENTICACIÓN
// ========================================

// Crear notificación global
router.post('/create', authenticateToken, notificationController.createNotification);

// Notificaciones específicas por usuario
router.get('/:user_id', authenticateToken, notificationController.getUserNotifications);
router.post('/:user_id/create', authenticateToken, notificationController.createNotification);

// Gestión de notificaciones (requiere autenticación)
router.patch('/:id/archive', authenticateToken, notificationController.archiveNotification);
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

// Configuración de usuario (requiere autenticación)
router.get('/:user_id/settings', authenticateToken, notificationController.getUserSettings);
router.put('/:user_id/settings', authenticateToken, notificationController.updateUserSettings);

// Push Notifications (PWA) - requiere autenticación
router.post('/:user_id/push/subscribe', authenticateToken, notificationController.subscribeToPush);
router.delete('/:user_id/push/unsubscribe', authenticateToken, notificationController.unsubscribeFromPush);
router.post('/:user_id/push/test', authenticateToken, notificationController.sendTestPush);

// Estadísticas (requiere autenticación)
router.get('/:user_id/stats', authenticateToken, notificationController.getNotificationStats);

// Endpoint de prueba adicional (requiere autenticación)
router.post('/test/create-endpoint', authenticateToken, notificationController.testCreateEndpoint);

export default router;
