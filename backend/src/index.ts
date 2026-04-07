import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import usersRouter from './routes/users.routes';
import worldsRouter from './routes/worlds.routes';
import chaptersRouter from './routes/chapters.routes';
import missionsRouter from './routes/missions.routes';
import questionsRouter from './routes/questions.routes';
import quizRouter from './routes/quiz.routes';
import arenaRouter from './routes/arena.routes';
import progressRouter from './routes/progress.routes';
import cosmeticsRouter from './routes/cosmetics.routes';
import achievementsRouter from './routes/achievements.routes';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import { setupSocketHandlers } from './socket/socketHandler';

dotenv.config();

const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Variable de entorno ${envVar} no configurada. El servidor no puede arrancar.`);
    process.exit(1);
  }
}

const app = express();
const httpServer = createServer(app);
const isDev = process.env.NODE_ENV !== 'production';

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://dpngame.worldmos.es',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://dpngame.worldmos.es',
    'http://localhost:5173',
    'https://dpngame-backend.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
  credentials: true,
}));
app.use(compression());
app.use(morgan(isDev ? 'dev' : 'combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/worlds', worldsRouter);
app.use('/api/chapters', chaptersRouter);
app.use('/api/missions', missionsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/arena', arenaRouter);
app.use('/api/progress', progressRouter);
app.use('/api/cosmetics', cosmeticsRouter);
app.use('/api/achievements', achievementsRouter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    project: 'DPNGAME API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use(errorHandler);

setupSocketHandlers(io);

httpServer.listen(PORT, () => {
  logger.info(`DPNGAME API running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export { app, io };
