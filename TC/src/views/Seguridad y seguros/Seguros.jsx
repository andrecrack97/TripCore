import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSegurosPlanes, fetchAlertasSanitarias } from '../../services/api';
import './Seguros.css';

function Badge({ children }) {
  return <span className="sg-badge">{children}</span>;
}

function PlanCard({ item, selected, onSelect }) {
  const price = useMemo(() => {
    const n = Number(item.precio_mensual || 0);
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: item.moneda || 'USD', maximumFractionDigits: 0 }).format(n);
  }, [item]);
  return (
    <button className={`sg-plan ${selected ? 'is-selected' : ''}`} onClick={() => onSelect?.(item)}>
      {item.recomendado && <div className="sg-reco">Recomendado</div>}
      <div className="sg-plan-head">
        <div className="sg-plan-brand">{item.compania}</div>
        <div className="sg-plan-name">{item.plan}</div>
      </div>
      <div className="sg-plan-price"><strong>{price}</strong> <span>/ mes</span></div>
      <ul className="sg-plan-covers">
        {(item.coberturas || []).slice(0, 6).map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    </button>
  );
}

function AlertItem({ a }) {
  const riskClass = a.nivel_riesgo === 3 ? 'risk-high' : a.nivel_riesgo === 2 ? 'risk-mid' : 'risk-low';
  return (
    <div className={`sg-alert ${riskClass}`}>
      <div className="sg-alert-flag">{a.pais_iso2}</div>
      <div className="sg-alert-body">
        <div className="sg-alert-title">{a.titulo}</div>
        <div className="sg-alert-desc">{a.descripcion}</div>
      </div>
      {a.etiqueta_ui && <Badge>{a.etiqueta_ui}</Badge>}
    </div>
  );
}

export default function Seguros() {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [activeTab, setActiveTab] = useState('compare'); // compare | alerts | medical
  const [search, setSearch] = useState('');
  const [onlyReco, setOnlyReco] = useState(false);
  const [maxPrecio, setMaxPrecio] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const selected = useMemo(() => planes.find(p => p.id_plan === selectedPlanId), [planes, selectedPlanId]);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, a] = await Promise.all([
          fetchSegurosPlanes({}),
          fetchAlertasSanitarias(),
        ]);
        setPlanes(p);
        setAlertas(a);
        if (p?.length) setSelectedPlanId(p[0].id_plan);
      } catch (e) {
        console.error('Error cargando seguros', e);
      }
    };
    load();
  }, []);

  const onFilter = async () => {
    const p = await fetchSegurosPlanes({ search, recomendado: onlyReco, maxPrecio });
    setPlanes(p);
    if (!p.find(x => x.id_plan === selectedPlanId)) setSelectedPlanId(p[0]?.id_plan ?? null);
  };

  // Debounce filters (search/onlyReco/maxPrecio)
  useEffect(() => {
    const id = setTimeout(() => { onFilter(); }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, onlyReco, maxPrecio]);

  const onClear = () => {
    setSearch('');
    setOnlyReco(false);
    setMaxPrecio('');
  };

  const onEnter = (e) => {
    if (e.key === 'Enter') onFilter();
  };

  const handleContract = () => {
    // Redirige a planificar para continuar el flujo de contratación
    navigate('/planificar');
  };

  return (
    <div className="sg-wrap">
      <header className="sg-hero">
        <div className="sg-hero-icon">🛡️</div>
        <h1>Seguridad y Seguros</h1>
        <p>Todo lo que necesitás para viajar tranquilo y protegido, en un solo lugar.</p>
        <nav className="sg-tabs">
          <button className={activeTab === 'compare' ? 'is-active' : ''} onClick={() => setActiveTab('compare')}>Comparar Seguros</button>
          <button className={activeTab === 'alerts' ? 'is-active' : ''} onClick={() => setActiveTab('alerts')}>Alertas Sanitarias</button>
          <button className={activeTab === 'medical' ? 'is-active' : ''} onClick={() => setActiveTab('medical')}>Seguro Médico</button>
        </nav>
      </header>

      {activeTab === 'compare' && (
      <section className="sg-grid">
        <div className="sg-grid-header">
          <div>
            <h2>Compará seguros de viaje de compañías reconocidas</h2>
            <p>Encontrá la mejor cobertura para tu próxima aventura</p>
          </div>
          <div className="sg-filters">
            <input placeholder="Buscar por destino..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={onEnter} />
            <input placeholder="Precio máx" value={maxPrecio} onChange={e => setMaxPrecio(e.target.value)} onKeyDown={onEnter} />
            <label className="sg-checkbox">
              <input type="checkbox" checked={onlyReco} onChange={e => setOnlyReco(e.target.checked)} />
              Solo recomendados
            </label>
            <button onClick={onFilter}>Filtrar</button>
            <button onClick={onClear} className="sg-link">Limpiar</button>
          </div>
        </div>

        <div className="sg-plans">
          {planes.map(p => (
            <PlanCard key={p.id_plan} item={p} selected={p.id_plan === selectedPlanId} onSelect={() => setSelectedPlanId(p.id_plan)} />
          ))}
        </div>
      </section>
      )}

      <section className="sg-panels">
        {(activeTab === 'alerts' || activeTab === 'compare') && (
          <div className="sg-panel">
            <div className="sg-panel-title">Alertas sanitarias activas</div>
            <div className="sg-alerts">
              {(showAllAlerts ? alertas : alertas.slice(0, 3)).map(a => (
                <AlertItem key={a.id_alerta} a={a} />
              ))}
            </div>
            {alertas.length > 3 && (
              <button className="sg-link" onClick={() => setShowAllAlerts(v => !v)}>
                {showAllAlerts ? 'Ver menos' : 'Ver todas las alertas'}
              </button>
            )}
          </div>
        )}

        {(activeTab === 'medical' || activeTab === 'compare') && (
          <div className="sg-panel">
            <div className="sg-panel-title">Seguro médico internacional</div>
            <p>Viajá tranquilo sabiendo que tenés la mejor cobertura médica internacional, con asistencia las 24 horas en todo el mundo.</p>
            <ul className="sg-benefits">
              <li>🌐 Cobertura Global</li>
              <li>🕒 Atención 24/7</li>
              <li>🦠 COVID-19 incluido</li>
            </ul>
            {selected && (
              <button className="sg-cta" onClick={handleContract}>Contratar {selected.plan} ahora</button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}


