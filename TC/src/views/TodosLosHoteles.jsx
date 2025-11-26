import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchHoteles } from "../../services/api";  // Asegúrate de que esté importado correctamente
import "./TodosLosHoteles.css";

function TodosLosHoteles() {
  const { destino } = useParams(); // Extraemos el destino desde la URL
  const navigate = useNavigate();

  const [hoteles, setHoteles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({
    estrellas: 0,  // 0 = sin filtro
    maxPrice: 1000,  // Por ejemplo, un máximo de precio
  });

  useEffect(() => {
    const cargarHoteles = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchHoteles(destino);
        setHoteles(data.hotels || []);
      } catch (err) {
        setError("Error al cargar los hoteles.");
      } finally {
        setLoading(false);
      }
    };

    cargarHoteles();
  }, [destino]);

  // Filtros
  const aplicarFiltros = () => {
    return hoteles.filter(hotel => {
      const cumpleEstrellas = filtros.estrellas
        ? hotel.stars >= filtros.estrellas
        : true;
      const cumplePrecio = hotel.price_night_usd <= filtros.maxPrice;
      return cumpleEstrellas && cumplePrecio;
    });
  };

  const hotelesFiltrados = aplicarFiltros();

  return (
    <div className="todos-hoteles">
      <h1>Hoteles en {destino}</h1>

      {/* Filtros */}
      <div className="filtros">
        <label>
          Estrellas:
          <select
            value={filtros.estrellas}
            onChange={(e) => setFiltros({ ...filtros, estrellas: +e.target.value })}
          >
            <option value={0}>Sin filtro</option>
            <option value={3}>3 estrellas o más</option>
            <option value={4}>4 estrellas o más</option>
            <option value={5}>5 estrellas</option>
          </select>
        </label>

        <label>
          Precio máximo (USD):
          <input
            type="number"
            value={filtros.maxPrice}
            onChange={(e) => setFiltros({ ...filtros, maxPrice: +e.target.value })}
            min="0"
          />
        </label>
      </div>

      {loading && <p>Cargando hoteles...</p>}
      {error && <p>{error}</p>}

      <div className="hotel-lista">
        {hotelesFiltrados.map((hotel) => (
          <div key={hotel.id} className="hotel-card">
            <h3>{hotel.name}</h3>
            <p>{hotel.cityCode}</p>
            <p>{hotel.stars} estrellas</p>
            <p>USD {hotel.price_night_usd} / noche</p>
          </div>
        ))}
      </div>

      {hotelesFiltrados.length === 0 && !loading && <p>No se encontraron hoteles que coincidan con los filtros.</p>}
    </div>
  );
}

export default TodosLosHoteles;
