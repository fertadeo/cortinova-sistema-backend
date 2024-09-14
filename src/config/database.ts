import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Clientes } from '../entities/Clientes';
import { Pedido } from '../entities/Pedido';
import { Producto } from '../entities/Producto';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'cortinova',
  synchronize: true,
  logging: false,
  entities: [User, Clientes, Pedido,Producto],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');
  } catch (error) {
    console.error('Error al conectar con la base de datos', error);
    process.exit(1); // Termina la aplicación si falla la conexión
  }
};
