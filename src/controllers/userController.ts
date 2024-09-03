// controllers/userController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database'; // Ajusta la ruta según tu estructura
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await AppDataSource.getRepository(User).findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash del password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear un nuevo usuario
    const newUser = new User();
    newUser.email = email;
    newUser.password = hashedPassword;

    await AppDataSource.getRepository(User).save(newUser);

    // Opcional: Crear un JWT para el usuario recién creado
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    res.status(201).json({
      message: 'User created successfully',
      token, // Opcional
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }




  };
  
   // Obtener Users 
  export const getUsers = async (req: Request, res: Response) => {
    try {
      const users = await AppDataSource.getRepository(User).find();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }


};
