require('dotenv').config();
const prisma = require('../src/config/prisma');
const bcrypt = require('bcrypt');

async function main() {
    console.log('--- Starting Database Seeding ---');

    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    // 1. Create/Verify Admin
    console.log('1. Verifying Admin account...');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@company.com',
            passwordHash: defaultPasswordHash,
            role: 'ADMIN',
            isActive: true,
        },
    });

    // 2. Create/Verify Managers
    console.log('2. Verifying Managers...');
    const managerEranda = await prisma.user.upsert({
        where: { email: 'seranda570@gmail.com' },
        update: {},
        create: {
            name: 'Eranda Jayasinghe',
            email: 'seranda570@gmail.com',
            passwordHash: defaultPasswordHash,
            role: 'MANAGER',
            isActive: true,
        },
    });

    const managerSarah = await prisma.user.upsert({
        where: { email: 'sarah@gmail.com' },
        update: {},
        create: {
            name: 'sarah el',
            email: 'sarah@gmail.com',
            passwordHash: defaultPasswordHash,
            role: 'MANAGER',
            isActive: true,
        },
    });

    const managerTest = await prisma.user.upsert({
        where: { email: 'manager@gmail.com' },
        update: {},
        create: {
            name: 'test manager',
            email: 'manager@gmail.com',
            passwordHash: defaultPasswordHash,
            role: 'MANAGER',
            isActive: true,
        },
    });

    // 3. Create/Verify Team Members
    console.log('3. Verifying Team Members...');
    const memberSaman = await prisma.user.upsert({
        where: { email: 'saman@gmail.com' },
        update: {},
        create: {
            name: 'saman kumara',
            email: 'saman@gmail.com',
            passwordHash: defaultPasswordHash,
            role: 'TEAM_MEMBER',
            isActive: true,
        },
    });

    const memberIshan = await prisma.user.upsert({
        where: { email: 'ishan@gmail.com' },
        update: {},
        create: {
            name: 'ishan dilan',
            email: 'ishan@gmail.com',
            passwordHash: defaultPasswordHash,
            role: 'TEAM_MEMBER',
            isActive: true,
        },
    });

    const memberThilina = await prisma.user.upsert({
        where: { email: 'thilina@gamil.com' },
        update: {},
        create: {
            name: 'thilina madush',
            email: 'thilina@gamil.com',
            passwordHash: defaultPasswordHash,
            role: 'TEAM_MEMBER',
            isActive: true,
        },
    });

    const memberPasidu = await prisma.user.upsert({
        where: { email: 'pasidu@gmail.com' },
        update: {},
        create: {
            name: 'pasidu asela',
            email: 'pasidu@gmail.com',
            passwordHash: defaultPasswordHash,
            role: 'TEAM_MEMBER',
            isActive: true,
        },
    });

    const memberTestUser = await prisma.user.upsert({
        where: { email: 'user@gmail.com' },
        update: {},
        create: {
            name: 'test user',
            email: 'user@gmail.com',
            passwordHash: defaultPasswordHash,
            role: 'TEAM_MEMBER',
            isActive: true,
        },
    });

    // 4. Create/Verify Projects (Teams)
    console.log('4. Verifying Teams/Projects...');
    let projectSpring1 = await prisma.project.findFirst({ where: { name: 'spring1' } });
    if (!projectSpring1) {
        projectSpring1 = await prisma.project.create({
            data: { name: 'spring1', isActive: true },
        });
    }

    let projectSpring2 = await prisma.project.findFirst({ where: { name: 'Spring2' } });
    if (!projectSpring2) {
        projectSpring2 = await prisma.project.create({
            data: { name: 'Spring2', isActive: true },
        });
    }

    // 5. Ensure Memberships in Projects
    console.log('5. Ensuring Team Memberships...');
    const spring1Members = [managerSarah.id, managerTest.id, managerEranda.id, memberTestUser.id, memberSaman.id, memberIshan.id, memberThilina.id, memberPasidu.id];
    for (const uid of spring1Members) {
        await prisma.projectMember.upsert({
            where: { projectId_userId: { projectId: projectSpring1.id, userId: uid } },
            update: {},
            create: { projectId: projectSpring1.id, userId: uid },
        });
    }

    const spring2Members = [managerEranda.id, memberSaman.id, memberIshan.id, memberThilina.id, memberPasidu.id];
    for (const uid of spring2Members) {
        await prisma.projectMember.upsert({
            where: { projectId_userId: { projectId: projectSpring2.id, userId: uid } },
            update: {},
            create: { projectId: projectSpring2.id, userId: uid },
        });
    }

    // 6. Reports Definition List
    console.log('6. Seeding Reports for Team Members across Teams...');

    const weekSep7 = new Date('2026-09-07T00:00:00.000Z');

    const reportsToSeed = [
        // --- 1. Test User in spring1 (User Reference Report) ---
        {
            userId: memberTestUser.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep7,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'finalize jwt method and all routes',
            notesLinks: 'http://localhost:3000/reports/new',
            tasks: [
                {
                    taskName: 'Build login and register backend',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 1.5,
                    deliverable: 'backend test with postman register and login',
                },
                {
                    taskName: 'Build login and register ui',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 90,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 1,
                    timeSpentHrs: 1,
                    deliverable: 'ui fix',
                },
                {
                    taskName: 'make jwt authentication',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 50,
                    status: 'BLOCKED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 4,
                    deliverable: 'need to know how method for use for the jwt',
                },
            ],
            highlights: [
                { itemType: 'BLOCKER', description: 'how to add jwt authentication', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'make ui componant and routes for login and register', isKeyItem: false },
                { itemType: 'ACHIEVEMENT', description: 'use postman to run backend logics', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Development', hoursSpent: 5.0 },
                { taskCategory: 'Testing', hoursSpent: 1.5 },
            ],
            reviewComment: null,
        },

        // --- 2. Saman Kumara in spring1 ---
        {
            userId: memberSaman.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep7,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Complete unit tests for team controller and integrate with frontend',
            notesLinks: 'https://github.com/company/repo/pull/12',
            tasks: [
                {
                    taskName: 'Design database schema for weekly reports',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 4,
                    timeSpentHrs: 3.5,
                    deliverable: 'Prisma schema & migrations done',
                },
                {
                    taskName: 'Setup PostgreSQL connection and seed scripts',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2.5,
                    deliverable: 'Database initialized and working',
                },
                {
                    taskName: 'Implement CRUD API for project teams',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 80,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 5,
                    timeSpentHrs: 4,
                    deliverable: 'API routes implemented, testing edge cases',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Completed database setup ahead of schedule', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'Created initial schema with zero migration conflicts', isKeyItem: false },
                { itemType: 'BLOCKER', description: 'Need API specs confirmation for role-based permissions', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Development', hoursSpent: 6.0 },
                { taskCategory: 'Database', hoursSpent: 4.0 },
            ],
            reviewComment: {
                managerId: managerTest.id,
                decision: 'APPROVED',
                commentText: 'Great work on the database setup and migrations! Clean and well documented.',
            },
        },

        // --- 3. Saman Kumara in Spring2 ---
        {
            userId: memberSaman.id,
            projectId: projectSpring2.id,
            weekStartDate: weekSep7,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Reach 90% code coverage on all core endpoints',
            notesLinks: 'https://datadog.internal/dashboards/api-latency',
            tasks: [
                {
                    taskName: 'Optimize API latency for dashboard metrics',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 4,
                    timeSpentHrs: 3,
                    deliverable: 'Redis cache layer added',
                },
                {
                    taskName: 'Write API integration tests',
                    priority: 'LOW',
                    plannedPct: 100,
                    actualPct: 70,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 4,
                    timeSpentHrs: 3.5,
                    deliverable: 'Coverage up to 82%',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Decreased dashboard query time by 40%', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Testing', hoursSpent: 3.5 },
                { taskCategory: 'Performance', hoursSpent: 3.0 },
            ],
            reviewComment: null,
        },

        // --- 4. Ishan Dilan in spring1 ---
        {
            userId: memberIshan.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep7,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Implement team member filtering and pagination on all reports table',
            notesLinks: 'http://localhost:3000/reports',
            tasks: [
                {
                    taskName: 'Setup Next.js 14 app router and base styling',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 4,
                    timeSpentHrs: 4,
                    deliverable: 'Base layout, fonts, and dark mode configured',
                },
                {
                    taskName: 'Build responsive Manager Navigation Sidebar',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2.5,
                    deliverable: 'Collapsible navigation with active route highlights',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Established clean component hierarchy for frontend', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'Ensured 100% accessibility compliance on sidebar', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Frontend UI', hoursSpent: 6.5 },
                { taskCategory: 'Accessibility', hoursSpent: 1.5 },
            ],
            reviewComment: {
                managerId: managerSarah.id,
                decision: 'APPROVED',
                commentText: 'The sidebar looks very clean and responsive on mobile and desktop!',
            },
        },

        // --- 5. Ishan Dilan in Spring2 ---
        {
            userId: memberIshan.id,
            projectId: projectSpring2.id,
            weekStartDate: weekSep7,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Add email notifications on report status change',
            notesLinks: 'http://localhost:3000/dashboard/reports',
            tasks: [
                {
                    taskName: 'Implement Manager Review & Correction Workflow',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 6,
                    timeSpentHrs: 5,
                    deliverable: 'Approve and Request Correction modal working',
                },
                {
                    taskName: 'Add comment thread to reviewed versions',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 80,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 4,
                    timeSpentHrs: 3,
                    deliverable: 'ReviewComment entity integrated',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Managers can now seamlessly approve or ask for corrections', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'Real-time state transitions verified', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Fullstack', hoursSpent: 6.0 },
                { taskCategory: 'Testing', hoursSpent: 2.0 },
            ],
            reviewComment: null,
        },

        // --- 6. Thilina Madush in spring1 ---
        {
            userId: memberThilina.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep7,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Implement bulk actions for member invitations',
            notesLinks: 'http://localhost:3000/admin/users',
            tasks: [
                {
                    taskName: 'Build user management dashboard UI',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 6,
                    timeSpentHrs: 5.5,
                    deliverable: 'User table, role dropdowns and modals complete',
                },
                {
                    taskName: 'Implement dark mode theme switcher',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2.5,
                    deliverable: 'Dark mode support across all pages',
                },
                {
                    taskName: 'Fix calendar date picker icon in dark mode',
                    priority: 'LOW',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 1.5,
                    timeSpentHrs: 1,
                    deliverable: 'Color scheme dark applied',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Delivered responsive UI on time', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'Polished dark mode theme with zero contrast issues', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Frontend UI', hoursSpent: 6.5 },
                { taskCategory: 'Styling', hoursSpent: 2.5 },
            ],
            reviewComment: {
                managerId: managerEranda.id,
                decision: 'APPROVED',
                commentText: 'Excellent job on dark mode theme consistency across all views!',
            },
        },

        // --- 7. Thilina Madush in Spring2 ---
        {
            userId: memberThilina.id,
            projectId: projectSpring2.id,
            weekStartDate: weekSep7,
            status: 'NEEDS_CORRECTION',
            currentVersion: 1,
            tasksNextWeek: 'Evaluate server-side PDF generation alternatives',
            notesLinks: 'https://github.com/company/repo/issues/45',
            tasks: [
                {
                    taskName: 'Refactor ReportForm task table component',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 85,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 5,
                    timeSpentHrs: 4.5,
                    deliverable: 'Dynamic row calculation and priority badges',
                },
                {
                    taskName: 'Add export to PDF / CSV feature',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 30,
                    status: 'BLOCKED',
                    timePlannedHrs: 4,
                    timeSpentHrs: 2,
                    deliverable: 'Investigating client-side PDF generation library',
                },
            ],
            highlights: [
                { itemType: 'BLOCKER', description: 'Client-side PDF library bundle size is too large (adds 2MB)', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'Clean component abstraction for task table rows', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Frontend', hoursSpent: 4.5 },
                { taskCategory: 'Research', hoursSpent: 2.0 },
            ],
            reviewComment: {
                managerId: managerTest.id,
                decision: 'NEEDS_CORRECTION',
                commentText: 'Please consider a server-side endpoint with Puppeteer or pdfkit rather than heavy client bundles.',
            },
        },

        // --- 8. Pasidu Asela in spring1 ---
        {
            userId: memberPasidu.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep7,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Write end-to-end Cypress tests for report submission flow',
            notesLinks: 'https://github.com/company/repo/actions',
            tasks: [
                {
                    taskName: 'Set up Jest testing framework and mock data',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 4,
                    timeSpentHrs: 4,
                    deliverable: 'Test suite runs in CI pipeline',
                },
                {
                    taskName: 'Write tests for auth middleware and role protection',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 5,
                    timeSpentHrs: 4.5,
                    deliverable: '12 test cases covering JWT and role boundaries',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Automated testing pipeline running on every commit', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'Caught 2 authorization edge-cases early', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'QA & Testing', hoursSpent: 8.5 },
            ],
            reviewComment: null,
        },

        // --- 9. Pasidu Asela in Spring2 ---
        {
            userId: memberPasidu.id,
            projectId: projectSpring2.id,
            weekStartDate: weekSep7,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Add deployment preview environments',
            notesLinks: 'https://github.com/company/repo/deployments',
            tasks: [
                {
                    taskName: 'Configure Docker Compose for local development',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2,
                    deliverable: 'docker-compose.yml ready with postgres',
                },
                {
                    taskName: 'Setup GitHub Actions CI workflow',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 4,
                    timeSpentHrs: 3.5,
                    deliverable: 'Lint and test runners configured',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Standardized onboarding with single docker-compose up command', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'DevOps', hoursSpent: 5.5 },
            ],
            reviewComment: {
                managerId: managerEranda.id,
                decision: 'APPROVED',
                commentText: 'The docker compose setup worked smoothly on first try! Well done.',
            },
        },
    ];

    for (const r of reportsToSeed) {
        // Upsert or clean-recreate report for this user, project, and week
        const existing = await prisma.report.findUnique({
            where: {
                userId_projectId_weekStartDate: {
                    userId: r.userId,
                    projectId: r.projectId,
                    weekStartDate: r.weekStartDate,
                },
            },
        });

        if (existing) {
            await prisma.report.delete({ where: { id: existing.id } });
        }

        const report = await prisma.report.create({
            data: {
                userId: r.userId,
                projectId: r.projectId,
                weekStartDate: r.weekStartDate,
                status: r.status,
                currentVersion: r.currentVersion,
                tasksNextWeek: r.tasksNextWeek,
                notesLinks: r.notesLinks,
                submittedAt: ['SUBMITTED', 'APPROVED', 'NEEDS_CORRECTION'].includes(r.status) ? new Date() : null,
                approvedAt: r.status === 'APPROVED' ? new Date() : null,
                tasks: {
                    create: r.tasks.map(t => ({
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
                    create: r.highlights.map(h => ({
                        itemType: h.itemType,
                        description: h.description,
                        isKeyItem: h.isKeyItem,
                    })),
                },
                hoursBreakdown: {
                    create: r.hoursBreakdown.map(hb => ({
                        taskCategory: hb.taskCategory,
                        hoursSpent: hb.hoursSpent,
                    })),
                },
            },
            include: { tasks: true, highlights: true, hoursBreakdown: true, project: true },
        });

        // Add version snapshot
        const version = await prisma.reportVersion.create({
            data: {
                reportId: report.id,
                versionNumber: 1,
                contentSnapshot: JSON.stringify(report),
                submittedAt: new Date(),
            },
        });

        // Add review comment if present
        if (r.reviewComment) {
            await prisma.reviewComment.create({
                data: {
                    reportId: report.id,
                    versionId: version.id,
                    managerId: r.reviewComment.managerId,
                    decision: r.reviewComment.decision,
                    commentText: r.reviewComment.commentText,
                },
            });
        }

        console.log(` Created report for user ${r.userId.slice(0, 8)} in project ${r.projectId.slice(0, 8)} [${r.status}]`);
    }

    console.log('--- Database Seeding Complete! ---');
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });