const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

/**
 * Middleware to protect routes.
 * Reads the JWT from the HttpOnly cookie, verifies it,
 * fetches the customer from DB, and attaches it to req.user.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Read the token from the cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please log in.",
      });
    }

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the customer in DB and exclude the password field
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Customer not found.",
      });
    }

    // 4. Attach customer to the request object
    req.user = customer;

    next();
  } catch (error) {
    // Handle expired or tampered tokens
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

module.exports = { protect };
