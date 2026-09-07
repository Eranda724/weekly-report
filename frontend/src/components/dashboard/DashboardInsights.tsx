'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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

function RecentActivityFeed({ activityFeed }: { activityFeed: DashboardMetrics['activityFeed'] }) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-4">
                Recent Activity Feed
            </h3>
            {activityFeed.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No recent activity.</p>
            ) : (
                <ul className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[260px] pr-2">
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
    );
}

function ReportSubmissionStatus({ statusByMember }: { statusByMember: DashboardMetrics['statusByMember'] }) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-3">
                Report Submission Status
            </h3>
            {statusByMember.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No data.</p>
            ) : (() => {
                const weeks: string[] = statusByMember[0]?.statuses?.map((s: any) => s.week) ?? [];
                const lastWeekIdx = weeks.length - 1;

                const WEEK_LABELS = ['2w ago', '1w ago', 'last week', 'This week'];
                const STATUS_LABEL: Record<string, string> = {
                    APPROVED: 'Approved',
                    SUBMITTED: 'Submitted',
                    NEEDS_CORRECTION: 'Needs Fix',
                    DRAFT: 'Draft',
                    NOT_STARTED: 'Not Started',
                };

                return (
                    <div className="flex flex-col flex-1">
                        <div className="flex items-center mb-2">
                            <span className="w-20 shrink-0" />
                            {weeks.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`flex-1 text-center text-[9px] font-bold tracking-wide ${idx === lastWeekIdx ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`}
                                >
                                    {WEEK_LABELS[idx] ?? `W${idx + 1}`}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-col flex-1 justify-between gap-2">
                            {statusByMember.map((member: any, mi: number) => (
                                <div key={mi} className="flex items-center gap-1">
                                    <span
                                        className="w-20 shrink-0 text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate pr-2"
                                        title={member.name}
                                    >
                                        {member.name.split(' ')[0]}
                                    </span>
                                    <div className="flex flex-1 gap-1">
                                        {(member.statuses ?? []).map((s: any, si: number) => {
                                            const color = STATUS_COLORS[s.status] || STATUS_COLORS.NOT_STARTED;
                                            const isThisWeek = si === lastWeekIdx;
                                            return (
                                                <div
                                                    key={si}
                                                    title={`${member.name} – ${STATUS_LABEL[s.status] || s.status}`}
                                                    className={`flex-1 h-7 rounded cursor-default transition-opacity hover:opacity-75 ${isThisWeek ? 'ring-2 ring-offset-1 ring-indigo-400 dark:ring-indigo-500' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                {Object.entries(STATUS_COLORS).map(([s, c]) => (
                    <LegendDot key={s} color={c} label={s.replace(/_/g, ' ')} />
                ))}
            </div>
        </div>
    );
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

    const { summary, trend, statusByMember, workloadByProject, timeByTaskType, activityFeed } = data;

    /* Derived totals for submitted this week card */
    const totalMembers = summary.complianceRate.submitted + summary.complianceRate.pending + summary.complianceRate.late;

    /* ── 6 API-driven stat cards ── */
    const apiCards = [
        {
            label: 'This Week Submitted',
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

            {/* ── Top row: Trend & Activity Feed ── */}
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
                </div>

                <div className="col-span-1">
                    <ReportSubmissionStatus statusByMember={statusByMember} />
                </div>
            </div>

            {/* ── Bottom row: 3 distinct charts ── */}
            <div className="grid grid-cols-3 gap-5">
                <div className="order-3">
                    <RecentActivityFeed activityFeed={activityFeed} />
                </div>

                {/* 2: Workload by Project (Donut Chart) */}
                <div className="order-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-4">
                        Workload by Project
                    </h3>
                    {!workloadByProject || workloadByProject.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">No data.</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                    <Pie
                                        data={workloadByProject}
                                        dataKey="taskCount"
                                        nameKey="project"
                                        cx="50%" cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        label={renderCustomizedLabel}
                                        labelLine={false}
                                    >
                                        {workloadByProject.map((_, i) => (
                                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val: any) => [`${val} tasks`, '']}
                                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] border-t border-slate-100 dark:border-slate-700/50 pt-3">
                                {workloadByProject.map((entry, i) => (
                                    <LegendDot key={i} color={DONUT_COLORS[i % DONUT_COLORS.length]} label={entry.project} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* 3: Time Spent by Task Type (Vertical Bar Chart) */}
                <div className="order-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-4">
                        Time Spent by Task Type
                    </h3>
                    {!timeByTaskType || timeByTaskType.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">No data.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={Math.max(220, timeByTaskType.length * 30)}>
                            <BarChart
                                data={timeByTaskType}
                                layout="vertical"
                                margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                                <YAxis
                                    type="category"
                                    dataKey="taskCategory"
                                    width={88}
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    formatter={(val: any) => [`${val}h`, 'Hours']}
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                />
                                <Bar dataKey="hours" fill="#10B981" radius={[0, 4, 4, 0]} barSize={18}>
                                    {timeByTaskType.map((_, i) => (
                                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}