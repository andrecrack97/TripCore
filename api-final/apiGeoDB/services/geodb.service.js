// Lógica de acceso a la API externa
const client = require('../utils/geodbClient');

async function searchCities({ query, limit = 10, offset = 0, countryIds, minPopulation = 10000 }) {
  const params = {
    namePrefix: query,
    limit,
    offset,
    sort: '-population',
    minPopulation
  };
  if (countryIds) params.countryIds = countryIds; // ej: "AR,BR,US"
  const { data } = await client.get('/cities', { params });
  return data; // { data: [...], metadata: {...} }
}

async function getCityById(id) {
  const { data } = await client.get(`/cities/${id}`);
  return data; // { data: {...} }
}

async function listCountries({ limit = 10, offset = 0 }) {
  const { data } = await client.get('/countries', { params: { limit, offset, sort: 'name' } });
  return data; // { data: [...], metadata: {...} }
}

async function popularCities({ minPopulation = 500000, limit = 10 }) {
  const { data } = await client.get('/cities', {
    params: { minPopulation, limit, sort: '-population' }
  });
  return data;
}

module.exports = {
  searchCities,
  getCityById,
  listCountries,
  popularCities
};
