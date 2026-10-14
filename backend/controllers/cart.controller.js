const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ─────────────────────────────────────────────────────────────
// POST /cart/:productId  — Add product to cart (or increment qty)
// ─────────────────────────────────────────────────────────────
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    // 2. Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // 3. Load the authenticated customer (full doc)
    const customer = await Customer.findById(req.user._id);

    // 4. Check if already in cart
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Increment quantity
      const newQty = existingItem.quantity + 1;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available. Cannot add more.`,
        });
      }
      existingItem.quantity = newQty;
    } else {
      // Add new entry with quantity = 1
      if (product.stock < 1) {
        return res.status(400).json({ success: false, message: "Product is out of stock." });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    // Return populated cart
    const updated = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image category stock",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated.",
      cart: updated.cart,
    });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /cart  — Get current user's cart (populated)
// ─────────────────────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image category stock description",
    });

    return res.status(200).json({
      success: true,
      count: customer.cart.length,
      cart: customer.cart,
    });
  } catch (error) {
    console.error("getCart error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /cart/:productId  — Update quantity for a cart item
// Body: { quantity: Number }
// ─────────────────────────────────────────────────────────────
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    // Validate quantity
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1." });
    }

    // Check product exists & get current stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available.`,
      });
    }

    const customer = await Customer.findById(req.user._id);

    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Product not found in cart." });
    }

    cartItem.quantity = qty;
    await customer.save();

    // Return populated cart
    const updated = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image category stock",
    });

    return res.status(200).json({
      success: true,
      message: "Quantity updated.",
      cart: updated.cart,
    });
  } catch (error) {
    console.error("updateCartItem error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /cart/:productId  — Remove product from cart
// ─────────────────────────────────────────────────────────────
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    const customer = await Customer.findById(req.user._id);

    const index = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart." });
    }

    customer.cart.splice(index, 1);
    await customer.save();

    // Return updated populated cart
    const updated = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image category stock",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart.",
      cart: updated.cart,
    });
  } catch (error) {
    console.error("removeFromCart error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /cart  — Clear entire cart
// ─────────────────────────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.user._id, { cart: [] });
    return res.status(200).json({ success: true, message: "Cart cleared.", cart: [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { addToCart, getCart, updateCartItem, removeFromCart, clearCart };
