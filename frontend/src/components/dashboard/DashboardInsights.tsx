'use client';
import { useEffect, useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { dashboardApi, DashboardMetrics } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
    DRAFT: '#9CA3AF',
    SUBMITTED: '#3B82F6',
    NEEDS_CORRECTION: '#F59E0B',
    APPROVED: '#10B981',
    NOT_STARTED: '#EF4444',
};

const PROJECT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

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

    if (loading) return <p className="text-gray-500">Loading insights...</p>;
    if (error) return <p className="text-red-600">{error}</p>;
    if (!data) return null;

    const { summary, trend, statusByMember, workloadByProject, timeByTaskType, activityFeed } = data;

    return (
        <div className="space-y-8 mt-10">
            <h2 className="text-xl font-semibold">Insights</h2>

            {/* Summary metrics */}
            <div className="grid grid-cols-4 gap-4">
                <div className="border rounded p-4">
                    <p className="text-sm text-gray-500">Submitted This Week</p>
                    <p className="text-2xl font-semibold">{summary.totalSubmittedThisWeek}</p>
                </div>
                <div className="border rounded p-4">
                    <p className="text-sm text-gray-500">Compliance</p>
                    <p className="text-sm">
                        <span className="text-blue-600 font-medium">{summary.complianceRate.submitted} submitted</span>
                        {' · '}
                        <span className="text-gray-500">{summary.complianceRate.pending} pending</span>
                        {' · '}
                        <span className="text-red-600">{summary.complianceRate.late} late</span>
                    </p>
                </div>
                <div className="border rounded p-4">
                    <p className="text-sm text-gray-500">Needs Correction</p>
                    <p className="text-2xl font-semibold text-yellow-600">{summary.needsCorrectionCount}</p>
                </div>
                <div className="border rounded p-4">
                    <p className="text-sm text-gray-500">Open Blockers</p>
                    <p className="text-2xl font-semibold text-red-600">{summary.openBlockersCount}</p>
                </div>
            </div>

            {/* Tasks completed trend */}
            <div className="border rounded p-4">
                <p className="font-medium mb-3">Tasks Completed — Last 8 Weeks</p>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="weekStartDate" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="completedTasks" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Status by member */}
                <div className="border rounded p-4">
                    <p className="font-medium mb-3">Status by Team Member</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={statusByMember} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey={() => 1} fill="#3B82F6">
                                {statusByMember.map((entry, i) => (
                                    <Cell key={i} fill={STATUS_COLORS[entry.status] || '#9CA3AF'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                        {Object.entries(STATUS_COLORS).map(([status, color]) => (
                            <span key={status} className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                                {status.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Workload by project */}
                <div className="border rounded p-4">
                    <p className="font-medium mb-3">Workload by Project</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={workloadByProject}
                                dataKey="taskCount"
                                nameKey="project"
                                cx="50%" cy="50%" outerRadius={90}
                                label={(entry: any) => entry.project}
                            >
                                {workloadByProject.map((_, i) => (
                                    <Cell key={i} fill={PROJECT_COLORS[i % PROJECT_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Time by task type */}
            <div className="border rounded p-4">
                <p className="font-medium mb-3">Time Spent by Task Type</p>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={timeByTaskType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="taskCategory" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="hours" fill="#10B981" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Activity feed */}
            <div className="border rounded p-4">
                <p className="font-medium mb-3">Recent Activity</p>
                {activityFeed.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent activity.</p>
                ) : (
                    <ul className="space-y-2">
                        {activityFeed.map((item, i) => (
                            <li key={i} className="text-sm flex justify-between border-b last:border-0 pb-2">
                                <span>{item.text}</span>
                                <span className="text-gray-400">{new Date(item.timestamp).toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}