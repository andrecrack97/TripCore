import React from "react";
import "./PropuestaDeValor.css";
import icon1 from "../assets/icon-planifica.png";
import icon2 from "../assets/icon-hospedaje.png";
import icon3 from "../assets/icon-actividades.png";
import icon4 from "../assets/icon-atencion.png";

function PropuestaDeValor() {
  return (
    <section className="propuesta-valor">
      <div className="valor-item">
        <img src={icon1} alt="Planificá tus viajes" />
        <h4>Planificá tus viajes</h4>
        <p>Elije destinos, rutas,<br />presupuestos y servicios</p>
      </div>

      <div className="valor-item">
        <img src={icon2} alt="Reservá hospedaje y transporte" />
        <h4>Reservá hospedaje<br />y transporte</h4>
        <p>Encontrá y<br />compará presupuestos<br />en segundos</p>
      </div>

      <div className="valor-item">
        <img src={icon3} alt="Explora actividades y experiencias" />
        <h4>Explora actividades<br />y experiencias</h4>
        <p>Descubrí excursiones,<br />tours y eventos únicos<br />en cada ciudad</p>
      </div>

      <div className="valor-item">
        <img src={icon4} alt="Atención personalizada" />
        <h4>Atención<br />personalizada</h4>
        <p>Accedé a soporte<br />humano para resolver<br />problemas</p>
      </div>
    </section>
  );
}

export default PropuestaDeValor;
