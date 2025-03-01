import { PrismaClient } from "@prisma/client"

// eslint-disable-next-line no-var
declare global {
  var cachedPrisma: PrismaClient
}

export let db: PrismaClient

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient()
  }
  db = global.cachedPrisma
}

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).prisma = db
}