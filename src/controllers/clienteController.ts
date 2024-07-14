import { Request, Response } from 'express';
import { Cliente } from '../models/cliente';

let clientes: Cliente[] = [];

export const getClientes = (req: Request, res: Response) => {
  res.json(clientes);
};

export const createCliente = (req: Request, res: Response) => {
  const nuevoCliente: Cliente = req.body;
  nuevoCliente.id = clientes.length + 1;
  clientes.push(nuevoCliente);
  res.status(201).json(nuevoCliente);
};

// Implementar otras funciones como updateCliente, deleteCliente, etc.
