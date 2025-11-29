import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import routes from './routes/index.js';
import { setIoInstance } from './services/socket.js';
import { prisma } from './utils/prisma.js';
import { env } from './config/env.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
});
setIoInstance(io);

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') return next();
  return express.json()(req, res, next);
});
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api', routes);

io.on('connection', (socket) => {
  const extractUser = () => {
    const headerToken = typeof socket.handshake.headers.authorization === 'string'
      ? socket.handshake.headers.authorization
      : undefined;
    const bearerToken = headerToken?.startsWith('Bearer ')
      ? headerToken.split(' ')[1]
      : undefined;
    const token = (socket.handshake.auth as any)?.token ?? bearerToken;

    if (!token || typeof token !== 'string') return null;

    try {
      return jwt.verify(token, env.jwtAccessSecret) as { sub: string; role: string };
    } catch (error) {
      return null;
    }
  };

  const canAccessOrder = async (userId: string, orderId: string) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        userId: true,
        driver: { select: { userId: true } },
        restaurant: { select: { vendor: { select: { userId: true } } } },
      },
    });

    if (!order) return false;

    return (
      order.userId === userId ||
      order.driver?.userId === userId ||
      order.restaurant.vendor.userId === userId
    );
  };

  socket.on('join_order', async ({ orderId }: { orderId: string }) => {
    const user = extractUser();
    if (!user) {
      socket.emit('error', 'Unauthorized');
      return;
    }

    const allowed = await canAccessOrder(user.sub, orderId);
    if (!allowed) {
      socket.emit('error', 'Forbidden');
      return;
    }

    socket.join(`order:${orderId}`);
    socket.emit('joined_order', { orderId });
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

export { app, server };
