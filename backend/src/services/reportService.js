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
            project: { include: { projectMembers: true } },
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
    const isAdmin = requestingUser.role === 'ADMIN';
    const isManager = requestingUser.role === 'MANAGER';

    if (!isOwner && !isAdmin && !isManager) {
        throw new Error('Forbidden');
    }
    
    // Clean up projectMembers from response so it doesn't leak unnecessarily
    delete report.project.projectMembers;

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

    // Strip out id/reportId — Prisma's nested create infers reportId automatically,
    // and we always want fresh child rows, not to reuse old ids.
    const cleanTasks = tasks.map(({ id, reportId, ...rest }) => rest);
    const cleanHighlights = highlights.map(({ id, reportId, ...rest }) => rest);
    const cleanHours = hoursBreakdown.map(({ id, reportId, ...rest }) => rest);

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
                tasks: { create: cleanTasks },
                highlights: { create: cleanHighlights },
                hoursBreakdown: { create: cleanHours },
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

//Review & Correction Workflow
async function reviewReport(reportId, managerId, { decision, commentText }) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });

    if (!report) throw new Error('Report not found');
    if (report.status !== 'SUBMITTED') {
        throw new Error('Only submitted reports can be reviewed');
    }
    if (decision === 'NEEDS_CORRECTION' && !commentText) {
        throw new Error('A comment is required when requesting changes');
    }

    const latestVersion = await prisma.reportVersion.findFirst({
        where: { reportId },
        orderBy: { versionNumber: 'desc' },
    });

    if (!latestVersion) throw new Error('No submitted version found for this report');

    return prisma.$transaction(async (tx) => {
        await tx.reviewComment.create({
            data: {
                reportId,
                versionId: latestVersion.id,
                managerId,
                decision,
                commentText: commentText || null,
            },
        });

        const updated = await tx.report.update({
            where: { id: reportId },
            data: {
                status: decision === 'APPROVED' ? 'APPROVED' : 'NEEDS_CORRECTION',
                approvedAt: decision === 'APPROVED' ? new Date() : report.approvedAt,
            },
        });

        return updated;
    });
}

async function listAllReports(requestingUser, filters = {}) {
    if (!['MANAGER', 'ADMIN'].includes(requestingUser.role)) {
        throw new Error('Forbidden');
    }

    const { userId, projectId, status, weekStartDate, page = 1, pageSize = 10 } = filters;

    const where = {
        ...(userId ? { userId } : {}),
        ...(projectId ? { projectId } : {}),
        ...(status ? { status } : {}),
        ...(weekStartDate ? { weekStartDate: new Date(weekStartDate) } : {}),
    };

    // Managers and Admins can see all reports matching the basic filters.
    // ProjectMembership gating has been disabled.

    const [reports, total] = await Promise.all([
        prisma.report.findMany({
            where,
            orderBy: { weekStartDate: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { project: true, user: { select: { id: true, name: true, email: true } } },
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
    reviewReport,
    listAllReports,
    listMyReports,
};