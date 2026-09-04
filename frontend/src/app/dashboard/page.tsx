'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { managerReportsApi, projectsApi, usersApi, Project, BasicUser } from '@/lib/api';
import { Report } from '@/types/report';

const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-200 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    NEEDS_CORRECTION: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
};

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [members, setMembers] = useState<BasicUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        userId: '',
        projectId: '',
        status: '',
        weekStartDate: '',
    });

    async function loadReports() {
        setLoading(true);
        try {
            const res = await managerReportsApi.listAll({
                userId: filters.userId || undefined,
                projectId: filters.projectId || undefined,
                status: filters.status || undefined,
                weekStartDate: filters.weekStartDate || undefined,
                pageSize: 50,
            });
            setReports(res.reports);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        projectsApi.list().then(setProjects).catch(() => { });
        usersApi.list().then(setMembers).catch(() => { });
    }, []);

    useEffect(() => {
        loadReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    function updateFilter(key: keyof typeof filters, value: string) {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }

    const summary = {
        total: reports.length,
        submitted: reports.filter(r => r.status === 'SUBMITTED').length,
        needsCorrection: reports.filter(r => r.status === 'NEEDS_CORRECTION').length,
        approved: reports.filter(r => r.status === 'APPROVED').length,
    };

    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            <main className="max-w-6xl mx-auto p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Team Dashboard</h1>
                    <div className="flex items-center gap-4">
                        {user?.role === 'ADMIN' && (
                            <Link href="/admin/users" className="text-sm text-purple-600 hover:underline font-medium">
                                Manage Users
                            </Link>
                        )}
                        <span className="text-sm text-gray-500">{user?.name} ({user?.role})</span>
                        <button onClick={logout} className="text-sm text-red-600 hover:underline">Log Out</button>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="border rounded p-4">
                        <p className="text-sm text-gray-500">Total (filtered)</p>
                        <p className="text-2xl font-semibold">{summary.total}</p>
                    </div>
                    <div className="border rounded p-4">
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="text-2xl font-semibold text-blue-600">{summary.submitted}</p>
                    </div>
                    <div className="border rounded p-4">
                        <p className="text-sm text-gray-500">Needs Correction</p>
                        <p className="text-2xl font-semibold text-yellow-600">{summary.needsCorrection}</p>
                    </div>
                    <div className="border rounded p-4">
                        <p className="text-sm text-gray-500">Approved</p>
                        <p className="text-2xl font-semibold text-green-600">{summary.approved}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <select
                        value={filters.userId}
                        onChange={(e) => updateFilter('userId', e.target.value)}
                        className="border rounded px-3 py-2 text-black text-sm"
                    >
                        <option value="">All Team Members</option>
                        {members.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>

                    <select
                        value={filters.projectId}
                        onChange={(e) => updateFilter('projectId', e.target.value)}
                        className="border rounded px-3 py-2 text-black text-sm"
                    >
                        <option value="">All Projects</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="border rounded px-3 py-2 text-black text-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="NEEDS_CORRECTION">Needs Correction</option>
                        <option value="APPROVED">Approved</option>
                    </select>

                    <input
                        type="date"
                        value={filters.weekStartDate}
                        onChange={(e) => updateFilter('weekStartDate', e.target.value)}
                        className="border rounded px-3 py-2 text-black text-sm"
                    />

                    {(filters.userId || filters.projectId || filters.status || filters.weekStartDate) && (
                        <button
                            onClick={() => setFilters({ userId: '', projectId: '', status: '', weekStartDate: '' })}
                            className="text-sm text-gray-500 hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                {/* Reports table */}
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : reports.length === 0 ? (
                    <p className="text-gray-500">No reports match these filters.</p>
                ) : (
                    <div className="border rounded divide-y">
                        {reports.map((report) => (
                            <div key={report.id} className="flex justify-between items-center p-4">
                                <div>
                                    <p className="font-medium">
                                        <Link href={`/profile/${report.user?.id}`} className="hover:underline text-blue-700">
                                            {report.user?.name}
                                        </Link>
                                        {' '}· Week of {new Date(report.weekStartDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">{report.project?.name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                                        {report.status.replace('_', ' ')}
                                    </span>
                                    {report.status === 'SUBMITTED' ? (
                                        <Link
                                            href={`/reports/${report.id}/review`}
                                            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
                                        >
                                            Review
                                        </Link>
                                    ) : (
                                        <Link
                                            href={`/reports/${report.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            View
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </ProtectedRoute>
    );
}