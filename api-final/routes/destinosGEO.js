// apifinal/routes/destinosGeo.js (CommonJS)
const router = require("express").Router();
const axios = require("axios");

// Fallback local para probar sin API key / sin internet
const MOCK = [
  { id:"BUE", nombre:"Buenos Aires", pais:"Argentina", countryCode:"AR", lat:-34.6037, lon:-58.3816, population:2891082, tipo:"ciudad" },
  { id:"COR", nombre:"Córdoba",      pais:"Argentina", countryCode:"AR", lat:-31.4201, lon:-64.1888, population:1391000,  tipo:"ciudad" },
  { id:"BCN", nombre:"Barcelona",    pais:"España",    countryCode:"ES", lat:41.3851,  lon:2.1734,   population:1620000,  tipo:"ciudad" },
  { id:"MAD", nombre:"Madrid",       pais:"España",    countryCode:"ES", lat:40.4168,  lon:-3.7038,  population:3265000,  tipo:"ciudad" },
  { id:"NYC", nombre:"Nueva York",   pais:"Estados Unidos", countryCode:"US", lat:40.7128, lon:-74.0060, population:8468000, tipo:"ciudad" },
];

router.get("/", async (req, res) => {
  const { q = "", limit = 8, offset = 0, minPop = 20000, test } = req.query;
  const query = String(q).trim();

  // MODO PRUEBA: /api/destinos/geo?test=1&q=bar
  if (test) {
    const list = MOCK.filter(c =>
      c.nombre.toLowerCase().includes(query.toLowerCase()) ||
      c.pais.toLowerCase().includes(query.toLowerCase())
    ).slice(Number(offset), Number(offset) + Number(limit));
    return res.json(list);
  }

  if (query.length < 2) return res.json([]);

  // Si no hay key, usá fallback en vez de romper
  if (!process.env.RAPIDAPI_KEY) {
    const list = MOCK.filter(c =>
      c.nombre.toLowerCase().includes(query.toLowerCase()) ||
      c.pais.toLowerCase().includes(query.toLowerCase())
    ).slice(Number(offset), Number(offset) + Number(limit));
    return res.json(list);
  }

  try {
    const base = process.env.GEODB_BASE || "https://wft-geo-db.p.rapidapi.com/v1/geo";
    const host = process.env.RAPIDAPI_HOST || "wft-geo-db.p.rapidapi.com";

    const { data } = await axios.get(`${base}/cities`, {
      params: {
        namePrefix: query,
        limit,
        offset,
        minPopulation: minPop,
        sort: "-population",
      },
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "19344af565msh8b2c398684c1169p1218b3jsne15a1c9cdd7a",
        "X-RapidAPI-Host": host,
      },
      timeout: 10000,
    });

    const items = (data?.data || []).map(c => ({
      id: c.wikiDataId || `${c.city}-${c.latitude}-${c.longitude}`,
      nombre: c.city,
      pais: c.country,
      countryCode: c.countryCode,
      lat: c.latitude,
      lon: c.longitude,
      population: c.population,
      tipo: "ciudad",
    }));

    res.json(items);
  } catch (err) {
    console.error("GeoDB error:", err.response?.status, err.response?.data || err.message);
    // En error remoto, devolvemos MOCK para que la UI no quede en blanco
    const list = MOCK.filter(c =>
      c.nombre.toLowerCase().includes(query.toLowerCase()) ||
      c.pais.toLowerCase().includes(query.toLowerCase())
    ).slice(Number(offset), Number(offset) + Number(limit));
    res.status(200).json(list);
  }
});

module.exports = router;
