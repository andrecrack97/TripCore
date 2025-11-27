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
         COALESCE(d_destino.nombre, v.destino_principal) AS destino,
         COALESCE(d_destino.nombre, v.destino_principal) AS ciudad,
         COALESCE(d_destino.pais, NULL) AS pais,
         v.presupuesto_total AS presupuesto,
         COALESCE(d_origen.nombre, NULL) AS origen_ciudad,
         COALESCE(d_origen.pais, NULL)   AS origen_pais,
         4.6 AS rating
       FROM viajes v
       LEFT JOIN destinos d_origen ON d_origen.id = v.origen_id
       LEFT JOIN destinos d_destino ON d_destino.id = v.destino_id
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

    // Viaje base con JOINs para origen y destino
    const rTrip = await pool.query(
      `SELECT 
         v.id_viaje AS id,
         v.id_usuario,
         v.nombre_viaje AS titulo,
         v.fecha_inicio,
         v.fecha_fin,
         COALESCE(d_destino.nombre, v.destino_principal) AS destino,
         COALESCE(d_destino.nombre, v.destino_principal) AS ciudad,
         COALESCE(d_destino.pais, NULL) AS pais,
         v.presupuesto_total AS presupuesto,
         COALESCE(d_origen.nombre, NULL) AS origen_ciudad,
         COALESCE(d_origen.pais, NULL) AS origen_pais,
         v.transporte_id,
         v.hotel_id,
         v.actividades_ids
       FROM viajes v
       LEFT JOIN destinos d_origen ON d_origen.id = v.origen_id
       LEFT JOIN destinos d_destino ON d_destino.id = v.destino_id
       WHERE v.id_viaje = $1 AND v.id_usuario = $2
       LIMIT 1`,
      [id, req.userId]
    );
    if (rTrip.rowCount === 0) return res.status(404).json({ success: false, message: "Viaje no encontrado" });

    const trip = rTrip.rows[0];

    // Obtener selecciones guardadas directamente de viajes
    const transporte_id = trip.transporte_id;
    const hotel_id = trip.hotel_id;
    const actividades_ids = Array.isArray(trip.actividades_ids) ? trip.actividades_ids : [];

    // Remover campos internos antes de enviar la respuesta
    delete trip.transporte_id;
    delete trip.hotel_id;
    delete trip.actividades_ids;

    // Buscar datos desde las tablas originales usando los IDs guardados
    let alojamientos = [];
    let transportes = [];
    let actividades = [];
    
    if (hotel_id) {
      try {
        const rH = await pool.query(
          `SELECT id, name as nombre, NULL as ciudad, NULL as fecha_checkin, NULL as fecha_checkout, NULL as confirmacion,
                  stars, rating, price_night_usd, address, image_url, link_url
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
          `SELECT id, kind as tipo, from_city as origen, to_city as destino, 
                  NULL as fecha_salida, NULL as fecha_llegada, NULL as codigo_reserva,
                  provider, price_usd, duration_min, carbon_kg, link_url, rating
           FROM transportes WHERE id = $1`,
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
          `SELECT id, title as nombre, NULL as ciudad, NULL as fecha, NULL as hora, NULL as notas,
                  category, duration_hours, price_usd, meeting_point, image_url, rating, link_url
           FROM actividades WHERE id = ANY($1::uuid[])`,
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

    // Transportes: por origen/destino usando nombres correctos de columnas
    try {
      const rT = await pool.query(
        `SELECT id, kind as tipo, from_city as origen, to_city as destino, 
                price_usd as precio, provider as proveedor, duration_min, carbon_kg, link_url, rating
           FROM transportes
          WHERE ($1 = '' OR LOWER(to_city) LIKE LOWER('%' || $1 || '%') OR LOWER(to_country) LIKE LOWER('%' || $1 || '%'))
            AND ($2 = '' OR LOWER(from_city) LIKE LOWER('%' || $2 || '%') OR LOWER(from_country) LIKE LOWER('%' || $2 || '%'))
          ORDER BY price_usd ASC NULLS LAST
          LIMIT 10`,
        [destino, origen]
      );
      suggestions.transportes = rT.rows;
    } catch (e) {
      console.error("Error obteniendo sugerencias de transportes:", e);
    }

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

    // Alojamiento: por destino usando nombres correctos de columnas
    try {
      const rH = await pool.query(
        `SELECT h.id, h.name as nombre, d.nombre as ciudad, h.stars as calificacion, 
                h.price_night_usd as precio_noche, h.rating, h.address, h.image_url, h.link_url
           FROM hoteles h
           LEFT JOIN destinos d ON d.id = h.destino_id
          WHERE ($1 = '' OR LOWER(d.nombre) LIKE LOWER('%' || $1 || '%') OR LOWER(d.pais) LIKE LOWER('%' || $1 || '%'))
            AND ($2::int IS NULL OR h.price_night_usd <= $2)
          ORDER BY h.price_night_usd ASC NULLS LAST
          LIMIT 12`,
        [destino, perNight]
      );
      suggestions.alojamientos = rH.rows;
    } catch (e) {
      console.error("Error obteniendo sugerencias de alojamientos:", e);
    }

    // Actividades: por ciudad y preferencia usando nombres correctos de columnas
    const categoriaPreferida =
      travelerType === 'cultural' ? 'cultura'
      : travelerType === 'aventurero' ? 'aventura'
      : travelerType === 'familiar' ? 'familia'
      : null;
    try {
      const rA = await pool.query(
        `SELECT a.id, a.title as nombre, d.nombre as ciudad, a.category as categoria, 
                a.price_usd as precio, a.duration_hours as duracion, a.rating, a.image_url, a.link_url, a.meeting_point
           FROM actividades a
           LEFT JOIN destinos d ON d.id = a.destino_id
          WHERE ($1 = '' OR LOWER(d.nombre) LIKE LOWER('%' || $1 || '%') OR LOWER(d.pais) LIKE LOWER('%' || $1 || '%'))
            AND ($2 IS NULL OR LOWER(a.category::text) = LOWER($2))
          ORDER BY (CASE WHEN a.price_usd = 0 THEN -1 ELSE a.price_usd END) ASC, a.rating DESC NULLS LAST
          LIMIT 16`,
        [destino, categoriaPreferida]
      );
      suggestions.actividades = rA.rows;
    } catch (e) {
      console.error("Error obteniendo sugerencias de actividades:", e);
    }

    return res.json({ ...suggestions, currency, budget: totalBudget, nights });
  } catch (err) {
    console.error("❌ Error en /api/viajes/sugerencias:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// POST /api/viajes - Crear un nuevo viaje
router.post("/", auth, async (req, res) => {
  const {
    nombre_viaje,
    fecha_inicio,
    fecha_fin,
    destino_principal,
    destino_id,
    presupuesto_total,
    tipo_viaje,
    perfil_viajero,
    viajeros_adultos,
    viajeros_menores,
    moneda,
    origen_id,
    origen_ciudad,
    origen_pais,
  } = req.body;
  
  try {
    // Construir la query de inserción dinámicamente
    const fields = ['id_usuario', 'nombre_viaje', 'fecha_inicio', 'fecha_fin'];
    const values = [req.userId, nombre_viaje || "Mi viaje", fecha_inicio, fecha_fin];
    let paramIndex = values.length + 1;

    if (destino_principal !== undefined) {
      fields.push('destino_principal');
      values.push(destino_principal);
      paramIndex++;
    }
    if (destino_id !== undefined && destino_id !== null) {
      fields.push('destino_id');
      values.push(destino_id);
      paramIndex++;
    }
    if (presupuesto_total !== undefined) {
      fields.push('presupuesto_total');
      values.push(presupuesto_total);
      paramIndex++;
    }
    if (tipo_viaje !== undefined) {
      fields.push('tipo_viaje');
      values.push(tipo_viaje);
      paramIndex++;
    }
    if (perfil_viajero !== undefined) {
      fields.push('perfil_viajero');
      values.push(perfil_viajero);
      paramIndex++;
    }
    if (viajeros_adultos !== undefined) {
      fields.push('viajeros_adultos');
      values.push(viajeros_adultos);
      paramIndex++;
    }
    if (viajeros_menores !== undefined) {
      fields.push('viajeros_menores');
      values.push(viajeros_menores);
      paramIndex++;
    }
    if (moneda !== undefined) {
      fields.push('moneda');
      values.push(moneda);
      paramIndex++;
    }

    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const insert = await pool.query(
      `INSERT INTO viajes (${fields.join(', ')})
       VALUES (${placeholders})
       RETURNING id_viaje`,
      values
    );

    const newId = insert.rows[0].id_viaje;
    
    // Buscar destino principal y actualizar destino_id si no se proporcionó directamente
    if (!destino_id && destino_principal) {
      try {
        const rDestino = await pool.query(
          `SELECT id FROM destinos WHERE LOWER(nombre) = LOWER($1) LIMIT 1`,
          [destino_principal]
        );
        
        if (rDestino.rowCount > 0) {
          await pool.query(
            `UPDATE viajes SET destino_id = $1 WHERE id_viaje = $2`,
            [rDestino.rows[0].id, newId]
          );
        }
      } catch (err) {
        console.error("Error al guardar destino:", err);
      }
    }

    // Actualizar origen_id si viene directamente o buscar por nombre/pais
    if (origen_id) {
      await pool.query(
        `UPDATE viajes SET origen_id = $1 WHERE id_viaje = $2`,
        [origen_id, newId]
      );
    } else if (origen_ciudad || origen_pais) {
      try {
        const rDestino = await pool.query(
          `SELECT id FROM destinos WHERE LOWER(nombre) = LOWER($1) AND LOWER(pais) = LOWER($2) LIMIT 1`,
          [origen_ciudad || '', origen_pais || '']
        );
        
        if (rDestino.rowCount > 0) {
          await pool.query(
            `UPDATE viajes SET origen_id = $1 WHERE id_viaje = $2`,
            [rDestino.rows[0].id, newId]
          );
        }
      } catch (err) {
        console.error("Error al guardar origen:", err);
      }
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
      perfil_viajero,
      viajeros_adultos,
      viajeros_menores,
      moneda,
      transporte_id,
      hotel_id,
      actividades_ids,
      destino_id,
      origen_id,
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
      
      // Si se actualiza destino_principal, buscar destino_id también
      try {
        const rDestino = await pool.query(
          `SELECT id FROM destinos WHERE LOWER(nombre) = LOWER($1) LIMIT 1`,
          [destino_principal]
        );
        if (rDestino.rowCount > 0) {
          updates.push(`destino_id = $${paramIndex++}`);
          values.push(rDestino.rows[0].id);
        }
      } catch (err) {
        console.error("Error al buscar destino:", err);
        // Continuar sin fallar
      }
    }
    if (presupuesto_total !== undefined) {
      updates.push(`presupuesto_total = $${paramIndex++}`);
      values.push(presupuesto_total);
    }
    if (tipo_viaje !== undefined) {
      updates.push(`tipo_viaje = $${paramIndex++}`);
      values.push(tipo_viaje);
    }
    if (perfil_viajero !== undefined) {
      updates.push(`perfil_viajero = $${paramIndex++}`);
      values.push(perfil_viajero);
    }
    if (viajeros_adultos !== undefined) {
      updates.push(`viajeros_adultos = $${paramIndex++}`);
      values.push(viajeros_adultos);
    }
    if (viajeros_menores !== undefined) {
      updates.push(`viajeros_menores = $${paramIndex++}`);
      values.push(viajeros_menores);
    }
    if (moneda !== undefined) {
      updates.push(`moneda = $${paramIndex++}`);
      values.push(moneda);
    }

    // Agregar origen_id si viene directamente
    if (origen_id !== undefined && origen_id !== null) {
      updates.push(`origen_id = $${paramIndex++}`);
      values.push(origen_id);
    }

    // Buscar destino de origen y agregar origen_id a los updates si viene por nombre/pais
    if (!origen_id && (origen_ciudad !== undefined || origen_pais !== undefined)) {
      try {
        // Buscar destino existente por nombre y país
        const rDestino = await pool.query(
          `SELECT id FROM destinos WHERE LOWER(nombre) = LOWER($1) AND LOWER(pais) = LOWER($2) LIMIT 1`,
          [origen_ciudad || '', origen_pais || '']
        );
        
        let origenId = null;
        if (rDestino.rowCount > 0) {
          origenId = rDestino.rows[0].id;
        }
        
        // Agregar origen_id a los updates si encontramos el destino
        if (origenId) {
          updates.push(`origen_id = $${paramIndex++}`);
          values.push(origenId);
        }
      } catch (err) {
        console.error("Error al guardar origen:", err);
        // Continuar sin fallar si hay error al guardar el origen
      }
    }

    // Si viene destino_id, actualizamos destino_id en viajes
    if (destino_id !== undefined) {
      updates.push(`destino_id = $${paramIndex++}`);
      values.push(destino_id || null);
    }

    // Guardar selecciones (transporte_id, hotel_id, actividades_ids) directamente en viajes
    if (transporte_id !== undefined) {
      updates.push(`transporte_id = $${paramIndex++}`);
      values.push(transporte_id || null);
    }
    if (hotel_id !== undefined) {
      // Si el hotel_id es de Amadeus (empieza con 'ej-' o 'hotel-'), no lo guardamos directamente
      // porque no existe en la BD. En su lugar, se debería haber creado primero.
      // Pero si viene un UUID válido, lo guardamos normalmente
      const isAmadeusHotel = hotel_id && (typeof hotel_id === 'string' && (hotel_id.startsWith('ej-') || hotel_id.startsWith('hotel-')));
      if (!isAmadeusHotel) {
        updates.push(`hotel_id = $${paramIndex++}`);
        values.push(hotel_id || null);
      } else {
        console.warn(`⚠️ Hotel ID de Amadeus detectado (${hotel_id}), se debe crear primero en la BD antes de guardar`);
      }
    }
    
    // Si viene hotel_amadeus_data, crear el hotel en la BD primero
    if (req.body.hotel_amadeus_data && req.body.destino_id) {
      try {
        const hotelData = req.body.hotel_amadeus_data;
        const hotelInsert = await pool.query(
          `INSERT INTO hoteles (name, destino_id, stars, rating, price_night_usd, address, image_url, link_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [
            hotelData.name,
            req.body.destino_id,
            hotelData.stars || null,
            hotelData.rating || null,
            hotelData.price_night_usd || null,
            hotelData.address || null,
            hotelData.image_url || null,
            hotelData.link_url || null
          ]
        );
        
        if (hotelInsert.rows.length > 0) {
          const nuevoHotelId = hotelInsert.rows[0].id;
          updates.push(`hotel_id = $${paramIndex++}`);
          values.push(nuevoHotelId);
          console.log(`✅ Hotel de Amadeus creado en BD con ID: ${nuevoHotelId}`);
        }
      } catch (hotelErr) {
        console.error("❌ Error al crear hotel de Amadeus:", hotelErr);
        // No fallar el guardado por esto, solo loguear
      }
    }
    if (actividades_ids !== undefined) {
      // Manejar array de actividades_ids correctamente
      let actividadesValue = null;
      if (Array.isArray(actividades_ids) && actividades_ids.length > 0) {
        // Filtrar valores nulos/undefined y asegurar que sean UUIDs válidos
        actividadesValue = actividades_ids.filter(id => id != null && id !== '');
      } else if (Array.isArray(actividades_ids) && actividades_ids.length === 0) {
        // Array vacío se guarda como array vacío en PostgreSQL
        actividadesValue = [];
      }
      updates.push(`actividades_ids = $${paramIndex++}`);
      values.push(actividadesValue);
    }

    // Actualizar el viaje si hay campos para actualizar
    if (updates.length > 0) {
      const finalParamIndex = paramIndex;
      values.push(id, req.userId);
      await pool.query(
        `UPDATE viajes SET ${updates.join(", ")} WHERE id_viaje = $${finalParamIndex} AND id_usuario = $${finalParamIndex + 1}`,
        values
      );
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

// ===== Checklist Valija =====
// GET /api/viajes/:id/valija - obtener checklist guardada del viaje
router.get("/:id/valija", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: "ID inválido" });

    // verificar pertenencia del viaje
    const check = await pool.query(
      `SELECT 1 FROM viajes WHERE id_viaje = $1 AND id_usuario = $2 LIMIT 1`,
      [id, req.userId]
    );
    if (check.rowCount === 0) return res.status(404).json({ success: false, message: "Viaje no encontrado" });

    const { rows } = await pool.query(
      `SELECT id_valija, id_viaje, item, COALESCE(marcado, false) AS marcado
         FROM checklist_valija
        WHERE id_viaje = $1
        ORDER BY id_valija ASC`,
      [id]
    );
    return res.json({ items: rows });
  } catch (err) {
    console.error("❌ Error al obtener valija:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// PUT /api/viajes/:id/valija - reemplazar checklist completa
router.put("/:id/valija", auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: "ID inválido" });
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    // verificar pertenencia del viaje
    const check = await client.query(
      `SELECT 1 FROM viajes WHERE id_viaje = $1 AND id_usuario = $2 LIMIT 1`,
      [id, req.userId]
    );
    if (check.rowCount === 0) {
      client.release();
      return res.status(404).json({ success: false, message: "Viaje no encontrado" });
    }

    await client.query("BEGIN");
    await client.query(`DELETE FROM checklist_valija WHERE id_viaje = $1`, [id]);

    const inserted = [];
    for (const it of items) {
      const text = (it?.item || "").toString().slice(0, 100);
      if (!text) continue;
      const marcado = !!it?.marcado;
      const r = await client.query(
        `INSERT INTO checklist_valija (id_viaje, item, marcado)
         VALUES ($1, $2, $3) RETURNING id_valija, id_viaje, item, marcado`,
        [id, text, marcado]
      );
      inserted.push(r.rows[0]);
    }

    await client.query("COMMIT");
    client.release();
    return res.json({ success: true, items: inserted });
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch {}
    client.release();
    console.error("❌ Error al guardar valija:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// DELETE /api/viajes/valija/:id_valija - eliminar un item puntual
router.delete("/valija/:idValija", auth, async (req, res) => {
  try {
    const idValija = parseInt(req.params.idValija, 10);
    if (!Number.isFinite(idValija)) return res.status(400).json({ success: false, message: "ID inválido" });

    // verificar que pertenezca al usuario (join con viajes)
    const del = await pool.query(
      `DELETE FROM checklist_valija cv
        USING viajes v
        WHERE cv.id_valija = $1
          AND v.id_viaje = cv.id_viaje
          AND v.id_usuario = $2
        RETURNING cv.id_valija`,
      [idValija, req.userId]
    );
    if (del.rowCount === 0) return res.status(404).json({ success: false, message: "No encontrado" });
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al borrar item valija:", err);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

module.exports = router;
