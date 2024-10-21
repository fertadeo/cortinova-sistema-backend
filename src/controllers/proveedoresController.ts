import { Request, Response } from 'express';
import { Proveedores } from '../entities/Proveedores';
import { AppDataSource } from '../config/database'; // Configura tu datasource de TypeORM

// Repositorio para acceder a los proveedores
const proveedorRepository = AppDataSource.getRepository(Proveedores);

// Controlador para obtener todos los proveedores
export const obtenerProveedores = async (req: Request, res: Response) => {
  try {
    const proveedores = await proveedorRepository.find({ relations: ["productos"] });
    ; // Obtiene todos los proveedores
    res.json(proveedores); // Devuelve los proveedores en formato JSON
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los proveedores' });
    console.error('Error al obtener proveedores:', error);
  }
};

// Controlador para importar proveedores (si fuera necesario)
export const importarProveedores = async (req: Request, res: Response) => {
  const proveedores = req.body;
  console.log('Datos recibidos:', proveedores);

  if (!Array.isArray(proveedores)) {
    return res.status(400).json({ message: 'Formato de datos incorrecto. Se esperaba un array de proveedores.' });
  }

  try {
    for (const proveedor of proveedores) {
      const nuevoProveedor = new Proveedores();
      nuevoProveedor.id = proveedor.id;
      nuevoProveedor.nombreProveedores = proveedor.nombreProveedores;
     

      console.log('Guardando proveedor:', nuevoProveedor);

      await proveedorRepository.save(nuevoProveedor);
    }

    return res.status(200).json({ message: 'Proveedores importados correctamente' });
  } catch (error) {
    console.error('Error al importar proveedores:', error);
    return res.status(500).json({ message: 'Error al importar proveedores en la base de datos' });
  }
};
