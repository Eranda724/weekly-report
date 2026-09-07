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

    const weekSep7  = new Date('2026-09-07T00:00:00.000Z');
    const weekSep5  = new Date('2026-09-05T00:00:00.000Z');
    const weekSep3  = new Date('2026-09-03T00:00:00.000Z');
    const weekSep1  = new Date('2026-09-01T00:00:00.000Z');
    const weekAug31 = new Date('2026-08-31T00:00:00.000Z');

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

        // =====================================================================
        // WEEK: Sep 5, 2026
        // =====================================================================

        // --- Sep5-1. Test User in spring1 ---
        {
            userId: memberTestUser.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep5,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Start working on JWT middleware and protected route guards',
            notesLinks: 'http://localhost:3000/reports',
            tasks: [
                {
                    taskName: 'Setup Express project structure and routing',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2.5,
                    deliverable: 'Modular routes and controllers structure ready',
                },
                {
                    taskName: 'Connect PostgreSQL using Prisma ORM',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2,
                    deliverable: 'Prisma client connected to local DB',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Backend scaffolding done in a single sprint day', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'Prisma migrations ran cleanly on first attempt', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Development', hoursSpent: 4.5 },
                { taskCategory: 'Database', hoursSpent: 2.0 },
            ],
            reviewComment: {
                managerId: managerEranda.id,
                decision: 'APPROVED',
                commentText: 'Good start on project structure. Clean and maintainable setup.',
            },
        },

        // --- Sep5-2. Saman Kumara in spring1 ---
        {
            userId: memberSaman.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep5,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Design database schema for weekly reports and add seed data',
            notesLinks: 'https://github.com/company/repo/pull/8',
            tasks: [
                {
                    taskName: 'Analyze requirements and define entity relationships',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2.5,
                    deliverable: 'ER diagram and data model documented',
                },
                {
                    taskName: 'Create initial Prisma schema for users and projects',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 4,
                    timeSpentHrs: 3.5,
                    deliverable: 'schema.prisma with User, Project, ProjectMember models',
                },
                {
                    taskName: 'Run first database migration and verify',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 1,
                    timeSpentHrs: 1,
                    deliverable: 'Migration applied on local and staging DB',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Full schema designed and migrated without issues', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Database', hoursSpent: 5.0 },
                { taskCategory: 'Development', hoursSpent: 2.0 },
            ],
            reviewComment: {
                managerId: managerEranda.id,
                decision: 'APPROVED',
                commentText: 'Schema looks solid. Good normalization decisions throughout.',
            },
        },

        // --- Sep5-3. Saman Kumara in Spring2 ---
        {
            userId: memberSaman.id,
            projectId: projectSpring2.id,
            weekStartDate: weekSep5,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Optimize query performance and add pagination support',
            notesLinks: 'https://datadog.internal/dashboards/db-queries',
            tasks: [
                {
                    taskName: 'Profile slow API queries and identify bottlenecks',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 3.5,
                    deliverable: 'Query profile report with top 5 slow queries identified',
                },
                {
                    taskName: 'Add database indexes for report queries',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 70,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 2,
                    timeSpentHrs: 1.5,
                    deliverable: 'Index migration created but not fully tested',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Identified 3 N+1 query issues in report fetch', isKeyItem: true },
                { itemType: 'BLOCKER', description: 'Need DBA approval for new index on production table', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Performance', hoursSpent: 3.5 },
                { taskCategory: 'Database', hoursSpent: 1.5 },
            ],
            reviewComment: null,
        },

        // --- Sep5-4. Ishan Dilan in spring1 ---
        {
            userId: memberIshan.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep5,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Build report submission form with task table and dynamic rows',
            notesLinks: 'http://localhost:3000/dashboard',
            tasks: [
                {
                    taskName: 'Create dashboard layout with stats overview cards',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 5,
                    timeSpentHrs: 4.5,
                    deliverable: 'Stats cards showing total reports, pending, approved counts',
                },
                {
                    taskName: 'Add loading skeleton states to all data components',
                    priority: 'LOW',
                    plannedPct: 100,
                    actualPct: 60,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 2,
                    timeSpentHrs: 1.5,
                    deliverable: 'Skeleton loaders added to cards, partial on table',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Dashboard overview feels snappy with skeleton loaders', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'Responsive grid layout works on all screen sizes', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Frontend UI', hoursSpent: 6.0 },
            ],
            reviewComment: null,
        },

        // --- Sep5-5. Thilina Madush in spring1 ---
        {
            userId: memberThilina.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep5,
            status: 'NEEDS_CORRECTION',
            currentVersion: 1,
            tasksNextWeek: 'Rework the admin user table with server-side filtering',
            notesLinks: 'http://localhost:3000/admin/users',
            tasks: [
                {
                    taskName: 'Build admin panel for user role management',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 70,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 6,
                    timeSpentHrs: 5,
                    deliverable: 'Basic user list with role badge, edit button pending',
                },
                {
                    taskName: 'Add client-side filtering for user table',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 40,
                    status: 'BLOCKED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2,
                    deliverable: 'Filter input wired but not fully functional',
                },
            ],
            highlights: [
                { itemType: 'BLOCKER', description: 'Client-side filter breaks on large datasets > 200 rows', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'Admin panel structure and routing set up', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Frontend UI', hoursSpent: 5.0 },
                { taskCategory: 'Research', hoursSpent: 2.0 },
            ],
            reviewComment: {
                managerId: managerSarah.id,
                decision: 'NEEDS_CORRECTION',
                commentText: 'Switch to server-side pagination and filtering. Client-side wont scale.',
            },
        },

        // --- Sep5-6. Thilina Madush in Spring2 ---
        {
            userId: memberThilina.id,
            projectId: projectSpring2.id,
            weekStartDate: weekSep5,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Add PDF export feature and report version history view',
            notesLinks: 'https://github.com/company/repo/pull/38',
            tasks: [
                {
                    taskName: 'Design report submission form UI with dynamic task table',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 6,
                    timeSpentHrs: 5.5,
                    deliverable: 'Multi-row task form with add/remove rows and auto calculation',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Dynamic task table is intuitive and fully functional', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Frontend UI', hoursSpent: 5.5 },
            ],
            reviewComment: {
                managerId: managerEranda.id,
                decision: 'APPROVED',
                commentText: 'The dynamic task table works great. Clean UX with no janky behavior.',
            },
        },

        // --- Sep5-7. Pasidu Asela in spring1 ---
        {
            userId: memberPasidu.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep5,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Write tests for report submission and manager review endpoints',
            notesLinks: 'https://github.com/company/repo/actions/runs/1234',
            tasks: [
                {
                    taskName: 'Setup Jest with Supertest for integration testing',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2.5,
                    deliverable: 'Test runner integrated into CI/CD pipeline',
                },
                {
                    taskName: 'Write unit tests for user and project controllers',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 4,
                    timeSpentHrs: 3.5,
                    deliverable: '18 passing tests for user and project CRUD',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'CI pipeline now runs tests on every pull request', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'QA & Testing', hoursSpent: 6.0 },
            ],
            reviewComment: {
                managerId: managerTest.id,
                decision: 'APPROVED',
                commentText: 'Great test coverage. Supertest integration is clean and reliable.',
            },
        },

        // --- Sep5-8. Pasidu Asela in Spring2 ---
        {
            userId: memberPasidu.id,
            projectId: projectSpring2.id,
            weekStartDate: weekSep5,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Improve CI/CD pipeline with staging environment deployments',
            notesLinks: 'https://github.com/company/repo/deployments',
            tasks: [
                {
                    taskName: 'Configure environment variable management for staging',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 80,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2.5,
                    deliverable: '.env.staging configured, secrets pending in GitHub',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Staging environment config laid out correctly', isKeyItem: false },
                { itemType: 'BLOCKER', description: 'Waiting for DevOps team to provision staging secrets', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'DevOps', hoursSpent: 2.5 },
            ],
            reviewComment: null,
        },

        // =====================================================================
        // WEEK: Sep 3, 2026
        // =====================================================================

        // --- Sep3-1. Test User in spring1 ---
        {
            userId: memberTestUser.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep3,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Finalize backend routes for report CRUD and test with Postman',
            notesLinks: 'http://localhost:3000',
            tasks: [
                {
                    taskName: 'Implement user registration and login endpoints',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 4,
                    timeSpentHrs: 3.5,
                    deliverable: 'POST /auth/register and /auth/login working with bcrypt',
                },
                {
                    taskName: 'Add input validation middleware using express-validator',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 80,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2.5,
                    deliverable: 'Validation added on register route, login pending',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Auth endpoints verified with Postman collections', isKeyItem: true },
                { itemType: 'BLOCKER', description: 'express-validator docs unclear on custom messages', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Development', hoursSpent: 6.0 },
            ],
            reviewComment: null,
        },

        // --- Sep3-2. Saman Kumara in spring1 ---
        {
            userId: memberSaman.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep3,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Begin implementing report CRUD API with authorization middleware',
            notesLinks: 'https://github.com/company/repo/pull/5',
            tasks: [
                {
                    taskName: 'Build CRUD endpoints for Project resource',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 5,
                    timeSpentHrs: 4,
                    deliverable: 'Full CRUD for projects with role-based authorization',
                },
                {
                    taskName: 'Write Prisma seed script with realistic data',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2,
                    deliverable: 'Seed populates users, projects, and memberships',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'RBAC middleware working correctly for all project routes', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Development', hoursSpent: 4.0 },
                { taskCategory: 'Database', hoursSpent: 2.0 },
            ],
            reviewComment: {
                managerId: managerTest.id,
                decision: 'APPROVED',
                commentText: 'RBAC implementation is solid. Good separation of concerns in middleware.',
            },
        },

        // --- Sep3-3. Ishan Dilan in spring1 ---
        {
            userId: memberIshan.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep3,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Build stats cards for dashboard and wire to backend data',
            notesLinks: 'http://localhost:3000/login',
            tasks: [
                {
                    taskName: 'Build authentication pages (login, register)',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 5,
                    timeSpentHrs: 4.5,
                    deliverable: 'Login and register pages styled and wired to backend',
                },
                {
                    taskName: 'Implement auth context and token persistence',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2.5,
                    deliverable: 'JWT stored in localStorage, auto refresh on reload',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Full auth flow working end-to-end with the backend', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'Protected route redirect works for unauthenticated users', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Frontend UI', hoursSpent: 4.5 },
                { taskCategory: 'Fullstack', hoursSpent: 2.5 },
            ],
            reviewComment: {
                managerId: managerSarah.id,
                decision: 'APPROVED',
                commentText: 'Auth flow is seamless! The protected route redirect is a nice touch.',
            },
        },

        // --- Sep3-4. Ishan Dilan in Spring2 ---
        {
            userId: memberIshan.id,
            projectId: projectSpring2.id,
            weekStartDate: weekSep3,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Add manager-side report review and approve workflow',
            notesLinks: 'http://localhost:3000/reports/submit',
            tasks: [
                {
                    taskName: 'Build report submission page with form validation',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 90,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 6,
                    timeSpentHrs: 5,
                    deliverable: 'Form submits, validation works, success toast shows',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Report form handles all edge cases gracefully', isKeyItem: true },
                { itemType: 'BLOCKER', description: 'Date picker component has a timezone offset bug', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Frontend UI', hoursSpent: 5.0 },
            ],
            reviewComment: null,
        },

        // --- Sep3-5. Thilina Madush in Spring2 ---
        {
            userId: memberThilina.id,
            projectId: projectSpring2.id,
            weekStartDate: weekSep3,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Refine task table UI and add row-level priority color coding',
            notesLinks: 'https://github.com/company/repo/pull/32',
            tasks: [
                {
                    taskName: 'Create shared component library for cards and badges',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 4,
                    timeSpentHrs: 3.5,
                    deliverable: 'StatusBadge, PriorityBadge, and Card components published',
                },
                {
                    taskName: 'Standardize color tokens and spacing variables across app',
                    priority: 'LOW',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2,
                    deliverable: 'CSS variables updated globally in globals.css',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Shared component library speeds up future UI work', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Styling', hoursSpent: 2.0 },
                { taskCategory: 'Frontend UI', hoursSpent: 3.5 },
            ],
            reviewComment: {
                managerId: managerEranda.id,
                decision: 'APPROVED',
                commentText: 'Component reusability is great. Will save a lot of time going forward.',
            },
        },

        // --- Sep3-6. Pasidu Asela in spring1 ---
        {
            userId: memberPasidu.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep3,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Expand test coverage to include edge cases for auth and report routes',
            notesLinks: 'https://github.com/company/repo/actions/runs/1100',
            tasks: [
                {
                    taskName: 'Write integration tests for project and user endpoints',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 90,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 5,
                    timeSpentHrs: 4.5,
                    deliverable: '20 tests passing, 3 skipped for mock setup',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: '90% of planned test cases completed', isKeyItem: true },
                { itemType: 'BLOCKER', description: 'Mocking Prisma client in test env is complex', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'QA & Testing', hoursSpent: 4.5 },
            ],
            reviewComment: null,
        },

        // =====================================================================
        // WEEK: Sep 1, 2026
        // =====================================================================

        // --- Sep1-1. Saman Kumara in spring1 ---
        {
            userId: memberSaman.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep1,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Build project CRUD routes and add role checks to middleware',
            notesLinks: 'https://github.com/company/repo/pull/2',
            tasks: [
                {
                    taskName: 'Initialize Node.js backend with Express and Prisma',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2.5,
                    deliverable: 'Server running on port 5000 with hello world route',
                },
                {
                    taskName: 'Setup .env configuration and dotenv loading',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 1,
                    timeSpentHrs: 0.5,
                    deliverable: 'Environment variables loaded from .env file',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Backend initialized and running in under 3 hours', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Development', hoursSpent: 3.0 },
            ],
            reviewComment: {
                managerId: managerEranda.id,
                decision: 'APPROVED',
                commentText: 'Great project kickoff! Clean structure from day one.',
            },
        },

        // --- Sep1-2. Ishan Dilan in spring1 ---
        {
            userId: memberIshan.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep1,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Build login and register pages and connect to backend auth',
            notesLinks: 'https://github.com/company/repo/pull/3',
            tasks: [
                {
                    taskName: 'Initialize Next.js 14 project with app router',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 1.5,
                    deliverable: 'Next.js app boilerplate with TypeScript configured',
                },
                {
                    taskName: 'Install and configure design system dependencies',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2,
                    deliverable: 'Google Fonts, CSS variables, and global styles set up',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Frontend project ready for feature development', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Frontend UI', hoursSpent: 3.5 },
            ],
            reviewComment: {
                managerId: managerSarah.id,
                decision: 'APPROVED',
                commentText: 'Great setup. The design system config will save us a lot of time.',
            },
        },

        // --- Sep1-3. Thilina Madush in spring1 ---
        {
            userId: memberThilina.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep1,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Build shared UI components for the entire application',
            notesLinks: 'https://github.com/company/repo',
            tasks: [
                {
                    taskName: 'Research UI/UX design patterns for dashboards',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2.5,
                    deliverable: 'Figma wireframes sketched for main screens',
                },
                {
                    taskName: 'Define color palette and typography for app',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 80,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 2,
                    timeSpentHrs: 1.5,
                    deliverable: 'Color tokens draft in CSS variables',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Wireframes approved by team in first review', isKeyItem: false },
                { itemType: 'ACHIEVEMENT', description: 'Design system direction agreed upon by all members', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Research', hoursSpent: 2.5 },
                { taskCategory: 'Styling', hoursSpent: 1.5 },
            ],
            reviewComment: null,
        },

        // --- Sep1-4. Pasidu Asela in spring1 ---
        {
            userId: memberPasidu.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep1,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Setup Jest and Supertest for backend integration tests',
            notesLinks: 'https://github.com/company/repo/actions',
            tasks: [
                {
                    taskName: 'Configure GitHub Actions workflow for CI',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2.5,
                    deliverable: 'CI pipeline triggers on PR and push to main',
                },
                {
                    taskName: 'Setup Docker and docker-compose for local dev',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 3,
                    deliverable: 'docker-compose.yml with backend and postgres services',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'CI/CD pipeline live on day 2 of the project', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'DevOps', hoursSpent: 5.5 },
            ],
            reviewComment: {
                managerId: managerEranda.id,
                decision: 'APPROVED',
                commentText: 'CI pipeline from day one is excellent. Sets a great foundation.',
            },
        },

        // --- Sep1-5. Test User in spring1 ---
        {
            userId: memberTestUser.id,
            projectId: projectSpring1.id,
            weekStartDate: weekSep1,
            status: 'NEEDS_CORRECTION',
            currentVersion: 1,
            tasksNextWeek: 'Re-implement auth using proper bcrypt and fix token handling',
            notesLinks: 'http://localhost:3000',
            tasks: [
                {
                    taskName: 'Study Express.js and REST API fundamentals',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 4,
                    deliverable: 'Notes and basic hello world endpoint created',
                },
                {
                    taskName: 'Attempt first auth endpoint (login)',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 50,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 3,
                    timeSpentHrs: 3.5,
                    deliverable: 'Login endpoint returns token but not hashing passwords',
                },
            ],
            highlights: [
                { itemType: 'BLOCKER', description: 'Not sure how to properly hash passwords before storing', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Development', hoursSpent: 7.5 },
            ],
            reviewComment: {
                managerId: managerEranda.id,
                decision: 'NEEDS_CORRECTION',
                commentText: 'You must hash passwords using bcrypt before storing. Never store plain text. Please fix this.',
            },
        },

        // =====================================================================
        // WEEK: Aug 31, 2026
        // =====================================================================

        // --- Aug31-1. Saman Kumara in spring1 ---
        {
            userId: memberSaman.id,
            projectId: projectSpring1.id,
            weekStartDate: weekAug31,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Initialize backend project and set up Prisma with PostgreSQL',
            notesLinks: 'https://github.com/company/repo',
            tasks: [
                {
                    taskName: 'Project kickoff meeting and requirements gathering',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2,
                    deliverable: 'Requirements doc and task breakdown shared on Notion',
                },
                {
                    taskName: 'Setup GitHub repository with branch protection rules',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 1,
                    timeSpentHrs: 1,
                    deliverable: 'main branch protected, PR review required',
                },
                {
                    taskName: 'Draft initial database entity diagram',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2.5,
                    deliverable: 'ER diagram with User, Project, Report, Task entities',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Team aligned on requirements and tech stack on day 1', isKeyItem: true },
                { itemType: 'ACHIEVEMENT', description: 'GitHub repo with proper branching strategy configured', isKeyItem: false },
            ],
            hoursBreakdown: [
                { taskCategory: 'Planning', hoursSpent: 4.0 },
                { taskCategory: 'Development', hoursSpent: 1.5 },
            ],
            reviewComment: {
                managerId: managerEranda.id,
                decision: 'APPROVED',
                commentText: 'Strong start to the project. Entity diagram is well structured.',
            },
        },

        // --- Aug31-2. Ishan Dilan in spring1 ---
        {
            userId: memberIshan.id,
            projectId: projectSpring1.id,
            weekStartDate: weekAug31,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Initialize Next.js frontend project and install dependencies',
            notesLinks: 'https://github.com/company/repo',
            tasks: [
                {
                    taskName: 'Attend kickoff and define frontend scope',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2,
                    deliverable: 'Frontend feature list and page map drafted',
                },
                {
                    taskName: 'Research Next.js 14 app router and server components',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 3.5,
                    deliverable: 'Learning notes and POC component created',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Understood Next.js 14 app router paradigm shift', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Research', hoursSpent: 3.5 },
                { taskCategory: 'Planning', hoursSpent: 2.0 },
            ],
            reviewComment: {
                managerId: managerSarah.id,
                decision: 'APPROVED',
                commentText: 'Good research groundwork. Next.js 14 knowledge will be crucial.',
            },
        },

        // --- Aug31-3. Thilina Madush in spring1 ---
        {
            userId: memberThilina.id,
            projectId: projectSpring1.id,
            weekStartDate: weekAug31,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Create Figma wireframes for all main app screens',
            notesLinks: 'https://figma.com/team/project',
            tasks: [
                {
                    taskName: 'Kickoff meeting and UI/UX responsibility scoping',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2,
                    deliverable: 'Design ownership confirmed, Figma workspace created',
                },
                {
                    taskName: 'Research modern dashboard UI patterns and references',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 90,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 3,
                    timeSpentHrs: 3,
                    deliverable: 'Reference board with 20+ examples on Figma',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Strong reference collection for design inspiration', isKeyItem: false },
                { itemType: 'ACHIEVEMENT', description: 'Design direction agreed upon with full team', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Research', hoursSpent: 3.0 },
                { taskCategory: 'Planning', hoursSpent: 2.0 },
            ],
            reviewComment: null,
        },

        // --- Aug31-4. Pasidu Asela in spring1 ---
        {
            userId: memberPasidu.id,
            projectId: projectSpring1.id,
            weekStartDate: weekAug31,
            status: 'APPROVED',
            currentVersion: 1,
            tasksNextWeek: 'Set up GitHub Actions CI and Docker Compose for local dev',
            notesLinks: 'https://github.com/company/repo',
            tasks: [
                {
                    taskName: 'Kickoff meeting and DevOps planning session',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2,
                    deliverable: 'CI/CD pipeline plan and tooling choices finalized',
                },
                {
                    taskName: 'Research Docker and GitHub Actions best practices',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 3,
                    timeSpentHrs: 2.5,
                    deliverable: 'Documented strategy for containerized CI workflow',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'DevOps strategy clearly defined for entire sprint', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Planning', hoursSpent: 2.0 },
                { taskCategory: 'Research', hoursSpent: 2.5 },
            ],
            reviewComment: {
                managerId: managerTest.id,
                decision: 'APPROVED',
                commentText: 'Excellent planning for DevOps. Docker + CI combo is the right call.',
            },
        },

        // --- Aug31-5. Test User in spring1 ---
        {
            userId: memberTestUser.id,
            projectId: projectSpring1.id,
            weekStartDate: weekAug31,
            status: 'SUBMITTED',
            currentVersion: 1,
            tasksNextWeek: 'Learn Express.js basics and build first REST endpoint',
            notesLinks: 'https://expressjs.com/en/starter/hello-world.html',
            tasks: [
                {
                    taskName: 'Attend project kickoff meeting',
                    priority: 'HIGH',
                    plannedPct: 100,
                    actualPct: 100,
                    status: 'COMPLETED',
                    timePlannedHrs: 2,
                    timeSpentHrs: 2,
                    deliverable: 'Understood project requirements and assigned tasks',
                },
                {
                    taskName: 'Study Node.js fundamentals and async programming',
                    priority: 'MEDIUM',
                    plannedPct: 100,
                    actualPct: 70,
                    status: 'IN PROGRESS',
                    timePlannedHrs: 4,
                    timeSpentHrs: 3,
                    deliverable: 'Completed chapters 1-4 of Node.js crash course',
                },
            ],
            highlights: [
                { itemType: 'ACHIEVEMENT', description: 'Good understanding of async/await after study session', isKeyItem: false },
                { itemType: 'BLOCKER', description: 'No prior Node.js experience, learning curve is steep', isKeyItem: true },
            ],
            hoursBreakdown: [
                { taskCategory: 'Learning', hoursSpent: 3.0 },
                { taskCategory: 'Planning', hoursSpent: 2.0 },
            ],
            reviewComment: null,
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