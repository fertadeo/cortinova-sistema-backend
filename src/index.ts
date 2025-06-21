import 'reflect-metadata';
import express from 'express';
import colors from 'colors';
import { initializeDatabase, AppDataSource } from './config/database';
import { User } from './entities/User';
import clientesRoutes from './routes/clientesRoutes';
import { corsMiddleware } from './middlewares/cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/userRoutes';
import productosRoutes from './routes/productRoutes';
import proveedoresRoutes from './routes/proveedoresRoutes';
import presupuestoRoutes from './routes/presupuestoRoutes';
import sistemasRoutes from './routes/sistemasRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import medidasRoutes from './routes/medidasRoutes';

const app = express();
const port = process.env.PORT || 8081;

// Middleware de CORS debe ir PRIMERO
app.use(corsMiddleware);

// Middleware para parsing JSON
app.use(express.json());

// Middleware para logging de requests (opcional, para debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Rutas
app.use('/api/clientes', clientesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/presupuestos', presupuestoRoutes);
app.use('/api/sistemas', sistemasRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/medidas', medidasRoutes);

// Rutas adicionales
app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

app.get('/users', async (req, res) => {
  const userRepository = AppDataSource.getRepository(User);
  const users = await userRepository.find();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = userRepository.create(req.body);
  const result = await userRepository.save(user);
  res.send(result);
});

// Inicialización de la base de datos y arranque del servidor
AppDataSource.initialize()
    .then(() => {
        app.listen(port, () => {
            console.log(colors.blue(`Servidor escuchando en http://localhost:${port}`));
        });
    })
    .catch(error => console.log(error));
