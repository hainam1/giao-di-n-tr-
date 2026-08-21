import app from './app.js';
import { config } from './config/app.config.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Boilerplate Backend Express Server Is Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🛠️  Environment: ${config.env}`);
  console.log(`==================================================`);
});

// Handling Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
