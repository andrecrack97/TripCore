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
 
// Agrego endpoints para obtener y actualizar el usuario
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(
      `SELECT id_usuario, nombre, email, pais, idioma, moneda_preferida
         FROM public.usuarios
        WHERE id_usuario = $1
        LIMIT 1`,
      [id]
    );
    if (r.rowCount === 0) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    return res.json({ success: true, user: r.rows[0] });
  } catch (err) {
    console.error("❌ GET /api/usuarios/:id error:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const nombre = (req.body.nombre ?? "").trim();
    const email = (req.body.email ?? req.body.mail ?? "").trim().toLowerCase();
    const pais = (req.body.pais ?? req.body.país ?? null) || null;
    const idioma = (req.body.idioma ?? "es").trim() || "es";
    const moneda = (req.body.moneda_preferida ?? req.body.moneda ?? "USD").trim() || "USD";
    const plain = req.body.password ?? req.body.contraseña ?? req.body.contrasena;

    // validar existencia
    const exists = await pool.query(
      `SELECT id_usuario FROM public.usuarios WHERE id_usuario = $1 LIMIT 1`,
      [id]
    );
    if (exists.rowCount === 0) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    // construir UPDATE dinámico
    const fields = ["nombre", "email", "pais", "idioma", "moneda_preferida"];
    const values = [nombre, email, pais, idioma, moneda];
    const sets = fields.map((f, i) => `${f} = $${i + 1}`);

    let idx = values.length;
    if (plain) {
      const bcrypt = require("bcrypt");
      const hash = await bcrypt.hash(String(plain), 10);
      values.push(hash);
      idx += 1;
      sets.push(`password_hash = $${idx}`);
    }
    values.push(id);

    const sql = `UPDATE public.usuarios SET ${sets.join(", ")} WHERE id_usuario = $${values.length} RETURNING id_usuario, nombre, email, pais, idioma, moneda_preferida`;
    const upd = await pool.query(sql, values);
    return res.json({ success: true, user: upd.rows[0], message: "Usuario actualizado" });
  } catch (err) {
    console.error("❌ PUT /api/usuarios/:id error:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});