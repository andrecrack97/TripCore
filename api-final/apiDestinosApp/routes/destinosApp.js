const express = require("express");
const router = express.Router();
const svc = require("../services/destinosApp.service");

// ======================
// RUTA: /api/destinos-app/top
// ======================
// Devuelve los destinos principales (top) según filtros opcionales
// GET /api/destinos-app/top?country=Argentina&season=Verano&climate=Mediterráneo&limit=12
router.get("/top", async (req, res) => {
  try {
    const { country, season, climate, limit } = req.query;
    const data = await svc.listTop({
      limit: Number(limit) || 12, // máximo 12 resultados
      country,
      season,
      climate,
    });
    res.json({ data });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ===========================
// RUTA: /api/destinos-app/autocomplete
// ===========================
// Devuelve destinos para autocompletar (por nombre o país)
// GET /api/destinos-app/autocomplete?q=bu&limit=8
router.get("/autocomplete", async (req, res) => {
  try {
    const { q, limit } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ message: "Falta ?q=" });
    const data = await svc.autocomplete({ q: q.trim(), limit: Number(limit) || 8 });
    res.json({ data });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ============================
// RUTA: /api/destinos-app/:id
// ============================
// Devuelve un destino completo (detalles de la base de datos)
// GET /api/destinos-app/:id
router.get("/:id", async (req, res) => {
  try {
    const data = await svc.getById(req.params.id);
    if (!data) return res.status(404).json({ message: "Destino no encontrado" });
    res.json({ data });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// =================================
// RUTA NUEVA: /api/destinos-app/:id/sugerencias
// =================================
// Devuelve las sugerencias de transporte, alojamiento y actividades
// GET /api/destinos-app/:id/sugerencias
router.get("/:id/sugerencias", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener transportes recomendados
    const transportes = (
      await pool.query(
        `SELECT id, kind, provider, from_city, from_country, to_city, to_country,
                duration_min, price_usd, carbon_kg, link_url, rating
         FROM transportes
         WHERE destino_id = $1
         ORDER BY price_usd ASC
         LIMIT 3;`,
        [id]
      )
    ).rows;

    // Obtener hoteles recomendados
    const hoteles = (
      await pool.query(
        `SELECT id, name, stars, rating, price_night_usd, address, image_url, link_url
         FROM hoteles
         WHERE destino_id = $1
         ORDER BY price_night_usd ASC
         LIMIT 3;`,
        [id]
      )
    ).rows;

    // Obtener actividades recomendadas
    const actividades = (
      await pool.query(
        `SELECT id, title, category, duration_hours, price_usd,
                meeting_point, image_url, link_url, rating
         FROM actividades
         WHERE destino_id = $1
         ORDER BY rating DESC
         LIMIT 4;`,
        [id]
      )
    ).rows;

    res.json({ transportes, hoteles, actividades });
  } catch (error) {
    console.error("❌ Error en /sugerencias:", error);
    res.status(500).json({ message: "Error al obtener sugerencias" });
  }
});

module.exports = router;
