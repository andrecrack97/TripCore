import React, { useEffect, useMemo, useState } from "react";
import AutoDestinoGeo from "../../components/AutoDestinoGeo";
import { destinosAppApi } from "../../services/destinosAppApi.js";
import "./ExplorarDestinos.css";

export default function ExplorarDestinos() {
  const [countries, setCountries] = useState([]);
  const [countryId, setCountryId] = useState("");
  const [cityPicked, setCityPicked] = useState(null);
  const [q, setQ] = useState("");

  const [results, setResults] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);

  const queryToSearch = useMemo(() => (cityPicked?.name || q || "").trim(), [cityPicked, q]);

  useEffect(() => {
    (async () => {
      await loadPopular();
      await loadRecs();
      buildCountriesFrom(results);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (results?.length) buildCountriesFrom(results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results?.length]);

  function buildCountriesFrom(list) {
    const set = new Set((list || []).map((d) => d.pais).filter(Boolean));
    setCountries(Array.from(set).sort());
  }

  async function loadPopular() {
    try {
      setLoading(true);
      const resp = await destinosAppApi.top({ limit: 12 });
      setResults(resp?.data || []);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecs() {
    try {
      const resp = await destinosAppApi.top({ limit: 8 });
      setRecs(resp?.data || []);
    } catch (e) {
      console.error(e);
      setRecs([]);
    }
  }

  async function applyFilters() {
    try {
      setLoading(true);
      const resp = await destinosAppApi.top({
        country: countryId || undefined,
        limit: 12,
      });
      setResults(resp?.data || []);
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
          <aside className="ex-filters">
            <div className="ex-filter-group">
              <label className="ex-label">País</label>
              <select className="ex-input" value={countryId} onChange={(e) => setCountryId(e.target.value)}>
                <option value="">Todos los países</option>
                {countries.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="ex-filter-group">
              <label className="ex-label">Ciudad</label>
              <AutoDestinoGeo
                label={null}
                placeholder="Buscar ciudad..."
                countryIds={undefined}
                defaultValue={cityPicked || undefined}
                onSelect={setCityPicked}
              />
            </div>

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

          <section className="ex-results">
            {loading && <p className="muted">Cargando destinos...</p>}
            {!loading && results.length === 0 && <p className="muted">No hay resultados.</p>}

            <div className="ex-grid">
              {results.map((d) => (
                <DestinationCard key={d.id} destino={d} />
              ))}
            </div>

            <h2 className="ex-subtitle">Viajes similares a los tuyos</h2>
            <div className="ex-grid ex-grid-sm">
              {recs.map((d) => (
                <DestinationCard key={`rec-${d.id}`} destino={d} small />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DestinationCard({ destino, small = false }) {
  const name = destino.nombre;
  const country = destino.pais;
  const region = destino.region;
  const rating = Number(destino.rating || 4.6).toFixed(1);
  const price = destino.precio_ref_usd || 900;

  const imgUrl =
    destino.hero_image_url ||
    `https://source.unsplash.com/600x400/?${encodeURIComponent(name)}%20city`;

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

        {!small && destino.descripcion && (
          <p className="ex-card-desc">{destino.descripcion}</p>
        )}

        <div className="ex-card-tags">
          {Array.isArray(destino.clima_tags) && destino.clima_tags.slice(0, 2).map((t, i) => (
            <span key={`c-${i}`} className="tag">{t}</span>
          ))}
          {Array.isArray(destino.temporada_tags) && destino.temporada_tags.slice(0, 1).map((t, i) => (
            <span key={`s-${i}`} className="tag">{t}</span>
          ))}
        </div>

        <div className="ex-card-footer">
          <div className="ex-price">USD {Number(price).toLocaleString()}</div>
          <button className="ex-more">Ver más</button>
        </div>
      </div>
    </article>
  );
}
