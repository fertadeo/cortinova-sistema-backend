-- Script para verificar y crear las tablas de notificaciones
-- Ejecutar este script en MySQL para asegurar que las tablas existan

-- Verificar si las tablas existen
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    UPDATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('notifications', 'notification_settings', 'push_subscriptions');

-- Crear tabla notifications si no existe
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `type` enum('stock_bajo','nuevo_cliente','pedido_listo','nueva_medida','pedido_atrasado','presupuesto_disponible','venta_realizada','sistema') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `is_archived` tinyint(1) NOT NULL DEFAULT '0',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `action_url` varchar(500) DEFAULT NULL,
  `action_text` varchar(100) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_read` (`user_id`,`is_read`),
  KEY `idx_user_type` (`user_id`,`type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla notification_settings si no existe
CREATE TABLE IF NOT EXISTS `notification_settings` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `email_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `push_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `sound_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `stock_threshold` int(11) NOT NULL DEFAULT '10',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla push_subscriptions si no existe
CREATE TABLE IF NOT EXISTS `push_subscriptions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `endpoint` varchar(500) NOT NULL,
  `p256dh` varchar(255) NOT NULL,
  `auth` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar configuración por defecto para un usuario de prueba
INSERT IGNORE INTO `notification_settings` (`id`, `user_id`, `email_enabled`, `push_enabled`, `sound_enabled`, `stock_threshold`) 
VALUES (UUID(), '123', 1, 1, 1, 10);

-- Insertar algunas notificaciones de prueba
INSERT IGNORE INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `is_read`, `is_archived`, `priority`, `action_url`, `action_text`, `metadata`, `expires_at`, `created_at`) 
VALUES 
(UUID(), '123', 'sistema', 'Bienvenido al Sistema', 'Tu cuenta ha sido configurada correctamente', 0, 0, 'medium', '/dashboard', 'Ver Dashboard', '{"welcome": true}', NULL, NOW()),
(UUID(), '123', 'stock_bajo', 'Stock Bajo - Cortina Roller', 'El producto "Cortina Roller Premium" tiene stock bajo (5 unidades)', 0, 0, 'high', '/productos/1', 'Ver Producto', '{"producto_id": 1, "stock_actual": 5}', NULL, NOW()),
(UUID(), '123', 'nueva_medida', 'Nueva Medida Registrada', 'Se ha registrado una nueva medida para el cliente "Juan Pérez"', 0, 0, 'medium', '/medidas/1', 'Ver Medida', '{"cliente_id": 1, "medida_id": 1}', NULL, NOW());

-- Verificar que las tablas se crearon correctamente
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    UPDATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('notifications', 'notification_settings', 'push_subscriptions');

-- Verificar datos de prueba
SELECT COUNT(*) as total_notifications FROM notifications;
SELECT COUNT(*) as total_settings FROM notification_settings;

