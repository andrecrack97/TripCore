// routes/viajes.js
const express = require('express');
const router = express.Router();
const { sql, config } = require('../db');

router.get('/', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query('SELECT * FROM Viajes');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener viajes:', err);
    res.status(500).json({ error: 'Error al obtener viajes' });
  }
});

module.exports = router;
