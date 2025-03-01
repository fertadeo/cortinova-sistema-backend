import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Medidas } from '../entities/Medidas';

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

  // Crear una nueva medida
  createMedida: async (req: Request, res: Response) => {
    try {
      const medidasRepository = AppDataSource.getRepository(Medidas);
      const nuevaMedida = medidasRepository.create(req.body);
      const resultado = await medidasRepository.save(nuevaMedida);
      
      res.status(201).json({ 
        success: true, 
        data: resultado,
        message: 'Medida creada exitosamente'
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

  // Actualizar una medida existente
  updateMedida: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const medidasRepository = AppDataSource.getRepository(Medidas);
      const resultado = await medidasRepository.update(id, req.body);
      
      if (resultado.affected === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Medida no encontrada' 
        });
      }
      
      const medidaActualizada = await medidasRepository.findOne({ 
        where: { id: parseInt(id) } 
      });
      
      res.json({ 
        success: true, 
        data: medidaActualizada,
        message: 'Medida actualizada exitosamente'
      });
    } catch (error) {
      console.error(`Error al actualizar medida con ID ${id}:`, error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al actualizar medida',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Eliminar una medida
  deleteMedida: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const medidasRepository = AppDataSource.getRepository(Medidas);
      const resultado = await medidasRepository.delete(id);
      
      if (resultado.affected === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Medida no encontrada' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Medida eliminada exitosamente'
      });
    } catch (error) {
      console.error(`Error al eliminar medida con ID ${id}:`, error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al eliminar medida',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}; 