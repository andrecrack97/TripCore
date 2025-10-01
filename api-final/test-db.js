const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || "tripcore",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "password",
  ssl: false
});

async function testConnection() {
  try {
    const result = await pool.query("SELECT 1 AS pong");
    console.log("✅ Conexión exitosa a PostgreSQL:", result.rows);
    await pool.end();
  } catch (err) {
    console.error("❌ Error de conexión:", err);
  }
}

testConnection();
