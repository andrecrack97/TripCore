import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./PlanificarViaje.css";
import { useNavigate } from "react-router-dom";

export default function PlanificarViaje1() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [error, setError] = useState("");

  // estado para autocompletar
  const [sugOrigen, setSugOrigen] = useState([]);
  const [sugDestino, setSugDestino] = useState([]);
  const [openOrigen, setOpenOrigen] = useState(false);
  const [openDestino, setOpenDestino] = useState(false);

  const abortOrigenRef = useRef();
  const abortDestinoRef = useRef();

  const navigate = useNavigate();

  // Restaurar si el usuario vuelve atrás
  useEffect(() => {
    try {
      const previo = JSON.parse(localStorage.getItem("planificarViaje")) || {};
      if (previo.origen) setOrigen(previo.origen);
      if (previo.destino) setDestino(previo.destino);
    } catch (_) {}
  }, []);

  // ---- helpers de fetch a tu backend /api/destinos/geo ----
  const fetchCiudades = async (q, controller) => {
    if (!q || q.trim().length < 2) return [];
    const params = new URLSearchParams({ q, limit: 8, minPop: 20000 });
    const res = await fetch(`/api/destinos/geo?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("GeoDB error");
    return await res.json(); // [{nombre,pais,...}]
  };

  // Autocompletar ORIGEN (debounce)
  useEffect(() => {
    if (abortOrigenRef.current) abortOrigenRef.current.abort();
    const controller = new AbortController();
    abortOrigenRef.current = controller;

    const t = setTimeout(async () => {
      try {
        if (origen.trim().length < 2) {
          setSugOrigen([]);
          setOpenOrigen(false);
          return;
        }
        const data = await fetchCiudades(origen, controller);
        setSugOrigen(data);
        setOpenOrigen(true);
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    }, 250);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origen]);

  const handleDestinoChange = async (e) => {
    const value = e.target.value;
    setDestino(value);
    if (!value || value.trim().length < 2) {
      setSugDestino([]);
      setOpenDestino(false);
      return;
    }
    try {
      const { data } = await axios.get("/api/destinos/geo", {
        params: { q: value, limit: 8, minPop: 20000 },
        headers: {
          "x-client": "TripCore",
          "x-query": value,
        },
      });
      setSugDestino(data);
      setOpenDestino(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Selección desde el dropdown -> mantenemos STRING "Ciudad, País"
  const seleccionarOrigen = (item) => {
    setOrigen(`${item.nombre}, ${item.pais}`);
    setOpenOrigen(false);
  };
  const seleccionarDestino = (item) => {
    setDestino(`${item.nombre}, ${item.pais}`);
    setOpenDestino(false);
  };

  const handleSiguiente = (e) => {
    e.preventDefault();
    const origenTrim = origen.trim();
    const destinoTrim = destino.trim();
    if (!origenTrim || !destinoTrim) {
      setError("Por favor completá ambos campos");
      return;
    }
    setError("");

    // Guardar en localStorage para el siguiente paso (se guarda STRING como antes)
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
          {/* ORIGEN */}
          <label>Elegir punto de partida</label>
          <div className="input-ac-wrapper">
            <input
              type="text"
              placeholder="Países, ciudades etc"
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
              onFocus={() => sugOrigen.length && setOpenOrigen(true)}
              onBlur={() => setTimeout(() => setOpenOrigen(false), 120)}
            />
            {openOrigen && sugOrigen.length > 0 && (
              <ul className="ac-dropdown">
                {sugOrigen.map((it) => (
                  <li
                    key={it.id}
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => seleccionarOrigen(it)}
                  >
                    <div className="ac-title">{it.nombre}</div>
                    <div className="ac-sub">
                      {it.pais} {it.countryCode ? `· ${it.countryCode}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* DESTINO */}
          <label>Elegir destino</label>
          <div className="input-ac-wrapper">
            <input
              type="text"
              placeholder="Países, ciudades etc"
              value={destino}
              onChange={handleDestinoChange}
              onFocus={() => sugDestino.length && setOpenDestino(true)}
              onBlur={() => setTimeout(() => setOpenDestino(false), 120)}
            />
            {openDestino && sugDestino.length > 0 && (
              <ul className="ac-dropdown">
                {sugDestino.map((it) => (
                  <li
                    key={it.id}
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => seleccionarDestino(it)}
                  >
                    <div className="ac-title">{it.nombre}</div>
                    <div className="ac-sub">
                      {it.pais} {it.countryCode ? `· ${it.countryCode}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="error">{error}</p>}

          <p className="ayuda">¿Aún no estás seguro de dónde ir?</p>
          <div className="acciones">
            <button
              type="button"
              className="btn-explorar"
              onClick={() => navigate("/explorar-destinos")}
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
