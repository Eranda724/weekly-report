'use client';
import { ReportTask, Priority } from '@/types/report';

type Props = {
    tasks: ReportTask[];
    onChange: (tasks: ReportTask[]) => void;
};

const emptyTask: ReportTask = {
    taskName: '',
    priority: 'MEDIUM',
    plannedPct: 0,
    actualPct: 0,
    status: '',
    timePlannedHrs: 0,
    timeSpentHrs: 0,
    deliverable: '',
};

const PRIORITY_CLS: Record<Priority, string> = {
    HIGH:   'bg-red-100   text-red-700   dark:bg-red-900/40   dark:text-red-300',
    MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    LOW:    'bg-sky-100   text-sky-700   dark:bg-sky-900/40   dark:text-sky-300',
};

const STATUS_OPTIONS = ['In Progress', 'Done', 'Blocked', 'Pending'];

const inputCls = 'w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition';

export default function TaskTable({ tasks, onChange }: Props) {
    function addRow() { onChange([...tasks, { ...emptyTask }]); }
    function removeRow(i: number) { onChange(tasks.filter((_, idx) => idx !== i)); }
    function updateRow<K extends keyof ReportTask>(i: number, key: K, value: ReportTask[K]) {
        const updated = [...tasks];
        updated[i] = { ...updated[i], [key]: value };
        onChange(updated);
    }

    return (
        <div>
            {/* Rows */}
            <div className="flex flex-col gap-3">
                {tasks.length === 0 && (
                    <p className="text-sm text-slate-400 dark:text-slate-500 py-2 italic">
                        No tasks added yet. Click "+ Add Task" to start.
                    </p>
                )}
                {tasks.map((task, i) => (
                    <div
                        key={i}
                        className="flex flex-col gap-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 shadow-sm"
                    >
                        {/* Top Row: Task Name & Status & Remove */}
                        <div className="flex gap-3 items-start">
                            <div className="flex-1">
                                <label className="block text-[0.65rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                    Task Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Build authentication API..."
                                    value={task.taskName}
                                    onChange={(e) => updateRow(i, 'taskName', e.target.value)}
                                    className={inputCls}
                                    required
                                />
                            </div>
                            <div className="w-32 shrink-0">
                                <label className="block text-[0.65rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <select
                                    value={task.status}
                                    onChange={(e) => updateRow(i, 'status', e.target.value)}
                                    className={inputCls}
                                >
                                    <option value="">— Status —</option>
                                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeRow(i)}
                                className="mt-5 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 text-xl leading-none bg-transparent border-none cursor-pointer p-1 transition-colors"
                                title="Remove task"
                            >
                                ×
                            </button>
                        </div>

                        {/* Middle Row: Priority & Metrics */}
                        <div className="flex items-end gap-5 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg p-3">
                            {/* 1. Priority (Fixed width) */}
                            <div className="w-24 shrink-0">
                                <label className="block text-[0.65rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                    Priority
                                </label>
                                <select
                                    value={task.priority}
                                    onChange={(e) => updateRow(i, 'priority', e.target.value as Priority)}
                                    className={`rounded-md border-none text-xs font-semibold px-2 py-1.5 outline-none cursor-pointer w-full ${PRIORITY_CLS[task.priority]}`}
                                >
                                    <option value="HIGH">High</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="LOW">Low</option>
                                </select>
                            </div>

                            {/* 2. Progress (50% of remaining width) */}
                            <div className="flex-1 flex gap-3 border-l border-slate-200 dark:border-slate-700/50 pl-5">
                                <div className="flex-1">
                                    <label className="block text-[0.65rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 text-center whitespace-nowrap">
                                        Planned Progress
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number" min={0} max={100}
                                            value={task.plannedPct}
                                            onChange={(e) => updateRow(i, 'plannedPct', Number(e.target.value))}
                                            className={inputCls + ' text-center pr-6'}
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold pointer-events-none">%</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[0.65rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 text-center whitespace-nowrap">
                                        Actual Progress
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number" min={0} max={100}
                                            value={task.actualPct}
                                            onChange={(e) => updateRow(i, 'actualPct', Number(e.target.value))}
                                            className={inputCls + ' text-center pr-6'}
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold pointer-events-none">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Hours (50% of remaining width) */}
                            <div className="flex-1 flex gap-3 border-l border-slate-200 dark:border-slate-700/50 pl-5">
                                <div className="flex-1">
                                    <label className="block text-[0.65rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 text-center whitespace-nowrap">
                                        Planned Hours
                                    </label>
                                    <input
                                        type="number" min={0} step={0.5}
                                        value={task.timePlannedHrs}
                                        onChange={(e) => updateRow(i, 'timePlannedHrs', Number(e.target.value))}
                                        className={inputCls + ' text-center'}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[0.65rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 text-center whitespace-nowrap">
                                        Spent Hours
                                    </label>
                                    <input
                                        type="number" min={0} step={0.5}
                                        value={task.timeSpentHrs}
                                        onChange={(e) => updateRow(i, 'timeSpentHrs', Number(e.target.value))}
                                        className={inputCls + ' text-center'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: Deliverable */}
                        <div>
                            <label className="block text-[0.65rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                Deliverable / Link
                            </label>
                            <input
                                type="text"
                                placeholder="Output, PR link, document url..."
                                value={task.deliverable}
                                onChange={(e) => updateRow(i, 'deliverable', e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Add row */}
            <button
                type="button"
                onClick={addRow}
                className="mt-4 w-full border border-dashed border-slate-300 dark:border-slate-600 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl py-2.5 text-sm font-semibold transition-colors cursor-pointer bg-transparent shadow-sm"
            >
                + Add Task
            </button>
        </div>
    );
}