import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initializing GoogleGenAI client on server with telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// TTS Generation Endpoint with gemini-3.8-flash-tts
app.post('/api/tts/generate', async (req, res) => {
  try {
    const {
      text,
      voiceId,
      voiceName = 'Charon',
      speaker = 'Narrador',
      stylePrompt = '',
      language = 'pt-BR',
      mode = 'narracao', // 'narracao' | 'locucao'
      subStyle = '',
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'O texto não pode estar vazio.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Chave GEMINI_API_KEY não configurada no ambiente.',
      });
    }

    // Build specific natural language directives for Portuguese and selected style
    let langDirective = 'Fale em Português do Brasil de forma nativa e expressiva, com fonética perfeita, sem sotaque estrangeiro.';
    if (language === 'pt-PT') {
      langDirective = 'Fale em Português de Portugal com prosódia e fonética europeia autêntica, elegante e natural.';
    } else if (language === 'en-US') {
      langDirective = 'Speak in clear, fluent American English with natural cadence.';
    } else if (language === 'es-ES') {
      langDirective = 'Habla en español neutro, natural y fluido.';
    }

    let fullStyleDirective = `${langDirective} ${stylePrompt}`;
    if (mode === 'locucao') {
      fullStyleDirective += ` Estilo: Locução publicitária profissional, projeção vocal assertiva, dicção clara e ritmo comercial cativante. ${subStyle}`;
    } else {
      fullStyleDirective += ` Estilo: Narração rica, envolvente e comovente, pausas dramáticas naturais, ritmo orgânico de contador de histórias. ${subStyle}`;
    }

    console.log(`[VozCraft TTS] Generating audio for voice: ${voiceName} (${speaker}), mode: ${mode}, lang: ${language}`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                speaker: speaker,
                style: fullStyleDirective.trim(),
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/wav';

    if (!base64Audio) {
      console.error('[TTS] Nenhum dado de áudio retornado:', JSON.stringify(response));
      return res.status(502).json({
        error: 'Nenhum áudio foi gerado pelo modelo. Tente ajustar o texto e tente novamente.',
      });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: mimeType,
      speaker,
      voiceId,
      voiceName,
      textLength: text.trim().length,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('[VozCraft TTS Error]:', err);
    const message = err?.message || 'Erro interno ao processar a geração de voz com IA.';
    return res.status(500).json({ error: message });
  }
});

// App status endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    model: 'gemini-3.8-flash-tts',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VozCraft Studio] Servidor iniciado na porta ${PORT}`);
  });
}

start();
