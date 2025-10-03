import React, { useEffect, useMemo, useState } from "react";
import "./MisViajes.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3005";

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
  // Fallback sencillo para token/user sin contexto
  const token = (() => { try { return localStorage.getItem("token"); } catch { return null; } })();
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")||"null"); } catch { return null; } })();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trips, setTrips] = useState([]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState("all");

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

    // orden: primero en curso, luego próximos, luego completados, cada grupo por fecha inicio asc
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
            <TripCard key={t.id_viaje || t.id} trip={t} />
          ))}
        </div>
      )}
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

function TripCard({ trip }) {
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
            <button className="btn btn--secondary">Ver Detalles</button>
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