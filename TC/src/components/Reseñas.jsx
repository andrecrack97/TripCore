// import React from 'react'
// import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from 'lucide-react'
// const reseñas = [
//   {
//     name: 'Rogelio Ingralisto',
//     quote:
//       '"TripCore me facilitó todo, desde la reserva del hotel hasta las excursiones en mi destino"',
//     rating: 5,
//   },
//   {
//     name: 'Rogelio Inglehart',
//     quote:
//       '"TripCore me facilitó todo, desde la reserva del hotel hasta las excursiones en mi destino"',
//     rating: 5,
//   },
//   {
//     name: 'Heraclito Canionni',
//     quote:
//       '"Con TripCore armamos todo el viaje en media hora. Excelente atención, precios geniales y buena variedad. Nunca fue tan fácil viajar. Lo voy a recomendar sin dudas"',
//     rating: 5,
//   },
// ]
// const Reseñas = () => {
//   return (
//     <section className="py-12 px-4 max-w-6xl mx-auto">
//       <div className="text-center mb-8">
//         <h2 className="text-2xl font-bold mb-4">Reseñas</h2>
//         <button className="text-purple-600 hover:text-purple-700 font-medium">
//           Ver más reseñas
//         </button>
//       </div>
//       <div className="relative">
//         <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar justify-center">
//           {reseñas.map((reseñas, index) => (
//             <div
//               key={index}
//               className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg p-6 border border-gray-200"
//             >
//               <div className="flex mb-4">
//                 {[...Array(reseñas.rating)].map((_, i) => (
//                   <StarIcon
//                     key={i}
//                     className="w-5 h-5 text-yellow-400 fill-current"
//                   />
//                 ))}
//               </div>
//               <p className="text-gray-600 italic mb-4">{reseñas.quote}</p>
//               <p className="font-medium">{reseñas.name}</p>
//             </div>
//           ))}
//         </div>
//         <button className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
//           <ChevronLeftIcon className="w-5 h-5" />
//         </button>
//         <button className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
//           <ChevronRightIcon className="w-5 h-5" />
//         </button>
//       </div>
//     </section>
//   )
// }
// export default Reseñas

import './Reseñas.css';

export default function Reseñas() {
  return (
    <section className="seccion-resenas">
      <h2 className="titulo-resenas">Lo que dicen nuestros viajeros</h2>

      <div className="grid-resenas">
        <div className="tarjeta-resena">
          <div className="usuario">
            <img src="/assets/user1.jpg" alt="Lucía" className="avatar" />
            <h3>Lucía Fernández</h3>
          </div>
          <p>
            "TripCore me ayudó a organizar el viaje de mis sueños a Japón. Todo fue simple, rápido y seguro. ¡Lo súper recomiendo!"
          </p>
          <div className="estrellas">⭐⭐⭐⭐⭐</div>
        </div>

        <div className="tarjeta-resena">
          <div className="usuario">
            <img src="/assets/user2.jpg" alt="Tomás" className="avatar" />
            <h3>Tomás Herrera</h3>
          </div>
          <p>
            "Amo esta plataforma. Los precios eran mucho más bajos que en otras y el soporte fue excelente cuando tuve dudas."
          </p>
          <div className="estrellas">⭐⭐⭐⭐⭐</div>
        </div>

        <div className="tarjeta-resena">
          <div className="usuario">
            <img src="/assets/user3.jpg" alt="Sofía" className="avatar" />
            <h3>Sofía Gómez</h3>
          </div>
          <p>
            "Desde que uso TripCore, viajo más tranquila. Todo está en un solo lugar, ¡y encima tiene buenas ofertas!"
          </p>
          <div className="estrellas">⭐⭐⭐⭐⭐</div>
        </div>
      </div>
    </section>
  );
}
