import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Perfil.css";
import { UserContext } from "../../context/UserContext.jsx";
import { fetchUserTrips, updateMe, fetchMe, toggleFavoriteTrip } from "../../services/profile.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function Perfil() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("historial");
  const { user, setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", idioma: "Español", moneda: "USD - Dólar", pais: "", password: "", notificaciones: true });
  const [tripsState, setTripsState] = useState([]);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetchMe();
        // map a la forma previa
        const normalized = {
          id: me.id_usuario || me.id || me.idUsuario || me.id_usuario,
          nombre: me.fullName || me.nombre || "",
          email: me.email || "",
          pais: (me.locationCity && me.locationCountry) ? `${me.locationCity}, ${me.locationCountry}` : (me.locationCountry || me.pais || ""),
          idioma: me.language || me.idioma || "Español",
          moneda_preferida: me.currency || me.moneda_preferida || "USD",
          tripsCount: me.tripsCount || 0,
          countriesCount: me.countriesCount || 0,
        };
        setUser(normalized);
        try { localStorage.setItem("user", JSON.stringify(normalized)); } catch (_) {}
        setForm({
          nombre: normalized.nombre,
          email: normalized.email,
          pais: normalized.pais,
          idioma: normalized.idioma,
          moneda: normalized.moneda_preferida,
          notificaciones: me.notifications ?? true,
        });
      } catch (_) {}
      try {
        const trips = await fetchUserTrips("history", 1, 12);
        setTripsState(trips);
      } catch { setTripsState([]); }
    };
    load();
  }, []);

  const trips = tripsState;
  const countriesCount = useMemo(() => {
    const s = new Set(trips.map(t => (t.destino_principal || t.pais || "").toString().trim()).filter(Boolean));
    return s.size;
  }, [trips]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    try { localStorage.removeItem("token"); } catch (_) {}
    try { localStorage.removeItem("user"); } catch (_) {}
    try { localStorage.removeItem("usuario"); } catch (_) {}
    setUser(null);
    navigate("/login");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        fullName: form.nombre,
        email: form.email,
        language: form.idioma,
        currency: form.moneda,
        password: form.password || undefined,
        notifications: form.notificaciones,
        // password: opcional -> si agregás un campo de password aquí
      };
      const updated = await updateMe(payload);
      const normalized = {
        id: updated.id_usuario || updated.id,
        nombre: updated.nombre || updated.fullName,
        email: updated.email,
        pais: updated.pais || user?.pais || "",
        idioma: updated.idioma || updated.language,
        moneda_preferida: updated.moneda_preferida || updated.currency,
      };
      setUser(normalized);
      try { localStorage.setItem("user", JSON.stringify(normalized)); } catch (_) {}
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
          <button className="tc-profile__edit" onClick={handleLogout} style={{ background: '#eef0ff', color: '#494f7d' }}>Cerrar sesión</button>
            <div className="tc-profile__stats">
            <div><strong>{user?.tripsCount ?? trips.length}</strong><span>Viajes</span></div>
            <div><strong>{user?.countriesCount ?? countriesCount}</strong><span>Países</span></div>
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
                  <img src={t.img || "/assets/miami.avif"} alt={t.ciudad} />
                  <button className="tc-card__fav" aria-label="favorito" onClick={() => toggleFavoriteTrip(t.id)}>♡</button>
                </div>
                <div className="tc-card__body">
                  <div className="tc-card__title">{t.ciudad}</div>
                  <div className="tc-card__subtitle">{t.pais}</div>
                  <div className="tc-card__line">
                    <span className="tc-card__date">{t.fecha || `${t.fecha_inicio || ""} - ${t.fecha_fin || ""}`}</span>
                    <span className="tc-card__rating">★ {(t.rating || 4.6).toFixed ? (t.rating || 4.6).toFixed(1) : 4.6}</span>
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
              <div className="input-con-icono" style={{ position: 'relative' }}>
                <input name="password" type={showPass ? 'text' : 'password'} placeholder="Contraseña" value={form.password} onChange={handleChange} disabled={!isEditing} />
                <FontAwesomeIcon
                  icon={showPass ? faEyeSlash : faEye}
                  onClick={() => setShowPass(v => !v)}
                  className="icono-ojo"
                  style={{ position: 'absolute', right: 10, top: 10, cursor: 'pointer' }}
                />
              </div>
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
              <input type="checkbox" checked={!!form.notificaciones} onChange={(e) => setForm(prev => ({ ...prev, notificaciones: e.target.checked }))} disabled={!isEditing} />
              <span>Notificaciones</span>
            </label>

            <button className="tc-panel__save" disabled={!isEditing || saving} onClick={handleSave}>{saving ? "Guardando..." : "Guardar cambios"}</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
