import React from "react";
import "./Header.css";
function Header() {
  return (
    <section
     className="header"
      style={{ backgroundImage: "url('/assets/puntacana.jpg')" }}
      >

      <div className="header-content">
        <h1>Tu viaje comienza con<br />TripCore</h1>
        <div className="header-buttons">
          <button className="btn-plan">Comienza a planificar</button>
          <button className="btn-explore">Explorar destinos</button>
        </div>
      </div>
    </section>
  );
}

export default Header;

