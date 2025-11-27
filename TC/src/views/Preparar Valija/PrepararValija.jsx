import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PrepararValija.css";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

// Packing suggestion engine (rule-based, data-driven from trip)
function generatePackingSuggestions(trip) {
  const start = new Date(trip.fecha_inicio);
  const end = new Date(trip.fecha_fin);
  const numDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

  const destination = [
    trip.destino,
    trip.ciudad,
    trip.pais,
    trip.titulo,
  ].filter(Boolean).join(" ").toLowerCase();

  const activities = Array.isArray(trip.actividades) ? trip.actividades.map(a => (a.nombre || a.title || "").toLowerCase()) : [];

  const isBeach = /playa|beach|mar|cancun|puntacana|rio|miami|ibiza|mallorca|tulum/.test(destination);
  const isCold = /ushuaia|bariloche|patagonia|alaska|canad[aá]|oslo|reykjavik|neuqu[eé]n|montreal|suecia|noruega|finlandia|andorra|chile/.test(destination);
  const isCity = /par[ií]s|paris|londres|madrid|roma|new york|buenos aires|berl[ií]n|tokyo|tokio|barcelona|lisboa|praga|viena/.test(destination);
  const isHike = activities.some(a => /trek|hike|sender|monta[nñ]a|trail/.test(a));
  const isSnow = activities.some(a => /ski|snow|snowboard|esqu[ií]/.test(a)) || /ski|nevados|andorra|valle nevado|bariloche/.test(destination);
  const isBoat = activities.some(a => /barco|crucero|boat|sail/.test(a));
  const isMuseum = activities.some(a => /museo|museum|art/.test(a));

  const perDay = (base, min = 1, max = 10) => Math.min(max, Math.max(min, Math.ceil(base * numDays)));

  const categories = [];

  // Ropa
  const ropa = [];
  ropa.push({ text: `Remeras frescas (${perDay(0.5, 2)}u)`, key: "remeras" });
  ropa.push({ text: `Ropa interior (${perDay(0.8, 3)}u)`, key: "ropa_interior" });
  ropa.push({ text: `Medias (${perDay(0.8, 3)}u)`, key: "medias" });
  ropa.push({ text: `Pantalón/bermuda (${perDay(0.25, 1)}u)`, key: "pantalon" });
  ropa.push({ text: `Abrigo liviano`, key: "abrigo_liviano", hint: isCold ? "llevar 2" : undefined });
  if (isCold || isSnow) {
    ropa.push({ text: "Campera térmica", key: "campera_termica" });
    ropa.push({ text: "Buzo térmico", key: "buzo_termico" });
    ropa.push({ text: "Guantes", key: "guantes" });
    ropa.push({ text: "Gorro y bufanda", key: "gorro_bufanda" });
    ropa.push({ text: "Medias térmicas", key: "medias_termicas" });
  }
  if (isBeach || isBoat) {
    ropa.push({ text: `Malla de baño (${perDay(0.2, 1)}u)`, key: "malla" });
    ropa.push({ text: "Ojotas/Sandalias", key: "ojotas" });
    ropa.push({ text: "Sombrero o gorra", key: "sombrero" });
  }
  if (isCity || isMuseum) ropa.push({ text: "Ropa formal para cena", key: "formal" });

  categories.push({ id: "ropa", title: "Ropa", items: ropa });

  // Higiene y cuidado
  const higiene = [
    { text: "Protector solar", key: "protector", important: isBeach || isBoat },
    { text: "Lentes de sol", key: "lentes" },
    { text: "Cepillo y pasta dental", key: "dental" },
    { text: "Desodorante", key: "desodorante" },
    { text: "Kit de afeitar / maquillaje", key: "kit_cuidado" },
  ];
  if (isHike || isSnow) higiene.push({ text: "Protector labial", key: "protector_labial" });
  categories.push({ id: "higiene", title: "Higiene y cuidado", items: higiene });

  // Salud
  const salud = [
    { text: "Medicamentos personales", key: "medicamentos" },
    { text: "Seguro médico impreso/digital", key: "seguro_medico" },
    { text: "Botiquín básico", key: "botiquin" },
  ];
  categories.push({ id: "salud", title: "Salud", items: salud });

  // Extras por actividades
  const extras = [
    { text: "Cámara o celular con buena cámara", key: "camara" },
    { text: "Cargadores y adaptadores", key: "cargadores" },
    { text: "Mochila de día", key: "mochila_dia" },
  ];
  if (isHike) extras.push({ text: "Botella reutilizable / Camelback", key: "agua" });
  if (isSnow) extras.push({ text: "Gafas de ski y ropa impermeable", key: "ski_gafas" });
  if (isBoat || isBeach) extras.push({ text: "Toallón de playa", key: "toallon" });
  categories.push({ id: "extras", title: "Extras para actividades", items: extras });

  return { categories, numDays };
}

export default function PrepararValija() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trip, setTrip] = useState(null);
  const [customItems, setCustomItems] = useState({});
  const [checked, setChecked] = useState({});
  const [removedItems, setRemovedItems] = useState(new Set());
  const token = (() => { try { return localStorage.getItem("token"); } catch { return null; } })();
  const effectiveId = useMemo(() => {
    if (idParam) return idParam;
    try {
      const cached = localStorage.getItem('lastTripId');
      return cached || null;
    } catch {
      return null;
    }
  }, [idParam]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!effectiveId) throw new Error("Falta el id del viaje");
        const [res, resChk] = await Promise.all([
          fetch(`${API_BASE}/api/viajes/${effectiveId}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          }),
          fetch(`${API_BASE}/api/viajes/${effectiveId}/valija`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          })
        ]);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        let checklist = [];
        if (resChk.ok) {
          const js = await resChk.json().catch(() => ({}));
          checklist = Array.isArray(js.items) ? js.items : [];
        }
        if (mounted) setTrip({ ...normalizeTrip(data), checklist });
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [effectiveId, token]);

  const { categories, numDays } = useMemo(() => {
    if (!trip) return { categories: [], numDays: 0 };
    if (Array.isArray(trip.checklist) && trip.checklist.length > 0) {
      const items = trip.checklist.map((r, i) => ({
        text: r.item,
        key: `db_${r.id_valija}_${i}`,
        id_valija: r.id_valija,
        marcado: !!r.marcado,
      }));
      const init = {};
      for (const it of items) init[it.key] = !!it.marcado;
      // set after mount
      setTimeout(() => setChecked((prev) => ({ ...init, ...prev })), 0);
      return { categories: [{ id: "guardada", title: "Tu lista guardada", items }], numDays: 0 };
    }
    const res = generatePackingSuggestions(trip);
    const init = {};
    for (const c of res.categories) for (const it of c.items) init[it.key] = false;
    setTimeout(() => setChecked((prev) => ({ ...init, ...prev })), 0);
    return res;
  }, [trip]);

  const addCustomItem = (catId, text) => {
    if (!text.trim()) return;
    setCustomItems(prev => {
      const list = prev[catId] || [];
      const key = `c_${Date.now()}`;
      // initialize checked as false
      setChecked(c => ({ ...c, [key]: false }));
      return { ...prev, [catId]: [...list, { text, custom: true, key }] };
    });
  };

  const itemsFor = (catId, base) => {
    const extras = customItems[catId] || [];
    // Filtrar items eliminados
    const filteredBase = base.filter(it => !removedItems.has(it.key));
    const filteredExtras = extras.filter(it => !removedItems.has(it.key));
    return [...filteredBase, ...filteredExtras];
  };

  const toggleItem = (key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  //const [removedItems, setRemovedItems] = useState(new Set());

  const removeItem = async (catId, item) => {
    // Marcar el item como eliminado
    setRemovedItems(prev => new Set([...prev, item.key]));
    
    // Si es un item custom, eliminarlo de la lista
    if (item.custom) {
      setCustomItems(prev => {
        const list = (prev[catId] || []).filter(x => x.key !== item.key);
        return { ...prev, [catId]: list };
      });
    }
    
    // Eliminar del estado de checked
    setChecked(prev => {
      const clone = { ...prev };
      delete clone[item.key];
      return clone;
    });
    
    // Si es un item guardado en la BD, eliminarlo también de allí
    if (item.id_valija) {
      try {
        const deleteResp = await fetch(`${API_BASE}/api/viajes/valija/${item.id_valija}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (deleteResp.ok) {
          // Actualizar el trip para reflejar el cambio
          setTrip(prev => {
            if (!prev || !prev.checklist) return prev;
            return {
              ...prev,
              checklist: prev.checklist.filter(c => c.id_valija !== item.id_valija)
            };
          });
        }
      } catch (e) {
        console.error("Error al eliminar item de la BD:", e);
      }
    }
  };

  const handleSave = async () => {
    if (!trip) return;
    const all = [];
    for (const cat of categories) {
      for (const it of itemsFor(cat.id, cat.items)) {
        all.push({ item: it.text, marcado: !!checked[it.key] });
      }
    }
    try {
      const res = await fetch(`${API_BASE}/api/viajes/${trip.id}/valija`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ items: all })
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const ref = await fetch(`${API_BASE}/api/viajes/${trip.id}/valija`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const json = await ref.json().catch(() => ({ items: [] }));
      setTrip(t => t ? { ...t, checklist: json.items } : t);
      alert("Lista guardada correctamente.");
    } catch (e) {
      alert(`No se pudo guardar la lista: ${e.message}`);
    }
  };

  if (loading) {
    return <div className="pv-wrap"><div className="pv-skel" /></div>;
  }
  if (error) {
    return (
      <div className="pv-wrap">
        <div className="pv-error">
          <div>No se pudo cargar el viaje.</div>
          <code>{error}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="pv-wrap">
      <header className="pv-header">
        <div className="pv-head-left">
          <h1>Preparar Valija</h1>
          <div className="pv-trip">
            <div className="pv-trip-title">{trip.title}</div>
            <div className="pv-trip-sub">
              {fmtRange(trip.fecha_inicio, trip.fecha_fin)} • {numDays} {numDays === 1 ? "día" : "días"}
            </div>
            {trip.actividades?.length > 0 && (
              <div className="pv-tags">
                {trip.actividades.slice(0, 3).map(a => (
                  <span key={a.id || a.nombre} className="pv-tag">{a.nombre || a.title}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="pv-head-right">
          <button className="pv-btn" onClick={() => navigate(-1)}>← Volver</button>
          <button className="pv-btn pv-btn--primary" onClick={handleSave}>Guardar Lista</button>
        </div>
      </header>

      <section className="pv-grid">
        {categories.map(cat => (
          <article key={cat.id} className="pv-card">
            <div className="pv-card-title">{cat.title}</div>
            <ul className="pv-list">
              {itemsFor(cat.id, cat.items).map(it => (
                <li key={it.key || it.text} className="pv-item">
                  <label>
                    <input type="checkbox" checked={!!checked[it.key]} onChange={() => toggleItem(it.key)} />
                    <span>{it.text}{it.hint ? ` (${it.hint})` : ""}</span>
                  </label>
                  <button className="pv-trash" title="Eliminar ítem" onClick={() => removeItem(cat.id, it)}>🗑️</button>
                </li>
              ))}
            </ul>
            <AddItem onAdd={(v) => addCustomItem(cat.id, v)} />
          </article>
        ))}
      </section>
    </div>
  );
}

function AddItem({ onAdd }) {
  const [v, setV] = useState("");
  return (
    <div className="pv-add">
      <input
        value={v}
        onChange={e => setV(e.target.value)}
        placeholder="Agregar nuevo ítem"
      />
      <button onClick={() => { onAdd(v); setV(""); }}>＋</button>
    </div>
  );
}

function normalizeTrip(t) {
  const ciudad = t.ciudad || t.destino || t.destino_principal || null;
  const destino = t.destino || ciudad;
  return {
    id: t.id_viaje ?? t.id,
    title: t.titulo ?? t.nombre_viaje ?? [ciudad, t.pais].filter(Boolean).join(", "),
    destino,
    ciudad,
    pais: t.pais ?? null,
    fecha_inicio: t.fecha_inicio ?? t.inicio ?? t.startDate,
    fecha_fin: t.fecha_fin ?? t.fin ?? t.endDate,
    actividades: Array.isArray(t.actividades) ? t.actividades : [],
  };
}

function fmtRange(ini, fin) {
  const opt = { day: "numeric", month: "long" };
  const s = new Date(ini).toLocaleDateString("es-AR", opt);
  const e = new Date(fin).toLocaleDateString("es-AR", opt);
  return `${s} - ${e}`;
}


