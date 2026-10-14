const mongoose = require("mongoose");
const Product = require("../models/product.model");

// ─────────────────────────────────────────────────
// @desc    Create a new product
// @route   POST /products
// @access  Public (admin protection added later)
// ─────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, description, price, category, image",
      });
    }

    // Validate price
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Validate stock
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock: stock ?? 0,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error.message);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────
// @desc    Get all products (with search, category, sort)
// @route   GET /products
// @access  Public
//
// Query params:
//   ?search=keyboard      → case-insensitive name search
//   ?category=Electronics → filter by category
//   ?sort=price_asc       → sort by price ascending  (BONUS)
//   ?sort=price_desc      → sort by price descending (BONUS)
// ─────────────────────────────────────────────────
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build query object dynamically
    const query = {};

    if (search) {
      // Case-insensitive partial match on name
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = { $regex: `^${category}$`, $options: "i" };
    }

    // Build sort object
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };

    const products = await Product.find(query).sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────
// @desc    Get a single product by ID
// @route   GET /products/:id
// @access  Public
// ─────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────
// @desc    Get unique categories
// @route   GET /products/categories
// @access  Public
// ─────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Get Categories Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { createProduct, getAllProducts, getProductById, getCategories };
