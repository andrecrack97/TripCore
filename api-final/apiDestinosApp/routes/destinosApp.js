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
router.get("/sugerencias", async (req, res) => {
  try {
    const { country } = req.query;
    if (!country || !country.trim()) {
      return res.status(400).json({ message: "Falta ?country=" });
    }

    const likeCountry = `%${country.trim()}%`;
    const [transportes, hoteles, actividades] = await Promise.all([
      svc.getTransportesByCountry({ country: likeCountry, limit: 3 }),
      svc.getHotelesByCountry({ country: likeCountry, limit: 3 }),
      svc.getActividadesByCountry({ country: likeCountry, limit: 4 }),
    ]);

    res.json({ transportes, hoteles, actividades });
  } catch (error) {
    console.error("❌ Error en /sugerencias?country:", error);
    res.status(500).json({ message: "Error al obtener sugerencias por país" });
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

    // Usamos las funciones del service (evita depender de "pool" aquí)
    const [transportes, hoteles, actividades] = await Promise.all([
      svc.getTransportes({ destino_id: id, limit: 3 }),
      svc.getHoteles({ destino_id: id, limit: 3 }),
      svc.getActividades({ destino_id: id, limit: 4 }),
    ]);

    res.json({ transportes, hoteles, actividades });
  } catch (error) {
    console.error("❌ Error en /sugerencias:", error);
    res.status(500).json({ message: "Error al obtener sugerencias" });
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

module.exports = router;
