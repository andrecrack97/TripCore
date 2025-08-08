import React, { useState } from "react";
import "./PlanificarViaje3.css";
import { useNavigate } from "react-router-dom";

export default function PlanificarViaje3() {
  const navigate = useNavigate();

  const [tipoViajero, setTipoViajero] = useState("");
  const [compania, setCompania] = useState("");
  const [error, setError] = useState("");

  const handleSiguiente = (e) => {
    e.preventDefault();
    if (!tipoViajero || !compania) {
      setError("Por favor completá todos los campos");
      return;
    }
    setError("");
    const previo = JSON.parse(localStorage.getItem("planificarViaje")) || {};
    const data = {
      ...previo,
      tipo_viajero: tipoViajero,
      compania,
    };
    localStorage.setItem("planificarViaje", JSON.stringify(data));
    navigate("/planificar/4");
  };

  return (
    <div className="planificar3-container">
      <div className="planificador-box">
        <p className="breadcrumb">
          Planificador de Viajes &nbsp; ❯ &nbsp; <span>3: Perfil de viajero</span>
        </p>

        <h2>Paso 3</h2>
        <h1>Contanos más sobre vos</h1>

        <form onSubmit={handleSiguiente} className="pv3-layout">
          {/* Columna izquierda */}
          <div className="pv3-left">
            <label className="pv3-label">Tipo de viajero</label>
            <div className="pv3-tiles">
              <div
                className={`pv3-tile ${tipoViajero === "aventurero" ? "active" : ""}`}
                onClick={() => setTipoViajero("aventurero")}
              >
                <div className="pv3-tile-title">Aventurero</div>
                <div className="pv3-tile-desc">Me gusta explorar y descubrir.</div>
              </div>
              <div
                className={`pv3-tile ${tipoViajero === "relajado" ? "active" : ""}`}
                onClick={() => setTipoViajero("relajado")}
              >
                <div className="pv3-tile-title">Relajado</div>
                <div className="pv3-tile-desc">Prefiero descansar y disfrutar.</div>
              </div>
            </div>

            <label className="pv3-label">¿Viajás solo o acompañado?</label>
            <div className="pv3-modo">
              <div
                className={`pv3-chip ${compania === "solo" ? "active" : ""}`}
                onClick={() => setCompania("solo")}
              >
                <span className="pv3-chip-emoji">🧍</span> Solo
              </div>
              <div
                className={`pv3-chip ${compania === "grupo" ? "active" : ""}`}
                onClick={() => setCompania("grupo")}
              >
                <span className="pv3-chip-emoji">👥</span> En grupo
              </div>
            </div>

            {error && <p className="error">{error}</p>}

            <div className="acciones" style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="btn-anterior"
                onClick={() => navigate(-1)}
              >
                ◀&nbsp; Anterior
              </button>
              <button type="submit" className="btn-siguiente">
                Siguiente &nbsp; ➤
              </button>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="pv3-right">
            <div className="pv3-card">
              <div className="pv3-card-fallback" />
            </div>
            <div className="pv3-card-caption">Vista previa del perfil</div>
            <div className="pv3-caption-sub">Se actualizará según tus elecciones</div>
          </div>
        </form>
      </div>
    </div>
  );
}