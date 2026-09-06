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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900/40 relative overflow-hidden pb-12">
                {/* Background glows */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full px-6 relative z-10">
                    {/* Page header */}
                    <div className="pt-10 pb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide mb-4 shadow-sm border border-indigo-200 dark:border-indigo-800/50">
                            Draft Mode
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">New Weekly Report</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            Document your achievements, tasks, and plans for the upcoming week.
                        </p>
                    </div>

                    <main>
                        <ReportForm initialData={emptyForm} onSave={handleSave} saveLabel="Save as Draft" />
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}