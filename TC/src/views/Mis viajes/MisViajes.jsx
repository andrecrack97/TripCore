import React, { useMemo, useState } from "react";
import "./MisViajes.css";

/**
 * Estructura esperada de cada viaje:
 * {
 *   id: string|number,
 *   titulo: string,               // p.ej. "París, Francia"
 *   desde: string,                // ISO o "YYYY-MM-DD"
 *   hasta: string,                // ISO o "YYYY-MM-DD"
 *   imagen: string,               // URL
 *   onVerDetalles?: (id) => void, // opcional
 * }
 *
 * Uso:
 * <MisViajes viajes={listaDeViajes} onNuevoViaje={() => ...} onVerDetalles={(id)=>...} />
 */

const TABS = ["Todos", "Próximos", "En curso", "Completados"];

function estadoDeViaje(desdeStr, hastaStr, now = new Date()) {
  const desde = new Date(desdeStr);
  const hasta = new Date(hastaStr);

  // Normalizamos horas para evitar off-by-one por zonas
  const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const h = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());

  if (h < hoy) return "Completado";
  if (d > hoy) return "Próximo";
  return "En curso";
}

function formatFechaRango(desdeStr, hastaStr) {
  const f = (s) =>
    new Date(s).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  return `${f(desdeStr)}  -  ${f(hastaStr)}`;
}

export default function MisViajes({
  viajes = [],
  onNuevoViaje,
  onVerDetalles,
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Todos");

  const enriquecidos = useMemo(
    () =>
      viajes.map((v) => ({
        ...v,
        estado: estadoDeViaje(v.desde, v.hasta),
      })),
    [viajes]
  );

  const filtrados = useMemo(() => {
    let list = enriquecidos;

    // filtro de pestaña
    if (tab !== "Todos") {
      list = list.filter((v) => v.estado === tab);
    }

    // búsqueda por texto
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((v) => v.titulo?.toLowerCase().includes(q));
    }

    // orden sugerido: Próximos (fecha más cercana), En curso, Completados
    const peso = { Próximo: 0, "En curso": 1, Completado: 2 };
    return [...list].sort((a, b) => {
      const pa = peso[a.estado] ?? 9;
      const pb = peso[b.estado] ?? 9;
      if (pa !== pb) return pa - pb;
      return new Date(a.desde) - new Date(b.desde);
    });
  }, [enriquecidos, query, tab]);

  return (
    <div className="mv-page">
      <header className="mv-topbar">
        <div className="mv-brand">
          <span className="mv-logo">✈︎</span>
          <span className="mv-title">TripCore</span>
        </div>
        <button className="mv-btn mv-btn-primary-outline">Iniciar Sesión</button>
      </header>

      <main className="mv-container">
        <section className="mv-header-card">
          <h2 className="mv-h2">Mis Viajes</h2>
          <p className="mv-sub">Aquí puedes ver y gestionar los viajes que has planificado con TripCore.</p>

          <div className="mv-controls">
            <div className="mv-search">
              <span className="mv-search-icon">🔎</span>
              <input
                type="text"
                placeholder="Buscar destino..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="mv-tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={`mv-chip ${tab === t ? "is-active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mv-actions">
              <button
                className="mv-btn mv-btn-primary"
                onClick={onNuevoViaje}
                title="Crear nuevo viaje"
              >
                <span className="mv-plus">＋</span> Nuevo viaje
              </button>
            </div>
          </div>
        </section>

        <section className="mv-grid">
          {filtrados.map((v) => (
            <article className="mv-card" key={v.id}>
              <div className="mv-card-img">
                <img src={v.imagen} alt={v.titulo} />
              </div>

              <div className="mv-card-body">
                <div className="mv-card-head">
                  <h3 className="mv-card-title">{v.titulo}</h3>
                  <button className="mv-icon-btn" title="Más opciones">⋯</button>
                </div>

                <div className="mv-card-dates">{formatFechaRango(v.desde, v.hasta)}</div>

                <div className="mv-card-status">
                  <EstadoBadge estado={v.estado} />
                </div>

                <div className="mv-card-actions">
                  <button
                    className="mv-btn mv-btn-primary"
                    onClick={() => (onVerDetalles ? onVerDetalles(v.id) : null)}
                  >
                    Ver Detalles
                  </button>

                  <div className="mv-dropdown">
                    <button className="mv-btn mv-btn-light">
                      Adicionales <span className="mv-caret">▾</span>
                    </button>
                    <ul className="mv-menu">
                      <li>Itinerario</li>
                      <li>Pasajes</li>
                      <li>Hospedaje</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {filtrados.length === 0 && (
            <div className="mv-empty">
              <p>No se encontraron viajes con esos filtros.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function EstadoBadge({ estado }) {
  const map = {
    Próximo: { className: "mv-badge upcoming", text: "Próximo" },
    "En curso": { className: "mv-badge ongoing", text: "En curso" },
    Completado: { className: "mv-badge done", text: "Completado" },
  };
  const cfg = map[estado] ?? { className: "mv-badge", text: estado };
  return <span className={cfg.className}>{cfg.text}</span>;
}
