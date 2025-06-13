import React from 'react'
import {
  MapPinIcon,
  BuildingIcon,
  CompassIcon,
  HeadphonesIcon,
} from 'lucide-react'
const PropuestaDeValor = () => {
  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
            <MapPinIcon className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="font-bold mb-2">Planifica tus viajes</h3>
          <p className="text-sm text-gray-600">
            Elige destinos, rutas, presupuestos y servicios
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
            <BuildingIcon className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="font-bold mb-2">Reservá hospedaje y transporte</h3>
          <p className="text-sm text-gray-600">
            Encuentra y compara presupuestos en segundos
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
            <CompassIcon className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="font-bold mb-2">Explora actividades y experiencias</h3>
          <p className="text-sm text-gray-600">
            Descubre excursiones, tours y eventos únicos
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
            <HeadphonesIcon className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="font-bold mb-2">Atención personalizada</h3>
          <p className="text-sm text-gray-600">
            Accede a soporte humano para resolver problemas en cada ciudad
          </p>
        </div>
      </div>
    </section>
  )
}
export default PropuestaDeValor