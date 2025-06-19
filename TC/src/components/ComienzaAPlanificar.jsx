// import React from 'react'
// const Accion = () => {
//   return (
//     <section className="py-16 px-4 text-center">
//       <h2 className="text-2xl font-bold mb-8">Empieza tu viaje ahora</h2>
//       <button className="bg-purple-600 text-white px-6 py-3 rounded">
//         Comenzar a planificar
//       </button>
//     </section>
//   )
// }
// export default Accion

import './ComienzaAPlanificar.css';

export default function ComienzaAPlanificar() {
  return (
    <section className="seccion-planificar">
      <div className="contenido-planificar">
        <h2 className="titulo-planificar">¿Listo para tu próxima aventura?</h2>
        <p className="texto-planificar">
          Organizá tu viaje ideal con TripCore en solo unos clics. ¡Empezá hoy!
        </p>
        <button className="boton-planificar">Comenzar a planificar</button>
      </div>
    </section>
  );
}
