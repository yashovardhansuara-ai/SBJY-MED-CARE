import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

  // API proxy route for chat
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { model, config, messages } = req.body;
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Missing API Key" });
      }
      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({ model, config });
      
      const response = await chat.sendMessage({
        message: messages[messages.length - 1].parts || messages[messages.length - 1].text
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to communicate with AI" });
    }
  });

  // API proxy route for generateContent
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { model, config, contents } = req.body;
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Missing API Key" });
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: production handling requires building the frontend
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
