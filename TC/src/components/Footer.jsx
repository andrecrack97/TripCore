import './Footer.css';


export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <h3 className="logo">TripCore</h3>
          <p>Tu compañero ideal<br />para recorrer el mundo</p>
        </div>

        <div className="footer-col">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Planificador</a></li>
            <li><a href="#">Explorar destinos</a></li>
            <li><a href="#">Ofertas</a></li>
            <li><a href="#">Atención al cliente</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contacto</h4>
          <p>+54 911 54390-3771<br />TripCore@gmail.com</p>
        </div>

        <div className="footer-col">
          <h4>Nuestras redes</h4>
          <div className="footer-redes">
            <a href="#"><instagram/></a>
            <a href="#"><twitter /></a>
            <a href="#"><facebook /></a>
          </div>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <span>©2025 TripCore. Todos los derechos reservados.</span>
        <div className="footer-links">
          <a href="#">Términos y condiciones</a>
          <a href="#">Políticas de privacidad</a>
        </div>
      </div>
    </footer>
  );
}


