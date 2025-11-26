import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import routes from './routes/index.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);

io.on('connection', (socket) => {
  socket.on('joinOrderRoom', (orderId: string) => socket.join(orderId));
  socket.on('orderStatusUpdate', ({ orderId, status }) => {
    io.to(orderId).emit('orderStatusUpdate', status);
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

export { app, server };
