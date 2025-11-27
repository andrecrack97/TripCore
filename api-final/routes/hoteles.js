// routes/hoteles.js
const express = require("express");
const amadeus = require("../utils/amadeusClient");
const pool = require("../db");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Función para obtener imagen de hotel según ciudad e identificador
function getHotelImage(cityCode, identifier) {
  // Usar diferentes imágenes según la ciudad
  const images = {
    'PAR': [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551882547-ec40e70219a3?w=400&h=300&fit=crop',
    ],
    'BCN': [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595576508898-0ad5f6a4d0e5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=400&h=300&fit=crop',
    ]
  };
  
  const cityImages = images[cityCode] || images['PAR'];
  // Usar un hash simple del identifier para seleccionar una imagen consistente
  const hash = identifier ? identifier.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random() * 1000;
  return cityImages[hash % cityImages.length];
}

// Middleware de autenticación
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "No autorizado" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.userId = decoded.userId || decoded.id || decoded.id_usuario;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
}



// GET /api/hoteles?city=paris|barcelona
router.get("/", async (req, res) => {
  try {
    // Si el cliente no está inicializado, devolvemos hoteles de ejemplo
    if (!amadeus) {
      console.warn("⚠️  Cliente de Amadeus no está inicializado. Devolviendo hoteles de ejemplo.");
      
      const city = (req.query.city || "").toLowerCase();
      let cityCode = null;
      if (city === "paris") cityCode = "PAR";
      if (city === "barcelona") cityCode = "BCN";
      
      if (!cityCode) {
        return res.status(400).json({ message: "City debe ser paris o barcelona" });
      }
      
      // Función para calcular precio estimado basado en estrellas
      const calcularPrecio = (stars, cityCode) => {
        const basePrice = cityCode === 'PAR' ? 80 : 70; // París es más caro
        const multiplicador = stars === 5 ? 3.5 : stars === 4 ? 2.5 : stars === 3 ? 1.5 : 1;
        return Math.round(basePrice * multiplicador);
      };

      const ejemploHoteles = {
        'BCN': [
          { id: 'ej-1', name: 'Hotel Arts Barcelona', cityCode: 'BCN', latitude: 41.3851, longitude: 2.1734, stars: 5, price_night_usd: calcularPrecio(5, 'BCN'), rating: 4.8, image_url: getHotelImage('BCN', 'ej-1'), address: 'Carrer de la Marina, 19-21, Barcelona' },
          { id: 'ej-2', name: 'Hotel Casa Fuster', cityCode: 'BCN', latitude: 41.3948, longitude: 2.1564, stars: 5, price_night_usd: calcularPrecio(5, 'BCN'), rating: 4.7, image_url: getHotelImage('BCN', 'ej-2'), address: 'Passeig de Gràcia, 132, Barcelona' },
          { id: 'ej-3', name: 'Ibis Barcelona Centro', cityCode: 'BCN', latitude: 41.3809, longitude: 2.1734, stars: 3, price_night_usd: calcularPrecio(3, 'BCN'), rating: 4.2, image_url: getHotelImage('BCN', 'ej-3'), address: 'Carrer de la Marina, 19-21, Barcelona' },
          { id: 'ej-4', name: 'Hilton Barcelona', cityCode: 'BCN', latitude: 41.3984, longitude: 2.1741, stars: 4, price_night_usd: calcularPrecio(4, 'BCN'), rating: 4.5, image_url: getHotelImage('BCN', 'ej-4'), address: 'Avinguda Diagonal, 589-591, Barcelona' },
          { id: 'ej-5', name: 'Hotel Barceló Raval', cityCode: 'BCN', latitude: 41.3793, longitude: 2.1696, stars: 4, price_night_usd: calcularPrecio(4, 'BCN'), rating: 4.3, image_url: getHotelImage('BCN', 'ej-5'), address: 'Rambla del Raval, 17-21, Barcelona' },
          { id: 'ej-6', name: 'Hotel Omm Barcelona', cityCode: 'BCN', latitude: 41.3930, longitude: 2.1588, stars: 5, price_night_usd: calcularPrecio(5, 'BCN'), rating: 4.6, image_url: getHotelImage('BCN', 'ej-6'), address: 'Carrer del Rosselló, 265, Barcelona' },
          { id: 'ej-7', name: 'Hotel Miramar Barcelona', cityCode: 'BCN', latitude: 41.3708, longitude: 2.1566, stars: 5, price_night_usd: calcularPrecio(5, 'BCN'), rating: 4.7, image_url: getHotelImage('BCN', 'ej-7'), address: 'Placa Carlos Ibáñez, 3, Barcelona' },
          { id: 'ej-8', name: 'NH Barcelona Eixample', cityCode: 'BCN', latitude: 41.3950, longitude: 2.1635, stars: 4, price_night_usd: calcularPrecio(4, 'BCN'), rating: 4.4, image_url: getHotelImage('BCN', 'ej-8'), address: 'Carrer d\'Aragó, 208, Barcelona' },
          { id: 'ej-9', name: 'Hotel Claris Barcelona', cityCode: 'BCN', latitude: 41.3932, longitude: 2.1617, stars: 5, price_night_usd: calcularPrecio(5, 'BCN'), rating: 4.8, image_url: getHotelImage('BCN', 'ej-9'), address: 'Carrer de Pau Claris, 150, Barcelona' },
          { id: 'ej-10', name: 'Hotel Yurbban Trafalgar', cityCode: 'BCN', latitude: 41.3834, longitude: 2.1769, stars: 4, price_night_usd: calcularPrecio(4, 'BCN'), rating: 4.5, image_url: getHotelImage('BCN', 'ej-10'), address: 'Carrer de Trafalgar, 30, Barcelona' }
        ],
        'PAR': [
          { id: 'ej-11', name: 'Hôtel Ritz Paris', cityCode: 'PAR', latitude: 48.8688, longitude: 2.3274, stars: 5, price_night_usd: calcularPrecio(5, 'PAR'), rating: 4.9, image_url: getHotelImage('PAR', 'ej-11'), address: '15 Place Vendôme, 75001 Paris' },
          { id: 'ej-12', name: 'Hôtel Plaza Athénée', cityCode: 'PAR', latitude: 48.8672, longitude: 2.3039, stars: 5, price_night_usd: calcularPrecio(5, 'PAR'), rating: 4.8, image_url: getHotelImage('PAR', 'ej-12'), address: '25 Avenue Montaigne, 75008 Paris' },
          { id: 'ej-13', name: 'Ibis Paris Centre', cityCode: 'PAR', latitude: 48.8566, longitude: 2.3522, stars: 3, price_night_usd: calcularPrecio(3, 'PAR'), rating: 4.1, image_url: getHotelImage('PAR', 'ej-13'), address: '2 Rue Malher, 75004 Paris' },
          { id: 'ej-14', name: 'Hilton Paris Opera', cityCode: 'PAR', latitude: 48.8738, longitude: 2.3315, stars: 4, price_night_usd: calcularPrecio(4, 'PAR'), rating: 4.4, image_url: getHotelImage('PAR', 'ej-14'), address: '108 Rue Saint-Lazare, 75008 Paris' },
          { id: 'ej-15', name: 'Hôtel Le Meurice', cityCode: 'PAR', latitude: 48.8657, longitude: 2.3294, stars: 5, price_night_usd: calcularPrecio(5, 'PAR'), rating: 4.9, image_url: getHotelImage('PAR', 'ej-15'), address: '228 Rue de Rivoli, 75001 Paris' },
          { id: 'ej-16', name: 'Hôtel des Invalides', cityCode: 'PAR', latitude: 48.8566, longitude: 2.3135, stars: 4, price_night_usd: calcularPrecio(4, 'PAR'), rating: 4.3, image_url: getHotelImage('PAR', 'ej-16'), address: '129 Rue de Grenelle, 75007 Paris' },
          { id: 'ej-17', name: 'Hotel Lutetia', cityCode: 'PAR', latitude: 48.8497, longitude: 2.3283, stars: 5, price_night_usd: calcularPrecio(5, 'PAR'), rating: 4.7, image_url: getHotelImage('PAR', 'ej-17'), address: '45 Boulevard Raspail, 75006 Paris' },
          { id: 'ej-18', name: 'Novotel Paris Les Halles', cityCode: 'PAR', latitude: 48.8625, longitude: 2.3442, stars: 4, price_night_usd: calcularPrecio(4, 'PAR'), rating: 4.2, image_url: getHotelImage('PAR', 'ej-18'), address: '8 Place Marguerite de Navarre, 75001 Paris' },
          { id: 'ej-19', name: 'Hôtel de Crillon', cityCode: 'PAR', latitude: 48.8675, longitude: 2.3206, stars: 5, price_night_usd: calcularPrecio(5, 'PAR'), rating: 4.9, image_url: getHotelImage('PAR', 'ej-19'), address: '10 Place de la Concorde, 75008 Paris' },
          { id: 'ej-20', name: 'Hotel des Grands Boulevards', cityCode: 'PAR', latitude: 48.8708, longitude: 2.3458, stars: 4, price_night_usd: calcularPrecio(4, 'PAR'), rating: 4.5, image_url: getHotelImage('PAR', 'ej-20'), address: '17 Boulevard Poissonnière, 75002 Paris' }
        ]
      };
      
      return res.json({ hotels: ejemploHoteles[cityCode] || [] });
    }

    const city = (req.query.city || "").toLowerCase();

    let cityCode = null;
    if (city === "paris") cityCode = "PAR";
    if (city === "barcelona") cityCode = "BCN";

    if (!cityCode) {
      return res.status(400).json({ message: "City debe ser paris o barcelona" });
    }
    // Hotel List API: lista de hoteles por código de ciudad
    const response = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode, // PAR o BCN
    });

    // La respuesta de Amadeus puede venir en response.data o directamente como array
    let hotelsData = response.data || response.result?.data || [];
    
    // Si no es un array, intentamos convertirlo
    if (!Array.isArray(hotelsData)) {
      console.warn("La respuesta de Amadeus no es un array:", typeof hotelsData);
      hotelsData = [];
    }

    // Limitar a 10 hoteles y estructurar la data para el front
    const hotels = hotelsData.slice(0, 10).map((h) => {
      // Amadeus puede devolver diferentes estructuras, intentamos todas las variantes
      const hotelId = h.hotelId || h.hotel?.hotelId || h.id || h.hotel?.id;
      const hotelName = h.name || h.hotel?.name || h.hotelName || "Hotel sin nombre";
      const iataCode = h.iataCode || h.hotel?.iataCode || h.address?.cityCode || cityCode;
      const latitude = h.geoCode?.latitude || h.latitude || h.hotel?.geoCode?.latitude;
      const longitude = h.geoCode?.longitude || h.longitude || h.hotel?.geoCode?.longitude;
      const rating = h.rating || h.hotel?.rating || h.hotelRating || null;

      // Calcular precio estimado basado en estrellas si no viene de la API
      const starsNum = rating ? Number(rating) : null;
      const precioEstimado = starsNum ? (cityCode === 'PAR' ? 80 : 70) * (starsNum === 5 ? 3.5 : starsNum === 4 ? 2.5 : starsNum === 3 ? 1.5 : 1) : null;

      return {
        id: hotelId || `hotel-${Math.random().toString(36).substr(2, 9)}`,
        name: hotelName,
        cityCode: iataCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        price_night_usd: precioEstimado ? Math.round(precioEstimado) : null,
        stars: starsNum,
        rating: starsNum ? (starsNum * 0.9 + Math.random() * 0.2).toFixed(1) : null, // Rating estimado
        image_url: getHotelImage(cityCode, hotelId || hotelName),
        address: `${cityCode === 'PAR' ? 'Paris' : 'Barcelona'}, ${cityCode}`,
      };
    });

    console.log(`✅ Hoteles encontrados para ${cityCode}: ${hotels.length}`);
    
    return res.json({ hotels });
  } catch (err) {
    // 👇 Acá logueamos MUCHÍSIMO más detalle
    console.error("❌ Error consultando hoteles en Amadeus:");
    console.error("Error completo:", err);
    
    // El SDK de Amadeus puede lanzar errores de diferentes formas
    const status = err.response?.statusCode || err.statusCode || err.code || 500;
    const amadeusBody = err.response?.body || err.response?.data || err.description || err.message || err;
    
    console.error("HTTP Status:", status);
    console.error("Error message:", err.message);
    console.error("Detalles:", typeof amadeusBody === 'object' ? JSON.stringify(amadeusBody, null, 2) : amadeusBody);

    // Si las credenciales no son válidas o hay un error de autenticación, devolvemos hoteles de ejemplo
    const clientId = process.env.AMADEUS_CLIENT_ID || '';
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET || '';
    
    const isAuthError = err.message?.includes('Unauthorized') || 
                       err.message?.includes('401') || 
                       err.statusCode === 401 ||
                       (typeof amadeusBody === 'object' && amadeusBody?.errors?.[0]?.code === 38191);
    
    if (isAuthError || clientId === 'tu_client_id' || clientSecret === 'tu_client_secret' || !clientId || !clientSecret) {
      console.warn('⚠️  Credenciales de Amadeus no válidas o no configuradas. Devolviendo hoteles de ejemplo.');
      
      // Obtener el código de ciudad nuevamente
      const city = (req.query.city || "").toLowerCase();
      let cityCode = null;
      if (city === "paris") cityCode = "PAR";
      if (city === "barcelona") cityCode = "BCN";
      
      // Función para calcular precio estimado basado en estrellas
      const calcularPrecio = (stars, cityCode) => {
        const basePrice = cityCode === 'PAR' ? 80 : 70; // París es más caro
        const multiplicador = stars === 5 ? 3.5 : stars === 4 ? 2.5 : stars === 3 ? 1.5 : 1;
        return Math.round(basePrice * multiplicador);
      };

          // Hoteles de ejemplo para Barcelona y París (10 hoteles cada uno)
          const ejemploHoteles = {
            'BCN': [
              { id: 'ej-1', name: 'Hotel Arts Barcelona', cityCode: 'BCN', latitude: 41.3851, longitude: 2.1734, stars: 5, price_night_usd: calcularPrecio(5, 'BCN'), rating: 4.8, image_url: getHotelImage('BCN', 'ej-1'), address: 'Carrer de la Marina, 19-21, Barcelona' },
              { id: 'ej-2', name: 'Hotel Casa Fuster', cityCode: 'BCN', latitude: 41.3948, longitude: 2.1564, stars: 5, price_night_usd: calcularPrecio(5, 'BCN'), rating: 4.7, image_url: getHotelImage('BCN', 'ej-2'), address: 'Passeig de Gràcia, 132, Barcelona' },
              { id: 'ej-3', name: 'Ibis Barcelona Centro', cityCode: 'BCN', latitude: 41.3809, longitude: 2.1734, stars: 3, price_night_usd: calcularPrecio(3, 'BCN'), rating: 4.2, image_url: getHotelImage('BCN', 'ej-3'), address: 'Carrer de la Marina, 19-21, Barcelona' },
              { id: 'ej-4', name: 'Hilton Barcelona', cityCode: 'BCN', latitude: 41.3984, longitude: 2.1741, stars: 4, price_night_usd: calcularPrecio(4, 'BCN'), rating: 4.5, image_url: getHotelImage('BCN', 'ej-4'), address: 'Avinguda Diagonal, 589-591, Barcelona' },
              { id: 'ej-5', name: 'Hotel Barceló Raval', cityCode: 'BCN', latitude: 41.3793, longitude: 2.1696, stars: 4, price_night_usd: calcularPrecio(4, 'BCN'), rating: 4.3, image_url: getHotelImage('BCN', 'ej-5'), address: 'Rambla del Raval, 17-21, Barcelona' },
              { id: 'ej-6', name: 'Hotel Omm Barcelona', cityCode: 'BCN', latitude: 41.3930, longitude: 2.1588, stars: 5, price_night_usd: calcularPrecio(5, 'BCN'), rating: 4.6, image_url: getHotelImage('BCN', 'ej-6'), address: 'Carrer del Rosselló, 265, Barcelona' },
              { id: 'ej-7', name: 'Hotel Miramar Barcelona', cityCode: 'BCN', latitude: 41.3708, longitude: 2.1566, stars: 5, price_night_usd: calcularPrecio(5, 'BCN'), rating: 4.7, image_url: getHotelImage('BCN', 'ej-7'), address: 'Placa Carlos Ibáñez, 3, Barcelona' },
              { id: 'ej-8', name: 'NH Barcelona Eixample', cityCode: 'BCN', latitude: 41.3950, longitude: 2.1635, stars: 4, price_night_usd: calcularPrecio(4, 'BCN'), rating: 4.4, image_url: getHotelImage('BCN', 'ej-8'), address: 'Carrer d\'Aragó, 208, Barcelona' },
              { id: 'ej-9', name: 'Hotel Claris Barcelona', cityCode: 'BCN', latitude: 41.3932, longitude: 2.1617, stars: 5, price_night_usd: calcularPrecio(5, 'BCN'), rating: 4.8, image_url: getHotelImage('BCN', 'ej-9'), address: 'Carrer de Pau Claris, 150, Barcelona' },
              { id: 'ej-10', name: 'Hotel Yurbban Trafalgar', cityCode: 'BCN', latitude: 41.3834, longitude: 2.1769, stars: 4, price_night_usd: calcularPrecio(4, 'BCN'), rating: 4.5, image_url: getHotelImage('BCN', 'ej-10'), address: 'Carrer de Trafalgar, 30, Barcelona' }
            ],
        'PAR': [
          { id: 'ej-11', name: 'Hôtel Ritz Paris', cityCode: 'PAR', latitude: 48.8688, longitude: 2.3274, stars: 5, price_night_usd: calcularPrecio(5, 'PAR'), rating: 4.9, image_url: 'https://picsum.photos/400/300?seed=RitzParis', address: '15 Place Vendôme, 75001 Paris' },
          { id: 'ej-12', name: 'Hôtel Plaza Athénée', cityCode: 'PAR', latitude: 48.8672, longitude: 2.3039, stars: 5, price_night_usd: calcularPrecio(5, 'PAR'), rating: 4.8, image_url: 'https://picsum.photos/400/300?seed=PlazaAthenee', address: '25 Avenue Montaigne, 75008 Paris' },
          { id: 'ej-13', name: 'Ibis Paris Centre', cityCode: 'PAR', latitude: 48.8566, longitude: 2.3522, stars: 3, price_night_usd: calcularPrecio(3, 'PAR'), rating: 4.1, image_url: 'https://picsum.photos/400/300?seed=IbisParis', address: '2 Rue Malher, 75004 Paris' },
          { id: 'ej-14', name: 'Hilton Paris Opera', cityCode: 'PAR', latitude: 48.8738, longitude: 2.3315, stars: 4, price_night_usd: calcularPrecio(4, 'PAR'), rating: 4.4, image_url: 'https://picsum.photos/400/300?seed=HiltonParis', address: '108 Rue Saint-Lazare, 75008 Paris' },
          { id: 'ej-15', name: 'Hôtel Le Meurice', cityCode: 'PAR', latitude: 48.8657, longitude: 2.3294, stars: 5, price_night_usd: calcularPrecio(5, 'PAR'), rating: 4.9, image_url: 'https://picsum.photos/400/300?seed=LeMeurice', address: '228 Rue de Rivoli, 75001 Paris' },
          { id: 'ej-16', name: 'Hôtel des Invalides', cityCode: 'PAR', latitude: 48.8566, longitude: 2.3135, stars: 4, price_night_usd: calcularPrecio(4, 'PAR'), rating: 4.3, image_url: 'https://picsum.photos/400/300?seed=InvalidesParis', address: '129 Rue de Grenelle, 75007 Paris' },
          { id: 'ej-17', name: 'Hotel Lutetia', cityCode: 'PAR', latitude: 48.8497, longitude: 2.3283, stars: 5, price_night_usd: calcularPrecio(5, 'PAR'), rating: 4.7, image_url: 'https://picsum.photos/400/300?seed=LutetiaParis', address: '45 Boulevard Raspail, 75006 Paris' },
          { id: 'ej-18', name: 'Novotel Paris Les Halles', cityCode: 'PAR', latitude: 48.8625, longitude: 2.3442, stars: 4, price_night_usd: calcularPrecio(4, 'PAR'), rating: 4.2, image_url: 'https://picsum.photos/400/300?seed=NovotelParis', address: '8 Place Marguerite de Navarre, 75001 Paris' },
          { id: 'ej-19', name: 'Hôtel de Crillon', cityCode: 'PAR', latitude: 48.8675, longitude: 2.3206, stars: 5, price_night_usd: calcularPrecio(5, 'PAR'), rating: 4.9, image_url: 'https://picsum.photos/400/300?seed=CrillonParis', address: '10 Place de la Concorde, 75008 Paris' },
          { id: 'ej-20', name: 'Hotel des Grands Boulevards', cityCode: 'PAR', latitude: 48.8708, longitude: 2.3458, stars: 4, price_night_usd: calcularPrecio(4, 'PAR'), rating: 4.5, image_url: 'https://picsum.photos/400/300?seed=GrandsBoulevards', address: '17 Boulevard Poissonnière, 75002 Paris' }
        ]
      };
      
      const hotelesEjemplo = ejemploHoteles[cityCode] || [];
      return res.json({ 
        hotels: hotelesEjemplo
      });
    }

    return res.status(typeof status === 'number' && status >= 100 && status < 600 ? status : 500).json({
      message: "Error consultando hoteles en la API de Amadeus",
      error: err.message || "Error desconocido",
      details: amadeusBody, // así también lo podés ver en la pestaña Network
    });
  }
});

// POST /api/hoteles - Crear un hotel (usado para hoteles de Amadeus)
router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      destino_id,
      stars,
      rating,
      price_night_usd,
      address,
      image_url,
      link_url,
    } = req.body;

    if (!name || !destino_id) {
      return res.status(400).json({
        success: false,
        message: "name y destino_id son requeridos",
      });
    }

    // Verificar que el destino existe
    let checkDestino = await pool.query(
      `SELECT id FROM destinos WHERE id = $1`,
      [destino_id]
    );

    // Si no existe por ID, intentar buscar por nombre/pais si vienen en el body
    if (checkDestino.rowCount === 0 && req.body.destino_nombre) {
      const destinoNombre = req.body.destino_nombre;
      const destinoPais = req.body.destino_pais || null;
      
      if (destinoPais) {
        checkDestino = await pool.query(
          `SELECT id FROM destinos WHERE LOWER(nombre) = LOWER($1) AND LOWER(pais) = LOWER($2) LIMIT 1`,
          [destinoNombre, destinoPais]
        );
      } else {
        checkDestino = await pool.query(
          `SELECT id FROM destinos WHERE LOWER(nombre) = LOWER($1) LIMIT 1`,
          [destinoNombre]
        );
      }
      
      // Si encontramos el destino, usar ese ID
      if (checkDestino.rowCount > 0) {
        destino_id = checkDestino.rows[0].id;
      }
    }

    if (checkDestino.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Destino no encontrado. Asegúrate de que el destino existe en la base de datos.",
        hint: "El destino_id proporcionado no existe. Puede que necesites crear el viaje primero para que el destino sea resuelto."
      });
    }

    // Insertar el hotel
    const result = await pool.query(
      `INSERT INTO hoteles (name, destino_id, stars, rating, price_night_usd, address, image_url, link_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, destino_id, stars, rating, price_night_usd, address, image_url, link_url`,
      [
        name,
        destino_id,
        stars || null,
        rating || null,
        price_night_usd || null,
        address || null,
        image_url || null,
        link_url || null,
      ]
    );

    return res.status(201).json({
      success: true,
      hotel: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error al crear hotel:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
});

module.exports = router;
