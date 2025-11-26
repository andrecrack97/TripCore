import React, { useState, useEffect } from "react";
import { fetchHoteles } from "../../services/api";  // Asegúrate de que esté importado correctamente

function HotelesPreview() {
  const [hoteles, setHoteles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerHoteles = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchHoteles("paris");  // Aquí definís "paris" o "barcelona"
        setHoteles(data.hotels || []);
      } catch (err) {
        setError("Error al cargar los hoteles");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    obtenerHoteles();
  }, []); // Este array vacío significa que la llamada se hace solo una vez al cargar el componente

  if (loading) return <p>Cargando hoteles...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Hoteles recomendados</h2>
      <ul>
        {hoteles.map((hotel) => (
          <li key={hotel.id}>
            <strong>{hotel.name}</strong>
            <br />
            {hotel.cityCode} - {hotel.latitude}, {hotel.longitude}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HotelesPreview;
