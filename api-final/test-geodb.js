require('dotenv').config();
const GeoDb = require('wft-geodb-js-client');

const defaultClient = GeoDb.ApiClient.instance;
const UserSecurity = defaultClient.authentications['UserSecurity'];
UserSecurity.apiKey = process.env.RAPIDAPI_KEY;
// Si necesitas prefijo tipo "Token" para el header X-RapidAPI-Key, descomenta:
// UserSecurity.apiKeyPrefix['X-RapidAPI-Key'] = 'Token';

const api = new GeoDb.GeoApi();

// opts mínimo, sin el bloque gigante
const opts = {
  namePrefix: 'ba',
  limit: 5,
  minPopulation: 20000,
};

api.findAdminDivisionsUsingGET(opts).then(
  (data) => {
    console.log('OK:', JSON.stringify(data, null, 2));
    process.exit(0);
  },
  (error) => {
    console.error('ERROR:', error?.response?.data || error.message || error);
    process.exit(1);
  }
);


