import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="barra-navegacion">
      <div className="contenedor-navegacion">
        <div className="nav-izquierda">
          <span className="icono-logo">✈️</span>
          <span className="texto-logo">TripCore</span>
        </div>

        <ul className="lista-enlaces">
          <li><a href="#">Planea tu viaje</a></li>
          <li><a href="#">Explorar destinos</a></li>
          <li><a href="#">Ofertas</a></li>
          <li><a href="#">Mis viajes</a></li>
          <li><a href="#">Ayuda</a></li>
        </ul>

        <div className="nav-derecha">
          <button className="boton-sesion">Iniciar Sesión</button>
        </div>
      </div>
    </nav>
  );
}
