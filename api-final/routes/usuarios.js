const express = require("express");
const router = express.Router();
const sql = require("../db");
const bcrypt = require("bcrypt");

router.post("/registro", async (req, res) => {
  const { nombre, email, contraseña, pais } = req.body;

  if (!nombre || !email || !contraseña) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    await sql.query`
      INSERT INTO Usuarios (nombre, email, contraseña, idioma, moneda_preferida, rol)
      VALUES (${nombre}, ${email}, ${hashedPassword}, 'Español', 'ARS', 'usuario')
    `;
    res.status(201).json({ mensaje: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("Error en el registro:", err);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

module.exports = router;
