'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { reportsApi, managerReportsApi } from '@/lib/api';
import { Report } from '@/types/report';
import { useTheme } from '@/hooks/useTheme';

export default function ManagerReviewPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    
    const [report, setReport] = useState<Report | null>(null);
    const [selectedVersionId, setSelectedVersionId] = useState<string>('latest');
    
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        reportsApi.getOne(id as string).then(setReport).catch((err) => setError(err.message));
    }, [id]);

    async function handleDecision(decision: 'APPROVED' | 'NEEDS_CORRECTION') {
        setError('');
        if (decision === 'NEEDS_CORRECTION' && !comment.trim()) {
            setError('A comment is required when requesting changes.');
            return;
        }
        setSubmitting(true);
        try {
            await managerReportsApi.review(id as string, decision, comment.trim() || undefined);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    const scrollToDecision = () => {
        document.getElementById('make-decision')?.scrollIntoView({ behavior: 'smooth' });
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

    // Derive display data based on version selected
    const displayTasks = isLatest ? report?.tasks || [] : activeSnapshot?.tasks || [];
    const displayBlockers = isLatest 
        ? report?.highlights?.filter((h) => h.itemType === 'BLOCKER') || []
        : activeSnapshot?.highlights?.filter((h: any) => h.itemType === 'BLOCKER') || [];
    const displayAchievements = isLatest
        ? report?.highlights?.filter((h) => h.itemType === 'ACHIEVEMENT') || []
        : activeSnapshot?.highlights?.filter((h: any) => h.itemType === 'ACHIEVEMENT') || [];
    const displayNextWeek = isLatest ? report?.tasksNextWeek : activeSnapshot?.tasksNextWeek;

    if (!report) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

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

    const TopBar = (
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                >
                    ←
                </button>
                <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase">
                    Review Report
                </h1>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex gap-2 mr-2">
                    <button onClick={scrollToDecision} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                        Approve
                    </button>
                    <button onClick={scrollToDecision} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-amber-500 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
                        Request Changes
                    </button>
                </div>
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

    if (report.status !== 'SUBMITTED') {
        return (
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors">
                    {TopBar}
                    <div className="p-8 max-w-3xl mx-auto mt-10">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                            <div className="text-4xl mb-4">⚠️</div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Review Not Available</h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                This report is currently <strong>{report.status}</strong>. Only reports with the status{' '}
                                <span className="text-indigo-500 dark:text-indigo-400">SUBMITTED</span> can be reviewed here.
                            </p>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
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
                                    {report.project?.name || 'No Project'} · Week of {new Date(report.weekStartDate).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Version Dropdown replacing SUBMITTED badge */}
                            <div className="flex flex-col items-center sm:items-end gap-1 relative z-10">
                                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Version History</label>
                                <select 
                                    value={selectedVersionId}
                                    onChange={(e) => setSelectedVersionId(e.target.value)}
                                    className="bg-indigo-50 dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 font-semibold text-sm rounded-lg px-3 py-1.5 border border-indigo-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                                >
                                    <option value="latest">Latest Version</option>
                                    {report.versions?.sort((a,b) => b.versionNumber - a.versionNumber).map(v => (
                                        <option key={v.id} value={v.id}>
                                            v{v.versionNumber} ({new Date(v.submittedAt).toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {!isLatest && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-amber-700 dark:text-amber-400 text-sm flex items-center justify-between">
                                <span>You are viewing a past version of this report. The review form is disabled.</span>
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

                        {/* Tasks Section */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                                <span className="text-lg">📋</span>
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
                                    <span className="text-lg">🚩</span>
                                    <h3 className="font-semibold text-red-800 dark:text-red-400">Blockers</h3>
                                </div>
                                <div className="p-5 space-y-3 flex-1">
                                    {displayBlockers.length === 0 ? (
                                        <p className="text-red-400 dark:text-red-500/70 text-sm italic">No blockers reported.</p>
                                    ) : displayBlockers.map((h: any, i: number) => (
                                        <div key={i} className="flex gap-2 items-start text-sm text-red-700 dark:text-red-300">
                                            <div className="mt-0.5">•</div>
                                            <p>
                                                {h.isKeyItem && <span className="font-bold text-red-800 dark:text-red-400 mr-1">[KEY]</span>}
                                                {h.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
                                <div className="px-5 py-3 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-100/50 dark:bg-emerald-900/20 flex items-center gap-2">
                                    <span className="text-lg">⭐</span>
                                    <h3 className="font-semibold text-emerald-800 dark:text-emerald-400">Achievements</h3>
                                </div>
                                <div className="p-5 space-y-3 flex-1">
                                    {displayAchievements.length === 0 ? (
                                        <p className="text-emerald-400 dark:text-emerald-500/70 text-sm italic">No achievements reported.</p>
                                    ) : displayAchievements.map((h: any, i: number) => (
                                        <div key={i} className="flex gap-2 items-start text-sm text-emerald-700 dark:text-emerald-300">
                                            <div className="mt-0.5">•</div>
                                            <p>
                                                {h.isKeyItem && <span className="font-bold text-emerald-800 dark:text-emerald-400 mr-1">[KEY]</span>}
                                                {h.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Next Week (Full Width) */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                                <span className="text-lg">⏭️</span>
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Plans for Next Week</h3>
                            </div>
                            <div className="p-6 flex-1">
                                {displayNextWeek ? (
                                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{displayNextWeek}</p>
                                ) : (
                                    <p className="text-slate-400 dark:text-slate-500 text-sm italic">No plans provided.</p>
                                )}
                            </div>
                        </div>

                        {/* Review Form (Full Width) */}
                        <div id="make-decision" className={`bg-white dark:bg-slate-800 border ${isLatest ? 'border-indigo-200 dark:border-indigo-900/50' : 'border-slate-200 dark:border-slate-700 opacity-60'} rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col`}>
                            {isLatest && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />}

                            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Make a Decision</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Provide feedback and approve or reject.</p>

                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 mt-auto">
                                Review Comment <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(Req. for Changes)</span>
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                disabled={!isLatest}
                                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder={isLatest ? "Explain what needs to change, or give kudos..." : "Switch to Latest Version to make a decision."}
                            />

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => handleDecision('APPROVED')}
                                    disabled={submitting || !isLatest}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? '...' : '✅ Approve'}
                                </button>
                                <button
                                    onClick={() => handleDecision('NEEDS_CORRECTION')}
                                    disabled={submitting || !isLatest}
                                    className="flex-1 border-2 border-amber-500 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-medium py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? '...' : '❗ Request Changes'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}