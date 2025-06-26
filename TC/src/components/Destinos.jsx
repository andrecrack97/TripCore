import React from 'react'
import "./Destinos.css";





export default function Destinos() {
  return (
    <section className="seccion-destinos">
      <h2 className="titulo-destinos">Destinos recomendados</h2>

      <div className="grid-destinos">
        <div className="tarjeta-destino">
          <img src="/assets/paris.avif" alt="París" className="imagen-destino" />
          <h3 className="nombre-destino">París, Francia</h3>
        </div>

        <div className="tarjeta-destino">
          <img src="/assets/rio.avif" alt="Río de Janeiro" className="imagen-destino" />
          <h3 className="nombre-destino">Río de Janeiro, Brasil</h3>
        </div>

        <div className="tarjeta-destino">
          <img src="/assets/miami.avif" alt="Miami" className="imagen-destino" />
          <h3 className="nombre-destino">Miami, EEUU</h3>
        </div>

        <div className="tarjeta-destino">
          <img src="/assets/ushuaia.webp" alt="Ushuaia" className="imagen-destino" />
          <h3 className="nombre-destino">Ushuaia, Argentina</h3>
        </div>
      </div>
    </section>
  );
}

