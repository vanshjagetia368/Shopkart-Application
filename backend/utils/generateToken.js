const jwt = require("jsonwebtoken");

/**
 * Generates a JWT and stores it in an HttpOnly cookie on the response object.
 * @param {Object} res - Express response object
 * @param {string} customerId - The MongoDB _id of the customer
 */
const generateToken = (res, customerId) => {
  // Sign the token with the customer's id as payload
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  // Store token in an HttpOnly cookie so JS cannot access it (XSS protection)
  res.cookie("token", token, {
    httpOnly: true,                                    // Not accessible via document.cookie
    secure: process.env.NODE_ENV === "production",    // HTTPS only in production
    sameSite: "strict",                               // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,                // 7 days in milliseconds
  });

  return token;
};

module.exports = generateToken;
