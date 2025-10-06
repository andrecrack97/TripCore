const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/seguros/companias - compañías activas
router.get("/companias", async (_req, res) => {
  try {
    const { rows } = await db.query(
      "select id_compania, nombre, logo_url, sitio_web, telefono_contacto from public.seguros_companias where activo = true order by nombre"
    );
    res.json(rows);
  } catch (err) {
    console.error("/companias error", err);
    res.status(500).json({ message: "Error obteniendo compañías" });
  }
});

// GET /api/seguros/planes - vista vw_seguros_planes con filtros simples
// query: search, recomendado, maxPrecio
router.get("/planes", async (req, res) => {
  const { search, recomendado, maxPrecio } = req.query;
  const values = [];
  const where = [];
  if (search) {
    values.push(`%${search}%`);
    where.push("(compania ilike $" + values.length + " or plan ilike $" + values.length + ")");
  }
  if (recomendado === "true") {
    where.push("recomendado = true");
  }
  if (maxPrecio) {
    values.push(Number(maxPrecio));
    where.push("precio_mensual <= $" + values.length);
  }
  const whereSql = where.length ? " where " + where.join(" and ") : "";
  const sql =
    "select id_plan, compania, plan, descripcion, precio_mensual, moneda, recomendado, cobertura_global, atencion_24_7, coberturas from public.vw_seguros_planes" +
    whereSql +
    " order by recomendado desc, precio_mensual asc, compania";
  try {
    const { rows } = await db.query(sql, values);
    res.json(rows);
  } catch (err) {
    console.error("/planes error", err);
    res.status(500).json({ message: "Error obteniendo planes" });
  }
});

// GET /api/seguros/alertas - últimas alertas por riesgo desc
router.get("/alertas", async (_req, res) => {
  try {
    const { rows } = await db.query(
      "select id_alerta, pais_iso2, titulo, descripcion, categoria, nivel_riesgo, etiqueta_ui, fuente_url from public.alertas_sanitarias order by nivel_riesgo desc, creado_en desc limit 20"
    );
    res.json(rows);
  } catch (err) {
    console.error("/alertas error", err);
    res.status(500).json({ message: "Error obteniendo alertas" });
  }
});

module.exports = router;


