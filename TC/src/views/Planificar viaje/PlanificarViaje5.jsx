import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { destinosAppApi } from "../../services/destinosAppApi";
import { viajesApi } from "../../services/viajesApi";
import "./PlanificarViaje5.css";

function diffNights(startISO, endISO) {
  if (!startISO || !endISO) return 0;
  const start = new Date(startISO);
  const end = new Date(endISO);
  const ms = end.getTime() - start.getTime();
  const nights = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  return Number.isFinite(nights) ? nights : 0;
}

export default function PlanificarViaje5() {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
  const nav = useNavigate();
  const location = useLocation();

  const [plan, setPlan] = useState(null);
  const [sug, setSug] = useState(null);
  const [amadeusHotels, setAmadeusHotels] = useState([]); // hoteles Amadeus
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [pick, setPick] = useState({
    transporte_id: null,
    hotel_id: null,
    actividades_ids: [],
  });

  // cargar plan local (NO crear viaje aquí, se crea al guardar)
  useEffect(() => {
    const loadPlan = () => {
      try {
        const raw = localStorage.getItem("planificarViaje");
        if (!raw) return;

        const planData = JSON.parse(raw);
        setPlan(planData);
      } catch (e) {
        console.error("Error al cargar plan:", e);
        setError("Error al cargar el plan del viaje.");
      }
    };
    
    loadPlan();
    
    // Recargar el plan cuando se vuelve de otra página
    const handleFocus = () => {
      const raw = localStorage.getItem("planificarViaje");
      if (raw) {
        try {
          const planData = JSON.parse(raw);
          setPlan(planData);
        } catch (e) {
          console.error("Error al recargar plan:", e);
        }
      }
    };
    
    window.addEventListener('focus', handleFocus);
    // También escuchar cambios en localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'planificarViaje') {
        loadPlan();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const nights = useMemo(
    () =>
      diffNights(
        plan?.fecha_salida || plan?.fechaIda,
        plan?.fecha_vuelta || plan?.fechaVuelta
      ),
    [plan?.fecha_salida, plan?.fecha_vuelta, plan?.fechaIda, plan?.fechaVuelta]
  );

  // Detectar cuando se vuelve de otra página para recargar el plan
  useEffect(() => {
    if (location.state?.reload) {
      // Recargar el plan cuando se vuelve de la página de hoteles
      try {
        const raw = localStorage.getItem("planificarViaje");
        if (raw) {
          const planData = JSON.parse(raw);
          setPlan(planData);
        }
      } catch (e) {
        console.error("Error al recargar plan:", e);
      }
      // Limpiar el estado para evitar recargas infinitas
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // cargar sugerencias (resuelve id si vino de GeoDB) + hoteles Amadeus
  useEffect(() => {
    (async () => {
      if (!plan) return;
      
      // Siempre recargar el plan desde localStorage para asegurar que tenemos la última versión
      let currentPlan = plan;
      try {
        const raw = localStorage.getItem("planificarViaje");
        if (raw) {
          const latestPlan = JSON.parse(raw);
          currentPlan = latestPlan;
          // Actualizar el estado del plan si hay cambios
          if (JSON.stringify(latestPlan) !== JSON.stringify(plan)) {
            setPlan(latestPlan);
          }
        }
      } catch (e) {
        console.warn("No se pudo recargar plan:", e);
      }
      
      try {
        setLoading(true);
        setError("");

        let destinoId = currentPlan.destino?.id;

        // Resolver destino si no tiene ID
        if (!destinoId && currentPlan.destino?.nombre && currentPlan.destino?.pais) {
          try {
            const r = await destinosAppApi.resolve(
              plan.destino.nombre,
              plan.destino.pais
            );
            if (r?.data?.id) {
              destinoId = r.data.id;
              currentPlan = {
                ...currentPlan,
                destino: { ...currentPlan.destino, id: destinoId },
              };
              localStorage.setItem(
                "planificarViaje",
                JSON.stringify(currentPlan)
              );
              setPlan(currentPlan);
            }
          } catch (e) {
            console.warn(
              "No se pudo resolver el destino por nombre/pais:",
              e
            );
          }
        }

        // Si aún no tenemos destinoId, intentar buscar por nombre
        if (!destinoId) {
          const destinoNombre = currentPlan.destino?.nombre || currentPlan.destino?.name;
          if (destinoNombre) {
            try {
              const resp = await fetch(
                `${API_BASE}/api/destinos-app/autocomplete?q=${encodeURIComponent(
                  destinoNombre
                )}&limit=5`
              );
              if (resp.ok) {
                const data = await resp.json();
                const destinoEncontrado = data.data?.find(
                  (d) =>
                    d.nombre?.toLowerCase() ===
                      destinoNombre.toLowerCase() ||
                    d.nombre
                      ?.toLowerCase()
                      .includes(destinoNombre.toLowerCase())
                );
                if (destinoEncontrado?.id) {
                  destinoId = destinoEncontrado.id;
                  currentPlan = {
                    ...currentPlan,
                    destino: { ...currentPlan.destino, id: destinoId },
                  };
                  localStorage.setItem(
                    "planificarViaje",
                    JSON.stringify(currentPlan)
                  );
                  setPlan(currentPlan);
                }
              }
            } catch (e) {
              console.warn("No se pudo buscar destino por autocomplete:", e);
            }
          }
        }

        // Cargar sugerencias usando el destino_id
        if (!destinoId) {
          throw new Error(
            "No se pudo obtener el ID del destino. Por favor, selecciona un destino válido."
          );
        }

        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Endpoint de sugerencias
        const origin = encodeURIComponent(
          (
            currentPlan.origen?.nombre ||
            currentPlan.origen?.name ||
            currentPlan.origen?.ciudad ||
            ""
          ).toString()
        );
        const qs = origin ? `?from=${origin}` : "";
        const resp = await fetch(
          `${API_BASE}/api/destinos-app/${destinoId}/sugerencias${qs}`,
          { headers }
        );
        if (!resp.ok) {
          const errorText = await resp.text();
          console.error("Error en respuesta:", resp.status, errorText);
          throw new Error(`Error al cargar sugerencias: HTTP ${resp.status}`);
        }

        const json = await resp.json();
        console.log("Sugerencias recibidas:", json);

        // Si hay un hotel de Amadeus seleccionado, agregarlo a las sugerencias
        let hotelesList = json.hoteles || [];
        if (currentPlan.hotel_amadeus) {
          const hotelAmadeus = {
            id: currentPlan.hotel_amadeus.id,
            name: currentPlan.hotel_amadeus.name,
            price_night_usd: currentPlan.hotel_amadeus.price_night_usd,
            stars: currentPlan.hotel_amadeus.stars,
            rating: currentPlan.hotel_amadeus.rating,
            address: currentPlan.hotel_amadeus.address,
            image_url: currentPlan.hotel_amadeus.image_url,
            source: 'amadeus'
          };
          // Solo agregar si no existe ya
          if (!hotelesList.some(h => h.id === hotelAmadeus.id)) {
            hotelesList = [...hotelesList, hotelAmadeus];
          }
        }

        // Mapear transportes para asegurar que tengan duration_min si viene duration
        const transportesMapeados = (json.transportes || []).map(t => ({
          ...t,
          duration_min: t.duration_min || t.duration || null
        }));

        setSug({
          transportes: transportesMapeados,
          hoteles: hotelesList,
          actividades: json.actividades || [],
        });

        // Seleccionar el hotel de Amadeus si existe
        if (currentPlan.hotel_amadeus) {
          setPick((p) => ({ ...p, hotel_id: currentPlan.hotel_amadeus.id }));
        }

        // ---------- Hoteles desde API Amadeus (solo París / Barcelona) ----------
        try {
          const destinoNombreLower = (
            currentPlan.destino?.nombre ||
            currentPlan.destino?.name ||
            ""
          ).toLowerCase();

          let amadeusCity = null;
          // Detectar París con diferentes variantes (paris, parís, etc.)
          if (destinoNombreLower.includes("paris") || destinoNombreLower.includes("parís")) {
            amadeusCity = "paris";
          } else if (destinoNombreLower.includes("barcelona")) {
            amadeusCity = "barcelona";
          }

          if (amadeusCity) {
            const respHotels = await fetch(
              `${API_BASE}/api/hoteles?city=${amadeusCity}`
            );
            if (respHotels.ok) {
              const dataHotels = await respHotels.json();
              setAmadeusHotels(
                dataHotels.hotels || dataHotels.data || []
              );
            } else {
              console.warn(
                "No se pudo cargar hoteles de Amadeus:",
                respHotels.status
              );
              setAmadeusHotels([]);
            }
          } else {
            setAmadeusHotels([]);
          }
        } catch (errHotels) {
          console.warn("Error al consultar hoteles de Amadeus:", errHotels);
          setAmadeusHotels([]);
        }
      } catch (e) {
        console.error("Error al cargar sugerencias:", e);
        setError(
          "No se pudieron cargar las sugerencias: " +
            (e.message || "Error desconocido")
        );
        setSug({ transportes: [], hoteles: [], actividades: [] });
        setAmadeusHotels([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [plan, API_BASE]);


  // helpers de selección
  const setTransporte = (id) =>
    setPick((p) => ({ ...p, transporte_id: id }));
  const setHotel = (id) =>
    setPick((p) => ({ ...p, hotel_id: id }));
  const toggleAct = (id) =>
    setPick((p) => ({
      ...p,
      actividades_ids: p.actividades_ids.includes(id)
        ? p.actividades_ids.filter((x) => x !== id)
        : [...p.actividades_ids, id],
    }));

  // subtotales y total
  const transporteSel = sug?.transportes?.find(
    (t) => t.id === pick.transporte_id
  );
  const hotelSel = sug?.hoteles?.find((h) => h.id === pick.hotel_id);
  const actsSel =
    sug?.actividades?.filter((a) =>
      pick.actividades_ids.includes(a.id)
    ) || [];

  const subtTransporte = transporteSel?.price_usd || 0;
  const subtHotel = (hotelSel?.price_night_usd || 0) * nights;
  const subtActiv = actsSel.reduce(
    (acc, a) => acc + (a.price_usd || 0),
    0
  );
  const total = subtTransporte + subtHotel + subtActiv;

  async function guardar() {
    try {
      setSaving(true);
      setError("");

      const presupuestoNumber = Number(
        plan?.presupuesto || plan?.presupuesto_total || 0
      );
      const remaining = presupuestoNumber - total;
      if (Number.isFinite(remaining) && remaining < 0) {
        const msg = `Tu selección supera el presupuesto por USD ${Math.abs(
          remaining
        ).toFixed(2)}. Quita algún item o ajusta tu presupuesto.`;
        setError(msg);
        alert(msg);
        return;
      }

      let id_viaje = plan?.id_viaje;

      if (!id_viaje) {
        const fechaInicio = plan?.fecha_salida || plan?.fechaIda;
        const fechaFin = plan?.fecha_vuelta || plan?.fechaVuelta;
        const destinoNombre =
          plan?.destino?.nombre || plan?.destino?.name || "Destino";
        const presupuesto =
          plan?.presupuesto || plan?.presupuesto_total || null;
        const tipoViaje =
          plan?.travelerType || plan?.tipo_viaje || null;

        if (!fechaInicio || !fechaFin) {
          throw new Error(
            "Faltan fechas del viaje. Por favor, completa los pasos anteriores."
          );
        }

        const nuevoViaje = await viajesApi.create({
          nombre_viaje: `Viaje a ${destinoNombre}`,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          destino_principal: destinoNombre,
          presupuesto_total: presupuesto,
          tipo_viaje: tipoViaje,
          origen_ciudad:
            plan?.origen?.nombre || plan?.origen?.name || null,
          origen_pais:
            plan?.origen?.pais || plan?.origen?.country || null,
        });

        id_viaje =
          nuevoViaje.id_viaje || nuevoViaje.viaje?.id_viaje;
        if (!id_viaje) {
          throw new Error(
            "No se pudo crear el viaje. Por favor, intenta nuevamente."
          );
        }

        const updatedPlan = { ...plan, id_viaje };
        localStorage.setItem(
          "planificarViaje",
          JSON.stringify(updatedPlan)
        );
        setPlan(updatedPlan);
        
        // Si no tenemos destino_id, intentar obtenerlo del viaje creado
        if (!updatedPlan.destino?.id && id_viaje) {
          try {
            const token = localStorage.getItem("token");
            const headers = {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            };
            const tripRes = await fetch(`${API_BASE}/api/viajes/${id_viaje}`, { headers });
            if (tripRes.ok) {
              const tripDetails = await tripRes.json();
              if (tripDetails?.destino_id) {
                updatedPlan.destino = { ...updatedPlan.destino, id: tripDetails.destino_id };
                localStorage.setItem("planificarViaje", JSON.stringify(updatedPlan));
                setPlan(updatedPlan);
              }
            }
          } catch (e) {
            console.warn("No se pudo obtener el destino_id del viaje:", e);
          }
        }
      }

      // Si hay un hotel de Amadeus seleccionado, primero crearlo en la BD
      let hotelIdFinal = pick.hotel_id;
      // Verificar si el hotel seleccionado es de Amadeus
      const isAmadeusHotel = plan?.hotel_amadeus && 
                             pick.hotel_id && 
                             (pick.hotel_id === plan.hotel_amadeus.id || 
                              pick.hotel_id.startsWith('ej-') || 
                              pick.hotel_id.startsWith('hotel-') ||
                              (hotelSel && hotelSel.source === 'amadeus'));
      
      if (isAmadeusHotel && plan.hotel_amadeus) {
        try {
          const hotelAmadeus = plan.hotel_amadeus;
          // Recargar el plan para asegurar que tenemos el destino_id actualizado
          let currentPlan = plan;
          try {
            const raw = localStorage.getItem("planificarViaje");
            if (raw) {
              currentPlan = JSON.parse(raw);
            }
          } catch (e) {
            console.warn("No se pudo recargar plan:", e);
          }
          
          let destinoId = currentPlan.destino?.id;
          const destinoNombre = currentPlan.destino?.nombre || currentPlan.destino?.name;
          const destinoPais = currentPlan.destino?.pais || currentPlan.destino?.country;
          
          // Si aún no tenemos destino_id y tenemos id_viaje, intentar obtenerlo del viaje
          if (!destinoId && id_viaje) {
            try {
              const tripRes = await fetch(`${API_BASE}/api/viajes/${id_viaje}`, {
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
              });
              if (tripRes.ok) {
                const tripDetails = await tripRes.json();
                if (tripDetails?.destino_id) {
                  destinoId = tripDetails.destino_id;
                }
              }
            } catch (e) {
              console.warn("No se pudo obtener el destino_id del viaje:", e);
            }
          }
          
          // Si no hay destino_id, intentar resolverlo primero
          if (!destinoId && destinoNombre) {
            try {
              // Intentar buscar el destino usando autocomplete
              const autocompleteRes = await destinosAppApi.autocomplete({ q: destinoNombre, limit: 5 });
              if (autocompleteRes?.data && Array.isArray(autocompleteRes.data)) {
                // Buscar una coincidencia exacta
                const match = autocompleteRes.data.find(
                  (d) => 
                    d.nombre?.toLowerCase() === destinoNombre.toLowerCase() ||
                    d.name?.toLowerCase() === destinoNombre.toLowerCase()
                );
                if (match?.id) {
                  destinoId = match.id;
                  // Actualizar el plan con el destino resuelto
                  const updatedPlan = { ...plan, destino: { ...plan.destino, id: destinoId } };
                  localStorage.setItem("planificarViaje", JSON.stringify(updatedPlan));
                  setPlan(updatedPlan);
                }
              }
            } catch (resolveError) {
              console.warn("No se pudo resolver el destino automáticamente:", resolveError);
            }
          }

          // Crear el hotel en la BD
          const token = localStorage.getItem("token");
          const headers = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          };

          const createHotelResp = await fetch(`${API_BASE}/api/hoteles`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              name: hotelAmadeus.name,
              destino_id: destinoId || null,
              destino_nombre: destinoNombre || null,
              destino_pais: destinoPais || null,
              stars: hotelAmadeus.stars || null,
              rating: hotelAmadeus.rating || null,
              price_night_usd: hotelAmadeus.price_night_usd || null,
              address: hotelAmadeus.address || null,
              image_url: hotelAmadeus.image_url || null,
              link_url: null
            })
          });

          if (!createHotelResp.ok) {
            const errorText = await createHotelResp.text();
            console.error("Error al crear hotel:", errorText);
            throw new Error(`Error al crear hotel en la base de datos: ${createHotelResp.status}`);
          }

          const hotelCreated = await createHotelResp.json();
          hotelIdFinal = hotelCreated.hotel?.id || hotelCreated.id;
          
          if (!hotelIdFinal) {
            throw new Error("No se recibió el ID del hotel creado.");
          }

          console.log(`✅ Hotel de Amadeus creado en BD con ID: ${hotelIdFinal}`);
        } catch (hotelError) {
          console.error("Error al crear hotel de Amadeus:", hotelError);
          throw new Error(`No se pudo guardar el hotel: ${hotelError.message}`);
        }
      }

      await viajesApi.patch(id_viaje, {
        ...pick,
        hotel_id: hotelIdFinal, // Usar el ID del hotel creado en la BD
        presupuesto_total:
          plan?.presupuesto || plan?.presupuesto_total || null,
        origen_ciudad:
          plan?.origen?.nombre || plan?.origen?.name || null,
        origen_pais:
          plan?.origen?.pais || plan?.origen?.country || null,
      });

      await viajesApi.confirm(id_viaje);

      localStorage.removeItem("planificarViaje");
      nav("/MisViajes");
    } catch (e) {
      console.error("Error al guardar:", e);
      setError(
        e.message ||
          "Error al guardar el itinerario. Por favor, intenta nuevamente."
      );
      alert(
        e.message ||
          "Error al guardar el itinerario. Por favor, intenta nuevamente."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!plan) return null;

  const destinoNombre =
    plan.destino?.nombre || plan.destino?.name || "-";
  const origenNombre =
    plan.origen?.nombre || plan.origen?.name || "-";
  const presupuesto = Number(
    plan.presupuesto || plan.presupuesto_total || 0
  );

  const destinoLower = destinoNombre.toLowerCase();
  let amadeusCity = null;
  // Detectar París con diferentes variantes (paris, parís, etc.)
  if (destinoLower.includes("paris") || destinoLower.includes("parís")) {
    amadeusCity = "paris";
  } else if (destinoLower.includes("barcelona")) {
    amadeusCity = "barcelona";
  }

  return (
    <div className="pv5-bg">
      <div className="pv5-card">
        <div className="pv5-breadcrumbs">
          <span className="muted">Planificador de Viajes</span>
          <span className="sep">›</span>
          <span className="crumb-active">
            Paso 5: Sugerencias Inteligentes
          </span>
        </div>

        <h1 className="pv5-title">Sugerencias Inteligentes</h1>

        {/* Resumen */}
        <div className="pv5-summary">
          <div className="pv5-summary-item">
            <strong>Origen</strong>
            <span>{origenNombre}</span>
          </div>
          <div className="pv5-summary-item">
            <strong>Destino</strong>
            <span>{destinoNombre}</span>
          </div>
          <div className="pv5-summary-item">
            <strong>Fechas</strong>
            <span>
              {plan.fecha_salida || plan.fechaIda || "-"} →{" "}
              {plan.fecha_vuelta || plan.fechaVuelta || "-"}
            </span>
          </div>
          <div className="pv5-summary-item">
            <strong>Presupuesto</strong>
            <span>USD {presupuesto.toLocaleString()}</span>
          </div>
        </div>

        {loading && <p className="muted">Cargando sugerencias…</p>}
        {error && <p className="pv5-error">{error}</p>}
        {saving && <p className="muted">Guardando itinerario…</p>}

        {!loading && !error && sug && (
          <>
            {/* Transporte */}
            <section className="pv5-section">
              <h2>Transporte sugerido</h2>
              {sug.transportes && sug.transportes.length > 0 ? (
                sug.transportes.map((t) => (
                <div key={t.id} className="pv5-transport">
                  <div>
                    <b>{t.provider}</b> —{" "}
                    {t.kind === "flight" ? "Vuelo" : t.kind}
                    <div className="muted">
                      {t.from_city || t.origen || t.from || "-"} → {t.to_city || t.destino || t.to || "-"}
                      {((t.duration || t.duration_min) && (
                        ` (${Math.round(((t.duration || t.duration_min || 0) / 60) || 0)}h)`
                      ))}
                    </div>
                  </div>
                  <div className="pv5-price">
                    USD {t.price_usd || t.precio || 0}
                  </div>
                  <button
                    onClick={() => setTransporte(t.id)}
                    className="pv5-btn-small"
                    style={{
                      background:
                        pick.transporte_id === t.id
                          ? "#5800db"
                          : "var(--tc-primary)",
                    }}
                  >
                    {pick.transporte_id === t.id
                      ? "Seleccionado"
                      : "Reservar"}
                  </button>
                </div>
              ))
              ) : (
                <p className="muted">No hay transportes disponibles para este destino.</p>
              )}
            </section>

            {/* Hoteles */}
            <section className="pv5-section">
              <h2>Alojamiento recomendado</h2>
              <div className="pv5-grid">
                {sug.hoteles?.map((h) => {
                  const sel = pick.hotel_id === h.id;
                  return (
                    <div
                      key={h.id}
                      className="pv5-hotel-card"
                      style={{
                        border: sel
                          ? "2px solid var(--tc-primary)"
                          : "1px solid var(--tc-border)",
                      }}
                    >
                      <img
                        src={h.image_url}
                        alt={h.name}
                        loading="lazy"
                      />
                      <div className="pv5-hotel-body">
                        <h3>{h.name}</h3>
                        <p>
                          {h.stars ?? ""}★ —{" "}
                          {Number.isFinite(Number(h.rating))
                            ? Number(h.rating).toFixed(1)
                            : "-"}
                        </p>
                        <div className="pv5-price">
                          USD {h.price_night_usd} / noche · {nights} noche
                          {nights === 1 ? "" : "s"}
                        </div>
                        <div className="pv5-price muted">
                          Subtotal: USD{" "}
                          {(h.price_night_usd || 0) * nights}
                        </div>
                        <button
                          className="pv5-btn-small"
                          onClick={() => setHotel(h.id)}
                          style={{
                            background: sel
                              ? "#5800db"
                              : "var(--tc-primary)",
                          }}
                        >
                          {sel ? "Seleccionado" : "Reservar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón Ver más hoteles (nueva página con filtros) */}
              {amadeusCity && (
                <div className="pv5-ver-mas-hoteles">
                  <Link
                    to={`/hoteles/${amadeusCity}`}
                    className="pv5-btn-small pv5-btn-outline"
                  >
                    Ver más hoteles de{" "}
                    {amadeusCity === "paris" ? "París" : "Barcelona"}
                  </Link>
                </div>
              )}
            </section>

            {/* Actividades */}
            <section className="pv5-section">
              <h2>Actividades sugeridas</h2>
              <div className="pv5-grid">
                {sug.actividades?.map((a) => {
                  const sel = pick.actividades_ids.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      className="pv5-activity-card"
                      style={{
                        border: sel
                          ? "2px solid var(--tc-primary)"
                          : "1px solid var(--tc-border)",
                      }}
                    >
                      <img
                        src={a.image_url}
                        alt={a.title}
                        loading="lazy"
                      />
                      <div className="pv5-activity-body">
                        <h3>{a.title}</h3>
                        <p className="muted">
                          {a.duration_hours} h · USD {a.price_usd}
                        </p>
                        <button
                          onClick={() => toggleAct(a.id)}
                          className="pv5-btn-small"
                          style={{
                            background: sel
                              ? "#5800db"
                              : "var(--tc-primary)",
                          }}
                        >
                          {sel ? "Agregada" : "Agregar al itinerario"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Presupuesto */}
            <section className="pv5-section">
              <h2>Resumen de presupuesto</h2>
              <div className="pv5-budget">
                <div>Transporte: USD {subtTransporte}</div>
                <div>
                  Alojamiento: USD {subtHotel}{" "}
                  <span className="muted">
                    ( {nights} noche{nights === 1 ? "" : "s"} )
                  </span>
                </div>
                <div>Actividades: USD {subtActiv}</div>
                <hr />
                <strong>Total estimado: USD {total}</strong>
                <span className="muted">
                  Quedan USD {(presupuesto - total).toFixed(2)} de tu
                  presupuesto
                </span>
              </div>
            </section>

            {/* Mapa placeholder */}
            <section className="pv5-section">
              <h2>Mapa interactivo</h2>
              <div className="pv5-map">
                <p className="muted">🗺️ Vista previa del itinerario</p>
              </div>
            </section>
          </>
        )}

        {/* Acciones */}
        <div className="pv5-actions">
          <Link to="/planificar/4" className="pv5-back">
            ← Anterior
          </Link>
          <button
            className="pv5-confirm"
            onClick={guardar}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar itinerario"}
          </button>
        </div>
      </div>
    </div>
  );
}
