// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const viajesRoutes = require('./routes/viajes');

app.use(cors());
app.use(express.json());

app.use('/api/viajes', viajesRoutes);

app.listen(3001, () => {
  console.log('Servidor corriendo en http://localhost:3001');
});
