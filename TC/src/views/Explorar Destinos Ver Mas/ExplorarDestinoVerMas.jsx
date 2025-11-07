import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "./ExplorarDestinoVerMas.css";
import { destinosAppApi } from "../../services/destinosAppApi";

export default function ExplorarDestinoVerMas() {
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [destinoInfo, setDestinoInfo] = useState(location.state?.destino || {});

  const destinoId = id || destinoInfo.id || destinoInfo.destino_id;
  const titulo = destinoInfo.nombre || destinoInfo.titulo || destinoInfo.ciudad || data?.destino?.nombre || "Destino";
  const pais = destinoInfo.pais || data?.destino?.pais || "";

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!destinoId) {
          throw new Error("Destino sin identificador");
        }
        const detalle = await destinosAppApi.detalle(destinoId);
        if (mounted) {
          setData(detalle);
          if (detalle?.destino) {
            setDestinoInfo((prev) => ({ ...prev, ...detalle.destino }));
          }
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [destinoId]);

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
              {destinoInfo.descripcion || data?.destino?.descripcion || "Explora atractivos, cultura y experiencias únicas."}
            </p>
          </section>

          <aside className="edvm-card">
            <div className="edvm-card__title">Información práctica</div>
            <ul className="edvm-list">
              <li>País / Región: {[destinoInfo.pais || data?.destino?.pais, destinoInfo.region || data?.destino?.region].filter(Boolean).join(" · ") || "—"}</li>
              <li>Clima: {(destinoInfo.clima_tags || data?.destino?.clima_tags || []).join(", ") || "—"}</li>
              <li>Temporada ideal: {(destinoInfo.temporada_tags || data?.destino?.temporada_tags || []).join(", ") || "—"}</li>
              <li>Popularidad: {destinoInfo.popularidad ?? data?.destino?.popularidad ?? "—"}</li>
              <li>Rating promedio: {destinoInfo.rating ?? data?.destino?.rating ?? "—"}</li>
              <li>Presupuesto base: {destinoInfo.precio_ref_usd || data?.destino?.precio_ref_usd ? `USD ${(destinoInfo.precio_ref_usd || data?.destino?.precio_ref_usd).toLocaleString()}` : "—"}</li>
            </ul>
          </aside>

          <section className="edvm-card edvm-col-span-2">
            <div className="edvm-card__title">Alojamientos principales</div>
            <div className="edvm-cards">
              {(data?.hoteles || []).slice(0, 3).map((h) => (
                <article key={h.id} className="edvm-mini">
                  <div className="edvm-mini__title">{h.name}</div>
                  <div className="edvm-mini__sub">{h.address || destinoBase.nombre}</div>
                  {h.price_night_usd != null && (
                    <div className="edvm-mini__price">USD {h.price_night_usd}</div>
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
                  <div>{t.kind} {t.from_city} → {t.to_city}</div>
                  {t.price_usd != null && <div className="edvm-mini__price">USD {t.price_usd}</div>}
                </div>
              ))}
            </div>
          </aside>

          <section className="edvm-card edvm-col-span-2">
            <div className="edvm-card__title">Qué hacer</div>
            <div className="edvm-cards">
              {(data?.actividades || []).slice(0, 6).map((a) => (
                <article key={a.id} className="edvm-mini">
                  <div className="edvm-mini__title">{a.title}</div>
                  <div className="edvm-mini__sub">{a.category}</div>
                  {a.price_usd != null && (
                    <div className="edvm-mini__price">USD {a.price_usd}</div>
                  )}
                </article>
              ))}
            </div>
          </section>

          {Array.isArray(data?.ofertas) && data.ofertas.length > 0 && (
            <section className="edvm-card edvm-col-span-2">
              <div className="edvm-card__title">Ofertas especiales</div>
              <div className="edvm-cards">
                {data.ofertas.slice(0, 3).map((o) => (
                  <article key={o.id} className="edvm-mini">
                    <div className="edvm-mini__title">{o.titulo}</div>
                    <div className="edvm-mini__sub">{o.proveedor}</div>
                    <div className="edvm-mini__price">USD {o.price_usd}</div>
                    {o.descuento_pct != null && <div className="edvm-mini__badge">-{o.descuento_pct}%</div>}
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}


