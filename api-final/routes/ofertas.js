const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  try {
    const { tipo, destino, limit } = req.query;
    const parsedLimit = Math.min(Number.parseInt(limit, 10) || 30, 60);

    // Consulta simple y directa
    let sql = `
      SELECT o.*, 
             d.nombre AS destino_nombre,
             d.pais AS destino_pais
      FROM ofertas o
      LEFT JOIN destinos d ON d.id = o.destino_id
    `;
    
    const params = [];
    const conditions = [];

    if (tipo && tipo.trim()) {
      params.push(tipo.trim().toLowerCase());
      conditions.push(`LOWER(o.tipo::text) = $${params.length}`);
    }

    if (destino && destino.trim()) {
      params.push(`%${destino.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(d.nombre) LIKE $${params.length} OR LOWER(o.titulo) LIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY o.created_at DESC NULLS LAST`;
    params.push(parsedLimit);
    sql += ` LIMIT $${params.length}`;

    console.log("📊 SQL ofertas:", sql);
    console.log("📊 Params:", params);

    const result = await db.query(sql, params);
    const ofertas = result.rows || [];

    console.log(`✅ Ofertas encontradas: ${ofertas.length}`);

    // Separar destacadas y última hora
    const destacadas = ofertas.filter(o => o.destacada === true);
    const ultimaHora = ofertas
      .filter(o => o.finaliza_en != null)
      .sort((a, b) => new Date(a.finaliza_en) - new Date(b.finaliza_en))
      .slice(0, 6);

    res.json({
      destacadas,
      ultima_hora: ultimaHora,
      items: ofertas,
    });
  } catch (error) {
    console.error("❌ Error en /api/ofertas:", error.message);
    console.error("❌ Stack:", error.stack);
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
