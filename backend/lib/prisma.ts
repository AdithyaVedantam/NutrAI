import { PrismaClient } from "@prisma/client";

// One shared database client for the whole backend.
export const prisma = new PrismaClient();
