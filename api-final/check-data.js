const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || "tripcore",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "password",
  ssl: false,
});

async function main() {
  const countryArg = process.argv.slice(2).join(" ");
  console.log("🔎 Verificando datos. País filtro:", countryArg || "<sin filtro>");
  try {
    const tables = ["destinos", "transportes", "hoteles", "actividades"];
    for (const t of tables) {
      const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM ${t}`);
      console.log(`Tabla ${t}:`, rows[0].c);
    }

    if (countryArg) {
      const like = `%${countryArg}%`;
      const { rows: dests } = await pool.query(
        `SELECT id, nombre, pais FROM destinos WHERE pais ILIKE $1 LIMIT 5`,
        [like]
      );
      console.log("Destinos en país:", dests);

      const destIds = dests.map((d) => d.id);
      if (destIds.length) {
        const placeholders = destIds.map((_, i) => `$${i + 1}`).join(",");
        const q1 = await pool.query(
          `SELECT COUNT(*)::int AS c FROM transportes WHERE destino_id IN (${placeholders})`,
          destIds
        );
        const q2 = await pool.query(
          `SELECT COUNT(*)::int AS c FROM hoteles WHERE destino_id IN (${placeholders})`,
          destIds
        );
        const q3 = await pool.query(
          `SELECT COUNT(*)::int AS c FROM actividades WHERE destino_id IN (${placeholders})`,
          destIds
        );
        console.log(`Transportes para país (${countryArg}):`, q1.rows[0].c);
        console.log(`Hoteles para país (${countryArg}):`, q2.rows[0].c);
        console.log(`Actividades para país (${countryArg}):`, q3.rows[0].c);
      } else {
        console.log("No hay destinos que coincidan con el país indicado.");
      }
    }
  } catch (err) {
    console.error("❌ Error verificando datos:", err);
  } finally {
    await pool.end();
  }
}

main();


