'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { reportsApi } from '@/lib/api';
import { Report } from '@/types/report';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import AIChatWidget from '@/components/AIChatWidget';
import Link from 'next/link';

export default function ReportDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    const [report, setReport] = useState<Report | null>(null);
    const [selectedVersionId, setSelectedVersionId] = useState<string>('latest');

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    function load() {
        reportsApi.getOne(id as string).then(setReport).catch((err) => setError(err.message));
    }

    useEffect(() => {
        load();
    }, [id]);

    async function handleSubmit() {
        setSubmitting(true);
        setError('');
        try {
            await reportsApi.submit(id as string);
            load();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    const scrollToActions = () => {
        document.getElementById('report-actions')?.scrollIntoView({ behavior: 'smooth' });
    };

    const isLatest = selectedVersionId === 'latest';

    // Parse snapshot if an older version is selected
    const activeSnapshot = useMemo(() => {
        if (isLatest || !report) return null;
        const v = report.versions?.find((x) => x.id === selectedVersionId);
        if (v && v.contentSnapshot) {
            try {
                return JSON.parse(v.contentSnapshot as any);
            } catch {
                return null;
            }
        }
        return null;
    }, [selectedVersionId, report]);

    const activeVersionComment = useMemo(() => {
        if (!report) return null;
        if (isLatest) return report.reviewComments?.[0];
        return report.reviewComments?.find((c: any) => c.versionId === selectedVersionId);
    }, [isLatest, report, selectedVersionId]);

    // Derive display data based on version selected
    const displayTasks = isLatest ? report?.tasks || [] : activeSnapshot?.tasks || [];
    const displayBlockers = isLatest
        ? report?.highlights?.filter((h) => h.itemType === 'BLOCKER') || []
        : activeSnapshot?.highlights?.filter((h: any) => h.itemType === 'BLOCKER') || [];
    const displayAchievements = isLatest
        ? report?.highlights?.filter((h) => h.itemType === 'ACHIEVEMENT') || []
        : activeSnapshot?.highlights?.filter((h: any) => h.itemType === 'ACHIEVEMENT') || [];
    const displayNextWeek = isLatest ? report?.tasksNextWeek : activeSnapshot?.tasksNextWeek;
    const displayNotesLinks = isLatest ? report?.notesLinks : activeSnapshot?.notesLinks;

    if (!report) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const isOwner = user?.id === report.user?.id;
    const canEditOrSubmit = isOwner && ['DRAFT', 'NEEDS_CORRECTION'].includes(report.status);

    const priorityColors: Record<string, string> = {
        HIGH: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
        MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
        LOW: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30',
    };

    const statusColors: Record<string, string> = {
        COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
        BLOCKED: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        NOT_STARTED: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400',
    };

    const statusBadgeColors: Record<string, string> = {
        DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30',
        SUBMITTED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30',
        NEEDS_CORRECTION: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
        APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    };

    const isDraftState = ['DRAFT', 'NEEDS_CORRECTION'].includes(report.status);
    const sortedVersions = report.versions ? [...report.versions].sort((a, b) => b.versionNumber - a.versionNumber) : [];
    const hasHistory = sortedVersions.length > 0;

    const TopBar = (
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => {
                        const target = user?.role === 'MANAGER' || user?.role === 'ADMIN' ? '/dashboard/reports' : '/reports';
                        router.push(target);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                    title="Back to reports"
                >
                    ←
                </button>
                <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase">
                    Report Details
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {canEditOrSubmit && isLatest && (
                    <div className="hidden sm:flex gap-2 mr-2">
                        <Link href={`/reports/${id}/edit`} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Edit Report
                        </Link>
                        <button onClick={scrollToActions} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                            Submit for Review
                        </button>
                    </div>
                )}
                
                <AIChatWidget weekStartDate={report.weekStartDate} />
                
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                    title="Toggle theme"
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors">
                {/* Decorative background accents */}
                <div className="pointer-events-none absolute top-0 left-0 w-[28rem] h-[28rem] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/4" />
                <div className="pointer-events-none absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/4" />

                <div className="relative z-10">
                    {TopBar}

                    <div className="px-6 py-8 space-y-6">

                        {/* ── Header Card ── */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />

                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white shadow-md ring-4 ring-indigo-100 dark:ring-indigo-500/20 shrink-0">
                                {report.user?.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{report.user?.name}</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                                    {report.project?.name || 'No Project'} · {report.categoryRef?.name || report.category || 'Uncategorized'} · Week of {new Date(report.weekStartDate).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Status and Version Dropdown */}
                            <div className="flex flex-col items-center sm:items-end gap-2 relative z-10">
                                <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${statusBadgeColors[report.status] || statusBadgeColors.DRAFT}`}>
                                    {report.status.replace('_', ' ')}
                                </span>

                                {hasHistory && (
                                    <div className="flex flex-col items-center sm:items-end gap-1 mt-1">
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">History</label>
                                        <select
                                            value={selectedVersionId}
                                            onChange={(e) => setSelectedVersionId(e.target.value)}
                                            className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                                        >
                                            {isDraftState ? (
                                                <option value="latest">Current Draft</option>
                                            ) : (
                                                <option value="latest">Latest Version</option>
                                            )}
                                            {sortedVersions.map((v, i) => {
                                                if (!isDraftState && i === 0) return null;
                                                return (
                                                    <option key={v.id} value={v.id}>
                                                        v{v.versionNumber} ({new Date(v.submittedAt).toLocaleDateString()})
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isLatest && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-amber-700 dark:text-amber-400 text-sm flex items-center justify-between">
                                <span>You are viewing a past version of this report. Actions are disabled.</span>
                                <button onClick={() => setSelectedVersionId('latest')} className="underline font-medium hover:text-amber-800 dark:hover:text-amber-300">
                                    View Latest
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-700 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Manager Feedback Alert */}
                        {activeVersionComment && activeVersionComment.decision === 'NEEDS_CORRECTION' && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700/50 rounded-3xl p-6 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div>
                                        <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-1">Manager requested changes</h3>
                                        <p className="text-sm text-amber-900 dark:text-amber-200/90 whitespace-pre-wrap">{activeVersionComment.commentText}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Approved Alert */}
                        {((isLatest && report.status === 'APPROVED') || (!isLatest && activeVersionComment?.decision === 'APPROVED')) && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700/50 rounded-3xl p-6 shadow-sm flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-emerald-800 dark:text-emerald-400">
                                        Approved{activeVersionComment?.createdAt ? ` on ${new Date(activeVersionComment.createdAt).toLocaleDateString()}` : ''}
                                    </h3>
                                </div>
                                {activeVersionComment?.commentText && (
                                    <p className="text-sm text-emerald-900 dark:text-emerald-200/90 whitespace-pre-wrap ml-9">{activeVersionComment.commentText}</p>
                                )}
                            </div>
                        )}

                        {/* Tasks Section */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Tasks Completed</h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayTasks.length === 0 ? (
                                    <p className="text-slate-400 dark:text-slate-500 text-sm italic col-span-full">No tasks logged in this version.</p>
                                ) : displayTasks.map((t: any, i: number) => (
                                    <div
                                        key={i}
                                        className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors flex flex-col h-full"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{t.taskName}</h4>
                                            <div className="flex gap-2">
                                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${priorityColors[t.priority] || priorityColors.LOW}`}>
                                                    {t.priority}
                                                </span>
                                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${statusColors[t.status] || statusColors.NOT_STARTED}`}>
                                                    {t.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 text-sm mb-3 text-slate-600 dark:text-slate-400 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400 dark:text-slate-500">Progress</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    {t.actualPct}% <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/ {t.plannedPct}%</span>
                                                </span>
                                            </div>
                                            <div className="w-px bg-slate-200 dark:bg-slate-700" />
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400 dark:text-slate-500">Time</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    {t.timeSpentHrs}h <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/ {t.timePlannedHrs}h</span>
                                                </span>
                                            </div>
                                        </div>

                                        {t.deliverable && (
                                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 text-sm text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300 mr-2">Output:</span>
                                                {t.deliverable}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Blockers and Achievements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Blockers */}
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
                                <div className="px-5 py-3 border-b border-red-100 dark:border-red-900/30 bg-red-100/50 dark:bg-red-900/20 flex items-center gap-2">
                                    <span className="text-lg"></span>
                                    <h3 className="font-semibold text-red-800 dark:text-red-400">Blockers</h3>
                                </div>
                                <div className="p-5 space-y-3 flex-1">
                                    {displayBlockers.length === 0 ? (
                                        <p className="text-red-400 dark:text-red-500/70 text-sm italic">No blockers reported.</p>
                                    ) : displayBlockers.map((h: any, i: number) => (
                                        <div key={i} className="flex gap-2 items-start text-sm text-red-700 dark:text-red-300">
                                            <div className="mt-0.5">•</div>
                                            <p>
                                                {h.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
                                <div className="px-5 py-3 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-100/50 dark:bg-emerald-900/20 flex items-center gap-2">
                                    <span className="text-lg"></span>
                                    <h3 className="font-semibold text-emerald-800 dark:text-emerald-400">Achievements</h3>
                                </div>
                                <div className="p-5 space-y-3 flex-1">
                                    {displayAchievements.length === 0 ? (
                                        <p className="text-emerald-400 dark:text-emerald-500/70 text-sm italic">No achievements reported.</p>
                                    ) : displayAchievements.map((h: any, i: number) => (
                                        <div key={i} className="flex gap-2 items-start text-sm text-emerald-700 dark:text-emerald-300">
                                            <div className="mt-0.5">•</div>
                                            <p>
                                                {h.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Plans & Notes (Side-by-side or stacked grid) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Next Week */}
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Tasks Planned for Next Week</h3>
                                </div>
                                <div className="p-6 flex-1">
                                    {displayNextWeek ? (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{displayNextWeek}</p>
                                    ) : (
                                        <p className="text-slate-400 dark:text-slate-500 text-sm italic">No plans provided.</p>
                                    )}
                                </div>
                            </div>

                            {/* Notes / Links */}
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notes / Links</h3>
                                </div>
                                <div className="p-6 flex-1">
                                    {displayNotesLinks ? (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{displayNotesLinks}</p>
                                    ) : (
                                        <p className="text-slate-400 dark:text-slate-500 text-sm italic">No notes or links provided.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions Form (Full Width) */}
                        {canEditOrSubmit && (
                            <div id="report-actions" className={`bg-white dark:bg-slate-800 border ${isLatest ? 'border-indigo-200 dark:border-indigo-900/50' : 'border-slate-200 dark:border-slate-700 opacity-60'} rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col`}>
                                {isLatest && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />}

                                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Report Actions</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">You can edit this report or submit it for manager review.</p>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link
                                        href={`/reports/${id}/edit`}
                                        className={`flex-1 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${!isLatest ? 'pointer-events-none opacity-50' : ''}`}
                                    >
                                        Edit Report
                                    </Link>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || !isLatest}
                                        className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? '...' : report.status === 'NEEDS_CORRECTION' ? 'Resubmit' : 'Submit for Review'}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}