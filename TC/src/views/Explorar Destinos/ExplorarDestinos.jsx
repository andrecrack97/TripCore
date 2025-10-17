import React, { useEffect, useMemo, useState } from "react";
import AutoDestinoGeo from "../../components/DestinationAutocomplete";
import { destinosApi } from "../../services/destinosapi";
import "./ExplorarDestinos.css";

export default function ExplorarDestinos() {
  // Filtros
  const [countries, setCountries] = useState([]);
  const [countryId, setCountryId] = useState("");             // code: "AR"
  const [cityPicked, setCityPicked] = useState(null);          // objeto ciudad del autocomplete
  const [q, setQ] = useState("");                              // texto libre de búsqueda

  // Resultados
  const [results, setResults] = useState([]);
  const [recs, setRecs] = useState([]);                        // “Viajes similares a los tuyos”
  const [loading, setLoading] = useState(false);

  // Derivados
  const queryToSearch = useMemo(() => (cityPicked?.name || q || "").trim(), [cityPicked, q]);

  // Cargar países al inicio
  useEffect(() => {
    (async () => {
      try {
        const data = await destinosApi.listCountries({ limit: 250 });
        setCountries(data?.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Populares + recomendaciones de arranque
  useEffect(() => {
    loadPopular();
    loadRecs();
  }, []);

  async function loadPopular() {
    try {
      setLoading(true);
      const data = await destinosApi.popularCities({ minPopulation: 600000, limit: 12 });
      setResults(data?.data || []);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecs() {
    try {
      const data = await destinosApi.popularCities({ minPopulation: 400000, limit: 8 });
      setRecs(data?.data || []);
    } catch (e) {
      console.error(e);
      setRecs([]);
    }
  }

  async function applyFilters() {
    try {
      setLoading(true);
      const data = await destinosApi.searchCities({
        q: queryToSearch || "a",                 // mínima query para obtener algo si no eligen ciudad
        countryIds: countryId || undefined,
        minPopulation: 10000,
        limit: 12
      });
      setResults(data?.data || []);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setCountryId("");
    setCityPicked(null);
    setQ("");
    loadPopular();
  }

  return (
    <div className="ex-bg">
      <div className="ex-container">

        {/* Título + barra grande */}
        <h1 className="ex-title">Explorá tu próximo destino</h1>
        <div className="ex-searchbar">
          <span className="ex-search-ico" aria-hidden>🔍</span>
          <input
            className="ex-search-input"
            placeholder="¿A dónde querés ir?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="ex-layout">
          {/* Sidebar de filtros */}
          <aside className="ex-filters">
            <div className="ex-filter-group">
              <label className="ex-label">País</label>
              <select
                className="ex-input"
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
              >
                <option value="">Todos los países</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="ex-filter-group">
              <label className="ex-label">Ciudad</label>
              <AutoDestinoGeo
                label={null}
                placeholder="Buscar ciudad..."
                countryIds={countryId || undefined}
                defaultValue={cityPicked || undefined}
                onSelect={setCityPicked}
              />
            </div>

            {/* Chips decorativos como en la maqueta (no filtran en la API por ahora) */}
            <div className="ex-filter-group">
              <label className="ex-label">Clima</label>
              <div className="ex-chips">
                <button type="button" className="chip">Tropical</button>
                <button type="button" className="chip">Mediterráneo</button>
                <button type="button" className="chip">Templado</button>
                <button type="button" className="chip">Frío</button>
                <button type="button" className="chip">Desértico</button>
              </div>
            </div>

            <div className="ex-filter-group">
              <label className="ex-label">Temporada</label>
              <div className="ex-chips">
                <button type="button" className="chip">Verano</button>
                <button type="button" className="chip">Otoño</button>
                <button type="button" className="chip">Invierno</button>
                <button type="button" className="chip">Primavera</button>
              </div>
            </div>

            <button className="ex-apply" onClick={applyFilters}>Aplicar filtros</button>
            <button className="ex-clear" onClick={resetFilters}>Limpiar filtros</button>
          </aside>

          {/* Cards de resultados */}
          <section className="ex-results">
            {loading && <p className="muted">Cargando destinos...</p>}
            {!loading && results.length === 0 && <p className="muted">No hay resultados.</p>}

            <div className="ex-grid">
              {results.map((c) => (
                <DestinationCard key={c.id} city={c} />
              ))}
            </div>

            {/* Recomendados */}
            <h2 className="ex-subtitle">Viajes similares a los tuyos</h2>
            <div className="ex-grid ex-grid-sm">
              {recs.map((c) => (
                <DestinationCard key={`rec-${c.id}`} city={c} small />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------- Card de destino ---------- */

function DestinationCard({ city, small = false }) {
  const name = city.name || city.city;
  const region = city.region;
  const country = city.country;

  // Imagen dinámica sin API key (Unsplash por keyword):
  const imgUrl = `https://source.unsplash.com/600x400/?${encodeURIComponent(name)}%20city`;

  // Rating/price solo visuales (derivados de población para evitar hardcode)
  const pop = Number(city.population || 0);
  const rating = (Math.min(5, 3.9 + (pop % 1000) / 1000 * 1.1)).toFixed(1);
  const price = Math.max(300, Math.round(2500 - Math.min(2000, pop / 1000))); // USD referencial

  return (
    <article className={`ex-card ${small ? "sm" : ""}`}>
      <div className="ex-card-imgwrap">
        <img src={imgUrl} alt={name} loading="lazy" />
        <button className="ex-fav" title="Guardar">♡</button>
      </div>

      <div className="ex-card-body">
        <div className="ex-card-row">
          <h3 className="ex-card-title">{name}</h3>
          <div className="ex-badge"><span>⭐</span> {rating}</div>
        </div>
        <div className="ex-card-sub">{[country, region].filter(Boolean).join(" · ")}</div>

        {!small && (
          <p className="ex-card-desc">
            {region ? `Región ${region.toLowerCase()}. ` : ""}Ciudad para descubrir.
          </p>
        )}

        <div className="ex-card-tags">
          {region && <span className="tag">{region}</span>}
          {country && <span className="tag">{country}</span>}
        </div>

        <div className="ex-card-footer">
          <div className="ex-price">USD {price.toLocaleString()}</div>
          <button className="ex-more">Ver más</button>
        </div>
      </div>
    </article>
  );
}
