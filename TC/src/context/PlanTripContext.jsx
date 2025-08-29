import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { createAPI } from "../services/api";

// Asumo que ya tenés AuthContext con {user, token}
import { useAuth } from "./UserContext"; // ajustá la ruta si difiere

const PlanTripContext = createContext(null);
export const usePlanTrip = () => useContext(PlanTripContext);

export default function PlanTripProvider({ children, initialTripId }) {
  const { token } = useAuth();
  const api = useMemo(() => createAPI(), []);
  const [tripId, setTripId] = useState(initialTripId || null);
  const [trip, setTrip] = useState(null);  // cache simple

  // Si ya hay tripId, cargamos datos
  useEffect(() => {
    if (!tripId) return;
    (async () => {
      try { setTrip(await api.get(`/api/trips/${tripId}`, { token })); }
      catch (e) { console.error("Load trip:", e.message); }
    })();
  }, [tripId, token, api]);

  const ensureTrip = async () => {
    if (tripId) return tripId;
    // crea borrador si no existe
    const created = await api.post("/api/trips", {}, { token });
    setTripId(created.tripId);
    return created.tripId;
  };

  // Paso 3
  const saveProfile = async ({ travelerType, age, groupMode }) => {
    const id = await ensureTrip();
    const saved = await api.put(`/api/trips/${id}/profile`, { travelerType, age, groupMode }, { token });
    setTrip((t) => ({ ...(t || {}), ...saved }));
    return id;
  };

  // Paso 4
  const saveBudget = async ({ amount, currency }) => {
    const id = await ensureTrip();
    const saved = await api.put(`/api/trips/${id}/budget`, { amount, currency }, { token });
    setTrip((t) => ({ ...(t || {}), ...saved }));
    return id;
  };

  // Paso 5
  const getSuggestions = async (id = tripId) =>
    api.get(`/api/trips/${id}/suggestions`, { token });

  const saveSelections = async ({ transport, accommodation, activities }) => {
    const id = await ensureTrip();
    await api.put(`/api/trips/${id}/selections`, { transport, accommodation, activities }, { token });
    return id;
  };

  const value = {
    tripId, setTripId, trip, setTrip,
    saveProfile, saveBudget, getSuggestions, saveSelections,
  };
  return <PlanTripContext.Provider value={value}>{children}</PlanTripContext.Provider>;
}
