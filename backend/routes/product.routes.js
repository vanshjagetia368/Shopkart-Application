const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  getCategories,
} = require("../controllers/product.controller");

// IMPORTANT: /categories must be defined BEFORE /:id
// Otherwise Express would try to resolve "categories" as a MongoDB ObjectId
router.get("/categories", getCategories);

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

module.exports = router;
