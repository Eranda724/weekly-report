export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type HighlightType = 'BLOCKER' | 'ACHIEVEMENT';
export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'NEEDS_CORRECTION' | 'APPROVED';

export type ReportTask = {
    id?: string;
    taskName: string;
    priority: Priority;
    plannedPct: number;
    actualPct: number;
    status: string;
    timePlannedHrs: number;
    timeSpentHrs: number;
    deliverable: string;
};

export type ReportHighlight = {
    id?: string;
    itemType: HighlightType;
    description: string;
    isKeyItem: boolean;
};

export type HoursBreakdownEntry = {
    id?: string;
    taskCategory: string;
    hoursSpent: number;
};

export type ReportFormData = {
    projectId: string;
    weekStartDate: string; // yyyy-mm-dd
    tasksNextWeek: string;
    notesLinks: string;
    tasks: ReportTask[];
    highlights: ReportHighlight[];
    hoursBreakdown: HoursBreakdownEntry[];
};

export type Report = ReportFormData & {
    id: string;
    status: ReportStatus;
    currentVersion: number;
    createdAt: string;
    submittedAt: string | null;
    approvedAt: string | null;
    project?: { id: string; name: string };
    user?: { id: string; name: string; email: string };
    versions?: { id: string; versionNumber: number; submittedAt: string }[];
    reviewComments?: {
        id: string;
        decision: string;
        commentText: string | null;
        createdAt: string;
        versionId: string;
    }[];
};