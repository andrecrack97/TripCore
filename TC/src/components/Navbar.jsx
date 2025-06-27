import React from "react";
import "./Navbar.css";


function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <img src="/assets/Logo.png" alt="TripCore" className="navbar-logo" />
      </div>
      <nav className="navbar-links">
        <a href="#inicio">Planea tu viaje</a>
        <a href="#funcionalidades">Explorar destinos</a>
        <a href="#explorar">Ofertas</a>
        <a href="#explorar">Mis viajes</a>
        <a href="#ayuda">Ayuda</a>
      </nav>
      <div className="navbar-right">
        <button className="btn-login">Iniciar sesión</button>
      </div>
    </header>
  );
}

export default Navbar;
