import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlanificarViaje3.css";

// (Opcional) si tenés un contexto de planificación, podés importarlo y persistir
// import { usePlanTrip } from "../context/PlanTripContext";

const TRAVELER_TYPES = [
  {
    key: "aventurero",
    title: "Aventurero",
    desc: "Busca experiencias emocionantes y adrenalina",
  },
  {
    key: "relajado",
    title: "Relajado",
    desc: "Prefiere descansar y disfrutar con calma",
  },
  {
    key: "cultural",
    title: "Cultural",
    desc: "Interesado en historia, arte y tradiciones locales",
  },
  {
    key: "familiar",
    title: "Familiar",
    desc: "Viaja con familia y busca actividades para todos",
  },
];

export default function PlanificarViaje3() {
  const navigate = useNavigate();
  // const { saveStep } = usePlanTrip();

  const [type, setType] = useState(null); // aventurero | relajado | cultural | familiar
  const [age, setAge] = useState("");
  const [groupMode, setGroupMode] = useState(null); // "solo" | "grupo"

  const canContinue = useMemo(
    () => Boolean(type && age && groupMode),
    [type, age, groupMode]
  );

  const handleNext = () => {
    // Persistí si tenés contexto/ backend
    // saveStep(3, { type, age: Number(age), groupMode });
    navigate("/planificar/4");
  };

  return (
    <div className="pv3-wrap">
      {/* Breadcrumb */}
      <div className="pv3-breadcrumb">
        <span className="crumb">Planificador de Viajes</span>
        <span className="sep">›</span>
        <span className="crumb active">3: Selecciona tu perfil de viajero</span>
      </div>

      {/* Título */}
      <h1 className="pv3-title">Selecciona tu perfil de viajero</h1>

      <div className="pv3-grid">
        {/* Columna izquierda: formulario */}
        <section className="pv3-form">
          <h3 className="pv3-section-title">Perfil del viajero</h3>
          <p className="pv3-subtle">
            Cuéntanos un poco sobre tus preferencias de viaje
          </p>

          {/* Chips tipo de viajero */}
          <div className="pv3-chip-grid">
            {TRAVELER_TYPES.map((t) => (
              <button
                key={t.key}
                className={
                  "pv3-chip " + (type === t.key ? "pv3-chip--active" : "")
                }
                onClick={() => setType(t.key)}
              >
                <div className="pv3-chip-head">{t.title}</div>
                <div className="pv3-chip-desc">{t.desc}</div>
              </button>
            ))}
          </div>

          {/* Edad */}
          <label className="pv3-field">
            <span className="pv3-label">Edad</span>
            <input
              className="pv3-input"
              type="number"
              min="1"
              placeholder="Tu edad"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </label>

          {/* Solo o en grupo */}
          <div className="pv3-group">
            <span className="pv3-label">¿Viajas solo o en grupo?</span>
            <div className="pv3-two">
              <button
                className={
                  "pv3-tile " + (groupMode === "solo" ? "pv3-tile--active" : "")
                }
                onClick={() => setGroupMode("solo")}
              >
                <div className="pv3-ico">👤</div>
                <div>
                  <div className="pv3-tile-title">Solo</div>
                  <div className="pv3-tile-desc">Viaje individual</div>
                </div>
              </button>

              <button
                className={
                  "pv3-tile " + (groupMode === "grupo" ? "pv3-tile--active" : "")
                }
                onClick={() => setGroupMode("grupo")}
              >
                <div className="pv3-ico">👥</div>
                <div>
                  <div className="pv3-tile-title">En grupo</div>
                  <div className="pv3-tile-desc">Con amigos o familia</div>
                </div>
              </button>
            </div>
          </div>

          {/* Resumen */}
          <div className="pv3-summary">
            <div className="pv3-summary-title">Tus selecciones:</div>
            <ul className="pv3-summary-list">
              <li>
                Tipo:{" "}
                <strong>
                  {type
                    ? TRAVELER_TYPES.find((t) => t.key === type)?.title
                    : "—"}
                </strong>
              </li>
              <li>
                Edad: <strong>{age || "—"}</strong>
              </li>
              <li>
                Modalidad:{" "}
                <strong>
                  {groupMode === "solo"
                    ? "Solo"
                    : groupMode === "grupo"
                    ? "En grupo"
                    : "—"}
                </strong>
              </li>
            </ul>
          </div>

          {/* Navegación */}
          <div className="pv3-actions">
            <button
              className="btn btn--ghost"
              onClick={() => navigate("/planificar/2")}
            >
              ◀ Anterior
            </button>
            <button
              className="btn btn--primary"
              onClick={handleNext}
              disabled={!canContinue}
              title={!canContinue ? "Completá los campos para continuar" : ""}
            >
              Siguiente ▶
            </button>
          </div>
        </section>

        {/* Columna derecha: panel ilustrado */}
        <aside className="pv3-aside">
          <div className="pv3-aside-card">
            <div className="pv3-aside-img">
              <img
                src="https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?q=80&w=1200&auto=format&fit=crop"
                alt="Globos aerostáticos"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";
                }}
              />
              <span className="pv3-aside-badge pv3-aside-badge--left">🧳</span>
              <span className="pv3-aside-badge pv3-aside-badge--right">✈️</span>
            </div>
            <div className="pv3-aside-text">
              <h4>Personaliza tu aventura</h4>
              <p>
                Cuéntanos sobre ti para diseñar la mejor experiencia
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
