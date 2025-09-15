const express = require("express");
const { body } = require("express-validator");
const { auth } = require("../middlewares/auth");
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["customer", "provider"])
      .withMessage("Role must be customer or provider"),
  ],
  register
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  login
);

// Get current user profile
router.get("/profile", auth, getProfile);

// Update profile
router.put("/profile", auth, updateProfile);

module.exports = router;
