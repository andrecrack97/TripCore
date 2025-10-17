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
         id_viaje AS id,
         id_usuario,
         nombre_viaje AS titulo,
         fecha_inicio,
         fecha_fin,
         destino_principal AS destino,
         destino_principal AS ciudad,
         NULL::text AS pais,
         presupuesto_total AS presupuesto,
         4.6 AS rating
         FROM viajes
        WHERE id_usuario = $1
        ORDER BY id_viaje DESC
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
         v.presupuesto_total AS presupuesto
       FROM viajes v
       WHERE v.id_viaje = $1 AND v.id_usuario = $2
       LIMIT 1`,
      [id, req.userId]
    );
    if (rTrip.rowCount === 0) return res.status(404).json({ success: false, message: "Viaje no encontrado" });

    const trip = rTrip.rows[0];

    // Itinerario simple si existen tablas relacionadas
    let alojamientos = [];
    let transportes = [];
    let actividades = [];
    try {
      const rA = await pool.query(
        `SELECT id_reserva as id, nombre_hotel as nombre, ciudad, fecha_checkin, fecha_checkout, confirmacion
           FROM reservas_alojamiento WHERE id_viaje = $1 ORDER BY fecha_checkin ASC`,
        [id]
      );
      alojamientos = rA.rows;
    } catch (_) {}
    try {
      const rT = await pool.query(
        `SELECT id_transporte_viaje as id, tipo, origen, destino, fecha_salida, fecha_llegada, codigo_reserva
           FROM viajes_transportes WHERE id_viaje = $1 ORDER BY fecha_salida ASC`,
        [id]
      );
      transportes = rT.rows;
    } catch (_) {}
    try {
      const rAct = await pool.query(
        `SELECT id_viaje_actividad as id, nombre, ciudad, fecha, hora, notas
           FROM viajes_actividades WHERE id_viaje = $1 ORDER BY fecha ASC, hora ASC`,
        [id]
      );
      actividades = rAct.rows;
    } catch (_) {}

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
