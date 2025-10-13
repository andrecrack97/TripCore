import React, { useContext, useEffect, useState } from "react";
import "./Navbar.css";
import { UserContext } from "../context/UserContext.jsx";

function Navbar() {
  const { user } = useContext(UserContext);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    // reactivo: observa cambios de user o token
    const token = localStorage.getItem("token");
    setIsLogged(Boolean(user?.email || token));
  }, [user]);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <a href="/"><img src="/assets/Logo.png" alt="TripCore" className="navbar-logo"/></a>
      </div>

      <nav className="navbar-links">
        <a href="/planificar">Planea tu viaje</a>
        <a href="/explorar-destinos">Explorar destinos</a>
        <a href="#explorar">Ofertas</a>
        <a href="/MisViajes">Mis viajes</a>
        <a href="#ayuda">Ayuda</a>
      </nav>

      <div className="navbar-right">
        {!isLogged ? (
          <a href="/Login" className="btn-login">Iniciar sesión</a>
        ) : (
          <a href="/Perfil" className="navbar-avatar">
            <img src="/assets/avatar.png" alt="Perfil" />
          </a>
        )}
      </div>
    </header>
  );
}

export default Navbar;

/*
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
*/ 
