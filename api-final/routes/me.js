const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "No autorizado" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.userId = payload.sub;
    next();
  } catch (_) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
}

// GET /api/me
router.get("/", auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_usuario as id, nombre as fullName, email, pais as locationCountry, idioma as language, moneda_preferida as currency, null as avatarUrl
         FROM public.usuarios WHERE id_usuario = $1 LIMIT 1`,
      [req.userId]
    );
    if (r.rowCount === 0) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    const tripsCountQ = await pool.query(`SELECT COUNT(*)::int AS c FROM viajes WHERE id_usuario = $1`, [req.userId]);
    const countriesCountQ = await pool.query(`SELECT COUNT(DISTINCT destino_principal)::int AS c FROM viajes WHERE id_usuario = $1`, [req.userId]);

    const user = r.rows[0];
    user.tripsCount = tripsCountQ.rows[0].c;
    user.countriesCount = countriesCountQ.rows[0].c;

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// PUT /api/me
router.put("/", auth, async (req, res) => {
  try {
    const nombre = (req.body.fullName ?? "").trim();
    const email = (req.body.email ?? "").trim().toLowerCase();
    const idioma = req.body.language ?? "es";
    const moneda = req.body.currency ?? "USD";
    const plain = req.body.password ?? null;

    const fields = ["nombre", "email", "idioma", "moneda_preferida"];
    const values = [nombre, email, idioma, moneda];
    const sets = fields.map((f, i) => `${f} = $${i + 1}`);
    let idx = values.length;
    if (plain) {
      const hash = await bcrypt.hash(String(plain), 10);
      values.push(hash);
      idx += 1;
      sets.push(`password_hash = $${idx}`);
    }
    values.push(req.userId);
    const sql = `UPDATE public.usuarios SET ${sets.join(", ")} WHERE id_usuario = $${values.length} RETURNING id_usuario as id, nombre as fullName, email, idioma as language, moneda_preferida as currency`;
    const upd = await pool.query(sql, values);
    return res.json(upd.rows[0]);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

module.exports = router;


