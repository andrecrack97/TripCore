import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlanificarViaje4.css";

const CURRENCIES = [
  { code: "USD", label: "USD (Dólar estadounidense)", symbol: "$" },
  { code: "EUR", label: "EUR (Euro)", symbol: "€" },
  { code: "ARS", label: "ARS (Peso argentino)", symbol: "$" },
  { code: "BRL", label: "BRL (Real brasileño)", symbol: "R$" },
  { code: "MXN", label: "MXN (Peso mexicano)", symbol: "$" },
  { code: "CLP", label: "CLP (Peso chileno)", symbol: "$" },
  { code: "COP", label: "COP (Peso colombiano)", symbol: "$" },
  { code: "GBP", label: "GBP (Libra esterlina)", symbol: "£" },
  { code: "JPY", label: "JPY (Yen japonés)", symbol: "¥" },
];

// Tasas demo (simple), base USD. Podés reemplazar por lo que te dé tu backend.
const RATES_USD = {
  USD: 1,
  EUR: 0.92,
  ARS: 950,
  BRL: 5.6,
  MXN: 18,
  CLP: 930,
  COP: 4100,
  GBP: 0.78,
  JPY: 156,
};

export default function PlanificarViaje4() {
  const navigate = useNavigate();

  const [total, setTotal] = useState(0);            // presupuesto total
  const [from, setFrom] = useState("USD");          // moneda origen
  const [amount, setAmount] = useState(0);          // monto a convertir
  const [to, setTo] = useState("");                 // moneda destino

  const fromSymbol = useMemo(
    () => CURRENCIES.find(c => c.code === from)?.symbol || "$",
    [from]
  );

  const converted = useMemo(() => {
    if (!to || !amount) return null;
    const usd = amount / (RATES_USD[from] || 1);
    const tgt = usd * (RATES_USD[to] || 1);
    return tgt;
  }, [amount, from, to]);

  return (
    <div className="pv4-wrap">
      {/* Breadcrumb */}
      <div className="pv4-breadcrumb">
        <span className="crumb">Planificador de Viajes</span>
        <span className="sep">›</span>
        <span className="crumb active">4: Elegir presupuesto</span>
      </div>

      {/* Título */}
      <header className="pv4-header">
        <h1>Planea tu próximo viaje</h1>
        <p>
          Define cuánto deseas gastar y cómo distribuirlo. Te ayudaremos a
          optimizar cada parte.
        </p>
      </header>

      {/* Presupuesto total */}
      <section className="pv4-section">
        <h3 className="pv4-section-title">Presupuesto total</h3>

        <div className="pv4-total">
          <span className="pv4-total-symbol">{fromSymbol}</span>
          <input
            className="pv4-total-input"
            type="number"
            min="0"
            value={total}
            onChange={(e) => setTotal(Number(e.target.value))}
          />
          <span className="pv4-total-code">{from}</span>
        </div>

        <small className="pv4-help">
          Este será el monto total que planeas gastar en tu viaje.
        </small>
      </section>

      {/* Conversor */}
      <section className="pv4-section pv4-converter">
        <h3 className="pv4-section-title">Conversor de moneda</h3>

        <div className="pv4-conv-grid">
          <label className="pv4-field">
            <span className="pv4-label">Desde</span>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="pv4-select"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="pv4-field pv4-amount">
            <span className="pv4-label">Monto</span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="pv4-input"
            />
          </label>

          <label className="pv4-field">
            <span className="pv4-label">Hacia</span>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="pv4-select"
            >
              <option value="">Elija la moneda local del destino</option>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.label}</option>
              ))}
            </select>
          </label>
        </div>

        <small className="pv4-help">
          Tu presupuesto se convierte a la moneda local del destino
          {to ? `: ${formatCurrency(converted, to)}` : ""}.
        </small>
      </section>

      {/* Consejos inteligentes */}
      <section className="pv4-tips">
        <div className="pv4-tip pv4-tip--blue">
          <div className="pv4-tip-title">
            <span className="pv4-dot pv4-dot--blue" />
            Para viajes culturales
          </div>
          <p>
            Los viajes culturales suelen gastar más en entradas y transporte
            público. Considera comprar city passes que incluyen múltiples
            atracciones.
          </p>
        </div>

        <div className="pv4-tip pv4-tip--green">
          <div className="pv4-tip-title">
            <span className="pv4-dot pv4-dot--green" />
            Gastronomía local
          </div>
          <p>
            Algunos destinos tienen comida callejera económica y deliciosa.
            Investiga mercados locales y pequeños restaurantes alejados de zonas
            turísticas.
          </p>
        </div>
      </section>

      {/* Navegación */}
      <footer className="pv4-footer">
        <button className="btn btn--ghost" onClick={() => navigate("/planificar-viaje/3")}>
          ◀ Anterior
        </button>
        <button
          className="btn btn--primary"
          onClick={() => {
            // Podés persistir en contexto/estado global si lo necesitás:
            // saveBudget({ total, currency: from });
            navigate("/planificar-viaje/5");
          }}
        >
          Siguiente ▶
        </button>
      </footer>
    </div>
  );
}

function formatCurrency(value, code) {
  if (value == null || Number.isNaN(value)) return "";
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value).toLocaleString("es-AR")} ${code}`;
  }
}
