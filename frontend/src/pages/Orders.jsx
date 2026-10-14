import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../services/api';

const INR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

const statusColor = {
  PLACED:          { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
  PENDING_PAYMENT: { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
  CONFIRMED:       { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd' },
  SHIPPED:         { bg: '#f5f3ff', color: '#7c3aed', border: '#c4b5fd' },
  DELIVERED:       { bg: '#f0fdf4', color: '#059669', border: '#6ee7b7' },
};

function OrderCard({ order }) {
  const navigate = useNavigate();
  const s = statusColor[order.status] || { bg: 'var(--bg-subtle)', color: 'var(--text)', border: 'var(--border)' };
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div
      id={`order-card-${order._id}`}
      style={{
        background: 'var(--bg-white)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        padding: 24,
        boxShadow: 'var(--shadow-xs)',
        transition: 'var(--t-spring)',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/order-success/${order._id}`)}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>ORDER</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>
            #{order._id.slice(-8).toUpperCase()}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{date}</p>
        </div>
        <span style={{
          background: s.bg, color: s.color,
          border: `1px solid ${s.border}`,
          fontSize: 11, fontWeight: 700, padding: '4px 10px',
          borderRadius: 'var(--r-full)',
        }}>
          {order.status}
        </span>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
        {order.items.slice(0, 3).map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 13, color: 'var(--text-secondary)',
          }}>
            <span style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name} × {item.quantity}
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{INR(item.price * item.quantity)}</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid var(--border)', paddingTop: 12,
      }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
          {INR(order.totalAmount)}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 600, color: 'var(--primary)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          View Details →
        </span>
      </div>
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchOrders = async () => {
    setLoading(true); setError('');
    try {
      const res = await getMyOrders();
      setOrders(res.data.orders);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login', { replace: true });
      else setError("We couldn't load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="products-page" id="orders-page">

      {/* Header */}
      <div className="products-page-header anim-fade-up">
        <h1 className="products-page-title">
          My Orders&nbsp;
          {!loading && !error && (
            <span style={{
              fontSize: 18, fontWeight: 700, color: 'var(--primary)',
              background: 'var(--primary-ghost)', padding: '2px 12px',
              borderRadius: 'var(--r-full)', border: '1px solid var(--border-hover)',
            }}>
              {orders.length}
            </span>
          )}
        </h1>
        <p className="products-page-sub">Track your purchase history and order status</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="state-screen">
          <div className="spinner" />
          <p className="state-subtitle">Loading your orders...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="state-screen">
          <div className="state-icon">⚠️</div>
          <h2 className="state-title">Something went wrong</h2>
          <p className="state-subtitle">{error}</p>
          <button id="retry-orders-btn" className="btn btn-primary" onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <div className="state-screen">
          <div className="state-icon" style={{ fontSize: 64 }}>📦</div>
          <h2 className="state-title">No orders yet</h2>
          <p className="state-subtitle">You haven't placed any orders yet. Start shopping!</p>
          <button
            id="start-shopping-btn"
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/products')}
          >
            Start Shopping
          </button>
        </div>
      )}

      {/* Orders grid */}
      {!loading && !error && orders.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {orders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
