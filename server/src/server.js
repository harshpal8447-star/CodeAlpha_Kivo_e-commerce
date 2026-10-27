import app from './app.js';
import { config } from './config/index.js';
import prisma from './lib/prisma.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`
  ══════════════════════════════════════════════════════
    🚀 KIVO BACKEND SERVER RUNNING
    🌍 Local:            http://localhost:${PORT}
    🩺 Health Check:     http://localhost:${PORT}/api/health
    📦 Mode:             ${config.nodeEnv}
    🗄️ Database:         ${config.databaseUrl ? 'Connected' : 'Missing DATABASE_URL'}
  ══════════════════════════════════════════════════════
  `);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Gracefully shutting down Kivo server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Prisma client disconnected. Server closed cleanly.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
