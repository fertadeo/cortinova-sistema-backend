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
import rubrosRoutes from './routes/rubrosRoutes';
import { handleUploadError } from './middlewares/uploadError';

const app = express();
const port = process.env.PORT || 8081;

// Middleware de CORS debe ir PRIMERO
app.use(corsMiddleware);

// Middleware para parsing JSON
app.use(express.json());

// Middleware para logging detallado de requests (para debugging de precios)
app.use((req, res, next) => {
      // console.log(`\n=== REQUEST LOGGING ===`);
      // console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  
  if (req.method === 'POST' || req.method === 'PUT') {
    // console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    
    // Logging específico para campos de precio
    if (req.body.precio !== undefined) {
      // console.log('Campo precio:', req.body.precio, 'Tipo:', typeof req.body.precio, 'Es NaN:', isNaN(req.body.precio));
    }
    if (req.body.precioCosto !== undefined) {
      // console.log('Campo precioCosto:', req.body.precioCosto, 'Tipo:', typeof req.body.precioCosto, 'Es NaN:', isNaN(req.body.precioCosto));
    }
    
    // Para importación masiva
    if (req.body.productos && Array.isArray(req.body.productos)) {
      // console.log('Importación masiva detectada, productos:', req.body.productos.length);
      req.body.productos.forEach((prod: any, index: number) => {
        if (prod['Precio al Publico'] !== undefined) {
          // console.log(`Producto ${index} - Precio al Público:`, prod['Precio al Publico'], 'Tipo:', typeof prod['Precio al Publico']);
        }
        if (prod['Precio de Costo'] !== undefined) {
          // console.log(`Producto ${index} - Precio de Costo:`, prod['Precio de Costo'], 'Tipo:', typeof prod['Precio de Costo']);
        }
      });
    }
  }
  
  // console.log('=== FIN REQUEST LOGGING ===\n');
  next();
});

// Agregar middleware de manejo de errores de upload
app.use(handleUploadError);

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
app.use('/api/rubros', rubrosRoutes);

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
