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
            <div className="min-h-screen">
                {/* Page header */}
                <div className="px-6 pt-8 pb-2">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">New Weekly Report</h1>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Fill in your weekly activity and submit for review</p>
                </div>

                <main className="px-6 py-4">
                    <ReportForm initialData={emptyForm} onSave={handleSave} saveLabel="Save as Draft" />
                </main>
            </div>
        </ProtectedRoute>
    );
}