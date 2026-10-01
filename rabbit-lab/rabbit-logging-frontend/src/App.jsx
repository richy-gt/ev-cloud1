import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:8081/api/orders';
const customers = ['Juan Perez', 'Maria Garcia', 'Carlos Lopez'];

function App() {
  const [orders, setOrders] = useState([]);
  const [connection, setConnection] = useState('Conectando');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const [statusResponse, ordersResponse] = await Promise.all([
          fetch(`${API_URL}/status`),
          fetch(API_URL),
        ]);
        if (!statusResponse.ok || !ordersResponse.ok) throw new Error('Backend no disponible');
        const [statusData, ordersData] = await Promise.all([
          statusResponse.json(),
          ordersResponse.json(),
        ]);
        if (active) {
          setConnection(statusData.rabbitmq === 'Conectado' ? 'Servicios conectados' : 'RabbitMQ desconectado');
          setOrders(ordersData);
        }
      } catch {
        if (active) setConnection('Backend desconectado');
      }
    };

    refresh();
    const interval = window.setInterval(refresh, 1500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const sendOrder = async (customerName, forceFailure = false) => {
    setSending(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, forceFailure }),
      });
      if (!response.ok) throw new Error('No se pudo enviar la orden');
      const order = await response.json();
      setOrders((current) => [order, ...current.filter((item) => item.orderId !== order.orderId)]);
    } catch {
      setError('No se pudo enviar la orden. Comprueba que RabbitMQ y el backend estén activos.');
    } finally {
      setSending(false);
    }
  };

  const processed = orders.filter((order) => order.status === 'PROCESADA').length;
  const failed = orders.filter((order) => order.status === 'FALLIDA (DLQ)').length;
  const retrying = orders.filter((order) => ['ENVIADA', 'PROCESANDO', 'REINTENTANDO'].includes(order.status)).length;

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Panel de órdenes">
          <span className="brand-mark">O</span>
          <span>ORDENES<span className="brand-light"> / DLQ</span></span>
        </a>
        <div className={`connection ${connection === 'Servicios conectados' ? 'is-online' : 'is-offline'}`}>
          <span className="connection-dot" />{connection}
        </div>
      </header>

      <section className="intro" id="inicio">
        <p className="eyebrow">RabbitMQ · Procesamiento resiliente</p>
        <h1>Centro de órdenes</h1>
        <p>Seguimiento de entregas, reintentos y mensajes en cuarentena.</p>
      </section>

      {failed > 0 && (
        <aside className="alert" aria-live="polite">
          <strong>{failed} {failed === 1 ? 'orden requiere' : 'órdenes requieren'} revisión</strong>
          <span>Se agotaron los reintentos y llegaron a la DLQ.</span>
        </aside>
      )}

      {error && <p className="error-banner" role="alert">{error}</p>}

      <section className="send-panel" aria-labelledby="send-title">
        <div>
          <p className="eyebrow">Nueva actividad</p>
          <h2 id="send-title">Enviar una orden</h2>
          <p>Los fallos se reintentan automáticamente hasta tres veces.</p>
        </div>
        <div className="actions">
          {customers.map((customer) => (
            <button key={customer} className="button button-primary" disabled={sending} onClick={() => sendOrder(customer)}>
              {customer}
            </button>
          ))}
          <button className="button button-danger" disabled={sending} onClick={() => sendOrder('Cliente de prueba DLQ', true)}>
            Probar fallo / DLQ
          </button>
        </div>
      </section>

      <section className="metrics" aria-label="Resumen de órdenes">
        <article className="metric">
          <span className="metric-label">Total de órdenes</span>
          <strong>{orders.length}</strong>
          <span className="metric-note">registradas en esta sesión</span>
        </article>
        <article className="metric metric-success">
          <span className="metric-label">Procesadas</span>
          <strong>{processed}</strong>
          <span className="metric-note">confirmadas por el consumidor</span>
        </article>
        <article className="metric metric-waiting">
          <span className="metric-label">En proceso</span>
          <strong>{retrying}</strong>
          <span className="metric-note">pendientes o reintentando</span>
        </article>
        <article className="metric metric-failed">
          <span className="metric-label">En DLQ</span>
          <strong>{failed}</strong>
          <span className="metric-note">requieren análisis</span>
        </article>
      </section>

      <section className="history" aria-labelledby="history-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Actualización cada 1,5 segundos</p>
            <h2 id="history-title">Historial de órdenes</h2>
          </div>
          <span className="order-count">{orders.length} registros</span>
        </div>
        {orders.length === 0 ? (
          <p className="empty-state">Aún no hay órdenes. Envía una para iniciar la prueba.</p>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <article className="order-row" key={order.orderId}>
                <div className="order-main">
                  <strong className="order-id">{order.orderId}</strong>
                  <span className={`status status-${order.status === 'PROCESADA' ? 'success' : order.status === 'FALLIDA (DLQ)' ? 'failed' : 'pending'}`}>
                    {order.status}
                  </span>
                  <span className="order-customer">{order.customerName}</span>
                </div>
                <div className="order-meta">
                  <span>{order.attempts} {order.attempts === 1 ? 'intento' : 'intentos'}</span>
                  <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleTimeString('es-CL')}</time>
                </div>
                {order.lastError && <p className="order-error">{order.lastError}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
      <footer className="footer">RabbitMQ Management: <a href="http://localhost:15672" target="_blank" rel="noreferrer">localhost:15672</a></footer>
    </main>
  );
}

export default App;
