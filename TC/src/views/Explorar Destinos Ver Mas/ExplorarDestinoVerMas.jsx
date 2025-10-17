import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "./ExplorarDestinoVerMas.css";
import { fetchExplorarDestinoDetalle } from "../../services/api";

export default function ExplorarDestinoVerMas() {
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const destinoBase = location.state?.destino || {};
  const titulo = destinoBase.titulo || destinoBase.ciudad || destinoBase.destino || "Destino";
  const pais = destinoBase.pais || "";

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchExplorarDestinoDetalle({ destino: destinoBase.titulo || destinoBase.ciudad || id });
        if (mounted) setData(resp);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  return (
    <section className="edvm-wrap">
      <div className="edvm-hero">
        <div className="edvm-hero__text">
          <h1>{titulo}{pais ? `, ${pais}` : ""}</h1>
          <div className="edvm-sub">Inspiración y opciones para tu viaje</div>
        </div>
        <button className="edvm-save">Guardar</button>
      </div>

      {loading ? (
        <div className="edvm-skel" />
      ) : error ? (
        <div className="edvm-error">No se pudo cargar: {String(error)}</div>
      ) : (
        <div className="edvm-grid">
          <section className="edvm-card edvm-col-span-2">
            <div className="edvm-card__title">Resumen del destino</div>
            <p>
              {destinoBase.descripcion || "Explora atractivos, cultura y experiencias únicas. Esta sección se enriquecerá con texto proveniente de la API."}
            </p>
          </section>

          <aside className="edvm-card">
            <div className="edvm-card__title">Información práctica</div>
            <ul className="edvm-list">
              <li>Clima: {(destinoBase.clima || []).join(", ") || "—"}</li>
              <li>Moneda: {data?.currency || "—"}</li>
              <li>Presupuesto base: {data?.budget ? `USD ${data.budget}` : "—"}</li>
            </ul>
          </aside>

          <section className="edvm-card edvm-col-span-2">
            <div className="edvm-card__title">Alojamientos principales</div>
            <div className="edvm-cards">
              {(data?.alojamientos || []).slice(0, 3).map((h) => (
                <article key={h.id} className="edvm-mini">
                  <div className="edvm-mini__title">{h.nombre}</div>
                  <div className="edvm-mini__sub">{h.ciudad}</div>
                  {h.precio_noche != null && (
                    <div className="edvm-mini__price">{h.moneda || "USD"} {h.precio_noche}</div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <aside className="edvm-card">
            <div className="edvm-card__title">Transporte</div>
            <div className="edvm-list">
              {(data?.transportes || []).slice(0, 2).map((t) => (
                <div key={t.id} className="edvm-mini-row">
                  <div>{t.tipo} {t.origen} → {t.destino}</div>
                  <div className="edvm-mini__sub">{t.fecha_salida} → {t.fecha_llegada}</div>
                </div>
              ))}
            </div>
          </aside>

          <section className="edvm-card edvm-col-span-2">
            <div className="edvm-card__title">Qué hacer</div>
            <div className="edvm-cards">
              {(data?.actividades || []).slice(0, 6).map((a) => (
                <article key={a.id} className="edvm-mini">
                  <div className="edvm-mini__title">{a.nombre}</div>
                  <div className="edvm-mini__sub">{a.ciudad} • {a.categoria}</div>
                  {a.precio != null && (
                    <div className="edvm-mini__price">{a.moneda || "USD"} {a.precio}</div>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}


