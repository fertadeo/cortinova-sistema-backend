import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { NotificationService } from '../services/NotificationService';
import { SSEService } from '../services/SSEService';
import { PushNotificationService } from '../services/PushNotificationService';
import { NotificationType, NotificationPriority, Notification } from '../entities/Notifications';
import { NotificationReadStatus } from '../entities/NotificationReadStatus';
import { z } from 'zod';

// Esquemas de validación con Zod
const createNotificationSchema = z.object({
  user_id: z.string().optional(), // Opcional para notificaciones globales
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  priority: z.nativeEnum(NotificationPriority).optional(),
  action_url: z.string().url().optional(),
  action_text: z.string().max(100).optional(),
  metadata: z.record(z.any()).optional(),
  expires_at: z.string().datetime().optional()
});

const updateSettingsSchema = z.object({
  email_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  sound_enabled: z.boolean().optional(),
  stock_threshold: z.number().int().min(1).max(100).optional()
});

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string(),
  auth: z.string()
});

// Instancias de servicios
const notificationService = new NotificationService();
const sseService = new SSEService();
const pushService = new PushNotificationService();

export const notificationController = {
  // SSE - Stream de notificaciones globales en tiempo real
  streamNotifications: async (req: Request, res: Response) => {
    try {
      // Conectar al stream SSE global
      const clientId = sseService.connectGlobal(res);
      
      console.log(`Cliente SSE global conectado: ${clientId}`);

      // La conexión se mantiene abierta hasta que el cliente se desconecte
      // Los eventos se envían automáticamente cuando hay nuevas notificaciones globales

    } catch (error) {
      console.error('Error en stream SSE global:', error);
      res.status(500).json({
        success: false,
        error: 'Error en el stream de notificaciones globales'
      });
    }
  },

  // Obtener todas las notificaciones (globales)
  getAllNotifications: async (req: Request, res: Response) => {
    try {
      const type = req.query.type as NotificationType;
      const is_archived = req.query.is_archived !== undefined ? req.query.is_archived === 'true' : undefined;

      const filters = {
        type,
        is_archived
      };

      console.log(`Obteniendo todas las notificaciones`);
      console.log('Filtros aplicados:', filters);

      const result = await notificationService.getAllNotifications(filters);

      console.log(`Notificaciones obtenidas: ${result.length}`);
      console.log('Primera notificación:', result[0] || 'No hay notificaciones');

      res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error('Error al obtener notificaciones:', error);
      
      // Manejar errores específicos de base de datos
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        return res.status(503).json({
          success: false,
          error: 'Error de conexión con la base de datos. Intente nuevamente.',
          code: 'DB_CONNECTION_ERROR'
        });
      }

      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
          success: false,
          error: 'Las tablas de notificaciones no existen. Ejecute el script de migración.',
          code: 'MISSING_TABLES'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error al obtener notificaciones',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener notificaciones con estado de lectura del usuario
  getUserNotifications: async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as NotificationType;
      const is_archived = req.query.is_archived !== undefined ? req.query.is_archived === 'true' : undefined;
      const priority = req.query.priority as NotificationPriority;
      const is_read = req.query.is_read !== undefined ? req.query.is_read === 'true' : undefined;

      const filters = {
        type,
        is_archived,
        priority,
        is_read
      };

      console.log(`Obteniendo notificaciones para usuario: ${user_id}, página: ${page}, límite: ${limit}`);

      const result = await notificationService.getUserNotifications(user_id, page, limit, filters);

      console.log(`Notificaciones obtenidas: ${result.notifications.length} de ${result.pagination.total}`);

      res.json({
        success: true,
        data: result.notifications,
        pagination: result.pagination
      });

    } catch (error: any) {
      console.error('Error al obtener notificaciones del usuario:', error);
      
      // Manejar errores específicos de base de datos
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        return res.status(503).json({
          success: false,
          error: 'Error de conexión con la base de datos. Intente nuevamente.',
          code: 'DB_CONNECTION_ERROR'
        });
      }

      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
          success: false,
          error: 'Las tablas de notificaciones no existen. Ejecute el script de migración.',
          code: 'MISSING_TABLES'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error al obtener notificaciones del usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Crear nueva notificación (global o para usuario específico)
  createNotification: async (req: Request, res: Response) => {
    try {
      const notificationData = req.body;
      const user_id = (req as any).user_id; // Extraído del middleware de autenticación
      const { user_id: urlUserId } = req.params; // user_id de la URL si existe

      console.log('🔍 Creando notificación...');
      console.log('🔍 Datos recibidos:');
      console.log('  - Body:', notificationData);
      console.log('  - Token user_id:', user_id);
      console.log('  - URL user_id:', urlUserId);

      // Validar datos de entrada
      const validatedData = createNotificationSchema.parse(notificationData);

      // Determinar el user_id: URL > Body > Token
      // Si no hay user_id en la URL, es una notificación global
      let finalUserId: string | undefined;
      
      if (urlUserId) {
        // Si hay user_id en la URL, usar ese
        finalUserId = urlUserId;
      } else if (validatedData.user_id) {
        // Si hay user_id en el body, usar ese
        finalUserId = validatedData.user_id;
      } else {
        // Si no hay user_id en URL ni body, es una notificación global
        finalUserId = undefined;
      }

      console.log('🔍 Resultado final:');
      console.log('  - finalUserId:', finalUserId);
      console.log('  - Es notificación global:', !finalUserId);

      const notification = await notificationService.createNotification({
        ...validatedData,
        user_id: finalUserId, // undefined para notificaciones globales
        expires_at: validatedData.expires_at ? new Date(validatedData.expires_at) : undefined
      });

      const message = finalUserId 
        ? 'Notificación creada exitosamente' 
        : 'Notificación global creada exitosamente';

      res.status(201).json({
        success: true,
        data: notification,
        message,
        debug: {
          finalUserId,
          isGlobal: !finalUserId,
          tokenUserId: user_id,
          urlUserId,
          bodyUserId: validatedData.user_id
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: (error as z.ZodError).errors
        });
      }

      console.error('Error al crear notificación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear notificación'
      });
    }
  },

  // Marcar notificación como leída
  markAsRead: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user_id = (req as any).user_id; // Extraído del middleware noAuth

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'USER_ID_REQUIRED',
          message: 'ID de usuario requerido'
        });
      }

      console.log(`📖 Usuario ${user_id} marcando notificación ${id} como leída`);

      const success = await notificationService.markAsRead(id, user_id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'NOTIFICATION_NOT_FOUND',
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación marcada como leída',
        data: {
          notification_id: id,
          user_id: user_id,
          marked_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      res.status(500).json({
        success: false,
        error: 'MARK_READ_ERROR',
        message: 'Error al marcar notificación como leída'
      });
    }
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (req: Request, res: Response) => {
    try {
      const user_id = (req as any).user_id; // Extraído del middleware noAuth

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'USER_ID_REQUIRED',
          message: 'ID de usuario requerido'
        });
      }

      console.log(`📖 Usuario ${user_id} solicitando marcar todas las notificaciones como leídas y archivadas`);

      const result = await notificationService.markAllNotificationsAsRead(user_id);

      res.json({
        success: true,
        message: `${result.total} notificaciones marcadas como leídas y archivadas`,
        data: {
          user_id: user_id,
          total: result.total,
          marked_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      res.status(500).json({
        success: false,
        error: 'MARK_ALL_READ_ERROR',
        message: 'Error al marcar notificaciones como leídas'
      });
    }
  },

  // Marcar solo las notificaciones globales como leídas
  markGlobalAsRead: async (req: Request, res: Response) => {
    try {
      const user_id = (req as any).user_id; // Extraído del middleware noAuth

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'USER_ID_REQUIRED',
          message: 'ID de usuario requerido'
        });
      }

      console.log(`🌍 Usuario ${user_id} solicitando marcar solo notificaciones globales como leídas`);

      const count = await notificationService.markGlobalNotificationsAsRead(user_id);

      res.json({
        success: true,
        message: `${count} notificaciones globales marcadas como leídas`,
        data: {
          user_id: user_id,
          globalNotifications: count,
          marked_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al marcar notificaciones globales como leídas:', error);
      res.status(500).json({
        success: false,
        error: 'MARK_GLOBAL_READ_ERROR',
        message: 'Error al marcar notificaciones globales como leídas'
      });
    }
  },

  // Archivar notificación (requiere autenticación)
  archiveNotification: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user_id = (req as any).user_id; // Extraído del middleware de autenticación

      const success = await notificationService.archiveNotification(id, user_id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'NOTIFICATION_NOT_FOUND',
          message: 'Notificación no encontrada o no tienes permisos para archivarla'
        });
      }

      res.json({
        success: true,
        message: 'Notificación archivada exitosamente',
        data: {
          notification_id: id,
          user_id: user_id,
          archived_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al archivar notificación:', error);
      res.status(500).json({
        success: false,
        error: 'ARCHIVE_ERROR',
        message: 'Error al archivar notificación'
      });
    }
  },

  // Archivar notificación (SIN autenticación - público)
  archiveNotificationPublic: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user_id = (req as any).user_id; // Extraído del middleware noAuth

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'USER_ID_REQUIRED',
          message: 'ID de usuario requerido'
        });
      }

      console.log(`📁 Usuario ${user_id} archivando notificación ${id}`);

      const success = await notificationService.archiveNotification(id, user_id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'NOTIFICATION_NOT_FOUND',
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación archivada exitosamente',
        data: {
          notification_id: id,
          user_id: user_id,
          archived_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al archivar notificación:', error);
      res.status(500).json({
        success: false,
        error: 'ARCHIVE_ERROR',
        message: 'Error al archivar notificación'
      });
    }
  },

  // Marcar como leída Y archivar en una operación (requiere autenticación)
  markAsReadAndArchive: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user_id = (req as any).user_id; // Extraído del middleware de autenticación

      const result = await notificationService.markAsReadAndArchive(id, user_id);

      if (!result.notification) {
        return res.status(404).json({
          success: false,
          error: 'NOTIFICATION_NOT_FOUND',
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación marcada como leída y archivada exitosamente',
        data: {
          notification_id: id,
          user_id: user_id,
          marked_as_read: result.markedAsRead,
          archived: result.archived,
          notification: {
            id: result.notification.id,
            type: result.notification.type,
            title: result.notification.title,
            is_global: result.notification.is_global
          },
          processed_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al marcar como leída y archivar notificación:', error);
      res.status(500).json({
        success: false,
        error: 'MARK_READ_ARCHIVE_ERROR',
        message: 'Error al procesar notificación'
      });
    }
  },

  // Marcar como leída Y archivar en una operación (SIN autenticación - público)
  markAsReadAndArchivePublic: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user_id = (req as any).user_id; // Extraído del middleware noAuth

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'USER_ID_REQUIRED',
          message: 'ID de usuario requerido'
        });
      }

      console.log(`📖📁 Usuario ${user_id} marcando como leída y archivando notificación ${id}`);

      const result = await notificationService.markAsReadAndArchive(id, user_id);

      if (!result.notification) {
        return res.status(404).json({
          success: false,
          error: 'NOTIFICATION_NOT_FOUND',
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación marcada como leída y archivada exitosamente',
        data: {
          notification_id: id,
          user_id: user_id,
          marked_as_read: result.markedAsRead,
          archived: result.archived,
          notification: {
            id: result.notification.id,
            type: result.notification.type,
            title: result.notification.title,
            is_global: result.notification.is_global
          },
          processed_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al marcar como leída y archivar notificación:', error);
      res.status(500).json({
        success: false,
        error: 'MARK_READ_ARCHIVE_ERROR',
        message: 'Error al procesar notificación'
      });
    }
  },

  // Archivar múltiples notificaciones
  archiveMultipleNotifications: async (req: Request, res: Response) => {
    try {
      const { notification_ids } = req.body;
      const user_id = (req as any).user_id; // Extraído del middleware de autenticación

      if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_NOTIFICATION_IDS',
          message: 'notification_ids debe ser un array no vacío'
        });
      }

      const result = await notificationService.archiveMultipleNotifications(notification_ids, user_id);

      res.json({
        success: true,
        message: `${result.success.length} notificaciones archivadas exitosamente`,
        data: {
          user_id: user_id,
          total_requested: result.total,
          success_count: result.success.length,
          failed_count: result.failed.length,
          success_ids: result.success,
          failed_ids: result.failed,
          processed_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al archivar múltiples notificaciones:', error);
      res.status(500).json({
        success: false,
        error: 'ARCHIVE_MULTIPLE_ERROR',
        message: 'Error al archivar notificaciones'
      });
    }
  },

  // Eliminar notificación (requiere autenticación)
  deleteNotification: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user_id = (req as any).user_id; // Extraído del middleware de autenticación

      console.log(`🗑️ Usuario ${user_id} eliminando notificación ${id}`);

      const success = await notificationService.deleteNotification(id, user_id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'NOTIFICATION_NOT_FOUND',
          message: 'Notificación no encontrada o no tienes permisos para eliminarla'
        });
      }

      res.json({
        success: true,
        message: 'Notificación eliminada exitosamente',
        data: {
          notification_id: id,
          user_id: user_id,
          deleted_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      res.status(500).json({
        success: false,
        error: 'DELETE_ERROR',
        message: 'Error al eliminar notificación'
      });
    }
  },

  // Eliminar notificación (SIN autenticación - público)
  deleteNotificationPublic: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user_id = (req as any).user_id; // Extraído del middleware noAuth

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'USER_ID_REQUIRED',
          message: 'ID de usuario requerido'
        });
      }

      console.log(`🗑️ Usuario ${user_id} eliminando notificación ${id} (público)`);

      const success = await notificationService.deleteNotification(id, user_id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'NOTIFICATION_NOT_FOUND',
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación eliminada exitosamente',
        data: {
          notification_id: id,
          user_id: user_id,
          deleted_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      res.status(500).json({
        success: false,
        error: 'DELETE_ERROR',
        message: 'Error al eliminar notificación'
      });
    }
  },

  // Eliminar múltiples notificaciones (requiere autenticación)
  deleteMultipleNotifications: async (req: Request, res: Response) => {
    try {
      const { notification_ids } = req.body;
      const user_id = (req as any).user_id; // Extraído del middleware de autenticación

      if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_NOTIFICATION_IDS',
          message: 'notification_ids debe ser un array no vacío'
        });
      }

      console.log(`🗑️ Usuario ${user_id} eliminando ${notification_ids.length} notificaciones`);

      const result = await notificationService.deleteMultipleNotifications(notification_ids, user_id);

      res.json({
        success: true,
        message: `${result.success.length} notificaciones eliminadas exitosamente`,
        data: {
          user_id: user_id,
          total_requested: result.total,
          success_count: result.success.length,
          failed_count: result.failed.length,
          success_ids: result.success,
          failed_ids: result.failed,
          processed_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error al eliminar múltiples notificaciones:', error);
      res.status(500).json({
        success: false,
        error: 'DELETE_MULTIPLE_ERROR',
        message: 'Error al eliminar notificaciones'
      });
    }
  },

  // Obtener configuración del usuario
  getUserSettings: async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;

      const settings = await notificationService.getUserSettings(user_id);

      res.json({
        success: true,
        data: settings || {
          user_id,
          email_enabled: true,
          push_enabled: true,
          sound_enabled: true,
          stock_threshold: 10
        }
      });

    } catch (error) {
      console.error('Error al obtener configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener configuración'
      });
    }
  },

  // Actualizar configuración del usuario
  updateUserSettings: async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
      const settingsData = req.body;

      // Validar datos de entrada
      const validatedData = updateSettingsSchema.parse(settingsData);

      const settings = await notificationService.updateUserSettings(user_id, validatedData);

      res.json({
        success: true,
        data: settings,
        message: 'Configuración actualizada exitosamente'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: (error as z.ZodError).errors
        });
      }

      console.error('Error al actualizar configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar configuración'
      });
    }
  },

  // Suscribir a push notifications
  subscribeToPush: async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
      const subscriptionData = req.body;

      // Validar datos de suscripción
      const validatedData = pushSubscriptionSchema.parse(subscriptionData);

      const subscription = await pushService.subscribe(user_id, validatedData);

      res.status(201).json({
        success: true,
        data: subscription,
        message: 'Suscripción a push notifications creada exitosamente'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Datos de suscripción inválidos',
          details: (error as z.ZodError).errors
        });
      }

      console.error('Error al suscribir a push notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Error al suscribir a push notifications'
      });
    }
  },

  // Desuscribir de push notifications
  unsubscribeFromPush: async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
      const { endpoint } = req.body;

      if (!endpoint) {
        return res.status(400).json({
          success: false,
          error: 'endpoint es requerido'
        });
      }

      const success = await pushService.unsubscribe(user_id, endpoint);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Suscripción no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Suscripción eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al desuscribir de push notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Error al desuscribir de push notifications'
      });
    }
  },

  // Enviar push notification de prueba
  sendTestPush: async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
      const { title, message } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          error: 'title y message son requeridos'
        });
      }

      // Crear notificación de prueba
      const notification = await notificationService.notifySistema(
        user_id,
        title,
        message
      );

      res.json({
        success: true,
        message: 'Notificación de prueba enviada',
        data: notification
      });

    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
      res.status(500).json({
        success: false,
        error: 'Error al enviar notificación de prueba'
      });
    }
  },

  // Obtener estadísticas de notificaciones
  getNotificationStats: async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;

      // Obtener estadísticas de SSE
      const sseStats = sseService.getStats();

      // Obtener estadísticas de push subscriptions
      const pushStats = await pushService.getSubscriptionStats();

      // Obtener configuración del usuario
      const userSettings = await notificationService.getUserSettings(user_id);

      res.json({
        success: true,
        data: {
          sse: sseStats,
          push: pushStats,
          user_settings: userSettings
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas'
      });
    }
  },

  // Endpoint de prueba para verificar la conexión a la base de datos
  testConnection: async (req: Request, res: Response) => {
    try {
      console.log('🔍 Probando conexión a la base de datos...');
      
      // Verificar si la conexión está inicializada
      const isInitialized = AppDataSource.isInitialized;
      console.log('Conexión inicializada:', isInitialized);

      if (!isInitialized) {
        console.log('Inicializando conexión...');
        await AppDataSource.initialize();
        console.log('Conexión inicializada exitosamente');
      }

      // Intentar obtener el repositorio
      const notificationRepository = AppDataSource.getRepository(Notification);
      console.log('Repositorio obtenido correctamente');

      // Contar notificaciones
      const count = await notificationRepository.count();
      console.log('Total de notificaciones en BD:', count);

      // Contar notificaciones globales
      const globalCount = await notificationRepository.count({ where: { is_global: true } });
      console.log('Notificaciones globales en BD:', globalCount);

      res.json({
        success: true,
        data: {
          connection_initialized: isInitialized,
          total_notifications: count,
          global_notifications: globalCount,
          message: 'Conexión a la base de datos funcionando correctamente'
        }
      });

    } catch (error: any) {
      console.error('❌ Error en test de conexión:', error);
      res.status(500).json({
        success: false,
        error: 'Error de conexión a la base de datos',
        details: error.message,
        code: error.code
      });
    }
  },

  // Endpoint de prueba para enviar notificación de prueba al SSE
  testSSE: async (req: Request, res: Response) => {
    try {
      console.log('🧪 Enviando notificación de prueba al SSE...');
      
      // Crear notificación de prueba
      const testNotification = {
        id: `test_${Date.now()}`,
        type: NotificationType.SISTEMA,
        title: 'Notificación de Prueba SSE',
        message: 'Esta es una notificación de prueba para verificar el SSE',
        priority: NotificationPriority.MEDIUM,
        action_url: '/test',
        action_text: 'Ver detalles',
        metadata: { test: true, timestamp: new Date().toISOString() },
        created_at: new Date()
      };

      // Enviar directamente al SSE global
      sseService.sendGlobalNotification(testNotification as Notification);

      res.json({
        success: true,
        message: 'Notificación de prueba enviada al SSE',
        data: testNotification
      });

    } catch (error: any) {
      console.error('❌ Error en test SSE:', error);
      res.status(500).json({
        success: false,
        error: 'Error al enviar notificación de prueba',
        details: error.message
      });
    }
  },

  // Endpoint de prueba para crear notificación global en BD y enviar al SSE
  testCreateGlobalNotification: async (req: Request, res: Response) => {
    try {
      console.log('🧪 Creando notificación global de prueba...');
      
      const testData = {
        type: NotificationType.SISTEMA,
        title: 'Notificación Global de Prueba',
        message: 'Esta notificación se crea en la BD y se envía al SSE',
        priority: NotificationPriority.MEDIUM,
        action_url: '/test',
        action_text: 'Ver detalles',
        metadata: { test: true, timestamp: new Date().toISOString() }
      };

      // Crear notificación global (sin user_id)
      const notification = await notificationService.createNotification(testData);

      res.json({
        success: true,
        message: 'Notificación global creada y enviada al SSE',
        data: notification
      });

    } catch (error: any) {
      console.error('❌ Error en test create global notification:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear notificación global de prueba',
        details: error.message
      });
    }
  },

  // Endpoint de prueba para verificar el SSE
  testSSEConnection: async (req: Request, res: Response) => {
    try {
      console.log('🧪 Probando conexión SSE...');
      
      // Obtener estadísticas del SSE
      const sseService = new SSEService();
      const stats = sseService.getStats();
      
      console.log('📊 Estadísticas SSE:', stats);
      
      res.json({
        success: true,
        message: 'Estadísticas SSE obtenidas',
        data: {
          stats,
          timestamp: new Date().toISOString(),
          note: 'Conecta al SSE en /api/notifications/stream para recibir notificaciones'
        }
      });

    } catch (error: any) {
      console.error('❌ Error al obtener estadísticas SSE:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas SSE',
        details: error.message
      });
    }
  },

  // Endpoint de prueba para simular la creación de medida con notificación
  testCreateMedidaWithNotification: async (req: Request, res: Response) => {
    try {
      console.log('🧪 Simulando creación de medida con notificación automática...');
      
      // Simular los datos que vendrían de una medida real
      const medidaSimulada = {
        id: Math.floor(Math.random() * 1000),
        elemento: 'Ventana de Prueba',
        clienteId: 123,
        ubicacion: 'Sala de Pruebas',
        medidoPor: 'Técnico de Prueba',
        fechaMedicion: new Date()
      };
      
      console.log('📏 Medida simulada:', medidaSimulada);
      
      // Crear notificación automática (igual que en medidasController)
      const notificationData = {
        type: NotificationType.NUEVA_MEDIDA,
        title: 'Nueva Medida Tomada (Prueba)',
        message: `Se han tomado nuevas medidas para Cliente de Prueba`,
        priority: NotificationPriority.MEDIUM,
        action_url: `/medidas/${medidaSimulada.id}`,
        action_text: 'Ver Medida',
        metadata: {
          medida_id: medidaSimulada.id,
          cliente_id: medidaSimulada.clienteId,
          cliente_nombre: 'Cliente de Prueba',
          elemento: medidaSimulada.elemento,
          ubicacion: medidaSimulada.ubicacion,
          medido_por: medidaSimulada.medidoPor,
          fecha_medicion: medidaSimulada.fechaMedicion,
          source: 'test'
        }
      };
      
      console.log('🔔 Datos de notificación a crear:', notificationData);
      
      // Crear la notificación usando el mismo servicio
      const notification = await notificationService.createNotification(notificationData);
      
      console.log('✅ Notificación creada exitosamente:', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        is_global: notification.is_global
      });
      
      // Verificar estadísticas SSE después de enviar
      const sseService = new SSEService();
      const stats = sseService.getStats();
      
      res.json({
        success: true,
        message: 'Medida simulada creada con notificación automática',
        data: {
          medida: medidaSimulada,
          notification: {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            is_global: notification.is_global,
            created_at: notification.created_at
          },
          sse_stats: stats,
          timestamp: new Date().toISOString(),
          note: 'Verifica en el SSE si llegó la notificación'
        }
      });

    } catch (error: any) {
      console.error('❌ Error en test create medida con notificación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al simular creación de medida con notificación',
        details: error.message
      });
    }
  },

  // Endpoint para crear notificación de nueva medida (llamado por el frontend)
  createMedidaNotification: async (req: Request, res: Response) => {
    try {
      console.log('📏 Creando notificación de nueva medida...');
      
      const { 
        cliente_nombre, 
        elemento, 
        ubicacion, 
        medido_por,
        medida_id,
        cliente_id 
      } = req.body;

      // Validar datos requeridos
      if (!cliente_nombre || !elemento) {
        return res.status(400).json({
          success: false,
          error: 'cliente_nombre y elemento son requeridos'
        });
      }

      const notificationData = {
        type: NotificationType.NUEVA_MEDIDA,
        title: 'Nueva Medida Tomada',
        message: `Se han tomado nuevas medidas para ${cliente_nombre}`,
        priority: NotificationPriority.MEDIUM,
        action_url: `/medidas/${medida_id || 'nueva'}`,
        action_text: 'Ver Medida',
        metadata: {
          medida_id: medida_id || 'nueva',
          cliente_id: cliente_id || 'nuevo',
          cliente_nombre,
          elemento,
          ubicacion: ubicacion || 'No especificada',
          medido_por: medido_por || 'No especificado',
          fecha_medicion: new Date().toISOString(),
          source: 'frontend'
        }
      };

      // Crear notificación global
      const notification = await notificationService.createNotification(notificationData);

      console.log('🔔 Notificación de medida creada:', notification.id);

      res.status(201).json({
        success: true,
        message: 'Notificación de nueva medida creada exitosamente',
        data: notification
      });

    } catch (error: any) {
      console.error('❌ Error al crear notificación de medida:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear notificación de medida',
        details: error.message
      });
    }
  },

  // Endpoint de prueba para verificar markAllAsRead
  testMarkAllAsRead: async (req: Request, res: Response) => {
    try {
      const user_id = (req as any).user_id || 'test_user_123';

      console.log(`🧪 Probando markAllAsRead para usuario ${user_id}`);

      // Primero obtener el estado actual de las notificaciones
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const notificationRepository = AppDataSource.getRepository(Notification);
      
      const notificationsBefore = await notificationRepository.find({
        where: { is_read: false },
        select: ['id', 'is_read', 'is_archived']
      });

      console.log('📋 Estado ANTES:', {
        total_unread: notificationsBefore.length,
        notifications: notificationsBefore.map(n => ({
          id: n.id,
          is_read: n.is_read,
          is_archived: n.is_archived
        }))
      });

      // Ejecutar markAllAsRead
      const result = await notificationService.markAllAsRead(user_id);

      // Obtener el estado después
      const notificationsAfter = await notificationRepository.find({
        where: { is_read: false },
        select: ['id', 'is_read', 'is_archived']
      });

      const notificationsUpdated = await notificationRepository.find({
        where: { is_read: true, is_archived: true },
        select: ['id', 'is_read', 'is_archived']
      });

      console.log('📋 Estado DESPUÉS:', {
        total_unread: notificationsAfter.length,
        total_read_and_archived: notificationsUpdated.length,
        updated_notifications: notificationsUpdated.map(n => ({
          id: n.id,
          is_read: n.is_read,
          is_archived: n.is_archived
        }))
      });

      res.json({
        success: true,
        message: 'Test de markAllAsRead completado',
        data: {
          user_id,
          before: {
            total_unread: notificationsBefore.length,
            notifications: notificationsBefore
          },
          after: {
            total_unread: notificationsAfter.length,
            total_read_and_archived: notificationsUpdated.length,
            updated_notifications: notificationsUpdated
          },
          result: {
            updated_count: result
          },
          processed_at: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('❌ Error en test markAllAsRead:', error);
      res.status(500).json({
        success: false,
        error: 'Error en test markAllAsRead',
        details: error.message
      });
    }
  },

  // Endpoint de prueba para verificar markAsReadAndArchive
  testMarkAsReadAndArchive: async (req: Request, res: Response) => {
    try {
      const { notification_id } = req.params;
      const user_id = (req as any).user_id || 'test_user_123';

      console.log(`🧪 Probando markAsReadAndArchive para notificación ${notification_id}`);

      // Primero obtener el estado actual de la notificación
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const notificationRepository = AppDataSource.getRepository(Notification);
      
      const notificationBefore = await notificationRepository.findOne({
        where: { id: notification_id }
      });

      if (!notificationBefore) {
        return res.status(404).json({
          success: false,
          error: 'NOTIFICATION_NOT_FOUND',
          message: 'Notificación no encontrada'
        });
      }

      console.log('📋 Estado ANTES:', {
        id: notificationBefore.id,
        is_read: notificationBefore.is_read,
        is_archived: notificationBefore.is_archived
      });

      // Ejecutar markAsReadAndArchive
      const result = await notificationService.markAsReadAndArchive(notification_id, user_id);

      // Obtener el estado después
      const notificationAfter = await notificationRepository.findOne({
        where: { id: notification_id }
      });

      console.log('📋 Estado DESPUÉS:', {
        id: notificationAfter?.id,
        is_read: notificationAfter?.is_read,
        is_archived: notificationAfter?.is_archived
      });

      res.json({
        success: true,
        message: 'Test de markAsReadAndArchive completado',
        data: {
          notification_id,
          user_id,
          before: {
            is_read: notificationBefore.is_read,
            is_archived: notificationBefore.is_archived
          },
          after: {
            is_read: notificationAfter?.is_read,
            is_archived: notificationAfter?.is_archived
          },
          result: {
            markedAsRead: result.markedAsRead,
            archived: result.archived
          },
          processed_at: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('❌ Error en test markAsReadAndArchive:', error);
      res.status(500).json({
        success: false,
        error: 'Error en test markAsReadAndArchive',
        details: error.message
      });
    }
  },

  // Endpoint de prueba para simular el endpoint /create
  testCreateEndpoint: async (req: Request, res: Response) => {
    try {
      console.log('🧪 Simulando endpoint /create...');
      
      const notificationData = req.body;
      const user_id = (req as any).user_id; // Extraído del middleware de autenticación
      const { user_id: urlUserId } = req.params; // user_id de la URL si existe

      console.log('🔍 Datos recibidos:');
      console.log('  - Body:', notificationData);
      console.log('  - Token user_id:', user_id);
      console.log('  - URL user_id:', urlUserId);

      // Validar datos de entrada
      const validatedData = createNotificationSchema.parse(notificationData);

      // Determinar el user_id: URL > Body > Token
      let finalUserId: string | undefined;
      
      if (urlUserId) {
        finalUserId = urlUserId;
      } else if (validatedData.user_id) {
        finalUserId = validatedData.user_id;
      } else {
        finalUserId = undefined;
      }

      console.log('🔍 Resultado final:');
      console.log('  - finalUserId:', finalUserId);
      console.log('  - Es notificación global:', !finalUserId);

      const notification = await notificationService.createNotification({
        ...validatedData,
        user_id: finalUserId,
        expires_at: validatedData.expires_at ? new Date(validatedData.expires_at) : undefined
      });

      const message = finalUserId 
        ? 'Notificación creada exitosamente' 
        : 'Notificación global creada exitosamente';

      res.status(201).json({
        success: true,
        data: notification,
        message,
        debug: {
          finalUserId,
          isGlobal: !finalUserId,
          tokenUserId: user_id,
          urlUserId,
          bodyUserId: validatedData.user_id
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: (error as z.ZodError).errors
        });
      }

      console.error('Error al crear notificación:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear notificación'
      });
    }
  },

};
