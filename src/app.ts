import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Rutas - se importarán después
// import productRoutes from './routes/productRoutes';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Rutas - se implementarán después
// app.use('/product', productRoutes);

// Ruta básica de health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
  });
});

// Manejador de rutas no encontradas - se implementará después
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server!`,
  });
});

export default app;
