// routes/hoteles.js
const express = require("express");
const Amadeus = require("amadeus");

const router = express.Router();

// Asegurate de que en server.js o app.js tengas: require("dotenv").config();
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  // test por defecto, no hace falta hostname: 'test'
});

// GET /api/hoteles?city=paris|barcelona
router.get("/", async (req, res) => {
  try {
    const city = (req.query.city || "").toLowerCase();

    let cityCode = null;
    if (city === "paris") cityCode = "PAR";
    if (city === "barcelona") cityCode = "BCN";

    if (!cityCode) {
      return res.status(400).json({ message: "City debe ser paris o barcelona" });
    }

    // Hotel List API: lista de hoteles por código de ciudad
    const response = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode, // PAR o BCN
    });

    // Estructuramos la data para el front
    const hotels = (response.data || []).map((h) => ({
      id: h.hotelId || h.hotel?.hotelId || h.id,
      name: h.name,
      cityCode: h.iataCode || cityCode,
      latitude: h.geoCode?.latitude,
      longitude: h.geoCode?.longitude,
      // en Hotel List casi nunca viene precio; lo dejamos null
      price_night_usd: null,
      stars: h.rating ? Number(h.rating) : null,
    }));

    return res.json({ hotels });
  } catch (err) {
    // 👇 Acá logueamos MUCHÍSIMO más detalle
    const status = err.response?.statusCode || 500;
    const amadeusBody = err.response?.data || err.response?.body || err.message || err;

    console.error("Error consultando hoteles en Amadeus:");
    console.error("HTTP Status:", status);
    console.error("Detalles:", JSON.stringify(amadeusBody, null, 2));

    return res.status(status).json({
      message: "Error consultando hoteles en la API de Amadeus",
      amadeus: amadeusBody, // así también lo podés ver en la pestaña Network
    });
  }
});

module.exports = router;
