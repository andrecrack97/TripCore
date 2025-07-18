const express = require("express");
const router = express.Router();
const db = require("../db");

// Ruta GET actual para probar conexión
router.get("/", async (req, res) => {
  console.log("🟡 Entró a /api/viajes");

  try {
    const result = await db.request().query("SELECT * FROM Usuarios"); // ⚠️ ¿Querías 'Viajes'?
    console.log("🟢 Consulta exitosa");
    res.json(result.recordset);
  } catch (err) {
    console.log("🔴 Falló la consulta");
    console.error("❌ Error real:", err);
    res.status(500).json({ error: "Error al obtener viajes" });
  }
});

// 🆕 Ruta para guardar un nuevo viaje planificado
router.post("/planificar", async (req, res) => {
  const { origen, destino } = req.body;

  if (!origen || !destino) {
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
  }

  try {
    await db.request()
      .input("origen", origen)
      .input("destino", destino)
      .query("INSERT INTO Viajes (origen, destino) VALUES (@origen, @destino)");

    res.json({ success: true, message: "Viaje planificado correctamente" });
  } catch (error) {
    console.error("❌ Error al insertar viaje:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

module.exports = router;
