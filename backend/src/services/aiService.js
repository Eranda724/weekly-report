const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/prisma');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

// Gathers a lightweight, privacy-conscious snapshot of data for a given week
async function getTeamContext(weekStartDate, user) {
    let where = {};
    if (weekStartDate) {
        const start = new Date(weekStartDate);
        const end = new Date(weekStartDate);
        end.setDate(end.getDate() + 7);
        where = { weekStartDate: { gte: start, lt: end } };
    }

    if (user.role === 'TEAM_MEMBER') {
        where.userId = user.id;
    }

    const reports = await prisma.report.findMany({
        where,
        select: {
            weekStartDate: true,
            status: true,
            tasksNextWeek: true,
            user: { select: { name: true } },
            project: { select: { name: true } },
            tasks: { select: { taskName: true, status: true, priority: true } },
            highlights: { select: { itemType: true, description: true, isKeyItem: true } },
        },
        orderBy: { weekStartDate: 'desc' },
        take: 30, // cap context size — keep prompts small and fast
    });

    // Build a compact plain-text summary rather than raw JSON dump —
    // cheaper on tokens and easier for the model to reason over
    return reports.map((r) => {
        const blockers = r.highlights.filter(h => h.itemType === 'BLOCKER').map(h => h.description).join('; ');
        const achievements = r.highlights.filter(h => h.itemType === 'ACHIEVEMENT').map(h => h.description).join('; ');
        const taskList = r.tasks.map(t => `${t.taskName} (${t.status})`).join(', ');
        return `- ${r.user.name} | ${r.project?.name || 'No project'} | Week of ${r.weekStartDate.toISOString().slice(0, 10)} | Status: ${r.status}
  Tasks: ${taskList || 'none'}
  Blockers: ${blockers || 'none'}
  Achievements: ${achievements || 'none'}`;
    }).join('\n\n');
}

async function askQuestion(question, user) {
    const context = await getTeamContext(null, user);

    let prompt;
    if (user.role === 'MANAGER' || user.role === 'ADMIN') {
        prompt = `You are an assistant helping a manager understand their team's weekly reports.
Answer the manager's question using ONLY the data below. If the data doesn't contain the answer, say so honestly rather than guessing.

TEAM DATA:
${context}

MANAGER'S QUESTION: ${question}`;
    } else {
        prompt = `You are an assistant helping a team member reflect on their own work and write their weekly reports.
Answer the team member's question using ONLY their data below. Help them describe blockers or achievements if they ask. If the data doesn't contain the answer, say so honestly rather than guessing.

MY DATA:
${context}

MY QUESTION: ${question}`;
    }

    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function generateWeeklySummary(weekStartDate, user) {
    const context = await getTeamContext(weekStartDate, user);

    let prompt;
    if (user.role === 'MANAGER' || user.role === 'ADMIN') {
        prompt = `You are summarizing a team's weekly reports for a manager.
Based on the data below, write a concise summary covering:
1. Key work completed across the team
2. Any recurring blockers or challenges
3. Any signs of workload imbalance (some people overloaded, others light)

Keep it to 3-4 short paragraphs, plain language, no headers needed.

TEAM DATA:
${context}`;
    } else {
        prompt = `You are summarizing your own weekly report.
Based on your data below, write a concise summary of your work this week:
1. Key tasks completed
2. Any blockers or challenges faced
3. Key achievements

Keep it to 2-3 short paragraphs, plain language, no headers needed.

MY DATA:
${context}`;
    }

    const result = await model.generateContent(prompt);
    return result.response.text();
}

module.exports = { askQuestion, generateWeeklySummary };