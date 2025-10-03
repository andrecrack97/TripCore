// components/AutoDestinoGeo.jsx
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function AutoDestinoGeo({ label = 'Elegir destino', onSelect }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const abortRef = useRef();

  useEffect(() => {
    if (!q || q.length < 2) { setItems([]); return; }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      try {
        const { data } = await axios.get('/api/destinos/geo', {
          params: { q, limit: 8, minPop: 20000 },
          signal: controller.signal,
        });
        setItems(data);
        setOpen(true);
      } catch (e) {
        if (e.name !== 'CanceledError') console.error(e);
      }
    }, 250); // debounce

    return () => clearTimeout(t);
  }, [q]);

  const handleSelect = (item) => {
    setQ(`${item.nombre}, ${item.pais}`);
    setOpen(false);
    onSelect?.(item);
  };

  return (
    <div style={{ position: 'relative' }}>
      <label className="block font-semibold mb-2">{label}</label>
      <input
        className="w-full rounded-xl border px-4 py-3 outline-none"
        placeholder="Países, ciudades etc"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && items.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 max-h-64 overflow-auto rounded-xl border bg-white shadow">
          {items.map((it) => (
            <li
              key={it.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(it)}
            >
              <div className="font-medium">{it.nombre}</div>
              <div className="text-sm text-gray-500">
                {it.pais} {it.extra?.countryCode ? `· ${it.extra.countryCode}` : ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
