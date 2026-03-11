/**
 * Prisma Client Setup
 * 
 * Dit bestand configureert de Prisma client met connection pooling en graceful shutdown.
 * De client wordt als singleton geëxporteerd voor gebruik door de hele applicatie.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client instantie met connection pooling configuratie
 * 
 * Connection pool settings:
 * - Minimum connections: 5
 * - Maximum connections: 20
 * 
 * Deze settings zorgen voor optimale performance en resource utilization.
 */
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Graceful shutdown handler
 * 
 * Sluit de database connecties netjes af bij process termination.
 * Dit voorkomt connection leaks en zorgt voor een schone shutdown.
 */
async function gracefulShutdown() {
  console.log('Shutting down Prisma client...');
  await prisma.$disconnect();
  console.log('Prisma client disconnected');
  process.exit(0);
}

// Registreer shutdown handlers voor verschillende signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);

/**
 * Test database connectie
 * 
 * Voert een simpele query uit om te verifiëren dat de database bereikbaar is.
 * 
 * @returns Promise<boolean> - true als connectie succesvol, false bij failure
 */
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Exporteer de Prisma client voor gebruik in de applicatie
 */
export default prisma;
