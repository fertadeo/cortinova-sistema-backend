-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 21-01-2025 a las 14:16:11
-- Versión del servidor: 10.4.27-MariaDB
-- Versión de PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cortinova`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `dni` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `dni`, `nombre`, `email`, `telefono`, `direccion`, `fecha_registro`) VALUES
(11, NULL, 'Fernando Tadeo', NULL, '03541222719', NULL, '2024-12-03 15:22:47'),
(12, NULL, 'Martin Garcia', NULL, '354122271923', NULL, '2024-12-09 16:48:27'),
(13, NULL, 'Maria Emilia Careaga', NULL, '03541222719', NULL, '2024-12-09 17:06:38'),
(18, '', 'Gonzalo Manavella', '', '3584306945', '', '2024-12-23 10:30:46'),
(19, '', 'Paula Somacal', '', '2954306095', '', '2024-12-23 16:42:37');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `fecha_pedido` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `clienteId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `presupuestos`
--

CREATE TABLE `presupuestos` (
  `id` int(11) NOT NULL,
  `numero_presupuesto` varchar(20) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(20) DEFAULT 'emitido',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `presupuesto_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`presupuesto_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `presupuestos`
--

INSERT INTO `presupuestos` (`id`, `numero_presupuesto`, `cliente_id`, `fecha`, `total`, `estado`, `created_at`, `presupuesto_json`) VALUES
(9, 'PRES-2024-001', 12, '2024-12-09 17:01:48', '65700.00', NULL, '2024-12-09 20:01:48', '{}'),
(12, 'PRES-2024-001', 13, '2024-12-09 17:08:48', '73000.00', NULL, '2024-12-09 20:08:48', '{}'),
(35, 'PRES-2024-001', 11, '2024-12-10 21:08:54', '10000.00', NULL, '2024-12-11 00:08:54', '{}'),
(36, 'PRES-2024-001', 11, '2024-12-10 21:09:29', '10000.00', NULL, '2024-12-11 00:09:29', '{}'),
(51, 'PRES-2024-001', 11, '2024-12-13 16:16:33', '110500.00', 'emitido', '2024-12-13 19:16:33', '{}'),
(52, 'PRES-2024-001', 11, '2024-12-13 17:07:26', '106200.00', 'emitido', '2024-12-13 20:07:26', '{}'),
(53, 'PRES-2024-001', 11, '2024-12-13 17:09:00', '48300.00', 'emitido', '2024-12-13 20:09:00', '{}'),
(54, 'PRES-2024-001', 11, '2024-12-13 19:45:58', '42400.00', 'emitido', '2024-12-13 22:45:58', '{\"estado\":\"Emitido\",\"numeroPresupuesto\":\"PRES-2024-001\",\"clienteId\":11,\"productos\":[{\"id\":4,\"nombre\":\"COLOCACIONES\",\"descripcion\":\"SISTEMAS\",\"cantidad\":1,\"precioUnitario\":10000,\"subtotal\":10000,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}},{\"id\":1734129826273,\"nombre\":\"Cortina ROLLER\",\"descripcion\":\"120cm x 120cm - Sunscreen 10% Ivory\",\"cantidad\":1,\"precioUnitario\":32400,\"subtotal\":32400,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}}],\"total\":42400}'),
(55, 'PRES-2024-001', 12, '2024-12-13 20:15:52', '52600.00', 'emitido', '2024-12-13 23:15:52', '{\"estado\":\"Emitido\",\"numeroPresupuesto\":\"PRES-2024-001\",\"clienteId\":12,\"productos\":[{\"id\":4,\"nombre\":\"COLOCACIONES\",\"descripcion\":\"SISTEMAS\",\"cantidad\":1,\"precioUnitario\":10000,\"subtotal\":10000,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}},{\"id\":1734131750766,\"nombre\":\"Cortina ROLLER\",\"descripcion\":\"220cm x 170cm - Blackout Premium White\",\"cantidad\":1,\"precioUnitario\":42600,\"subtotal\":42600,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}}],\"total\":52600}'),
(56, 'PRES-2024-001', 11, '2024-12-17 07:22:41', '29160.00', 'emitido', '2024-12-17 10:22:41', '{\"estado\":\"Emitido\",\"numeroPresupuesto\":\"PRES-2024-001\",\"clienteId\":11,\"productos\":[{\"id\":1734430913037,\"nombre\":\"Cortina ROLLER\",\"descripcion\":\"120cm x 120cm - Sunscreen 10% Ivory\",\"cantidad\":1,\"precioUnitario\":32400,\"subtotal\":32400,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}}],\"total\":29160}'),
(57, 'PRES-2024-001', 11, '2024-12-17 08:48:07', '30000.00', 'emitido', '2024-12-17 11:48:07', '{\"estado\":\"Emitido\",\"numeroPresupuesto\":\"PRES-2024-001\",\"clienteId\":11,\"productos\":[{\"id\":1734436084456,\"nombre\":\"Cortina ROLLER\",\"descripcion\":\"160cm x 120cm - Screen 5% White/Pearl\",\"cantidad\":1,\"precioUnitario\":30000,\"subtotal\":30000,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}}],\"total\":30000}'),
(59, 'PRES-2024-001', 18, '2024-12-23 10:38:01', '132450.00', 'emitido', '2024-12-23 13:38:01', '{\"estado\":\"Emitido\",\"numeroPresupuesto\":\"PRES-2024-001\",\"clienteId\":18,\"productos\":[{\"id\":25,\"nombre\":\"GASA BAMBOO\",\"descripcion\":\"\",\"cantidad\":3.8,\"precioUnitario\":16750,\"subtotal\":63650,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}},{\"id\":1734960866879,\"nombre\":\"Cortina ROLLER\",\"descripcion\":\"220cm x 220cm - Sunscreen 10% Grey\",\"cantidad\":1,\"precioUnitario\":68800,\"subtotal\":68800,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}}],\"total\":132450}'),
(60, 'PRES-2024-001', 19, '2024-12-23 16:45:14', '294120.00', 'emitido', '2024-12-23 19:45:14', '{\"estado\":\"Emitido\",\"numeroPresupuesto\":\"PRES-2024-001\",\"clienteId\":19,\"productos\":[{\"id\":14,\"nombre\":\"CAMINO\",\"descripcion\":\"50X250\",\"cantidad\":1,\"precioUnitario\":73000,\"subtotal\":73000,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}},{\"id\":1734983092156,\"nombre\":\"Cortina ROLLER\",\"descripcion\":\"240cm x 160cm - Sunscreen 10% Ivory\",\"cantidad\":3,\"precioUnitario\":74600,\"subtotal\":223800,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}},{\"id\":4,\"nombre\":\"COLOCACIONES\",\"descripcion\":\"SISTEMAS\",\"cantidad\":3,\"precioUnitario\":10000,\"subtotal\":30000,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}}],\"total\":294120}'),
(61, 'PRES-2025-001', 11, '2025-01-03 21:37:10', '39800.00', 'emitido', '2025-01-04 00:37:10', '{\"estado\":\"Emitido\",\"numeroPresupuesto\":\"PRES-2025-001\",\"clienteId\":11,\"productos\":[{\"id\":1735951015317,\"nombre\":\"Cortina Roller\",\"descripcion\":\"120cm x 120cm - \",\"cantidad\":1,\"precioUnitario\":39800,\"subtotal\":39800,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}}],\"total\":39800}'),
(62, 'PRES-2025-001', 11, '2025-01-16 10:56:10', '17460.00', 'emitido', '2025-01-16 13:56:10', '{\"estado\":\"Emitido\",\"numeroPresupuesto\":\"PRES-2025-001\",\"clienteId\":11,\"productos\":[{\"id\":1737034085790,\"nombre\":\"Cortina ROLLER\",\"descripcion\":\"120cm x 120cm - \",\"cantidad\":1,\"precioUnitario\":19400,\"subtotal\":19400,\"detalles\":{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}}],\"total\":17460}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `presupuesto_items`
--

CREATE TABLE `presupuesto_items` (
  `id` int(11) NOT NULL,
  `presupuesto_id` int(11) NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `detalles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalles`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `presupuesto_items`
--

INSERT INTO `presupuesto_items` (`id`, `presupuesto_id`, `producto_id`, `nombre`, `descripcion`, `cantidad`, `precio_unitario`, `subtotal`, `detalles`) VALUES
(11, 9, 14, 'CAMINO', '50X250', '1.00', '73000.00', '73000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(16, 12, 14, 'CAMINO', '50X250', '1.00', '73000.00', '73000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(50, 35, 4, 'COLOCACIONES', 'SISTEMAS', '1.00', '10000.00', '10000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(51, 36, 4, 'COLOCACIONES', 'SISTEMAS', '1.00', '10000.00', '10000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(69, 51, NULL, 'CAMINO', '50X250', '1.00', '73000.00', '73000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(70, 51, NULL, 'Cortina ROLLER', '220cm x 150cm - Sunscreen 10% Grey', '1.00', '37500.00', '37500.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(71, 52, NULL, 'CAMINO', '50X250', '1.00', '73000.00', '73000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(72, 52, NULL, 'Cortina ROLLER', '120cm x 220cm - Screen 5% White/Pearl', '1.00', '45000.00', '45000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(73, 53, NULL, 'Cortina ROLLER', '150cm x 220cm - Screen 3% Black/Grey', '1.00', '48300.00', '48300.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(74, 54, 4, 'COLOCACIONES', 'SISTEMAS', '1.00', '10000.00', '10000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(75, 54, NULL, 'Cortina ROLLER', '120cm x 120cm - Sunscreen 10% Ivory', '1.00', '32400.00', '32400.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(76, 55, 4, 'COLOCACIONES', 'SISTEMAS', '1.00', '10000.00', '10000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(77, 55, NULL, 'Cortina ROLLER', '220cm x 170cm - Blackout Premium White', '1.00', '42600.00', '42600.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(78, 56, NULL, 'Cortina ROLLER', '120cm x 120cm - Sunscreen 10% Ivory', '1.00', '32400.00', '32400.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(79, 57, NULL, 'Cortina ROLLER', '160cm x 120cm - Screen 5% White/Pearl', '1.00', '30000.00', '30000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(82, 59, NULL, 'GASA BAMBOO', '', '3.80', '16750.00', '63650.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(83, 59, NULL, 'Cortina ROLLER', '220cm x 220cm - Sunscreen 10% Grey', '1.00', '68800.00', '68800.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(84, 60, NULL, 'CAMINO', '50X250', '1.00', '73000.00', '73000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(85, 60, NULL, 'Cortina ROLLER', '240cm x 160cm - Sunscreen 10% Ivory', '3.00', '74600.00', '223800.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(86, 60, 4, 'COLOCACIONES', 'SISTEMAS', '3.00', '10000.00', '30000.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(87, 61, NULL, 'Cortina Roller', '120cm x 120cm - ', '1.00', '39800.00', '39800.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}'),
(88, 62, NULL, 'Cortina ROLLER', '120cm x 120cm - ', '1.00', '19400.00', '19400.00', '{\"sistema\":\"Roller\",\"detalle\":\"\",\"caidaPorDelante\":\"No\",\"colorSistema\":\"\",\"ladoComando\":\"\",\"tipoTela\":\"\",\"soporteIntermedio\":false,\"soporteDoble\":false}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id` int(11) NOT NULL,
  `nombreProducto` varchar(255) NOT NULL,
  `cantidad_stock` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precioCosto` varchar(255) DEFAULT NULL,
  `precio` varchar(8) NOT NULL DEFAULT '0',
  `divisa` varchar(255) DEFAULT NULL,
  `disponible` tinyint(4) NOT NULL,
  `descuento` int(11) DEFAULT NULL,
  `rubro_id` varchar(255) NOT NULL,
  `sistema_id` varchar(255) NOT NULL,
  `proveedor_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id`, `nombreProducto`, `cantidad_stock`, `descripcion`, `precioCosto`, `precio`, `divisa`, `disponible`, `descuento`, `rubro_id`, `sistema_id`, `proveedor_id`) VALUES
(1, 'TABLEADO', '', 'TRADICIONAL', '', '30000', 'ARS', 1, 0, '1', '10', 1),
(2, 'TABLEADO', '', 'CON ARGOLLAS', '', '35000', 'ARS', 1, 0, '1', '10', 1),
(3, 'TABLEADO', '', 'CON RIEL', '', '65000', 'ARS', 1, 0, '1', '10', 1),
(4, 'COLOCACIONES', '', 'SISTEMAS', '', '10000', 'ARS', 1, 0, '2', '10', 1),
(5, 'ARREGLOS', '', 'FLEXCOLOR', '', '60000', 'ARS', 1, 0, '3', '9', 2),
(6, 'ALFOMBRA', '', '60X90', '', '40000', 'ARS', 1, 0, '7', '9', 7),
(7, 'ALFOMBRA', '', '120X150', '', '110000', 'ARS', 1, 0, '7', '9', 7),
(8, 'ALFOMBRA', '', '150X150', '', '150000', 'ARS', 1, 0, '7', '9', 7),
(10, 'ALFOMBRA', '', '150X200', '', '220000', 'ARS', 1, 0, '7', '9', 7),
(11, 'MULLIDON', '', 'SIN DESCRIPCION', '', '73000', 'ARS', 1, 0, '7', '9', 7),
(12, 'MANTAS', '', '160X190', '', '37000', 'ARS', 1, 0, '7', '9', 7),
(13, 'MANTAS', '', '190X250', '', '56000', 'ARS', 1, 0, '7', '9', 7),
(14, 'CAMINO', '', '50X250', '', '73000', 'ARS', 1, 0, '7', '9', 7),
(15, 'GEOMETRICO', '', '95X155', '', '73000', 'ARS', 1, 0, '7', '9', 7),
(16, 'BLACK OUT', '', '280 CM', '', '32000', 'ARS', 1, 0, '4', '9', 4),
(17, 'BLACK OUT', '', 'DOBLE', '', '15000', 'ARS', 1, 0, '4', '9', 4),
(18, 'BLACK OUT', '', 'LISO', '', '10700', 'ARS', 1, 0, '4', '9', 4),
(19, 'BLACK OUT', '', 'SIMPLE', '', '18500', 'ARS', 1, 0, '4', '9', 4),
(20, 'BLACK OUT', '', 'TRAMADO', '', '18500', 'ARS', 1, 0, '4', '9', 4),
(21, 'BLACK OUT', '', 'SUPER 280 CM', '', '20000', 'ARS', 1, 0, '4', '9', 4),
(22, 'CHENIL', '', '', '', '31060', 'ARS', 1, 0, '4', '9', 3),
(23, 'ETAMINA RÚSTICA', '', '', '', '15760', 'ARS', 1, 0, '4', '9', 3),
(24, 'GASA ARRUGADA PORTOBELLO', '', '', '', '14440', 'ARS', 1, 0, '4', '9', 3),
(25, 'GASA BAMBOO', '', '', '', '16750', 'ARS', 1, 0, '4', '9', 3),
(26, 'GASA BATISTA WASH', '', '', '', '14080', 'ARS', 1, 0, '4', '9', 3),
(27, 'GASA CRASH', '', '', '', '16000', 'ARS', 1, 0, '4', '9', 3),
(28, 'GASA DE LINO PORTOBELLO', '', '', '', '14360', 'ARS', 1, 0, '4', '9', 3),
(29, 'GASA DE ALGODÓN ARRUGADA', '', '', '', '19240', 'ARS', 1, 0, '4', '9', 3),
(30, 'GASA LANIN', '', '', '', '13000', 'ARS', 1, 0, '4', '9', 3),
(31, 'GASA TRAFUL', '', '', '', '13000', 'ARS', 1, 0, '4', '9', 3),
(32, 'LINO BELGA', '', '', '', '16300', 'ARS', 1, 0, '4', '9', 3),
(33, 'LINO RÚSTICO', '', '', '', '19160', 'ARS', 1, 0, '4', '9', 3),
(34, 'LINO RÚSTICO VARESE', '', '', '', '18560', 'ARS', 1, 0, '4', '9', 3),
(35, 'MADRAZ', '', '', '', '18110', 'ARS', 1, 0, '4', '9', 3),
(36, 'MADRAZ LOMBARDÍA', '', '', '', '18520', 'ARS', 1, 0, '4', '9', 3),
(37, 'PANAMÁ LIVIANO', '', '', '', '16130', 'ARS', 1, 0, '4', '9', 3),
(38, 'PANAMÁ RAYADO', '', '', '', '19000', 'ARS', 1, 0, '4', '9', 3),
(39, 'PANAMÁ LINO', '', '', '', '17910', 'ARS', 1, 0, '4', '9', 3),
(40, 'RAFIA LIVIANA', '', '', '', '19190', 'ARS', 1, 0, '4', '9', 3),
(41, 'RAFIA FANTASÍA', '', '', '', '18740', 'ARS', 1, 0, '4', '9', 3),
(42, 'TUSOR', '', '', '', '18190', 'ARS', 1, 0, '4', '9', 3),
(43, 'VOILE', '', 'BERTOLOTO', '', '11220', 'ARS', 1, 0, '4', '9', 3),
(44, 'VOILE CARNAVAL', '', '', '', '13740', 'ARS', 1, 0, '4', '9', 3),
(45, 'VOILE CRASH', '', '', '', '18200', 'ARS', 1, 0, '4', '9', 3),
(46, 'VOILE CRASH FANTASÍA', '', '', '', '19920', 'ARS', 1, 0, '4', '9', 3),
(47, 'VOILE SIMPLE', '', '', '', '21290', 'ARS', 1, 0, '4', '9', 3),
(48, 'VOILE BOUCLE', '', '', '', '12910', 'ARS', 1, 0, '4', '9', 3),
(49, 'VOILE BOUCLE MAGGIORE', '', '', '', '20370', 'ARS', 1, 0, '4', '9', 3),
(50, 'VOILE CINTA ALESSANDRINA', '', '', '', '12960', 'ARS', 1, 0, '4', '9', 3),
(51, 'VOILE DE HILO', '', '', '', '13360', 'ARS', 1, 0, '4', '9', 3),
(52, 'VOILE DE HILO CAMPAGNA', '', '', '', '14260', 'ARS', 1, 0, '4', '9', 3),
(53, 'VOILE DE HILO IMOLA', '', '', '', '14670', 'ARS', 1, 0, '4', '9', 3),
(54, 'VOILE DE HILO MATIZADO', '', '', '', '14440', 'ARS', 1, 0, '4', '9', 3),
(55, 'VOILE DE HILO MODENA', '', '', '', '13230', 'ARS', 1, 0, '4', '9', 3),
(56, 'VOILE DE HILO SABOYA', '', '', '', '14240', 'ARS', 1, 0, '4', '9', 3),
(57, 'VOILE DE LINO', '', '', '', '16130', 'ARS', 1, 0, '4', '9', 3),
(58, 'VOILE ESPECIAL', '', '', '', '10420', 'ARS', 1, 0, '4', '9', 3),
(59, 'VOILE FANTASÍA BARI', '', '', '', '13890', 'ARS', 1, 0, '4', '9', 3),
(60, 'VOILE FANTASÍA ESCOCÉS', '', '', '', '13880', 'ARS', 1, 0, '4', '9', 3),
(61, 'VOILE GRANITE', '', '', '', '13880', 'ARS', 1, 0, '4', '9', 3),
(62, 'VOILE GRANITE PRATO', '', '', '', '14760', 'ARS', 1, 0, '4', '9', 3),
(63, 'VOILE LORSON', '', '', '', '11790', 'ARS', 1, 0, '4', '9', 3),
(64, 'VOILE MUSSELINA', '', '', '', '11480', 'ARS', 1, 0, '4', '9', 3),
(65, 'VOILE RÚSTICO', '', '', '', '14080', 'ARS', 1, 0, '4', '9', 3),
(66, 'VOILE RÚSTIGO PERUGGIAN', '', '', '', '17670', 'ARS', 1, 0, '4', '9', 3),
(67, 'VOILE RÚSTICO ALESIO', '', '', '', '17810', 'ARS', 1, 0, '4', '9', 3),
(68, 'VOILE ESTREGA', '', '', '', '14840', 'ARS', 1, 0, '4', '9', 3),
(69, 'VOILE TRIPLE', '', '', '', '12910', 'ARS', 1, 0, '4', '9', 3),
(70, 'VOILE TRIPLE BOUCLE', '', '', '', '12910', 'ARS', 1, 0, '4', '9', 3),
(71, 'VOILE SUIZO', '', '', '', '12910', 'ARS', 1, 0, '4', '9', 3),
(72, 'VOILE ABRIL', '', '', '', '14700', 'ARS', 1, 0, '4', '9', 3),
(73, 'BLACK OUT VINÍLICO', '', '180 y 240 CM', '', '37120', 'ARS', 1, 0, '4', '1', 2),
(74, 'BLACK OUT VINÍLICO', '', '300 CM', '', '43000', 'ARS', 1, 0, '4', '1', 2),
(75, 'BLACK OUT ANCONA', '', '', '', '89220', 'ARS', 1, 0, '4', '1', 2),
(76, 'BLACK OUT APOLLO', '', '', '', '90640', 'ARS', 1, 0, '4', '1', 2),
(77, 'BLACK OUT DAKU', '', '', '', '80720', 'ARS', 1, 0, '4', '1', 2),
(78, 'BLACK OUT DIONE', '', '', '', '51130', 'ARS', 1, 0, '4', '1', 2),
(79, 'BLACK OUT DUBLIN', '', '', '', '60950', 'ARS', 1, 0, '4', '1', 2),
(80, 'BLACK OUT FRACTAL', '', '', '', '80620', 'ARS', 1, 0, '4', '1', 2),
(81, 'BLACK OUT LINEN', '', '', '', '79170', 'ARS', 1, 0, '4', '1', 2),
(82, 'BLACK OUT LINO', '', '', '', '80220', 'ARS', 1, 0, '4', '1', 2),
(83, 'BLACK OUT MATTIZ', '', '', '', '59030', 'ARS', 1, 0, '4', '1', 2),
(84, 'BLACK OUT ONIX', '', '', '', '61760', 'ARS', 1, 0, '4', '1', 2),
(85, 'BLACK OUT SINGULAR', '', '', '', '74740', 'ARS', 1, 0, '4', '1', 2),
(86, 'SCREEN 0,5%', '', '', '', '72910', 'ARS', 1, 0, '4', '1', 2),
(87, 'SCREEN 3%', '', '250 CM', '', '63120', 'ARS', 1, 0, '4', '1', 2),
(88, 'SCREEN 3%', '', '300 CM', '', '67140', 'ARS', 1, 0, '4', '1', 2),
(89, 'SCREEN 314', '', '', '', '77100', 'ARS', 1, 0, '4', '1', 2),
(90, 'SCREEN 351', '', '1%', '', '67050', 'ARS', 1, 0, '4', '1', 2),
(91, 'SCREEN 405', '', '5%', '', '96580', 'ARS', 1, 0, '4', '1', 2),
(92, 'SCREEN BARACOA', '', '', '', '68270', 'ARS', 1, 0, '4', '1', 2),
(93, 'SCREEN BALI', '', '', '', '77100', 'ARS', 1, 0, '4', '1', 2),
(94, 'SCREEN BRICK', '', '', '', '75990', 'ARS', 1, 0, '4', '1', 2),
(95, 'SCREEN CALCIO', '', '', '', '81720', 'ARS', 1, 0, '4', '1', 2),
(96, 'SCREEN CINA', '', '', '', '36630', 'ARS', 1, 0, '4', '1', 2),
(97, 'SCREEN LOA', '', '', '', '76710', 'ARS', 1, 0, '4', '1', 2),
(98, 'SCREEN LUMINIUM', '', '5%', '', '99300', 'ARS', 1, 0, '4', '1', 2),
(99, 'SCREEN PLOT', '', '8%', '', '80620', 'ARS', 1, 0, '4', '1', 2),
(100, 'SCREEN SLIM 5%', '', '250 CM', '', '54710', 'ARS', 1, 0, '4', '1', 2),
(101, 'SCREEN SLIM 5%', '', '300 CM', '', '64030', 'ARS', 1, 0, '4', '1', 2),
(102, 'SCREEN SOLAR 5%', '', '250 CM', '', '57150', 'ARS', 1, 0, '4', '1', 2),
(103, 'SCREEN SOLAR 5%', '', '300 CM', '', '66940', 'ARS', 1, 0, '4', '1', 2),
(104, 'SCREEN VISION 365', '', '5%', '', '43250', 'ARS', 1, 0, '4', '1', 2),
(105, 'SCREEN AMBAR', '', '', '', '63120', 'ARS', 1, 0, '4', '1', 2),
(106, 'SCREEN BARU', '', '', '', '65390', 'ARS', 1, 0, '4', '1', 2),
(107, 'TELA DUBLIN', '', '', '', '47030', 'ARS', 1, 0, '4', '1', 2),
(108, 'TELA KENYA', '', '', '', '35430', 'ARS', 1, 0, '4', '1', 2),
(109, 'TELA KUBIK', '', '', '', '32940', 'ARS', 1, 0, '4', '1', 2),
(110, 'TELA LINEN', '', '', '', '52010', 'ARS', 1, 0, '4', '1', 2),
(111, 'TELA LINO', '', '', '', '57750', 'ARS', 1, 0, '4', '1', 2),
(112, 'TELA MATTIZ', '', '', '', '40950', 'ARS', 1, 0, '4', '1', 2),
(113, 'TELA MERIDA', '', '', '', '86180', 'ARS', 1, 0, '4', '1', 2),
(114, 'TELA MISTRAL', '', '', '', '53600', 'ARS', 1, 0, '4', '1', 2),
(115, 'TELA MONET', '', '', '', '29600', 'ARS', 1, 0, '4', '1', 2),
(116, 'TELA NAZCA', '', '', '', '92900', 'ARS', 1, 0, '4', '1', 2),
(117, 'TELA PORTO', '', '', '', '50240', 'ARS', 1, 0, '4', '1', 2),
(118, 'TELA ROME', '', '', '', '54740', 'ARS', 1, 0, '4', '1', 2),
(119, 'TELA SPRING', '', '', '', '35510', 'ARS', 1, 0, '4', '1', 2),
(120, 'TELA VERDANA', '', '', '', '32940', 'ARS', 1, 0, '4', '1', 2),
(121, 'TELA ATRIO', '', '', '', '68220', 'ARS', 1, 0, '4', '1', 2),
(122, 'TELA BORROCO', '', '', '', '39310', 'ARS', 1, 0, '4', '1', 2),
(123, 'TELA BRICK', '', '', '', '75990', 'ARS', 1, 0, '4', '1', 2),
(124, 'TELA CAIRO', '', '', '', '46670', 'ARS', 1, 0, '4', '1', 2),
(125, 'TELA CINA', '', '', '', '36630', 'ARS', 1, 0, '4', '1', 2),
(126, 'TELA COZUMEL', '', '', '', '47030', 'ARS', 1, 0, '4', '1', 2),
(127, 'TELA FOREST', '', '', '', '85180', 'ARS', 1, 0, '4', '1', 2),
(128, 'TELA LOA', '', '', '', '76710', 'ARS', 1, 0, '4', '1', 2),
(129, 'TELA LUNE', '', '', '', '81860', 'ARS', 1, 0, '4', '1', 2),
(130, 'TELA MALAGA', '', '', '', '43330', 'ARS', 1, 0, '4', '1', 2),
(131, 'TELA SPIDER', '', '', '', '64830', 'ARS', 1, 0, '4', '1', 2),
(132, 'TELA TAIPEI', '', '', '', '77560', 'ARS', 1, 0, '4', '1', 2),
(133, 'TELA TREE DUBLE', '', '', '', '68150', 'ARS', 1, 0, '4', '1', 2),
(134, 'TELA TROPICAL', '', '', '', '134360', 'ARS', 1, 0, '4', '1', 2),
(135, 'CABEZAL 15/32 C PLÁSTICA', '', 'SÓCALO GOTA', '', '35570', 'ARS', 1, 0, '8', '1', 2),
(136, 'CABEZAL 15/32 C METÁLICA', '', 'SÓCALO GOTA', '', '38150', 'ARS', 1, 0, '8', '1', 2),
(137, 'CABEZAL 15/38 C PLÁSTICA', '', 'SÓCALO GOTA', '', '38870', 'ARS', 1, 0, '8', '1', 2),
(138, 'CABEZAL 15/38 C METÁLICA', '', 'SÓCALO GOTA', '', '42620', 'ARS', 1, 0, '8', '1', 2),
(139, 'CABEZAL 20/45 C PLÁSTICA', '', 'SÓCALO GOTA', '', '42820', 'ARS', 1, 0, '8', '1', 2),
(140, 'CABEZAL 20/45 C METÁLICA', '', 'SÓCALO GOTA', '', '49750', 'ARS', 1, 0, '8', '1', 2),
(141, 'CABEZAL 30/55 C PLÁSTICA', '', 'SÓCALO GOTA', '', '64680', 'ARS', 1, 0, '8', '1', 2),
(142, 'CABEZAL 30/55 C METÁLICA', '', 'SÓCALO GOTA', '', '67970', 'ARS', 1, 0, '8', '1', 2),
(143, 'CABEZAL 40/63 C PLÁSTICA', '', 'SÓCALO GOTA', '', '70930', 'ARS', 1, 0, '8', '1', 2),
(144, 'CABEZAL 15/38 C PLÁSTICA', '', 'SÓCALO SLIM', '', '40400', 'ARS', 1, 0, '8', '1', 2),
(145, 'CABEZAL 15/38 C METÁLICA', '', 'SÓCALO SLIM', '', '43570', 'ARS', 1, 0, '8', '1', 2),
(146, 'CABEZAL 20/45 C PLÁSTICA', '', 'SÓCALO SLIM', '', '52190', 'ARS', 1, 0, '8', '1', 2),
(147, 'CABEZAL 20/45 C METÁLICA', '', 'SÓCALO SLIM', '', '59120', 'ARS', 1, 0, '8', '1', 2),
(148, 'SOPORTE CORTO/INTERMEDIO', '', '', '', '5680', 'ARS', 1, 0, '8', '1', 2),
(149, 'SOPORTE LARGO/INTERMEDIO', '', '', '', '9460', 'ARS', 1, 0, '8', '1', 2),
(150, 'SOPORTE DOBLE', '', 'PAR', '', '27410', 'ARS', 1, 0, '8', '1', 2),
(151, 'GUÍA LATERAL', '', 'BLANCA/NEGRA', '', '48490', 'ARS', 1, 0, '8', '1', 2),
(152, 'TUBO 38', '', '', '', '29500', 'ARS', 1, 0, '8', '1', 2),
(153, 'SÓCALO GOTA', '', '', '', '9030', 'ARS', 1, 0, '8', '1', 2),
(154, 'SÓCALO SLIM', '', '', '', '10960', 'ARS', 1, 0, '8', '1', 2),
(155, 'CADENA PLÁSTICA', '', '', '', '2860', 'ARS', 1, 0, '8', '1', 2),
(156, 'CADENA METÁLICA', '', '', '', '6400', 'ARS', 1, 0, '8', '1', 2),
(157, 'PESO CADENA', '', '', '', '3480', 'ARS', 1, 0, '8', '1', 2),
(158, 'COMANDO VTX 15', '', '', '', '35000', 'ARS', 1, 0, '8', '1', 2),
(159, 'COMANDO VTX 20', '', '', '', '42000', 'ARS', 1, 0, '8', '1', 2),
(160, 'COMANDO VTX 30', '', '', '', '64000', 'ARS', 1, 0, '8', '1', 2),
(161, 'COMANDO VTX 40', '', '', '', '70000', 'ARS', 1, 0, '8', '1', 2),
(162, 'PUNTERO', '', '', '', '5480', 'ARS', 1, 0, '8', '1', 2),
(163, 'UNIÓN', '', '', '', '800', 'ARS', 1, 0, '8', '1', 2),
(164, 'TOPE', '', '', '', '800', 'ARS', 1, 0, '8', '1', 2),
(165, 'CENEFA', '', 'ROLLER Y BV', '', '52680', 'ARS', 1, 0, '8', '1', 2),
(166, 'SISTEMA FIT', '', '', '', '155170', 'ARS', 1, 0, '8', '3', 2),
(167, 'VENECIANA DE ALUMINIO', '', '', '', '70760', 'ARS', 1, 0, '8', '4', 2),
(168, 'VENECIANA DE ALUMINIO', '', 'PERFORADO', '', '82040', 'ARS', 1, 0, '8', '4', 2),
(169, 'VENECIANA DE MADERA', '', 'HILO', '', '240630', 'ARS', 1, 0, '8', '4', 2),
(170, 'VENECIANA DE MADERA', '', 'CINTA', '', '240630', 'ARS', 1, 0, '8', '4', 2),
(171, 'SISTEMA BANDAR VERTICAL', '', 'CABEZAL', '', '55580', 'ARS', 1, 0, '8', '5', 2),
(172, 'CADENA CON CLIP', '', '', '', '6000', 'ARS', 1, 0, '8', '5', 2),
(173, 'PERCHAS', '', '', '', '3000', 'ARS', 1, 0, '8', '5', 2),
(174, 'PESO CADENA GRANDE', '', '', '', '6000', 'ARS', 1, 0, '8', '5', 2),
(175, 'SCREEN 450', '', '', '', '64730', 'ARS', 1, 0, '8', '5', 2),
(176, 'SCREEN 365', '', '', '', '49710', 'ARS', 1, 0, '8', '5', 2),
(178, 'SCREEN BALI', '', '', '', '64730', 'ARS', 1, 0, '8', '5', 2),
(179, 'BLACK OUT ÓPALO', '', '', '', '40660', 'ARS', 1, 0, '8', '5', 2),
(180, 'CALGARY', '', '', '', '40320', 'ARS', 1, 0, '8', '5', 2),
(181, 'TELA ARIA', '', '', '', '57720', 'ARS', 1, 0, '8', '5', 2),
(182, 'TELA BOUCLE', '', '', '', '61510', 'ARS', 1, 0, '8', '5', 2),
(183, 'TELA MATTIZ', '', '', '', '33910', 'ARS', 1, 0, '8', '5', 2),
(184, 'BLACK OUT MATTIZ', '', '', '', '50720', 'ARS', 1, 0, '8', '5', 2),
(185, 'TELA SCRABBLE', '', '', '', '48050', 'ARS', 1, 0, '8', '5', 2),
(186, 'TELA DUBLIN', '', '', '', '42720', 'ARS', 1, 0, '8', '5', 2),
(187, 'SCREEN SLIM', '', '', '', '44460', 'ARS', 1, 0, '8', '5', 2),
(188, 'TELA VERDANA', '', '', '', '40320', 'ARS', 1, 0, '8', '5', 2),
(189, 'SISTEMA DUBAI', '', 'CON CENEFA', '', '58960', 'ARS', 1, 0, '8', '6', 2),
(190, 'SISTEMA DUBAI', '', 'SIN CENEFA', '', '47250', 'ARS', 1, 0, '8', '6', 2),
(191, 'TELA ZAFIRO', '', '', '', '70620', 'ARS', 1, 0, '8', '6', 2),
(192, 'TELA PEACOCK', '', '', '', '94650', 'ARS', 1, 0, '8', '6', 2),
(193, 'TELA WOODGRAIN', '', '', '', '120500', 'ARS', 1, 0, '8', '6', 2),
(194, 'TELA BERLIN', '', '', '', '89480', 'ARS', 1, 0, '8', '6', 2),
(195, 'TELA INTI', '', '', '', '88410', 'ARS', 1, 0, '8', '6', 2),
(196, 'TELA SHINE', '', '', '', '105260', 'ARS', 1, 0, '8', '6', 2),
(197, 'TELA MARROC', '', '', '', '121610', 'ARS', 1, 0, '8', '6', 2),
(198, 'TELA MILO', '', '', '', '121070', 'ARS', 1, 0, '8', '6', 2),
(199, 'TELA NEPAL', '', '', '', '114560', 'ARS', 1, 0, '8', '6', 2),
(200, 'TELA MAUI', '', '', '', '108660', 'ARS', 1, 0, '8', '6', 2),
(201, 'TELA GLAM', '', '', '', '97810', 'ARS', 1, 0, '8', '6', 2),
(202, 'TELA SOFIA', '', '', '', '132160', 'ARS', 1, 0, '8', '6', 2),
(203, 'TELA SUNDOWN', '', '', '', '126010', 'ARS', 1, 0, '8', '6', 2),
(204, 'TELA ECLIPSE', '', '', '', '145370', 'ARS', 1, 0, '8', '6', 2),
(205, 'SISTEMA DUNES RIEL', '', 'CON BASTÓN', '', '37940', 'ARS', 1, 0, '8', '7', 2),
(206, 'SISTEMA DUNES RIEL', '', 'CADENA Y CORDÓN', '', '63550', 'ARS', 1, 0, '8', '7', 2),
(207, 'TELA AURORA', '', 'BEIGE, SMOKE, WHITE', '', '77380', 'ARS', 1, 0, '8', '7', 2),
(208, 'RIEL EUROPEO 1,60', '', '', '', '47160', 'ARS', 1, 0, '5', '9', 6),
(209, 'RIEL EUROPEO 1,80', '', '', '', '53170', 'ARS', 1, 0, '5', '9', 6),
(210, 'RIEL EUROPEO 2,00', '', '', '', '58950', 'ARS', 1, 0, '5', '9', 6),
(211, 'RIEL EUROPEO 2,20', '', '', '', '64950', 'ARS', 1, 0, '5', '9', 6),
(212, 'RIEL EUROPEO 2,40', '', '', '', '70730', 'ARS', 1, 0, '5', '9', 6),
(213, 'RIEL EUROPEO 2,60', '', '', '', '76530', 'ARS', 1, 0, '5', '9', 6),
(214, 'RIEL EUROPEO 2,80', '', '', '', '82520', 'ARS', 1, 0, '5', '9', 6),
(215, 'RIEL EUROPEO 3,00', '', '', '', '88520', 'ARS', 1, 0, '5', '9', 6),
(216, 'RIEL EUROPEO 3,20', '', '', '', '94310', 'ARS', 1, 0, '5', '9', 6),
(217, 'RIEL EUROPEO 3,40', '', '', '', '100300', 'ARS', 1, 0, '5', '9', 6),
(218, 'RIEL EUROPEO 3,60', '', '', '', '106090', 'ARS', 1, 0, '5', '9', 6),
(219, 'RIEL EUROPEO 3,80', '', '', '', '112110', 'ARS', 1, 0, '5', '9', 6),
(220, 'RIEL EUROPEO 4,00', '', '', '', '117880', 'ARS', 1, 0, '5', '9', 6),
(221, 'RIEL EUROPEO 4,40', '', '', '', '129680', 'ARS', 1, 0, '5', '9', 6),
(222, 'ÁNGULO CORTO', '', '', '', '4310', 'ARS', 1, 0, '5', '9', 6),
(223, 'ÁNGULO LARGO', '', '', '', '5380', 'ARS', 1, 0, '5', '9', 6),
(224, 'CORREDERA', '', '', '', '880', 'ARS', 1, 0, '5', '9', 6),
(225, 'JUEGO DE CRUCES', '', '', '', '9240', 'ARS', 1, 0, '5', '9', 6),
(226, 'GANCHO BRONCEADO', '', '10 UNIDADES', '', '2500', 'ARS', 1, 0, '5', '9', 6),
(227, 'SOPORTE VISILLO', '', 'PAR', '', '4100', 'ARS', 1, 0, '5', '9', 6),
(228, 'TERMINAL ', '', '', '', '4100', 'ARS', 1, 0, '5', '9', 6),
(229, 'VARILLA PARA VISILLO', '', '', '', '7960', 'ARS', 1, 0, '5', '9', 6),
(230, 'ÁNGULO CORTO REFORZADO', '', '9,5 CM', '', '9660', 'ARS', 1, 0, '5', '9', 6),
(231, 'ÁNGULO LARGO REFORZADO', '', '15 CM', '', '10520', 'ARS', 1, 0, '5', '9', 6),
(232, 'BASTÓN 65 CM', '', '', '', '7310', 'ARS', 1, 0, '5', '9', 6),
(233, 'BASTÓN 110 CM', '', '', '', '11190', 'ARS', 1, 0, '5', '9', 6),
(234, 'BASTÓN 150 CM', '', '', '', '13050', 'ARS', 1, 0, '5', '9', 6),
(235, 'BARRAL 16 MM', '', '', '', '17460', 'ARS', 1, 0, '6', '9', 5),
(236, 'TERMINAL LIZ/HOJA/GAJO/PIÑA', '', '16 MM', '', '18630', 'ARS', 1, 0, '6', '9', 5),
(237, 'TERMINAL SOL/GIRASOL/FLECHA', '', '16 MM', '', '18630', 'ARS', 1, 0, '6', '9', 5),
(238, 'TERMINAL RULO/DALIA/CAPRI/FIRENZE', '', '16 MM', '', '18630', 'ARS', 1, 0, '6', '9', 5),
(239, 'TERMINAL ROMA CHICO', '', '16 MM', '', '14190', 'ARS', 1, 0, '6', '9', 5),
(240, 'TERMINAL COLISEO', '', '16 MM', '', '18880', 'ARS', 1, 0, '6', '9', 5),
(241, 'TERMINAL TORRE/CIEGO', '', '16 MM', '', '2910', 'ARS', 1, 0, '6', '9', 5),
(242, 'SOPORTE ESCUADRA CORTO', '', '16 MM', '', '5200', 'ARS', 1, 0, '6', '9', 5),
(243, 'SOPORTE ESCUADRA LARGO', '', '16 MM', '', '5530', 'ARS', 1, 0, '6', '9', 5),
(244, 'SOPORTE ESCUADRA DOBLE', '', '16 MM', '', '10100', 'ARS', 1, 0, '6', '9', 5),
(245, 'SOPORTE LATERAL ABIERTO', '', '16 MM', '', '5800', 'ARS', 1, 0, '6', '9', 5),
(246, 'SOPORTE LATERAL CERRADO', '', '16 MM', '', '5800', 'ARS', 1, 0, '6', '9', 5),
(247, 'ARGOLLAS', '', '16 MM', '', '1460', 'ARS', 1, 0, '6', '9', 5),
(248, 'BARRAL 22 MM', '', '', '', '19960', 'ARS', 1, 0, '6', '9', 5),
(249, 'TERMINAL LIZ/HOJA/GAJO/PIÑA', '', '22 MM', '', '18630', 'ARS', 1, 0, '6', '9', 5),
(250, 'TERMINAL SOL/GIRASOL/FLECHA', '', '22 MM', '', '18630', 'ARS', 1, 0, '6', '9', 5),
(251, 'TERMINAL RULO/DALIA/CAPRI/FIRENZE', '', '22 MM', '', '18630', 'ARS', 1, 0, '6', '9', 5),
(252, 'TERMINAL ROMA CHICO', '', '22 MM', '', '28050', 'ARS', 1, 0, '6', '9', 5),
(253, 'TERMINAL COLISEO', '', '22 MM', '', '24620', 'ARS', 1, 0, '6', '9', 5),
(254, 'TERMINAL TORRE/CIEGO', '', '22 MM', '', '4440', 'ARS', 1, 0, '6', '9', 5),
(255, 'SOPORTE ESCUADRA CORTO', '', '22 MM', '', '5200', 'ARS', 1, 0, '6', '9', 5),
(256, 'SOPORTE ESCUADRA LARGO', '', '22 MM', '', '5530', 'ARS', 1, 0, '6', '9', 5),
(257, 'SOPORTE ESCUADRA DOBLE', '', '22 MM', '', '10100', 'ARS', 1, 0, '6', '9', 5),
(258, 'SOPORTE LATERAL ABIERTO', '', '22 MM', '', '5800', 'ARS', 1, 0, '6', '9', 5),
(259, 'SOPORTE LATERAL CERRADO', '', '22 MM', '', '5800', 'ARS', 1, 0, '6', '9', 5),
(260, 'ARGOLLAS', '', '22 MM', '', '2140', 'ARS', 1, 0, '6', '9', 5),
(261, 'BARRAL 25 MM', '', '', '', '20510', 'ARS', 1, 0, '6', '9', 5),
(262, 'TERMINAL LIZ/HOJA/GAJO/PIÑA', '', '25 MM', '', '18900', 'ARS', 1, 0, '6', '9', 5),
(263, 'TERMINAL SOL/GIRASOL/FLECHA', '', '25 MM', '', '18900', 'ARS', 1, 0, '6', '9', 5),
(264, 'TERMINAL RULO/DALIA/CAPRI/FIRENZE', '', '25 MM', '', '18900', 'ARS', 1, 0, '6', '9', 5),
(265, 'TERMINAL ROMA CHICO', '', '25 MM', '', '25630', 'ARS', 1, 0, '6', '9', 5),
(266, 'TERMINAL COLISEO', '', '25 MM', '', '30510', 'ARS', 1, 0, '6', '9', 5),
(267, 'TERMINAL TORRE/CIEGO', '', '25 MM', '', '4560', 'ARS', 1, 0, '6', '9', 5),
(268, 'SOPORTE ESCUADRA CORTO', '', '25 MM', '', '5430', 'ARS', 1, 0, '6', '9', 5),
(269, 'SOPORTE ESCUADRA LARGO', '', '25 MM', '', '5630', 'ARS', 1, 0, '6', '9', 5),
(270, 'SOPORTE ESCUADRA DOBLE', '', '25 MM', '', '10990', 'ARS', 1, 0, '6', '9', 5),
(271, 'SOPORTE LATERAL ABIERTO', '', '25 MM', '', '6380', 'ARS', 1, 0, '6', '9', 5),
(272, 'SOPORTE LATERAL CERRADO', '', '25 MM', '', '6380', 'ARS', 1, 0, '6', '9', 5),
(273, 'ARGOLLAS', '', '25 MM', '', '2220', 'ARS', 1, 0, '6', '9', 5),
(274, 'SISTEMA ROMANO', '', '', '', '82340', 'ARS', 1, 0, '8', '8', 2),
(275, 'PANEL ORIENTAL 3 VÍAS CON BASTÓN', '', '', '', '47860', 'ARS', 1, 0, '8', '2', 2),
(276, 'PANEL ORIENTAL 3 VÍAS CON CORDÓN', '', '', '', '43220', 'ARS', 1, 0, '8', '2', 2),
(277, 'PANEL ORIENTAL 3 VÍAS LIBRES', '', '', '', '42780', 'ARS', 1, 0, '8', '2', 2),
(278, 'PANEL ORIENTAL 4 VÍAS CON BASTÓN', '', '', '', '55960', 'ARS', 1, 0, '8', '2', 2),
(279, 'PANEL ORIENTAL 4 VÍAS CON CORDÓN', '', '', '', '58010', 'ARS', 1, 0, '8', '2', 2),
(280, 'PANEL ORIENTAL 4 VÍAS LIBRES', '', '', '', '44300', 'ARS', 1, 0, '8', '2', 2),
(281, 'PANEL ORIENTAL 5 VÍAS CON BASTÓN', '', '', '', '66030', 'ARS', 1, 0, '8', '2', 2),
(282, 'PANEL ORIENTAL 5 VÍAS CON CORDÓN', '', '', '', '68180', 'ARS', 1, 0, '8', '2', 2),
(283, 'PANEL ORIENTAL 5 VÍAS LIBRES', '', '', '', '57910', 'ARS', 1, 0, '8', '2', 2),
(284, 'Prueba1', '', '', '', '200', 'ARS', 0, 0, '', '', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombreProveedores` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombreProveedores`) VALUES
(1, 'CORTINOVA'),
(2, 'FLEXCOLOR'),
(3, 'SHEFA'),
(4, 'BLACK OUT'),
(5, 'BARRALES Y ACCESORIOS'),
(6, 'ONETTO'),
(7, 'ALFOMBRAS'),
(8, 'OTROS');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rubros`
--

CREATE TABLE `rubros` (
  `id` int(11) NOT NULL,
  `nombreRubros` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rubros`
--

INSERT INTO `rubros` (`id`, `nombreRubros`) VALUES
(7, 'ALFOMBRAS'),
(3, 'ARREGLOS'),
(6, 'BARRALES'),
(2, 'COLOCACIONES'),
(1, 'CONFECCIONES'),
(8, 'FLEXCOLOR'),
(5, 'RIELES'),
(4, 'TELAS');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sistemas`
--

CREATE TABLE `sistemas` (
  `id` int(11) NOT NULL,
  `nombreSistemas` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sistemas`
--

INSERT INTO `sistemas` (`id`, `nombreSistemas`) VALUES
(5, 'BARCELONA - BANDAS VERTICALES'),
(6, 'DUBAI'),
(7, 'DUNES'),
(3, 'FIT'),
(9, 'OTROS'),
(2, 'PANELES'),
(10, 'PROPIOS'),
(1, 'ROLLER'),
(8, 'ROMANAS'),
(4, 'VENECIANAS');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `nivel_usuario` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `created_at`, `nivel_usuario`) VALUES
(6, 'administracion@cortinovaok.com', '$2b$10$m1.6bJzbzymjneD1BePUz..0r0/S2Qvhu3AzvmVAvU31YZuetB58y', '2024-11-20 23:54:53.559980', 2),
(7, 'ventas@cortinovaok.com', '$2b$10$6yJx11zpMG.YOpfdgZwv8euOciTAd1FN6jdoKn1Hc3H4XZHsmh2TG', '2024-11-20 23:55:45.942685', 1),
(8, 'ftadeo@cortinovaok.com', '$2b$10$iSmXj84XEEJCvqZWHKKJTe3gtua9FMNGqNiE//4/asi.8scdMmZRO', '2024-11-20 23:56:47.217286', 3);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_2730a0c3947641edf256551f10c` (`clienteId`);

--
-- Indices de la tabla `presupuestos`
--
ALTER TABLE `presupuestos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indices de la tabla `presupuesto_items`
--
ALTER TABLE `presupuesto_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `presupuesto_id` (`presupuesto_id`),
  ADD KEY `fk_presupuesto_items_producto` (`producto_id`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_4574456dcef5b1c686b93fb982a` (`proveedor_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `rubros`
--
ALTER TABLE `rubros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombreRubros` (`nombreRubros`);

--
-- Indices de la tabla `sistemas`
--
ALTER TABLE `sistemas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombreSistemas` (`nombreSistemas`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `presupuestos`
--
ALTER TABLE `presupuestos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT de la tabla `presupuesto_items`
--
ALTER TABLE `presupuesto_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=288;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `rubros`
--
ALTER TABLE `rubros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `sistemas`
--
ALTER TABLE `sistemas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `FK_2730a0c3947641edf256551f10c` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `presupuestos`
--
ALTER TABLE `presupuestos`
  ADD CONSTRAINT `presupuestos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);

--
-- Filtros para la tabla `presupuesto_items`
--
ALTER TABLE `presupuesto_items`
  ADD CONSTRAINT `fk_presupuesto_items_producto` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `presupuesto_items_ibfk_1` FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuestos` (`id`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `FK_4574456dcef5b1c686b93fb982a` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
