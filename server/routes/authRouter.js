const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../schemas/userSchema");
const { createJWT } = require("../utils/jwtUtils");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
require("../utils/passportConfig");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/login" }),
  catchAsync(async (req, res) => {
    if (!req.user) throw new AppError("Google login failed", 401);

    const token = createJWT(req.user.id, req.user.username);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: { id: req.user.id, username: req.user.username },
    });
  })
);

router.post(
  "/register",
  catchAsync(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new AppError("All fields are required", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = createJWT(newUser.id, newUser.username);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });
  })
);

router.post(
  "/login",
  catchAsync(async (req, res) => {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      throw new AppError("Invalid user", 401);
    }

    const isMatch = await bcrypt.compare(password, currentUser.password);
    if (!isMatch) {
      throw new AppError("Invalid password", 401);
    }

    const token = createJWT(currentUser.id, currentUser.username);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: currentUser.id, username: currentUser.username, email: currentUser.email },
    });
  })
);

module.exports = router;
