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

// Gestión de archivado (SIN autenticación - acceso público)
router.patch('/:id/archive', noAuth, notificationController.archiveNotificationPublic);
router.patch('/:id/read-and-archive', noAuth, notificationController.markAsReadAndArchivePublic);

// Gestión de eliminación (SIN autenticación - acceso público)
router.delete('/:id', noAuth, notificationController.deleteNotificationPublic);

// Endpoints de prueba (sin autenticación)
router.get('/test/connection', notificationController.testConnection);
router.get('/test/sse-stats', notificationController.testSSEConnection);
router.post('/test/sse', notificationController.testSSE);
router.post('/test/create-global', notificationController.testCreateGlobalNotification);
router.post('/test/medida-notification', notificationController.testCreateMedidaWithNotification);
router.get('/test/mark-read-archive/:notification_id', notificationController.testMarkAsReadAndArchive);
router.get('/test/mark-all-read', notificationController.testMarkAllAsRead);

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
router.patch('/:id/read-and-archive', authenticateToken, notificationController.markAsReadAndArchive);
router.patch('/archive-multiple', authenticateToken, notificationController.archiveMultipleNotifications);
router.delete('/:id', noAuth, notificationController.deleteNotificationPublic);
router.delete('/delete-multiple', authenticateToken, notificationController.deleteMultipleNotifications);

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
