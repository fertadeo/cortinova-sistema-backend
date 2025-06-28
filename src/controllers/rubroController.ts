import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Rubro } from '../entities/Rubro';

const rubroRepository = AppDataSource.getRepository(Rubro);

export const rubroController = {
  // Obtener todos los rubros
  getRubros: async (req: Request, res: Response) => {
    try {
      const rubros = await rubroRepository.find();
      res.json({ success: true, data: rubros });
    } catch (error) {
      console.error('Error al obtener rubros:', error);
      res.status(500).json({ success: false, message: 'Error al obtener rubros' });
    }
  },

  // Obtener un rubro por ID
  getRubroById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const rubro = await rubroRepository.findOneBy({ id });
      if (!rubro) {
        return res.status(404).json({ success: false, message: 'Rubro no encontrado' });
      }
      res.json({ success: true, data: rubro });
    } catch (error) {
      console.error('Error al obtener rubro:', error);
      res.status(500).json({ success: false, message: 'Error al obtener rubro' });
    }
  }
};
