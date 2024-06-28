import 'reflect-metadata';
import { DataSource } from 'typeorm';
import express from 'express';
import { User } from './entity/User';

const app = express();
const port = 8080;

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
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080/users');
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

  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
}).catch(error => console.log(error));
