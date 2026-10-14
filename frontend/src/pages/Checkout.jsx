import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

const INR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

// Dynamically load Razorpay checkout script
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Field-level validation
const validate = (form) => {
  const errs = {};
  if (!form.fullName.trim())        errs.fullName     = 'Full name is required.';
  if (!/^\d{10}$/.test(form.phone.trim())) errs.phone = 'Phone must be 10 digits.';
  if (!form.addressLine1.trim())    errs.addressLine1 = 'Address is required.';
  if (!form.city.trim())            errs.city         = 'City is required.';
  if (!form.state.trim())           errs.state        = 'State is required.';
  if (!/^\d{6}$/.test(form.pincode.trim())) errs.pincode = 'Pincode must be 6 digits.';
  return errs;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalItems, clear } = useCart();

  const [form, setForm] = useState({
    fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [placing,     setPlacing]     = useState(false);
  const [error,       setError]       = useState('');
  const [paymentFailed, setPaymentFailed] = useState(false);

  // Redirect away if cart empty
  if (!cartItems.length) {
    return (
      <div className="products-page">
        <div className="state-screen">
          <div className="state-icon" style={{ fontSize: 56 }}>🛒</div>
          <h2 className="state-title">Your cart is empty</h2>
          <p className="state-subtitle">Add products before checking out.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handlePlaceOrder = async () => {
    // 1. Client-side validation
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    setPlacing(true); setError(''); setPaymentFailed(false);

    try {
      // 2. Backend: validate cart + create ShopKart order + Razorpay order
      const res = await createPaymentOrder({ ...form });
      const data = res.data;

      // 3. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Failed to load payment gateway. Check your internet connection.');
        setPlacing(false);
        return;
      }

      // 4. Open Razorpay Checkout
      const options = {
        key:         data.key,
        amount:      data.amount,
        currency:    data.currency,
        name:        'ShopKart',
        description: 'ShopKart Order Payment',
        order_id:    data.razorpayOrderId,

        // Called ONLY when Razorpay reports payment success
        // Still must verify on backend — never trust browser alone
        handler: async (response) => {
          try {
            const verifyRes = await verifyPayment({
              shopKartOrderId:     data.shopKartOrderId,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            // Backend confirmed payment → clear global cart state
            clear();

            // Navigate to success page
            navigate(`/order-success/${verifyRes.data.order._id}`);
          } catch (verifyErr) {
            setError(
              verifyErr.response?.data?.message ||
              'Payment verification failed. Your cart has NOT been cleared. Please contact support.'
            );
          } finally {
            setPlacing(false);
          }
        },

        prefill: {
          name:    form.fullName,
          contact: form.phone,
        },

        theme: { color: '#5B5BF6' },

        modal: {
          ondismiss: () => {
            setPlacing(false); // user closed checkout without paying
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', (response) => {
        setPaymentFailed(true);
        setError(`Payment failed: ${response.error.description}. Your cart is safe.`);
        setPlacing(false);
      });

      paymentObject.open();

    } catch (err) {
      setError(err.response?.data?.message || 'Could not initiate checkout. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <div className="products-page" id="checkout-page">

      {/* Header */}
      <div className="products-page-header anim-fade-up">
        <h1 className="products-page-title">Checkout</h1>
        <p className="products-page-sub">Complete your shipping details to place your order</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: 28, alignItems: 'start',
      }}>

        {/* ── Shipping Form ── */}
        <div style={{
          background: 'var(--bg-white)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: 32,
          boxShadow: 'var(--shadow-xs)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>
            📦 Shipping Details
          </h2>

          {/* Global error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.25)',
              borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 20,
              fontSize: 13, color: 'var(--danger)', fontWeight: 500,
            }}>
              {paymentFailed ? '⚠️ ' : '❌ '}{error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { name: 'fullName',     label: 'Full Name',     type: 'text',  placeholder: 'Aarav Sharma' },
              { name: 'phone',        label: 'Phone Number',  type: 'tel',   placeholder: '9876543210' },
              { name: 'addressLine1', label: 'Address Line',  type: 'text',  placeholder: '22 MG Road, Apt 4B' },
              { name: 'city',         label: 'City',          type: 'text',  placeholder: 'Bengaluru' },
              { name: 'state',        label: 'State',         type: 'text',  placeholder: 'Karnataka' },
              { name: 'pincode',      label: 'Pincode',       type: 'text',  placeholder: '560001' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 600,
                  color: 'var(--text-secondary)', marginBottom: 6,
                }}>
                  {label}
                </label>
                <input
                  id={`checkout-${name}`}
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: `1.5px solid ${fieldErrors[name] ? 'var(--danger)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-md)',
                    fontSize: 14, color: 'var(--text)',
                    background: 'var(--bg-subtle)',
                    outline: 'none', fontFamily: 'var(--font)',
                    boxSizing: 'border-box',
                    transition: 'var(--t-fast)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = fieldErrors[name] ? 'var(--danger)' : 'var(--border)'}
                />
                {fieldErrors[name] && (
                  <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4, fontWeight: 500 }}>
                    {fieldErrors[name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div style={{
          position: 'sticky', top: 'calc(var(--nav-h) + 24px)',
          background: 'var(--bg-white)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {cartItems.map(item => (
              <div key={item.product._id} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, color: 'var(--text-secondary)',
              }}>
                <span style={{ maxWidth: '58%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.product.name} × {item.quantity}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {INR(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
              <span>Items</span><span>{totalItems}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
            </div>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 20, fontWeight: 800, color: 'var(--text)',
            borderTop: '2px solid var(--border)',
            paddingTop: 12, marginBottom: 20,
          }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>{INR(subtotal)}</span>
          </div>

          <button
            id="place-order-btn"
            className="btn btn-primary btn-full btn-lg"
            onClick={handlePlaceOrder}
            disabled={placing}
            style={{ opacity: placing ? 0.7 : 1, cursor: placing ? 'not-allowed' : 'pointer' }}
          >
            {placing ? '⏳ Processing...' : '💳 Pay with Razorpay'}
          </button>

          <button
            className="btn btn-ghost btn-full"
            style={{ marginTop: 10, width: '100%' }}
            onClick={() => navigate('/cart')}
            disabled={placing}
          >
            ← Back to Cart
          </button>

          <p style={{
            fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12,
          }}>
            🔒 Secure payment via Razorpay Test Mode
          </p>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          #checkout-page > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
