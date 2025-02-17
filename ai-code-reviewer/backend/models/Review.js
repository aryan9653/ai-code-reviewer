require("dotenv").config();
const express = require("express");
const cors = require("cors");
const reviewRoutes = require("./routes/reviewRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const session = require("express-session");
const OpenAI = require("openai");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/review", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

// Review Model
const reviewModel = {
  createReview: async (userId, code) => {
    try {
      const reviewResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an AI code reviewer analyzing security, performance, and best practices." },
          { role: "user", content: `Review this code:\n${code}` },
        ],
        temperature: 0.3,
      });
      
      const reviewText = reviewResponse.choices[0].message.content;
      return await prisma.review.create({
        data: { userId, code, review: reviewText },
      });
    } catch (error) {
      console.error("Error generating review:", error);
      throw new Error("Failed to generate review");
    }
  },

  getReviewsByUser: async (userId) => {
    return await prisma.review.findMany({ where: { userId } });
  },
};

module.exports = reviewModel;

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
