const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

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

// GET /api/viajes
router.get("/", auth, async (req, res) => {
  try {
    const tab = (req.query.tab || "history").toString();
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.max(parseInt(req.query.pageSize || "10", 10), 1);
    const offset = (page - 1) * pageSize;

    // Simplificación: devolvemos todos los viajes del usuario y simulamos tabs
    const { rows } = await pool.query(
      `SELECT 
         v.id_viaje AS id,
         v.id_usuario,
         v.nombre_viaje AS titulo,
         v.fecha_inicio,
         v.fecha_fin,
         v.destino_principal AS destino,
         v.destino_principal AS ciudad,
         NULL::text AS pais,
         v.presupuesto_total AS presupuesto,
         COALESCE(vo.origen_ciudad, NULL) AS origen_ciudad,
         COALESCE(vo.origen_pais, NULL)   AS origen_pais,
         4.6 AS rating
       FROM viajes v
       LEFT JOIN viajes_origen vo ON vo.id_viaje = v.id_viaje
       WHERE v.id_usuario = $1
       ORDER BY v.id_viaje DESC
       LIMIT $2 OFFSET $3`,
      [req.userId, pageSize, offset]
    );
    res.json({ items: rows, page, pageSize });
  } catch (err) {
    console.log("LIAM")
    console.error("❌ Error al obtener viajes:", err);
    res.status(500).json({ error: "Error al obtener viajes" });
  }
});

// GET /api/viajes/:id - detalle de un viaje específico
router.get("/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: "ID inválido" });

    // Viaje base
    const rTrip = await pool.query(
      `SELECT 
         v.id_viaje AS id,
         v.id_usuario,
         v.nombre_viaje AS titulo,
         v.fecha_inicio,
         v.fecha_fin,
         v.destino_principal AS destino,
         v.destino_principal AS ciudad,
         NULL::text AS pais,
         v.presupuesto_total AS presupuesto,
         COALESCE(vo.origen_ciudad, NULL) AS origen_ciudad,
         COALESCE(vo.origen_pais, NULL)   AS origen_pais
       FROM viajes v
       LEFT JOIN viajes_origen vo ON vo.id_viaje = v.id_viaje
       WHERE v.id_viaje = $1 AND v.id_usuario = $2
       LIMIT 1`,
      [id, req.userId]
    );
    if (rTrip.rowCount === 0) return res.status(404).json({ success: false, message: "Viaje no encontrado" });

    const trip = rTrip.rows[0];

    // Obtener selecciones guardadas
    let transporte_id = null;
    let hotel_id = null;
    let actividades_ids = [];
    try {
      const rSel = await pool.query(
        `SELECT transporte_id, hotel_id, actividades_ids FROM viajes_selecciones WHERE id_viaje = $1`,
        [id]
      );
      if (rSel.rowCount > 0) {
        transporte_id = rSel.rows[0].transporte_id;
        hotel_id = rSel.rows[0].hotel_id;
        actividades_ids = Array.isArray(rSel.rows[0].actividades_ids) ? rSel.rows[0].actividades_ids : [];
      }
    } catch (_) {}

    // Buscar datos desde las tablas originales usando los IDs guardados
    let alojamientos = [];
    let transportes = [];
    let actividades = [];
    
    if (hotel_id) {
      try {
        const rH = await pool.query(
          `SELECT id as id, name as nombre, NULL as ciudad, NULL as fecha_checkin, NULL as fecha_checkout, NULL as confirmacion,
                  stars, rating, price_night_usd, address, image_url
           FROM hoteles WHERE id = $1`,
          [hotel_id]
        );
        if (rH.rowCount > 0) {
          alojamientos = [rH.rows[0]];
        }
      } catch (e) {
        console.error("Error obteniendo hotel:", e);
      }
    }

    if (transporte_id) {
      try {
        const rT = await pool.query(
          `SELECT id_transporte as id, tipo, origen, destino, 
                  fecha_salida, fecha_llegada, NULL as codigo_reserva,
                  proveedor as provider, precio as price_usd
           FROM transportes WHERE id_transporte = $1`,
          [transporte_id]
        );
        if (rT.rowCount > 0) {
          transportes = [rT.rows[0]];
        }
      } catch (e) {
        console.error("Error obteniendo transporte:", e);
      }
    }

    if (actividades_ids && actividades_ids.length > 0) {
      try {
        const rAct = await pool.query(
          `SELECT id as id, title as nombre, NULL as ciudad, NULL as fecha, NULL as hora, NULL as notas,
                  category, duration_hours, price_usd, meeting_point, image_url, rating
           FROM actividades WHERE id = ANY($1::int[])`,
          [actividades_ids]
        );
        actividades = rAct.rows;
      } catch (e) {
        console.error("Error obteniendo actividades:", e);
      }
    }

    return res.json({ ...trip, alojamientos, transportes, actividades });
  } catch (err) {
    console.error("❌ Error al obtener detalle del viaje:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// GET /api/viajes/sugerencias
// Retorna sugerencias de transporte, alojamiento y actividades filtradas por parámetros
router.get("/sugerencias", auth, async (req, res) => {
  const {
    origen = "",
    destino = "",
    fecha_salida = "",
    fecha_vuelta = "",
    travelerType = "",
    groupMode = "",
    budget = "",
    currency = "USD",
  } = req.query || {};

  try {
    const suggestions = { transportes: [], alojamientos: [], actividades: [] };

    // Transportes: por origen/destino y fechas si existen columnas
    try {
      const rT = await pool.query(
        `SELECT id_transporte as id, tipo, origen, destino, precio, moneda, fecha_salida, fecha_llegada, proveedor
           FROM transportes
          WHERE ($1 = '' OR LOWER(destino) LIKE LOWER('%' || $1 || '%'))
            AND ($2 = '' OR LOWER(origen) LIKE LOWER('%' || $2 || '%'))
            AND ($3 = '' OR fecha_salida >= $3::date)
            AND ($4 = '' OR fecha_llegada <= $4::date)
          ORDER BY precio ASC
          LIMIT 10`,
        [destino, origen, fecha_salida, fecha_vuelta]
      );
      suggestions.transportes = rT.rows;
    } catch (_) {}

    // Heurística de presupuesto por noche para alojamiento
    const nights = (() => {
      try {
        if (!fecha_salida || !fecha_vuelta) return 0;
        const d1 = new Date(fecha_salida);
        const d2 = new Date(fecha_vuelta);
        return Math.max(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)), 1);
      } catch { return 0; }
    })();
    const totalBudget = Number(budget) || 0;
    const perNight = nights > 0 ? Math.floor((totalBudget * 0.5) / nights) : null; // ~50% a stay

    // Alojamiento: por destino (ciudad), filtro precio_noche si hay presupuesto
    try {
      const rH = await pool.query(
        `SELECT id_alojamiento as id, nombre, ciudad, zona, calificacion, precio_noche, moneda, foto_url
           FROM alojamientos
          WHERE ($1 = '' OR LOWER(ciudad) LIKE LOWER('%' || $1 || '%'))
            AND ($2::int IS NULL OR precio_noche <= $2)
          ORDER BY precio_noche ASC NULLS LAST
          LIMIT 12`,
        [destino, perNight]
      );
      suggestions.alojamientos = rH.rows;
    } catch (_) {}

    // Actividades: por ciudad y preferencia
    const categoriaPreferida =
      travelerType === 'cultural' ? 'cultura'
      : travelerType === 'aventurero' ? 'aventura'
      : travelerType === 'familiar' ? 'familia'
      : null;
    try {
      const rA = await pool.query(
        `SELECT id_actividad as id, nombre, ciudad, categoria, precio, moneda, duracion, rating, foto_url
           FROM actividades
          WHERE ($1 = '' OR LOWER(ciudad) LIKE LOWER('%' || $1 || '%'))
            AND ($2 IS NULL OR LOWER(categoria) = LOWER($2))
          ORDER BY (CASE WHEN precio = 0 THEN -1 ELSE precio END) ASC, rating DESC NULLS LAST
          LIMIT 16`,
        [destino, categoriaPreferida]
      );
      suggestions.actividades = rA.rows;
    } catch (_) {}

    return res.json({ ...suggestions, currency, budget: totalBudget, nights });
  } catch (err) {
    console.error("❌ Error en /api/viajes/sugerencias:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// POST /api/viajes - Crear un nuevo viaje
router.post("/", auth, async (req, res) => {
  const { nombre_viaje, fecha_inicio, fecha_fin, destino_principal, presupuesto_total, tipo_viaje } = req.body;
  const { origen_ciudad, origen_pais } = req.body || {};
  
  try {
    const insert = await pool.query(
      `INSERT INTO viajes (id_usuario, nombre_viaje, fecha_inicio, fecha_fin, destino_principal, presupuesto_total, tipo_viaje)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_viaje, id_usuario, nombre_viaje, fecha_inicio, fecha_fin, destino_principal, presupuesto_total, tipo_viaje`,
      [req.userId, nombre_viaje || "Mi viaje", fecha_inicio, fecha_fin, destino_principal || null, presupuesto_total || null, tipo_viaje || null]
    );

    const newId = insert.rows[0].id_viaje;

    // Persistimos origen en tabla auxiliar (si no existe se crea)
    if (origen_ciudad || origen_pais) {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS viajes_origen (
           id_viaje INTEGER PRIMARY KEY,
           origen_ciudad TEXT,
           origen_pais TEXT
         );`
      );
      await pool.query(
        `INSERT INTO viajes_origen (id_viaje, origen_ciudad, origen_pais)
         VALUES ($1, $2, $3)
         ON CONFLICT (id_viaje) DO UPDATE SET
           origen_ciudad = COALESCE(EXCLUDED.origen_ciudad, viajes_origen.origen_ciudad),
           origen_pais   = COALESCE(EXCLUDED.origen_pais,   viajes_origen.origen_pais);`,
        [newId, origen_ciudad || null, origen_pais || null]
      );
    }

    res.status(201).json({
      success: true,
      id_viaje: newId,
      viaje: insert.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al crear viaje:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// POST /api/viajes/planificar
router.post("/planificar", async (req, res) => {
  const { id_usuario, nombre_viaje, fecha_inicio, fecha_fin } = req.body;
  if (!id_usuario || !nombre_viaje || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({
      success: false,
      message:
        "Campos requeridos: id_usuario, nombre_viaje, fecha_inicio (YYYY-MM-DD), fecha_fin (YYYY-MM-DD)",
    });
  }

  try {
    const insert = await pool.query(
      `INSERT INTO viajes (id_usuario, nombre_viaje, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4)
       RETURNING id_viaje, id_usuario, nombre_viaje, fecha_inicio, fecha_fin`,
      [id_usuario, nombre_viaje, fecha_inicio, fecha_fin]
    );

    res.status(201).json({
      success: true,
      message: "Viaje planificado correctamente",
      viaje: insert.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al insertar viaje:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// PATCH /api/viajes/:id - Actualizar un viaje
router.patch("/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: "ID inválido" });

    // Verificar que el viaje pertenece al usuario
    const check = await pool.query(
      `SELECT id_viaje FROM viajes WHERE id_viaje = $1 AND id_usuario = $2`,
      [id, req.userId]
    );
    if (check.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Viaje no encontrado" });
    }

    const {
      nombre_viaje,
      fecha_inicio,
      fecha_fin,
      destino_principal,
      presupuesto_total,
      tipo_viaje,
      transporte_id,
      hotel_id,
      actividades_ids,
      destino_id,
      origen_ciudad,
      origen_pais,
    } = req.body;

    // Construir la query de actualización dinámicamente
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (nombre_viaje !== undefined) {
      updates.push(`nombre_viaje = $${paramIndex++}`);
      values.push(nombre_viaje);
    }
    if (fecha_inicio !== undefined) {
      updates.push(`fecha_inicio = $${paramIndex++}`);
      values.push(fecha_inicio);
    }
    if (fecha_fin !== undefined) {
      updates.push(`fecha_fin = $${paramIndex++}`);
      values.push(fecha_fin);
    }
    if (destino_principal !== undefined) {
      updates.push(`destino_principal = $${paramIndex++}`);
      values.push(destino_principal);
    }
    if (presupuesto_total !== undefined) {
      updates.push(`presupuesto_total = $${paramIndex++}`);
      values.push(presupuesto_total);
    }
    if (tipo_viaje !== undefined) {
      updates.push(`tipo_viaje = $${paramIndex++}`);
      values.push(tipo_viaje);
    }

    // Actualizar el viaje si hay campos para actualizar
    if (updates.length > 0) {
      values.push(id, req.userId);
      await pool.query(
        `UPDATE viajes SET ${updates.join(", ")} WHERE id_viaje = $${paramIndex++} AND id_usuario = $${paramIndex++}`,
        values
      );
    }

    // Guardar origen en tabla auxiliar si viene
    if (origen_ciudad !== undefined || origen_pais !== undefined) {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS viajes_origen (
           id_viaje INTEGER PRIMARY KEY,
           origen_ciudad TEXT,
           origen_pais TEXT
         );`
      );
      await pool.query(
        `INSERT INTO viajes_origen (id_viaje, origen_ciudad, origen_pais)
         VALUES ($1, $2, $3)
         ON CONFLICT (id_viaje) DO UPDATE SET
           origen_ciudad = COALESCE(EXCLUDED.origen_ciudad, viajes_origen.origen_ciudad),
           origen_pais   = COALESCE(EXCLUDED.origen_pais,   viajes_origen.origen_pais);`,
        [id, origen_ciudad || null, origen_pais || null]
      );
    }

    // Guardar selecciones (transporte_id, hotel_id, actividades_ids) en tabla auxiliar
    if (transporte_id !== undefined || hotel_id !== undefined || actividades_ids !== undefined) {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS viajes_selecciones (
           id_viaje INTEGER PRIMARY KEY,
           transporte_id INTEGER,
           hotel_id INTEGER,
           actividades_ids INTEGER[]
         );`
      );
      await pool.query(
        `INSERT INTO viajes_selecciones (id_viaje, transporte_id, hotel_id, actividades_ids)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id_viaje) DO UPDATE SET
           transporte_id = COALESCE(EXCLUDED.transporte_id, viajes_selecciones.transporte_id),
           hotel_id = COALESCE(EXCLUDED.hotel_id, viajes_selecciones.hotel_id),
           actividades_ids = COALESCE(EXCLUDED.actividades_ids, viajes_selecciones.actividades_ids);`,
        [id, transporte_id || null, hotel_id || null, Array.isArray(actividades_ids) ? actividades_ids : null]
      );
    }

    // Si viene destino_id, actualizamos destino_principal (asumiendo que viene el nombre del destino)
    if (destino_id !== undefined) {
      // Aquí podrías hacer una consulta para obtener el nombre del destino desde la tabla destinos
      // Por ahora, si destino_id viene, lo ignoramos o lo usamos para actualizar destino_principal
    }

    const updated = await pool.query(
      `SELECT id_viaje AS id, id_usuario, nombre_viaje, fecha_inicio, fecha_fin, destino_principal, presupuesto_total, tipo_viaje
       FROM viajes WHERE id_viaje = $1 AND id_usuario = $2`,
      [id, req.userId]
    );

    return res.json({ success: true, viaje: updated.rows[0] });
  } catch (err) {
    console.error("❌ Error al actualizar viaje:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// POST /api/viajes/:id/confirm - Confirmar un viaje
router.post("/:id/confirm", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: "ID inválido" });

    // Verificar que el viaje pertenece al usuario
    const check = await pool.query(
      `SELECT id_viaje FROM viajes WHERE id_viaje = $1 AND id_usuario = $2`,
      [id, req.userId]
    );
    if (check.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Viaje no encontrado" });
    }

    // Por ahora, la confirmación solo devuelve éxito
    // En el futuro podrías agregar un campo "estado" o "confirmado" a la tabla viajes
    return res.json({ success: true, message: "Viaje confirmado correctamente" });
  } catch (err) {
    console.error("❌ Error al confirmar viaje:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// Favorito toggle fake (sin tabla específica): usa tabla favoritos si existe
router.patch("/:id/favorite", auth, async (req, res) => {
  try {
    const id = req.params.id;
    // toggle naive: si existe en favoritos lo borramos, si no lo insertamos
    const exists = await pool.query(
      `SELECT id_favorito FROM favoritos WHERE id_usuario = $1 AND tipo_elemento = 'viaje' AND id_elemento = $2 LIMIT 1`,
      [req.userId, id]
    );
    if (exists.rowCount > 0) {
      await pool.query(`DELETE FROM favoritos WHERE id_favorito = $1`, [exists.rows[0].id_favorito]);
      return res.json({ success: true, favorite: false });
    } else {
      await pool.query(
        `INSERT INTO favoritos (id_usuario, tipo_elemento, id_elemento) VALUES ($1, 'viaje', $2)`,
        [req.userId, id]
      );
      return res.json({ success: true, favorite: true });
    }
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
