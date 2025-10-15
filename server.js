// server.js
import 'dotenv/config'; // Memuat variabel dari .env
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

const app = express();
const port = 3000;

// Inisialisasi Gemini AI menggunakan API Key dari .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("FATAL: GEMINI_API_KEY is not defined in .env file.");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Middleware
app.use(express.json());
app.use(express.static('public')); // Menyajikan file di folder 'public'

// Endpoint utama untuk chat AI
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        console.log(`Received prompt: ${prompt.substring(0, 50)}...`);

        // Memanggil Gemini API
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Model modern yang cepat
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        // Mengirimkan teks hasil AI kembali ke frontend
        res.json({ text: response.text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to communicate with AI model.' });
    }
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Frontend is accessible at http://localhost:3000/index.html');
});
