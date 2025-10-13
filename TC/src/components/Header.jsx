import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
function Header() {
  const navigate = useNavigate();
  const goPlan = () => navigate("/planificar");
  const goExplore = () => navigate("/explorar-destinos");
  return (
    <section
     className="header"
      style={{ backgroundImage: "url('/assets/puntacana.jpg')" }}
      >

      <div className="header-content">
        <h1>Tu viaje comienza con<br />TripCore</h1>
        <div className="header-buttons">
          <button className="btn-plan" onClick={goPlan}>Comienza a planificar</button>
          <button className="btn-explore" onClick={goExplore}>Explorar destinos</button>
        </div>
      </div>
    </section>
  );
}

export default Header;

