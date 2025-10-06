
import { useNavigate } from 'react-router-dom';
import './ComienzaAPlanificar.css';

export default function ComienzaAPlanificar() {
  const navigate = useNavigate();
  return (
    <section className="seccion-planificar">
      <div className="contenido-planificar">
        <h2 className="titulo-planificar">¿Listo para tu próxima aventura?</h2>
        <button className="boton-planificar" onClick={() => navigate('/planificar')}>Comenzar a planificar</button>
      </div>
    </section>
  );
}
