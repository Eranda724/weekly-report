'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import ManagerSidebar from '@/components/ManagerSidebar';
import { useAuth } from '@/context/AuthContext';
import { reportsApi, managerReportsApi } from '@/lib/api';
import { Report, ReportStatus } from '@/types/report';

const STATUS_CONFIG: Record<ReportStatus, { label: string; cls: string }> = {
    DRAFT: { label: 'Draft', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
    SUBMITTED: { label: 'Submitted', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
    NEEDS_CORRECTION: { label: 'Needs Correction', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
    APPROVED: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
};

export default function ProfilePage() {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        if (user.role === 'MANAGER' || user.role === 'ADMIN') {
            managerReportsApi.listAll({ pageSize: 100 })
                .then((res) => {
                    const sorted = res.reports.sort((a, b) => new Date((b as any).updatedAt || (b as any).createdAt).getTime() - new Date((a as any).updatedAt || (a as any).createdAt).getTime());
                    setReports(sorted);
                })
                .catch(() => { })
                .finally(() => setLoading(false));
        } else {
            reportsApi
                .listMine({ pageSize: 100 })
                .then((res) => setReports(res.reports))
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    }, [user]);

    const stats = {
        total: reports.length,
        approved: reports.filter((r) => r.status === 'APPROVED').length,
        submitted: reports.filter((r) => r.status === 'SUBMITTED').length,
        draft: reports.filter((r) => r.status === 'DRAFT').length,
    };

    const approvalRate = stats.total > 0
        ? Math.round((stats.approved / stats.total) * 100)
        : 0;

    const initial = user?.name?.[0]?.toUpperCase() ?? '?';

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 flex">
                {user?.role === 'MANAGER' || user?.role === 'ADMIN' ? <ManagerSidebar /> : <Sidebar />}

                <div className="ml-60 flex-1">
                    {/* Page header */}
                    <div className="px-8 pt-8 pb-4">
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Profile</h1>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Your account details and activity summary</p>
                    </div>

                    <main className="px-8 pb-12 space-y-6">

                        {/* ── Profile card ── */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex items-center gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                                <span className="text-white text-3xl font-bold">{initial}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 rounded-full px-3 py-1 text-xs font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                                        {user?.role?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            {/* Approval rate ring */}
                            <div className="shrink-0 text-center">
                                <div className="relative w-20 h-20">
                                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8"
                                            className="text-slate-100 dark:text-slate-700" />
                                        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 32}`}
                                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - approvalRate / 100)}`}
                                            className="text-emerald-500 transition-all duration-700" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{approvalRate}%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Approval Rate</p>
                            </div>
                        </div>

                        {/* ── Stats strip ── */}
                        {user?.role === 'TEAM_MEMBER' && (
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: 'Total Reports', value: stats.total, color: 'text-indigo-600 dark:text-indigo-400' },
                                    { label: 'Approved', value: stats.approved, color: 'text-emerald-600 dark:text-emerald-400' },
                                    { label: 'Submitted', value: stats.submitted, color: 'text-violet-600 dark:text-violet-400' },
                                    { label: 'Drafts', value: stats.draft, color: 'text-slate-500 dark:text-slate-400' },
                                ].map((s) => (
                                    <div key={s.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm text-center">
                                        <div className="text-2xl mb-1"></div>
                                        <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Recent Reports ── */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Recent Reports</h3>
                                <Link
                                    href={user?.role === 'MANAGER' || user?.role === 'ADMIN' ? "/dashboard/reports" : "/reports"}
                                    className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold no-underline hover:underline"
                                >
                                    View all →
                                </Link>
                            </div>

                            {loading && (
                                <div className="px-6 py-8 space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="skeleton h-10 rounded-lg" />
                                    ))}
                                </div>
                            )}

                            {!loading && reports.length === 0 && (
                                <div className="px-6 py-10 text-center">
                                    <p className="text-slate-400 dark:text-slate-500 text-sm">No reports yet.</p>
                                    {user?.role === 'TEAM_MEMBER' && (
                                        <Link href="/reports/new"
                                            className="mt-3 inline-block text-xs text-indigo-500 dark:text-indigo-400 font-semibold no-underline hover:underline">
                                            Submit your first report →
                                        </Link>
                                    )}
                                </div>
                            )}

                            {!loading && reports.slice(0, 8).map((report, i) => {
                                const cfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.DRAFT;
                                const weekOf = new Date(report.weekStartDate).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                });
                                return (
                                    <Link
                                        key={report.id}
                                        href={`/reports/${report.id}`}
                                        className={`flex items-center justify-between px-6 py-3.5 no-underline hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors
                                            ${i !== 0 ? 'border-t border-slate-100 dark:border-slate-700/60' : ''}`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-base shrink-0">📅</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                                                    Week of {weekOf}
                                                </p>
                                                {user?.role === 'MANAGER' || user?.role === 'ADMIN' ? (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                        Actioned: {new Date((report as any).updatedAt || report.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                    </p>
                                                ) : report.project?.name ? (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                        {report.project.name}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-xs text-slate-300 dark:text-slate-600">→</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
