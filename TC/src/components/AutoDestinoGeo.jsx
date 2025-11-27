import React, { useEffect, useMemo, useRef, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { destinosAppApi } from "../services/destinosAppApi";  // catálogo curado
import { destinosApi } from "../services/destinosApi";        // GeoDB (fallback)
import "./AutoDestinoGeo.css";

/**
 * Props:
 * - label?: string
 * - placeholder?: string
 * - defaultValue?: { id, name, country, region }
 * - countryIds?: "AR,BR,US"  (solo afecta al fallback GeoDB)
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

  useEffect(() => {
    if (defaultValue?.name) setQuery(defaultValue.name);
  }, [defaultValue?.name]);

  const showDropdown = useMemo(() => open && query.trim().length >= 2, [open, query]);

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

      const [appList, geoList] = await Promise.all([
        destinosAppApi
          .autocomplete({ q, limit: 8 })
          .then((res) => (res?.data || []).map((d) => ({
            source: "app",
            id: d.id,
            name: d.nombre,
            country: d.pais,
            region: d.region,
          })))
          .catch(() => []),

        destinosApi
          .searchCities({ q, countryIds, limit: 8, major: true })
          .then((res) => (res?.data || []).map((c) => ({
            source: "geodb",
            id: c.id,
            name: c.name || c.city,
            country: c.country,
            region: c.region,
          })))
          .catch(() => []),
      ]);

      // App primero; si falta, completo con GeoDB hasta 8
      let combined = [...appList];
      if (combined.length < 8) combined = combined.concat(geoList.slice(0, 8 - combined.length));
      if (!cancelled) setItems(combined);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [debounced, countryIds]);

  function handlePick(city) {
    const formatted = formatCity(city);
    setQuery(formatted);
    setOpen(false);
    // Llamar a onSelect inmediatamente con el objeto completo
    if (onSelect) {
      onSelect(city);
    }
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
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        aria-autocomplete="list"
        aria-expanded={showDropdown ? "true" : "false"}
      />
      {showDropdown && (
        <div className="dest-dropdown" role="listbox">
          {loading && <div className="dest-item muted">Buscando...</div>}
          {!loading && items.length === 0 && <div className="dest-item muted">Sin resultados</div>}
          {!loading && items.map((c, idx) => (
            <button
              type="button"
              key={`${c.source}-${c.id}-${idx}`}
              className="dest-item"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePick(c);
              }}
            >
              <div className="dest-item-title">{formatCity(c)}</div>
              {c.source === "geodb" && <div className="dest-item-sub">Sugerencia externa</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AutoDestinoGeo;
