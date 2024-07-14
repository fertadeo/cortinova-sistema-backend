import 'reflect-metadata';
import colors from 'colors'
import { DataSource } from 'typeorm';
import express from 'express';
import { User } from './entity/User';
import clientesRoutes from './routes/clientesRoutes';

const app = express();
const port = 8080;

const processRequest = (req: { url: any; },res: {
  setHeader(arg0: string, arg1: string): unknown;
  statusCode: number; end: (arg0: string) => void; 
}) => {
  if (req.url === '/') {
    res.statusCode = 200 //OK
    res.setHeader('Content-type', 'text/plain')
    res.end('Bienvenido a mi pagina de inicio')
  }
}


app.use(express.json());

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'cortinova',
  synchronize: true,
  logging: false,
  entities: [User],
});


// Middleware para habilitar CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    // Otros encabezados y métodos permitidos según sea necesario
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
  });

  
AppDataSource.initialize().then(async () => {
  const userRepository = AppDataSource.getRepository(User);

  app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
  });

  app.get('/users', async (req, res) => {
    const users = await userRepository.find();
    res.json(users);
  });

  app.post('/users', async (req, res) => {
    const user = userRepository.create(req.body);
    const result = await userRepository.save(user);
    
    res.send(result);
    
  });
    
  app.use(express.json());

app.use('/api/clientes', clientesRoutes);




  app.listen(port, () => {
    console.log(colors.blue(`Servidor escuchando en http://localhost:${port}`));
  });
}).catch(error => console.log(error));
function cors(_corsOptions: { origin: string; methods: string[]; allowedHeaders: string[]; }): any {
  throw new Error('Function not implemented.');
}

