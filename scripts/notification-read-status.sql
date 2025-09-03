-- Script para crear la tabla de estado de lectura de notificaciones
-- Esta tabla maneja qué notificaciones ha leído cada usuario

-- Crear tabla notification_read_status
CREATE TABLE IF NOT EXISTS `notification_read_status` (
  `id` varchar(36) NOT NULL,
  `notification_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_notification_user` (`notification_id`, `user_id`),
  KEY `idx_user_read` (`user_id`, `is_read`),
  KEY `idx_notification_id` (`notification_id`),
  KEY `idx_read_at` (`read_at`),
  CONSTRAINT `fk_notification_read_status_notification` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notification_read_status_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modificar la tabla notifications para hacer user_id opcional
ALTER TABLE `notifications` 
MODIFY COLUMN `user_id` VARCHAR(36) NULL COMMENT 'Usuario que creó la notificación (opcional para notificaciones globales)',
ADD COLUMN `created_by` VARCHAR(36) NULL COMMENT 'Usuario que creó la notificación',
ADD COLUMN `is_global` BOOLEAN DEFAULT TRUE COMMENT 'Indica si la notificación es global';

-- Crear índices adicionales para optimizar consultas
ALTER TABLE `notifications` 
ADD INDEX `idx_is_global` (`is_global`),
ADD INDEX `idx_created_by` (`created_by`);

-- Insertar datos de prueba para notificaciones globales
INSERT IGNORE INTO `notifications` (`id`, `user_id`, `created_by`, `type`, `title`, `message`, `is_read`, `is_archived`, `priority`, `action_url`, `action_text`, `metadata`, `expires_at`, `created_at`, `is_global`) 
VALUES 
(UUID(), NULL, '123', 'sistema', 'Bienvenido al Sistema de Notificaciones', 'El sistema de notificaciones está ahora activo para todos los usuarios', 0, 0, 'medium', '/dashboard', 'Ver Dashboard', '{"welcome": true, "global": true}', NULL, NOW(), TRUE),
(UUID(), NULL, '123', 'stock_bajo', 'Stock Bajo - Cortina Roller Premium', 'El producto "Cortina Roller Premium" tiene stock bajo (5 unidades). Revisar inventario.', 0, 0, 'high', '/productos/1', 'Ver Producto', '{"producto_id": 1, "stock_actual": 5, "global": true}', NULL, NOW(), TRUE),
(UUID(), NULL, '123', 'sistema', 'Mantenimiento Programado', 'El sistema estará en mantenimiento el próximo domingo de 2:00 AM a 4:00 AM', 0, 0, 'medium', '/notificaciones', 'Ver Detalles', '{"maintenance": true, "global": true}', NULL, NOW(), TRUE);

-- Verificar que las tablas se crearon correctamente
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    UPDATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('notifications', 'notification_read_status');

-- Verificar estructura de la nueva tabla
DESCRIBE notification_read_status;
