const express = require("express");
const router = express.Router();
const sql = require("../db");

router.post("/login", async (req, res) => {
  const { email, contraseña } = req.body;
  console.log("🛠️ Intento de login con:", email, contraseña);

  try {
    const result = await sql.query`
      SELECT * FROM Usuarios
      WHERE email = ${email} AND contraseña = ${contraseña}
    `;

    console.log("📦 Resultado:", result.recordset);

    if (result.recordset.length > 0) {
      res.json({ success: true, message: "Inicio de sesión exitoso" });
    } else {
      res.status(401).json({ success: false, message: "Usuario o Contraseña incorrectos" });
    }
  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

router.post("/register", async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  if (!nombre || !email || !contraseña) {
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
  }

  try {
    // Verifica si el email ya existe
    const existing = await sql.query`
      SELECT * FROM Usuarios WHERE email = ${email}
    `;

    if (existing.recordset.length > 0) {
      return res.status(409).json({ success: false, message: "El correo ya está registrado" });
    }

    // Insertar nuevo usuario
    await sql.query`
      INSERT INTO Usuarios (nombre, email, contraseña)
      VALUES (${nombre}, ${email}, ${contraseña})
    `;

    res.json({ success: true, message: "Usuario registrado correctamente" });

  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ success: false, message: "Error al registrar usuario" });
  }
});


module.exports = router;
