'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { reportsApi } from '@/lib/api';
import { Report } from '@/types/report';
import Link from 'next/link';

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

    // recent comment
    const latestComment = report.reviewComments?.[0];

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

                {report.status === 'NEEDS_CORRECTION' && latestComment && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-6">
                        <p className="text-sm font-medium text-yellow-800 mb-1">Manager requested changes:</p>
                        <p className="text-sm text-yellow-900">{latestComment.commentText}</p>
                    </div>
                )}

                {report.status === 'APPROVED' && (
                    <div className="bg-green-50 border border-green-300 rounded p-4 mb-6">
                        <p className="text-sm text-green-800">
                            ✓ Approved{report.approvedAt ? ` on ${new Date(report.approvedAt).toLocaleDateString()}` : ''}
                        </p>
                    </div>
                )}

                <div className="flex gap-3 mb-6">
                    {canEditOrSubmit && (
                        <>
                            <Link
                                href={`/reports/${id}/edit`}
                                className="bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700"
                            >
                                Edit Report
                            </Link>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : report.status === 'NEEDS_CORRECTION' ? 'Resubmit' : 'Submit for Review'}
                            </button>
                        </>
                    )}
                </div>

                {report.versions && report.versions.length > 0 && (
                    <section className="mb-6 border-t pt-6">
                        <h2 className="font-medium mb-3">Version History</h2>
                        <div className="space-y-2">
                            {report.versions.map((v) => {
                                const commentsForVersion = report.reviewComments?.filter(c => c.versionId === v.id) || [];
                                return (
                                    <details key={v.id} className="border rounded p-3">
                                        <summary className="cursor-pointer text-sm font-medium">
                                            Version {v.versionNumber} — submitted {new Date(v.submittedAt).toLocaleString()}
                                            {commentsForVersion.length > 0 && (
                                                <span className="text-gray-500 font-normal"> · {commentsForVersion.length} review comment(s)</span>
                                            )}
                                        </summary>
                                        <div className="mt-2 text-sm text-gray-700">
                                            <pre className="bg-gray-50 p-2 rounded overflow-auto text-xs mb-2">
                                                {JSON.stringify(JSON.parse(v.contentSnapshot as any), null, 2)}
                                            </pre>
                                            {commentsForVersion.map((c) => (
                                                <div key={c.id} className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-1">
                                                    <p className="text-xs font-medium">
                                                        {c.decision} — {new Date(c.createdAt).toLocaleString()}
                                                    </p>
                                                    {c.commentText && <p className="text-xs">{c.commentText}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                );
                            })}
                        </div>
                    </section>
                )}

                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(report, null, 2)}
                </pre>
            </main>
        </ProtectedRoute>
    );
}