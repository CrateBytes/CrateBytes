import { NODE_ENV } from "$env/static/private";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (NODE_ENV !== "production") globalForPrisma.prisma = prisma;
