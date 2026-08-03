import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { ReglaNegocio } from '../entities/ReglaNegocio';

const DEFAULT_REGLAS: Array<Partial<ReglaNegocio>> = [
  { nombreSistema: 'Roller', matchKey: 'roller', areaMinimaM2: 1, anchoMinimoCm: 100, activo: true },
  { nombreSistema: 'Dubai', matchKey: 'dubai', areaMinimaM2: 1, anchoMinimoCm: 100, activo: true },
  { nombreSistema: 'Bandas Verticales', matchKey: 'bandas verticales', areaMinimaM2: 1.5, anchoMinimoCm: 150, activo: true },
  { nombreSistema: 'Barcelona', matchKey: 'barcelona', areaMinimaM2: 1.5, anchoMinimoCm: 150, activo: true },
  { nombreSistema: 'Venecianas', matchKey: 'veneciana', areaMinimaM2: 1, anchoMinimoCm: 0, activo: true },
];

const getRepo = () => AppDataSource.getRepository(ReglaNegocio);

const ensureTable = async () => {
  await AppDataSource.query(`
    CREATE TABLE IF NOT EXISTS reglas_negocio (
      id INT NOT NULL AUTO_INCREMENT,
      nombre_sistema VARCHAR(120) NOT NULL,
      match_key VARCHAR(120) NOT NULL,
      area_minima_m2 DECIMAL(10,2) NOT NULL DEFAULT 0,
      ancho_minimo_cm DECIMAL(10,2) NOT NULL DEFAULT 0,
      activo TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      UNIQUE INDEX UQ_reglas_negocio_match_key (match_key),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const seedIfEmpty = async () => {
  const repo = getRepo();
  const count = await repo.count();
  if (count === 0) {
    await repo.save(DEFAULT_REGLAS.map((r) => repo.create(r)));
  }
};

const toNumber = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const reglaNegocioController = {
  getReglas: async (_req: Request, res: Response) => {
    try {
      await ensureTable();
      await seedIfEmpty();
      const reglas = await getRepo().find({ order: { nombreSistema: 'ASC' } });
      res.json(reglas);
    } catch (error) {
      console.error('Error al obtener reglas de negocio:', error);
      res.status(500).json({ message: 'Error al obtener reglas de negocio' });
    }
  },

  createRegla: async (req: Request, res: Response) => {
    try {
      await ensureTable();
      const { nombreSistema, matchKey, areaMinimaM2, anchoMinimoCm, activo } = req.body;

      if (!nombreSistema?.trim() || !matchKey?.trim()) {
        return res.status(400).json({ message: 'nombreSistema y matchKey son obligatorios' });
      }

      const repo = getRepo();
      const key = String(matchKey).trim().toLowerCase();
      const existing = await repo.findOne({ where: { matchKey: key } });
      if (existing) {
        return res.status(409).json({ message: 'Ya existe una regla con esa clave de coincidencia' });
      }

      const regla = repo.create({
        nombreSistema: String(nombreSistema).trim(),
        matchKey: key,
        areaMinimaM2: toNumber(areaMinimaM2, 0),
        anchoMinimoCm: toNumber(anchoMinimoCm, 0),
        activo: activo === undefined ? true : Boolean(activo),
      });

      const saved = await repo.save(regla);
      res.status(201).json(saved);
    } catch (error) {
      console.error('Error al crear regla de negocio:', error);
      res.status(500).json({ message: 'Error al crear regla de negocio' });
    }
  },

  updateRegla: async (req: Request, res: Response) => {
    try {
      await ensureTable();
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: 'ID inválido' });

      const repo = getRepo();
      const regla = await repo.findOne({ where: { id } });
      if (!regla) return res.status(404).json({ message: 'Regla no encontrada' });

      const { nombreSistema, matchKey, areaMinimaM2, anchoMinimoCm, activo } = req.body;

      if (nombreSistema !== undefined) regla.nombreSistema = String(nombreSistema).trim();
      if (matchKey !== undefined) {
        const key = String(matchKey).trim().toLowerCase();
        const conflict = await repo.findOne({ where: { matchKey: key } });
        if (conflict && conflict.id !== id) {
          return res.status(409).json({ message: 'Ya existe una regla con esa clave de coincidencia' });
        }
        regla.matchKey = key;
      }
      if (areaMinimaM2 !== undefined) regla.areaMinimaM2 = toNumber(areaMinimaM2, 0);
      if (anchoMinimoCm !== undefined) regla.anchoMinimoCm = toNumber(anchoMinimoCm, 0);
      if (activo !== undefined) regla.activo = Boolean(activo);

      const saved = await repo.save(regla);
      res.json(saved);
    } catch (error) {
      console.error('Error al actualizar regla de negocio:', error);
      res.status(500).json({ message: 'Error al actualizar regla de negocio' });
    }
  },

  deleteRegla: async (req: Request, res: Response) => {
    try {
      await ensureTable();
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: 'ID inválido' });

      const repo = getRepo();
      const regla = await repo.findOne({ where: { id } });
      if (!regla) return res.status(404).json({ message: 'Regla no encontrada' });

      await repo.remove(regla);
      res.json({ message: 'Regla eliminada' });
    } catch (error) {
      console.error('Error al eliminar regla de negocio:', error);
      res.status(500).json({ message: 'Error al eliminar regla de negocio' });
    }
  },
};
