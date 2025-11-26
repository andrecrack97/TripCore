const express = require("express");
const axios = require("axios");

const router = express.Router();

// Obtiene el token de acceso de Amadeus (OAuth2 client_credentials)
async function getAmadeusToken() {
  const baseUrl = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
  const url = `${baseUrl}/v1/security/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.AMADEUS_API_KEY,
    client_secret: process.env.AMADEUS_API_SECRET,
  });

  const resp = await axios.post(url, body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return resp.data.access_token;
}

// GET /api/hoteles?city=paris  o  /api/hoteles?city=barcelona
router.get("/", async (req, res) => {
  try {
    const city = (req.query.city || "").toLowerCase();

    let cityCode;
    if (city === "paris" || city === "parís") cityCode = "PAR";
    else if (city === "barcelona" || city === "bcn") cityCode = "BCN";
    else {
      return res
        .status(400)
        .json({ message: "Usá ?city=paris o ?city=barcelona" });
    }

    const token = await getAmadeusToken();
    const baseUrl = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";
    const url = `${baseUrl}/v1/reference-data/locations/hotels/by-city`;

    const hotelsResp = await axios.get(url, {
      params: { cityCode },
      headers: { Authorization: `Bearer ${token}` },
    });

    const hotels = (hotelsResp.data.data || []).map((h) => ({
      id: h.hotelId,
      name: h.name,
      cityCode: h.cityCode,
      latitude: h.geoCode?.latitude,
      longitude: h.geoCode?.longitude,
      chainCode: h.chainCode,
    }));

    res.json({ city, cityCode, hotels });
  } catch (err) {
    console.error("Error en /api/hoteles:", err.response?.data || err.message);
    res
      .status(500)
      .json({ message: "Error consultando hoteles en la API de Amadeus" });
  }
});

module.exports = router;
