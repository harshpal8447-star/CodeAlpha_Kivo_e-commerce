import { beforeAll, afterAll } from 'vitest';
import prisma from '../src/lib/prisma.js';

beforeAll(async () => {
  // Ensure connection
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
