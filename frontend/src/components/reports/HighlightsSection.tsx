'use client';
import { ReportHighlight, HighlightType } from '@/types/report';

type Props = {
    highlights: ReportHighlight[];
    onChange: (highlights: ReportHighlight[]) => void;
};

const SECTION_CFG = {
    BLOCKER: { label: 'Blockers', addLabel: 'Add Blocker', placeholder: 'Describe this blocker or challenge…', border: 'border-l-red-400', addCls: 'border-red-400   text-red-500   dark:text-red-400   hover:bg-red-50   dark:hover:bg-red-900/20', starColor: 'text-red-400' },
    ACHIEVEMENT: { label: 'Achievements', addLabel: 'Add Achievement', placeholder: 'Describe this achievement or highlight…', border: 'border-l-emerald-400', addCls: 'border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20', starColor: 'text-emerald-500' },
};

const inputCls = 'flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-y placeholder-slate-400 dark:placeholder-slate-500';

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
        onChange(highlights.map((h) => h.itemType === type ? { ...h, isKeyItem: h === target } : h));
    }

    function renderList(type: HighlightType, items: ReportHighlight[]) {
        const cfg = SECTION_CFG[type];
        return (
            <div className={`border-l-4 ${cfg.border} pl-4 flex-1`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        {cfg.label}
                    </span>
                    <button
                        type="button"
                        onClick={() => addItem(type)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border bg-transparent cursor-pointer transition-colors ${cfg.addCls}`}
                    >
                        {cfg.addLabel}
                    </button>
                </div>

                {items.length === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">None added yet.</p>
                )}

                <div className="flex flex-col gap-1.5">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl p-2.5"
                        >
                            <div className="flex items-start gap-2">
                                {/* Star toggle */}
                                <button
                                    type="button"
                                    onClick={() => setKeyItem(type, item)}
                                    title="Mark as key item"
                                    className={`bg-transparent border-none cursor-pointer text-base leading-none pt-1 shrink-0 transition-opacity ${item.isKeyItem ? `opacity-100 ${cfg.starColor}` : 'opacity-25 text-slate-400'}`}
                                >
                                    ⭐
                                </button>
                                <textarea
                                    value={item.description}
                                    onChange={(e) => updateDescription(item, e.target.value)}
                                    placeholder={cfg.placeholder}
                                    className={inputCls}
                                    rows={2}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeItem(item)}
                                    className="bg-transparent border-none cursor-pointer text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 text-lg leading-none pt-1 shrink-0 transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                            {item.isKeyItem && (
                                <p className={`text-[0.68rem] font-semibold mt-1.5 ml-7 ${cfg.starColor}`}>
                                    Key {type === 'BLOCKER' ? 'Blocker' : 'Achievement'} this week
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderList('BLOCKER', blockers)}
            {renderList('ACHIEVEMENT', achievements)}
        </div>
    );
}