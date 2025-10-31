import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { destinosAppApi } from "../../services/destinosAppApi";
import "./PlanificarViaje5.css";

export default function PlanificarViaje5() {
  const [data, setData] = useState(null); // plan completo
  const [sugerencias, setSugerencias] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("planificarViaje");
      if (raw) setData(JSON.parse(raw));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!data?.destino?.id) return;
    (async () => {
      try {
        setLoading(true);
        const resp = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/destinos-app/${data.destino.id}/sugerencias`
        );
        const json = await resp.json();
        setSugerencias(json);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar las sugerencias.");
      } finally {
        setLoading(false);
      }
    })();
  }, [data?.destino?.id]);

  if (!data)
    return (
      <div className="pv5-bg">
        <div className="pv5-card">
          <h2>No se encontró el plan de viaje.</h2>
          <Link to="/planificar/1">Volver al inicio</Link>
        </div>
      </div>
    );

  const destinoNombre = data.destino?.nombre || data.destino?.name;
  const origenNombre = data.origen?.nombre || data.origen?.name;
  const presupuesto = Number(data.presupuesto || 0);

  const resumen = [
    { label: "Origen", value: origenNombre },
    { label: "Destino", value: destinoNombre },
    { label: "Fechas", value: `${data.fechaIda || "-"} → ${data.fechaVuelta || "-"}` },
    { label: "Presupuesto", value: `USD ${presupuesto.toLocaleString()}` },
  ];

  return (
    <div className="pv5-bg">
      <div className="pv5-card">
        <div className="pv5-breadcrumbs">
          <span className="muted">Planificador de Viajes</span>
          <span className="sep">›</span>
          <span className="crumb-active">Paso 5: Sugerencias Inteligentes</span>
        </div>

        <h1 className="pv5-title">Sugerencias Inteligentes</h1>
        <p className="pv5-subtitle">
          Aquí tenés un plan sugerido basado en tus preferencias.
        </p>

        {/* --- Resumen del viaje --- */}
        <div className="pv5-summary">
          {resumen.map((r) => (
            <div key={r.label} className="pv5-summary-item">
              <strong>{r.label}</strong>
              <span>{r.value}</span>
            </div>
          ))}
        </div>

        {loading && <p className="muted">Cargando sugerencias...</p>}
        {error && <p className="pv5-error">{error}</p>}

        {!loading && sugerencias && (
          <>
            {/* --- Transporte sugerido --- */}
            <section className="pv5-section">
              <h2>Transporte sugerido</h2>
              {sugerencias.transportes?.map((t) => (
                <div key={t.id} className="pv5-transport">
                  <div>
                    <b>{t.provider}</b> – {t.kind === "flight" ? "Vuelo" : t.kind}
                    <div className="muted">
                      {t.from_city} → {t.to_city} ({Math.round(t.duration_min / 60)}h)
                    </div>
                  </div>
                  <div className="pv5-price">USD {t.price_usd}</div>
                  <a href={t.link_url} target="_blank" rel="noreferrer" className="pv5-btn-small">
                    Reservar
                  </a>
                </div>
              ))}
            </section>

            {/* --- Alojamiento --- */}
            <section className="pv5-section">
              <h2>Alojamiento recomendado</h2>
              <div className="pv5-grid">
                {sugerencias.hoteles?.map((h) => (
                  <div key={h.id} className="pv5-hotel-card">
                    <img src={h.image_url} alt={h.name} loading="lazy" />
                    <div className="pv5-hotel-body">
                      <h3>{h.name}</h3>
                      <p>{h.stars}★ – {h.rating.toFixed(1)}</p>
                      <div className="pv5-price">USD {h.price_night_usd} / noche</div>
                      <a href={h.link_url} target="_blank" rel="noreferrer" className="pv5-btn-small">
                        Ver más
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* --- Actividades --- */}
            <section className="pv5-section">
              <h2>Actividades sugeridas</h2>
              <div className="pv5-grid">
                {sugerencias.actividades?.map((a) => (
                  <div key={a.id} className="pv5-activity-card">
                    <img src={a.image_url} alt={a.title} loading="lazy" />
                    <div className="pv5-activity-body">
                      <h3>{a.title}</h3>
                      <p className="muted">
                        {a.duration_hours} h · USD {a.price_usd}
                      </p>
                      <a href={a.link_url} target="_blank" rel="noreferrer" className="pv5-btn-small">
                        Agregar al itinerario
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* --- Presupuesto --- */}
            <section className="pv5-section">
              <h2>Resumen de presupuesto</h2>
              <div className="pv5-budget">
                <div>
                  Transporte: USD{" "}
                  {sugerencias.transportes?.[0]?.price_usd || 0}
                </div>
                <div>
                  Alojamiento: USD{" "}
                  {sugerencias.hoteles?.[0]?.price_night_usd || 0}
                </div>
                <div>
                  Actividades: USD{" "}
                  {sugerencias.actividades
                    ?.slice(0, 2)
                    .reduce((a, c) => a + (c.price_usd || 0), 0) || 0}
                </div>
              </div>
            </section>

            {/* --- Mapa placeholder --- */}
            <section className="pv5-section">
              <h2>Mapa interactivo</h2>
              <div className="pv5-map">
                <p className="muted">🗺️ Vista previa del itinerario (placeholder)</p>
              </div>
            </section>
          </>
        )}

        {/* --- Botones finales --- */}
        <div className="pv5-actions">
          <Link to="/planificar/4" className="pv5-back">
            ← Anterior
          </Link>
          <button className="pv5-confirm">Guardar itinerario</button>
        </div>
      </div>
    </div>
  );
}
