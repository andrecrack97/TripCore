import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import "./HotelesAmadeus.css";

export default function HotelesAmadeus() {
  const { city } = useParams(); // "paris" o "barcelona"
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    minStars: 0,    // 0 = sin filtro
    maxPrice: 9999, // si algún hotel tiene price_night_usd lo va a usar
  });

  useEffect(() => {
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
              >
                <h3>{h.name}</h3>
                <p className="hotam-city">
                  {h.cityCode || "Ciudad desconocida"}
                </p>
                {h.stars && (
                  <p className="hotam-stars">{h.stars}★</p>
                )}
                {h.price_night_usd && (
                  <p className="hotam-price">
                    Desde USD {h.price_night_usd} / noche
                  </p>
                )}
                {h.latitude && h.longitude && (
                  <p className="hotam-coords">
                    Lat: {h.latitude}, Lon: {h.longitude}
                  </p>
                )}
                <p className="hotam-source">
                  Fuente: Amadeus (hotelId: {h.id || h.hotelId})
                </p>
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
