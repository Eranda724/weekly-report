const {
    createDraftReport,
    getReportById,
    updateReport,
    submitReport,
    reviewReport,
    listAllReports,
    listMyReports,
} = require('../services/reportService');

async function create(req, res) {
    try {
        const report = await createDraftReport(req.user.id, req.body);
        res.status(201).json(report);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'A report for this project and week already exists.' });
        }
        res.status(400).json({ error: err.message });
    }
}

async function getOne(req, res) {
    try {
        const report = await getReportById(req.params.id, req.user);
        res.json(report);
    } catch (err) {
        const status = err.message === 'Forbidden' ? 403 : err.message === 'Report not found' ? 404 : 400;
        res.status(status).json({ error: err.message });
    }
}

async function update(req, res) {
    try {
        const report = await updateReport(req.params.id, req.user.id, req.body);
        res.json(report);
    } catch (err) {
        const status = err.message === 'Forbidden' ? 403 : err.message === 'Report not found' ? 404 : 400;
        res.status(status).json({ error: err.message });
    }
}

async function submit(req, res) {
    try {
        const report = await submitReport(req.params.id, req.user.id);
        res.json(report);
    } catch (err) {
        const status = err.message === 'Forbidden' ? 403 : err.message === 'Report not found' ? 404 : 400;
        res.status(status).json({ error: err.message });
    }
}

async function listMine(req, res) {
    try {
        const { status, page, pageSize } = req.query;
        const result = await listMyReports(req.user.id, {
            status,
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
        });
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// review and correction workflow
async function review(req, res) {
    try {
        const { decision, commentText } = req.body;
        if (!['APPROVED', 'NEEDS_CORRECTION'].includes(decision)) {
            return res.status(400).json({ error: 'decision must be APPROVED or NEEDS_CORRECTION' });
        }
        const report = await reviewReport(req.params.id, req.user.id, { decision, commentText });
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function listAll(req, res) {
    try {
        const { userId, projectId, status, weekStartDate, page, pageSize } = req.query;
        const result = await listAllReports(req.user, {
            userId, projectId, status, weekStartDate,
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
        });
        res.json(result);
    } catch (err) {
        const status = err.message === 'Forbidden' ? 403 : 400;
        res.status(status).json({ error: err.message });
    }
}

module.exports = {
    create, getOne, update, submit, listMine, review, listAll,
};