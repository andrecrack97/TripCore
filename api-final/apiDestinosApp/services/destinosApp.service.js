const db = require("../../db");

// =============
// CONSULTAS EXISTENTES
// =============

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

// =================
// NUEVAS CONSULTAS
// =================

// Obtener sugerencias de transportes
async function getTransportes({ destino_id, limit = 3, from_like }) {
  try {
    // Buscar por destino_id y opcionalmente filtrar por origen
    const params = [destino_id];
    const where = ["destino_id = $1"]; 
    if (from_like && from_like.trim()) {
      params.push(`%${from_like.trim()}%`);
      where.push(`origen ILIKE $${params.length}`);
    }
    params.push(limit);
    const { rows } = await db.query(
      `SELECT id_transporte as id, tipo as kind, proveedor as provider, 
              origen as from_city, destino as to_city,
              EXTRACT(EPOCH FROM (fecha_llegada - fecha_salida))/60 as duration_min,
              precio as price_usd, NULL as carbon_kg, NULL as link_url, NULL as rating
       FROM transportes
       WHERE ${where.join(" AND ")}
       ORDER BY precio ASC NULLS LAST
       LIMIT $${params.length};`,
      params
    );
    return rows;
  } catch (error) {
    console.error("Error en getTransportes:", error);
    return [];
  }
}

// Obtener sugerencias de hoteles
async function getHoteles({ destino_id, limit = 3 }) {
  try {
    // Buscar directamente por destino_id en la tabla hoteles
    const { rows } = await db.query(
      `SELECT id as id, name, stars, rating, price_night_usd, address, image_url, link_url
       FROM hoteles
       WHERE destino_id = $1
       ORDER BY price_night_usd ASC
       LIMIT $2;`,
      [destino_id, limit]
    );
    return rows;
  } catch (error) {
    console.error("Error en getHoteles:", error);
    return [];
  }
}

// Obtener sugerencias de actividades
async function getActividades({ destino_id, limit = 4 }) {
  try {
    // Buscar directamente por destino_id en la tabla actividades
    const { rows } = await db.query(
      `SELECT id as id, title, category, duration_hours, price_usd,
              meeting_point, image_url, link_url, rating
       FROM actividades
       WHERE destino_id = $1
       ORDER BY rating DESC NULLS LAST, price_usd ASC
       LIMIT $2;`,
      [destino_id, limit]
    );
    return rows;
  } catch (error) {
    console.error("Error en getActividades:", error);
    return [];
  }
}

// ==============================
// Variantes por país (fallback)
// ==============================
async function getTransportesByCountry({ country, limit = 3 }) {
  const { rows } = await db.query(
    `SELECT t.id, t.kind, t.provider, t.from_city, t.from_country, t.to_city, t.to_country,
            t.duration_min, t.price_usd, t.carbon_kg, t.link_url, t.rating
     FROM transportes t
     JOIN destinos d ON d.id = t.destino_id
     WHERE d.pais ILIKE $1
     ORDER BY t.price_usd ASC
     LIMIT $2;`,
    [country, limit]
  );
  return rows;
}

async function getHotelesByCountry({ country, limit = 3 }) {
  const { rows } = await db.query(
    `SELECT h.id, h.name, h.stars, h.rating, h.price_night_usd, h.address, h.image_url, h.link_url
     FROM hoteles h
     JOIN destinos d ON d.id = h.destino_id
     WHERE d.pais ILIKE $1
     ORDER BY h.price_night_usd ASC
     LIMIT $2;`,
    [country, limit]
  );
  return rows;
}

async function getActividadesByCountry({ country, limit = 4 }) {
  const { rows } = await db.query(
    `SELECT a.id, a.title, a.category, a.duration_hours, a.price_usd,
            a.meeting_point, a.image_url, a.link_url, a.rating
     FROM actividades a
     JOIN destinos d ON d.id = a.destino_id
     WHERE d.pais ILIKE $1
     ORDER BY a.rating DESC
     LIMIT $2;`,
    [country, limit]
  );
  return rows;
}

module.exports = { listTop, autocomplete, getById, getTransportes, getHoteles, getActividades, getTransportesByCountry, getHotelesByCountry, getActividadesByCountry };
