'use client';
import { HoursBreakdownEntry } from '@/types/report';

type Props = {
    entries: HoursBreakdownEntry[];
    onChange: (entries: HoursBreakdownEntry[]) => void;
};

const QUICK_CATEGORIES = ['Development', 'Testing', 'Meetings', 'Documentation', 'Design', 'Review'];

const inputCls = 'rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder-slate-400 dark:placeholder-slate-500';

export default function HoursBreakdownSection({ entries, onChange }: Props) {
    function addRow(category = '') {
        if (category && entries.find((e) => e.taskCategory === category)) return;
        onChange([...entries, { taskCategory: category, hoursSpent: 0 }]);
    }
    function removeRow(index: number) {
        onChange(entries.filter((_, i) => i !== index));
    }
    function updateRow(index: number, field: keyof HoursBreakdownEntry, value: string | number) {
        const updated = [...entries];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    }

    const totalHours = entries.reduce((sum, e) => sum + (Number(e.hoursSpent) || 0), 0);

    return (
        <div>
            {/* Quick-fill chips */}
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 self-center uppercase tracking-wide">
                    Quick add:
                </span>
                {QUICK_CATEGORIES.map((cat) => {
                    const added = entries.some((e) => e.taskCategory === cat);
                    return (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => addRow(cat)}
                            disabled={added}
                            className={`text-xs font-medium rounded-full px-3 py-1 border transition-all cursor-pointer
                                ${added
                                    ? 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 opacity-60 cursor-default'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                                }`}
                        >
                            {added ? `✓ ${cat}` : `+ ${cat}`}
                        </button>
                    );
                })}
            </div>

            {/* Entry rows */}
            {entries.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic mb-3">
                    Click a category above or add a custom one below.
                </p>
            )}

            <div className="flex flex-col gap-2">
                {entries.map((entry, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-2"
                    >
                        <input
                            list="category-suggestions"
                            type="text"
                            placeholder="Category"
                            value={entry.taskCategory}
                            onChange={(e) => updateRow(i, 'taskCategory', e.target.value)}
                            className={`${inputCls} flex-1`}
                        />
                        <input
                            type="number"
                            min={0}
                            step={0.5}
                            placeholder="0"
                            value={entry.hoursSpent}
                            onChange={(e) => updateRow(i, 'hoursSpent', Number(e.target.value))}
                            className={`${inputCls} w-20 text-center`}
                        />
                        <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">hrs</span>
                        <button
                            type="button"
                            onClick={() => removeRow(i)}
                            className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 text-lg leading-none bg-transparent border-none cursor-pointer transition-colors shrink-0"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Custom add */}
            <button
                type="button"
                onClick={() => addRow()}
                className="mt-3 w-full border border-dashed border-slate-300 dark:border-slate-600 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg py-2 text-sm font-semibold transition-colors cursor-pointer bg-transparent"
            >
                + Add Custom Category
            </button>

            {/* Total */}
            {entries.length > 0 && (
                <div className="flex justify-end items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400 dark:text-slate-500">Total hours logged:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">{totalHours.toFixed(1)} h</span>
                </div>
            )}

            <datalist id="category-suggestions">
                {QUICK_CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
        </div>
    );
}