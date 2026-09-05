const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/prisma');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

// Gathers a lightweight, privacy-conscious snapshot of team data for a given week
async function getTeamContext(weekStartDate) {
    const where = weekStartDate
        ? { weekStartDate: { gte: new Date(weekStartDate) } }
        : {};

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

async function askQuestion(question) {
    const context = await getTeamContext();

    const prompt = `You are an assistant helping a manager understand their team's weekly reports.
Answer the manager's question using ONLY the data below. If the data doesn't contain the answer, say so honestly rather than guessing.

TEAM DATA:
${context}

MANAGER'S QUESTION: ${question}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function generateWeeklySummary(weekStartDate) {
    const context = await getTeamContext(weekStartDate);

    const prompt = `You are summarizing a team's weekly reports for a manager.
Based on the data below, write a concise summary covering:
1. Key work completed across the team
2. Any recurring blockers or challenges
3. Any signs of workload imbalance (some people overloaded, others light)

Keep it to 3-4 short paragraphs, plain language, no headers needed.

TEAM DATA:
${context}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

module.exports = { askQuestion, generateWeeklySummary };