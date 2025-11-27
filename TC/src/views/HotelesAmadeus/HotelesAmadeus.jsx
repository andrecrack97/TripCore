import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./HotelesAmadeus.css";

export default function HotelesAmadeus() {
  const { city } = useParams(); // "paris" o "barcelona"
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
  const navigate = useNavigate();
  
  // Obtener número de noches del plan
  const [nights, setNights] = useState(1);

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    minStars: 0,    // 0 = sin filtro
    maxPrice: 9999, // si algún hotel tiene price_night_usd lo va a usar
  });

  useEffect(() => {
    // Cargar número de noches del plan
    try {
      const planData = localStorage.getItem("planificarViaje");
      if (planData) {
        const plan = JSON.parse(planData);
        const fechaInicio = plan?.fecha_salida || plan?.fechaIda;
        const fechaFin = plan?.fecha_vuelta || plan?.fechaVuelta;
        if (fechaInicio && fechaFin) {
          const inicio = new Date(fechaInicio);
          const fin = new Date(fechaFin);
          const diffTime = Math.abs(fin - inicio);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setNights(Math.max(1, diffDays));
        }
      }
    } catch (e) {
      console.warn("No se pudo cargar el plan:", e);
    }

    (async () => {
      try {
        setLoading(true);
        setError("");

        const resp = await fetch(
          `${API_BASE}/api/hoteles?city=${encodeURIComponent(city)}`
        );
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(
            `Error HTTP ${resp.status} al cargar hoteles: ${txt || ""}`
          );
        }
        const data = await resp.json();
        const list = data.hotels || data.data || [];
        setHotels(list);
      } catch (e) {
        console.error("Error cargando hoteles Amadeus:", e);
        setError(
          e.message ||
            "No se pudieron cargar los hoteles desde la API de Amadeus."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [city, API_BASE]);

  const handleReservar = (hotel) => {
    // Guardar el hotel seleccionado en el plan
    try {
      const planData = localStorage.getItem("planificarViaje");
      if (planData) {
        const plan = JSON.parse(planData);
        // Agregar el hotel de Amadeus como seleccionado
        plan.hotel_amadeus = {
          id: hotel.id,
          name: hotel.name,
          price_night_usd: hotel.price_night_usd,
          stars: hotel.stars,
          rating: hotel.rating,
          address: hotel.address,
          image_url: hotel.image_url,
          source: 'amadeus'
        };
        localStorage.setItem("planificarViaje", JSON.stringify(plan));
        
        // Mostrar mensaje de éxito
        alert(`Hotel "${hotel.name}" seleccionado. Volviendo al planificador...`);
      }
    } catch (e) {
      console.error("Error al guardar hotel:", e);
      alert("Error al guardar el hotel seleccionado.");
      return;
    }
    
    // Volver al planificador con un parámetro para forzar recarga
    navigate("/planificar/5", { state: { reload: true } });
  };

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const name = (h.name || "").toLowerCase();
      const matchesSearch = filters.search
        ? name.includes(filters.search.toLowerCase())
        : true;

      const stars = Number(h.stars || 0);
      const matchesStars = filters.minStars
        ? stars >= filters.minStars
        : true;

      // En este endpoint de Amadeus no tenemos precio real,
      // pero si algún hotel llega a tener price_night_usd lo usamos.
      const price = Number(h.price_night_usd || 0);
      const matchesPrice = price
        ? price <= filters.maxPrice
        : true;

      return matchesSearch && matchesStars && matchesPrice;
    });
  }, [hotels, filters]);

  const cityLabel = city === "paris" ? "París" : city === "barcelona" ? "Barcelona" : city;

  return (
    <div className="hotam-page">
      <header className="hotam-header">
        <div>
          <p className="hotam-breadcrumb">
            <Link to="/planificar/5" className="hotam-link-back">
              ← Volver al planificador
            </Link>
          </p>
          <h1>Hoteles en {cityLabel}</h1>
          <p className="hotam-subtitle">
            Resultados obtenidos desde la API de Amadeus (sandbox) para el destino seleccionado.
          </p>
        </div>
      </header>

      {/* Filtros */}
      <section className="hotam-filters">
        <div className="hotam-filter-group">
          <label>Buscar por nombre</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            placeholder="Ej: Ibis, Hilton..."
          />
        </div>

        <div className="hotam-filter-group">
          <label>Estrellas mínimas</label>
          <select
            value={filters.minStars}
            onChange={(e) =>
              setFilters((f) => ({ ...f, minStars: Number(e.target.value) }))
            }
          >
            <option value={0}>Sin filtro</option>
            <option value={3}>3★ o más</option>
            <option value={4}>4★ o más</option>
            <option value={5}>5★</option>
          </select>
        </div>

        <div className="hotam-filter-group">
          <label>Precio máximo (USD)</label>
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) || 0 }))
            }
          />
          <small className="hotam-help">
            Este filtro sólo afecta hoteles que tengan price_night_usd disponible.
          </small>
        </div>
      </section>

      {loading && <p className="hotam-muted">Cargando hoteles…</p>}
      {error && <p className="hotam-error">{error}</p>}

      {!loading && !error && (
        <>
          <p className="hotam-muted">
            Mostrando {filteredHotels.length} de {hotels.length} hoteles
          </p>

          <section className="hotam-grid">
            {filteredHotels.map((h) => (
              <article
                key={h.id || h.hotelId}
                className="hotam-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--tc-border)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                {h.image_url && (
                  <img
                    src={h.image_url}
                    alt={h.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                    loading="lazy"
                  />
                )}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{h.name}</h3>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}>
                    {h.stars ? `${h.stars}★` : ''} {h.rating ? `— ${h.rating}` : ''}
                  </p>
                  {h.address && (
                    <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
                      📍 {h.address}
                    </p>
                  )}
                  {h.price_night_usd && (
                    <>
                      <div style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>
                        USD {h.price_night_usd} / noche · {nights} noche{nights === 1 ? '' : 's'}
                      </div>
                      <div style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
                        Subtotal: USD {(h.price_night_usd || 0) * nights}
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => handleReservar(h)}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--tc-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    Reservar
                  </button>
                </div>
              </article>
            ))}

            {filteredHotels.length === 0 && (
              <p className="hotam-muted">
                No se encontraron hoteles con los filtros seleccionados.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
