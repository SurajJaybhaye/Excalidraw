import type { PrismaClient } from "./generated/prisma";

declare global {
  var __prisma: PrismaClient | undefined;
}

export {};
