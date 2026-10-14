const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
} = require("../controllers/wishlist.controller");

// All wishlist routes are protected — must be logged in
router.use(protect);

// Core routes
router.get("/",                          getWishlist);       // GET  /wishlist
router.get("/count",                     getWishlistCount);  // GET  /wishlist/count  (Bonus)
router.post("/:productId",               addToWishlist);     // POST /wishlist/:productId
router.delete("/:productId",             removeFromWishlist);// DELETE /wishlist/:productId
router.patch("/:productId/toggle",       toggleWishlist);    // PATCH /wishlist/:productId/toggle (Bonus)

module.exports = router;
