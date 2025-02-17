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

// WebSocket AI Chatbot
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("explain_code", async (codeSnippet) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an AI assistant explaining code step by step." },
          { role: "user", content: `Explain this code:\n${codeSnippet}` },
        ],
        temperature: 0.3,
      });

      socket.emit("chat_response", response.choices[0].message.content);
    } catch (error) {
      socket.emit("chat_response", "Error: Unable to process your request.");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Review Routes
const reviewRouter = express.Router();

reviewRouter.post("/submit", async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ error: "User ID and code are required" });

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
    const review = await prisma.review.create({
      data: { userId, code, review: reviewText },
    });

    res.json({ review });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ error: "Failed to generate review" });
  }
});

reviewRouter.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const reviews = await prisma.review.findMany({ where: { userId } });
    res.json({ reviews });
  } catch (error) {
    console.error("Error fetching review history:", error);
    res.status(500).json({ error: "Failed to fetch review history" });
  }
});

app.use("/api/review", reviewRouter);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
