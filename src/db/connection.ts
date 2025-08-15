import pg from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

let _db: NodePgDatabase | undefined;
let _pool: Pool | undefined;

// Can create in the first time, or just return.
export function getDb(connectionString?: string): {
  db: NodePgDatabase;
  pool: Pool;
} {
  if (!_db || !_pool) {
    const pool = new pg.Pool({
      connectionString: connectionString || process.env.DATABASE_URL!,
    });
    _pool = pool;
    _db = drizzle(pool);
  }

  return { db: _db, pool: _pool };
}
