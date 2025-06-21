const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'TripCoreBD',
  options: {
    trustServerCertificate: true
  },
  authentication: {
    type: 'ntlm',
    options: {
      userName: 'André',
      password: '0702',
      domain: '' // lo podés dejar vacío
    }
  }
};

module.exports = {
  sql,
  config
};
