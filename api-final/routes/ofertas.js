const express = require("express");
const router = express.Router();
const db = require("../db");

function buildFilters({ tipo, destino, fechas }) {
  const whereParts = [];
  const params = [];

  if (tipo && String(tipo).trim()) {
    params.push(String(tipo).trim().toLowerCase());
    const idx = params.length;
    whereParts.push(`LOWER(o.tipo) = $${idx}`);
  }

  if (destino && String(destino).trim()) {
    const value = `%${String(destino).trim().toLowerCase()}%`;
    params.push(value);
    const idx = params.length;
    whereParts.push(`(LOWER(d.nombre) LIKE $${idx} OR LOWER(o.titulo) LIKE $${idx})`);
  }

  if (fechas && String(fechas).trim()) {
    const matches = String(fechas).match(/\d{4}-\d{2}-\d{2}/g);
    if (matches?.length) {
      const start = matches[0];
      const end = matches[1] || matches[0];
      params.push(start);
      const startIdx = params.length;
      params.push(end);
      const endIdx = params.length;
      whereParts.push(`((o.inicia_en IS NULL OR o.inicia_en <= $${endIdx}) AND (o.finaliza_en IS NULL OR o.finaliza_en >= $${startIdx}))`);
    }
  }

  const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
  return { whereClause, params };
}

function withLimitParams(baseParams, limit) {
  const copy = [...baseParams];
  copy.push(limit);
  return copy;
}

router.get("/", async (req, res) => {
  try {
    const { tipo, destino, fechas, limit } = req.query;
    const parsedLimit = Math.min(Number.parseInt(limit, 10) || 30, 60);
    const destacadasLimit = 8;
    const ultimaHoraLimit = 6;

    const filters = buildFilters({ tipo, destino, fechas });
    const baseSelect = `
      SELECT o.*, 
             d.nombre AS destino_nombre,
             d.pais   AS destino_pais,
             d.region AS destino_region
      FROM vw_ofertas_activas o
      LEFT JOIN destinos d ON d.id = o.destino_id
    `;

    const destacadosSql = `
      SELECT o.*, 
             d.nombre AS destino_nombre,
             d.pais   AS destino_pais,
             d.region AS destino_region
      FROM vw_ofertas_destacadas o
      LEFT JOIN destinos d ON d.id = o.destino_id
      ${filters.whereClause}
      ORDER BY COALESCE(o.finaliza_en, o.created_at) ASC
      LIMIT $${filters.params.length + 1};
    `;

    const destacadosPromise = db.query(destacadosSql, withLimitParams(filters.params, destacadasLimit));

    const ultimaWherePrefix = filters.whereClause ? `${filters.whereClause} AND` : "WHERE";
    const ultimaSql = `
      ${baseSelect}
      ${ultimaWherePrefix} o.finaliza_en IS NOT NULL
      ORDER BY o.finaliza_en ASC
      LIMIT $${filters.params.length + 1};
    `;
    const ultimaPromise = db.query(ultimaSql, withLimitParams(filters.params, ultimaHoraLimit));

    const itemsSql = `
      ${baseSelect}
      ${filters.whereClause}
      ORDER BY COALESCE(o.finaliza_en, o.created_at) ASC NULLS LAST
      LIMIT $${filters.params.length + 1};
    `;
    const itemsPromise = db.query(itemsSql, withLimitParams(filters.params, parsedLimit));

    const [destacadasRes, ultimaRes, itemsRes] = await Promise.all([destacadasPromise, ultimaPromise, itemsPromise]);

    res.json({
      destacadas: destacadasRes.rows,
      ultima_hora: ultimaRes.rows,
      items: itemsRes.rows,
    });
  } catch (error) {
    console.error("❌ Error en /api/ofertas:", error);
    res.status(500).json({
      message: "Error al obtener ofertas",
      error: error.message,
      destacadas: [],
      ultima_hora: [],
      items: [],
    });
  }
});

module.exports = router;

