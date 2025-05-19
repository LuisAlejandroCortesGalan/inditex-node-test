import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import productRoutes from './routes/productRoutes';
import { requestLogger, requestIdMiddleware } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(requestIdMiddleware);
app.use(requestLogger);

// Rutas
app.use('/product', productRoutes);

// Ruta básica de health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
  });
});

// Manejador de rutas no encontradas
app.use('*', notFoundHandler);

// Manejador de errores
app.use(errorHandler);

export default app;