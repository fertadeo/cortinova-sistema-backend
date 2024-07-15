import { AppDataSource } from '../config/database';
import { Clientes } from '../entities/Clientes';

const clienteRepository = AppDataSource.getRepository(Clientes);

export const clientesService = {
  getAllClientes: async (): Promise<Clientes[]> => {
    return await clienteRepository.find();
  },
  createCliente: async (clienteData: Partial<Clientes>): Promise<Clientes> => {
    const cliente = clienteRepository.create(clienteData);
    return await clienteRepository.save(cliente);
  },
  
  updateCliente: async (id: number, clienteData: Partial<Clientes>): Promise<Clientes | undefined> => {
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
  },
};
