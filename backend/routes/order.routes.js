const express = require("express");
const router  = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} = require("../controllers/order.controller");

// All order routes are protected
router.use(protect);

router.post("/create-payment-order", createPaymentOrder); // POST /orders/create-payment-order
router.post("/verify-payment",       verifyPayment);      // POST /orders/verify-payment
router.get("/",                      getMyOrders);         // GET  /orders
router.get("/:id",                   getOrderById);        // GET  /orders/:id

module.exports = router;
