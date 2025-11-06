const express = require("express");
const router = express.Router();
const svc = require("../services/destinosApp.service");

// ======================
// RUTA: /api/destinos-app/top
// ======================
// Devuelve los destinos principales (top) según filtros opcionales
// GET /api/destinos-app/top?country=Argentina&season=Verano&climate=Mediterráneo&limit=12
router.get("/top", async (req, res) => {
  try {
    const { country, season, climate, limit } = req.query;
    const data = await svc.listTop({
      limit: Number(limit) || 12, // máximo 12 resultados
      country,
      season,
      climate,
    });
    res.json({ data });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ===========================
// RUTA: /api/destinos-app/autocomplete
// ===========================
// Devuelve destinos para autocompletar (por nombre o país)
// GET /api/destinos-app/autocomplete?q=bu&limit=8
router.get("/autocomplete", async (req, res) => {
  try {
    const { q, limit } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ message: "Falta ?q=" });
    const data = await svc.autocomplete({ q: q.trim(), limit: Number(limit) || 8 });
    res.json({ data });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// =================================
// RUTA: /api/destinos-app/:id/sugerencias
// IMPORTANTE: Esta ruta debe ir ANTES de /:id para que Express la reconozca correctamente
// =================================
// Devuelve las sugerencias de transporte, alojamiento y actividades
// GET /api/destinos-app/:id/sugerencias
router.get("/:id/sugerencias", async (req, res) => {
  try {
    const { id } = req.params;
    const { from } = req.query || {};
    console.log(`📋 Obteniendo sugerencias para destino ID: ${id}`);

    // Verificar que el destino existe
    const destino = await svc.getById(id);
    if (!destino) {
      console.warn(`⚠️ Destino con ID ${id} no encontrado`);
      return res.status(200).json({ 
        message: "Destino no encontrado",
        transportes: [], 
        hoteles: [], 
        actividades: [] 
      });
    }

    console.log(`✅ Destino encontrado: ${destino.nombre || destino.name}`);

    // Usamos las funciones del service (evita depender de "pool" aquí)
    const [transportes, hoteles, actividades] = await Promise.all([
      svc.getTransportes({ destino_id: id, limit: 10, from_like: from }).catch(e => {
        console.error("❌ Error obteniendo transportes:", e.message);
        return [];
      }),
      svc.getHoteles({ destino_id: id, limit: 12 }).catch(e => {
        console.error("❌ Error obteniendo hoteles:", e.message);
        return [];
      }),
      svc.getActividades({ destino_id: id, limit: 16 }).catch(e => {
        console.error("❌ Error obteniendo actividades:", e.message);
        return [];
      }),
    ]);

    console.log(`✅ Sugerencias obtenidas: ${transportes.length} transportes, ${hoteles.length} hoteles, ${actividades.length} actividades`);

    // Siempre devolvemos un objeto válido, incluso si los arrays están vacíos
    res.json({ 
      transportes: transportes || [], 
      hoteles: hoteles || [], 
      actividades: actividades || [] 
    });
  } catch (error) {
    console.error("❌ Error en /:id/sugerencias:", error);
    // Devolvemos 200 con arrays vacíos en lugar de 500, para que el frontend pueda manejar la situación
    res.status(200).json({ 
      message: "No se pudieron cargar todas las sugerencias",
      error: error.message,
      transportes: [], 
      hoteles: [], 
      actividades: [] 
    });
  }
});

// ============================
// RUTA: /api/destinos-app/sugerencias?country=...
// ============================
// Devuelve sugerencias por país (fallback)
// GET /api/destinos-app/sugerencias?country=Argentina
router.get("/sugerencias", async (req, res) => {
  try {
    const { country } = req.query;
    if (!country || !country.trim()) {
      return res.status(400).json({ message: "Falta ?country=" });
    }

    const likeCountry = `%${country.trim()}%`;
    const [transportes, hoteles, actividades] = await Promise.all([
      svc.getTransportesByCountry({ country: likeCountry, limit: 3 }),
      svc.getHotelesByCountry({ country: likeCountry, limit: 3 }),
      svc.getActividadesByCountry({ country: likeCountry, limit: 4 }),
    ]);

    res.json({ transportes, hoteles, actividades });
  } catch (error) {
    console.error("❌ Error en /sugerencias?country:", error);
    res.status(500).json({ message: "Error al obtener sugerencias por país" });
  }
});

// ============================
// RUTA: /api/destinos-app/:id
// ============================
// Devuelve un destino completo (detalles de la base de datos)
// GET /api/destinos-app/:id
// IMPORTANTE: Esta ruta debe ir AL FINAL porque es la más genérica
router.get("/:id", async (req, res) => {
  try {
    const data = await svc.getById(req.params.id);
    if (!data) return res.status(404).json({ message: "Destino no encontrado" });
    res.json({ data });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
