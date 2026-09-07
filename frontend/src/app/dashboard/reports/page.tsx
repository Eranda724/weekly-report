'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { managerReportsApi, projectsApi, usersApi, Project, BasicUser } from '@/lib/api';
import { Report } from '@/types/report';
import AIChatWidget from '@/components/AIChatWidget';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    DRAFT:            { label: 'Draft',            cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
    SUBMITTED:        { label: 'Submitted',         cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
    NEEDS_CORRECTION: { label: 'Needs Correction',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
    APPROVED:         { label: 'Approved',           cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
};

const filterControlCls = 'w-full h-10 text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 cursor-pointer';
const filterLabelCls = 'block mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500';

export default function TeamReportsPage() {
    const [reports, setReports]   = useState<Report[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [members, setMembers]   = useState<BasicUser[]>([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    const [filters, setFilters] = useState({
        userId: '', projectId: '', status: '', fromDate: '', toDate: '',
    });

    async function loadReports() {
        setLoading(true);
        try {
            const res = await managerReportsApi.listAll({
                userId:        filters.userId || undefined,
                projectId:     filters.projectId || undefined,
                status:        filters.status || undefined,
                fromDate:      filters.fromDate || undefined,
                toDate:        filters.toDate || undefined,
                pageSize: 100,
            });
            const sorted = res.reports.sort((a: Report, b: Report) => {
                const weights: Record<string, number> = { SUBMITTED: 1, NEEDS_CORRECTION: 2, DRAFT: 3, APPROVED: 4 };
                const wA = weights[a.status] || 99;
                const wB = weights[b.status] || 99;
                if (wA !== wB) return wA - wB;
                return new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime();
            });
            setReports(sorted);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        projectsApi.list().then(setProjects).catch(() => {});
        usersApi.list().then(setMembers).catch(() => {});
    }, []);

    useEffect(() => {
        loadReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    function updateFilter(key: keyof typeof filters, value: string) {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            {/* ── Header and filter bar ── */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">Team Reports</h1>
                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Review and manage reports from your team</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                        {reports.length} result{reports.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
                    <div>
                        <label htmlFor="from-filter" className={filterLabelCls}>From Date</label>
                        <input id="from-filter" type="date" value={filters.fromDate} onChange={(e) => updateFilter('fromDate', e.target.value)} className={filterControlCls} />
                    </div>
                    <div>
                        <label htmlFor="to-filter" className={filterLabelCls}>To Date</label>
                        <input id="to-filter" type="date" value={filters.toDate} min={filters.fromDate || undefined} onChange={(e) => updateFilter('toDate', e.target.value)} className={filterControlCls} />
                    </div>
                    <div>
                        <label htmlFor="member-filter" className={filterLabelCls}>Team member</label>
                        <select id="member-filter" value={filters.userId} onChange={(e) => updateFilter('userId', e.target.value)} className={filterControlCls}>
                            <option value="">All members</option>
                            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="project-filter" className={filterLabelCls}>Project</label>
                        <select id="project-filter" value={filters.projectId} onChange={(e) => updateFilter('projectId', e.target.value)} className={filterControlCls}>
                            <option value="">All projects</option>
                            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status-filter" className={filterLabelCls}>Status</label>
                        <select id="status-filter" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className={filterControlCls}>
                            <option value="">All statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="NEEDS_CORRECTION">Needs correction</option>
                            <option value="APPROVED">Approved</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        {(filters.userId || filters.projectId || filters.status || filters.fromDate || filters.toDate) && (
                            <button onClick={() => setFilters({ userId: '', projectId: '', status: '', fromDate: '', toDate: '' })} className="h5 w-30 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-800 dark:hover:bg-red-900/20 dark:hover:text-red-300">
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Page content ── */}
            <div className="px-6 py-6 space-y-6">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* ── Reports table ── */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Team report queue</h2>
                    </div>

                    {loading && (
                        <div className="px-6 py-8 space-y-3">
                            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
                        </div>
                    )}
                    {!loading && reports.length === 0 && (
                        <div className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                            No reports match these filters.
                        </div>
                    )}
                    {!loading && reports.map((report, i) => {
                        const cfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.DRAFT;
                        return (
                            <div
                                key={report.id}
                                className={`flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40
                                    ${i !== 0 ? 'border-t border-slate-100 dark:border-slate-700/60' : ''}`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0">
                                        <span className="text-white text-xs font-bold">
                                            {report.user?.name?.[0]?.toUpperCase() ?? '?'}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                                            {report.user?.name}
                                            <span className="font-normal text-slate-400 dark:text-slate-500 ml-1.5">
                                                · Week of {new Date(report.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </p>
                                        {report.project?.name && (
                                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{report.project.name}</p>
                                        )}
                                        {report.category && (
                                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{report.category}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center w-56 shrink-0">
                                    <div className="w-36 flex justify-start">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls} whitespace-nowrap`}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                    <div className="flex-1 flex justify-end">
                                        {report.status === 'SUBMITTED' ? (
                                            <Link
                                                href={`/reports/${report.id}/review`}
                                                className="text-xs bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold px-3 py-1 rounded-lg no-underline hover:opacity-90 transition-opacity whitespace-nowrap"
                                            >
                                                Review →
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/reports/${report.id}`}
                                                className="text-xs text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-semibold px-3 py-1 rounded-lg no-underline hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors whitespace-nowrap"
                                            >
                                                View →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <AIChatWidget weekStartDate={filters.fromDate || undefined} />
        </ProtectedRoute>
    );
}
