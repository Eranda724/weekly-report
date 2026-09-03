'use client';
import { HoursBreakdownEntry } from '@/types/report';

type Props = {
    entries: HoursBreakdownEntry[];
    onChange: (entries: HoursBreakdownEntry[]) => void;
};

const SUGGESTED_CATEGORIES = ['Development', 'Testing', 'Meetings', 'Documentation'];

export default function HoursBreakdownSection({ entries, onChange }: Props) {
    function addRow() {
        onChange([...entries, { taskCategory: '', hoursSpent: 0 }]);
    }

    function removeRow(index: number) {
        onChange(entries.filter((_, i) => i !== index));
    }

    function updateRow(index: number, field: keyof HoursBreakdownEntry, value: string | number) {
        const updated = [...entries];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                    Hours Worked by Task Type <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <button type="button" onClick={addRow} className="text-sm text-blue-600 hover:underline">
                    + Add Category
                </button>
            </div>

            {entries.length === 0 && (
                <p className="text-sm text-gray-500 mb-2">No hours breakdown added.</p>
            )}

            <div className="space-y-2">
                {entries.map((entry, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <input
                            list="category-suggestions"
                            type="text"
                            placeholder="Category"
                            value={entry.taskCategory}
                            onChange={(e) => updateRow(i, 'taskCategory', e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-black text-sm"
                        />
                        <input
                            type="number"
                            min={0}
                            step={0.5}
                            placeholder="Hours"
                            value={entry.hoursSpent}
                            onChange={(e) => updateRow(i, 'hoursSpent', Number(e.target.value))}
                            className="w-24 border rounded px-2 py-1 text-black text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => removeRow(i)}
                            className="text-red-600 text-xs hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            <datalist id="category-suggestions">
                {SUGGESTED_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                ))}
            </datalist>
        </div>
    );
}