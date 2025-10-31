import React, { useEffect, useMemo, useRef, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { destinosAppApi } from "../services/destinosAppApi";  // catálogo curado (tu BD)        // GeoDB (fallback)
import "./AutoDestinoGeo.css";

/**
 * Props:
 * - label?: string
 * - placeholder?: string
 * - defaultValue?: { id, name, country, region }
 * - countryIds?: "AR,BR,US"  (afecta solo al fallback GeoDB)
 * - onSelect: (cityObj) => void
 */
function AutoDestinoGeo({
  label,
  placeholder = "Países, ciudades etc",
  defaultValue = null,
  countryIds,
  onSelect,
}) {
  const [query, setQuery] = useState(defaultValue?.name || "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const debounced = useDebounce(query, 300);
  const wrapRef = useRef(null);

  // si viene un defaultValue desde afuera, reflejarlo en el input
  useEffect(() => {
    if (defaultValue?.name) setQuery(defaultValue.name);
  }, [defaultValue?.name]);

  const showDropdown = useMemo(
    () => open && query.trim().length >= 2,
    [open, query]
  );

  // cerrar dropdown al click afuera
  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) {
      setItems([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);

      // Llamamos a AMBAS fuentes en paralelo y combinamos
      const tasks = [
        // catálogo curado (tu BD)
        destinosAppApi
          .autocomplete({ q, limit: 8 })
          .then((res) => {
            const list = (res?.data || []).map((d) => ({
              source: "app",
              id: d.id,
              name: d.nombre,
              country: d.pais,
              region: d.region,
            }));
            console.log("[AutoDestino] app/autocomplete OK:", list);
            return list;
          })
          .catch((e) => {
            console.warn("[AutoDestino] app/autocomplete ERROR:", e);
            return [];
          }),

        // GeoDB fallback (solo ciudades grandes)
        destinosApi
          .searchCities({
            q,
            countryIds,
            limit: 8,
            major: true, // fuerza pisos altos en el backend
          })
          .then((res) => {
            const list = (res?.data || []).map((c) => ({
              source: "geodb",
              id: c.id,
              name: c.name || c.city,
              country: c.country,
              region: c.region,
            }));
            console.log("[AutoDestino] geodb/search OK:", list);
            return list;
          })
          .catch((e) => {
            console.warn("[AutoDestino] geodb/search ERROR:", e);
            return [];
          }),
      ];

      const results = await Promise.all(tasks);
      let combined = [...results[0]];

      // Si el catálogo trajo poco, completamos con GeoDB hasta 8
      if (combined.length < 8) {
        const room = 8 - combined.length;
        combined = combined.concat(results[1].slice(0, room));
      }

      if (!cancelled) setItems(combined);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced, countryIds]);

  function handlePick(city) {
    setQuery(formatCity(city));
    setOpen(false);
    onSelect?.(city);
  }

  function formatCity(c) {
    const parts = [c.name, c.region, c.country];
    return parts.filter(Boolean).join(", ");
  }

  return (
    <div className="dest-autocomplete" ref={wrapRef}>
      {label && <label className="dest-label">{label}</label>}
      <input
        type="text"
        className="dest-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        aria-autocomplete="list"
        aria-expanded={showDropdown ? "true" : "false"}
      />
      {showDropdown && (
        <div className="dest-dropdown" role="listbox">
          {loading && <div className="dest-item muted">Buscando...</div>}
          {!loading && items.length === 0 && (
            <div className="dest-item muted">Sin resultados</div>
          )}
          {!loading &&
            items.map((c, idx) => (
              <button
                type="button"
                key={`${c.source}-${c.id}-${idx}`}
                className="dest-item"
                onClick={() => handlePick(c)}
              >
                <div className="dest-item-title">{formatCity(c)}</div>
                {c.source === "geodb" && (
                  <div className="dest-item-sub">Sugerencia externa</div>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default AutoDestinoGeo;
