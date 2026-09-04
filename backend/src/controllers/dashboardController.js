const { getFullDashboardMetrics } = require('../services/dashboardService');

async function metrics(req, res) {
    try {
        const { weekStartDate } = req.query;
        const data = await getFullDashboardMetrics(weekStartDate);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { metrics };