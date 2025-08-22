const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,   // 'localhost' o 'A-PHZ2C-DID-03'
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    // Descomentar si tenés instancia nombrada:
    // instanceName: 'SQLEXPRESS'
  }
};

sql.connect(config)
  .then(() => console.log("✅ Conectado a SQL Server"))
  .catch(err => console.error("❌ Error de conexión:", err));

module.exports = sql;
