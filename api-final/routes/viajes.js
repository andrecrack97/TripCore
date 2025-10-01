const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "No autorizado" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.userId = payload.sub;
    next();
  } catch (_) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
}

// GET /api/viajes
router.get("/", auth, async (req, res) => {
  try {
    const tab = (req.query.tab || "history").toString();
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.max(parseInt(req.query.pageSize || "10", 10), 1);
    const offset = (page - 1) * pageSize;

    // Simplificación: devolvemos todos los viajes del usuario y simulamos tabs
    const { rows } = await pool.query(
      `SELECT id_viaje as id, id_usuario, nombre_viaje, fecha_inicio, fecha_fin, destino_principal as ciudad, 'Argentina' as pais, 4.6 as rating
         FROM viajes
        WHERE id_usuario = $1
        ORDER BY id_viaje DESC
        LIMIT $2 OFFSET $3`,
      [req.userId, pageSize, offset]
    );
    res.json({ items: rows, page, pageSize });
  } catch (err) {
    console.log("LIAM")
    console.error("❌ Error al obtener viajes:", err);
    res.status(500).json({ error: "Error al obtener viajes" });
  }
});

// POST /api/viajes/planificar
router.post("/planificar", async (req, res) => {
  const { id_usuario, nombre_viaje, fecha_inicio, fecha_fin } = req.body;
  if (!id_usuario || !nombre_viaje || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({
      success: false,
      message:
        "Campos requeridos: id_usuario, nombre_viaje, fecha_inicio (YYYY-MM-DD), fecha_fin (YYYY-MM-DD)",
    });
  }

  try {
    const insert = await pool.query(
      `INSERT INTO viajes (id_usuario, nombre_viaje, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4)
       RETURNING id_viaje, id_usuario, nombre_viaje, fecha_inicio, fecha_fin`,
      [id_usuario, nombre_viaje, fecha_inicio, fecha_fin]
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

// Favorito toggle fake (sin tabla específica): usa tabla favoritos si existe
router.patch("/:id/favorite", auth, async (req, res) => {
  try {
    const id = req.params.id;
    // toggle naive: si existe en favoritos lo borramos, si no lo insertamos
    const exists = await pool.query(
      `SELECT id_favorito FROM favoritos WHERE id_usuario = $1 AND tipo_elemento = 'viaje' AND id_elemento = $2 LIMIT 1`,
      [req.userId, id]
    );
    if (exists.rowCount > 0) {
      await pool.query(`DELETE FROM favoritos WHERE id_favorito = $1`, [exists.rows[0].id_favorito]);
      return res.json({ success: true, favorite: false });
    } else {
      await pool.query(
        `INSERT INTO favoritos (id_usuario, tipo_elemento, id_elemento) VALUES ($1, 'viaje', $2)`,
        [req.userId, id]
      );
      return res.json({ success: true, favorite: true });
    }
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
