import { PrismaClient } from '@prisma/client';

// Cliente único compartido por todo el proceso -- evitar instanciar PrismaClient por request.
export const prisma = new PrismaClient();
