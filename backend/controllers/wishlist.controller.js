const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ─────────────────────────────────────────────────────────────
// POST /wishlist/:productId  — Add product to wishlist
// Protected: req.user set by auth middleware
// ─────────────────────────────────────────────────────────────
const addToWishlist = async (req, res) => {
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

    // 3. Get authenticated user (full doc, not just the -password version)
    const customer = await Customer.findById(req.user._id);

    // 4. Prevent duplicate — check if already wishlisted
    const alreadySaved = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (alreadySaved) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist.",
      });
    }

    // 5. Add and save
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist.",
    });
  } catch (error) {
    console.error("addToWishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /wishlist  — Get current user's wishlist (populated)
// Protected: req.user set by auth middleware
// ─────────────────────────────────────────────────────────────
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name description price category image stock createdAt",
    });

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error("getWishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /wishlist/:productId  — Remove product from wishlist
// Protected: req.user set by auth middleware
// ─────────────────────────────────────────────────────────────
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    const customer = await Customer.findById(req.user._id);

    // 2. Check if product is actually in the wishlist
    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your wishlist.",
      });
    }

    // 3. Remove and save
    customer.wishlist.splice(index, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist.",
    });
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /wishlist/:productId/toggle  — BONUS: Toggle wishlist
// Returns { saved: true/false } so frontend can sync state
// Protected: req.user set by auth middleware
// ─────────────────────────────────────────────────────────────
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const customer = await Customer.findById(req.user._id);
    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let saved;
    if (index === -1) {
      customer.wishlist.push(productId);
      saved = true;
    } else {
      customer.wishlist.splice(index, 1);
      saved = false;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      saved,
      message: saved ? "Product added to wishlist." : "Product removed from wishlist.",
    });
  } catch (error) {
    console.error("toggleWishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /wishlist/count  — BONUS: Wishlist item count for Navbar
// ─────────────────────────────────────────────────────────────
const getWishlistCount = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).select("wishlist");
    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
};
