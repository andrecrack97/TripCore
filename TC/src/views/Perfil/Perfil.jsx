import React, { useContext, useEffect, useMemo, useState } from "react";
import "./Perfil.css";
import { UserContext } from "../../context/UserContext.jsx";
import { fetchUserTrips, updateUser, fetchUserDetails } from "../../services/profile.js";

export default function Perfil() {
  const [activeTab, setActiveTab] = useState("historial");
  const { user, setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", idioma: "Español", moneda: "USD - Dólar", pais: "" });
  const [tripsState, setTripsState] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const fresh = await fetchUserDetails(user.id);
        setUser(fresh);
        try { localStorage.setItem("user", JSON.stringify(fresh)); } catch (_) {}
        setForm({
          nombre: fresh?.nombre || "",
          email: fresh?.email || "",
          pais: fresh?.pais || "",
          idioma: fresh?.idioma || "Español",
          moneda: fresh?.moneda_preferida || "USD - Dólar",
        });
      } catch (_) {
        // si falla, usamos lo que ya teníamos
        setForm({
          nombre: user?.nombre || user?.name || "",
          email: user?.email || "",
          pais: user?.pais || "",
          idioma: user?.idioma || "Español",
          moneda: user?.moneda_preferida || "USD - Dólar",
        });
      }
      try {
        const trips = await fetchUserTrips(user.id);
        setTripsState(trips);
      } catch { setTripsState([]); }
    };
    load();
  }, [user?.id]);

  const trips = tripsState;
  const countriesCount = useMemo(() => {
    const s = new Set(trips.map(t => (t.destino_principal || t.pais || "").toString().trim()).filter(Boolean));
    return s.size;
  }, [trips]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        email: form.email,
        pais: form.pais,
        idioma: form.idioma,
        moneda_preferida: form.moneda,
      };
      const updated = await updateUser(user.id, payload);
      setUser(updated);
      try { localStorage.setItem("user", JSON.stringify(updated)); } catch (_) {}
      setIsEditing(false);
    } catch (err) {
      alert(err.message || "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tc-profile">
      {/* Header */}
      <div className="tc-profile__header">
        <div className="tc-profile__user">
          <img className="tc-profile__avatar" src="/assets/avatar.png" alt="avatar" />
          <div>
            <h2 className="tc-profile__name">{user?.nombre || user?.name || user?.email || "Usuario"}</h2>
            <div className="tc-profile__meta">
              <span>{user?.email || ""}</span>
              {user?.pais && <span className="tc-profile__dot">•</span>}
              {user?.pais && <span>{user.pais}</span>}
            </div>
          </div>
        </div>

        <div className="tc-profile__actions">
          {!isEditing ? (
            <button className="tc-profile__edit" onClick={() => setIsEditing(true)}>Editar Perfil</button>
          ) : (
            <button className="tc-profile__edit" disabled={saving} onClick={handleSave}>{saving ? "Guardando..." : "Guardar"}</button>
          )}
          <div className="tc-profile__stats">
            <div><strong>{trips.length}</strong><span>Viajes</span></div>
            <div><strong>{countriesCount}</strong><span>Países</span></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="tc-profile__content">
        {/* Main */}
        <div className="tc-profile__main">
          {/* Tabs */}
          <div className="tc-profile__tabs">
            <button
              className={`tc-profile__tab ${activeTab === "historial" ? "is-active" : ""}`}
              onClick={() => setActiveTab("historial")}
            >
              Historial
            </button>
            <button
              className={`tc-profile__tab ${activeTab === "favoritos" ? "is-active" : ""}`}
              onClick={() => setActiveTab("favoritos")}
            >
              Favoritos
            </button>
            <button
              className={`tc-profile__tab ${activeTab === "planeados" ? "is-active" : ""}`}
              onClick={() => setActiveTab("planeados")}
            >
              Planeados
            </button>
          </div>

          {/* Grid */}
          <div className="tc-profile__grid">
            {trips.length === 0 && (
              <div className="tc-empty">Todavía no hay viajes para mostrar</div>
            )}
            {trips.map((t) => (
              <article key={t.id} className="tc-card">
                <div className="tc-card__media">
                  <img src={t.img} alt={t.ciudad} />
                  <button className="tc-card__fav" aria-label="favorito">♡</button>
                </div>
                <div className="tc-card__body">
                  <div className="tc-card__title">{t.ciudad}</div>
                  <div className="tc-card__subtitle">{t.pais}</div>
                  <div className="tc-card__line">
                    <span className="tc-card__date">{t.fecha}</span>
                    <span className="tc-card__rating">★ {t.rating.toFixed(1)}</span>
                  </div>
                  <button className="tc-card__cta">Ver detalles</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="tc-profile__aside">
          <div className="tc-panel">
            <div className="tc-panel__title">Configuración personal</div>

            <label className="tc-field">
              <span>Nombre completo</span>
              <input name="nombre" type="text" value={form.nombre} onChange={handleChange} disabled={!isEditing} />
            </label>

            <label className="tc-field">
              <span>Correo electrónico</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} disabled={!isEditing} />
            </label>

            <label className="tc-field">
              <span>Contraseña</span>
              <input name="password" type="password" placeholder="••••••••" onChange={handleChange} disabled={!isEditing} />
            </label>

            <label className="tc-field">
              <span>Idioma</span>
              <select name="idioma" value={form.idioma} onChange={handleChange} disabled={!isEditing}>
                <option value="Español">Español</option>
                <option value="English">English</option>
                <option value="Português">Português</option>
              </select>
            </label>

            <label className="tc-field">
              <span>Moneda</span>
              <select name="moneda" value={form.moneda} onChange={handleChange} disabled={!isEditing}>
                <option value="USD - Dólar">USD - Dólar</option>
                <option value="ARS - Peso Argentino">ARS - Peso Argentino</option>
                <option value="EUR - Euro">EUR - Euro</option>
              </select>
            </label>

            <label className="tc-field">
              <span>País</span>
              <input name="pais" type="text" value={form.pais} onChange={handleChange} disabled={!isEditing} />
            </label>

            <label className="tc-switch">
              <input type="checkbox" defaultChecked />
              <span>Notificaciones</span>
            </label>

            <button className="tc-panel__save" disabled={!isEditing || saving} onClick={handleSave}>{saving ? "Guardando..." : "Guardar cambios"}</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
