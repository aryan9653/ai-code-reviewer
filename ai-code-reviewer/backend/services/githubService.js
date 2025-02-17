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

// GitHub Service for PR Review
const fetchPRFiles = async (repo, owner, pullNumber) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`, {
      headers: { Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching PR files:", error);
    return [];
  }
};

const reviewPR = async (repo, owner, pullNumber) => {
  const files = await fetchPRFiles(repo, owner, pullNumber);
  for (const file of files) {
    const code = await axios.get(file.raw_url).then((res) => res.data);
    const reviewResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI code reviewer analyzing security, performance, and best practices." },
        { role: "user", content: `Review this code:\n${code}` },
      ],
      temperature: 0.3,
    });
    
    const reviewComment = reviewResponse.choices[0].message.content;
    await axios.post(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments`,
      { body: reviewComment },
      { headers: { Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}` } }
    );
  }
};

app.post("/api/github/review", async (req, res) => {
  const { repo, owner, pullNumber } = req.body;
  if (!repo || !owner || !pullNumber) return res.status(400).json({ error: "Missing required parameters." });
  await reviewPR(repo, owner, pullNumber);
  res.json({ message: "Review initiated." });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
