// import React from 'react'
// import {
//   FacebookIcon,
//   TwitterIcon,
//   InstagramIcon,
//   YoutubeIcon,
// } from 'lucide-react'
// const Footer = () => {
//   return (
//     <footer className="bg-purple-600 text-white py-8 px-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
//           <div>
//             <h3 className="font-bold mb-4">TripCore</h3>
//             <p className="text-sm text-purple-200">
//               Tu compañero ideal para planear viajes
//             </p>
//           </div>
//           <div>
//             <h3 className="font-bold mb-4">Explorar</h3>
//             <ul className="text-sm space-y-2">
//               <li>
//                 <a href="#" className="text-purple-200 hover:text-white">
//                   Destinos
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="text-purple-200 hover:text-white">
//                   Ofertas especiales
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="text-purple-200 hover:text-white">
//                   Hoteles
//                 </a>
//               </li>
//               <li>
//                 <a href="#" className="text-purple-200 hover:text-white">
//                   Vuelos y paquetes
//                 </a>
//               </li>
//             </ul>
//           </div>
//           <div>
//             <h3 className="font-bold mb-4">Contacto</h3>
//             <ul className="text-sm space-y-2">
//               <li className="text-purple-200">info@tripcore.com</li>
//               <li className="text-purple-200">+1 (555) 123-4567</li>
//               <li className="text-purple-200">info@tripcore.com</li>
//             </ul>
//           </div>
//           <div>
//             <h3 className="font-bold mb-4">Siguenos en redes</h3>
//             <div className="flex space-x-4">
//               <a href="#" className="text-purple-200 hover:text-white">
//                 <FacebookIcon className="w-5 h-5" />
//               </a>
//               <a href="#" className="text-purple-200 hover:text-white">
//                 <TwitterIcon className="w-5 h-5" />
//               </a>
//               <a href="#" className="text-purple-200 hover:text-white">
//                 <InstagramIcon className="w-5 h-5" />
//               </a>
//               <a href="#" className="text-purple-200 hover:text-white">
//                 <YoutubeIcon className="w-5 h-5" />
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="text-sm text-purple-200 pt-4 border-t border-purple-500 flex flex-col md:flex-row justify-between">
//           <p>© 2025 TripCore. Todos los derechos reservados.</p>
//           <div className="flex space-x-4 mt-2 md:mt-0">
//             <a href="#" className="hover:text-white">
//               Términos y condiciones
//             </a>
//             <a href="#" className="hover:text-white">
//               Política de privacidad
//             </a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   )
// }
// export default Footer

import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-contenido">

        <div className="footer-columna">
          <h3 className="footer-logo">✈️ TripCore</h3>
          <p className="footer-descripcion">
            Inspirando tus viajes, organizando tu aventura.
          </p>
        </div>

        <div className="footer-columna">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#">Planes</a></li>
            <li><a href="#">Destinos</a></li>
            <li><a href="#">Ofertas</a></li>
            <li><a href="#">Ayuda</a></li>
          </ul>
        </div>

        <div className="footer-columna">
          <h4>Contacto</h4>
          <ul>
            <li><a href="mailto:info@tripcore.com">info@tripcore.com</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Twitter</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-final">
        © 2025 TripCore. Todos los derechos reservados.
      </div>
    </footer>
  );
}
