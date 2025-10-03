// server.js (Backend-only for Render)

// --- 1. CONFIGURACIÓN E IMPORTACIONES ---
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Re-activado para peticiones cross-origin
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;
    
// Verificación de la clave API
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: La variable de entorno GEMINI_API_KEY no está configurada.");
    process.exit(1);
}
console.log("DEBUG: GEMINI_API_KEY cargada (primeros 5 caracteres):", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' : 'No definida');

// --- 2. MIDDLEWARES DE EXPRESS ---
app.use(cors()); // Permite que tu frontend (en otro dominio) se comunique con este backend
app.use(express.json());

// --- 3. CONFIGURACIÓN DE GEMINI ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = "gemini-2.5-flash";
let chat;

function initializeChat() {
    chat = genAI.getGenerativeModel({ model }).startChat({});
    console.log("✅ Chat de Gemini inicializado y listo.");
}

initializeChat();

// --- 4. ENDPOINT DEL CHATBOT ---
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "El campo 'message' es requerido." });
    }

    try {
        const result = await chat.sendMessage(userMessage);
        const responseText = result.response.text();
        res.json({
            response: responseText
        });

    } catch (error) {
        console.error("🚨 ERROR FATAL DE GEMINI API:", error);
        res.status(500).json({
            error: "Ocurrió un error en el servidor de IA.",
            details: error.message
        });
    }
});

// --- 5. INICIO DEL SERVIDOR ---
app.listen(port, () => {
    console.log(`🚀 Servidor backend corriendo en el puerto ${port}`);
});