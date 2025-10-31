const express = require("express");
const router = express.Router();
const svc = require("../services/geodb.service");

// GET /api/destinos/search?q=pari&countryIds=FR,IT&limit=8&major=true&capitalOnly=false
router.get("/search", async (req, res) => {
  try {
    const { q, limit, offset, countryIds, minPopulation, capitalOnly, major } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ error: "Falta query ?q=" });

    const floor = String(major) === "true" ? 500000 : 200000; // pisos duros
    const resp = await svc.searchCities({
      query: q.trim(),
      limit: Number(limit) || 10,
      offset: Number(offset) || 0,
      countryIds,
      minPopulation: Number(minPopulation) || floor,
      capitalOnly: String(capitalOnly) === "true",
    });

    res.json(resp);
  } catch (err) {
    res.status(err.status || 500).json(err.payload || { message: err.message });
  }
});

// GET /api/destinos/top?countryIds=AR&major=true&capitalOnly=false&limit=12
router.get("/top", async (req, res) => {
  try {
    const { countryIds, minPopulation, capitalOnly, limit, major } = req.query;
    const floor = String(major) === "true" ? 500000 : 500000; // top siempre alto
    const resp = await svc.topCities({
      countryIds,
      minPopulation: Number(minPopulation) || floor,
      limit: Number(limit) || 12,
      capitalOnly: String(capitalOnly) === "true",
    });
    res.json(resp);
  } catch (err) {
    res.status(err.status || 500).json(err.payload || { message: err.message });
  }
});

// Detalle por id GeoDB
router.get("/cities/:id", async (req, res) => {
  try {
    const resp = await svc.getCityById(req.params.id);
    res.json(resp);
  } catch (err) {
    res.status(err.status || 500).json(err.payload || { message: err.message });
  }
});

// Países
router.get("/countries", async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const resp = await svc.listCountries({
      limit: Number(limit) || 200,
      offset: Number(offset) || 0,
    });
    res.json(resp);
  } catch (err) {
    res.status(err.status || 500).json(err.payload || { message: err.message });
  }
});

module.exports = router;
