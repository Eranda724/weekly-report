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

export default function TaskTable({ tasks, onChange }: Props) {
    function addRow() {
        onChange([...tasks, { ...emptyTask }]);
    }

    function removeRow(index: number) {
        onChange(tasks.filter((_, i) => i !== index));
    }

    function updateRow<K extends keyof ReportTask>(index: number, key: K, value: ReportTask[K]) {
        const updated = [...tasks];
        updated[index] = { ...updated[index], [key]: value };
        onChange(updated);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Tasks Completed</label>
                <button
                    type="button"
                    onClick={addRow}
                    className="text-sm text-blue-600 hover:underline"
                >
                    + Add Task
                </button>
            </div>

            {tasks.length === 0 && (
                <p className="text-sm text-gray-500 mb-2">No tasks added yet.</p>
            )}

            <div className="space-y-3">
                {tasks.map((task, i) => (
                    <div key={i} className="border rounded p-3 space-y-2 relative">
                        <button
                            type="button"
                            onClick={() => removeRow(i)}
                            className="absolute top-2 right-2 text-red-600 text-xs hover:underline"
                        >
                            Remove
                        </button>

                        <input
                            type="text"
                            placeholder="Task name"
                            value={task.taskName}
                            onChange={(e) => updateRow(i, 'taskName', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-black text-sm"
                            required
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={task.priority}
                                onChange={(e) => updateRow(i, 'priority', e.target.value as Priority)}
                                className="border rounded px-2 py-1 text-black text-sm"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Status (e.g. Completed)"
                                value={task.status}
                                onChange={(e) => updateRow(i, 'status', e.target.value)}
                                className="border rounded px-2 py-1 text-black text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            <div>
                                <label className="text-xs text-gray-500">Planned %</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={task.plannedPct}
                                    onChange={(e) => updateRow(i, 'plannedPct', Number(e.target.value))}
                                    className="w-full border rounded px-2 py-1 text-black text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Actual %</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={task.actualPct}
                                    onChange={(e) => updateRow(i, 'actualPct', Number(e.target.value))}
                                    className="w-full border rounded px-2 py-1 text-black text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Hrs Planned</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.5}
                                    value={task.timePlannedHrs}
                                    onChange={(e) => updateRow(i, 'timePlannedHrs', Number(e.target.value))}
                                    className="w-full border rounded px-2 py-1 text-black text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Hrs Spent</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.5}
                                    value={task.timeSpentHrs}
                                    onChange={(e) => updateRow(i, 'timeSpentHrs', Number(e.target.value))}
                                    className="w-full border rounded px-2 py-1 text-black text-sm"
                                />
                            </div>
                        </div>

                        <input
                            type="text"
                            placeholder="Output / deliverable"
                            value={task.deliverable}
                            onChange={(e) => updateRow(i, 'deliverable', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-black text-sm"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}