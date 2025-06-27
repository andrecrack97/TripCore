import React from "react";
import "./Navbar.css";


function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <a href="/"><img src="/assets/Logo.png" alt="TripCore" className="navbar-logo"/></a>
        
      </div>
      <nav className="navbar-links">
        <a href="#inicio">Planea tu viaje</a>
        <a href="#funcionalidades">Explorar destinos</a>
        <a href="#explorar">Ofertas</a>
        <a href="#explorar">Mis viajes</a>
        <a href="#ayuda">Ayuda</a>
      </nav>
      <div className="navbar-right">
       <a href="/Login" className="btn-login">Iniciar sesión</a>

        
      </div>
    </header>
  );
}

export default Navbar;
