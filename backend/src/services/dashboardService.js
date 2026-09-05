const prisma = require('../config/prisma');

function startOfWeek(dateStr) {
    const d = dateStr ? new Date(dateStr) : new Date();
    const day = d.getUTCDay();
    const diff = (day === 0 ? -6 : 1) - day; // back up to Monday
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() + diff);
    monday.setUTCHours(0, 0, 0, 0);
    return monday;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
}

// --- Summary metrics for a given week ---
async function getSummaryMetrics(weekStartDate) {
    const weekStart = startOfWeek(weekStartDate);
    const weekEnd = addDays(weekStart, 7);
    const now = new Date();
    const weekHasEnded = now >= weekEnd;

    const activeMembers = await prisma.user.count({
        where: { role: 'TEAM_MEMBER', isActive: true },
    });

    const weekReports = await prisma.report.findMany({
        where: { weekStartDate: { gte: weekStart, lt: weekEnd } },
        select: { userId: true, status: true },
    });

    const submittedCount = weekReports.filter((r) => r.status !== 'DRAFT').length;

    // Global counts (all time) for manager action items
    const newReportsCount = await prisma.report.count({ where: { status: 'SUBMITTED' } });
    const needsCorrectionCount = await prisma.report.count({ where: { status: 'NEEDS_CORRECTION' } });
    const acceptedReportsCount = await prisma.report.count({ where: { status: 'APPROVED' } });
    const draftReportsCount = await prisma.report.count({ where: { status: 'DRAFT' } });

    const reportedUserIds = new Set(weekReports.map((r) => r.userId));
    const missingCount = Math.max(activeMembers - reportedUserIds.size, 0);
    const pendingCount = weekHasEnded ? 0 : missingCount;
    const lateCount = weekHasEnded ? missingCount : 0;

    const openBlockersCount = await prisma.report.count({
        where: {
            status: 'SUBMITTED', // focus on submitted reports who have blockers
            highlights: {
                some: { itemType: 'BLOCKER' }
            }
        },
    });

    return {
        weekStartDate: weekStart,
        totalSubmittedThisWeek: submittedCount,
        complianceRate: { submitted: submittedCount, pending: pendingCount, late: lateCount },
        newReportsCount,
        needsCorrectionCount,
        acceptedReportsCount,
        draftReportsCount,
        openBlockersCount,
    };
}

// --- Tasks completed trend, last N weeks, team-wide ---
async function getTasksCompletedTrend(weeksBack = 8) {
    const earliest = addDays(startOfWeek(), -7 * (weeksBack - 1));

    const reports = await prisma.report.findMany({
        where: { weekStartDate: { gte: earliest } },
        select: {
            weekStartDate: true,
            tasks: { select: { status: true } },
        },
        orderBy: { weekStartDate: 'asc' },
    });

    const byWeek = new Map();
    // Pre-populate with exactly N weeks
    for (let i = weeksBack - 1; i >= 0; i--) {
        const d = addDays(startOfWeek(), -7 * i).toISOString().slice(0, 10);
        byWeek.set(d, 0);
    }

    for (const r of reports) {
        const weekStartForReport = startOfWeek(r.weekStartDate).toISOString().slice(0, 10);
        const completed = r.tasks.filter((t) => t.status.toUpperCase() === 'COMPLETED').length;
        if (byWeek.has(weekStartForReport)) {
            byWeek.set(weekStartForReport, byWeek.get(weekStartForReport) + completed);
        }
    }

    return [...byWeek.entries()].map(([weekStartDate, completedTasks]) => ({ weekStartDate, completedTasks }));
}

// --- Submission/approval status by team member, for a given week ---
async function getStatusByMember(weekStartDate, weeksBack = 4) {
    const weekStart = startOfWeek(weekStartDate);
    const earliest = addDays(weekStart, -7 * (weeksBack - 1));

    const members = await prisma.user.findMany({
        where: { role: 'TEAM_MEMBER', isActive: true },
        select: { id: true, name: true },
    });

    const reports = await prisma.report.findMany({
        where: { weekStartDate: { gte: earliest, lt: addDays(weekStart, 7) } },
        select: { userId: true, status: true, weekStartDate: true },
    });

    const weeks = [];
    for (let i = weeksBack - 1; i >= 0; i--) {
        weeks.push(addDays(weekStart, -7 * i).toISOString().slice(0, 10));
    }

    const reportMap = new Map();
    for (const r of reports) {
        const w = startOfWeek(r.weekStartDate).toISOString().slice(0, 10);
        reportMap.set(`${r.userId}_${w}`, r.status);
    }

    return members.map((m) => {
        const statuses = weeks.map((w) => ({
            week: w,
            status: reportMap.get(`${m.id}_${w}`) || 'NOT_STARTED'
        }));
        return {
            userId: m.id,
            name: m.name,
            statuses,
        };
    });
}

// --- Workload / task distribution by project (all-time or filtered week) ---
async function getWorkloadByProject(weekStartDate) {
    let where = {};
    if (weekStartDate) {
        const weekStart = startOfWeek(weekStartDate);
        where = { weekStartDate: { gte: weekStart, lt: addDays(weekStart, 7) } };
    }

    const reports = await prisma.report.findMany({
        where,
        select: { project: { select: { name: true } }, tasks: { select: { id: true } } },
    });

    const byProject = new Map();
    for (const r of reports) {
        const name = r.project?.name || 'Unassigned';
        byProject.set(name, (byProject.get(name) || 0) + r.tasks.length);
    }

    return [...byProject.entries()].map(([project, taskCount]) => ({ project, taskCount }));
}

// --- Time spent by task type, team-wide ---
async function getTimeByTaskType(weekStartDate) {
    let where = {};
    if (weekStartDate) {
        const weekStart = startOfWeek(weekStartDate);
        where = { report: { weekStartDate: { gte: weekStart, lt: addDays(weekStart, 7) } } };
    }

    const grouped = await prisma.hoursBreakdown.groupBy({
        by: ['taskCategory'],
        where,
        _sum: { hoursSpent: true },
    });

    return grouped.map((g) => ({
        taskCategory: g.taskCategory,
        hours: Number(g._sum.hoursSpent || 0),
    }));
}

// --- Recent activity feed: submissions + review actions ---
async function getActivityFeed(limit = 10) {
    const recentSubmissions = await prisma.report.findMany({
        where: { submittedAt: { not: null } },
        orderBy: { submittedAt: 'desc' },
        take: limit,
        select: {
            id: true, submittedAt: true, status: true,
            user: { select: { name: true } },
            project: { select: { name: true } },
        },
    });

    const recentReviews = await prisma.reviewComment.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
            id: true, decision: true, createdAt: true, commentText: true,
            manager: { select: { name: true } },
            report: { select: { id: true, user: { select: { name: true } } } },
        },
    });

    const feed = [
        ...recentSubmissions.map((r) => ({
            type: 'SUBMISSION',
            timestamp: r.submittedAt,
            text: `${r.user.name} submitted a report for ${r.project?.name || 'a project'}`,
            reportId: r.id,
        })),
        ...recentReviews.map((rc) => ({
            type: 'REVIEW',
            timestamp: rc.createdAt,
            text: `${rc.manager.name} ${rc.decision === 'APPROVED' ? 'approved' : 'requested changes on'} ${rc.report.user.name}'s report`,
            reportId: rc.report.id,
        })),
    ];

    feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return feed.slice(0, limit);
}

async function getFullDashboardMetrics(weekStartDate) {
    const [summary, trend, statusByMember, workloadByProject, timeByTaskType, activityFeed] = await Promise.all([
        getSummaryMetrics(weekStartDate),
        getTasksCompletedTrend(8),
        getStatusByMember(weekStartDate),
        getWorkloadByProject(weekStartDate),
        getTimeByTaskType(weekStartDate),
        getActivityFeed(10),
    ]);

    return { summary, trend, statusByMember, workloadByProject, timeByTaskType, activityFeed };
}

module.exports = { getFullDashboardMetrics };