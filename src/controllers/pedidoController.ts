import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Pedido } from '../entities/Pedido';
import { PedidoEstado } from '../entities/enums/PedidoEstado';

export const cambiarEstadoPedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!Object.values(PedidoEstado).includes(estado)) {
            return res.status(400).json({ 
                message: 'Estado inválido', 
                estadosValidos: Object.values(PedidoEstado) 
            });
        }

        const pedidoRepository = AppDataSource.getRepository(Pedido);
        const pedido = await pedidoRepository.findOne({ where: { id: parseInt(id) } });

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        await pedidoRepository.update(id, { estado });

        return res.status(200).json({ 
            message: 'Estado del pedido actualizado correctamente',
            pedido: { ...pedido, estado }
        });

    } catch (error) {
        console.error('Error al cambiar estado del pedido:', error);
        return res.status(500).json({ 
            message: 'Error al cambiar estado del pedido',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const getPedidos = async (req: Request, res: Response) => {
    try {
        const pedidoRepository = AppDataSource.getRepository(Pedido);
        const pedidos = await pedidoRepository.find({
            relations: ['cliente'],
            order: {
                fecha_pedido: 'DESC'
            }
        });

        if (pedidos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron pedidos' });
        }

        return res.status(200).json({
            success: true,
            data: pedidos
        });

    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener pedidos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Actualizar estado y fecha de entrega del pedido
export const actualizarEstadoYFechaEntrega = async (req: Request, res: Response) => {
    const presupuestoId = parseInt(req.params.presupuestoId);
    const { fechaEntrega, estado } = req.body;
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        console.log('Actualizando pedido con presupuesto_id:', presupuestoId);

        // Verificar que el pedido existe
        const pedido = await queryRunner.query(`
            SELECT * FROM pedido 
            WHERE presupuesto_id = ?`,
            [presupuestoId]
        );

        if (!pedido || pedido.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontró pedido con presupuesto ID ${presupuestoId}`
            });
        }

        // Actualizar el pedido - Corregido el nombre de la columna
        await queryRunner.query(`
            UPDATE pedido 
            SET 
                estado = ?,
                fecha_entrega = ?
            WHERE presupuesto_id = ?`,
            [estado, fechaEntrega, presupuestoId]
        );

        await queryRunner.commitTransaction();

        res.json({
            success: true,
            message: 'Pedido actualizado exitosamente',
            data: {
                presupuestoId,
                estado,
                fechaEntrega
            }
        });

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error al actualizar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el pedido',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    } finally {
        await queryRunner.release();
    }
} 