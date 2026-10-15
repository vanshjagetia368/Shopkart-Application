const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

// ─────────────────────────────────────────────────
// @desc    Register a new customer
// @route   POST /customers/register
// @access  Public
// ─────────────────────────────────────────────────
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. Validate that all fields are present
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: fullName, email, password, phone",
      });
    }

    // 2. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // 3. Check if email already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 4. Create the customer — password hashing happens via the pre-save hook
    const customer = await Customer.create({ fullName, email, password, phone });

    // 5. Return success response (never return the password)
    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────────
// @desc    Login a customer
// @route   POST /customers/login
// @access  Public
// ─────────────────────────────────────────────────
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase() });

    // 3. Verify customer exists and password matches
    //    We do NOT reveal which one is wrong (security best practice)
    if (!customer || !(await customer.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Generate JWT and store it in an HttpOnly cookie
    generateToken(res, customer._id);

    // 5. Return success (no token in body — it's in the cookie)
    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────────
// @desc    Get current logged-in customer's profile
// @route   GET /customers/me
// @access  Protected
// ─────────────────────────────────────────────────
const getMyProfile = async (req, res) => {
  try {
    // req.user is set by the auth middleware (password already excluded)
    const customer = req.user;

    return res.status(200).json({
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
    });
  } catch (error) {
    console.error("Profile Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────────
// @desc    Logout customer — clear cookie
// @route   POST /customers/logout
// @access  Protected
// ─────────────────────────────────────────────────
const logoutCustomer = async (req, res) => {
  try {
    // Clear the token cookie by setting maxAge to 0
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      expires: new Date(0),
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────────
// BONUS: Change Password
// @route   PATCH /customers/change-password
// @access  Protected
// ─────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1. Validate fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // 2. Fetch customer with password (req.user has password excluded)
    const customer = await Customer.findById(req.user._id);

    // 3. Verify old password
    const isMatch = await customer.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // 4. Update and save — pre-save hook will hash the new password
    customer.password = newPassword;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
};
