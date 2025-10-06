import React, { useEffect, useState } from "react";
import "./PlanificarViaje2.css"; // ahora este es el CSS aislado
import { useNavigate } from "react-router-dom";

export default function PlanificarViaje2() {
  const navigate = useNavigate();

  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const isoHoy = `${yyyy}-${mm}-${dd}`; // fecha local, sin desfase de zona horaria

  const [salida, setSalida] = useState("");
  const [vuelta, setVuelta] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    const guardado = JSON.parse(localStorage.getItem("planificarViaje")) || {};
    if (guardado.fecha_salida) setSalida(guardado.fecha_salida);
    if (guardado.fecha_vuelta) setVuelta(guardado.fecha_vuelta);
  }, []);

  const validar = () => {
    if (!salida || !vuelta) {
      setError("Por favor completá ambas fechas.");
      setExito("");
      return false;
    }
    if (new Date(vuelta) < new Date(salida)) {
      setError("La fecha de vuelta no puede ser anterior a la de salida.");
      setExito("");
      return false;
    }
    setError("");
    return true;
  };

  const guardarEnLocalStorage = () => {
    const previo = JSON.parse(localStorage.getItem("planificarViaje")) || {};
    const data = {
      ...previo,
      fecha_salida: salida,
      fecha_vuelta: vuelta,
    };
    localStorage.setItem("planificarViaje", JSON.stringify(data));
  };

  const handleGuardar = () => {
    if (!validar()) return;
    guardarEnLocalStorage();
    setExito("✅ Fechas guardadas");
  };

  const handleSiguiente = (e) => {
    e.preventDefault();
    if (!validar()) return;
    guardarEnLocalStorage();
    navigate("/planificar/3");
  };

  return (
    <div className="planificar2-container">
      <div className="planificar2-box">
        <p className="breadcrumb">
          Planificador de Viajes &nbsp; ❯ &nbsp; <span>2: Elegir fechas</span>
        </p>

        <h2>Paso 2</h2>
        <h1>Elegí las fechas de tu viaje</h1>

        <form onSubmit={handleSiguiente}>

          <div className="date-grid">
            <div className="date-field">
              <span>Fecha de salida</span>
              <input
                type="date"
                min={isoHoy}
                value={salida}
                onChange={(e) => {
                  setSalida(e.target.value);
                  if (vuelta && e.target.value && new Date(vuelta) < new Date(e.target.value)) {
                    setVuelta(e.target.value);
                  }
                }}
              />
            </div>

            <div className="date-field">
              <span>Fecha de vuelta</span>
              <input
                type="date"
                min={salida || isoHoy}
                value={vuelta}
                onChange={(e) => setVuelta(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="acciones">
            <button type="button" className="btn-anterior" onClick={() => navigate(-1)}>
              ◀&nbsp; Anterior
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
