const crypto   = require("crypto");
const Customer  = require("../models/customer.model");
const Product   = require("../models/product.model");
const Order     = require("../models/order.model");
const razorpay  = require("../config/razorpay");

// ─────────────────────────────────────────────────────────────
// POST /orders/create-payment-order
// 1. Validate cart + stock  2. Build snapshot  3. Create ShopKart Order
// 4. Create Razorpay Order  5. Return checkout data to React
// ─────────────────────────────────────────────────────────────
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // ── Validate shipping address ───────────────────────────
    const required = ["fullName","phone","addressLine1","city","state","pincode"];
    for (const field of required) {
      if (!shippingAddress?.[field]?.trim()) {
        return res.status(400).json({
          success: false,
          message: `Shipping address: ${field} is required.`,
        });
      }
    }
    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      return res.status(400).json({ success: false, message: "Pincode must be 6 digits." });
    }
    if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      return res.status(400).json({ success: false, message: "Phone must be 10 digits." });
    }

    // ── Load user cart ──────────────────────────────────────
    const customer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image stock category",
    });

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty." });
    }

    // ── Validate stock & build snapshot ────────────────────
    let totalAmount = 0;
    const orderItems = [];

    for (const item of customer.cart) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.product.name}" no longer exists.`,
        });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
        });
      }

      // Server-side total — never trust frontend price
      totalAmount += product.price * item.quantity;

      // Snapshot at purchase time
      orderItems.push({
        product:  product._id,
        name:     product.name,
        price:    product.price,      // purchase-time price
        quantity: item.quantity,
        image:    product.image,
      });
    }

    // ── Create pending ShopKart order ───────────────────────
    const shopKartOrder = await Order.create({
      user:            req.user._id,
      items:           orderItems,
      shippingAddress: shippingAddress,
      totalAmount,
      paymentStatus:   "PENDING",
      status:          "PENDING_PAYMENT",
    });

    // ── Create Razorpay Order (amount in paise) ─────────────
    const razorpayOrder = await razorpay.orders.create({
      amount:   Math.round(totalAmount * 100),  // ₹ → paise
      currency: "INR",
      receipt:  shopKartOrder._id.toString(),
    });

    // Save Razorpay order ID to ShopKart order
    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    // ── Return checkout data (Key ID only, NEVER key secret) ─
    return res.status(201).json({
      success:         true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      key:             process.env.RAZORPAY_KEY_ID,   // public key only
    });
  } catch (error) {
    console.error("createPaymentOrder error:", error);
    return res.status(500).json({ success: false, message: "Could not create order. Try again." });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /orders/verify-payment
// Verify HMAC SHA256 signature → mark PAID → clear cart
// ─────────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Load ShopKart order and verify ownership
    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // ── Signature verification (HMAC SHA256) ────────────────
    // Use the Razorpay Order ID stored in DB — never trust browser-supplied one
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch — do NOT clear cart, do NOT mark as paid
      order.paymentStatus = "FAILED";
      order.status        = "PENDING_PAYMENT";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed. Cart has NOT been cleared.",
      });
    }

    // ── Signature valid — mark as PAID ──────────────────────
    order.paymentStatus      = "PAID";
    order.status             = "PLACED";
    order.razorpayPaymentId  = razorpay_payment_id;
    await order.save();

    // ── Clear user cart ONLY after verified payment ─────────
    const customer = await Customer.findById(req.user._id);
    customer.cart  = [];
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified. Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ success: false, message: "Server error during verification." });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /orders  — Get current user's orders (newest first)
// ─────────────────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("items totalAmount status paymentStatus createdAt razorpayOrderId");

    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /orders/:id  — Get single order (user must own it)
// ─────────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    // Ownership check — users cannot read other users' orders
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getMyOrders, getOrderById };
