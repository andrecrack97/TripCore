import React from 'react'
const Navbar = () => {
  return (
    <header className="bg-white w-full py-3 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <span className="text-purple-600 font-bold text-xl">TripCore</span>
      </div>
      <nav className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
        <a href="#" className="hover:text-purple-600">
          Planes de viaje
        </a>
        <a href="#" className="hover:text-purple-600">
          Explorar destinos
        </a>
        <a href="#" className="hover:text-purple-600">
          Ofertas
        </a>
        <a href="#" className="hover:text-purple-600">
          Mis viajes
        </a>
        <a href="#" className="hover:text-purple-600">
          Ayuda
        </a>
      </nav>
      <div>
        <button className="bg-purple-600 text-white px-4 py-1 rounded text-sm">
          Iniciar sesión
        </button>
      </div>
    </header>
  )
}
export default Navbar