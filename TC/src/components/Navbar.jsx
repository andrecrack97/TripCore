import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        <Link to="/"><img src="/assets/Logo.png" alt="TripCore" className="navbar-logo"/></Link>
      </div>

      <nav className="navbar-links">
        <Link to="/planificar">Planea tu viaje</Link>
        <Link to="/explorar-destinos">Explorar destinos</Link>
        <Link to="/ofertas">Ofertas</Link>
        <Link to="/MisViajes">Mis viajes</Link>
        <a href="/ayuda">Ayuda</a>
      </nav>

      <div className="navbar-right">
        {!isLogged ? (
          <Link to="/login" className="btn-login">Iniciar sesión</Link>
        ) : (
          <Link to="/perfil" className="navbar-avatar">
            <img src="/assets/avatar.png" alt="Perfil" />
          </Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;

