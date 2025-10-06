import React, { useEffect, useState } from "react";
import "./PlanificarViaje.css";
import { useNavigate } from "react-router-dom";

export default function PlanificarViaje1() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Restaurar si el usuario vuelve atrás
  useEffect(() => {
    try {
      const previo = JSON.parse(localStorage.getItem("planificarViaje")) || {};
      if (previo.origen) setOrigen(previo.origen);
      if (previo.destino) setDestino(previo.destino);
    } catch (_) {}
  }, []);

  const handleSiguiente = (e) => {
    e.preventDefault();
    const origenTrim = origen.trim();
    const destinoTrim = destino.trim();
    if (!origenTrim || !destinoTrim) {
      setError("Por favor completá ambos campos");
      return;
    }
    setError("");

    // Guardar en localStorage para el siguiente paso
    localStorage.setItem(
      "planificarViaje",
      JSON.stringify({ origen: origenTrim, destino: destinoTrim })
    );

    navigate("/planificar/2");
  };

  return (
    <div className="planificador-container">
      <div className="planificador-box">
        <p className="breadcrumb">
          Planificador de Viajes &nbsp; ❯ &nbsp; <span>1: Elegir destino</span>
        </p>
        <h2>Paso 1</h2>
        <h1>Planea tu próximo viaje</h1>

        <form onSubmit={handleSiguiente}>
          <label>Elegir punto de partida</label>
          <input
            type="text"
            placeholder="Países, ciudades etc"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
          />

          <label>Elegir destino</label>
          <input
            type="text"
            placeholder="Países, ciudades etc"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <p className="ayuda">¿Aún no estás seguro de dónde ir?</p>
          <div className="acciones">
            <button
              type="button"
              className="btn-explorar"
              onClick={() => {
                const el = document.getElementById("destinos");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate("/#destinos");
                }
              }}
            >
              Explorar destinos
            </button>

            <button type="submit" className="btn-siguiente">
              Siguiente &nbsp; ➤
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
