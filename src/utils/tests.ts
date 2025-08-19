import type { Pool } from "pg";

export async function waitForDb(pool: Pool, attempts: number, delayMs: number) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await pool.query("SELECT 1");
      console.log("DB is ready");
      return;
    } catch (error) {
      console.error(`DB not ready yet, retrying... (${i}/${attempts})`);
      console.error("Error connecting to DB:", error);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Unable to connect to DB after maximum retries");
}
