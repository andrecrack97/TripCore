// src/pages/PlanificarViaje3.jsx
import React, { useEffect, useState } from "react";
import "./PlanificarViaje.css";
import { useNavigate } from "react-router-dom";

const TIPOS = [
  { id: "aventurero", titulo: "Aventurero", desc: "Buscás emociones y adrenalina" },
  { id: "relajado", titulo: "Relajado", desc: "Preferís descansar y disfrutar con calma" },
  { id: "cultural", titulo: "Cultural", desc: "Te interesa historia, arte y tradiciones" },
  { id: "familiar", titulo: "Familiar", desc: "Viajás en familia y buscás actividades para todos" },
];

function Tile({ active, onClick, title, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pv3-tile ${active ? "active" : ""}`}
    >
      <div className="pv3-tile-title">{title}</div>
      <div className="pv3-tile-desc">{desc}</div>
    </button>
  );
}

export default function PlanificarViaje3() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("");
  const [edad, setEdad] = useState("");
  const [modo, setModo] = useState(""); // "solo" | "grupo"
  const [error, setError] = useState("");

  // Cargar datos previos si existen
  useEffect(() => {
    const guardado = JSON.parse(localStorage.getItem("planificarViaje")) || {};
    if (guardado.tipo_viajero) setTipo(guardado.tipo_viajero);
    if (guardado.edad_viajero) setEdad(String(guardado.edad_viajero));
    if (guardado.modo_viaje) setModo(guardado.modo_viaje);
  }, []);

  const guardar = () => {
    const previo = JSON.parse(localStorage.getItem("planificarViaje")) || {};
    localStorage.setItem(
      "planificarViaje",
      JSON.stringify({
        ...previo,
        tipo_viajero: tipo,
        edad_viajero: edad ? Number(edad) : null,
        modo_viaje: modo,
      })
    );
  };

  const handleSiguiente = (e) => {
    e.preventDefault();
    if (!tipo || !modo) {
      setError("Elegí al menos un tipo de viajero y si viajás solo o en grupo.");
      return;
    }
    setError("");
    guardar();
    navigate("/planificar/4");
  };

  return (
    <div className="planificador-container">
      <div className="planificador-box" style={{ padding: 24 }}>
        <p className="breadcrumb">
          Planificador de Viajes &nbsp; ❯ &nbsp; <span>3: Selecciona tu perfil de viajero</span>
        </p>

        <h2>Paso 3</h2>
        <h1>Selecciona tu perfil de viajero</h1>

        <div className="pv3-layout">
          {/* Columna izquierda */}
          <form className="pv3-left" onSubmit={handleSiguiente}>
            <h3 className="pv3-subtitle">Perfil del viajero</h3>
            <p className="pv3-helper">Cuéntanos un poco sobre tus preferencias de viaje</p>

            <label className="pv3-label">Tipo de viajero</label>
            <div className="pv3-tiles">
              {TIPOS.map(t => (
                <Tile
                  key={t.id}
                  active={tipo === t.id}
                  onClick={() => setTipo(t.id)}
                  title={t.titulo}
                  desc={t.desc}
                />
              ))}
            </div>

            <label className="pv3-label" style={{ marginTop: 16 }}>Edad</label>
            <input
              className="pv3-input"
              type="number"
              min="1"
              max="120"
              placeholder="Tu edad"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
            />

            <label className="pv3-label" style={{ marginTop: 16 }}>¿Viajás solo o en grupo?</label>
            <div className="pv3-modo">
              <button
                type="button"
                className={`pv3-chip ${modo === "solo" ? "active" : ""}`}
                onClick={() => setModo("solo")}
                title="Viaje individual"
              >
                <span className="pv3-chip-emoji" aria-hidden>👤</span> Solo
              </button>
              <button
                type="button"
                className={`pv3-chip ${modo === "grupo" ? "active" : ""}`}
                onClick={() => setModo("grupo")}
                title="Con amigos o familia"
              >
                <span className="pv3-chip-emoji" aria-hidden>👥</span> En grupo
              </button>
            </div>

            <label className="pv3-label" style={{ marginTop: 16 }}>Tus selecciones:</label>
            <div className="pv3-summary">
              <span>
                {tipo ? `Tipo: ${TIPOS.find(t => t.id === tipo)?.titulo}` : "Sin tipo seleccionado"}
                {edad ? ` • Edad: ${edad}` : ""}
                {modo ? ` • Modo: ${modo === "solo" ? "Solo" : "En grupo"}` : ""}
              </span>
            </div>

            {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}

            <div className="acciones" style={{ marginTop: 16 }}>
              <button type="button" className="btn-anterior" onClick={() => navigate(-1)}>
                ◀ Anterior
              </button>
              <button type="submit" className="btn-siguiente">Siguiente ➤</button>
            </div>
          </form>

          {/* Columna derecha */}
          <aside className="pv3-right">
            <div className="pv3-card">
              {/* Reemplazá la ruta si usás otra imagen */}
              <img
                className="pv3-card-img"
                src="/assets/balloons.jpg"
                alt="Globo aerostático"
                onError={(e) => {
                  // fallback a un degradado si no existe la imagen
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="pv3-card-fallback" />
            </div>
            <div className="pv3-card-caption">
              <strong>Personaliza tu aventura</strong>
              <div className="pv3-caption-sub">Cuéntanos sobre ti para diseñar la mejor experiencia</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
            }
      
      
