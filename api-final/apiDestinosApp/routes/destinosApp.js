const express = require("express");
const router = express.Router();
const svc = require("../services/destinosApp.service");

// GET /api/destinos-app/top?country=Argentina&season=Verano&climate=Mediterráneo&limit=12
router.get("/top", async (req, res) => {
  try {
    const { country, season, climate, limit } = req.query;
    const data = await svc.listTop({
      limit: Number(limit) || 12,
      country,
      season,
      climate,
    });
    res.json({ data });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

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

// GET /api/destinos-app/:id  (detalle curado)
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
