const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  console.log("🟡 Entró a /api/viajes");

  try {
    const result = await db.request().query("SELECT * FROM Viajes");
    console.log("🟢 Consulta exitosa");
    res.json(result.recordset);
  } catch (err) {
    console.log("🔴 Falló la consulta");
    console.error("❌ Error real:", err);
    res.status(500).json({ error: "Error al obtener viajes" });
  }
});

module.exports = router;
