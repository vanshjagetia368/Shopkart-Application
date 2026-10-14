require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");
const productRoutes  = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes     = require("./routes/cart.routes");
const orderRoutes    = require("./routes/order.routes");

const app = express();

// ── Middleware ───────────────────────────────────
app.use(express.json());                   // Parse incoming JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());                   // Parse cookies (needed for HttpOnly JWT)

// CORS — allow frontend to send cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Vite default
    credentials: true,                     // Allow cookies to be sent cross-origin
  })
);

// ── Routes ───────────────────────────────────────
app.use("/customers", customerRoutes);
app.use("/products",  productRoutes);
app.use("/wishlist",  wishlistRoutes); // Lab-04
app.use("/cart",      cartRoutes);     // Lab-05
app.use("/orders",    orderRoutes);    // Lab-06

// ── Health Check ─────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "ShopKart API is running 🚀" });
});

// ── 404 Handler ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global Error Handler ─────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

// ── Database + Server Start ───────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀  Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });
