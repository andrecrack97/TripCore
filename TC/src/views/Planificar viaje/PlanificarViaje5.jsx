import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { destinosAppApi } from "../../services/destinosAppApi";
import { viajesApi } from "../../services/viajesApi";       // <— nuevo servicio
import "./PlanificarViaje5.css";

function diffNights(startISO, endISO) {
  if (!startISO || !endISO) return 0;
  const start = new Date(startISO);
  const end = new Date(endISO);
  const ms = end.getTime() - start.getTime();
  const nights = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24))); // Restando días
  return Number.isFinite(nights) ? nights : 0;
}


export default function PlanificarViaje5() {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
  const nav = useNavigate();

  const [plan, setPlan] = useState(null);
  const [sug, setSug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [pick, setPick] = useState({
    transporte_id: null,
    hotel_id: null,
    actividades_ids: [],
  });

  // cargar plan local
  useEffect(() => {
    const raw = localStorage.getItem("planificarViaje");
    if (raw) setPlan(JSON.parse(raw));
  }, []);

  const nights = useMemo(
    () => diffNights(plan?.fecha_salida || plan?.fechaIda, plan?.fecha_vuelta || plan?.fechaVuelta),
    [plan?.fecha_salida, plan?.fecha_vuelta, plan?.fechaIda, plan?.fechaVuelta]
  );

  // cargar sugerencias (resuelve id si vino de GeoDB)
  useEffect(() => {
    (async () => {
      if (!plan) return;
      try {
        setLoading(true);
        setError("");

        let destinoId = plan.destino?.id;
        if (!destinoId && plan.destino?.nombre && plan.destino?.pais) {
          const r = await destinosAppApi
            .resolve(plan.destino.nombre, plan.destino.pais)
            .catch(() => null);
          if (r?.data?.id) {
            destinoId = r.data.id;
            // opcional: persistimos el id en el viaje
            if (plan.id_viaje) await viajesApi.patch(plan.id_viaje, { destino_id: destinoId });
            const newPlan = { ...plan, destino: { ...plan.destino, id: destinoId } };
            localStorage.setItem("planificarViaje", JSON.stringify(newPlan));
            setPlan(newPlan);
          }
        }

        if (!destinoId) throw new Error("No se pudo resolver el destino");

        const resp = await fetch(`${API_BASE}/api/destinos-app/${destinoId}/sugerencias`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        setSug(json);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar las sugerencias.");
      } finally {
        setLoading(false);
      }
    })();
  }, [plan]);

  // helpers de selección
  const setTransporte = (id) => setPick((p) => ({ ...p, transporte_id: id }));
  const setHotel = (id) => setPick((p) => ({ ...p, hotel_id: id }));
  const toggleAct = (id) =>
    setPick((p) => ({
      ...p,
      actividades_ids: p.actividades_ids.includes(id)
        ? p.actividades_ids.filter((x) => x !== id)
        : [...p.actividades_ids, id],
    }));

  // subtotales y total
  const transporteSel = sug?.transportes?.find((t) => t.id === pick.transporte_id);
  const hotelSel = sug?.hoteles?.find((h) => h.id === pick.hotel_id);
  const actsSel = sug?.actividades?.filter((a) => pick.actividades_ids.includes(a.id)) || [];

  const subtTransporte = transporteSel?.price_usd || 0;
  const subtHotel = (hotelSel?.price_night_usd || 0) * nights;         // 👈 noches
  const subtActiv = actsSel.reduce((acc, a) => acc + (a.price_usd || 0), 0);
  const total = subtTransporte + subtHotel + subtActiv;

  async function guardar() {
    try {
      if (!plan?.id_viaje) throw new Error("Falta id del viaje");
      setSaving(true);
      await viajesApi.patch(plan.id_viaje, pick);
      await viajesApi.confirm(plan.id_viaje);
      nav("/mis-viajes"); // ruta final
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!plan) return null;

  const destinoNombre = plan.destino?.nombre || plan.destino?.name || "-";
  const origenNombre = plan.origen?.nombre || plan.origen?.name || "-";
  const presupuesto = Number(plan.presupuesto || plan.presupuesto_total || 0);

  return (
    <div className="pv5-bg">
      <div className="pv5-card">
        <div className="pv5-breadcrumbs">
          <span className="muted">Planificador de Viajes</span>
          <span className="sep">›</span>
          <span className="crumb-active">Paso 5: Sugerencias Inteligentes</span>
        </div>

        <h1 className="pv5-title">Sugerencias Inteligentes</h1>

        {/* Resumen */}
        <div className="pv5-summary">
          <div className="pv5-summary-item"><strong>Origen</strong><span>{origenNombre}</span></div>
          <div className="pv5-summary-item"><strong>Destino</strong><span>{destinoNombre}</span></div>
          <div className="pv5-summary-item"><strong>Fechas</strong><span>{(plan.fecha_salida||plan.fechaIda||"-")} → {(plan.fecha_vuelta||plan.fechaVuelta||"-")}</span></div>
          <div className="pv5-summary-item"><strong>Presupuesto</strong><span>USD {presupuesto.toLocaleString()}</span></div>
        </div>

        {loading && <p className="muted">Cargando sugerencias…</p>}
        {error && <p className="pv5-error">{error}</p>}

        {!loading && !error && sug && (
          <>
            {/* Transporte */}
            <section className="pv5-section">
              <h2>Transporte sugerido</h2>
              {sug.transportes?.map((t) => (
                <div key={t.id} className="pv5-transport">
                  <div>
                    <b>{t.provider}</b> — {t.kind === "flight" ? "Vuelo" : t.kind}
                    <div className="muted">{t.from_city} → {t.to_city} ({Math.round((t.duration_min || 0)/60)}h)</div>
                  </div>
                  <div className="pv5-price">USD {t.price_usd}</div>
                  <button
                    onClick={() => setTransporte(t.id)}
                    className="pv5-btn-small"
                    style={{ background: pick.transporte_id === t.id ? "#5800db" : "var(--tc-primary)" }}
                  >
                    {pick.transporte_id === t.id ? "Seleccionado" : "Reservar"}
                  </button>
                </div>
              ))}
            </section>

            {/* Hoteles */}
            <section className="pv5-section">
              <h2>Alojamiento recomendado</h2>
              <div className="pv5-grid">
                {sug.hoteles?.map((h) => {
                  const sel = pick.hotel_id === h.id;
                  return (
                    <div key={h.id} className="pv5-hotel-card" style={{ border: sel ? "2px solid var(--tc-primary)" : "1px solid var(--tc-border)" }}>
                      <img src={h.image_url} alt={h.name} loading="lazy" />
                      <div className="pv5-hotel-body">
                        <h3>{h.name}</h3>
                        <p>{h.stars ?? ""}★ — {Number.isFinite(Number(h.rating)) ? Number(h.rating).toFixed(1) : "-"}</p>
                        <div className="pv5-price">
                          USD {h.price_night_usd} / noche · {nights} noche{s => nights===1 ? "" : "s"}
                        </div>
                        <div className="pv5-price muted">Subtotal: USD {(h.price_night_usd || 0) * nights}</div>
                        <button
                          className="pv5-btn-small"
                          onClick={() => setHotel(h.id)}
                          style={{ background: sel ? "#5800db" : "var(--tc-primary)" }}
                        >
                          {sel ? "Seleccionado" : "Reservar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Actividades */}
            <section className="pv5-section">
              <h2>Actividades sugeridas</h2>
              <div className="pv5-grid">
                {sug.actividades?.map((a) => {
                  const sel = pick.actividades_ids.includes(a.id);
                  return (
                    <div key={a.id} className="pv5-activity-card" style={{ border: sel ? "2px solid var(--tc-primary)" : "1px solid var(--tc-border)" }}>
                      <img src={a.image_url} alt={a.title} loading="lazy" />
                      <div className="pv5-activity-body">
                        <h3>{a.title}</h3>
                        <p className="muted">{a.duration_hours} h · USD {a.price_usd}</p>
                        <button
                          onClick={() => toggleAct(a.id)}
                          className="pv5-btn-small"
                          style={{ background: sel ? "#5800db" : "var(--tc-primary)" }}
                        >
                          {sel ? "Agregada" : "Agregar al itinerario"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Presupuesto */}
            <section className="pv5-section">
              <h2>Resumen de presupuesto</h2>
              <div className="pv5-budget">
                <div>Transporte: USD {subtTransporte}</div>
                <div>Alojamiento: USD {subtHotel} <span className="muted">( {nights} noche{nights===1?"":"s"} )</span></div>
                <div>Actividades: USD {subtActiv}</div>
                <hr />
                <strong>Total estimado: USD {total}</strong>
                <span className="muted">Quedan USD {(presupuesto - total).toFixed(2)} de tu presupuesto</span>
              </div>
            </section>

            {/* Mapa placeholder */}
            <section className="pv5-section">
              <h2>Mapa interactivo</h2>
              <div className="pv5-map"><p className="muted">🗺️ Vista previa del itinerario</p></div>
            </section>
          </>
        )}

        {/* Acciones */}
        <div className="pv5-actions">
          <Link to="/planificar/4" className="pv5-back">← Anterior</Link>
          <button className="pv5-confirm" onClick={guardar} disabled={saving}>
            {saving ? "Guardando..." : "Guardar itinerario"}
          </button>
        </div>
      </div>
    </div>
  );
}
