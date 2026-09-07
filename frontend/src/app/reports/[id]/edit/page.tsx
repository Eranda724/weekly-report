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
        router.replace(`/reports/${id}`);
    }

    if (error) return <p className="p-8 text-red-600">{error}</p>;
    if (!report) return <p className="p-8 text-gray-500">Loading...</p>;

    if (!['DRAFT', 'NEEDS_CORRECTION'].includes(report.status)) {
        return (
            <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 text-xl">
                            ℹ️
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Report Cannot Be Edited</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            This report cannot be edited in its current status (<span className="font-semibold text-slate-700 dark:text-slate-200">{report.status}</span>).
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => router.push('/reports')}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer border-none"
                            >
                                All Reports
                            </button>
                            <button
                                onClick={() => router.push(`/reports/${id}`)}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer border-none"
                            >
                                View Report
                            </button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const initialData: ReportFormData = {
        projectId: report.projectId,
        category: report.category || '',
        categoryId: report.categoryId || report.categoryRef?.id || '',
        weekStartDate: report.weekStartDate.split('T')[0],
        tasksNextWeek: report.tasksNextWeek || '',
        notesLinks: report.notesLinks || '',
        tasks: report.tasks,
        highlights: report.highlights,
        hoursBreakdown: report.hoursBreakdown,
    };

    const activeVersionComment = report.reviewComments?.[0];

    return (
        <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900/40 relative overflow-hidden pb-12">
                {/* Background glows */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full px-6 relative z-10">
                    {/* Page header */}
                    <div className="pt-10 pb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold tracking-wide mb-4 shadow-sm border border-amber-200 dark:border-amber-800/50">
                            <span>✍️</span> Edit Mode
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Edit Weekly Report</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            Update your achievements, tasks, and plans before submitting for review.
                        </p>
                    </div>

                    <main>
                        {activeVersionComment && activeVersionComment.decision === 'NEEDS_CORRECTION' && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700/50 rounded-3xl p-6 shadow-sm mb-8">
                                <div className="flex items-start gap-3">
                                    <div>
                                        <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-1">Manager requested changes</h3>
                                        <p className="text-sm text-amber-900 dark:text-amber-200/90 whitespace-pre-wrap">{activeVersionComment.commentText}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <ReportForm initialData={initialData} onSave={handleSave} saveLabel="Save Changes" />
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}