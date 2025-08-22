import React, { useState } from "react";
import "./Perfil.css";

export default function Perfil() {
  const [activeTab, setActiveTab] = useState("historial");

  // Datos de ejemplo para las cards
  const trips = [
    { id: 1, ciudad: "Cancún", pais: "México", fecha: "22 - 29 Ago 2023", rating: 4.8, img: "/assets/cancun.jpg" },
    { id: 2, ciudad: "Barcelona", pais: "España", fecha: "3 - 10 Jun 2023", rating: 4.5, img: "/assets/barcelona.jpg" },
    { id: 3, ciudad: "París", pais: "Francia", fecha: "8 - 16 May 2023", rating: 4.0, img: "/assets/paris.jpg" },
    { id: 4, ciudad: "Nueva York", pais: "Estados Unidos", fecha: "7 - 14 Mar 2023", rating: 4.7, img: "/assets/ny.jpg" },
    { id: 5, ciudad: "Bali", pais: "Indonesia", fecha: "5 - 15 Dic 2022", rating: 4.3, img: "/assets/bali.jpg" },
    { id: 6, ciudad: "Pekín", pais: "China", fecha: "22 - 29 Sep 2022", rating: 3.5, img: "/assets/beijing.jpg" },
  ];

  return (
    <div className="tc-profile">
      {/* Header */}
      <div className="tc-profile__header">
        <div className="tc-profile__user">
          <img className="tc-profile__avatar" src="/assets/avatar.png" alt="avatar" />
          <div>
            <h2 className="tc-profile__name">Heraclito Canionni</h2>
            <div className="tc-profile__meta">
              <span>heraclitocanionni@gmail.com</span>
              <span className="tc-profile__dot">•</span>
              <span>Buenos Aires, Argentina</span>
            </div>
          </div>
        </div>

        <div className="tc-profile__actions">
          <button className="tc-profile__edit">Editar Perfil</button>
          <div className="tc-profile__stats">
            <div><strong>24</strong><span>Viajes</span></div>
            <div><strong>12</strong><span>Paises</span></div>
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
              <input type="text" defaultValue="Heraclito Canionni" />
            </label>

            <label className="tc-field">
              <span>Correo electrónico</span>
              <input type="email" defaultValue="heraclitocanionni@gmail.com" />
            </label>

            <label className="tc-field">
              <span>Contraseña</span>
              <input type="password" defaultValue="********" />
            </label>

            <label className="tc-field">
              <span>Idioma</span>
              <select defaultValue="Español">
                <option>Español</option>
                <option>English</option>
                <option>Português</option>
              </select>
            </label>

            <label className="tc-field">
              <span>Moneda</span>
              <select defaultValue="ARS - Peso Argentino">
                <option>ARS - Peso Argentino</option>
                <option>USD - Dólar</option>
                <option>EUR - Euro</option>
              </select>
            </label>

            <label className="tc-switch">
              <input type="checkbox" defaultChecked />
              <span>Notificaciones</span>
            </label>

            <button className="tc-panel__save">Guardar cambios</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
