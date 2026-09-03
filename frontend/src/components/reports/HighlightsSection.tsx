'use client';
import { ReportHighlight, HighlightType } from '@/types/report';

type Props = {
    highlights: ReportHighlight[];
    onChange: (highlights: ReportHighlight[]) => void;
};

export default function HighlightsSection({ highlights, onChange }: Props) {
    const blockers = highlights.filter((h) => h.itemType === 'BLOCKER');
    const achievements = highlights.filter((h) => h.itemType === 'ACHIEVEMENT');

    function addItem(type: HighlightType) {
        onChange([...highlights, { itemType: type, description: '', isKeyItem: false }]);
    }

    function removeItem(target: ReportHighlight) {
        onChange(highlights.filter((h) => h !== target));
    }

    function updateDescription(target: ReportHighlight, description: string) {
        onChange(highlights.map((h) => (h === target ? { ...h, description } : h)));
    }

    function setKeyItem(type: HighlightType, target: ReportHighlight) {
        // Only one item of this type can be "key" — uncheck others of the same type
        onChange(
            highlights.map((h) =>
                h.itemType === type ? { ...h, isKeyItem: h === target } : h
            )
        );
    }

    function renderList(type: HighlightType, items: ReportHighlight[], label: string) {
        return (
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">{label}</label>
                    <button
                        type="button"
                        onClick={() => addItem(type)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        + Add {label.slice(0, -1)}
                    </button>
                </div>

                {items.length === 0 && (
                    <p className="text-sm text-gray-500 mb-2">None added yet.</p>
                )}

                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 border rounded p-2">
                            <input
                                type="radio"
                                name={`key-${type}`}
                                checked={item.isKeyItem}
                                onChange={() => setKeyItem(type, item)}
                                className="mt-2"
                                title={`Mark as key ${label.slice(0, -1).toLowerCase()}`}
                            />
                            <textarea
                                value={item.description}
                                onChange={(e) => updateDescription(item, e.target.value)}
                                placeholder={`Describe this ${label.slice(0, -1).toLowerCase()}...`}
                                className="flex-1 border rounded px-2 py-1 text-black text-sm"
                                rows={2}
                            />
                            <button
                                type="button"
                                onClick={() => removeItem(item)}
                                className="text-red-600 text-xs hover:underline mt-2"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {renderList('BLOCKER', blockers, 'Blockers / Challenges')}
            {renderList('ACHIEVEMENT', achievements, 'Achievements / Highlights')}
        </div>
    );
}