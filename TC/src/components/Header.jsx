import React from 'react'
const Header = () => {
  return (
    <section
      className="relative w-full h-[500px] bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          'url("https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.kayak.com.do%2FPunta-Cana-Hoteles-Now-Larimar-Punta-Cana.145636.ksp&psig=AOvVaw1OJQgYIg0XDyN23I3rIX-T&ust=1749900316766000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCKjuueik7o0DFQAAAAAdAAAAABAL")',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 text-center px-4">
        <h1 className="text-white text-4xl md:text-5xl font-bold mb-8">
          Tu viaje comienza con
          <br/>
          TripCore
        </h1>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-purple-600 text-white px-6 py-3 rounded">
            Comenzar a planificar
          </button>
          <button className="bg-white text-gray-800 px-6 py-3 rounded">
            Explorar destinos
          </button>
        </div>
      </div>
    </section>
  )
}
export default Header