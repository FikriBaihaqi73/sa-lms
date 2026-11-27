// Rehearsal only. This program refuses the original database and accepts only
// an explicitly named lms_atomic_* clone. It does not modify migration files.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const sharedRequire = createRequire(path.join(root, "packages/shared/package.json"));
const apiRequire = createRequire(path.join(root, "apps/api/package.json"));
apiRequire("dotenv").config({ path: path.join(root, "apps/api/.env"), quiet: true });
const { Client } = sharedRequire("pg");

const pending = [
  "20260921004300",
  "20261009094630",
  "20261012000000_add_institution_id_to_guardians",
  "20261014000000_add_referral_code_and_expires_at_to_students",
  "20261021000000_add_institution_id_to_departments",
  "20261026142922",
  "20261031021545",
  "20261031023418_create_referral_codes_table",
  "20261031024238",
  "20261105000000_add_institution_id_to_attendance_statuses",
  "20261112000000_add_color_and_icon_to_attendance_statuses",
];
const duplicate = "20261031024238";
const migrationDir = path.join(root, "packages/shared/src/prisma/migrations");
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const sqlFor = (name) => fs.readFileSync(path.join(migrationDir, name, "migration.sql"));
const quote = (v) => `"${v.replace(/"/g, '""')}"`;

async function main() {
  const target = process.argv[2];
  if (!/^lms_atomic_[a-f0-9]{10}$/.test(target ?? "")) throw new Error("Only a named rehearsal clone is permitted");
  const source = new URL(process.env.DATABASE_URL);
  if (source.hostname !== "localhost" || (source.port || "5432") !== "5432" || source.pathname !== "/lms" || (source.searchParams.get("schema") || "public") !== "public") throw new Error("Unexpected source configuration");
  source.pathname = `/${target}`;
  const client = new Client({ connectionString: source.toString() });
  await client.connect();
  try {
    await client.query("BEGIN");
    const identity = await client.query("select current_database() as db, current_schema() as schema, inet_server_port() as port");
    if (identity.rows[0].db !== target || identity.rows[0].schema !== "public" || identity.rows[0].port !== 5432) throw new Error("Unexpected connection target");
    await client.query("select pg_advisory_xact_lock(hashtext('sa-lms-reconciliation'))");
    const tables = (await client.query("select tablename from pg_tables where schemaname='public' order by tablename")).rows.map((r) => r.tablename);
    for (const table of tables) await client.query(`LOCK TABLE public.${quote(table)} IN SHARE ROW EXCLUSIVE MODE`);
    const histories = (await client.query("select migration_name, checksum, finished_at, rolled_back_at from _prisma_migrations")).rows;
    const original = fs.readdirSync(migrationDir, { withFileTypes: true }).filter((d) => d.isDirectory() && !pending.includes(d.name)).map((d) => d.name);
    if (histories.length !== original.length || histories.some((r) => !r.finished_at || r.rolled_back_at) || original.some((name) => !histories.some((r) => r.migration_name === name))) throw new Error("Unexpected migration history");
    for (const row of histories) {
      const bytes = sqlFor(row.migration_name);
      const normalized = Buffer.from(bytes.toString("utf8").replace(/\r\n/g, "\n"));
      if (row.checksum !== sha(bytes) && row.checksum !== sha(normalized)) throw new Error(`Unexpected checksum: ${row.migration_name}`);
    }
    for (const table of ["academic_years", "Departments", "students", "guardians", "attendance_statuses"]) {
      const r = await client.query(`select count(*)::int as count from public.${quote(table)}`);
      if (r.rows[0].count !== 0) throw new Error(`Review ownership and data before proceeding: ${table} is not empty`);
    }
    const before = new Map();
    for (const table of tables.filter((name) => name !== "_prisma_migrations")) before.set(table, (await client.query(`select count(*)::int as count from public.${quote(table)}`)).rows[0].count);
    if (sha(sqlFor("20261031021545")) !== sha(sqlFor(duplicate))) throw new Error("Duplicate migration SQL differs");
    for (const [index, name] of pending.entries()) {
      const sql = sqlFor(name);
      if (/^\s*(insert\s+into|update\s+\S+\s+set|delete\s+from|truncate|drop\s+table|.*drop\s+column)\b/im.test(sql.toString("utf8"))) throw new Error(`Prohibited data operation in ${name}`);
      if (name !== duplicate) await client.query(sql.toString("utf8"));
      else {
        const found = await client.query("select to_regclass('public.referral_codes') as name");
        if (!found.rows[0].name) throw new Error("First referral migration was not applied");
      }
      // Prisma resolve records a checksum, finished timestamp, empty logs and
      // zero applied steps. This direct write is nonstandard and clone-only.
      await client.query("insert into _prisma_migrations (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count) values ($1,$2,now(),$3,'',now(),0)", [crypto.randomUUID(), sha(sql), name]);
      if (process.argv.includes("--simulate-failure") && index === 6) throw new Error("Intentional rollback test");
    }
    for (const [table, count] of before) if ((await client.query(`select count(*)::int as count from public.${quote(table)}`)).rows[0].count !== count) throw new Error(`Row count changed: ${table}`);
    await client.query("COMMIT");
    console.log("Clone reconciliation committed atomically:", target);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}
main().catch((error) => { console.error("Reconciliation rolled back:", error.message); process.exitCode = 1; });
