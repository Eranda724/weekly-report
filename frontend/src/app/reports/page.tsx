'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { reportsApi } from '@/lib/api';
import { Report, ReportStatus } from '@/types/report';

/* ─── Status config ────────────────────────────────── */
const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string }> = {
    DRAFT:            { label: 'Draft',            className: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
    SUBMITTED:        { label: 'Submitted',         className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
    NEEDS_CORRECTION: { label: 'Needs Correction',  className: 'bg-amber-100  text-amber-700  dark:bg-amber-900/50  dark:text-amber-300' },
    APPROVED:         { label: 'Approved',           className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
};

function weekRange(startDateStr: string): string {
    const start = new Date(startDateStr);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function StatusBadge({ status }: { status: ReportStatus }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap ${cfg.className}`}>
            {cfg.label}
        </span>
    );
}

function SkeletonCard() {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <div className="skeleton h-4 w-2/5 mb-3" />
            <div className="skeleton h-3 w-1/4 mb-4" />
            <div className="flex justify-between">
                <div className="skeleton h-3 w-1/5" />
                <div className="skeleton h-6 w-20 rounded-full" />
            </div>
        </div>
    );
}

export default function ReportHistoryPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    useEffect(() => {
        reportsApi
            .listMine()
            .then((res) => setReports(res.reports))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filtered = filterStatus ? reports.filter((r) => r.status === filterStatus) : reports;

    const counts = {
        total:     reports.length,
        draft:     reports.filter((r) => r.status === 'DRAFT').length,
        submitted: reports.filter((r) => r.status === 'SUBMITTED').length,
        approved:  reports.filter((r) => r.status === 'APPROVED').length,
    };

    return (
        <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
            <div className="min-h-screen">

                {/* Page header */}
                <div className="flex items-center justify-between px-6 pt-8 pb-2">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Reports</h1>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">View and manage your weekly reports</p>
                    </div>
                    <Link
                        href="/reports/new"
                        className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 transition-all duration-150 no-underline"
                    >
                        + New Report
                    </Link>
                </div>

                <main className="px-6 py-4">

                    {/* ── Stats Strip ── */}
                    <div className="grid grid-cols-4 gap-3 mb-7">
                        {[
                            { label: 'Total',     value: counts.total,     color: 'text-indigo-600 dark:text-indigo-400' },
                            { label: 'Draft',     value: counts.draft,     color: 'text-slate-500  dark:text-slate-400'  },
                            { label: 'Submitted', value: counts.submitted, color: 'text-violet-600 dark:text-violet-400' },
                            { label: 'Approved',  value: counts.approved,  color: 'text-emerald-600 dark:text-emerald-400' },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center shadow-sm"
                            >
                                <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Filter bar ── */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Filter:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="NEEDS_CORRECTION">Needs Correction</option>
                            <option value="APPROVED">Approved</option>
                        </select>
                        {filterStatus && (
                            <button
                                onClick={() => setFilterStatus('')}
                                className="text-xs text-slate-400 dark:text-slate-500 underline hover:text-slate-600 dark:hover:text-slate-300 bg-transparent border-none cursor-pointer"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-700 dark:text-red-400 text-sm mb-5">
                            {error}
                        </div>
                    )}

                    {/* ── Loading skeletons ── */}
                    {loading && (
                        <div className="flex flex-col gap-3">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    )}

                    {/* ── Empty state ── */}
                    {!loading && filtered.length === 0 && (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-16 text-center shadow-sm">
                            <div className="text-5xl mb-4">📄</div>
                            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                {filterStatus ? 'No reports match this filter.' : 'No reports yet.'}
                            </p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
                                {filterStatus
                                    ? 'Try clearing the filter to see all reports.'
                                    : 'Submit your first weekly report to get started.'}
                            </p>
                            {!filterStatus && (
                                <Link
                                    href="/reports/new"
                                    className="inline-block bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-md no-underline transition-all"
                                >
                                    Create First Report
                                </Link>
                            )}
                        </div>
                    )}

                    {/* ── Report Cards ── */}
                    {!loading && filtered.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {filtered.map((report, i) => (
                                <Link
                                    key={report.id}
                                    href={`/reports/${report.id}`}
                                    className="fade-up block no-underline bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-150"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: date + meta */}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-base">📅</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-100 text-[0.95rem]">
                                                    {weekRange(report.weekStartDate)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {report.project?.name && (
                                                    <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
                                                        🏷 {report.project.name}
                                                    </span>
                                                )}
                                                {report.currentVersion > 1 && (
                                                    <span className="text-indigo-500 dark:text-indigo-400 text-xs font-bold">
                                                        v{report.currentVersion}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                                {report.submittedAt
                                                    ? `Submitted ${new Date(report.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                                    : `Created ${new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                            </p>
                                        </div>

                                        {/* Right: status + action */}
                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            <StatusBadge status={report.status} />
                                            <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400">
                                                {['DRAFT', 'NEEDS_CORRECTION'].includes(report.status) ? 'Edit →' : 'View →'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
