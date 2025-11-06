import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./TripDetails.css";
import { fetchTripDetails } from "../../services/profile";

function fmtRange(ini, fin) {
  try {
    const opt = { day: "numeric", month: "long", year: "numeric" };
    const s = new Date(ini).toLocaleDateString("es-AR", opt);
    const e = new Date(fin).toLocaleDateString("es-AR", opt);
    return `${s} - ${e}`;
  } catch (_) {
    return `${ini || ""}${fin ? ` - ${fin}` : ""}`.trim();
  }
}

function getStatus(ini, fin) {
  const today = new Date();
  const start = new Date(ini);
  const end = new Date(fin);
  if (today < start) return { text: "En plan", cls: "td-badge--upcoming" };
  if (today > end) return { text: "Completado", cls: "td-badge--completed" };
  return { text: "En curso", cls: "td-badge--ongoing" };
}

export default function TripDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // usa datos pre-cargados si vienen del listado
        const fromState = location.state?.trip;
        if (fromState) {
          if (mounted) setTrip(fromState);
        } else {
          const data = await fetchTripDetails(id);
          if (mounted) setTrip(data);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  if (loading) {
    return <div className="td-wrap"><div className="td-skel" /></div>;
  }
  if (error || !trip) {
    return (
      <div className="td-wrap">
        <div className="td-error">
          <h3>No se pudo cargar el viaje</h3>
          <p>{error || "Desconocido"}</p>
          <button className="td-btn" onClick={() => navigate(-1)}>Volver</button>
        </div>
      </div>
    );
  }

  const title = trip.titulo || trip.ciudad || trip.destino || "Viaje";
  const status = getStatus(trip.fecha_inicio, trip.fecha_fin);

  return (
    <div className="td-wrap">
      <div className="td-hero">
        <div className="td-hero__inner">
          <h1 className="td-hero__title">{title}{trip.pais ? `, ${trip.pais}` : ""}</h1>
          <div className="td-hero__meta">
            <span className={`td-badge ${status.cls}`}>{status.text}</span>
            <span className="td-hero__dates">{fmtRange(trip.fecha_inicio, trip.fecha_fin)}</span>
            {(trip.origen_ciudad || trip.origen_pais) && (
              <span className="td-hero__dates">Salida: {trip.origen_ciudad}{trip.origen_pais ? `, ${trip.origen_pais}` : ""}</span>
            )}
          </div>
        </div>
      </div>

      <div className="td-grid">
        <section className="td-card td-main">
          <div className="td-card__title">Itinerario</div>
          {trip.actividades?.length ? (
            <ul className="td-list">
              {trip.actividades.map((a) => (
                <li key={a.id} className="td-item">
                  <div>
                    <strong>{a.nombre}</strong>
                    <div className="td-item__sub">{a.ciudad || trip.ciudad} {a.fecha ? `• ${a.fecha}` : ""} {a.hora ? `• ${a.hora}` : ""}</div>
                  </div>
                  {a.notas && <div className="td-item__notes">{a.notas}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="td-empty">Sin actividades cargadas</div>
          )}
        </section>

        <aside className="td-col">
          <section className="td-card">
            <div className="td-card__title">Alojamiento</div>
            {trip.alojamientos?.length ? (
              <ul className="td-list">
                {trip.alojamientos.map((h) => (
                  <li key={h.id} className="td-item">
                    <div>
                      <strong>{h.nombre || "Hotel"}</strong>
                      <div className="td-item__sub">{h.ciudad || trip.ciudad}</div>
                    </div>
                    <div className="td-item__sub">
                      {h.fecha_checkin} → {h.fecha_checkout}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="td-empty">Sin alojamiento</div>
            )}
          </section>

          <section className="td-card">
            <div className="td-card__title">Transporte</div>
            {trip.transportes?.length ? (
              <ul className="td-list">
                {trip.transportes.map((t) => (
                  <li key={t.id} className="td-item">
                    <div>
                      <strong>{t.tipo || "Transporte"}</strong>
                      <div className="td-item__sub">{t.origen} → {t.destino}</div>
                    </div>
                    <div className="td-item__sub">{t.fecha_salida} → {t.fecha_llegada}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="td-empty">Sin transporte</div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}


