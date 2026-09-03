const prisma = require('../config/prisma');

async function createDraftReport(userId, data) {
    const {
        projectId,
        weekStartDate,
        tasksNextWeek,
        notesLinks,
        tasks = [],
        highlights = [],
        hoursBreakdown = [],
    } = data;

    return prisma.$transaction(async (tx) => {
        const report = await tx.report.create({
            data: {
                userId,
                projectId,
                weekStartDate: new Date(weekStartDate),
                status: 'DRAFT',
                tasksNextWeek,
                notesLinks,
                tasks: {
                    create: tasks.map((t) => ({
                        taskName: t.taskName,
                        priority: t.priority,
                        plannedPct: t.plannedPct,
                        actualPct: t.actualPct,
                        status: t.status,
                        timePlannedHrs: t.timePlannedHrs,
                        timeSpentHrs: t.timeSpentHrs,
                        deliverable: t.deliverable,
                    })),
                },
                highlights: {
                    create: highlights.map((h) => ({
                        itemType: h.itemType,
                        description: h.description,
                        isKeyItem: h.isKeyItem || false,
                    })),
                },
                hoursBreakdown: {
                    create: hoursBreakdown.map((hb) => ({
                        taskCategory: hb.taskCategory,
                        hoursSpent: hb.hoursSpent,
                    })),
                },
            },
            include: { tasks: true, highlights: true, hoursBreakdown: true },
        });

        return report;
    });
}

async function getReportById(reportId, requestingUser) {
    const report = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
            tasks: true,
            highlights: true,
            hoursBreakdown: true,
            project: true,
            user: { select: { id: true, name: true, email: true } },
            versions: { orderBy: { versionNumber: 'desc' } },
            reviewComments: { orderBy: { createdAt: 'desc' } },
        },
    });

    if (!report) {
        throw new Error('Report not found');
    }

    // Role-aware access check, right here in the service layer
    const isOwner = report.userId === requestingUser.id;
    const isManager = ['MANAGER', 'ADMIN'].includes(requestingUser.role);

    if (!isOwner && !isManager) {
        throw new Error('Forbidden');
    }

    return report;
}
async function updateReport(reportId, userId, data) {
    const existing = await prisma.report.findUnique({ where: { id: reportId } });

    if (!existing) throw new Error('Report not found');
    if (existing.userId !== userId) throw new Error('Forbidden');
    if (!['DRAFT', 'NEEDS_CORRECTION'].includes(existing.status)) {
        throw new Error('Report cannot be edited in its current status');
    }

    const {
        projectId,
        weekStartDate,
        tasksNextWeek,
        notesLinks,
        tasks = [],
        highlights = [],
        hoursBreakdown = [],
    } = data;

    return prisma.$transaction(async (tx) => {
        // Replace child rows entirely — simplest correct approach for a fixed-structure form
        await tx.reportTask.deleteMany({ where: { reportId } });
        await tx.reportHighlight.deleteMany({ where: { reportId } });
        await tx.hoursBreakdown.deleteMany({ where: { reportId } });

        const updated = await tx.report.update({
            where: { id: reportId },
            data: {
                projectId,
                weekStartDate: new Date(weekStartDate),
                tasksNextWeek,
                notesLinks,
                tasks: { create: tasks.map((t) => ({ ...t })) },
                highlights: { create: highlights.map((h) => ({ ...h })) },
                hoursBreakdown: { create: hoursBreakdown.map((hb) => ({ ...hb })) },
            },
            include: { tasks: true, highlights: true, hoursBreakdown: true },
        });

        return updated;
    });
}

async function submitReport(reportId, userId) {
    const existing = await prisma.report.findUnique({
        where: { id: reportId },
        include: { tasks: true, highlights: true, hoursBreakdown: true, project: true },
    });

    if (!existing) throw new Error('Report not found');
    if (existing.userId !== userId) throw new Error('Forbidden');
    if (!['DRAFT', 'NEEDS_CORRECTION'].includes(existing.status)) {
        throw new Error('Report cannot be submitted in its current status');
    }

    const nextVersion = existing.currentVersion + 1;

    return prisma.$transaction(async (tx) => {
        await tx.reportVersion.create({
            data: {
                reportId,
                versionNumber: nextVersion,
                contentSnapshot: JSON.stringify(existing), // frozen copy of content at submit time
            },
        });

        const updated = await tx.report.update({
            where: { id: reportId },
            data: {
                status: 'SUBMITTED',
                currentVersion: nextVersion,
                submittedAt: existing.submittedAt || new Date(), // set only on first submit
            },
        });

        return updated;
    });
}

async function listMyReports(userId, filters = {}) {
    const { status, page = 1, pageSize = 10 } = filters;

    const where = { userId, ...(status ? { status } : {}) };

    const [reports, total] = await Promise.all([
        prisma.report.findMany({
            where,
            orderBy: { weekStartDate: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { project: true },
        }),
        prisma.report.count({ where }),
    ]);

    return { reports, total, page, pageSize };
}

module.exports = {
    createDraftReport,
    getReportById,
    updateReport,
    submitReport,
    listMyReports,
};