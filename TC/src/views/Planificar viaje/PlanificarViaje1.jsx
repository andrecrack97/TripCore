import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AutoDestinoGeo from "../../components/AutoDestinoGeo";
import "./PlanificarViaje.css";

export default function PlanificarViaje1() {
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const previo = JSON.parse(localStorage.getItem("planificarViaje")) || {};
      if (previo.origen) setOrigen(previo.origen);
      if (previo.destino) setDestino(previo.destino);
    } catch (_) {}
  }, []);

  const handleSiguiente = (e) => {
    e.preventDefault();
    if (!origen || !destino) {
      setError("Completá origen y destino para continuar.");
      return;
    }
    setError("");
    localStorage.setItem("planificarViaje", JSON.stringify({ origen, destino }));
    navigate("/planificar/2");
  };

  return (
    <div className="pv1-bg">
      <div className="pv1-card">
        <div className="pv1-breadcrumbs">
          <span className="muted">Planificador de Viajes</span>
          <span className="sep">›</span>
          <Link className="crumb-active" to="/planificar/1">
            1: Elegir destino
          </Link>
        </div>

        <h6 className="pv1-step">Paso 1</h6>
        <h1 className="pv1-title">Planea tu próximo viaje</h1>

        <form onSubmit={handleSiguiente}>
          <div className="pv1-field">
            <label className="pv1-label">Elegir punto de partida</label>
            <AutoDestinoGeo
              label={null}
              placeholder="Países, ciudades etc"
              defaultValue={origen || undefined}
              onSelect={setOrigen}
            />
          </div>

          <div className="pv1-field">
            <label className="pv1-label">Elegir destino</label>
            <AutoDestinoGeo
              label={null}
              placeholder="Países, ciudades etc"
              defaultValue={destino || undefined}
              onSelect={setDestino}
            />
          </div>

          <div className="pv1-explore">
            <p className="pv1-explore-text">¿Aún no estás seguro de dónde ir?</p>
            <Link to="/explorar" className="pv1-explore-btn">
              <span className="pin" aria-hidden>📍</span> Explorar destinos
            </Link>
          </div>

          {error && <div className="pv1-error">{error}</div>}

          <div className="pv1-actions">
            <button type="submit" className="pv1-next">
              Siguiente <span className="arrow">›</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
