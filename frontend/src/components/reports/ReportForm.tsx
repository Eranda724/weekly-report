'use client';
import { useEffect, useState } from 'react';
import { projectsApi } from '@/lib/api';
import { Project } from '@/lib/api';
import { ReportFormData } from '@/types/report';
import TaskTable from '@/components/reports/TaskTable';
import HighlightsSection from '@/components/reports/HighlightsSection';
import HoursBreakdownSection from '@/components/reports/HoursBreakdownSection';

type Props = {
    initialData: ReportFormData;
    onSave: (data: ReportFormData) => Promise<void>;
    saveLabel: string;
};

function SectionCard({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-700">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                    {num}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                    {title}
                </span>
            </div>
            {children}
        </div>
    );
}

const inputCls = 'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition';

export default function ReportForm({ initialData, onSave, saveLabel }: Props) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [form, setForm] = useState<ReportFormData>(initialData);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        projectsApi.list().then(setProjects).catch((err) => setError(err.message));
    }, []);

    function updateField<K extends keyof ReportFormData>(key: K, value: ReportFormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!form.projectId || !form.weekStartDate) {
            setError('Project and week are required.');
            return;
        }
        setSaving(true);
        try {
            await onSave(form);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-700 dark:text-red-400 text-sm mb-5">
                    {error}
                </div>
            )}

            {/* Section 1 — Week & Project */}
            <SectionCard num={1} title="Week & Project">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                            Week Starting
                        </label>
                        <input
                            type="date"
                            value={form.weekStartDate}
                            onChange={(e) => updateField('weekStartDate', e.target.value)}
                            className={inputCls}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                            Project / Category
                        </label>
                        <select
                            value={form.projectId}
                            onChange={(e) => updateField('projectId', e.target.value)}
                            className={inputCls}
                            required
                        >
                            <option value="">Select a project…</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </SectionCard>

            {/* Section 2 — Tasks */}
            <SectionCard num={2} title="Tasks Completed This Week">
                <TaskTable tasks={form.tasks} onChange={(tasks) => updateField('tasks', tasks)} />
            </SectionCard>

            {/* Section 3 — Blockers & Achievements */}
            <SectionCard num={3} title="Blockers & Achievements">
                <HighlightsSection
                    highlights={form.highlights}
                    onChange={(highlights) => updateField('highlights', highlights)}
                />
            </SectionCard>

            {/* Section 4 — Hours Breakdown */}
            <SectionCard num={4} title="Hours Worked by Task Type">
                <HoursBreakdownSection
                    entries={form.hoursBreakdown}
                    onChange={(hoursBreakdown) => updateField('hoursBreakdown', hoursBreakdown)}
                />
            </SectionCard>

            {/* Section 5 — Next Week + Notes */}
            <SectionCard num={5} title="Plans & Notes">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                            Tasks Planned for Next Week
                        </label>
                        <textarea
                            value={form.tasksNextWeek}
                            onChange={(e) => updateField('tasksNextWeek', e.target.value)}
                            className={inputCls}
                            rows={3}
                            placeholder="Briefly describe what you plan to work on next week…"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                            Notes / Links <span className="normal-case font-normal text-slate-300 dark:text-slate-600">(optional)</span>
                        </label>
                        <textarea
                            value={form.notesLinks}
                            onChange={(e) => updateField('notesLinks', e.target.value)}
                            className={inputCls}
                            rows={2}
                            placeholder="Paste any relevant links or additional notes…"
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2 pb-10">
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {saving ? 'Saving…' : saveLabel}
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 transition-all disabled:opacity-50 cursor-pointer border-none"
                >
                    {saving ? 'Saving…' : 'Save & Continue →'}
                </button>
            </div>
        </form>
    );
}