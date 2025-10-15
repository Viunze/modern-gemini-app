// server.js
import 'dotenv/config'; 
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

// Perbaikan untuk __dirname di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Gunakan process.env.PORT untuk Vercel, atau 3000 untuk lokal
const port = process.env.PORT || 3000;

// Inisialisasi Gemini AI menggunakan API Key dari .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("FATAL: GEMINI_API_KEY is not defined.");
    // Di lingkungan produksi (Vercel), ini akan menyebabkan kegagalan
    // Dalam pengembangan lokal, pastikan .env sudah terisi.
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Middleware
app.use(express.json());
// Melayani file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public'))); 

// *******************************************************
// FIX: Endpoint GET utama untuk melayani index.html
// Ini memperbaiki error "Cannot GET /"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// *******************************************************

// Endpoint utama untuk chat AI
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API Key is missing on the server.' });
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to communicate with AI model. Check server logs.' });
    }
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
