const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../Schemas/userSchema");
const { createJWT } = require("../utils/jwtUtils");
require("../utils/passportConfig");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/login" }),
  (req, res) => {
    const token = createJWT(req.user.id, req.user.username);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 2 * 60 * 60 * 1000, // 2h
    });
    return res.redirect("http://localhost:5173");
  }
);

// login 
router.post("/login", async (req, res) => {
  try {
    const username = req.body.username.trim();
    const password = req.body.password.trim();

    const currentUser = await User.findOne({ username });
    if(!currentUser) {
      res.cookie("message", "Invalid User", { maxAge: 6000, httpOnly: true });
      return res.redirect(`${FRONTEND_URL}/login`);
    }

    const isMatch = await bcrypt.compare(password, currentUser.password);
    if (!isMatch) {
      res.cookie("message", "Invalid password", { maxAge: 6000, httpOnly: true });
    return res.redirect(`${FRONTEND_URL}/login`);
    }

    const token = createJWT(currentUser.id, currentUser.username);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.cookie("message", "Login Successful", { maxAge: 6000, httpOnly: true });
    return res.redirect(FRONTEND_URL);
  } catch(error){
    res.cookie("message", error.message, { maxAge: 6000, httpOnly: true });
    return res.redirect(`${FRONTEND_URL}/login`);
  }
});


module.exports = router;
