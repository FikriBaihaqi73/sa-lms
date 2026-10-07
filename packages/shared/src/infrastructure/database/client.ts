import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

const { Pool } = pkg;

import { PrismaClient } from "#generated/client";
import config from "../../config/database.js";

let prisma: PrismaClient;

const getSchema = (connectionString: string): string | undefined => {
  try {
    const url = new URL(connectionString);
    return url.searchParams.get("schema") || undefined;
  } catch {
    return undefined;
  }
};

export const getPrisma = () => {
  if (!prisma) {
    const pool = new Pool({ connectionString: config.DATABASE_URL });
    const schema = getSchema(config.DATABASE_URL);
    const adapter = new PrismaPg(pool, schema ? { schema } : undefined);
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
};
