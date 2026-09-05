const bcrypt = require('bcrypt');
require('dotenv').config();
const prisma = require('../src/config/prisma');

const TASK_CATEGORIES = ['Development', 'Testing', 'Meetings', 'Documentation'];
const TASK_NAMES = [
    'Fix login redirect bug', 'Build project filter UI', 'Write API documentation',
    'Review pull requests', 'Update database schema', 'Client onboarding call',
    'Design dashboard mockups', 'Optimize query performance', 'Write unit tests',
    'Sprint planning meeting',
];

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function mondayOf(weeksAgo) {
    const now = new Date();
    const day = now.getUTCDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const thisMonday = new Date(now);
    thisMonday.setUTCDate(now.getUTCDate() + diffToMonday);
    thisMonday.setUTCHours(0, 0, 0, 0);
    thisMonday.setUTCDate(thisMonday.getUTCDate() - weeksAgo * 7);
    return thisMonday;
}

async function main() {
    console.log('Clearing existing data...');
    // Delete in dependency order (children first)
    await prisma.reviewComment.deleteMany();
    await prisma.reportVersion.deleteMany();
    await prisma.hoursBreakdown.deleteMany();
    await prisma.reportHighlight.deleteMany();
    await prisma.reportTask.deleteMany();
    await prisma.report.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    console.log('Creating users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const manager = await prisma.user.create({
        data: { name: 'Sarah Manager', email: 'manager@company.com', passwordHash, role: 'MANAGER' },
    });

    await prisma.user.create({
        data: { name: 'Alex Admin', email: 'admin@company.com', passwordHash, role: 'ADMIN' },
    });

    const memberNames = ['Priya Sharma', 'James Chen', 'Maria Garcia', 'Tom Wilson', 'Aisha Khan'];
    const members = [];
    for (const name of memberNames) {
        const email = name.toLowerCase().replace(' ', '.') + '@company.com';
        const member = await prisma.user.create({
            data: { name, email, passwordHash, role: 'TEAM_MEMBER' },
        });
        members.push(member);
    }

    console.log('Creating projects...');
    const projectNames = ['Client A', 'Internal Tooling', 'R&D', 'Marketing'];
    const projects = [];
    for (const name of projectNames) {
        const project = await prisma.project.create({ data: { name } });
        projects.push(project);
    }

    console.log('Creating reports across 4 weeks...');

    // For each of the last 4 weeks, each member gets a report in a semi-random status
    // Skip a few intentionally to represent "not yet started"
    const statusCycle = ['APPROVED', 'APPROVED', 'SUBMITTED', 'NEEDS_CORRECTION', 'DRAFT'];

    for (let weekIdx = 3; weekIdx >= 0; weekIdx--) {
        const weekStart = mondayOf(weekIdx);

        for (let m = 0; m < members.length; m++) {
            // Skip ~1 report per week to simulate "not started"
            if (weekIdx === 0 && m === members.length - 1) continue;

            const member = members[m];
            const project = randomFrom(projects);
            const targetStatus = weekIdx === 0 ? 'SUBMITTED' : randomFrom(statusCycle);

            const numTasks = 2 + Math.floor(Math.random() * 2); // 2-3 tasks
            const tasks = Array.from({ length: numTasks }).map(() => ({
                taskName: randomFrom(TASK_NAMES),
                priority: randomFrom(['LOW', 'MEDIUM', 'HIGH']),
                plannedPct: 100,
                actualPct: 60 + Math.floor(Math.random() * 41),
                status: randomFrom(['Completed', 'In Progress', 'Completed']),
                timePlannedHrs: 4 + Math.floor(Math.random() * 6),
                timeSpentHrs: 3 + Math.floor(Math.random() * 6),
                deliverable: 'Delivered as planned',
            }));

            const highlights = [
                { itemType: 'ACHIEVEMENT', description: 'Completed sprint goals on time', isKeyItem: true },
                {
                    itemType: 'BLOCKER', description: randomFrom([
                        'Waiting on API credentials from client',
                        'Blocked by unresolved merge conflict',
                        'Pending design approval',
                    ]), isKeyItem: true
                },
            ];

            const hoursBreakdown = TASK_CATEGORIES.map((cat) => ({
                taskCategory: cat,
                hoursSpent: Math.floor(Math.random() * 12),
            })).filter((h) => h.hoursSpent > 0);

            const report = await prisma.report.create({
                data: {
                    userId: member.id,
                    projectId: project.id,
                    weekStartDate: weekStart,
                    status: 'DRAFT', // start as draft, we advance it below
                    tasksNextWeek: 'Continue current sprint tasks and start planning next milestone.',
                    notesLinks: '',
                    tasks: { create: tasks },
                    highlights: { create: highlights },
                    hoursBreakdown: { create: hoursBreakdown },
                },
            });

            if (targetStatus === 'DRAFT') continue; // leave as-is

            // Simulate submit -> version 1
            await prisma.reportVersion.create({
                data: { reportId: report.id, versionNumber: 1, contentSnapshot: JSON.stringify(report) },
            });
            await prisma.report.update({
                where: { id: report.id },
                data: { status: 'SUBMITTED', currentVersion: 1, submittedAt: new Date(weekStart.getTime() + 6 * 86400000) },
            });

            if (targetStatus === 'SUBMITTED') continue;

            if (targetStatus === 'NEEDS_CORRECTION') {
                await prisma.reviewComment.create({
                    data: {
                        reportId: report.id,
                        versionId: (await prisma.reportVersion.findFirst({ where: { reportId: report.id } })).id,
                        managerId: manager.id,
                        decision: 'NEEDS_CORRECTION',
                        commentText: 'Please add more detail to the deliverables for each task.',
                    },
                });
                await prisma.report.update({ where: { id: report.id }, data: { status: 'NEEDS_CORRECTION' } });
                continue;
            }

            if (targetStatus === 'APPROVED') {
                await prisma.reviewComment.create({
                    data: {
                        reportId: report.id,
                        versionId: (await prisma.reportVersion.findFirst({ where: { reportId: report.id } })).id,
                        managerId: manager.id,
                        decision: 'APPROVED',
                        commentText: null,
                    },
                });
                await prisma.report.update({
                    where: { id: report.id },
                    data: { status: 'APPROVED', approvedAt: new Date() },
                });
            }
        }
    }

    console.log('Seed complete!');
    console.log('Login credentials (all use password: password123):');
    console.log('  Manager: manager@company.com');
    console.log('  Admin:   admin@company.com');
    memberNames.forEach((n) => {
        console.log(`  Member:  ${n.toLowerCase().replace(' ', '.')}@company.com`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });