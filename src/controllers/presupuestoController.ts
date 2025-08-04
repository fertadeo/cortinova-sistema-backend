// controllers/presupuestoController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';  // Tu configuración de base de datos
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Presupuesto as PresupuestoEntity } from '../entities/Presupuestos';
import { Pedido } from '../entities/Pedido';
import { PedidoEstado } from '../entities/enums/PedidoEstado';

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

          return {
            ...presupuesto,
            items: items.map((item: any) => ({
              ...item,
              detalles: JSON.parse(item.detalles || '{}')
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

      // Calcular el subtotal basado en los productos (suma de todos los productos sin descuento)
      const subtotal = presupuestoData.productos.reduce((sum: number, producto: any) => {
        return sum + (producto.cantidad * producto.precioUnitario);
      }, 0);

      // Obtener el descuento del request (porcentaje o monto fijo)
      const descuentoPorcentaje = presupuestoData.descuentoPorcentaje || 0;
      const descuentoMonto = presupuestoData.descuentoMonto || 0;
      
      // Calcular el descuento
      let descuento = 0;
      if (descuentoPorcentaje > 0) {
        descuento = (subtotal * descuentoPorcentaje) / 100;
      } else if (descuentoMonto > 0) {
        descuento = descuentoMonto;
      }

      // Calcular el total final (subtotal - descuento = monto a cobrar)
      const total = subtotal - descuento;

      // Actualizar los datos del presupuesto
      presupuestoData.subtotal = subtotal;
      presupuestoData.descuento = descuento;
      presupuestoData.total = total;

      const presupuestoResult = await queryRunner.query(`
        INSERT INTO presupuestos (numero_presupuesto, cliente_id, fecha, subtotal, descuento, total, presupuesto_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          presupuestoData.numeroPresupuesto,
          presupuestoData.clienteId,
          new Date(),
          subtotal,
          descuento,
          total,
          JSON.stringify(presupuestoData)
        ]
      );

      const presupuestoId = presupuestoResult.insertId;

      await Promise.all(
        presupuestoData.productos.map(async (producto: any) => {
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
                JSON.stringify(producto.detalles || {})
              ]
            );
          } else {
            // Para productos personalizados (cortinas)
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
                JSON.stringify(producto.detalles || {})
              ]
            );
          }
        })
      );

      await queryRunner.commitTransaction();
      res.status(201).json({ 
        success: true, 
        presupuestoId,
        message: "Presupuesto creado exitosamente" 
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error al crear presupuesto:", error);
      res.status(500).json({ 
        success: false, 
        error: "Error al crear el presupuesto",
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

          return {
            ...presupuesto,
            items: items.map((item: any) => ({
              ...item,
              detalles: JSON.parse(item.detalles || '{}')
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

      // Consulta base
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
      `;

      const params: any[] = [];

      // Filtros
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

      // Filtro por nombre (q)
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

      res.json({
        success: true,
        data: {
          ...presupuestoData,
          items: items.map((item: any) => ({
            ...item,
            detalles: JSON.parse(item.detalles || '{}')
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
  }
};