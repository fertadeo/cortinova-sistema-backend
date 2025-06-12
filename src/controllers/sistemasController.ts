import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Sistemas } from "../entities/Sistemas";

export const sistemasController = {
    getSistemas: async (req: Request, res: Response) => {
        try {
            const sistemasRepository = AppDataSource.getRepository(Sistemas);
            const sistemas = await sistemasRepository.find({
                order: {
                    nombreSistemas: "ASC"
                }
            });
            
            res.json({
                success: true,
                data: sistemas
            });
        } catch (error) {
            console.error("Error al obtener sistemas:", error);
            res.status(500).json({
                success: false,
                error: "Error al obtener los sistemas",
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },

    getSistemaById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const sistemasRepository = AppDataSource.getRepository(Sistemas);
            const sistema = await sistemasRepository.findOne({
                where: { id: parseInt(id) }
            });

            if (!sistema) {
                return res.status(404).json({
                    success: false,
                    error: "Sistema no encontrado"
                });
            }

            res.json({
                success: true,
                data: sistema
            });
        } catch (error) {
            console.error("Error al obtener sistema:", error);
            res.status(500).json({
                success: false,
                error: "Error al obtener el sistema",
                details: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
};
