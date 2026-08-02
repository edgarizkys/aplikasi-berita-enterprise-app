import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: [
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error:', e.message);
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning:', e.message);
});

export async function initializeDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('[DB] Connected to PostgreSQL');

    await createTables();
    logger.info('[DB] All tables initialized');
  } catch (error) {
    logger.error('[DB] Initialization failed:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  try {
    // Verify all tables exist by querying information_schema
    const tableNames = [
      'articles',
      'authors',
      'categories',
      'comments',
      'users',
    ];

    for (const tableName of tableNames) {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        )
      `;
      
      if (!result[0].exists) {
        logger.warn(`[DB] Table ${tableName} does not exist. Ensure migrations are run.`);
      }
    }
  } catch (error) {
    logger.error('[DB] Table verification failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('[DB] Disconnected from PostgreSQL');
  } catch (error) {
    logger.error('[DB] Disconnect failed:', error);
    throw error;
  }
}

export { prisma };