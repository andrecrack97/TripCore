// Servicio GeoDB: fuerza CITY + pisos de población y post-filtro estricto.
const client = require("../utils/geodbClient");

// asegura que nunca pidamos menos del piso mínimo
function clampMinPop(raw, floor) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return floor;
  return Math.max(n, floor);
}

// por si la API devuelve algo raro: descartar < minPop y que no sean CITY
function filterStrict(list, minPop) {
  return (list || []).filter((c) => {
    const pop = Number(c.population || 0);
    const type = (c.type || "").toUpperCase();
    return pop >= minPop && (type === "CITY" || !type);
  });
}

// búsqueda por texto (autocomplete / barra)
async function searchCities({
  query,
  limit = 10,
  offset = 0,
  countryIds,
  minPopulation = 200000,
  capitalOnly = false,
}) {
  const minPop = clampMinPop(minPopulation, 200000);

  const params = {
    namePrefix: query,
    limit,
    offset,
    sort: "-population",
    minPopulation: minPop,
    types: "CITY",
    languageCode: "es",
  };
  if (countryIds) params.countryIds = countryIds;
  if (capitalOnly) params.capital = "true";

  const { data } = await client.get("/cities", { params });
  const filtered = filterStrict(data?.data, minPop);
  return { ...data, data: filtered };
}

// listado de “top” ciudades sin texto (para grillas)
async function topCities({
  countryIds,
  minPopulation = 500000,
  limit = 12,
  capitalOnly = false,
}) {
  const minPop = clampMinPop(minPopulation, 500000);

  const params = {
    namePrefix: "a", // GeoDB exige prefijo; cualquiera sirve para traer muchas
    limit,
    offset: 0,
    sort: "-population",
    minPopulation: minPop,
    types: "CITY",
    languageCode: "es",
  };
  if (countryIds) params.countryIds = countryIds;
  if (capitalOnly) params.capital = "true";

  const { data } = await client.get("/cities", { params });
  const filtered = filterStrict(data?.data, minPop);
  return { ...data, data: filtered };
}

async function getCityById(id) {
  const { data } = await client.get(`/cities/${id}`, {
    params: { languageCode: "es" },
  });
  return data;
}

async function listCountries({ limit = 200, offset = 0 }) {
  const { data } = await client.get("/countries", {
    params: { limit, offset, sort: "name", languageCode: "es" },
  });
  return data;
}

module.exports = {
  searchCities,
  topCities,
  getCityById,
  listCountries,
};
