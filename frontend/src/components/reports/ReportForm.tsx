'use client';
import { useEffect, useState } from 'react';
import { categoriesApi, Category, projectsApi, Project } from '@/lib/api';
import { ReportFormData } from '@/types/report';
import TaskTable from '@/components/reports/TaskTable';
import HighlightsSection from '@/components/reports/HighlightsSection';
import HoursBreakdownSection from '@/components/reports/HoursBreakdownSection';

type Props = {
    initialData: ReportFormData;
    onSave: (data: ReportFormData) => Promise<void>;
    saveLabel: string;
    clearable?: boolean;
};

function makeBlankForm(base: ReportFormData): ReportFormData {
    return {
        projectId: base.projectId,
        category: base.category,
        categoryId: base.categoryId,
        weekStartDate: base.weekStartDate,
        tasksNextWeek: '',
        notesLinks: '',
        tasks: [{
            taskName: '',
            priority: 'MEDIUM' as const,
            plannedPct: 0,
            actualPct: 0,
            status: 'IN PROGRESS',
            timePlannedHrs: 0,
            timeSpentHrs: 0,
            deliverable: '',
        }],
        highlights: [],
        hoursBreakdown: [],
    };
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 mb-5 shadow-sm">
            {title && (
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
}

// Updated input fields to support both light and dark modes
const inputCls = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 dark:[color-scheme:dark]';
const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2';

export default function ReportForm({ initialData, onSave, saveLabel, clearable }: Props) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [form, setForm] = useState<ReportFormData>(initialData);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([projectsApi.list(), categoriesApi.list()])
            .then(([projectData, categoryData]) => {
                setProjects(projectData);
                setCategories(categoryData);
            })
            .catch((err) => setError(err.message));
    }, []);

    function updateField<K extends keyof ReportFormData>(key: K, value: ReportFormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await save();
    }

    async function handleDraftSave() {
        await save();
    }

    async function save() {
        setError('');
        if ((!form.projectId && !form.categoryId) || !form.weekStartDate) {
            setError('Week and a project or category tag are required.');
            return;
        }
        setSaving(true);
        try {
            await onSave({
                ...form,
                tasks: form.tasks.map((task) => ({
                    ...task,
                    timePlannedHrs: Number(task.timePlannedHrs),
                    timeSpentHrs: Number(task.timeSpentHrs),
                })),
                hoursBreakdown: form.hoursBreakdown.map((entry) => ({
                    ...entry,
                    hoursSpent: Number(entry.hoursSpent),
                })),
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg px-4 py-3 text-red-600 dark:text-red-400 text-sm mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    {error}
                </div>
            )}

            {/* Section 1 — Week & Project / Category tag */}
            <SectionCard title="">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>
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
                        <label className={labelCls}>
                            Project / Category
                        </label>
                        <select
                            value={form.projectId ? `project:${form.projectId}` : form.categoryId ? `category:${form.categoryId}` : ''}
                            onChange={(e) => {
                                const [type, id] = e.target.value.split(':');
                                const selectedCategory = categories.find((category) => category.id === id);
                                updateField('projectId', type === 'project' ? id : '');
                                updateField('categoryId', type === 'category' ? id : '');
                                updateField('category', selectedCategory?.name || '');
                            }}
                            className={inputCls}
                            required
                        >
                            <option value="" className="text-slate-500">Select a project or category...</option>
                            <optgroup label="Projects">
                            {projects.map((p) => (
                                <option key={`project:${p.id}`} value={`project:${p.id}`}>{p.name}</option>
                            ))}
                            </optgroup>
                            <optgroup label="Categories">
                            {categories.map((category) => (
                                <option key={`category:${category.id}`} value={`category:${category.id}`}>{category.name}</option>
                            ))}
                            </optgroup>
                        </select>
                    </div>
                </div>
            </SectionCard>

            {/* Section 2 — Tasks (Full width) */}
            <SectionCard title="Tasks Completed This Week">
                <TaskTable tasks={form.tasks} onChange={(tasks) => updateField('tasks', tasks)} />
            </SectionCard>

            {/* Section 3 & 4 — Blockers & Achievements side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SectionCard title="Blockers">
                    <HighlightsSection
                        filterType="BLOCKER"
                        highlights={form.highlights}
                        onChange={(highlights) => updateField('highlights', highlights)}
                    />
                </SectionCard>
                <SectionCard title="Achievements">
                    <HighlightsSection
                        filterType="ACHIEVEMENT"
                        highlights={form.highlights}
                        onChange={(highlights) => updateField('highlights', highlights)}
                    />
                </SectionCard>
            </div>

            {/* Row: Hours and Plans side by side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Section 4 — Optional hours breakdown */}
                <SectionCard title="Hours Worked by Task Type (Optional)">
                    <HoursBreakdownSection
                        entries={form.hoursBreakdown}
                        onChange={(hoursBreakdown) => updateField('hoursBreakdown', hoursBreakdown)}
                    />
                </SectionCard>

                {/* Section 5 — Next Week + Notes */}
                <SectionCard title="Plans & Notes">
                    <div className="flex flex-col gap-5">
                        <div>
                            <label className={labelCls}>
                                Tasks Planned for Next Week
                            </label>
                            <textarea
                                value={form.tasksNextWeek || ''}
                                onChange={(e) => updateField('tasksNextWeek', e.target.value)}
                                className={inputCls}
                                rows={3}
                                placeholder="Briefly describe what you plan to work on next week…"
                            />
                        </div>
                        <div>
                            <label className={labelCls}>
                                Notes / Links <span className="normal-case font-normal text-slate-500">(optional)</span>
                            </label>
                            <textarea
                                value={form.notesLinks || ''}
                                onChange={(e) => updateField('notesLinks', e.target.value)}
                                className={inputCls}
                                rows={2}
                                placeholder="Paste any relevant links or additional notes…"
                            />
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 pb-10">
                {clearable ? (
                    <button
                        type="button"
                        onClick={() => {
                            if (confirm('Clear all form content? The week and project will be kept.')) {
                                setForm(makeBlankForm(form));
                            }
                        }}
                        className="flex items-center gap-1.5 text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-2.5 rounded-lg transition-all cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear All
                    </button>
                ) : <span />}

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={handleDraftSave}
                        disabled={saving}
                        className="bg-white dark:bg-transparent border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer shadow-sm dark:shadow-none"
                    >
                        {saving ? 'Saving…' : saveLabel}
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm px-7 py-2.5 rounded-lg shadow-lg shadow-violet-200 dark:shadow-violet-900/20 transition-all disabled:opacity-50 cursor-pointer border-none flex items-center gap-2"
                    >
                        {saving ? 'Saving…' : 'Save & Continue'}
                        {!saving && <span>&rarr;</span>}
                    </button>
                </div>
            </div>
        </form>
    );
}