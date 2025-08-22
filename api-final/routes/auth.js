const express = require("express");
const router = express.Router();
const sql = require("../db");
const bcrypt = require("bcrypt");

// POST /api/register
router.post("/register", async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  if (!nombre || !email || !contraseña) {
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
  }

  try {
    // ¿ya existe?
    const existing = await sql.query`
      SELECT 1 FROM Usuarios WHERE email = ${email}
    `;
    if (existing.recordset.length > 0) {
      return res.status(409).json({ success: false, message: "El correo ya está registrado" });
    }

    // hash + guardar
    const hashed = await bcrypt.hash(contraseña, 10);
    await sql.query`
      INSERT INTO Usuarios (nombre, email, contraseña)
      VALUES (${nombre}, ${email}, ${hashed})
    `;

    return res.status(201).json({ success: true, message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("❌ Error en registro:", err);
    return res.status(500).json({ success: false, message: "Error al registrar usuario" });
  }
});

// POST /api/login
router.post("/login", async (req, res) => {
  const { email, contraseña } = req.body;

  if (!email || !contraseña) {
    return res.status(400).json({ success: false, message: "Completa email y contraseña" });
  }

  try {
    const r = await sql.query`
      SELECT TOP 1 * FROM Usuarios WHERE email = ${email}
    `;
    const user = r.recordset[0];
    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    const ok = await bcrypt.compare(contraseña, user.contraseña);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    return res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: { id: user.id_usuario, nombre: user.nombre, email: user.email }
    });
  } catch (err) {
    console.error("❌ Error en login:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

module.exports = router;
