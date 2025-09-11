import { Request, Response } from 'express';
import { Clientes } from '../entities/Clientes';
import { Pedido } from '../entities/Pedido';
import { AppDataSource } from '../config/database';

const clienteRepository = AppDataSource.getRepository(Clientes);
const pedidoRepository = AppDataSource.getRepository(Pedido);

export const clienteController = {
    // Obtener todos los clientes
    getClientes: async (req: Request, res: Response) => {
        try {
            const clientes = await clienteRepository.find();
            res.json({
                success: true,
                data: clientes
            });
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al obtener los clientes' 
            });
        }
    },

    // Obtener cliente por ID
    getClienteById: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            console.log('ID recibido:', id); // Debug log

            const cliente = await clienteRepository.findOneBy({ id });
            console.log('Cliente encontrado:', cliente); // Debug log

            if (!cliente) {
                console.log('Cliente no encontrado para ID:', id); // Debug log
                return res.status(404).json({
                    success: false,
                    message: `Cliente con ID ${id} no encontrado`
                });
            }

            return res.json({
                success: true,
                data: cliente
            });
        } catch (error) {
            console.error('Error al obtener cliente:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener el cliente',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    // Crear cliente
    createCliente: async (req: Request, res: Response) => {
        try {
            // Verificar si el cliente ya existe por DNI
            if (req.body.dni) {
                const clienteExistente = await clienteRepository.findOne({ 
                    where: { dni: req.body.dni } 
                });
                
                if (clienteExistente) {
                    return res.status(400).json({
                        success: false,
                        message: 'El cliente con este DNI ya existe'
                    });
                }
            }

            const nuevoCliente = clienteRepository.create(req.body);
            const resultado = await clienteRepository.save(nuevoCliente);
            
            res.status(201).json({
                success: true,
                data: resultado
            });
        } catch (error) {
            console.error('Error al crear cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el cliente'
            });
        }
    },

    // Actualizar cliente
    updateCliente: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const clienteToUpdate = await clienteRepository.findOneBy({ id });

            if (!clienteToUpdate) {
                return res.status(404).json({
                    success: false,
                    message: `Cliente con ID ${id} no encontrado`
                });
            }

            Object.assign(clienteToUpdate, req.body);
            const clienteActualizado = await clienteRepository.save(clienteToUpdate);

            res.json({
                success: true,
                data: clienteActualizado
            });
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el cliente'
            });
        }
    },

    // Eliminar cliente con todos sus datos vinculados
    deleteCliente: async (req: Request, res: Response) => {
        const queryRunner = AppDataSource.createQueryRunner();
        
        try {
            const id = parseInt(req.params.id);

            await queryRunner.connect();
            await queryRunner.startTransaction();

            // Verificar que el cliente existe
            const cliente = await queryRunner.query(`
                SELECT id, nombre, dni FROM clientes WHERE id = ?`, [id]);

            if (!cliente.length) {
                return res.status(404).json({
                    success: false,
                    message: `Cliente con ID ${id} no encontrado`
                });
            }

            const clienteData = cliente[0];

            // 1. Eliminar pedidos del cliente PRIMERO (tienen FK a presupuestos)
            await queryRunner.query(`
                DELETE FROM pedido WHERE clienteid = ?`, [id]);

            // 2. Eliminar items de presupuestos asociados
            await queryRunner.query(`
                DELETE pi FROM presupuesto_items pi
                INNER JOIN presupuestos p ON pi.presupuesto_id = p.id
                WHERE p.cliente_id = ?`, [id]);

            // 3. Eliminar presupuestos del cliente (después de eliminar pedidos)
            await queryRunner.query(`
                DELETE FROM presupuestos WHERE cliente_id = ?`, [id]);

            // 4. Eliminar medidas del cliente
            await queryRunner.query(`
                DELETE FROM medidas WHERE clienteId = ?`, [id]);

            // 5. Finalmente eliminar el cliente
            await queryRunner.query(`
                DELETE FROM clientes WHERE id = ?`, [id]);

            await queryRunner.commitTransaction();

            res.json({
                success: true,
                message: 'Cliente y todos sus datos vinculados eliminados exitosamente',
                data: {
                    clienteId: id,
                    nombre: clienteData.nombre,
                    dni: clienteData.dni,
                    eliminado: {
                        presupuestos: true,
                        pedidos: true,
                        medidas: true,
                        itemsPresupuestos: true
                    }
                }
            });

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error al eliminar cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el cliente y sus datos vinculados',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        } finally {
            await queryRunner.release();
        }
    },

    // Obtener clientes por mes
    getClientesPorMes: async (req: Request, res: Response) => {
        try {
            const resultado = await clienteRepository.query(`
                SELECT 
                    MONTH(fecha_registro) AS mes, 
                    COUNT(*) AS cantidad 
                FROM clientes
                GROUP BY MONTH(fecha_registro)
                ORDER BY mes
            `);

            res.json({
                success: true,
                data: resultado
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de clientes'
            });
        }
    },

    // Obtener próximo ID de cliente
    getNextClienteId: async (req: Request, res: Response) => {
        try {
            const resultado = await clienteRepository.query(`
                SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM clientes
            `);

            res.json({
                success: true,
                data: {
                    nextId: resultado[0].next_id
                }
            });
        } catch (error) {
            console.error('Error al obtener próximo ID:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el próximo ID de cliente',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
};
