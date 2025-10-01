const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Normaliza email (acepta "email" o "mail")
const getEmail = (body = {}) => String(body.email ?? body.mail ?? "").trim().toLowerCase();
// Normaliza password (acepta "password" o "contraseña")
const getPassword = (body = {}) => body.password ?? body.contraseña ?? body.contrasena;
// Normaliza confirmación (acepta "confirmPassword", "confirmar", etc.)
const getPasswordConfirm = (body = {}) =>
  body.confirmPassword ?? body.confirmar ?? body.contraseñaConfirmada ?? body.contrasenaConfirmada ?? body.password2 ?? null;

router.post("/register", async (req, res) => {
  try {
    console.log("➡️ /api/register payload:", req.body);

    const nombre = (req.body.nombre ?? "").trim();
    const email = getEmail(req.body);
    const plain = getPassword(req.body);
    const plain2 = getPasswordConfirm(req.body);
    const pais = (req.body.pais ?? req.body.país ?? "").trim();

    if (!nombre || !email || !plain) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
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

    const hash = await bcrypt.hash(String(plain), 10);

    const ins = await pool.query(
      `INSERT INTO public.usuarios (nombre, email, password_hash, pais, idioma, moneda_preferida, rol)
       VALUES ($1, $2, $3, $4, 'es', 'USD', 'turista')
       RETURNING id_usuario, nombre, email, pais`,
      [nombre, email, hash, pais || null]
    );

    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      user: ins.rows[0],
    });
  } catch (err) {
    console.error("❌ /api/register error:", err);
    return res.status(500).json({ success: false, message: "Error al registrar usuario" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = getEmail(req.body);
    const plain = getPassword(req.body);

    if (!email || !plain) {
      return res.status(400).json({ success: false, message: "Completa email y contraseña" });
    }

    const r = await pool.query(
      `SELECT id_usuario, nombre, email, password_hash
         FROM public.usuarios
        WHERE email = $1
        LIMIT 1`,
      [email]
    );

    const user = r.rows[0];
    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    const ok = await bcrypt.compare(String(plain), user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { sub: user.id_usuario, email: user.email },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: { id: user.id_usuario, nombre: user.nombre, email: user.email },
    });
  } catch (err) {
    console.error("❌ /api/login error:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

module.exports = router;
