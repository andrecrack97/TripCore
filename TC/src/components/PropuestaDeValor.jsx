import React from "react";
import "./PropuestaDeValor.css";


function PropuestaDeValor() {
  return (
    <section className="propuesta-valor">
      <div className="valor-item">
        <img src = "/assets/mapa.png" alt="Planificá tus viajes" />
        <h4>Planificá tus viajes</h4>
        <p>Elije destinos, rutas,<br />presupuestos y servicios</p>
      </div>

      <div className="valor-item">
        <img src="/assets/hotel.png"alt="Reservá hospedaje y transporte" />
        <h4>Reservá hospedaje<br />y transporte</h4>
        <p>Encontrá y<br />compará presupuestos<br />en segundos</p>
      </div>

      <div className="valor-item">
        <img src="/assets/actividades.png"alt="Explora actividades y experiencias" />
        <h4>Explora actividades<br />y experiencias</h4>
        <p>Descubrí excursiones,<br />tours y eventos únicos<br />en cada ciudad</p>
      </div>

      <div className="valor-item">
        <img src="/assets/soporte.png"alt="Atención personalizada" />
        <h4>Atención<br />personalizada</h4>
        <p>Accedé a soporte<br />humano para resolver<br />problemas</p>
      </div>
    </section>
  );
}

export default PropuestaDeValor;
