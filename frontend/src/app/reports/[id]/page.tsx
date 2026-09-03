'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { reportsApi } from '@/lib/api';
import { Report } from '@/types/report';

const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-200 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    NEEDS_CORRECTION: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
};

export default function ReportDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [report, setReport] = useState<Report | null>(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    function load() {
        reportsApi.getOne(id).then(setReport).catch((err) => setError(err.message));
    }

    useEffect(() => {
        load();
    }, [id]);

    async function handleSubmit() {
        setSubmitting(true);
        setError('');
        try {
            await reportsApi.submit(id);
            load();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (!report) return <p className="p-8 text-gray-500">Loading...</p>;

    const canEditOrSubmit = ['DRAFT', 'NEEDS_CORRECTION'].includes(report.status);

    return (
        <ProtectedRoute>
            <main className="max-w-3xl mx-auto p-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold">
                        Week of {new Date(report.weekStartDate).toLocaleDateString()}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[report.status]}`}>
                        {report.status.replace('_', ' ')}
                    </span>
                </div>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                {canEditOrSubmit && (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50 mb-6"
                    >
                        {submitting ? 'Submitting...' : 'Submit for Review'}
                    </button>
                )}

                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(report, null, 2)}
                </pre>
            </main>
        </ProtectedRoute>
    );
}