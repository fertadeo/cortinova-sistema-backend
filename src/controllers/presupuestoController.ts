// controllers/presupuestoController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';  // Tu configuración de base de datos
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Presupuesto as PresupuestoEntity } from '../entities/Presupuestos';
import { Pedido } from '../entities/Pedido';
import { PedidoEstado } from '../entities/enums/PedidoEstado';
import { NotificationService } from '../services/NotificationService';

interface Presupuesto {
  numeroPresupuesto: string;
  clienteId: number;
  fecha: Date;
  productos: Array<{
    id: number;
    nombre: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    detalles?: {
      sistema: string;
      detalle?: string;
      caidaPorDelante?: string;
      colorSistema?: string;
      ladoComando?: string;
      tipoTela?: string;
      soporteIntermedio?: boolean;
      soporteDoble?: boolean;
    };
  }>;
  total: number;
}

const isObject = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const safeJsonParse = (value: unknown) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const normalizeProductSnapshot = (producto: any = {}, existingProducto: any = {}) => {
  const incomingDetalles = isObject(producto.detalles) ? producto.detalles : {};
  const existingDetalles = isObject(existingProducto.detalles) ? existingProducto.detalles : {};

  return {
    ...existingProducto,
    ...producto,
    detalles: { ...existingDetalles, ...incomingDetalles }
  };
};

const normalizePresupuestoSnapshot = (incomingData: any = {}, existingData: any = {}) => {
  const existingProductos = Array.isArray(existingData.productos) ? existingData.productos : [];
  const incomingProductos = Array.isArray(incomingData.productos) ? incomingData.productos : existingProductos;

  return {
    ...existingData,
    ...incomingData,
    esEstimativo: typeof incomingData.esEstimativo === 'boolean'
      ? incomingData.esEstimativo
      : (typeof existingData.esEstimativo === 'boolean' ? existingData.esEstimativo : false),
    showMeasuresInPDF: typeof incomingData.showMeasuresInPDF === 'boolean'
      ? incomingData.showMeasuresInPDF
      : (typeof existingData.showMeasuresInPDF === 'boolean' ? existingData.showMeasuresInPDF : false),
    shouldRound: typeof incomingData.shouldRound === 'boolean'
      ? incomingData.shouldRound
      : (typeof existingData.shouldRound === 'boolean' ? existingData.shouldRound : false),
    applyDiscount: typeof incomingData.applyDiscount === 'boolean'
      ? incomingData.applyDiscount
      : (typeof existingData.applyDiscount === 'boolean' ? existingData.applyDiscount : false),
    subtotal: toNumber(incomingData.subtotal, toNumber(existingData.subtotal, 0)),
    descuento: toNumber(incomingData.descuento, toNumber(existingData.descuento, 0)),
    total: toNumber(incomingData.total, toNumber(existingData.total, 0)),
    numeroPresupuesto: incomingData.numeroPresupuesto || existingData.numeroPresupuesto || '',
    productos: incomingProductos.map((producto: any, index: number) =>
      normalizeProductSnapshot(producto, existingProductos[index] || {})
    )
  };
};

const buildItemDetallesSnapshot = (producto: any = {}) => {
  const detallesOriginales = isObject(producto.detalles) ? producto.detalles : {};

  return {
    ...detallesOriginales,
    ...producto,
    detalles: detallesOriginales
  };
};

// Instancia del servicio de notificaciones
const notificationService = new NotificationService();

export const presupuestoController = {
  // Obtener presupuestos por ID de cliente
  getPresupuestosByCliente: async (req: Request, res: Response) => {
    const clienteId = req.params.clienteId;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const presupuestos = await queryRunner.query(`
        SELECT 
          p.id,
          p.numero_presupuesto,
          p.fecha,
          p.subtotal,
          p.descuento,
          p.total,
          p.presupuesto_json,
          c.nombre as cliente_nombre,
          c.telefono as cliente_telefono,
          c.email as cliente_email
        FROM presupuestos p
        JOIN clientes c ON p.cliente_id = c.id
        WHERE p.cliente_id = ?`, [clienteId]);

      const presupuestosConItems = await Promise.all(
        presupuestos.map(async (presupuesto: any) => {
          const items = await queryRunner.query(`
            SELECT 
              pi.id,
              pi.nombre,
              pi.descripcion,
              pi.cantidad,
              pi.precio_unitario,
              pi.subtotal,
              pi.detalles
            FROM presupuesto_items pi
            WHERE pi.presupuesto_id = ?`, [presupuesto.id]);

          // Parsear el presupuesto_json si existe
          const presupuestoJsonRaw = presupuesto.presupuesto_json ?
            JSON.parse(presupuesto.presupuesto_json) : null;
          const presupuestoJson = presupuestoJsonRaw ? normalizePresupuestoSnapshot(presupuestoJsonRaw) : null;

          return {
            ...presupuesto,
            presupuesto_json: presupuestoJson,
            items: items.map((item: any) => ({
              ...item,
              detalles: safeJsonParse(item.detalles || '{}')
            }))
          };
        })
      );

      await queryRunner.commitTransaction();
      res.json({ success: true, data: presupuestosConItems });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      res.status(500).json({ success: false, error });
    } finally {
      await queryRunner.release();
    }
  },

  // Crear nuevo presupuesto
  createPresupuesto: async (req: Request, res: Response) => {
    const presupuestoData = req.body;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const normalizedPresupuesto = normalizePresupuestoSnapshot(presupuestoData);

      // USAR LOS VALORES EXACTOS QUE ENVÍA EL FRONTEND
      const subtotal = normalizedPresupuesto.subtotal;
      const descuento = normalizedPresupuesto.descuento;
      const total = normalizedPresupuesto.total;

      // Calcular valores de motorización
      let incluirMotorizacion = false;
      let precioTotalMotorizacion = 0;

      normalizedPresupuesto.productos.forEach((producto: any) => {
        if (producto.incluirMotorizacion) {
          incluirMotorizacion = true;
          precioTotalMotorizacion += (producto.precioMotorizacion || 0) * (producto.cantidad || 1);
        }
      });

      const presupuestoResult = await queryRunner.query(`
        INSERT INTO presupuestos (
          numero_presupuesto, 
          cliente_id, 
          fecha, 
          subtotal, 
          descuento, 
          total, 
          presupuesto_json,
          incluirMotorizacion,
          precioMotorizacion
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          normalizedPresupuesto.numeroPresupuesto,
          normalizedPresupuesto.clienteId,
          new Date(),
          subtotal,
          descuento,
          total,
          JSON.stringify(normalizedPresupuesto),
          incluirMotorizacion,
          precioTotalMotorizacion
        ]
      );

      const presupuestoId = presupuestoResult.insertId;

      await Promise.all(
        normalizedPresupuesto.productos.map(async (producto: any) => {
          // Si es un producto del catálogo (como COLOCACIONES)
          if (producto.nombre === 'COLOCACIONES') {
            return queryRunner.query(`
              INSERT INTO presupuesto_items 
              (presupuesto_id, producto_id, nombre, descripcion, cantidad, precio_unitario, subtotal, detalles)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                presupuestoId,
                producto.id,
                producto.nombre,
                producto.descripcion,
                producto.cantidad,
                producto.precioUnitario,
                producto.subtotal,
                JSON.stringify(buildItemDetallesSnapshot(producto))
              ]
            );
          } else {
            return queryRunner.query(`
              INSERT INTO presupuesto_items 
              (presupuesto_id, producto_id, nombre, descripcion, cantidad, precio_unitario, subtotal, detalles)
              VALUES (?, NULL, ?, ?, ?, ?, ?, ?)`,
              [
                presupuestoId,
                producto.nombre,
                producto.descripcion,
                producto.cantidad,
                producto.precioUnitario,
                producto.subtotal,
                JSON.stringify(buildItemDetallesSnapshot(producto))
              ]
            );
          }
        })
      );

      await queryRunner.commitTransaction();

      // 🎯 EJEMPLO: Enviar notificación de presupuesto creado
      try {
        const user_id = (req as any).user_id; // Extraído del middleware de autenticación
        
        // Obtener información del cliente para la notificación
        const cliente = await queryRunner.query(`
          SELECT nombre, email FROM clientes WHERE id = ?
        `, [normalizedPresupuesto.clienteId]);

        if (cliente.length > 0) {
          await notificationService.notifySistema(
            user_id,
            `Presupuesto Creado #${normalizedPresupuesto.numeroPresupuesto}`,
            `Presupuesto creado exitosamente para ${cliente[0].nombre} por $${total.toFixed(2)}`,
            `/presupuestos/${presupuestoId}`
          );
        }
      } catch (notificationError) {
        console.error('Error al enviar notificación:', notificationError);
        // No fallar la operación principal por un error de notificación
      }

      res.status(201).json({ 
        success: true, 
        presupuestoId,
        incluirMotorizacion,
        precioTotalMotorizacion,
        message: "Presupuesto creado exitosamente" 
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al crear presupuesto:", error);
      res.status(500).json({ 
        success: false, 
        error: "Error al crear presupuesto",
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      await queryRunner.release();
    }
  },

  // Agregar esta nueva función
  getAllPresupuestos: async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const presupuestos = await queryRunner.query(`
        SELECT 
          p.id,
          p.numero_presupuesto,
          p.fecha,
          p.subtotal,
          p.descuento,
          p.total,
          p.presupuesto_json,
          c.id as cliente_id,
          c.nombre as cliente_nombre,
          c.telefono as cliente_telefono,
          c.email as cliente_email
        FROM presupuestos p
        JOIN clientes c ON p.cliente_id = c.id
        ORDER BY p.fecha DESC`);

      const presupuestosConItems = await Promise.all(
        presupuestos.map(async (presupuesto: any) => {
          const items = await queryRunner.query(`
            SELECT 
              pi.id,
              pi.nombre,
              pi.descripcion,
              pi.cantidad,
              pi.precio_unitario,
              pi.subtotal,
              pi.detalles
            FROM presupuesto_items pi
            WHERE pi.presupuesto_id = ?`, [presupuesto.id]);

          // Parsear el presupuesto_json si existe
          const presupuestoJsonRaw = presupuesto.presupuesto_json ?
            JSON.parse(presupuesto.presupuesto_json) : null;
          const presupuestoJson = presupuestoJsonRaw ? normalizePresupuestoSnapshot(presupuestoJsonRaw) : null;

          return {
            ...presupuesto,
            presupuesto_json: presupuestoJson,
            items: items.map((item: any) => ({
              ...item,
              detalles: safeJsonParse(item.detalles || '{}')
            }))
          };
        })
      );

      await queryRunner.commitTransaction();
      res.json({ success: true, data: presupuestosConItems });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      res.status(500).json({ 
        success: false, 
        message: "Error al obtener los presupuestos",
        error 
      });
    } finally {
      await queryRunner.release();
    }
  },

  // Agregar esta nueva función al controlador
  getPresupuestosPorMes: async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const presupuestosPorMes = await queryRunner.query(`
        SELECT 
          DATE_FORMAT(fecha, '%Y-%m') as mes,
          COUNT(*) as total_presupuestos,
          SUM(total) as suma_total,
          COUNT(DISTINCT cliente_id) as total_clientes
        FROM presupuestos
        WHERE fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(fecha, '%Y-%m')
        ORDER BY mes DESC
      `);

      await queryRunner.commitTransaction();
      res.json({ 
        success: true, 
        data: presupuestosPorMes.map((item: any) => ({
          ...item,
          mes: item.mes,
          total_presupuestos: Number(item.total_presupuestos),
          suma_total: Number(item.suma_total),
          total_clientes: Number(item.total_clientes)
        }))
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al obtener estadísticas por mes:", error);
      res.status(500).json({ 
        success: false, 
        error: "Error al obtener estadísticas de presupuestos por mes",
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      await queryRunner.release();
    }
  },

  convertirAPresupuesto: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // 1. Obtener el presupuesto
      const presupuesto = await AppDataSource.getRepository(PresupuestoEntity).findOne({
        where: { id: parseInt(id) }
      });

      if (!presupuesto) {
        return res.status(404).json({ message: 'Presupuesto no encontrado' });
      }

      // 2. Actualizar estado del presupuesto
        await AppDataSource.getRepository(PresupuestoEntity).update(id, {
        estado: 'CONVERTIDO_A_PEDIDO'
      });

      // 3. Crear nuevo pedido
      const pedidoRepository = AppDataSource.getRepository(Pedido);
      const nuevoPedido = await pedidoRepository.save({
        clienteid: presupuesto.cliente_id,
        fecha_pedido: new Date(),
        total: presupuesto.total,
        presupuesto_id: presupuesto.id,
        pedido_json: presupuesto.presupuesto_json,
        estado: req.body.estado || PedidoEstado.EMITIDO
      });

      return res.status(201).json({
        message: 'Presupuesto convertido a pedido exitosamente',
        pedido: nuevoPedido
      });

    } catch (error) {
      console.error('Error al convertir presupuesto a pedido:', error);
      return res.status(500).json({ 
        message: 'Error al convertir presupuesto a pedido',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  crearPresupuestoConMedidas: async (req: Request, res: Response) => {
    const { clienteId, medidasSeleccionadas, productosAdicionales } = req.body;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        // Log de datos recibidos
        console.log('Datos recibidos:', {
            clienteId,
            medidasSeleccionadas,
            productosAdicionales
        });

        // Validaciones
        if (!clienteId || !medidasSeleccionadas) {
            return res.status(400).json({
                success: false,
                error: 'Faltan datos requeridos (clienteId o medidasSeleccionadas)'
            });
        }

        await queryRunner.connect();
        await queryRunner.startTransaction();

        // 1. Verificar que el cliente existe
        const clienteExiste = await queryRunner.query(
            'SELECT id FROM clientes WHERE id = ?',
            [clienteId]
        );

        if (!clienteExiste.length) {
            return res.status(404).json({
                success: false,
                error: `Cliente con ID ${clienteId} no encontrado`
            });
        }

        // 2. Verificar que las medidas existen
        const medidasExisten = await queryRunner.query(
            'SELECT id FROM medidas WHERE id IN (?) AND clienteId = ?',
            [medidasSeleccionadas, clienteId]
        );

        if (medidasExisten.length !== medidasSeleccionadas.length) {
            return res.status(404).json({
                success: false,
                error: 'Una o más medidas no fueron encontradas para este cliente'
            });
        }

        // 3. Crear el presupuesto
        const numeroPresupuesto = `PRES-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        console.log('Creando presupuesto:', numeroPresupuesto);

        const presupuestoResult = await queryRunner.query(`
            INSERT INTO presupuestos (
                numero_presupuesto, 
                cliente_id, 
                fecha, 
                estado
            ) VALUES (?, ?, NOW(), 'BORRADOR')`,
            [numeroPresupuesto, clienteId]
        );

        const presupuestoId = presupuestoResult.insertId;
        console.log('Presupuesto creado con ID:', presupuestoId);

        // 4. Procesar medidas seleccionadas
        const medidas = await queryRunner.query(`
            SELECT * FROM medidas 
            WHERE id IN (?) AND clienteId = ?`,
            [medidasSeleccionadas, clienteId]
        );

        console.log('Medidas encontradas:', medidas);

        for (const medida of medidas) {
            await queryRunner.query(`
                INSERT INTO presupuesto_items (
                    presupuesto_id,
                    producto_id,
                    nombre,
                    descripcion,
                    cantidad,
                    precio_unitario,
                    subtotal,
                    detalles
                ) VALUES (?, NULL, ?, ?, ?, 0, 0, ?)`,
                [
                    presupuestoId,
                    medida.elemento,
                    `${medida.ancho}cm x ${medida.alto}cm - ${medida.ubicacion || ''}`,
                    medida.cantidad,
                    JSON.stringify({
                        medidaId: medida.id,
                        ubicacion: medida.ubicacion,
                        detalles: medida.detalles,
                        medidoPor: medida.medidoPor,
                        fechaMedicion: medida.fechaMedicion,
                        dimensiones: {
                            ancho: medida.ancho,
                            alto: medida.alto
                        }
                    })
                ]
            );
        }

        await queryRunner.commitTransaction();

        res.json({
            success: true,
            message: 'Presupuesto creado exitosamente',
            data: {
                presupuestoId,
                numeroPresupuesto,
                itemsCreados: medidas.length
            }
        });

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error detallado al crear presupuesto:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear presupuesto',
            details: error instanceof Error ? error.message : 'Error desconocido',
            errorCompleto: error
        });
    } finally {
        await queryRunner.release();
    }
  },

  // Obtener productos filtrados por sistema, rubro y proveedor para presupuestos
  obtenerProductosParaPresupuesto: async (req: Request, res: Response) => {
    const { sistemaId, rubroId, proveedorId, q } = req.query;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Consulta base: sin filtrar por disponible para poder ver todos los productos de la DB
      let query = `
        SELECT 
          id,
          nombreProducto,
          cantidad_stock,
          descripcion,
          precioCosto,
          precio,
          divisa,
          disponible,
          descuento,
          rubro_id,
          sistema_id,
          proveedor_id
        FROM producto
        WHERE 1=1
      `;

      const params: any[] = [];

      // Filtros opcionales (solo se aplican si vienen en la query)
      if (sistemaId) {
        query += ` AND sistema_id = ?`;
        params.push(sistemaId); 
      }

      // Permitir múltiples rubros separados por coma
      let rubroIds: string[] = [];
      if (rubroId) {
        if (typeof rubroId === 'string') {
          rubroIds = rubroId.split(',').map((id) => id.trim()).filter(Boolean);
        } else if (Array.isArray(rubroId)) {
          rubroIds = rubroId.map((id) => String(id));
        }
        if (rubroIds.length > 0) {
          query += ` AND rubro_id IN (${rubroIds.map(() => '?').join(',')})`;
          params.push(...rubroIds);
        }
      }

      if (proveedorId) {
        query += ` AND proveedor_id = ?`;
        params.push(proveedorId);
      } 

      // Filtro por nombre (q). Con q=* o sin q se listan todos los que cumplan los filtros opcionales
      if (q && typeof q === 'string' && q.trim() !== '' && q !== '*') {
        query += ` AND LOWER(nombreProducto) LIKE ?`;
        params.push(`%${q.toLowerCase()}%`);
      }

      // Ordenar por nombre del producto
      query += ` ORDER BY nombreProducto ASC`;

      const productos = await queryRunner.query(query, params);

      await queryRunner.commitTransaction();

      res.json({
        success: true,
        data: productos,
        filtros: {
          sistemaId: sistemaId || null,
          rubroId: rubroId || null,
          proveedorId: proveedorId || null,
          q: q || null
        },
        total: productos.length
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al obtener productos para presupuesto:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener productos para presupuesto",
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      await queryRunner.release();
    }
  },

  // Obtener productos excluyendo categorías específicas (telas, alfombras, arreglos)
  obtenerProductosExcluyendoCategorias: async (req: Request, res: Response) => {
    const { sistemaId, proveedorId, categoriasExcluir } = req.query;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Categorías por defecto a excluir (telas, alfombras, arreglos)
      const categoriasPorDefecto = ['4', '7', '10']; // IDs de telas, alfombras, arreglos
      const categoriasAExcluir = categoriasExcluir ? 
        (Array.isArray(categoriasExcluir) ? categoriasExcluir : [categoriasExcluir]) : 
        categoriasPorDefecto;

      let query = `
        SELECT 
          id,
          nombreProducto,
          cantidad_stock,
          descripcion,
          precioCosto,
          precio,
          divisa,
          disponible,
          descuento,
          rubro_id,
          sistema_id,
          proveedor_id
        FROM producto
        WHERE disponible = 1
        AND rubro_id NOT IN (${categoriasAExcluir.map(() => '?').join(',')})
      `;

      const params: any[] = [...categoriasAExcluir];

      // Agregar filtros adicionales
      if (sistemaId) {
        query += ` AND sistema_id = ?`;
        params.push(sistemaId);
      }

      if (proveedorId) {
        query += ` AND proveedor_id = ?`;
        params.push(proveedorId);
      }

      // Ordenar por nombre del producto
      query += ` ORDER BY nombreProducto ASC`;

      const productos = await queryRunner.query(query, params);

      await queryRunner.commitTransaction();

      res.json({
        success: true,
        data: productos,
        filtros: {
          sistemaId: sistemaId || null,
          proveedorId: proveedorId || null,
          categoriasExcluidas: categoriasAExcluir
        },
        total: productos.length
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al obtener productos excluyendo categorías:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener productos excluyendo categorías",
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      await queryRunner.release();
    }
  },

  // Actualizar presupuesto con descuento
  updatePresupuestoConDescuento: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { descuentoPorcentaje, descuentoMonto } = req.body;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Obtener el presupuesto actual
      const presupuesto = await queryRunner.query(`
        SELECT * FROM presupuestos WHERE id = ?`, [id]);

      if (!presupuesto.length) {
        return res.status(404).json({
          success: false,
          error: 'Presupuesto no encontrado'
        });
      }

      const presupuestoActual = presupuesto[0];
      const presupuestoJson = JSON.parse(presupuestoActual.presupuesto_json);

      // Calcular el nuevo descuento
      let nuevoDescuento = 0;
      if (descuentoPorcentaje > 0) {
        nuevoDescuento = (presupuestoActual.subtotal * descuentoPorcentaje) / 100;
      } else if (descuentoMonto > 0) {
        nuevoDescuento = descuentoMonto;
      }

      // Calcular el nuevo total (subtotal - descuento = monto a cobrar)
      const nuevoTotal = presupuestoActual.subtotal - nuevoDescuento;

      // Actualizar el JSON del presupuesto
      presupuestoJson.descuento = nuevoDescuento;
      presupuestoJson.subtotal = presupuestoActual.subtotal;
      presupuestoJson.total = nuevoTotal;

      // Actualizar el presupuesto en la base de datos
      await queryRunner.query(`
        UPDATE presupuestos 
        SET descuento = ?, total = ?, presupuesto_json = ?
        WHERE id = ?`,
        [nuevoDescuento, nuevoTotal, JSON.stringify(presupuestoJson), id]
      );

      await queryRunner.commitTransaction();

      res.json({
        success: true,
        message: 'Presupuesto actualizado con descuento exitosamente',
        data: {
          id: parseInt(id),
          subtotal: presupuestoActual.subtotal,
          descuento: nuevoDescuento,
          total: nuevoTotal
        }
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al actualizar presupuesto con descuento:", error);
      res.status(500).json({
        success: false,
        error: "Error al actualizar presupuesto con descuento",
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      await queryRunner.release();
    }
  },

  // Obtener presupuesto por ID con detalles completos
  getPresupuestoById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const presupuesto = await queryRunner.query(`
        SELECT 
          p.*,
          c.nombre as cliente_nombre,
          c.telefono as cliente_telefono,
          c.email as cliente_email
        FROM presupuestos p
        JOIN clientes c ON p.cliente_id = c.id
        WHERE p.id = ?`, [id]);

      if (!presupuesto.length) {
        return res.status(404).json({
          success: false,
          error: 'Presupuesto no encontrado'
        });
      }

      const presupuestoData = presupuesto[0];
      const items = await queryRunner.query(`
        SELECT 
          pi.id,
          pi.nombre,
          pi.descripcion,
          pi.cantidad,
          pi.precio_unitario,
          pi.subtotal,
          pi.detalles
        FROM presupuesto_items pi
        WHERE pi.presupuesto_id = ?`, [id]);

      await queryRunner.commitTransaction();

      // Parsear el presupuesto_json si existe
      const presupuestoJsonRaw = presupuestoData.presupuesto_json ?
        JSON.parse(presupuestoData.presupuesto_json) : null;
      const presupuestoJson = presupuestoJsonRaw ? normalizePresupuestoSnapshot(presupuestoJsonRaw) : null;

      res.json({
        success: true,
        data: {
          ...presupuestoData,
          presupuesto_json: presupuestoJson,
          items: items.map((item: any) => ({
            ...item,
            detalles: safeJsonParse(item.detalles || '{}')
          }))
        }
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al obtener presupuesto por ID:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener presupuesto por ID",
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      await queryRunner.release();
    }
  },

  // Obtener solo el dato Espacio de un presupuesto específico
  getEspacioPresupuesto: async (req: Request, res: Response) => {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const presupuesto = await queryRunner.query(`
        SELECT 
          p.id,
          p.numero_presupuesto,
          p.presupuesto_json
        FROM presupuestos p
        WHERE p.id = ?`, [id]);

      if (!presupuesto.length) {
        return res.status(404).json({
          success: false,
          error: 'Presupuesto no encontrado'
        });
      }

      const presupuestoData = presupuesto[0];
      
      // Parsear el presupuesto_json si existe
      const presupuestoJson = presupuestoData.presupuesto_json ? 
        JSON.parse(presupuestoData.presupuesto_json) : null;

      // Extraer solo el dato Espacio
      const espacio = presupuestoJson?.Espacio || null;

      await queryRunner.commitTransaction();

      res.json({
        success: true,
        data: {
          id: presupuestoData.id,
          numeroPresupuesto: presupuestoData.numero_presupuesto,
          espacio: espacio
        }
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al obtener espacio del presupuesto:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener espacio del presupuesto",
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      await queryRunner.release();
    }
  },

  // Obtener el dato Espacio de todos los presupuestos de un cliente
  getEspaciosPresupuestosByCliente: async (req: Request, res: Response) => {
    const clienteId = req.params.clienteId;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const presupuestos = await queryRunner.query(`
        SELECT 
          p.id,
          p.numero_presupuesto,
          p.fecha,
          p.presupuesto_json
        FROM presupuestos p
        WHERE p.cliente_id = ?`, [clienteId]);

      const presupuestosConEspacio = presupuestos.map((presupuesto: any) => {
        // Parsear el presupuesto_json si existe
        const presupuestoJsonRaw = presupuesto.presupuesto_json ?
          JSON.parse(presupuesto.presupuesto_json) : null;
        const presupuestoJson = presupuestoJsonRaw ? normalizePresupuestoSnapshot(presupuestoJsonRaw) : null;

        // Extraer solo el dato Espacio
        const espacio = presupuestoJson?.Espacio || null;

        return {
          id: presupuesto.id,
          numeroPresupuesto: presupuesto.numero_presupuesto,
          fecha: presupuesto.fecha,
          espacio: espacio
        };
      });

      await queryRunner.commitTransaction();

      res.json({
        success: true,
        data: presupuestosConEspacio
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al obtener espacios de presupuestos:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener espacios de presupuestos",
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      await queryRunner.release();
    }
  },

  // Actualizar presupuesto completo
  updatePresupuesto: async (req: Request, res: Response) => {
    const { id } = req.params;
    const presupuestoData = req.body;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Verificar que el presupuesto existe
      const presupuesto = await queryRunner.query(`
        SELECT id, numero_presupuesto, cliente_id, estado FROM presupuestos WHERE id = ?`, [id]);

      if (!presupuesto.length) {
        return res.status(404).json({
          success: false,
          error: 'Presupuesto no encontrado'
        });
      }

      const presupuestoActual = presupuesto[0];

      // Verificar si el presupuesto ya fue convertido a pedido
      const pedidoAsociado = await queryRunner.query(`
        SELECT id FROM pedido WHERE presupuesto_id = ?`, [id]);

      if (pedidoAsociado.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'No se puede editar el presupuesto porque ya fue convertido a pedido'
        });
      }

      // Validar que clienteId coincida si se envía (opcional, pero si se envía debe ser correcto)
      if (presupuestoData.clienteId && presupuestoData.clienteId !== presupuestoActual.cliente_id) {
        return res.status(400).json({
          success: false,
          error: 'No se puede cambiar el cliente del presupuesto'
        });
      }

      const presupuestoDbActual = await queryRunner.query(
        `SELECT presupuesto_json FROM presupuestos WHERE id = ?`,
        [id]
      );
      const currentJson = presupuestoDbActual[0]?.presupuesto_json
        ? JSON.parse(presupuestoDbActual[0].presupuesto_json)
        : {};

      const normalizedPresupuesto = normalizePresupuestoSnapshot(presupuestoData, currentJson);

      // Validar que haya productos finales (en payload o heredados)
      if (!Array.isArray(normalizedPresupuesto.productos) || normalizedPresupuesto.productos.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'El presupuesto debe contener al menos un producto en el snapshot final'
        });
      }

      // USAR LOS VALORES EXACTOS QUE ENVÍA EL FRONTEND
      const subtotal = normalizedPresupuesto.subtotal;
      const descuento = normalizedPresupuesto.descuento;
      const total = normalizedPresupuesto.total;

      // Calcular valores de motorización
      let incluirMotorizacion = false;
      let precioTotalMotorizacion = 0;

      normalizedPresupuesto.productos.forEach((producto: any) => {
        if (producto.incluirMotorizacion) {
          incluirMotorizacion = true;
          precioTotalMotorizacion += (producto.precioMotorizacion || 0) * (producto.cantidad || 1);
        }
      });

      // Eliminar items actuales del presupuesto
      await queryRunner.query(`
        DELETE FROM presupuesto_items WHERE presupuesto_id = ?`, [id]);

      // Actualizar el presupuesto en la base de datos
      await queryRunner.query(`
        UPDATE presupuestos 
        SET 
          subtotal = ?, 
          descuento = ?, 
          total = ?, 
          presupuesto_json = ?,
          incluirMotorizacion = ?,
          precioMotorizacion = ?
        WHERE id = ?`,
        [
          subtotal,
          descuento,
          total,
          JSON.stringify(normalizedPresupuesto),
          incluirMotorizacion,
          precioTotalMotorizacion,
          id
        ]
      );

      // Insertar los nuevos items
      await Promise.all(
        normalizedPresupuesto.productos.map(async (producto: any) => {
          // Si es un producto del catálogo (como COLOCACIONES)
          if (producto.nombre === 'COLOCACIONES') {
            return queryRunner.query(`
              INSERT INTO presupuesto_items 
              (presupuesto_id, producto_id, nombre, descripcion, cantidad, precio_unitario, subtotal, detalles)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id,
                producto.id,
                producto.nombre,
                producto.descripcion,
                producto.cantidad,
                producto.precioUnitario,
                producto.subtotal,
                JSON.stringify(buildItemDetallesSnapshot(producto))
              ]
            );
          } else {
            return queryRunner.query(`
              INSERT INTO presupuesto_items 
              (presupuesto_id, producto_id, nombre, descripcion, cantidad, precio_unitario, subtotal, detalles)
              VALUES (?, NULL, ?, ?, ?, ?, ?, ?)`,
              [
                id,
                producto.nombre,
                producto.descripcion,
                producto.cantidad,
                producto.precioUnitario,
                producto.subtotal,
                JSON.stringify(buildItemDetallesSnapshot(producto))
              ]
            );
          }
        })
      );

      await queryRunner.commitTransaction();

      // Enviar notificación de actualización
      try {
        const user_id = (req as any).user_id;
        
        // Obtener información del cliente para la notificación
        const cliente = await queryRunner.query(`
          SELECT nombre, email FROM clientes WHERE id = ?
        `, [presupuestoActual.cliente_id]);

        if (cliente.length > 0) {
          await notificationService.notifySistema(
            user_id,
            `Presupuesto Actualizado #${presupuestoActual.numero_presupuesto}`,
            `Presupuesto #${presupuestoActual.numero_presupuesto} actualizado exitosamente para ${cliente[0].nombre} por $${total.toFixed(2)}`,
            `/presupuestos/${id}`
          );
        }
      } catch (notificationError) {
        console.error('Error al enviar notificación:', notificationError);
        // No fallar la operación principal por un error de notificación
      }

      res.json({ 
        success: true, 
        presupuestoId: parseInt(id),
        incluirMotorizacion,
        precioTotalMotorizacion,
        message: "Presupuesto actualizado exitosamente" 
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al actualizar presupuesto:", error);
      res.status(500).json({ 
        success: false, 
        error: "Error al actualizar presupuesto",
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      await queryRunner.release();
    }
  },

  // Eliminar presupuesto y todos sus items
  deletePresupuesto: async (req: Request, res: Response) => {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Verificar que el presupuesto existe
      const presupuesto = await queryRunner.query(`
        SELECT id, numero_presupuesto, cliente_id FROM presupuestos WHERE id = ?`, [id]);

      if (!presupuesto.length) {
        return res.status(404).json({
          success: false,
          error: 'Presupuesto no encontrado'
        });
      }

      const presupuestoData = presupuesto[0];

      // Verificar si el presupuesto ya fue convertido a pedido
      const pedidoAsociado = await queryRunner.query(`
        SELECT id FROM pedido WHERE presupuesto_id = ?`, [id]);

      if (pedidoAsociado.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar el presupuesto porque ya fue convertido a pedido'
        });
      }

      // Eliminar items del presupuesto
      await queryRunner.query(`
        DELETE FROM presupuesto_items WHERE presupuesto_id = ?`, [id]);

      // Eliminar el presupuesto
      await queryRunner.query(`
        DELETE FROM presupuestos WHERE id = ?`, [id]);

      await queryRunner.commitTransaction();

      // Enviar notificación de eliminación
      try {
        const user_id = (req as any).user_id;
        await notificationService.notifySistema(
          user_id,
          `Presupuesto Eliminado #${presupuestoData.numero_presupuesto}`,
          `Presupuesto #${presupuestoData.numero_presupuesto} eliminado exitosamente`,
          `/presupuestos`
        );
      } catch (notificationError) {
        console.error('Error al enviar notificación:', notificationError);
      }

      res.json({
        success: true,
        message: 'Presupuesto y todos sus items eliminados exitosamente',
        data: {
          presupuestoId: parseInt(id),
          numeroPresupuesto: presupuestoData.numero_presupuesto
        }
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al eliminar presupuesto:", error);
      res.status(500).json({
        success: false,
        error: "Error al eliminar presupuesto",
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      await queryRunner.release();
    }
  }
};