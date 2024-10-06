-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-08-2024 a las 02:16:23
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
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(255) NOT NULL,
  `dni` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `email`, `direccion`, `telefono`, `dni`) VALUES
(1, 'Carlos Perez', 'carlos-perez@gmail.com', 'Corrientes 54', '3586665432', '30123456'),
(2, 'Laura Martinez', 'laura.martinez@example.com', '456 Calle Real', '358564389', ''),
(3, 'Pedro Rodriguez', 'pedro.rodriguez@example.com', '789 Calle Principal', '3541222719', ''),
(9, 'Fernando Tadeo', 'fernandotadeos@gmail.com', 'Av. Colón 1494', '03541222719', ''),
(12, 'Cristian Nicolas Peralta', 'Nicoperalta@gmail.com', 'Av. Peron 2650', '3804609827', ''),
(14, 'Lucas Castaneda', 'lucascast@gmail.com', 'Laprida 221', '3516784570', '37623870');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario`) VALUES
(1, 1, 1, 2, '50.00'),
(2, 1, 3, 1, '50.00'),
(3, 2, 2, 2, '55.00'),
(4, 3, 1, 1, '50.00'),
(5, 3, 3, 1, '55.00');

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
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `fecha_pedido` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `cliente_id`, `fecha_pedido`, `total`) VALUES
(1, 1, '2024-07-01 10:30:00', '150.00'),
(2, 2, '2024-07-02 11:00:00', '110.00'),
(3, 3, '2024-07-03 14:00:00', '105.00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id` int(11) NOT NULL,
  `nombreProducto` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio` int(11) NOT NULL,
  `cantidad_stock` int(11) DEFAULT 0,
  `categoria` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `ult_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `codigo` varchar(255) DEFAULT NULL,
  `proveedor` varchar(255) DEFAULT NULL,
  `estado` enum('activo','inactivo','descontinuado') DEFAULT 'activo',
  `dimensiones` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `descuento` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id`, `nombreProducto`, `descripcion`, `precio`, `cantidad_stock`, `categoria`, `fecha_creacion`, `ult_actualizacion`, `codigo`, `proveedor`, `estado`, `dimensiones`, `color`, `descuento`) VALUES
(1, 'Tela Lisa Algodón', 'Tela de lino blanco', 15, 100, 'Telas de Cortinas', '2024-08-06 20:30:57', '2024-08-06 21:14:31', 'TL001', 'Proveedor A', 'activo', '2m x 1.5m', 'Blanco', '0.00'),
(2, 'Tela Estampada Floral', 'Tela de lino gris', 19, 50, 'Telas de Cortinas', '2024-08-06 20:30:57', '2024-08-06 21:14:31', 'TL002', 'Proveedor B', 'activo', '2m x 1.5m', 'Rosa', '0.00'),
(3, 'Tela Transparente Voile', 'Tela de lino azul', 12, 200, 'Telas de Cortinas', '2024-08-06 20:30:57', '2024-08-06 21:14:31', 'TL003', 'Proveedor A', 'activo', '2m x 1.5m', 'Blanco', '0.00'),
(4, 'Tela Jacquard', 'Tela de lino beige', 20, 80, 'Telas de Cortinas', '2024-08-06 20:30:57', '2024-08-06 21:14:31', 'TL004', 'Proveedor C', 'activo', '2m x 1.5m', 'Gris', '0.00'),
(5, 'Tela Sarga', 'Tela de algodón blanco', 15, 120, 'Telas de Cortinas', '2024-08-06 20:30:57', '2024-08-06 21:14:31', 'TL005', 'Proveedor A', 'activo', '2m x 1.5m', 'Azul', '0.00'),
(6, 'Tela Blackout Blanco', 'Tela de algodón gris', 25, 75, 'Telas Blackout', '2024-08-06 20:30:57', '2024-08-06 21:14:31', 'BL001', 'Proveedor D', 'activo', '2m x 1.5m', 'Blanco', '0.00'),
(7, 'Tela Blackout Gris', 'Tela de algodón azul', 26, 65, 'Telas Blackout', '2024-08-06 20:30:57', '2024-08-06 21:14:31', 'BL002', 'Proveedor D', 'activo', '2m x 1.5m', 'Gris', '0.00'),
(8, 'Tela Blackout Beige', 'Tela de algodón beige', 26, 90, 'Telas Blackout', '2024-08-06 20:30:57', '2024-08-06 21:14:31', 'BL003', 'Proveedor E', 'activo', '2m x 1.5m', 'Beige', '0.00'),
(9, 'Tela Blackout Azul', 'Tela blackout blanco', 27, 40, 'Telas Blackout', '2024-08-06 20:30:57', '2024-08-06 21:14:31', 'BL004', 'Proveedor E', 'activo', '2m x 1.5m', 'Azul Oscuro', '0.00'),
(10, 'Tela Blackout Marrón', 'Tela blackout gris', 28, 30, 'Telas Blackout', '2024-08-06 20:30:57', '2024-08-06 21:14:31', 'BL005', 'Proveedor F', 'activo', '2m x 1.5m', 'Marrón', '0.00'),
(11, 'Soporte de Barral', 'Tela blackout negro', 5, 150, 'Accesorios para Barrales', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AC001', 'Proveedor G', 'activo', '10cm x 4cm', 'Plata', '0.00'),
(12, 'Terminal de Barral Decorativa', 'Tela blackout azul', 8, 100, 'Accesorios para Barrales', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AC002', 'Proveedor G', 'activo', '5cm x 5cm', 'Oro', '0.00'),
(13, 'Riel para Barral', 'Tela blackout beige', 12, 50, 'Accesorios para Barrales', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AC003', 'Proveedor H', 'activo', '2m', 'Blanco', '0.00'),
(14, 'Ganchos para Cortinas', 'Accesorio barra cortina metálico', 3, 500, 'Accesorios para Barrales', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AC004', 'Proveedor G', 'activo', '2cm x 1cm', 'Blanco', '0.00'),
(15, 'Poleas para Cortinas', 'Accesorio barra cortina madera', 4, 200, 'Accesorios para Barrales', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AC005', 'Proveedor I', 'activo', '5cm', 'Negro', '0.00'),
(16, 'Cadena de Cortina Roller', 'Accesorio soporte barra cortina metálico', 3, 300, 'Accesorios para Cortinas Roller', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AR001', 'Proveedor J', 'activo', '3m', 'Blanco', '0.00'),
(17, 'Caja de Mecanismo Roller', 'Accesorio soporte barra cortina madera', 15, 100, 'Accesorios para Cortinas Roller', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AR002', 'Proveedor J', 'activo', '10cm x 5cm', 'Negro', '0.00'),
(18, 'Peso Inferior para Roller', 'Accesorio anillo cortina metálico', 7, 80, 'Accesorios para Cortinas Roller', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AR003', 'Proveedor K', 'activo', '2m', 'Plata', '0.00'),
(19, 'Soporte de Pared para Roller', 'Accesorio anillo cortina plástico', 6, 150, 'Accesorios para Cortinas Roller', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AR004', 'Proveedor K', 'activo', '5cm x 2cm', 'Blanco', '0.00'),
(20, 'Cajón de Aluminio para Roller', 'Accesorio pinza cortina metálico', 20, 40, 'Accesorios para Cortinas Roller', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AR005', 'Proveedor L', 'activo', '2m x 5cm', 'Gris', '0.00'),
(21, 'Tela Decorativa Seda', 'Accesorio pinza cortina plástico', 30, 60, 'Telas de Cortinas', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'TL006', 'Proveedor M', 'activo', '2m x 1.5m', 'Rojo', '0.00'),
(22, 'Tela Opaca', 'Accesorio cuerda cortina', 22, 70, 'Telas de Cortinas', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'TL007', 'Proveedor N', 'activo', '2m x 1.5m', 'Verde', '0.00'),
(23, 'Gancho Adhesivo para Cortinas', 'Accesorio motor cortina automática', 4, 250, 'Accesorios para Barrales', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AC006', 'Proveedor O', 'activo', '3cm x 3cm', 'Transparente', '0.00'),
(24, 'Clip para Cortinas', 'Accesorio control remoto cortina', 2, 400, 'Accesorios para Barrales', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AC007', 'Proveedor O', 'activo', '2cm x 1cm', 'Plateado', '0.00'),
(25, 'Tela Blackout Verde', 'Tela de poliéster blanco', 28, 45, 'Telas Blackout', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'BL006', 'Proveedor E', 'activo', '2m x 1.5m', 'Verde', '0.00'),
(26, 'Tela Blackout Rojo', 'Tela de poliéster gris', 29, 35, 'Telas Blackout', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'BL007', 'Proveedor F', 'activo', '2m x 1.5m', 'Rojo', '0.00'),
(27, 'Sistema Motorizado para Roller', 'Tela de poliéster azul', 150, 10, 'Accesorios para Cortinas Roller', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'AR006', 'Proveedor P', 'activo', '2m', 'Blanco', '0.00'),
(28, 'Tela Blackout Total', 'Tela de poliéster beige', 30, 25, 'Telas Blackout', '2024-08-06 20:30:57', '2024-08-06 21:14:32', 'BL008', 'Proveedor Q', 'activo', '2m x 1.5m', 'Negro', '0.00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stock`
--

CREATE TABLE `stock` (
  `id` int(11) NOT NULL,
  `producto` varchar(255) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `stock`
--

INSERT INTO `stock` (`id`, `producto`, `cantidad`, `precio`) VALUES
(1, 'Cortina Roller Blanca', 100, '50.00'),
(2, 'Cortina Roller Negra', 50, '55.00'),
(3, 'Cortina Roller Beige', 75, '52.50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`) VALUES
(1, 'John Doe', 'john.doe@example.com', 'password123'),
(2, 'Jane Smith', 'jane.smith@example.com', 'password456'),
(3, 'Alice Johnson', 'alice.johnson@example.com', 'password789'),
(4, 'Bob Brown', 'bob.brown@example.com', 'password101'),
(5, 'Charlie Davis', 'charlie.davis@example.com', 'password202');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_2730a0c3947641edf256551f10c` (`clienteId`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `stock`
--
ALTER TABLE `stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `stock` (`id`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `FK_2730a0c3947641edf256551f10c` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
