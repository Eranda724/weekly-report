'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { managerReportsApi, usersApi, BasicUser } from '@/lib/api';
import { Report } from '@/types/report';

const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-200 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    NEEDS_CORRECTION: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
};

export default function TeamMemberProfilePage() {
    const params = useParams<{ userId: string }>();
    const userId = params?.userId;
    const [member, setMember] = useState<BasicUser | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) return;
        
        Promise.all([
            usersApi.list().then((users) => {
                const found = users.find((u) => u.id === userId);
                setMember(found || null);
            }),
            managerReportsApi.listAll({ userId, pageSize: 100 }).then((res) => setReports(res.reports)),
        ])
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [userId]);

    const stats = {
        total: reports.length,
        approved: reports.filter(r => r.status === 'APPROVED').length,
        needsCorrection: reports.filter(r => r.status === 'NEEDS_CORRECTION').length,
        pending: reports.filter(r => r.status === 'SUBMITTED').length,
    };

    const complianceRate = stats.total > 0
        ? Math.round((stats.approved / stats.total) * 100)
        : 0;

    if (loading) return <p className="p-8 text-gray-500">Loading...</p>;

    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            <main className="max-w-4xl mx-auto p-8">
                <h1 className="text-2xl font-semibold mb-1">{member?.name || 'Team Member'}</h1>
                <p className="text-gray-500 mb-6">{member?.email}</p>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="border rounded p-4">
                        <p className="text-sm text-gray-500">Total Reports</p>
                        <p className="text-2xl font-semibold">{stats.total}</p>
                    </div>
                    <div className="border rounded p-4">
                        <p className="text-sm text-gray-500">Approved</p>
                        <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
                    </div>
                    <div className="border rounded p-4">
                        <p className="text-sm text-gray-500">Needs Correction</p>
                        <p className="text-2xl font-semibold text-yellow-600">{stats.needsCorrection}</p>
                    </div>
                    <div className="border rounded p-4">
                        <p className="text-sm text-gray-500">Approval Rate</p>
                        <p className="text-2xl font-semibold">{complianceRate}%</p>
                    </div>
                </div>

                <h2 className="font-medium mb-3">Report History</h2>
                {reports.length === 0 ? (
                    <p className="text-gray-500">No reports submitted yet.</p>
                ) : (
                    <div className="border rounded divide-y">
                        {reports.map((report) => (
                            <div key={report.id} className="flex justify-between items-center p-4">
                                <div>
                                    <p className="font-medium">Week of {new Date(report.weekStartDate).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-500">{report.project?.name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                                        {report.status.replace('_', ' ')}
                                    </span>
                                    <Link href={`/reports/${report.id}`} className="text-sm text-blue-600 hover:underline">
                                        View
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </ProtectedRoute>
    );
}