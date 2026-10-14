import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const navigate = useNavigate();
  const { updateQty, remove } = useCart();
  const [updatingQty, setUpdatingQty] = useState(false);
  const [removing,    setRemoving]    = useState(false);
  const [qtyError,    setQtyError]    = useState('');

  const { product, quantity } = item;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(product.price);

  const formattedLineTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(product.price * quantity);

  const handleQty = async (newQty) => {
    if (newQty < 1) return; // don't go below 1
    if (newQty > product.stock) {
      setQtyError(`Max ${product.stock} available`);
      setTimeout(() => setQtyError(''), 2000);
      return;
    }
    setUpdatingQty(true); setQtyError('');
    try {
      await updateQty(product._id, newQty);
    } catch (err) {
      setQtyError(err.response?.data?.message || 'Update failed.');
      setTimeout(() => setQtyError(''), 2500);
    } finally {
      setUpdatingQty(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await remove(product._id);
    } catch {
      setRemoving(false);
    }
  };

  return (
    <div
      id={`cart-item-${product._id}`}
      style={{
        display: 'flex', gap: 20, alignItems: 'flex-start',
        padding: '20px 0',
        borderBottom: '1px solid var(--border)',
        opacity: removing ? 0.4 : 1,
        transition: 'opacity 0.25s ease',
      }}
    >
      {/* Product Image */}
      <div
        onClick={() => navigate(`/products/${product._id}`)}
        style={{
          width: 96, height: 96, flexShrink: 0,
          borderRadius: 'var(--r-lg)', overflow: 'hidden',
          background: 'var(--bg-subtle)',
          border: '1.5px solid var(--border)', cursor: 'pointer',
          transition: 'var(--t-base)',
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            e.target.src = `https://placehold.co/96x96/F1F3FB/5B5BF6?text=${encodeURIComponent(product.name.slice(0,4))}`;
          }}
        />
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          onClick={() => navigate(`/products/${product._id}`)}
          style={{
            fontSize: 15, fontWeight: 700, color: 'var(--text)',
            marginBottom: 4, cursor: 'pointer', lineHeight: 1.3,
          }}
        >
          {product.name}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
          {product.category} · {formattedPrice} each
        </p>

        {/* Quantity Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
            overflow: 'hidden', background: 'var(--bg-white)',
          }}>
            <button
              id={`decrease-${product._id}`}
              onClick={() => handleQty(quantity - 1)}
              disabled={updatingQty || quantity <= 1}
              style={{
                width: 36, height: 36, border: 'none', background: 'transparent',
                fontSize: 18, fontWeight: 700, color: quantity <= 1 ? 'var(--text-muted)' : 'var(--text)',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'var(--t-fast)',
              }}
            >
              −
            </button>
            <span style={{
              minWidth: 36, textAlign: 'center',
              fontSize: 15, fontWeight: 700, color: 'var(--text)',
              borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
              padding: '0 4px', lineHeight: '36px',
            }}>
              {updatingQty ? '…' : quantity}
            </span>
            <button
              id={`increase-${product._id}`}
              onClick={() => handleQty(quantity + 1)}
              disabled={updatingQty || quantity >= product.stock}
              style={{
                width: 36, height: 36, border: 'none', background: 'transparent',
                fontSize: 18, fontWeight: 700,
                color: quantity >= product.stock ? 'var(--text-muted)' : 'var(--primary)',
                cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'var(--t-fast)',
              }}
            >
              +
            </button>
          </div>

          {qtyError && (
            <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
              {qtyError}
            </span>
          )}

          <button
            id={`remove-cart-${product._id}`}
            onClick={handleRemove}
            disabled={removing}
            style={{
              background: 'none', border: '1.5px solid rgba(239,68,68,0.25)',
              borderRadius: 'var(--r-sm)', color: 'var(--danger)',
              fontSize: 12, fontWeight: 600, padding: '6px 12px',
              cursor: removing ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)', transition: 'var(--t-base)',
            }}
            onMouseEnter={e => {
              if (!removing) {
                e.currentTarget.style.background = 'var(--danger)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--danger)';
            }}
          >
            {removing ? 'Removing…' : '✕ Remove'}
          </button>
        </div>
      </div>

      {/* Line Total */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.3px' }}>
          {formattedLineTotal}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {quantity} × {formattedPrice}
        </p>
      </div>
    </div>
  );
}
