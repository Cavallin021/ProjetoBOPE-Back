import { app } from './app';
import { env } from './config/env';
import { prisma, testDatabaseConnection } from './lib/prisma';

async function bootstrap() {
  try {
    await testDatabaseConnection();
    console.log('✅ Connected to PostgreSQL database successfully.');

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = async () => {
      console.log('\nShutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

void bootstrap();
