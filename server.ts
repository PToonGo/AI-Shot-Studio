/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const port = 3000;

// Initialize GoogleGenAI SDK with server-side API Key & Telemetry headers
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined active or is set to default. AI functionality will fallback gracefully.");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Check / Health Route
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'active',
      aiConfigured: !!ai,
    });
  });

  // AI Prompt Synthesizer Endpoint
  app.post('/api/generate-prompt', async (req, res) => {
    try {
      const { scene, movementTitle, movementDescription, intensity, engine, advancedDirectives } = req.body;

      if (!scene || !movementTitle) {
        return res.status(400).json({ error: 'Missing required prompt parameters: scene or movement' });
      }

      if (!ai) {
        // Fallback generator if API key is not configured yet
        const speedText = intensity <= 2 ? 'slow' : intensity >= 4 ? 'express/rapid' : 'moderate';
        const fallbackPrompt = `Cinematic ${engine === 'sora' ? 'masterpiece' : 'high-fidelity'} shot of "${scene}". Camera executes a ${speedText} ${movementTitle.toLowerCase()}: ${movementDescription}. Atmospheric cinematic lighting, hyper-realistic details, high contrast depth of field, 8k resolution, suitable for ${engine.toUpperCase()}.`;
        
        return res.json({
          synthesizedPrompt: fallbackPrompt,
          negativePrompt: "shaky footage, low resolution, bad focus, grainy, artificial distortion, static camera, text watermark, oversaturated colors",
          motionSettings: {
            speed: `${intensity}/5 strength (${speedText})`,
            focus: "Locked center track, dynamic depth",
            framing: "Cinematic anamorphic ratio"
          },
          explanation: "Generated locally using static prompt mapping. Set your GEMINI_API_KEY secret in AI Studio to activate live generation."
        });
      }

      const promptPayload = `
        Create a state-of-the-art AI video generation prompt for the engine "${engine}".
        Subject Scene: "${scene}"
        Camera Action: "${movementTitle}" (${movementDescription})
        Movement Speed/Intensity: ${intensity} out of 5.
        Additional custom directions if any: "${advancedDirectives || 'None'}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptPayload,
        config: {
          systemInstruction: `
            You are a Hollywood Cinematographer and AI Video Prompt Engineer. 
            Your role is to write optimized, high-fidelity prompt structures tailored for models like Sora, Runway Gen-3, Luma Dream Machine, or Kling.
            For different engines, adapt the style conventions:
            - Sora: Rich descriptive details, atmospheric tags, cinematic lens descriptions, temporal descriptions.
            - Runway: Emphasize physical simulation directives, exact camera action framing, dynamic speed tags.
            - Luma: Explicit motion verbs, direct subject interactives, sharp lighting modifiers.
            - Kling: Clear chronological action clauses, photoreal rendering benchmarks.
            
            Always output clean, high-concept, highly descriptive, immersive prompt phrasing. Do not include quotes in the main prompt itself.
          `,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              synthesizedPrompt: {
                type: Type.STRING,
                description: 'The beautifully engineered, ready-to-copy video model prompt.'
              },
              negativePrompt: {
                type: Type.STRING,
                description: 'The recommended negative prompt tokens, motion inhibitors, or quality blockers.'
              },
              motionSettings: {
                type: Type.OBJECT,
                properties: {
                  speed: { type: Type.STRING, description: 'Described camera motion speed and acceleration tags.' },
                  focus: { type: Type.STRING, description: 'Directives on lens focus, bokeh, focal length drift.' },
                  framing: { type: Type.STRING, description: 'Perspective style e.g., low-angle extreme close-up or anamorphic master.' }
                },
                required: ['speed', 'focus', 'framing']
              },
              explanation: {
                type: Type.STRING,
                description: 'Brief 1-2 sentence director design choice explaining why this prompt structure works.'
              }
            },
            required: ['synthesizedPrompt', 'negativePrompt', 'motionSettings', 'explanation']
          }
        }
      });

      const responseText = response.text || '';
      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);

    } catch (error: any) {
      console.error('Gemini Generation Error:', error);
      res.status(500).json({ error: error.message || 'Error executing AI generation' });
    }
  });

  // Vite development middleware vs. Production build router
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AI SHOT STUDIO full-stack server running active on http://0.0.0.0:${port}`);
  });
}

startServer();
