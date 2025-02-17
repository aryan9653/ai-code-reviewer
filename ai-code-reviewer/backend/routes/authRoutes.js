import express from "express";
import passport from "passport";
import GitHubStrategy from "passport-github2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

/**
 * GitHub Authentication Strategy
 */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = {
        githubId: profile.id,
        username: profile.username,
        avatar: profile.photos[0].value,
      };

      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

/**
 * GitHub OAuth Login Route
 */
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

/**
 * GitHub OAuth Callback
 */
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign(req.user, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, { httpOnly: true });
    res.redirect("http://localhost:3000/dashboard"); // Redirect to frontend
  }
);

/**
 * Logout Route
 */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;
