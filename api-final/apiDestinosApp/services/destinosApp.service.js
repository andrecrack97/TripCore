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
async function getTransportes({ destino_id, limit = 3, from_like, destino_nombre }) {
  try {
    const params = [];
    const destinoConditions = [];
    
    // Construir condiciones de destino (destino_id OR nombre)
    if (destino_id) {
      params.push(destino_id);
      destinoConditions.push(`destino_id = $${params.length}`);
    }
    
    if (destino_nombre && destino_nombre.trim()) {
      params.push(`%${destino_nombre.trim()}%`);
      destinoConditions.push(`(LOWER(to_city) ILIKE LOWER($${params.length}) OR LOWER(to_country) ILIKE LOWER($${params.length}))`);
    }
    
    // Si no hay condiciones de destino, retornar vacío
    if (destinoConditions.length === 0) {
      console.warn("⚠️ No hay destino_id ni destino_nombre para filtrar transportes");
      return [];
    }
    
    // Construir WHERE clause
    const whereParts = [`(${destinoConditions.join(" OR ")})`];
    
    // Agregar filtro de origen si está disponible
    if (from_like && from_like.trim()) {
      params.push(`%${from_like.trim()}%`);
      whereParts.push(`(LOWER(from_city) ILIKE LOWER($${params.length}) OR LOWER(from_country) ILIKE LOWER($${params.length}))`);
    }
    
    params.push(limit);
    
    const sql = `SELECT id, kind, provider, 
              from_city, to_city, from_country, to_country,
              duration,
              price_usd, carbon_kg, link_url, rating
       FROM transportes
       WHERE ${whereParts.join(" AND ")}
       ORDER BY price_usd ASC NULLS LAST
       LIMIT $${params.length};`;
    
    console.log("🔍 Query transportes:", sql);
    console.log("🔍 Params:", params);
    
    const { rows } = await db.query(sql, params);
    console.log(`✅ Encontrados ${rows.length} transportes`);
    
    // Si no encontramos resultados y había filtro de origen, intentar sin origen
    if (rows.length === 0 && from_like && destino_id) {
      console.log("⚠️ No se encontraron transportes con filtro de origen, intentando sin origen...");
      const fallbackParams = [destino_id, limit];
      const fallbackSql = `SELECT id, kind, provider, 
                from_city, to_city, from_country, to_country,
                duration,
                price_usd, carbon_kg, link_url, rating
         FROM transportes
         WHERE destino_id = $1
         ORDER BY price_usd ASC NULLS LAST
         LIMIT $2;`;
      
      const fallbackRows = await db.query(fallbackSql, fallbackParams);
      console.log(`✅ Encontrados ${fallbackRows.rows.length} transportes (sin filtro de origen)`);
      return fallbackRows.rows;
    }
    
    // Si aún no hay resultados y tenemos nombre de destino, intentar solo por nombre
    if (rows.length === 0 && destino_nombre && !destino_id) {
      console.log("⚠️ Intentando buscar solo por nombre de destino...");
      const nombreParams = [`%${destino_nombre.trim()}%`, limit];
      const nombreSql = `SELECT id, kind, provider, 
                from_city, to_city, from_country, to_country,
                duration,
                price_usd, carbon_kg, link_url, rating
         FROM transportes
         WHERE (LOWER(to_city) ILIKE LOWER($1) OR LOWER(to_country) ILIKE LOWER($1))
         ORDER BY price_usd ASC NULLS LAST
         LIMIT $2;`;
      
      const nombreRows = await db.query(nombreSql, nombreParams);
      console.log(`✅ Encontrados ${nombreRows.rows.length} transportes (solo por nombre)`);
      return nombreRows.rows;
    }
    
    return rows;
  } catch (error) {
    console.error("❌ Error en getTransportes:", error.message);
    console.error("❌ Stack:", error.stack);
    
    // Si el error es por columna desconocida, intentar una consulta más simple
    if (error.message && (error.message.includes("destino_id") || error.message.includes("column"))) {
      console.log("⚠️ Error de columna, intentando consulta alternativa...");
      try {
        if (destino_nombre && destino_nombre.trim()) {
          const params = [`%${destino_nombre.trim()}%`, limit];
          const sql = `SELECT id, kind, provider, 
                    from_city, to_city, from_country, to_country,
                    duration,
                    price_usd, carbon_kg, link_url, rating
             FROM transportes
             WHERE (LOWER(to_city) ILIKE LOWER($1) OR LOWER(to_country) ILIKE LOWER($1))
             ORDER BY price_usd ASC NULLS LAST
             LIMIT $2;`;
          
          const { rows } = await db.query(sql, params);
          console.log(`✅ Encontrados ${rows.length} transportes (consulta alternativa)`);
          return rows;
        }
      } catch (retryError) {
        console.error("❌ Error en consulta alternativa:", retryError.message);
      }
    }
    
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

async function getOfertas({ destino_id, limit = 6 }) {
  const { rows } = await db.query(
    `SELECT o.*, d.nombre AS destino_nombre, d.pais AS destino_pais
     FROM vw_ofertas_activas o
     LEFT JOIN destinos d ON d.id = o.destino_id
     WHERE o.destino_id = $1
     ORDER BY COALESCE(o.finaliza_en, o.created_at) ASC
     LIMIT $2;`,
    [destino_id, limit]
  );
  return rows;
}

async function getDestinoDetalle(destino_id) {
  const destino = await getById(destino_id);
  if (!destino) return null;

  const [hoteles, transportes, actividades, ofertas] = await Promise.all([
    getHoteles({ destino_id, limit: 12 }).catch(() => []),
    getTransportes({ destino_id, limit: 10 }).catch(() => []),
    getActividades({ destino_id, limit: 12 }).catch(() => []),
    getOfertas({ destino_id, limit: 8 }).catch(() => []),
  ]);

  return {
    destino,
    hoteles,
    transportes,
    actividades,
    ofertas,
  };
}

// ==============================
// Variantes por país (fallback)
// ==============================
async function getTransportesByCountry({ country, limit = 3 }) {
  const { rows } = await db.query(
    `SELECT t.id, t.kind, t.provider, t.from_city, t.from_country, t.to_city, t.to_country,
            t.duration, t.price_usd, t.carbon_kg, t.link_url, t.rating
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

module.exports = { listTop, autocomplete, getById, getTransportes, getHoteles, getActividades, getOfertas, getDestinoDetalle, getTransportesByCountry, getHotelesByCountry, getActividadesByCountry };
