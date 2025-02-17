require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const OpenAI = require("openai");

let prisma;

if (!global.prisma) {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
  }
} else {
  prisma = global.prisma;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = { prisma, openai };
