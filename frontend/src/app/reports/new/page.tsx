'use client';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReportForm from '@/components/reports/ReportForm';
import { reportsApi } from '@/lib/api';
import { ReportFormData } from '@/types/report';

const emptyForm: ReportFormData = {
    projectId: '',
    weekStartDate: '',
    tasksNextWeek: '',
    notesLinks: '',
    tasks: [],
    highlights: [],
    hoursBreakdown: [],
};

export default function NewReportPage() {
    const router = useRouter();

    async function handleSave(data: ReportFormData) {
        const report = await reportsApi.create(data);
        router.push(`/reports/${report.id}`);
    }

    return (
        <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
            <main className="max-w-3xl mx-auto p-8">
                <h1 className="text-2xl font-semibold mb-6">New Weekly Report</h1>
                <ReportForm initialData={emptyForm} onSave={handleSave} saveLabel="Save as Draft" />
            </main>
        </ProtectedRoute>
    );
}