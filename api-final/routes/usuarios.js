const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

// Aliases por si viene "mail", "contraseña", etc.
const getEmail = (body = {}) => String(body.email ?? body.mail ?? "").trim().toLowerCase();
const getPassword = (body = {}) => body.password ?? body.contraseña ?? body.contrasena;
const getPasswordConfirm = (body = {}) =>
  body.confirmPassword ?? body.contraseñaConfirmada ?? body.contrasenaConfirmada ?? body.password2 ?? null;

// POST /api/usuarios/registro
router.post("/registro", async (req, res) => {
  try {
    const nombre = (req.body.nombre ?? "").trim();
    const email = getEmail(req.body);
    const plain = getPassword(req.body);
    const plain2 = getPasswordConfirm(req.body);
    const pais = (req.body.pais ?? req.body.país ?? "").trim(); // opcional

    if (!nombre || !email || !plain) {
      return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
    }
    if (plain2 !== null && plain !== plain2) {
      return res.status(400).json({ success: false, message: "Las contraseñas no coinciden" });
    }

    const exists = await pool.query(
      `SELECT 1 FROM public.usuarios WHERE email = $1 LIMIT 1`,
      [email]
    );
    if (exists.rowCount > 0) {
      return res.status(409).json({ success: false, message: "El correo ya está registrado" });
    }

    const hashed = await bcrypt.hash(String(plain), 10);

    const insert = await pool.query(
      `INSERT INTO public.usuarios (nombre, email, password_hash, pais, idioma, moneda_preferida, rol)
       VALUES ($1, $2, $3, $4, 'es', 'USD', 'usuario')
       RETURNING id_usuario, nombre, email, pais`,
      [nombre, email, hashed, pais || null]
    );

    const u = insert.rows[0];
    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      user: { id: u.id_usuario, nombre: u.nombre, email: u.email, pais: u.pais },
    });
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ success: false, message: "El correo ya está registrado" });
    }
    console.error("Error en el registro:", err);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

module.exports = router;
