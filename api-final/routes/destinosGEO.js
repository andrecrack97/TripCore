// routes/destinosGeo.js
const router = require('express').Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  const { q = '', limit = 10, offset = 0, minPop = 0 } = req.query;
  if (!q || q.length < 2) return res.json([]);

  try {
    const { data } = await axios.get(
      `${process.env.GEODB_BASE}/cities`,
      {
        params: {
          namePrefix: q, // texto que escribe el usuario
          limit,
          offset,
          minPopulation: minPop, // filtra pueblitos
          sort: '-population',   // más pobladas primero
        },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
        },
        timeout: 8000,
      }
    );

    // Normalizo el formato a lo que usa tu UI
    const items = (data?.data || []).map(c => ({
      id: c.wikiDataId,
      nombre: c.city,
      pais: c.country,
      tipo: 'ciudad',
      iata_code: null,
      lat: c.latitude,
      lon: c.longitude,
      extra: {
        countryCode: c.countryCode,
        region: c.region || c.regionCode,
        population: c.population,
      },
    }));

    res.json(items);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'GeoDB request failed' });
  }
});

module.exports = router;
