import webpush from 'web-push';
import { AppDataSource } from '../config/database';
import { PushSubscription } from '../entities/PushSubscription';
import { Notification } from '../entities/Notifications';

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export class PushNotificationService {
  constructor() {
    // Configurar VAPID keys
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || 'notifications@cortinova.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('VAPID keys no configuradas. Las push notifications no funcionarán.');
      return;
    }

    webpush.setVapidDetails(
      `mailto:${vapidEmail}`,
      vapidPublicKey,
      vapidPrivateKey
    );
  }

  // Suscribir un usuario a push notifications
  async subscribe(user_id: string, subscriptionData: PushSubscriptionData): Promise<PushSubscription> {
    const subscriptionRepository = AppDataSource.getRepository(PushSubscription);
    
    // Verificar si ya existe una suscripción con este endpoint
    const existingSubscription = await subscriptionRepository.findOne({
      where: { endpoint: subscriptionData.endpoint }
    });

    if (existingSubscription) {
      // Actualizar la suscripción existente
      existingSubscription.user_id = user_id;
      existingSubscription.p256dh = subscriptionData.p256dh;
      existingSubscription.auth = subscriptionData.auth;
      return await subscriptionRepository.save(existingSubscription);
    }

    // Crear nueva suscripción
    const subscription = subscriptionRepository.create({
      user_id,
      endpoint: subscriptionData.endpoint,
      p256dh: subscriptionData.p256dh,
      auth: subscriptionData.auth
    });

    return await subscriptionRepository.save(subscription);
  }

  // Desuscribir un usuario de push notifications
  async unsubscribe(user_id: string, endpoint: string): Promise<boolean> {
    const subscriptionRepository = AppDataSource.getRepository(PushSubscription);
    
    const result = await subscriptionRepository.delete({
      user_id,
      endpoint
    });

    return result.affected !== 0;
  }

  // Desuscribir todas las suscripciones de un usuario
  async unsubscribeAll(user_id: string): Promise<number> {
    const subscriptionRepository = AppDataSource.getRepository(PushSubscription);
    
    const result = await subscriptionRepository.delete({ user_id });
    return result.affected || 0;
  }

  // Enviar push notification a un usuario específico
  async sendPushNotification(user_id: string, notification: Notification): Promise<void> {
    const subscriptionRepository = AppDataSource.getRepository(PushSubscription);
    
    // Obtener todas las suscripciones del usuario
    const subscriptions = await subscriptionRepository.find({
      where: { user_id }
    });

    if (subscriptions.length === 0) {
      console.log(`No hay suscripciones push para el usuario ${user_id}`);
      return;
    }

    // Preparar payload de la notificación
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      icon: '/icon-192x192.png', // Icono de la PWA
      badge: '/badge-72x72.png',
      tag: notification.type, // Agrupar notificaciones por tipo
      data: {
        notification_id: notification.id,
        type: notification.type,
        action_url: notification.action_url,
        action_text: notification.action_text,
        metadata: notification.metadata
      },
      actions: notification.action_url ? [
        {
          action: 'open',
          title: notification.action_text || 'Ver',
          icon: '/action-icon.png'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ] : undefined,
      requireInteraction: notification.priority === 'high' || notification.priority === 'urgent',
      silent: false
    });

    // Enviar a todas las suscripciones del usuario
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        await webpush.sendNotification(pushSubscription, payload);
        console.log(`Push notification enviada exitosamente a ${user_id}`);
      } catch (error: any) {
        console.error(`Error al enviar push notification a ${user_id}:`, error);
        
        // Si la suscripción es inválida, eliminarla
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Eliminando suscripción inválida para ${user_id}`);
          await this.unsubscribe(user_id, subscription.endpoint);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  }

  // Enviar push notification a múltiples usuarios
  async sendPushNotificationToUsers(user_ids: string[], notification: Notification): Promise<void> {
    const sendPromises = user_ids.map(user_id => 
      this.sendPushNotification(user_id, notification)
    );
    
    await Promise.allSettled(sendPromises);
  }

  // Enviar push notification a todos los usuarios suscritos
  async broadcastPushNotification(notification: Notification): Promise<void> {
    const subscriptionRepository = AppDataSource.getRepository(PushSubscription);
    
    // Obtener todos los usuarios únicos con suscripciones
    const subscriptions = await subscriptionRepository
      .createQueryBuilder('subscription')
      .select('DISTINCT subscription.user_id', 'user_id')
      .getRawMany();

    const user_ids = subscriptions.map(sub => sub.user_id);
    await this.sendPushNotificationToUsers(user_ids, notification);
  }

  // Obtener estadísticas de suscripciones
  async getSubscriptionStats(): Promise<{
    totalSubscriptions: number;
    uniqueUsers: number;
  }> {
    const subscriptionRepository = AppDataSource.getRepository(PushSubscription);
    
    const totalSubscriptions = await subscriptionRepository.count();
    const uniqueUsers = await subscriptionRepository
      .createQueryBuilder('subscription')
      .select('COUNT(DISTINCT subscription.user_id)', 'count')
      .getRawOne();

    return {
      totalSubscriptions,
      uniqueUsers: parseInt(uniqueUsers.count) || 0
    };
  }

  // Verificar si un usuario tiene suscripciones activas
  async hasActiveSubscriptions(user_id: string): Promise<boolean> {
    const subscriptionRepository = AppDataSource.getRepository(PushSubscription);
    
    const count = await subscriptionRepository.count({
      where: { user_id }
    });

    return count > 0;
  }

  // Obtener las suscripciones de un usuario
  async getUserSubscriptions(user_id: string): Promise<PushSubscription[]> {
    const subscriptionRepository = AppDataSource.getRepository(PushSubscription);
    
    return await subscriptionRepository.find({
      where: { user_id }
    });
  }
}
