import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // Initialize Gemini AI Client lazily or safely
  let aiClient: GoogleGenAI | null = null;
  function getAI() {
    if (!aiClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiClient;
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Senpai-AI API" });
  });

  // Server-side Image Generation Proxy Endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      const {
        prompt,
        negativePrompt,
        model = "anime-v1",
        aspectRatio = "1:1",
        width = 800,
        height = 800,
        seed = Math.floor(Math.random() * 1000000),
        steps = 30,
        cfgScale = 7.5,
        sampler = "Euler a",
        styleImage
      } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getAI();
      let imageUrl: string | null = null;

      // Attempt Imagen generation if API key is provided
      if (ai) {
        try {
          const styleContext = styleImage ? " [applying uploaded reference art style]" : "";
          const fullPrompt = `Masterpiece anime art style, highly detailed: ${prompt}. ${negativePrompt ? `Exclude: ${negativePrompt}.` : ""} ${styleContext}`;
          
          // Call Imagen 3 model via GenAI SDK
          const response = await ai.models.generateImages({
            model: "imagen-3.0-generate-002",
            prompt: fullPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: "image/jpeg",
              aspectRatio: aspectRatio === "16:9" ? "16:9" : aspectRatio === "9:16" ? "9:16" : aspectRatio === "4:3" ? "4:3" : aspectRatio === "3:4" ? "3:4" : "1:1"
            }
          });

          if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
          }
        } catch (geminiError) {
          console.warn("Gemini Imagen generation failed or unavailable, using high-res AI stream fallback:", geminiError);
        }
      }

      // Fallback AI Stream if Gemini Imagen key not present or throws error
      if (!imageUrl) {
        const styleTag = model === "anime-v1" ? "anime style, manga art, vivid colors, fine line art" :
                         model === "realistic" ? "photorealistic anime character, 8k, ultra-detailed, cinematic lighting" :
                         "2.5d cel-shaded anime illustration, digital painting, smooth gradients";
        
        const enhancedPrompt = encodeURIComponent(`${prompt}, ${styleTag}, masterpiece, high quality`);
        // High quality fast AI generation endpoint
        imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
      }

      res.json({
        success: true,
        imageUrl,
        prompt,
        seed,
        aspectRatio,
        model
      });
    } catch (err: any) {
      console.error("Image generation route error:", err);
      res.status(500).json({ error: err?.message || "Generation error" });
    }
  });

  // Vite Middleware in Dev Mode vs Static Files in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Senpai-AI server running on http://localhost:${PORT}`);
  });
}

startServer();
