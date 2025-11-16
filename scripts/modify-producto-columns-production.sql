-- Script para modificar las columnas de la tabla producto en base de datos de producción
-- Permite que proveedor_id, rubro_id y sistema_id acepten valores NULL por defecto
-- Agrega valores por defecto para campos obligatorios

-- IMPORTANTE: Este script debe ejecutarse en la base de datos de PRODUCCIÓN
-- Ejecutar con cuidado y hacer backup antes de aplicar

-- Modificar columna proveedor_id para permitir NULL
ALTER TABLE producto 
MODIFY COLUMN proveedor_id INT NULL;

-- Modificar columna rubro_id para permitir NULL  
ALTER TABLE producto 
MODIFY COLUMN rubro_id VARCHAR(255) NULL;

-- Modificar columna sistema_id para permitir NULL
ALTER TABLE producto 
MODIFY COLUMN sistema_id VARCHAR(255) NULL;

-- Agregar valores por defecto para campos obligatorios
ALTER TABLE producto 
MODIFY COLUMN nombreProducto VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE producto 
MODIFY COLUMN cantidad_stock VARCHAR(255) NOT NULL DEFAULT '0';

ALTER TABLE producto 
MODIFY COLUMN descripcion TEXT NOT NULL DEFAULT '';

ALTER TABLE producto 
MODIFY COLUMN precioCosto VARCHAR(255) NOT NULL DEFAULT '0';

ALTER TABLE producto 
MODIFY COLUMN precio VARCHAR(255) NOT NULL DEFAULT '0';

ALTER TABLE producto 
MODIFY COLUMN divisa VARCHAR(10) NOT NULL DEFAULT 'ARS';

ALTER TABLE producto 
MODIFY COLUMN descuento DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE producto 
MODIFY COLUMN disponible BOOLEAN NOT NULL DEFAULT TRUE;

-- Verificar los cambios aplicados
DESCRIBE producto;
