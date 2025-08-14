import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { Pool } from "pg";

export async function waitForDb(
  pool: Pool,
  retries = 30,
  delayMs = 2000
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query("SELECT 1");
      console.log("DB is ready!");
      return;
    } catch (e) {
      console.log(`DB not ready yet, retrying... (${i + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error("Timeout waiting for database to be ready");
}

export function getConnectionUrlFromContainer(
  container: StartedPostgreSqlContainer
): string {
  return `postgresql://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getPort()}/${container.getDatabase()}`;
}
