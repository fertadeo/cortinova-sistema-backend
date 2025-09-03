import { AppDataSource } from '../config/database';
import { Notification, NotificationType, NotificationPriority } from '../entities/Notifications';
import { NotificationSettings } from '../entities/NotificationSettings';
import { NotificationReadStatus } from '../entities/NotificationReadStatus';
import { SSEService } from '../services/SSEService';
import { PushNotificationService } from '../services/PushNotificationService';

export interface CreateNotificationData {
  user_id?: string; // Opcional para notificaciones globales
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  action_url?: string;
  action_text?: string;
  metadata?: any;
  expires_at?: Date;
}

export class NotificationService {
  private sseService: SSEService;
  private pushService: PushNotificationService;

  constructor() {
    this.sseService = new SSEService();
    this.pushService = new PushNotificationService();
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    
    console.log('🚀 INICIANDO createNotification con datos:', {
      type: data.type,
      title: data.title,
      message: data.message,
      user_id: data.user_id,
      is_global: !data.user_id
    });
    
    const notification = notificationRepository.create({
      ...data,
      priority: data.priority || NotificationPriority.MEDIUM
    });

    const savedNotification = await notificationRepository.save(notification);

    console.log('✅ Notificación guardada en BD:', {
      id: savedNotification.id,
      type: savedNotification.type,
      title: savedNotification.title,
      user_id: savedNotification.user_id,
      is_global: savedNotification.is_global,
      created_at: savedNotification.created_at
    });

    console.log('📢 Notificación creada, enviando al SSE...');
    console.log('📋 Datos de la notificación:', {
      id: savedNotification.id,
      type: savedNotification.type,
      title: savedNotification.title,
      user_id: data.user_id,
      is_global: !data.user_id
    });

    // Enviar notificación en tiempo real via SSE
    if (data.user_id) {
      console.log(`👤 Enviando notificación a usuario específico: ${data.user_id}`);
      try {
        this.sseService.sendNotification(data.user_id, savedNotification);
        console.log('✅ Notificación enviada a usuario específico exitosamente');
      } catch (error) {
        console.error('❌ Error al enviar notificación a usuario específico:', error);
      }
    } else {
      // Si no hay user_id, es una notificación global
      console.log('🌍 Enviando notificación global al SSE');
      console.log('🌍 Datos de la notificación global:', {
        id: savedNotification.id,
        type: savedNotification.type,
        title: savedNotification.title
      });
      
      try {
        console.log('🌍 Llamando a sseService.sendGlobalNotification...');
        this.sseService.sendGlobalNotification(savedNotification);
        console.log('✅ Notificación global enviada al SSE exitosamente');
      } catch (error) {
        console.error('❌ Error al enviar notificación global al SSE:', error);
      }
    }

    // Enviar push notification si está habilitado y hay user_id
    if (data.user_id) {
      try {
        const settings = await this.getUserSettings(data.user_id);
        if (settings?.push_enabled) {
          await this.pushService.sendPushNotification(data.user_id, savedNotification);
          console.log('📱 Push notification enviado exitosamente');
        }
      } catch (error) {
        console.error('❌ Error al enviar push notification:', error);
      }
    }

    console.log('🏁 createNotification completado exitosamente');
    return savedNotification;
  }

  async getAllNotifications(
    filters?: {
      type?: NotificationType;
      is_archived?: boolean;
    }
  ): Promise<Notification[]> {
    try {
      // Verificar que la conexión a la base de datos esté inicializada
      if (!AppDataSource.isInitialized) {
        console.log('Inicializando conexión a la base de datos...');
        await AppDataSource.initialize();
      }

      const notificationRepository = AppDataSource.getRepository(Notification);
      
      const queryBuilder = notificationRepository
        .createQueryBuilder('notification')
        .where('notification.is_global = :is_global', { is_global: true })
        .orderBy('notification.created_at', 'DESC');

      if (filters?.type) {
        queryBuilder.andWhere('notification.type = :type', { type: filters.type });
      }

      if (filters?.is_archived !== undefined) {
        queryBuilder.andWhere('notification.is_archived = :is_archived', { is_archived: filters.is_archived });
      }

      const notifications = await queryBuilder.getMany();

      console.log('Query ejecutada, notificaciones encontradas:', notifications.length);
      console.log('SQL generado:', queryBuilder.getSql());

      return notifications;
    } catch (error: any) {
      console.error('Error en getAllNotifications:', error);
      
      // Si es un error de conexión, intentar reconectar
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Error de conexión detectado, intentando reconectar...');
        try {
          if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
          }
          await AppDataSource.initialize();
          console.log('Reconexión exitosa');
          
          // Reintentar la operación
          return this.getAllNotifications(filters);
        } catch (reconnectError) {
          console.error('Error al reconectar:', reconnectError);
          throw new Error('No se pudo establecer conexión con la base de datos');
        }
      }
      
      throw error;
    }
  }

  async getUserNotifications(
    user_id: string, 
    page: number = 1, 
    limit: number = 20,
    filters?: {
      type?: NotificationType;
      is_read?: boolean;
      is_archived?: boolean;
    }
  ): Promise<{
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      // Verificar que la conexión a la base de datos esté inicializada
      if (!AppDataSource.isInitialized) {
        console.log('Inicializando conexión a la base de datos...');
        await AppDataSource.initialize();
      }

      const notificationRepository = AppDataSource.getRepository(Notification);
      
      const queryBuilder = notificationRepository
        .createQueryBuilder('notification')
        .where('notification.user_id = :user_id', { user_id })
        .orderBy('notification.created_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      if (filters?.type) {
        queryBuilder.andWhere('notification.type = :type', { type: filters.type });
      }

      if (filters?.is_read !== undefined) {
        queryBuilder.andWhere('notification.is_read = :is_read', { is_read: filters.is_read });
      }

      if (filters?.is_archived !== undefined) {
        queryBuilder.andWhere('notification.is_archived = :is_archived', { is_archived: filters.is_archived });
      }

      const [notifications, total] = await queryBuilder.getManyAndCount();

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      console.error('Error en getUserNotifications:', error);
      
      // Si es un error de conexión, intentar reconectar
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Error de conexión detectado, intentando reconectar...');
        try {
          if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
          }
          await AppDataSource.initialize();
          console.log('Reconexión exitosa');
          
          // Reintentar la operación
          return this.getUserNotifications(user_id, page, limit, filters);
        } catch (reconnectError) {
          console.error('Error al reconectar:', reconnectError);
          throw new Error('No se pudo establecer conexión con la base de datos');
        }
      }
      
      throw error;
    }
  }

  async markAsRead(notificationId: string, user_id: string): Promise<boolean> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const notificationRepository = AppDataSource.getRepository(Notification);
      const readStatusRepository = AppDataSource.getRepository(NotificationReadStatus);
      
      console.log(`📖 Marcando notificación ${notificationId} como leída para usuario: ${user_id}`);

      // Primero verificar si la notificación existe y es global
      const notification = await notificationRepository.findOne({
        where: { id: notificationId }
      });

      if (!notification) {
        console.log(`❌ Notificación ${notificationId} no encontrada`);
        return false;
      }

      if (notification.is_global) {
        // Para notificaciones globales, usar notification_read_status
        console.log(`🌍 Notificación global detectada, usando notification_read_status`);
        
        let readStatus = await readStatusRepository.findOne({
          where: { notification_id: notificationId, user_id }
        });

        if (readStatus) {
          // Actualizar registro existente
          readStatus.is_read = true;
          readStatus.read_at = new Date();
          await readStatusRepository.save(readStatus);
          console.log(`✅ Estado de lectura actualizado para notificación global`);
        } else {
          // Crear nuevo registro
          readStatus = readStatusRepository.create({
            notification_id: notificationId,
            user_id,
            is_read: true,
            read_at: new Date()
          });
          await readStatusRepository.save(readStatus);
          console.log(`✅ Nuevo estado de lectura creado para notificación global`);
        }
        
        return true;
      } else {
        // Para notificaciones específicas del usuario, actualizar directamente
        console.log(`👤 Notificación específica del usuario, actualizando directamente`);
        
        const result = await notificationRepository.update(
          { id: notificationId, user_id },
          { is_read: true }
        );

        const updated = result.affected !== 0;
        console.log(`✅ Notificación específica marcada como leída: ${updated}`);
        return updated;
      }
    } catch (error) {
      console.error('Error en markAsRead:', error);
      throw error;
    }
  }

  async markAllAsRead(user_id: string): Promise<number> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    
    console.log(`📖 Marcando todas las notificaciones como leídas para usuario: ${user_id}`);
    
    // Contar notificaciones no leídas antes de marcarlas
    const unreadCount = await notificationRepository.count({
      where: [
        // Notificaciones específicas del usuario no leídas
        { user_id, is_read: false },
        // Notificaciones globales no leídas (que no estén en notification_read_status)
        { is_global: true, is_read: false }
      ]
    });

    console.log(`📊 Total de notificaciones no leídas encontradas: ${unreadCount}`);

    // Marcar notificaciones específicas del usuario como leídas
    const userNotificationsResult = await notificationRepository.update(
      { user_id, is_read: false },
      { is_read: true }
    );

    const userNotificationsUpdated = userNotificationsResult.affected || 0;
    console.log(`✅ Notificaciones específicas del usuario marcadas como leídas: ${userNotificationsUpdated}`);

    // Para notificaciones globales, usar la tabla notification_read_status
    // Esto se maneja en el controlador para mantener la consistencia

    return userNotificationsUpdated;
  }

  // Nuevo método para marcar notificaciones globales como leídas
  async markGlobalNotificationsAsRead(user_id: string): Promise<number> {
    try {
      // Verificar que la conexión a la base de datos esté inicializada
      if (!AppDataSource.isInitialized) {
        console.log('Inicializando conexión a la base de datos...');
        await AppDataSource.initialize();
      }

      const notificationRepository = AppDataSource.getRepository(Notification);
      const readStatusRepository = AppDataSource.getRepository(NotificationReadStatus);
      
      console.log(`🌍 Marcando notificaciones globales como leídas para usuario: ${user_id}`);

      // Obtener todas las notificaciones globales no leídas
      const globalNotifications = await notificationRepository.find({
        where: { is_global: true },
        select: ['id']
      });

      console.log(`📋 Notificaciones globales encontradas: ${globalNotifications.length}`);

      let markedAsRead = 0;

      // Marcar cada notificación global como leída para este usuario
      for (const notification of globalNotifications) {
        // Verificar si ya existe un registro de lectura
        let readStatus = await readStatusRepository.findOne({
          where: { notification_id: notification.id, user_id }
        });

        if (!readStatus) {
          // Crear nuevo registro de lectura
          readStatus = readStatusRepository.create({
            notification_id: notification.id,
            user_id,
            is_read: true,
            read_at: new Date()
          });
        } else if (!readStatus.is_read) {
          // Actualizar registro existente
          readStatus.is_read = true;
          readStatus.read_at = new Date();
        } else {
          // Ya está marcada como leída
          continue;
        }

        await readStatusRepository.save(readStatus);
        markedAsRead++;
      }

      console.log(`✅ Notificaciones globales marcadas como leídas: ${markedAsRead}`);

      return markedAsRead;

    } catch (error: any) {
      console.error('Error al marcar notificaciones globales como leídas:', error);
      
      // Si es un error de conexión, intentar reconectar
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Error de conexión detectado, intentando reconectar...');
        try {
          if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
          }
          await AppDataSource.initialize();
          console.log('Reconexión exitosa');
          
          // Reintentar la operación
          return this.markGlobalNotificationsAsRead(user_id);
        } catch (reconnectError) {
          console.error('Error al reconectar:', reconnectError);
          throw new Error('No se pudo establecer conexión con la base de datos');
        }
      }
      
      throw error;
    }
  }

  // Método combinado para marcar todas las notificaciones como leídas
  async markAllNotificationsAsRead(user_id: string): Promise<{
    userNotifications: number;
    globalNotifications: number;
    total: number;
  }> {
    console.log(`📖 Marcando TODAS las notificaciones como leídas para usuario: ${user_id}`);
    
    // Marcar notificaciones específicas del usuario
    const userNotificationsUpdated = await this.markAllAsRead(user_id);
    
    // Marcar notificaciones globales
    const globalNotificationsUpdated = await this.markGlobalNotificationsAsRead(user_id);
    
    const total = userNotificationsUpdated + globalNotificationsUpdated;
    
    console.log(`📊 Resumen de marcado como leídas:`);
    console.log(`  - Notificaciones específicas: ${userNotificationsUpdated}`);
    console.log(`  - Notificaciones globales: ${globalNotificationsUpdated}`);
    console.log(`  - Total: ${total}`);
    
    return {
      userNotifications: userNotificationsUpdated,
      globalNotifications: globalNotificationsUpdated,
      total
    };
  }

  async archiveNotification(notificationId: string, user_id: string): Promise<boolean> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    
    const result = await notificationRepository.update(
      { id: notificationId, user_id },
      { is_archived: true }
    );

    return result.affected !== 0;
  }

  async deleteNotification(notificationId: string, user_id: string): Promise<boolean> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    
    const result = await notificationRepository.delete({
      id: notificationId,
      user_id
    });

    return result.affected !== 0;
  }

  async getUserSettings(user_id: string): Promise<NotificationSettings | null> {
    const settingsRepository = AppDataSource.getRepository(NotificationSettings);
    return await settingsRepository.findOne({ where: { user_id } });
  }

  async updateUserSettings(user_id: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const settingsRepository = AppDataSource.getRepository(NotificationSettings);
    
    let userSettings = await settingsRepository.findOne({ where: { user_id } });
    
    if (!userSettings) {
      userSettings = settingsRepository.create({ user_id, ...settings });
    } else {
      Object.assign(userSettings, settings);
    }

    return await settingsRepository.save(userSettings);
  }

  // Métodos específicos para eventos del negocio
  async notifyStockBajo(user_id: string, producto: any, stockActual: number, stockThreshold: number) {
    return this.createNotification({
      user_id,
      type: NotificationType.STOCK_BAJO,
      title: `Stock Bajo - ${producto.nombreProducto}`,
      message: `Quedan solo ${stockActual} unidades de ${producto.nombreProducto}`,
      action_url: `/stock/${producto.id}`,
      action_text: 'Gestionar Stock',
      metadata: { 
        producto_id: producto.id, 
        stock_actual: stockActual, 
        stock_threshold: stockThreshold 
      },
      priority: NotificationPriority.HIGH
    });
  }

  async notifyNuevaMedida(user_id: string, medida: any, cliente: any) {
    return this.createNotification({
      user_id,
      type: NotificationType.NUEVA_MEDIDA,
      title: 'Nueva Medida - Presupuesto por Armar',
      message: `Medida registrada para ${cliente.nombre}. Presupuesto pendiente.`,
      action_url: `/presupuestos/nuevo?medida_id=${medida.id}`,
      action_text: 'Crear Presupuesto',
      metadata: { 
        medida_id: medida.id, 
        cliente_id: cliente.id, 
        cliente_nombre: cliente.nombre 
      },
      priority: NotificationPriority.MEDIUM
    });
  }

  async notifyPedidoListo(user_id: string, pedido: any, cliente: any) {
    return this.createNotification({
      user_id,
      type: NotificationType.PEDIDO_LISTO,
      title: `Pedido Listo #${pedido.id}`,
      message: `El pedido para ${cliente.nombre} está listo para entregar`,
      action_url: `/pedidos/${pedido.id}`,
      action_text: 'Ver Pedido',
      metadata: { 
        pedido_id: pedido.id, 
        cliente_id: cliente.id, 
        cliente_nombre: cliente.nombre 
      },
      priority: NotificationPriority.MEDIUM
    });
  }

  async notifySistema(user_id: string, title: string, message: string, action_url?: string) {
    return this.createNotification({
      user_id,
      type: NotificationType.SISTEMA,
      title,
      message,
      action_url,
      priority: NotificationPriority.MEDIUM
    });
  }
}
