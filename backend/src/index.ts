import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import apiRouter from './routes/api';
import { stellarService } from './services/stellar';

const app = express();

// ── Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.NODE_ENV === 'production' ? config.FRONTEND_URL : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API routes
app.use('/api', apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = config.PORT;

async function startServer() {
  // Initialize Stellar Service
  await stellarService.initialize();

  app.listen(PORT, () => {
    console.log(`🚀 ElectChain Backend running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${config.NODE_ENV}`);
    console.log(`🔗 Stellar Network: ${config.STELLAR_NETWORK}`);
  });
}

startServer();
