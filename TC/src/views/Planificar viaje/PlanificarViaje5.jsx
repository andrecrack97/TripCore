import React from "react";
import { useNavigate } from "react-router-dom";
import "./PlanificarViaje5.css";

const suggestions = [
  {
    id: 1,
    title: "Tour gastronómico local",
    desc: "Descubre los sabores típicos del destino con guías especializados.",
    price: "45 USD",
    img: "https://source.unsplash.com/600x400/?food,travel"
  },
  {
    id: 2,
    title: "Excursión cultural",
    desc: "Visita museos y monumentos históricos acompañado por un experto.",
    price: "30 USD",
    img: "https://source.unsplash.com/600x400/?museum,culture"
  },
  {
    id: 3,
    title: "Aventura al aire libre",
    desc: "Disfruta actividades de trekking, kayak o bici en paisajes únicos.",
    price: "60 USD",
    img: "https://source.unsplash.com/600x400/?adventure,nature"
  }
];

export default function PlanificarViaje5() {
  const navigate = useNavigate();

  return (
    <div className="pv5-wrap">
      {/* Breadcrumb */}
      <div className="pv5-breadcrumb">
        <span className="crumb">Planificador de Viajes</span>
        <span className="sep">›</span>
        <span className="crumb active">5: Sugerencias inteligentes</span>
      </div>

      {/* Header */}
      <header className="pv5-header">
        <h1>Sugerencias inteligentes</h1>
        <p>
          En base a tu presupuesto e intereses, te recomendamos experiencias que
          harán tu viaje único.
        </p>
      </header>

      {/* Cards */}
      <div className="pv5-cards">
        {suggestions.map((s) => (
          <div key={s.id} className="pv5-card">
            <img src={s.img} alt={s.title} />
            <div className="pv5-card-body">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="pv5-price">{s.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer navegación */}
      <footer className="pv5-footer">
        <button
          className="btn btn--ghost"
          onClick={() => navigate("/planificar-viaje/4")}
        >
          ◀ Anterior
        </button>
        <button
          className="btn btn--primary"
          onClick={() => {
            // acá podrías guardar la selección o generar itinerario
            navigate("/mis-viajes");
          }}
        >
          Finalizar ✔
        </button>
      </footer>
    </div>
  );
}
