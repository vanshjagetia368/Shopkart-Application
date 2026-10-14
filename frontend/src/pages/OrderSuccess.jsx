import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/api';

const INR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

const statusColor = {
  PLACED:          '#16a34a',
  PENDING_PAYMENT: '#d97706',
  CONFIRMED:       '#2563eb',
  SHIPPED:         '#7c3aed',
  DELIVERED:       '#059669',
};

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getOrderById(id)
      .then(res => { setOrder(res.data.order); setLoading(false); })
      .catch(() => { setError('Could not load order details.'); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="state-screen">
      <div className="spinner" />
      <p className="state-subtitle">Loading your order...</p>
    </div>
  );

  if (error || !order) return (
    <div className="state-screen">
      <div className="state-icon">⚠️</div>
      <h2 className="state-title">Order not found</h2>
      <p className="state-subtitle">{error}</p>
      <button className="btn btn-primary" onClick={() => navigate('/orders')}>View My Orders</button>
    </div>
  );

  return (
    <div className="products-page" id="order-success-page">
      <div style={{
        maxWidth: 560, margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        {/* Success banner */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '1.5px solid #86efac',
          borderRadius: 'var(--r-xl)',
          padding: '32px 28px',
          textAlign: 'center',
          animation: 'fadeUp 0.5s ease',
        }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#15803d', marginBottom: 8 }}>
            Order Placed Successfully!
          </h1>
          <p style={{ fontSize: 14, color: '#166534' }}>
            Thank you for shopping with ShopKart 🎉
          </p>
        </div>

        {/* Order details card */}
        <div style={{
          background: 'var(--bg-white)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: 24,
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Order ID</span>
              <span style={{ color: 'var(--text)', fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>
                #{order._id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Paid</span>
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 18 }}>
                {INR(order.totalAmount)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Status</span>
              <span style={{
                background: `${statusColor[order.status]}18`,
                color: statusColor[order.status] || 'var(--text)',
                fontWeight: 700, padding: '2px 10px', borderRadius: 'var(--r-full)',
                border: `1px solid ${statusColor[order.status]}40`,
              }}>
                {order.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Payment</span>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ {order.paymentStatus}</span>
            </div>
          </div>

          {/* Items */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>ITEMS</p>
            {order.items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 13,
                color: 'var(--text-secondary)', marginBottom: 6,
              }}>
                <span>{item.name} × {item.quantity}</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{INR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            id="view-orders-btn"
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            onClick={() => navigate('/orders')}
          >
            View My Orders
          </button>
          <button
            id="continue-shopping-btn"
            className="btn btn-outline btn-lg"
            style={{ flex: 1 }}
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}
