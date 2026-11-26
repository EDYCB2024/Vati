import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let instance: NeonHttpDatabase<typeof schema> | null = null;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not configured. Add DATABASE_URL in Vercel Environment Variables."
      );
    }
    const sql = neon(url);
    instance = drizzle(sql, { schema });
  }
  return instance;
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const targetDb = getDb();
    const value = Reflect.get(targetDb, prop, receiver);
    return typeof value === "function" ? value.bind(targetDb) : value;
  },
});
