import { Request, Response } from 'express';
import { clientesService } from '../services/clienteService';
import { Clientes } from '../entities/Clientes';
import { AppDataSource } from '../config/database';


const clienteRepository = AppDataSource.getRepository(Clientes);

// hacer un get de todos los clientes
export const getClientes = async (req: Request, res: Response) => {
  try {
    const clientes = await clientesService.getAllClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientes' });
    console.log(error)
  }
};

// crear un cliente nuevo y agregarlo a la BD
export const createCliente = async (req: Request, res: Response) => {
  try {
    const nuevoCliente = req.body;
    const clienteCreado = await clientesService.createCliente(nuevoCliente);
    res.status(201).json(clienteCreado);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el cliente' });
  }
};

export async function updateCliente(id: number, clienteData: Partial<Clientes>): Promise<Clientes | undefined> {
  try {
    // Find the cliente by ID
    const clienteToUpdate = await clienteRepository.findOneBy({ id });

    // Check if cliente exists
    if (!clienteToUpdate) {
      throw new Error(`Cliente with ID ${id} not found`);
    }

    // Merge cliente data (avoid mutation if necessary)
    Object.assign(clienteToUpdate, clienteData); // Or use a spread operator for a new object

    // Save the updated cliente
    return await clienteRepository.save(clienteToUpdate);
  } catch (error) {
    console.error('Error updating cliente:', error);
    throw error; // Re-throw for proper error handling in the controller
  }


}



