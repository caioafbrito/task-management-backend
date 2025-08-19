import pg from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

let _db: NodePgDatabase | undefined;
let _pool: Pool | undefined;
let _lastConnectionString: string | undefined;

export function getDb(connectionString?: string): {
  db: NodePgDatabase;
  pool: Pool;
} {
  const connStr = connectionString || process.env.DATABASE_URL!;
  if (!_db || !_pool || _lastConnectionString !== connStr) {
    if (_pool) {
      _pool.end(); // close past connections
    }
    const pool = new pg.Pool({
      connectionString: connStr,
    });
    _pool = pool;
    _db = drizzle(pool);
    _lastConnectionString = connStr;
  }
  return { db: _db, pool: _pool };
}
