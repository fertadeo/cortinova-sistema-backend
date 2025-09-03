import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Medidas } from '../entities/Medidas';
import { Clientes } from '../entities/Clientes';
import { NotificationService } from '../services/NotificationService';
import { NotificationType, NotificationPriority } from '../entities/Notifications';

export const medidasController = {
  // Obtener todas las medidas
  getAllMedidas: async (req: Request, res: Response) => {
    try {
      const medidasRepository = AppDataSource.getRepository(Medidas);
      const medidas = await medidasRepository.find();
      res.json({ success: true, data: medidas });
    } catch (error) {
      console.error('Error al obtener medidas:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener medidas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Obtener medidas por ID
  getMedidaById: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const medidasRepository = AppDataSource.getRepository(Medidas);
      const medida = await medidasRepository.findOne({ 
        where: { id: parseInt(id) } 
      });
      
      if (!medida) {
        return res.status(404).json({ 
          success: false, 
          error: 'Medida no encontrada' 
        });
      }
      
      res.json({ success: true, data: medida });
    } catch (error) {
      console.error(`Error al obtener medida con ID ${id}:`, error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener medida',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Obtener medidas por cliente
  getMedidasByCliente: async (req: Request, res: Response) => {
    const { clienteId } = req.params;
    try {
      const medidasRepository = AppDataSource.getRepository(Medidas);
      const medidas = await medidasRepository.find({ 
        where: { clienteId: parseInt(clienteId) } 
      });
      
      res.json({ success: true, data: medidas });
    } catch (error) {
      console.error(`Error al obtener medidas del cliente ${clienteId}:`, error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener medidas del cliente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Obtener medidas agrupadas por cliente
  getMedidasAgrupadasByCliente: async (req: Request, res: Response) => {
    const { clienteId } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        await queryRunner.connect();
        
        const medidas = await queryRunner.query(`
            SELECT 
                m.*,
                c.nombre as cliente_nombre,
                c.telefono as cliente_telefono,
                c.email as cliente_email
            FROM medidas m
            LEFT JOIN clientes c ON m.clienteId = c.id
            WHERE m.clienteId = ?
            ORDER BY m.elemento, m.fechaMedicion DESC
        `, [clienteId]);

        // Agrupar medidas por elemento
        const medidasAgrupadas = medidas.reduce((acc: any, medida: any) => {
            const elemento = medida.elemento;
            if (!acc[elemento]) {
                acc[elemento] = [];
            }
            acc[elemento].push(medida);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                cliente: {
                    id: clienteId,
                    nombre: medidas[0]?.cliente_nombre,
                    telefono: medidas[0]?.cliente_telefono,
                    email: medidas[0]?.cliente_email
                },
                medidas: medidasAgrupadas
            }
        });

    } catch (error) {
        console.error(`Error al obtener medidas agrupadas del cliente ${clienteId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener medidas del cliente',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    } finally {
        await queryRunner.release();
    }
  },

  // Crear una nueva medida
  createMedida: async (req: Request, res: Response) => {
    try {
      const medidasRepository = AppDataSource.getRepository(Medidas);
      const clientesRepository = AppDataSource.getRepository(Clientes);
      
      // Crear y guardar la medida
      const nuevaMedida = medidasRepository.create(req.body);
      const resultado = await medidasRepository.save(nuevaMedida) as any;
      
      // Verificar que se guardó correctamente
      if (!resultado || !resultado.id) {
        throw new Error('No se pudo crear la medida correctamente');
      }
      
      console.log('📏 Nueva medida creada:', resultado.id);
      
      // Obtener información del cliente para la notificación
      let clienteInfo = null;
      if (resultado.clienteId) {
        try {
          clienteInfo = await clientesRepository.findOne({ 
            where: { id: resultado.clienteId } 
          });
        } catch (clienteError) {
          console.log('⚠️ No se pudo obtener información del cliente:', clienteError);
        }
      }
      
      // Crear notificación automática
      try {
        const notificationService = new NotificationService();
        
        const notificationData = {
          type: NotificationType.NUEVA_MEDIDA,
          title: 'Nueva Medida Tomada',
          message: `Se han tomado nuevas medidas${clienteInfo ? ` para ${clienteInfo.nombre}` : ''}`,
          priority: NotificationPriority.MEDIUM,
          action_url: `/medidas/${resultado.id}`,
          action_text: 'Ver Medida',
          metadata: {
            medida_id: resultado.id,
            cliente_id: resultado.clienteId,
            cliente_nombre: clienteInfo?.nombre || 'Cliente no identificado',
            elemento: resultado.elemento,
            ubicacion: resultado.ubicacion,
            medido_por: resultado.medidoPor,
            fecha_medicion: resultado.fechaMedicion
          }
        };
        
        const notification = await notificationService.createNotification(notificationData);
        console.log('🔔 Notificación automática creada:', notification.id);
        
      } catch (notificationError) {
        console.error('❌ Error al crear notificación automática:', notificationError);
        // No fallar la creación de la medida si falla la notificación
      }
      
      res.status(201).json({ 
        success: true, 
        data: resultado,
        message: 'Medida creada exitosamente',
        notification: {
          success: true,
          message: 'Notificación automática enviada'
        }
      });
    } catch (error) {
      console.error('Error al crear medida:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al crear medida',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Actualizar una medida
  updateMedida: async (req: Request, res: Response) => {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const resultado = await queryRunner.query(`
            UPDATE medidas 
            SET 
                elemento = ?,
                ancho = ?,
                alto = ?,
                cantidad = ?,
                ubicacion = ?,
                detalles = ?,
                medidoPor = ?
            WHERE id = ?`,
            [
                req.body.elemento,
                req.body.ancho,
                req.body.alto,
                req.body.cantidad,
                req.body.ubicacion,
                req.body.detalles,
                req.body.medidoPor,
                id
            ]
        );

        await queryRunner.commitTransaction();

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Medida no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Medida actualizada exitosamente'
        });

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error al actualizar medida:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar medida',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    } finally {
        await queryRunner.release();
    }
  },

  // Eliminar una medida
  deleteMedida: async (req: Request, res: Response) => {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const resultado = await queryRunner.query(
            'DELETE FROM medidas WHERE id = ?',
            [id]
        );

        await queryRunner.commitTransaction();

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Medida no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Medida eliminada exitosamente'
        });

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error al eliminar medida:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar medida',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    } finally {
        await queryRunner.release();
    }
  }
}; 