import React, { useEffect, useState } from "react";
import { ofertasApi } from "../../services/ofertasApi";
import "./Ofertas.css";

function mapTipoUIToAPI(t) {
  switch (t) {
    case "Vuelos": return "flight";
    case "Hoteles": return "hotel";
    case "Paquetes": return "package";
    default: return undefined; // "Todos"
  }
}

function daysLeft(finaliza_en) {
  if (!finaliza_en) return null;
  const ms = new Date(finaliza_en).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Normaliza la oferta del backend a la forma que espera la UI.
 * Soporta varias formas de respuesta (con join de destino o sin él).
 */
function mapOffer(o) {
  if (!o) return null;

  // Posibles nombres que puede traer el destino y país
  const destino = o.destino_nombre || o.destino || o.titulo?.split(",")[0] || "";
  const pais = o.pais || o.destino_pais || o.titulo?.split(",")[1]?.trim() || "";

  const priceOriginal = o.price_original_usd ?? o.precio_original ?? null;
  const priceNow = o.price_usd ?? o.precio_descuento ?? o.precio ?? 0;

  // Descuento: usar el calculado en BD o calcular acá
  const descuento =
    o.descuento_pct ??
    (priceOriginal && priceOriginal > 0
      ? Math.round(((priceOriginal - priceNow) / priceOriginal) * 100)
      : null);

  return {
    id: o.id,
    imagen: o.image_url || o.imagen || o.hero_image_url || "/placeholder.jpg",
    destino,
    pais,
    descuento,
    verificada: Boolean(o.verificada),
    rating: o.rating ?? null,
    precio_original: priceOriginal,
    precio_descuento: priceNow,
    dias: o.dias ?? null,
    noches: o.noches ?? null,
    dias_restantes: daysLeft(o.finaliza_en),
    link_url: o.link_url || "#",
    destacada: Boolean(o.destacada),
    // Guarda los originales por si los necesitás
    _raw: o,
  };
}

function Ofertas() {
  const [destacadas, setDestacadas] = useState([]);
  const [ultimaHora, setUltimaHora] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [busquedaDestino, setBusquedaDestino] = useState("");
  const [busquedaFechas, setBusquedaFechas] = useState("");

  useEffect(() => {
    console.log("✅ Componente Ofertas montado, cargando ofertas...");
    loadOfertas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo]);

  async function loadOfertas() {
    try {
      setLoading(true);
      console.log("🔄 Cargando ofertas...");

      const params = {
        tipo: mapTipoUIToAPI(filtroTipo),
        destino: busquedaDestino || undefined,
        fechas: busquedaFechas || undefined,
      };

      console.log("📤 Parámetros de búsqueda:", params);

      const res = await ofertasApi.getAll(params);
      console.log("📥 Respuesta de API:", res);

      // La API puede devolver:
      //  A) { destacadas: [...], ultima_hora: [...] }
      //  B) un array plano con todas las ofertas
      //  C) { items: [...]} o { rows: [...] }
      const all =
        Array.isArray(res) ? res
        : Array.isArray(res?.items) ? res.items
        : Array.isArray(res?.rows) ? res.rows
        : null;

      let d, u;

      if (Array.isArray(res?.destacadas) || Array.isArray(res?.ultima_hora)) {
        d = res.destacadas || [];
        u = res.ultima_hora || [];
        console.log(`✅ Encontradas ${d.length} ofertas destacadas y ${u.length} de última hora`);
      } else if (all) {
        // Si vino todo junto, separamos en cliente
        d = all.filter((o) => o.destacada);
        u = all
          .filter((o) => o.finaliza_en)
          .sort((a, b) => new Date(a.finaliza_en) - new Date(b.finaliza_en))
          .slice(0, 6);
        console.log(`✅ Procesadas ${d.length} ofertas destacadas y ${u.length} de última hora desde array`);
      } else {
        d = [];
        u = [];
        console.log("⚠️ No se encontraron ofertas en la respuesta");
      }

      if ((!d || d.length === 0) && Array.isArray(res?.items)) {
        d = res.items.slice(0, 6);
        console.log(`ℹ️ Usando items como destacadas (${d.length})`);
      }

      if ((!u || u.length === 0) && Array.isArray(res?.items)) {
        u = res.items
          .filter((o) => o.finaliza_en)
          .sort((a, b) => new Date(a.finaliza_en || 0) - new Date(b.finaliza_en || 0))
          .slice(0, 6);
        console.log(`ℹ️ Usando items como ultima hora (${u.length})`);
      }

      setDestacadas(d.map(mapOffer).filter(Boolean));
      setUltimaHora(u.map(mapOffer).filter(Boolean));
      console.log("✅ Estado actualizado correctamente");
    } catch (error) {
      console.error("❌ Error al cargar ofertas:", error);
      console.error("❌ Detalles del error:", error.message, error.stack);
      // No fallar si hay error, simplemente mostrar arrays vacíos
      setDestacadas([]);
      setUltimaHora([]);
    } finally {
      setLoading(false);
      console.log("🏁 Carga de ofertas finalizada");
    }
  }

  function handleBuscar() {
    loadOfertas();
  }

  function handleFiltroTipo(tipo) {
    setFiltroTipo(tipo);
  }

  console.log("🎨 Renderizando componente Ofertas. Loading:", loading, "Destacadas:", destacadas.length, "Última hora:", ultimaHora.length);

  return (
    <div className="ofertas-page">
      <div className="ofertas-hero">
        <div className="ofertas-container">
          <h1 className="ofertas-title">Ofertas Exclusivas</h1>
          <p className="ofertas-description">
            Descubre nuestras mejores promociones, descuentos especiales y paquetes exclusivos para que disfrutes de tu próximo viaje al mejor precio.
          </p>

          <div className="ofertas-search-bar">
            <input
              type="text"
              className="ofertas-search-input"
              placeholder="¿A dónde quieres ir?"
              value={busquedaDestino}
              onChange={(e) => setBusquedaDestino(e.target.value)}
            />
            <input
              type="text"
              className="ofertas-search-input"
              placeholder="Fechas"
              value={busquedaFechas}
              onChange={(e) => setBusquedaFechas(e.target.value)}
            />
            <button className="ofertas-search-btn" onClick={handleBuscar}>
              <span className="ofertas-search-icon"></span>
              Buscar ofertas
            </button>
          </div>

          <div className="ofertas-filters">
            <button className="ofertas-filter-btn">Filtros</button>
            <button
              className={`ofertas-filter-btn ${filtroTipo === "Todos" ? "active" : ""}`}
              onClick={() => handleFiltroTipo("Todos")}
            >
              Todos
            </button>
            <button
              className={`ofertas-filter-btn ${filtroTipo === "Vuelos" ? "active" : ""}`}
              onClick={() => handleFiltroTipo("Vuelos")}
            >
              Vuelos
            </button>
            <button
              className={`ofertas-filter-btn ${filtroTipo === "Hoteles" ? "active" : ""}`}
              onClick={() => handleFiltroTipo("Hoteles")}
            >
              Hoteles
            </button>
            <button
              className={`ofertas-filter-btn ${filtroTipo === "Paquetes" ? "active" : ""}`}
              onClick={() => handleFiltroTipo("Paquetes")}
            >
              Paquetes
            </button>
          </div>
        </div>
      </div>

      <div className="ofertas-content">
        <div className="ofertas-container">
          {loading ? (
            <p className="ofertas-loading">Cargando ofertas...</p>
          ) : (
            <>
              <section className="ofertas-section">
                <div className="ofertas-section-header">
                  <h2 className="ofertas-section-title">Ofertas destacadas de la semana</h2>
                  <div className="ofertas-section-nav">
                    <button className="ofertas-nav-btn">‹</button>
                    <button className="ofertas-nav-btn">›</button>
                  </div>
                </div>
                <div className="ofertas-grid">
                  {destacadas.length === 0 ? (
                    <p className="ofertas-empty">No hay ofertas destacadas.</p>
                  ) : (
                    destacadas.map((oferta) => <OfertaCard key={oferta.id} oferta={oferta} />)
                  )}
                </div>
              </section>

              <section className="ofertas-section">
                <div className="ofertas-section-header">
                  <h2 className="ofertas-section-title">Ofertas de última hora</h2>
                  <a href="#" className="ofertas-ver-todas">Ver todas →</a>
                </div>
                <div className="ofertas-grid">
                  {ultimaHora.length === 0 ? (
                    <p className="ofertas-empty">No hay ofertas de última hora.</p>
                  ) : (
                    ultimaHora.map((oferta) => <OfertaCard key={oferta.id} oferta={oferta} />)
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OfertaCard({ oferta }) {
  const rating = oferta.rating ? Number(oferta.rating).toFixed(1) : "—";

  return (
    <article className="oferta-card">
      <div className="oferta-card-image">
        <img
          src={oferta.imagen}
          alt={`${oferta.destino} ${oferta.pais ? `(${oferta.pais})` : ""}`}
          onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
        />
        {oferta.descuento != null && (
          <div className="oferta-badge">-{oferta.descuento}%</div>
        )}
        <button className="oferta-fav-btn">♡</button>
        {oferta.verificada && (
          <div className="oferta-verificada">
            <span className="oferta-check">✓</span>
            Oferta verificada
          </div>
        )}
        {oferta.rating && (
          <div className="oferta-rating">
            <span className="oferta-star">⭐</span>
            {rating}
          </div>
        )}
      </div>
      <div className="oferta-card-body">
        <h3 className="oferta-destino">
          {oferta.destino}{oferta.pais ? `, ${oferta.pais}` : ""}
        </h3>
        <div className="oferta-precio">
          {oferta.precio_original ? (
            <span className="oferta-precio-original">${oferta.precio_original}</span>
          ) : null}
          <span className="oferta-precio-descuento">${oferta.precio_descuento}</span>
        </div>
        {(oferta.dias || oferta.noches) && (
          <div className="oferta-duracion">
            {oferta.dias ?? 0} días / {oferta.noches ?? 0} noches
          </div>
        )}
        {oferta.dias_restantes != null && (
          <div className="oferta-countdown">
            <span className="oferta-flame">🔥</span>
            {oferta.dias_restantes === 0
              ? "Finaliza hoy"
              : `Finaliza en ${oferta.dias_restantes} días`}
          </div>
        )}
        <a href={oferta.link_url || "#"} className="oferta-ver-detalles">Ver detalles</a>
        <button className="oferta-reservar-btn">Reservar ahora</button>
      </div>
    </article>
  );
}

export default Ofertas;