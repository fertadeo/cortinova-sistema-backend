import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Clientes } from '../entities/Clientes';
import { Pedido } from '../entities/Pedido';
import { Producto } from '../entities/Producto';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Determinar si estamos en modo producción o desarrollo
const isProduction = process.env.NODE_ENV === 'production';

// Configurar las variables de conexión dependiendo del entorno
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: isProduction ? process.env.DB_HOST_PROD : process.env.DB_HOST_DEV,
  port:  3306, // Se usa el puerto común de MySQL o uno que configures
  username: isProduction ? process.env.DB_USER_PROD : process.env.DB_USER_DEV,
  password: isProduction ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD_DEV,
  database: isProduction ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV,
  synchronize: true,
  logging: false,
  entities: [User, Clientes, Pedido, Producto],
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
