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
            {/* Column headers */}
            {tasks.length > 0 && (
                <div className="grid gap-1.5 pb-2 mb-1 border-b border-slate-100 dark:border-slate-700"
                    style={{ gridTemplateColumns: '2fr 80px 60px 60px 100px 58px 58px 1fr 24px' }}>
                    {['Task Name', 'Priority', 'Plan %', 'Act %', 'Status', 'Hrs Plan', 'Hrs Spent', 'Deliverable', ''].map((h) => (
                        <span key={h} className="text-[0.62rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {h}
                        </span>
                    ))}
                </div>
            )}

            {/* Rows */}
            <div className="flex flex-col gap-2">
                {tasks.length === 0 && (
                    <p className="text-sm text-slate-400 dark:text-slate-500 py-3 italic">
                        No tasks added yet. Click "+ Add Task" to start.
                    </p>
                )}
                {tasks.map((task, i) => (
                    <div
                        key={i}
                        className="grid gap-1.5 items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-2"
                        style={{ gridTemplateColumns: '2fr 80px 60px 60px 100px 58px 58px 1fr 24px' }}
                    >
                        {/* Task name */}
                        <input
                            type="text"
                            placeholder="Task name"
                            value={task.taskName}
                            onChange={(e) => updateRow(i, 'taskName', e.target.value)}
                            className={inputCls}
                            required
                        />

                        {/* Priority */}
                        <select
                            value={task.priority}
                            onChange={(e) => updateRow(i, 'priority', e.target.value as Priority)}
                            className={`rounded-md border-none text-xs font-semibold px-2 py-1.5 outline-none cursor-pointer w-full ${PRIORITY_CLS[task.priority]}`}
                        >
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>

                        {/* Planned % */}
                        <div className="flex items-center gap-0.5">
                            <input type="number" min={0} max={100} value={task.plannedPct}
                                onChange={(e) => updateRow(i, 'plannedPct', Number(e.target.value))}
                                className={inputCls + ' text-center'} />
                        </div>

                        {/* Actual % */}
                        <div className="flex items-center gap-0.5">
                            <input type="number" min={0} max={100} value={task.actualPct}
                                onChange={(e) => updateRow(i, 'actualPct', Number(e.target.value))}
                                className={inputCls + ' text-center'} />
                        </div>

                        {/* Status */}
                        <select value={task.status} onChange={(e) => updateRow(i, 'status', e.target.value)}
                            className={inputCls}>
                            <option value="">— Status —</option>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Hrs planned */}
                        <input type="number" min={0} step={0.5} value={task.timePlannedHrs}
                            onChange={(e) => updateRow(i, 'timePlannedHrs', Number(e.target.value))}
                            className={inputCls + ' text-center'} />

                        {/* Hrs spent */}
                        <input type="number" min={0} step={0.5} value={task.timeSpentHrs}
                            onChange={(e) => updateRow(i, 'timeSpentHrs', Number(e.target.value))}
                            className={inputCls + ' text-center'} />

                        {/* Deliverable */}
                        <input type="text" placeholder="Output / link" value={task.deliverable}
                            onChange={(e) => updateRow(i, 'deliverable', e.target.value)}
                            className={inputCls} />

                        {/* Remove */}
                        <button type="button" onClick={() => removeRow(i)}
                            className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 text-lg leading-none bg-transparent border-none cursor-pointer p-0 transition-colors">
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Add row */}
            <button
                type="button"
                onClick={addRow}
                className="mt-3 w-full border border-dashed border-slate-300 dark:border-slate-600 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg py-2 text-sm font-semibold transition-colors cursor-pointer bg-transparent"
            >
                + Add Task
            </button>
        </div>
    );
}