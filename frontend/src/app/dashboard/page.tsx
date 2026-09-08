'use client';
import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardInsights from '@/components/dashboard/DashboardInsights';
import AIChatWidget from '@/components/AIChatWidget';

const selectCls = 'text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer';

export default function DashboardOverviewPage() {
    const [weekStartDate, setWeekStartDate] = useState('');

    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            {/* ── Top filter bar ── */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm px-6 h-16 flex items-center justify-between gap-4">
                <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase whitespace-nowrap">
                    Manager Overview
                </h1>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Week:</span>
                    <input
                        type="date"
                        value={weekStartDate}
                        onChange={(e) => setWeekStartDate(e.target.value)}
                        className={selectCls}
                    />
                    {weekStartDate && (
                        <button
                            onClick={() => setWeekStartDate('')}
                            className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 underline bg-transparent border-none cursor-pointer transition-colors"
                        >
                            Clear
                        </button>
                    )}
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
                    <AIChatWidget weekStartDate={weekStartDate || undefined} />
                </div>
            </div>

            {/* ── Page content ── */}
            <div className="px-6 py-6 space-y-6">
                <DashboardInsights weekStartDate={weekStartDate || undefined} />
            </div>
        </ProtectedRoute>
    );
}