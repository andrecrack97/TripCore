import React, { useEffect, useMemo, useRef, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { destinosApi } from "../services/destinosapi";
import "./DestinationAutocomplete.css";

/**
 * Props:
 * - label: string
 * - placeholder?: string
 * - defaultValue?: { id, name, country, region }
 * - countryIds?: "AR,BR,US"  (opcional)
 * - onSelect: (cityObj) => void
 */
export default function DestinationAutocomplete({
  label,
  placeholder = "Escribí una ciudad...",
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

  const showDropdown = useMemo(() => open && query.trim().length >= 2, [open, query]);

  useEffect(() => {
    // click fuera para cerrar
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await destinosApi.searchCities({
          q: debounced,
          countryIds,
          limit: 8,
          minPopulation: 10000,
        });
        if (!cancelled) setItems(data?.data || []);
      } catch (e) {
        if (!cancelled) setItems([]);
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debounced, countryIds]);

  function handlePick(city) {
    setQuery(formatCity(city));
    setOpen(false);
    onSelect?.(city);
  }

  function formatCity(c) {
    const parts = [c.city || c.name, c.region, c.country];
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
          {!loading && items.length === 0 && (
            <div className="dest-item muted">Sin resultados</div>
          )}
          {!loading &&
            items.map((c) => (
              <button
                type="button"
                key={c.id}
                className="dest-item"
                onClick={() => handlePick({
                  id: c.id,
                  name: c.name || c.city,
                  country: c.country,
                  region: c.region,
                  latitude: c.latitude,
                  longitude: c.longitude,
                  population: c.population
                })}
              >
                <div className="dest-item-title">{formatCity(c)}</div>
                <div className="dest-item-sub">Población: {c.population?.toLocaleString?.() ?? "-"}</div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
