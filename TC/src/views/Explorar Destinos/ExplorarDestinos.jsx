import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExplorarDestinos.css";

export default function ExplorarDestinos() {
  const navigate = useNavigate();
  const [pais, setPais] = useState("Todos los países");
  const [ciudad, setCiudad] = useState("");
  const [climas, setClimas] = useState(new Set());
  const [temporadas, setTemporadas] = useState(new Set());

  const destacados = useMemo(
    () => [
      {
        id: "santorini",
        titulo: "Santorini",
        pais: "Grecia",
        descripcion:
          "Playas de arena negra, aguas cristalinas y arquitectura única.",
        precio: 1200,
        img: "/assets/rio.avif",
        clima: ["Mediterráneo", "Templado"],
        rating: 4.9,
      },
      {
        id: "cusco",
        titulo: "Cusco",
        pais: "Perú",
        descripcion: "Ciudad histórica rodeada de ruinas incas y cultura vibrante.",
        precio: 800,
        img: "/assets/ushuaia.webp",
        clima: ["Templado", "Primavera"],
        rating: 4.7,
      },
      {
        id: "kioto",
        titulo: "Kioto",
        pais: "Japón",
        descripcion: "Templos antiguos, jardines zen y tradición japonesa.",
        precio: 1500,
        img: "/assets/paris.avif",
        clima: ["Templado", "Primavera"],
        rating: 4.8,
      },
    ],
    []
  );

  const toggleSet = (setFn, value) => {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const limpiar = () => {
    setPais("Todos los países");
    setCiudad("");
    setClimas(new Set());
    setTemporadas(new Set());
  };

  const filtrados = useMemo(() => {
    return destacados.filter((d) => {
      if (pais !== "Todos los países" && d.pais !== pais) return false;
      if (ciudad && !(`${d.titulo} ${d.pais}`.toLowerCase().includes(ciudad.toLowerCase()))) return false;
      if (climas.size > 0) {
        const ok = Array.from(climas).every((c) => d.clima.includes(c));
        if (!ok) return false;
      }
      if (temporadas.size > 0) {
        const okTemp = Array.from(temporadas).some((t) => d.clima.includes(t));
        if (!okTemp) return false;
      }
      return true;
    });
  }, [destacados, pais, ciudad, climas, temporadas]);

  const similares = useMemo(
    () => [
      { id: "riviera", titulo: "Riviera Maya", pais: "México", precio: 900, img: "/assets/puntacana.jpg", rating: 4.6 },
      { id: "amalfi", titulo: "Amalfi", pais: "Italia", precio: 1300, img: "/assets/resort.png", rating: 4.9 },
      { id: "dubrovnik", titulo: "Dubrovnik", pais: "Croacia", precio: 1100, img: "/assets/miami.avif", rating: 4.7 },
    ],
    []
  );

  return (
    <section className="explorar-page">
      <div className="container">
        <h2 className="title">Explorá tu próximo destino</h2>

        <div className="layout">
          <aside className="filters">
            <h4>Filtros</h4>
            <div className="filter-group">
              <label>País</label>
              <select value={pais} onChange={(e) => setPais(e.target.value)}>
                <option>Todos los países</option>
                <option>Grecia</option>
                <option>Perú</option>
                <option>Japón</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Ciudad</label>
              <input placeholder="Buscar ciudad..." value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Clima</label>
              <div className="chips">
                {['Templado','Frío','Tropical','Desértico','Mediterráneo'].map((c) => (
                  <button
                    key={c}
                    className={climas.has(c) ? 'active' : ''}
                    type="button"
                    onClick={() => toggleSet(setClimas, c)}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label>Temporada</label>
              <div className="chips">
                {['Verano','Otoño','Invierno','Primavera'].map((t) => (
                  <button
                    key={t}
                    className={temporadas.has(t) ? 'active' : ''}
                    type="button"
                    onClick={() => toggleSet(setTemporadas, t)}
                  >{t}</button>
                ))}
              </div>
            </div>
            <button className="btn-apply" type="button" onClick={() => { /* filtros en vivo */ }}>Aplicar filtros</button>
            <button className="btn-clear" type="button" onClick={limpiar}>Limpiar</button>
          </aside>

          <div className="content">
            <div className="cards-grid">
              {filtrados.map((d) => (
                <article className="card" key={d.id}>
                  <div className="card-img" style={{ backgroundImage: `url(${d.img})` }} />
                  <div className="card-body">
                    <div className="card-top">
                      <h5>{d.titulo}</h5>
                      <span className="badge">{d.rating.toFixed(1)}</span>
                    </div>
                    <p className="sub">{d.pais}</p>
                    <p className="desc">{d.descripcion}</p>
                    <div className="card-bottom">
                      <div className="tags">
                        {d.clima.map((t) => (
                          <span className="tag" key={t}>{t}</span>
                        ))}
                      </div>
                      <div className="price">
                        <span>USD {d.precio.toLocaleString()}</span>
                        <button
                          className="btn-more"
                          onClick={() => navigate(`/explorar-destinos/${d.id}`, { state: { destino: d } })}
                        >
                          Ver más
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <h3 className="subtitle">Viajes similares a los tuyos</h3>
            <div className="mini-grid">
              {similares.map((s) => (
                <article className="mini-card" key={s.id}>
                  <div className="mini-img" style={{ backgroundImage: `url(${s.img})` }} />
                  <div className="mini-body">
                    <div className="mini-top">
                      <h6>{s.titulo}</h6>
                      <span className="badge">{s.rating.toFixed(1)}</span>
                    </div>
                    <p className="sub">{s.pais}</p>
                  <div className="mini-bottom">
                      <span className="mini-price">USD {s.precio.toLocaleString()}</span>
                    <button
                      className="link-more"
                      onClick={() => navigate(`/explorar-destinos/${s.id}`, { state: { destino: s } })}
                    >
                      Ver más
                    </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


