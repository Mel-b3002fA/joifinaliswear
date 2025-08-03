const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Add node-fetch for server-side API calls
const app = express();
const port = process.env.PORT || 3000; // Use Render's PORT env var

// Serve static files from 'static' and 'templates'
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'templates')));

// Middleware to parse JSON requests
app.use(express.json());

// Serve the chat interface
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'chat.html'));
});

// Proxy API requests to Hugging Face Spaces
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await fetch('https://<your-username>-<space-name>.hf.space/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const data = await response.json();
        res.json({ reply: data.response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to connect to Hugging Face API' });
    }
});

// Serve other static routes
app.get(['/', '/about', '/contact', '/tutorial'], (req, res) => {
    const page = req.path === '/' ? 'index' : req.path.slice(1);
    res.sendFile(path.join(__dirname, 'templates', `${page}.html`));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});