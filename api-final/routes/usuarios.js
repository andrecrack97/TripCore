const express = require("express");
const router = express.Router();
const sql = require("../db");
const bcrypt = require("bcrypt");

router.post("/registro", async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  if (!nombre || !email || !contraseña) {
    return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
  }

  try {
    const exists = await sql.query`SELECT 1 FROM Usuarios WHERE email = ${email}`;
    if (exists.recordset.length) {
      return res.status(409).json({ success: false, message: "El correo ya está registrado" });
    }

    const hashed = await bcrypt.hash(contraseña, 10);
    await sql.query`
      INSERT INTO Usuarios (nombre, email, contraseña, idioma, moneda_preferida, rol)
      VALUES (${nombre}, ${email}, ${hashed}, 'Español', 'ARS', 'usuario')
    `;
    return res.status(201).json({ success: true, message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("Error en el registro:", err);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

module.exports = router;
