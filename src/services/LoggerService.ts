import winston from 'winston';
import path from 'path';

// Configurar el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cortinova-notifications' },
  transports: [
    // Log de errores
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Log de información
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Si no estamos en producción, también log a la consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export class LoggerService {
  static info(message: string, meta?: any) {
    logger.info(message, meta);
  }

  static error(message: string, error?: any) {
    logger.error(message, { error: error?.message || error, stack: error?.stack });
  }

  static warn(message: string, meta?: any) {
    logger.warn(message, meta);
  }

  static debug(message: string, meta?: any) {
    logger.debug(message, meta);
  }

  // Métodos específicos para notificaciones
  static notificationCreated(notification: any) {
    logger.info('Notificación creada', {
      notification_id: notification.id,
      user_id: notification.user_id,
      type: notification.type,
      title: notification.title
    });
  }

  static notificationSent(user_id: string, type: 'sse' | 'push', success: boolean, error?: any) {
    logger.info('Notificación enviada', {
      user_id,
      type,
      success,
      error: error?.message
    });
  }

  static sseConnected(clientId: string, user_id: string) {
    logger.info('Cliente SSE conectado', { clientId, user_id });
  }

  static sseDisconnected(clientId: string, user_id: string) {
    logger.info('Cliente SSE desconectado', { clientId, user_id });
  }

  static pushSubscriptionCreated(user_id: string, endpoint: string) {
    logger.info('Suscripción push creada', { user_id, endpoint: endpoint.substring(0, 50) + '...' });
  }

  static pushSubscriptionDeleted(user_id: string, endpoint: string) {
    logger.info('Suscripción push eliminada', { user_id, endpoint: endpoint.substring(0, 50) + '...' });
  }

  static databaseError(operation: string, error: any) {
    logger.error(`Error de base de datos en ${operation}`, error);
  }

  static validationError(field: string, value: any, rule: string) {
    logger.warn('Error de validación', { field, value, rule });
  }
}

export default logger;
