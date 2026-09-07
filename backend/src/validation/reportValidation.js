const PRIORITIES = new Set(['LOW', 'MEDIUM', 'HIGH']);
const TASK_STATUSES = new Set(['IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'NOT_STARTED']);
const HIGHLIGHT_TYPES = new Set(['BLOCKER', 'ACHIEVEMENT']);

function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

function requireText(value, field) {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${field} is required`);
    }
}

function validateReportData(data) {
    if (!data || typeof data !== 'object') throw new Error('Report data is required');

    if (!data.projectId && !data.categoryId) {
        throw new Error('A project or category tag is required');
    }
    if (data.projectId !== undefined && data.projectId !== null && typeof data.projectId !== 'string') {
        throw new Error('projectId must be a string');
    }
    requireText(data.weekStartDate, 'weekStartDate');
    if (Number.isNaN(new Date(data.weekStartDate).getTime())) throw new Error('weekStartDate must be a valid date');

    if (data.categoryId !== undefined && data.categoryId !== null && typeof data.categoryId !== 'string') {
        throw new Error('categoryId must be a string');
    }
    if (data.category !== undefined && typeof data.category !== 'string') {
        throw new Error('category must be a string');
    }
    for (const field of ['tasksNextWeek', 'notesLinks']) {
        if (data[field] !== undefined && data[field] !== null && typeof data[field] !== 'string') {
            throw new Error(`${field} must be a string`);
        }
    }

    if (!Array.isArray(data.tasks)) throw new Error('tasks must be an array');
    data.tasks.forEach((task, index) => {
        requireText(task.taskName, `tasks[${index}].taskName`);
        if (!PRIORITIES.has(task.priority)) throw new Error(`tasks[${index}].priority is invalid`);
        if (!Number.isInteger(task.plannedPct) || task.plannedPct < 0 || task.plannedPct > 100) {
            throw new Error(`tasks[${index}].plannedPct must be an integer from 0 to 100`);
        }
        if (!Number.isInteger(task.actualPct) || task.actualPct < 0 || task.actualPct > 100) {
            throw new Error(`tasks[${index}].actualPct must be an integer from 0 to 100`);
        }
        if (!TASK_STATUSES.has(task.status)) throw new Error(`tasks[${index}].status is invalid`);
        for (const field of ['timePlannedHrs', 'timeSpentHrs']) {
            if (!isFiniteNumber(task[field]) || task[field] < 0) {
                throw new Error(`tasks[${index}].${field} must be a non-negative number`);
            }
        }
        if (task.deliverable !== undefined && task.deliverable !== null && typeof task.deliverable !== 'string') {
            throw new Error(`tasks[${index}].deliverable must be a string`);
        }
    });

    if (!Array.isArray(data.highlights)) throw new Error('highlights must be an array');
    data.highlights.forEach((highlight, index) => {
        if (!HIGHLIGHT_TYPES.has(highlight.itemType)) throw new Error(`highlights[${index}].itemType is invalid`);
        requireText(highlight.description, `highlights[${index}].description`);
        if (highlight.isKeyItem !== undefined && typeof highlight.isKeyItem !== 'boolean') {
            throw new Error(`highlights[${index}].isKeyItem must be a boolean`);
        }
    });

    if (!Array.isArray(data.hoursBreakdown)) throw new Error('hoursBreakdown must be an array');
    data.hoursBreakdown.forEach((entry, index) => {
        requireText(entry.taskCategory, `hoursBreakdown[${index}].taskCategory`);
        if (!isFiniteNumber(entry.hoursSpent) || entry.hoursSpent < 0) {
            throw new Error(`hoursBreakdown[${index}].hoursSpent must be a non-negative number`);
        }
    });
}

module.exports = { validateReportData };