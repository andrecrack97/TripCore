const express = require('express');
const router = express.Router();
const svc = require('../services/geodb.service');

// GET /api/destinos/search?q=pari&countryIds=FR,IT&limit=8&offset=0&minPopulation=10000
router.get('/search', async (req, res) => {
  try {
    const { q, limit, offset, countryIds, minPopulation } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ error: 'Falta query ?q=' });
    const resp = await svc.searchCities({
      query: q.trim(),
      limit: Number(limit) || 10,
      offset: Number(offset) || 0,
      countryIds,
      minPopulation: Number(minPopulation) || 10000
    });
    res.json(resp);
  } catch (err) {
    res.status(err.status || 500).json(err.payload || { message: err.message });
  }
});

// GET /api/destinos/cities/:id
router.get('/cities/:id', async (req, res) => {
  try {
    const resp = await svc.getCityById(req.params.id);
    res.json(resp);
  } catch (err) {
    res.status(err.status || 500).json(err.payload || { message: err.message });
  }
});

// GET /api/destinos/countries?limit=10&offset=0
router.get('/countries', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const resp = await svc.listCountries({ limit: Number(limit) || 10, offset: Number(offset) || 0 });
    res.json(resp);
  } catch (err) {
    res.status(err.status || 500).json(err.payload || { message: err.message });
  }
});

// GET /api/destinos/popular?minPopulation=500000&limit=12
router.get('/popular', async (req, res) => {
  try {
    const { minPopulation, limit } = req.query;
    const resp = await svc.popularCities({
      minPopulation: Number(minPopulation) || 500000,
      limit: Number(limit) || 10
    });
    res.json(resp);
  } catch (err) {
    res.status(err.status || 500).json(err.payload || { message: err.message });
  }
});

module.exports = router;
