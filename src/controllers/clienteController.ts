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

export const createCliente = async (req: Request, res: Response) => {
  try {
    const nuevoCliente = req.body;
    const clienteCreado = await clientesService.createCliente(nuevoCliente);
    res.status(201).json(clienteCreado);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el cliente' });
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
