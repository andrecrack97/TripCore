const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/viajes
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id_viaje, id_usuario, destino, fecha_inicio, fecha_fin
       FROM viajes
       ORDER BY id_viaje DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener viajes:", err);
    res.status(500).json({ error: "Error al obtener viajes" });
  }
});

// POST /api/viajes/planificar
router.post("/planificar", async (req, res) => {
  const { id_usuario, destino, fecha_inicio, fecha_fin } = req.body;
  if (!id_usuario || !destino || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({
      success: false,
      message:
        "Campos requeridos: id_usuario, destino, fecha_inicio (YYYY-MM-DD), fecha_fin (YYYY-MM-DD)",
    });
  }

  try {
    const insert = await pool.query(
      `INSERT INTO viajes (id_usuario, destino, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4)
       RETURNING id_viaje, id_usuario, destino, fecha_inicio, fecha_fin`,
      [id_usuario, destino, fecha_inicio, fecha_fin]
    );

    res.status(201).json({
      success: true,
      message: "Viaje planificado correctamente",
      viaje: insert.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al insertar viaje:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

module.exports = router;
