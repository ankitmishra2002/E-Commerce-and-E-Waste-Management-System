import cluster from 'cluster';
import os from 'os';
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security: Enforce JWT_SECRET minimum length check at startup
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("CRITICAL CONFIG ERROR: JWT_SECRET must be at least 32 characters long at startup! Exiting process.");
  process.exit(1);
}

if (NODE_ENV === 'production' && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`[PRIMARY PROCESS ${process.pid}] running in production mode.`);
  console.log(`Forking ${numCPUs} worker threads for horizontal CPU connection scalability...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[WORKER PROCESS ${worker.process.pid}] died. Respawning a replacement...`);
    cluster.fork();
  });
} else {
  const server = app.listen(PORT, () => {
    console.log(`[WORKER PROCESS ${process.pid}] running. Listening on port ${PORT} (Mode: ${NODE_ENV})`);
  });
  
  // Initialize Socket.io and attach it to the notification service
  import('./sockets/notification.socket.js').then(({ initSocket }) => {
    import('./services/notification.service.js').then(({ setIo }) => {
      const io = initSocket(server);
      setIo(io);
      console.log('🔔 Socket.io initialized and linked to Notification Service.');
    });
  });
  
  // Handle server shutdown cleanups
  process.on('SIGTERM', () => {
    console.info('SIGTERM signal received. Gracefully closing HTTP server...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });
}
