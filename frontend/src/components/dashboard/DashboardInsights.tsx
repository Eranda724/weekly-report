'use client';
import { useEffect, useState } from 'react';
import {
    LineChart, Line, BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';
import { dashboardApi, DashboardMetrics } from '@/lib/api';

/* ─── Color maps ─────────────────────────────────────── */
const STATUS_COLORS: Record<string, string> = {
    APPROVED: '#10B981',
    SUBMITTED: '#6366F1',
    NEEDS_CORRECTION: '#F59E0B',
    DRAFT: '#94A3B8',
    NOT_STARTED: '#EF4444',
};

const DONUT_COLORS = ['#6366F1', '#EF4444', '#F59E0B', '#10B981', '#94A3B8', '#14B8A6'];

/* ─── Tiny legend dot ─────────────────────────────────── */
function LegendDot({ color, label }: { color: string; label: string }) {
    return (
        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            {label}
        </span>
    );
}

/* ─── Chart card wrapper ──────────────────────────────── */
function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

/* ─── Relative time ─────────────────────────────────── */
function relativeTime(ts: string): string {
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor(diff / 60000);
    if (h >= 24) return `${Math.floor(h / 24)}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'just now';
}

/* ─── Donut Chart Custom Label ──────────────────────── */
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill={DONUT_COLORS[index % DONUT_COLORS.length]}
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={13}
            fontWeight={600}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

/* ─── Main component ─────────────────────────────────── */
export default function DashboardInsights({ weekStartDate }: { weekStartDate?: string }) {
    const [data, setData] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        dashboardApi.getMetrics(weekStartDate)
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [weekStartDate]);

    if (loading) return (
        <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
        </div>
    );
    if (error) return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-700 dark:text-red-400 text-sm">
            {error}
        </div>
    );
    if (!data) return null;

    const { summary, trend, statusByMember, timeByTaskType, activityFeed } = data;

    /* Derived totals for submitted this week card */
    const totalMembers = summary.complianceRate.submitted + summary.complianceRate.pending + summary.complianceRate.late;

    /* ── 6 API-driven stat cards ── */
    const apiCards = [
        {
            label: 'Reports Submitted This Week',
            value: `${summary.complianceRate.submitted}/${totalMembers}`,
            numCls: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'New Reports',
            value: summary.newReportsCount,
            numCls: 'text-blue-600 dark:text-blue-400',
        },
        {
            label: 'Needs Correction',
            value: summary.needsCorrectionCount,
            numCls: 'text-amber-600 dark:text-amber-400',
        },
        {
            label: 'Open Blockers',
            value: summary.openBlockersCount,
            numCls: 'text-red-600 dark:text-red-400',
        },
        {
            label: 'Accepted Reports',
            value: summary.acceptedReportsCount,
            numCls: 'text-teal-600 dark:text-teal-400',
        },
        {
            label: 'Pending (Drafts)',
            value: summary.draftReportsCount,
            numCls: 'text-slate-600 dark:text-slate-400',
        },
    ];

    /* stacked bar data: one entry per member, bars for each status */
    const memberNames = Array.from(new Set(statusByMember.map((r) => r.name)));
    const stackedData = memberNames.map((name) => {
        const row: Record<string, any> = { name };
        Object.keys(STATUS_COLORS).forEach((s) => { row[s] = 0; });
        statusByMember.filter((r) => r.name === name).forEach((r) => {
            row[r.status] = (row[r.status] || 0) + 1;
        });
        return row;
    });

    return (
        <div className="space-y-5">

            {/* ── API stat cards ── */}
            <div className="grid grid-cols-6 gap-3">
                {apiCards.map((card) => (
                    <div key={card.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                        <div className="min-w-0 w-full text-center">
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-1.5 leading-tight truncate" title={card.label}>{card.label}</p>
                            <p className={`text-2xl font-extrabold leading-none ${card.numCls}`}>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 space-y-5">
                    {/* ── Task Completion Trend (full width line chart) ── */}
                    <ChartCard title="Task Completion Trend (Team Wide)">
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={trend} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="weekStartDate"
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    tickFormatter={(v, i) => `Week ${i + 1}`}
                                />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                                    formatter={(val) => val === 'completedTasks' ? 'Tasks Completed (Done)' : val}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="completedTasks"
                                    name="Tasks Completed (Done)"
                                    stroke="#6366F1"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: '#6366F1' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* ── Status and Time (2-col row inside the left area) ── */}
                    <div className="grid grid-cols-2 gap-5">
                        {/* Col 1: Status by Team Member (stacked horizontal bar) */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-4">
                                Report Submission Status by Team Member
                            </h3>
                            {stackedData.length === 0 ? (
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No data.</p>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={stackedData} layout="vertical" barSize={10} margin={{ left: -10, right: 8, top: 0, bottom: 0 }}>
                                            <XAxis type="number" hide />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                width={90}
                                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                                tickFormatter={(v: string) => v.split(' ')[0]}
                                                axisLine={{ stroke: '#475569' }}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                                            />
                                            {Object.entries(STATUS_COLORS).map(([status, color]) => (
                                                <Bar key={status} dataKey={status} stackId="a" fill={color} />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-[11px] font-medium tracking-wide">
                                        {Object.entries(STATUS_COLORS).map(([s, c]) => (
                                            <LegendDot key={s} color={c} label={s.replace('_', ' ')} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Col 2: Time Spent by Task Type (donut) */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-4">
                                Time Spent by Task Type (Team Wide)
                            </h3>
                            {timeByTaskType.length === 0 ? (
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No data.</p>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
                                            <Pie
                                                data={timeByTaskType}
                                                dataKey="hours"
                                                nameKey="taskCategory"
                                                cx="50%" cy="50%"
                                                innerRadius={45}
                                                outerRadius={70}
                                                paddingAngle={2}
                                                label={renderCustomizedLabel}
                                                labelLine={false}
                                            >
                                                {timeByTaskType.map((_, i) => (
                                                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(val: any) => [`${val}h`, '']}
                                                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-col gap-1.5 mt-2 ml-2 text-[11px]">
                                        {timeByTaskType.map((entry, i) => (
                                            <LegendDot key={i} color={DONUT_COLORS[i % DONUT_COLORS.length]} label={entry.taskCategory} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right side (Recent Activity Feed) ── */}
                <div className="col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-4">
                        Recent Activity Feed
                    </h3>
                    {activityFeed.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">No recent activity.</p>
                    ) : (
                        <ul className="flex flex-col gap-3 flex-1 overflow-y-auto">
                            {activityFeed.slice(0, 10).map((item, i) => (
                                <li key={i} className="flex flex-col gap-0.5">
                                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{item.text}</p>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                        {new Date(item.timestamp).toLocaleString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                            hour: 'numeric', minute: '2-digit'
                                        })}
                                    </span>
                                    {i < activityFeed.length - 1 && (
                                        <div className="border-b border-slate-100 dark:border-slate-700 mt-2" />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}