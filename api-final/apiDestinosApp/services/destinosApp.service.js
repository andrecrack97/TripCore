const db = require("../../db");

// Top destinos con filtros opcionales (country/season/climate)
async function listTop({ limit = 12, country, season, climate }) {
  const params = [];
  const where = [];

  if (country) { params.push(`%${country}%`); where.push(`pais ILIKE $${params.length}`); }
  if (season)  { params.push(season);        where.push(`$${params.length} = ANY(temporada_tags)`); }
  if (climate) { params.push(climate);       where.push(`$${params.length} = ANY(clima_tags)`); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(limit);

  const sql = `
    SELECT id, geodb_city_id, nombre, pais, region, lat, lon,
           popularidad, rating, precio_ref_usd, clima_tags, temporada_tags,
           descripcion, hero_image_url
    FROM destinos
    ${whereSql}
    ORDER BY popularidad DESC, rating DESC
    LIMIT $${params.length};
  `;
  const { rows } = await db.query(sql, params);
  return rows;
}

// Autocomplete sobre catálogo curado (prefijo por nombre o país)
async function autocomplete({ q, limit = 8 }) {
  const like = `${q}%`;
  const sql = `
    SELECT id, geodb_city_id, nombre, pais, region, lat, lon
    FROM destinos
    WHERE nombre ILIKE $1 OR pais ILIKE $1
    ORDER BY popularidad DESC
    LIMIT $2;
  `;
  const { rows } = await db.query(sql, [like, limit]);
  return rows;
}

// Detalle curado
async function getById(id) {
  const { rows } = await db.query(`SELECT * FROM destinos WHERE id = $1`, [id]);
  return rows[0] || null;
}

module.exports = { listTop, autocomplete, getById };
