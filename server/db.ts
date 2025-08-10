import "jsr:@std/dotenv/load";
import { MongoClient, type Db } from "npm:mongodb@6.8.0";

let dbPromise: Promise<Db> | null = null;

export function getDb(): Promise<Db> {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    const uri = Deno.env.get("MONGODB_URI") || "mongodb://localhost:27017";
    const dbName = Deno.env.get("DATABASE_NAME") || "meaningmaker";
    const client = new MongoClient(uri);
    await client.connect();
    return client.db(dbName);
  })();
  return dbPromise;
}


