const sql = require("mssql");

const config = {
  user: "tripcore_user",            // tu usuario
  password: "TripCore123!",         // tu contraseña
  server: "localhost",              // o el nombre de tu servidor
  database: "TripCore",             // tu base
  options: {
    encrypt: false,                 // desactivalo si no usás SSL
    trustServerCertificate: true    // útil en localhost
  }
};

async function testConnection() {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query("SELECT 1 AS Pong");
    console.log("✅ Conexión exitosa:", result.recordset);
    await sql.close();
  } catch (err) {
    console.error("❌ Error de conexión:", err);
  }
}

testConnection();
