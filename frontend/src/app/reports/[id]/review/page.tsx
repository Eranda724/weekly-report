'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { reportsApi, managerReportsApi } from '@/lib/api';
import { Report } from '@/types/report';

export default function ManagerReviewPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [report, setReport] = useState<Report | null>(null);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        reportsApi.getOne(id).then(setReport).catch((err) => setError(err.message));
    }, [id]);

    async function handleDecision(decision: 'APPROVED' | 'NEEDS_CORRECTION') {
        setError('');
        if (decision === 'NEEDS_CORRECTION' && !comment.trim()) {
            setError('A comment is required when requesting changes.');
            return;
        }
        setSubmitting(true);
        try {
            await managerReportsApi.review(id, decision, comment.trim() || undefined);
            router.push('/dashboard'); // will point to the real team dashboard in Phase 6
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (!report) return <p className="p-8 text-gray-500">Loading...</p>;

    if (report.status !== 'SUBMITTED') {
        return (
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <main className="max-w-3xl mx-auto p-8">
                    <p className="text-gray-600">
                        This report is currently <strong>{report.status}</strong> — only reports with status
                        SUBMITTED can be reviewed here.
                    </p>
                </main>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            <main className="max-w-3xl mx-auto p-8">
                <h1 className="text-2xl font-semibold mb-1">
                    Review — Week of {new Date(report.weekStartDate).toLocaleDateString()}
                </h1>
                <p className="text-gray-500 mb-6">
                    {report.user?.name} · {report.project?.name}
                </p>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <section className="mb-6">
                    <h2 className="font-medium mb-2">Tasks Completed</h2>
                    <div className="space-y-2">
                        {report.tasks.map((t, i) => (
                            <div key={i} className="border rounded p-3 text-sm">
                                <p className="font-medium">{t.taskName} <span className="text-gray-400">({t.priority})</span></p>
                                <p>Planned {t.plannedPct}% / Actual {t.actualPct}% — {t.status}</p>
                                <p>Hours: {t.timePlannedHrs} planned / {t.timeSpentHrs} spent</p>
                                {t.deliverable && <p className="text-gray-600">Output: {t.deliverable}</p>}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-6">
                    <h2 className="font-medium mb-2">Blockers</h2>
                    {report.highlights.filter(h => h.itemType === 'BLOCKER').map((h, i) => (
                        <p key={i} className="text-sm mb-1">
                            {h.isKeyItem && <span className="text-red-600 font-medium">[Key] </span>}
                            {h.description}
                        </p>
                    ))}
                </section>

                <section className="mb-6">
                    <h2 className="font-medium mb-2">Achievements</h2>
                    {report.highlights.filter(h => h.itemType === 'ACHIEVEMENT').map((h, i) => (
                        <p key={i} className="text-sm mb-1">
                            {h.isKeyItem && <span className="text-green-600 font-medium">[Key] </span>}
                            {h.description}
                        </p>
                    ))}
                </section>

                <section className="mb-6">
                    <h2 className="font-medium mb-2">Next Week</h2>
                    <p className="text-sm text-gray-700">{report.tasksNextWeek}</p>
                </section>

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

                <section className="mb-6 border-t pt-6">
                    <label className="block text-sm font-medium mb-2">
                        Review Comment <span className="text-gray-400 font-normal">(required for Request Changes)</span>
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="w-full border rounded px-3 py-2 text-black"
                        placeholder="Explain what needs to change..."
                    />
                </section>

                <div className="flex gap-3">
                    <button
                        onClick={() => handleDecision('APPROVED')}
                        disabled={submitting}
                        className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => handleDecision('NEEDS_CORRECTION')}
                        disabled={submitting}
                        className="bg-yellow-600 text-white px-5 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                        Request Changes
                    </button>
                </div>
            </main>
        </ProtectedRoute>
    );
}