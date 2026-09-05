const { askQuestion, generateWeeklySummary } = require('../services/aiService');

async function chat(req, res) {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ error: 'question is required' });
        const answer = await askQuestion(question);
        res.json({ answer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function summary(req, res) {
    try {
        const { weekStartDate } = req.query;
        const text = await generateWeeklySummary(weekStartDate);
        res.json({ summary: text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { chat, summary };