const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

// All cart routes are protected
router.use(protect);

router.get("/",              getCart);        // GET    /cart
router.post("/:productId",   addToCart);      // POST   /cart/:productId
router.patch("/:productId",  updateCartItem); // PATCH  /cart/:productId
router.delete("/clear",      clearCart);      // DELETE /cart/clear  ← before /:productId
router.delete("/:productId", removeFromCart); // DELETE /cart/:productId

module.exports = router;
