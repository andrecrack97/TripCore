import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MisViajes.css";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const TABS = [
  { key: "all", label: "Todos" },
  { key: "upcoming", label: "Próximos" },
  { key: "ongoing", label: "En curso" },
  { key: "completed", label: "Completados" },
];

// Utilidades de fechas
const fmtRange = (ini, fin) => {
  const opt = { day: "numeric", month: "long", year: "numeric" };
  const s = new Date(ini).toLocaleDateString("es-AR", opt);
  const e = new Date(fin).toLocaleDateString("es-AR", opt);
  return `${s} - ${e}`;
};

const getStatus = (ini, fin) => {
  const today = new Date();
  const start = new Date(ini);
  const end = new Date(fin);
  if (today < start) return "upcoming";
  if (today > end) return "completed";
  return "ongoing";
};

const StatusBadge = ({ status }) => {
  const map = {
    upcoming: { text: "Próximo", cls: "badge--upcoming" },
    ongoing: { text: "En curso", cls: "badge--ongoing" },
    completed: { text: "Completado", cls: "badge--completed" },
  };
  const { text, cls } = map[status] || { text: "Estado", cls: "" };
  return <span className={`badge ${cls}`}>{text}</span>;
};

export default function MisViajes() {
  const navigate = useNavigate();
  const token = (() => { try { return localStorage.getItem("token"); } catch { return null; } })();
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")||"null"); } catch { return null; } })();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trips, setTrips] = useState([]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/viajes`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "omit",
        });
        if (!res.ok) {
          const data = await safeJson(res);
          throw new Error(data?.message || `Error ${res.status}`);
        }
        const data = await res.json();
        if (mounted) setTrips(Array.isArray(data?.items) ? data.items : (Array.isArray(data)? data : []));
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [token]);

  async function openDetails(trip) {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setDetails(null);
    try {
      const id = trip.id_viaje || trip.id;
      const res = await fetch(`${API_BASE}/api/viajes/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || `Error ${res.status}`);
      }
      const data = await res.json();
      console.log("Detalles del viaje cargados:", data);
      setDetails(data);
    } catch (e) {
      console.error("Error cargando detalles:", e);
      setDetailsError(e.message);
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeDetails() {
    setDetailsOpen(false);
    setDetails(null);
    setDetailsError(null);
  }

  const result = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = trips.filter((t) => {
      const status = getStatus(t.fecha_inicio, t.fecha_fin);
      const byTab =
        active === "all" ? true : status === active;
      const bySearch =
        !needle ||
        [t.destino, t.ciudad, t.pais, t.titulo]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(needle));
      return byTab && bySearch;
    });

    // orden primero en curso, luego próximos, luego completados
    const rank = { ongoing: 0, upcoming: 1, completed: 2 };
    return filtered.sort((a, b) => {
      const sa = rank[getStatus(a.fecha_inicio, a.fecha_fin)] ?? 1;
      const sb = rank[getStatus(b.fecha_inicio, b.fecha_fin)] ?? 1;
      if (sa !== sb) return sa - sb;
      return new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
    });
  }, [trips, q, active]);

  if (loading) {
    return (
      <div className="mv-wrap">
        <Header onSearch={setQ} value={q} onNewTrip={handleNewTrip} active={active} setActive={setActive} />
        <div className="skeleton-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="skeleton-card" key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mv-wrap">
        <Header onSearch={setQ} value={q} onNewTrip={handleNewTrip} active={active} setActive={setActive} />
        <div className="error-box">
          <p>⚠️ No pudimos cargar tus viajes.</p>
          <code>{error}</code>
          <button className="btn btn--primary" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mv-wrap">
      <Header
        onSearch={setQ}
        value={q}
        onNewTrip={handleNewTrip}
        active={active}
        setActive={setActive}
        subtitle={`Aquí puedes ver y gestionar los viajes que ${user ? user.nombre : "has"} planificado con TripCore.`}
      />

      {result.length === 0 ? (
        <EmptyState onNewTrip={handleNewTrip} />
      ) : (
        <div className="cards-grid">
          {result.map((t) => (
            <TripCard key={t.id_viaje || t.id} trip={t} onDetails={() => openDetails(t)} />
          ))}
        </div>
      )}

      {detailsOpen && (
        <DetailsModal
          onClose={closeDetails}
          loading={detailsLoading}
          error={detailsError}
          trip={details}
        />)
      }
    </div>
  );
}

function Header({ onSearch, value, onNewTrip, active, setActive, subtitle }) {
  return (
    <div className="mv-header">
      <div className="mv-title">
        <h1>Mis Viajes</h1>
        <p>{subtitle || "Aquí puedes ver y gestionar tus viajes."}</p>
      </div>
      <div className="mv-actions">
        <div className="search">
          <span className="search-icon">🔍</span>
          <input
            value={value}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar destino..."
            aria-label="Buscar destino"
          />
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab ${active === t.key ? "tab--active" : ""}`}
              onClick={() => setActive(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button className="btn btn--primary" onClick={onNewTrip}>
          <span className="plus">＋</span> Nuevo viaje
        </button>
      </div>
    </div>
  );
}

function TripCard({ trip, onDetails }) {
  const {
    titulo,
    destino,
    ciudad,
    pais,
    fecha_inicio,
    fecha_fin,
    portada_url,
  } = normalizeTrip(trip);

  const status = getStatus(fecha_inicio, fecha_fin);
  const title = titulo || [ciudad, pais].filter(Boolean).join(", ") || destino || "Viaje";
  const id = trip.id_viaje || trip.id;

  return (
    <article className="trip-card">
      <div className="trip-cover">
        <img
          src={portada_url}
          alt={title}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
        />
      </div>

      <div className="trip-body">
        <div className="trip-head">
          <h3>{title}</h3>
          <button className="icon-btn" title="Más opciones">⋮</button>
        </div>

        <div className="trip-dates">{fmtRange(fecha_inicio, fecha_fin)}</div>

        <div className="trip-footer">
          <StatusBadge status={status} />
          <div className="trip-actions">
            <button
              className="btn btn--secondary"
              onClick={onDetails}
            >
              Ver Detalles
            </button>
            <div className="dropdown">
              <button className="btn btn--ghost">Adicionales ▾</button>
              <div className="dropdown-menu">
                <button>Itinerario</button>
                <button>Gastos</button>
                <button>Compartir</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ onNewTrip }) {
  return (
    <div className="empty">
      <h3>No hay viajes para mostrar</h3>
      <p>Creá un nuevo viaje o cambia los filtros de búsqueda.</p>
      <button className="btn btn--primary" onClick={onNewTrip}>
        Crear mi primer viaje
      </button>
    </div>
  );
}

// Helpers
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";

const safeJson = async (res) => {
  try { return await res.json(); } catch { return null; }
};

function normalizeTrip(t) {
  // Ajustá las claves a tu modelo de DB/API
  const ciudad = t.ciudad || t.destino || t.destino_principal || null;
  const destino = t.destino || ciudad;
  return {
    id: t.id_viaje ?? t.id,
    titulo: t.titulo ?? t.nombre_viaje ?? t.nombre ?? null,
    destino,
    ciudad,
    pais: t.pais ?? null,
    fecha_inicio: t.fecha_inicio ?? t.inicio ?? t.startDate,
    fecha_fin: t.fecha_fin ?? t.fin ?? t.endDate,
    portada_url:
      t.portada_url ??
      t.imagen ??
      t.coverUrl ??
      FALLBACK_IMAGE,
  };
}

function handleNewTrip() {
  // Redirección simple (ajustá a tu router)
  window.location.href = "/planificar-viaje";
}

// Modal de detalles
function DetailsModal({ onClose, loading, error, trip }) {
  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000}}>
      <div style={{background:"#fff", borderRadius:12, width:"min(920px, 95vw)", maxHeight:"90vh", overflow:"auto", padding:16}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
          <h2 style={{margin:0}}>Detalles del viaje</h2>
          <button className="btn btn--ghost" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="skeleton-grid"><div className="skeleton-card" /></div>}
        {error && (
          <div className="error-box"><p>No se pudo cargar el detalle</p><code>{error}</code></div>
        )}
        {!loading && !error && trip && (
          <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:16}}>
            <section className="td-card">
              <div className="td-card__title">Resumen</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                <div>
                  <div><strong>Título</strong></div>
                  <div>{trip.titulo || trip.destino || trip.ciudad || "Viaje"}</div>
                </div>
                <div>
                  <div><strong>Fechas</strong></div>
                  <div>{fmtRange(trip.fecha_inicio, trip.fecha_fin)}</div>
                </div>
                <div>
                  <div><strong>Origen</strong></div>
                  <div>{[trip.origen_ciudad, trip.origen_pais].filter(Boolean).join(", ") || "-"}</div>
                </div>
                <div>
                  <div><strong>Destino</strong></div>
                  <div>{trip.destino || trip.ciudad || "-"}</div>
                </div>
                <div>
                  <div><strong>Presupuesto</strong></div>
                  <div>{trip.presupuesto != null ? `USD ${trip.presupuesto}` : "-"}</div>
                </div>
              </div>
            </section>

            <section className="td-card">
              <div className="td-card__title">Transporte</div>
              {Array.isArray(trip.transportes) && trip.transportes.length ? (
                <ul className="td-list">
                  {trip.transportes.map((t) => (
                    <li key={t.id} className="td-item">
                      <div>
                        <strong>{t.tipo || t.provider || "Transporte"}</strong>
                        <div className="td-item__sub">{t.origen || "-"} → {t.destino || "-"}</div>
                        {t.price_usd && <div className="td-item__sub">Precio: USD {t.price_usd}</div>}
                      </div>
                      {(t.fecha_salida || t.fecha_llegada) && (
                        <div className="td-item__sub">
                          {t.fecha_salida || "-"} → {t.fecha_llegada || "-"}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : <div className="td-empty">Sin transporte seleccionado</div>}
            </section>

            <section className="td-card" style={{gridColumn:"1 / -1"}}>
              <div className="td-card__title">Alojamiento</div>
              {Array.isArray(trip.alojamientos) && trip.alojamientos.length ? (
                <ul className="td-list">
                  {trip.alojamientos.map((h) => (
                    <li key={h.id} className="td-item">
                      <div>
                        <strong>{h.nombre || "Hotel"}</strong>
                        {h.stars && <span className="td-item__sub"> {h.stars}★</span>}
                        {h.rating && <span className="td-item__sub"> Rating: {h.rating}</span>}
                        {h.address && <div className="td-item__sub">{h.address}</div>}
                        {h.price_night_usd && <div className="td-item__sub">USD {h.price_night_usd}/noche</div>}
                      </div>
                      {(h.fecha_checkin || h.fecha_checkout) && (
                        <div className="td-item__sub">
                          {h.fecha_checkin || "-"} → {h.fecha_checkout || "-"}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : <div className="td-empty">Sin alojamiento seleccionado</div>}
            </section>

            <section className="td-card" style={{gridColumn:"1 / -1"}}>
              <div className="td-card__title">Actividades</div>
              {Array.isArray(trip.actividades) && trip.actividades.length ? (
                <ul className="td-list">
                  {trip.actividades.map((a) => (
                    <li key={a.id} className="td-item">
                      <div>
                        <strong>{a.nombre || a.title || "Actividad"}</strong>
                        {a.category && <div className="td-item__sub">Categoría: {a.category}</div>}
                        {a.duration_hours && <div className="td-item__sub">Duración: {a.duration_hours} horas</div>}
                        {a.price_usd && <div className="td-item__sub">Precio: USD {a.price_usd}</div>}
                        {a.rating && <div className="td-item__sub">Rating: {a.rating}</div>}
                        {a.meeting_point && <div className="td-item__sub">Punto de encuentro: {a.meeting_point}</div>}
                        {(a.fecha || a.hora) && (
                          <div className="td-item__sub">
                            {a.fecha || ""}{a.hora ? ` • ${a.hora}` : ""}
                          </div>
                        )}
                      </div>
                      {a.notas && <div className="td-item__notes">{a.notas}</div>}
                    </li>
                  ))}
                </ul>
              ) : <div className="td-empty">Sin actividades seleccionadas</div>}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}