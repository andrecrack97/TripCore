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
import PlanificarViaje1 from './views/Planificar viaje/PlanificarViaje1';
import PlanificarViaje2 from './views/Planificar viaje/PlanificarViaje2';
import PlanificarViaje3 from './views/Planificar viaje/PlanificarViaje3';
import PlanificarViaje4 from './views/Planificar viaje/PlanificarViaje4';
import PlanificarViaje5 from './views/Planificar viaje/PlanificarViaje5';
import MisViajes from './views/Mis viajes/MisViajes';
import Perfil from './views/Perfil/Perfil';


import RequireAuth from './components/RequireAuth';

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
          <Route path="/registro" element={<Registro />} />
          <Route path="/perfil" element={<Perfil/>} />
          <Route
            path="/planificar"
            element={
              <RequireAuth>
                <PlanificarViaje1 />
              </RequireAuth>
            }
          />
          <Route
            path="/planificar/2"
            element={
              <RequireAuth>
                <PlanificarViaje2 />
              </RequireAuth>
            }
          />
          <Route
            path="/planificar/3"
            element={
              <RequireAuth>
                <PlanificarViaje3 />
              </RequireAuth>
            }
          />
          <Route
            path="/planificar/4"
            element={
              <RequireAuth>
                <PlanificarViaje4 />
              </RequireAuth>
            }
          />
          <Route
            path="/planificar/5"
            element={
              <RequireAuth>
                <PlanificarViaje5 />
              </RequireAuth>
            }
          />
          <Route
            path="/MisViajes"
            element={
              <RequireAuth>
                <MisViajes/>
              </RequireAuth>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
export default App;
