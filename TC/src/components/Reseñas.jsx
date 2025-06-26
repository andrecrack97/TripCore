import "./Reseñas.css";

export default function Reseñas() {
  return (
    <section className="seccion-resenas">
      <h2 className="titulo-resenas">Lo que dicen nuestros viajeros</h2>
      <div className="grid-resenas">
        <div className="tarjeta-resena">
          <div className="usuario">
            <h3>Rogelio Ingralisto</h3>
          </div>
          <p>
            "TripCore me ayudó a organizar el viaje de mis sueños a Japón. Todo
            fue simple, rápido y seguro. ¡Lo súper recomiendo!"
          </p>
          <div className="estrellas">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="estrella-icono"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
              </svg>
            ))}
          </div>
        </div>
        <div className="tarjeta-resena">
          <div className="usuario">
            <h3>Tomás Herrera</h3>
          </div>
          <p>
            "Amo esta plataforma. Los precios eran mucho más bajos que en otras
            y el soporte fue excelente cuando tuve dudas."
          </p>
          <div className="estrellas">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="estrella-icono"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
              </svg>
            ))}
          </div>
        </div>

        <div className="tarjeta-resena">
          <div className="usuario">
            <h3>Heraclito Canionni</h3>
          </div>
          <p>
            "Con TripCore armamos todo el viaje a Europa sin estrés. Lo mejor
            fue poder reservar actividades y tener ayuda cuando nos perdimos en
            Praga. Es como llevar una guía turística en el bolsillo."
          </p>
          <div className="estrellas">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="estrella-icono"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
