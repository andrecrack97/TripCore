// Cliente Axios preconfigurado para GeoDB vía RapidAPI
const axios = require('axios');

const client = axios.create({
  baseURL: process.env.GEODB_BASE_URL || 'https://wft-geo-db.p.rapidapi.com/v1/geo',
  headers: {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': process.env.GEODB_HOST || 'wft-geo-db.p.rapidapi.com'
  },
  timeout: 10000
});

// Interceptor simple para formatear errores
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'GeoDB error' };
    const err = new Error(data.message || 'GeoDB request failed');
    err.status = status;
    err.payload = data;
    throw err;
  }
);

module.exports = client;
