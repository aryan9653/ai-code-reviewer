import express from "express";
import { analyzeCode, explainCode } from "../services/openaiService.js";

const router = express.Router();

/**
 * AI Code Review API
 */
router.post("/review", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Code is required" });

  const review = await analyzeCode(code);
  res.json({ review });
});

/**
 * AI Code Explanation API
 */
router.post("/explain", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Code is required" });

  const explanation = await explainCode(code);
  res.json({ explanation });
});

export default router;
