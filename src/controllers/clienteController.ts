import { Request, Response } from 'express';
import { clientesService } from '../services/clienteService';
import { Clientes } from '../entities/Clientes';
import { AppDataSource } from '../config/database';

const clienteRepository = AppDataSource.getRepository(Clientes);

export const getClientes = async (req: Request, res: Response) => {
  try {
    const clientes = await clientesService.getAllClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientes' });
    console.log(error);
  }
};




export const getClientesPorMes = async (req: Request, res: Response) => {
  try {
      const query = `
          SELECT 
              MONTH(fecha_registro) AS mes, 
              COUNT(*) AS cantidad 
          FROM clientes
          GROUP BY MONTH(fecha_registro)
          ORDER BY mes;
      `;

      const result = await AppDataSource.query(query);
      res.json(result);
  } catch (error) {
      console.error(error); // Agrega este log para ver el error en la consola
      res.status(500).json({ error: 'Error al obtener los clientes por mes' });
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const nuevoCliente = req.body;
    const clienteCreado = await clientesService.createCliente(nuevoCliente);
    res.status(201).json(clienteCreado);
  } catch (error) {
    // Verificar si el error es una instancia de Error
    if (error instanceof Error) {
      console.log(`Error al crear cliente: ${error.message}`);  // Registro del error en la consola
      if (error.message === 'El cliente ya existe') {
        return res.status(400).json({ message: 'El cliente ya existe' });
      }
      return res.status(500).json({ message: error.message });
    }

    // Si el error no es de tipo Error, manejarlo genéricamente
    res.status(500).json({ message: 'Error desconocido al crear el cliente' });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const clienteData: Partial<Clientes> = req.body;

  try {
    const clienteActualizado = await clientesService.updateCliente(id, clienteData);
    if (!clienteActualizado) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(clienteActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el cliente' });
    console.log(error);
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    await clientesService.deleteCliente(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    res.status(500).json({ message: 'Error al eliminar el cliente' });
  }
};
