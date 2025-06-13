import React from 'react'
const destinos = [
  {
    name: 'Rio de Janeiro',
    image:
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  },
  {
    name: 'Paris',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1173&q=80',
  },
  {
    name: 'Miami',
    image:
      'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  },
  {
    name: 'Iguazú',
    image:
      'https://images.unsplash.com/photo-1544085701-4d54e9f41c45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1136&q=80',
  },
]
const Destinos = () => {
  return (
    <section className="py-8 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Destinos populares</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {destinos.map((destinos, index) => (
          <div
            key={index}
            className="relative rounded-lg overflow-hidden h-40 cursor-pointer"
          >
            <img
              src={destinos.image}
              alt={destinos.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-3">
              <h3 className="text-white font-medium">{destinos.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
export default Destinos
