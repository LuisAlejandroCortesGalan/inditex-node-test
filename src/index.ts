import app from './app';
import config from './config/config';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Manejador de errores no capturados
process.on('uncaughtException', error => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(error);
  process.exit(1);
});

// Manejador de rechazos no manejados
process.on('unhandledRejection', error => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(error);
  server.close(() => {
    process.exit(1);
  });
});

export default server;
