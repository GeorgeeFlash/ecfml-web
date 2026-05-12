import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();
const connectionString = `${process.env.DATABASE_URL}`;

const adapter =
  process.env.NODE_ENV === "production"
    ? new PrismaNeon({ connectionString })
    : new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
