import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ComienzaAPlanificar from './components/ComienzaAPlanificar';
import Footer from './components/Footer';
import Header from './components/Header';
import PropuestaDeValor from './components/PropuestaDeValor';
import Destinos from './components/Destinos';
import Reseñas from './components/Reseñas';
import Login from './views/Login/Login';
import Registro from './views/Registro/Registro';
import PlanificarViaje from "./views/Planificar viaje/PlanificarViaje";

export function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <PropuestaDeValor />
                <Destinos />
                <Reseñas />
                <ComienzaAPlanificar />
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro/>}/>
          <Route path="/planificar" element={<PlanificarViaje/>}/>
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
