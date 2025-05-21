import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import productRoutes from './routes/productRoutes';
import { requestLogger, requestIdMiddleware } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { setupSwagger } from './utils/swagger';
import { apiLimiter, productLimiter } from './middleware/rateLimiter';

const app: Application = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(requestIdMiddleware);
app.use(requestLogger);

app.use(apiLimiter);

setupSwagger(app);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
  });
});

app.use('/product', productLimiter, productRoutes);

app.use('*', notFoundHandler);
app.use(errorHandler);

export default app;
