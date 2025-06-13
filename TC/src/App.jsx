import React from 'react'
import Navbar from './components/Navbar'
import ComienzaAPlanificar from './components/ComienzaAPlanificar'
import Footer from './components/Footer'
import Header from './components/Header'
import PropuestaDeValor from './components/PropuestaDeValor'
import Destinos from './components/Destinos'
import Reseñas from './components/Reseñas'
export function App() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Navbar/>
      <main className="flex-1">
        <Header/>
        <PropuestaDeValor/>
        <Destinos/>
        <Reseñas/>
        <ComienzaAPlanificar/>
      </main>
      <Footer />
    </div>
  )
}
export default App;