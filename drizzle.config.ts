import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://postgres:postgres@localhost:5432/printers",
    ssl: { rejectUnauthorized: false },
  },
  // Tell drizzle-kit to only manage your own tables
  tablesFilter: ["!pg_*", "!_timescaledb_*"],
  schemaFilter: ["public"],
});
