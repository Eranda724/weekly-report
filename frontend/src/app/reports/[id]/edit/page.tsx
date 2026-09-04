'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReportForm from '@/components/reports/ReportForm';
import { reportsApi } from '@/lib/api';
import { Report, ReportFormData } from '@/types/report';

export default function EditReportPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [report, setReport] = useState<Report | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        reportsApi.getOne(id).then(setReport).catch((err) => setError(err.message));
    }, [id]);

    async function handleSave(data: ReportFormData) {
        await reportsApi.update(id, data);
        router.push(`/reports/${id}`);
    }

    if (error) return <p className="p-8 text-red-600">{error}</p>;
    if (!report) return <p className="p-8 text-gray-500">Loading...</p>;

    if (!['DRAFT', 'NEEDS_CORRECTION'].includes(report.status)) {
        return (
            <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
                <p className="p-8 text-gray-600">This report cannot be edited in its current status ({report.status}).</p>
            </ProtectedRoute>
        );
    }

    const initialData: ReportFormData = {
        projectId: report.projectId,
        weekStartDate: report.weekStartDate.split('T')[0],
        tasksNextWeek: report.tasksNextWeek,
        notesLinks: report.notesLinks,
        tasks: report.tasks,
        highlights: report.highlights,
        hoursBreakdown: report.hoursBreakdown,
    };

    return (
        <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
            <main className="max-w-3xl mx-auto p-8">
                <h1 className="text-2xl font-semibold mb-6">Edit Report</h1>
                <ReportForm initialData={initialData} onSave={handleSave} saveLabel="Save Changes" />
            </main>
        </ProtectedRoute>
    );
}