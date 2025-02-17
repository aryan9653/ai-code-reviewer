import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Never hardcode API keys!
});

/**
 * Generates AI feedback for a given code snippet.
 */
export async function analyzeCode(codeSnippet) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert code reviewer analyzing security, performance, and best practices." },
        { role: "user", content: `Review this code:\n${codeSnippet}` },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return "AI response failed.";
  }
}

/**
 * Generates AI explanation for a given code snippet.
 */
export async function explainCode(codeSnippet) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI assistant explaining code step by step." },
        { role: "user", content: `Explain this code:\n${codeSnippet}` },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return "AI explanation failed.";
  }
}
