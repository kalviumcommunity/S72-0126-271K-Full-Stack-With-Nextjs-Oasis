import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is missing');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Reuse PrismaClient across hot reloads in development
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		adapter,
		log: ['query', 'info', 'warn', 'error'],
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}