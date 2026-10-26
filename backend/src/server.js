import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import showRoutes from './routes/showRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security and utility middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check & IMovies info endpoints
app.get(['/api/health', '/imovies/api/health', '/imovies'], (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'IMovies Backend API',
    url: `${req.protocol}://${req.get('host')}/imovies`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount API routes for both /api and /imovies/api
const mountRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/movies`, movieRoutes);
  app.use(`${prefix}/shows`, showRoutes);
  app.use(`${prefix}/bookings`, bookingRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
};

mountRoutes('/api');
mountRoutes('/imovies/api');

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎬 IMovies Backend running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}/imovies`);
  console.log(`🌐 Health check: http://localhost:${PORT}/imovies/api/health`);
  console.log(`===============================================`);
});

export default app;
