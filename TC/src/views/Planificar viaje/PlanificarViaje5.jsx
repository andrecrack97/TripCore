import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlanificarViaje5.css";

// ===== DEMO DATA (reemplazá por tu backend/estado real) =====
const tripSummary = {
  destino: "París, Francia",
  fechas: { desde: "2025-08-17", hasta: "2025-08-27" },
  viajeros: 2,
  perfil: "Cultural (pareja)",
  presupuesto: 1900,
  moneda: "USD",
};

const transportSugerido = {
  id: "AF1234",
  tipo: "Vuelo ida y vuelta",
  ruta: "Buenos Aires (EZE) → París (CDG)",
  fecha: "17/08 al 27/08",
  duracion: "13h 40m",
  equipaje: "1 valija + 1 carry on",
  co2: "Baja",
  precio: 890,
  proveedor: "Air France",
  link: "#",
};

const alojamientos = [
  {
    id: "H1",
    nombre: "Estudio clásico con vista a la Torre",
    zona: "7ème, París",
    calificacion: 4.7,
    foto:
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1200&auto=format&fit=crop",
    precioNoche: 145,
    noches: 10,
    link: "#",
    etiqueta: "Mejor relación precio/ubicación",
  },
  {
    id: "H2",
    nombre: "Depto moderno en el Marais",
    zona: "Le Marais",
    calificacion: 4.6,
    foto:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d13?q=80&w=1200&auto=format&fit=crop",
    precioNoche: 168,
    noches: 10,
    link: "#",
    etiqueta: "Muy bien puntuado",
  },
  {
    id: "H3",
    nombre: "Hotel boutique cerca del Louvre",
    zona: "1er Arr.",
    calificacion: 4.8,
    foto:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    precioNoche: 210,
    noches: 10,
    link: "#",
    etiqueta: "Ubicación premium",
  },
];

const actividades = [
  {
    id: "A1",
    nombre: "Tour nocturno Montmartre",
    duracion: "2 h",
    rating: 4.8,
    precio: 35,
    foto:
      "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "A2",
    nombre: "Crucero por el Sena",
    duracion: "1 h",
    rating: 4.6,
    precio: 22,
    foto:
      "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "A3",
    nombre: "Visita guiada Museo d'Orsay",
    duracion: "3 h",
    rating: 4.7,
    precio: 42,
    foto:
      "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1200&auto=format&fit=crop",
  },
];
// ============================================================

export default function PlanificarViaje5() {
  const navigate = useNavigate();

  // Estado de selección
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedActs, setSelectedActs] = useState([]);
  const [saving, setSaving] = useState(false);

  const addTransport = () => setSelectedTransport(transportSugerido);
  const removeTransport = () => setSelectedTransport(null);
  const addStay = (h) => setSelectedStay(h);
  const removeStay = () => setSelectedStay(null);
  const toggleAct = (id) =>
    setSelectedActs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Presupuesto dinámico
  const subtotales = useMemo(() => {
    const t = selectedTransport?.precio ?? 0;
    const h = selectedStay ? selectedStay.precioNoche * selectedStay.noches : 0;
    const a = actividades
      .filter((x) => selectedActs.includes(x.id))
      .reduce((acc, x) => acc + x.precio, 0);
    const total = t + h + a;
    const restante = Math.max(tripSummary.presupuesto - total, 0);
    const estado = total <= tripSummary.presupuesto ? "ok" : "over";
    return { t, h, a, total, restante, estado };
  }, [selectedTransport, selectedStay, selectedActs]);

  // Guardar y redirigir al index con mensaje
  const handleSaveAndGoHome = async () => {
    setSaving(true);
    try {
      // Pegá tu endpoint real aquí:
      await fetch("http://localhost:3001/api/viajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destino: tripSummary.destino,
          fecha_inicio: tripSummary.fechas.desde,
          fecha_fin: tripSummary.fechas.hasta,
          presupuesto: tripSummary.presupuesto,
          transporte: selectedTransport,
          hospedaje: selectedStay,
          actividades: actividades.filter(a => selectedActs.includes(a.id)),
        }),
      });
    } catch (err) {
      console.error("❌ Error al guardar viaje:", err);
      // opcional: podrías mostrar un toast de error
    } finally {
      setSaving(false);
    }

    // Ir al index mostrando confirmación
    navigate("/", { state: { viajeGuardado: true } });
  };

  return (
    <div className="pv5-wrap">
      {/* Breadcrumb */}
      <div className="pv5-breadcrumb">
        <span className="crumb">Planificador de Viajes</span>
        <span className="sep">›</span>
        <span className="crumb active">Paso 5: Sugerencias Inteligentes</span>
      </div>

      {/* Header */}
      <header className="pv5-header">
        <h1>Paso 5 de 5 – Sugerencias Inteligentes</h1>
        <p>Ajustá y confirmá las opciones generadas para tu viaje.</p>
      </header>

      {/* Resumen */}
      <section className="pv5-box pv5-summary">
        <div className="pv5-summary-item">
          <span className="tag">Destino</span>
          <div className="val">{tripSummary.destino}</div>
        </div>
        <div className="pv5-summary-item">
          <span className="tag">Fechas</span>
          <div className="val">
            {fmtDate(tripSummary.fechas.desde)} — {fmtDate(tripSummary.fechas.hasta)}
          </div>
        </div>
        <div className="pv5-summary-item">
          <span className="tag">Perfil</span>
          <div className="val">{tripSummary.perfil}</div>
        </div>
        <div className="pv5-summary-item">
          <span className="tag">Presupuesto</span>
          <div className="val">{money(tripSummary.presupuesto, tripSummary.moneda)}</div>
        </div>

        <div className="pv5-summary-actions">
          <button className="btn btn--ghost" onClick={() => navigate("/planificar/3")}>
            Editar preferencias
          </button>
        </div>
      </section>

      {/* Transporte */}
      <section className="pv5-box">
        <div className="pv5-box-head">
          <h3>Transporte sugerido</h3>
          <div className="head-actions">
            <button className="btn btn--ghost">Ver más opciones</button>
          </div>
        </div>

        <div className="pv5-transport">
          <div className="pv5-transport-left">
            <div className="badge badge--blue">{transportSugerido.tipo}</div>
            <div className="t-title">{transportSugerido.ruta}</div>
            <ul className="t-meta">
              <li>{transportSugerido.fecha}</li>
              <li>{transportSugerido.duracion}</li>
              <li>{transportSugerido.equipaje}</li>
              <li>CO₂: {transportSugerido.co2}</li>
            </ul>
            <div className="t-provider">
              {transportSugerido.proveedor} · {money(transportSugerido.precio)}
            </div>
          </div>

          <div className="pv5-transport-right">
            {!selectedTransport ? (
              <>
                <button className="btn btn--primary" onClick={addTransport}>
                  Agregar al viaje
                </button>
                <button className="btn btn--secondary">Reservar ahora</button>
              </>
            ) : (
              <>
                <div className="pill added">Agregado</div>
                <button className="btn btn--danger" onClick={removeTransport}>
                  Quitar
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Alojamiento */}
      <section className="pv5-box">
        <div className="pv5-box-head">
          <h3>Alojamiento recomendado</h3>
          <div className="head-actions">
            <button className="btn btn--ghost">Ver más en el mapa</button>
          </div>
        </div>

        <div className="pv5-cards">
          {alojamientos.map((h) => {
            const selected = selectedStay?.id === h.id;
            return (
              <article key={h.id} className={"card " + (selected ? "card--active" : "")}>
                <div className="card-img">
                  <img src={h.foto} alt={h.nombre} />
                  <span className="card-chip">{h.etiqueta}</span>
                </div>
                <div className="card-body">
                  <div className="card-title">{h.nombre}</div>
                  <div className="card-sub">{h.zona} · ⭐ {h.calificacion}</div>
                  <div className="card-price">
                    {money(h.precioNoche)} <span>/ noche · {h.noches} noches</span>
                  </div>
                  <div className="card-actions">
                    {!selected ? (
                      <>
                        <button className="btn btn--primary" onClick={() => addStay(h)}>
                          Agregar al viaje
                        </button>
                        <a className="btn btn--secondary" href={h.link}>Ver detalles</a>
                      </>
                    ) : (
                      <>
                        <div className="pill added">Seleccionado</div>
                        <button className="btn btn--danger" onClick={removeStay}>
                          Quitar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Actividades */}
      <section className="pv5-box">
        <div className="pv5-box-head">
          <h3>Actividades sugeridas</h3>
          <div className="head-actions">
            <button className="btn btn--ghost">Buscar más</button>
          </div>
        </div>

        <div className="pv5-cards">
          {actividades.map((a) => {
            const checked = selectedActs.includes(a.id);
            return (
              <article key={a.id} className={"card small " + (checked ? "card--active" : "")}>
                <div className="card-img">
                  <img src={a.foto} alt={a.nombre} />
                </div>
                <div className="card-body">
                  <div className="card-title">{a.nombre}</div>
                  <div className="card-sub">⏱ {a.duracion} · ⭐ {a.rating}</div>
                  <div className="card-price">{money(a.precio)}</div>
                  <div className="card-actions">
                    {!checked ? (
                      <button className="btn btn--primary" onClick={() => toggleAct(a.id)}>
                        Agregar al viaje
                      </button>
                    ) : (
                      <>
                        <div className="pill added">Agregada</div>
                        <button className="btn btn--danger" onClick={() => toggleAct(a.id)}>
                          Quitar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Presupuesto */}
      <section className="pv5-box pv5-budget">
        <div className="pv5-box-head"><h3>Resumen de presupuesto</h3></div>

        <div className="budget-grid">
          <table className="budget-table">
            <tbody>
              <tr><td>Transporte</td><td className="num">{money(subtotales.t)}</td></tr>
              <tr><td>Alojamiento</td><td className="num">{money(subtotales.h)}</td></tr>
              <tr><td>Actividades</td><td className="num">{money(subtotales.a)}</td></tr>
              <tr className="sep"><td>Total estimado</td><td className="num strong">{money(subtotales.total)}</td></tr>
            </tbody>
          </table>

          <div className="budget-status">
            {subtotales.estado === "ok" ? (
              <>
                <div className="status-box ok">✅ Dentro del presupuesto</div>
                <div className="restante">Restante: <b>{money(subtotales.restante)}</b> de {money(tripSummary.presupuesto)}</div>
              </>
            ) : (
              <div className="status-box bad">
                ⚠️ Excede por <b>{money(subtotales.total - tripSummary.presupuesto)}</b>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pv5-footer">
        <button className="btn btn--ghost" onClick={() => navigate("/planificar/4")}>
          ◀ Anterior
        </button>
        <div className="pv5-footer-right">
          <button className="btn btn--secondary" onClick={() => navigate("/planificar/3")}>
            Editar preferencias
          </button>
          <button
            className="btn btn--primary"
            onClick={handleSaveAndGoHome}
            disabled={saving || (!selectedTransport && !selectedStay && selectedActs.length === 0)}
            title={
              !selectedTransport && !selectedStay && selectedActs.length === 0
                ? "Agregá al menos un ítem para continuar"
                : ""
            }
          >
            {saving ? "Guardando..." : "Guardar y continuar ▶"}
          </button>
        </div>
      </footer>
    </div>
  );
}

// ===== utils =====
function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return iso; }
}
function money(v, cur = "USD") {
  if (!v) return `0 ${cur}`;
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(v);
  } catch { return `${Math.round(v).toLocaleString("es-AR")} ${cur}`; }
}
