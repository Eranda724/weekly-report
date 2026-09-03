'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { projectsApi, reportsApi } from '@/lib/api';
import { Project } from '@/lib/api';
import { ReportFormData } from '@/types/report';
import TaskTable from '@/components/reports/TaskTable';
import HighlightsSection from '@/components/reports/HighlightsSection';
import HoursBreakdownSection from '@/components/reports/HoursBreakdownSection';

const emptyForm: ReportFormData = {
  projectId: '',
  weekStartDate: '',
  tasksNextWeek: '',
  notesLinks: '',
  tasks: [],
  highlights: [],
  hoursBreakdown: [],
};

export default function NewReportPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ReportFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    projectsApi.list().then(setProjects).catch((err) => setError(err.message));
  }, []);

  function updateField<K extends keyof ReportFormData>(key: K, value: ReportFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveDraft(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.projectId || !form.weekStartDate) {
      setError('Project and week are required.');
      return;
    }

    setSaving(true);
    try {
      const report = await reportsApi.create(form);
      router.push(`/reports/${report.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
      <main className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-6">New Weekly Report</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSaveDraft} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Week Starting</label>
            <input
              type="date"
              value={form.weekStartDate}
              onChange={(e) => updateField('weekStartDate', e.target.value)}
              className="w-full border rounded px-3 py-2 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Project / Category</label>
            <select
              value={form.projectId}
              onChange={(e) => updateField('projectId', e.target.value)}
              className="w-full border rounded px-3 py-2 text-black"
              required
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <TaskTable tasks={form.tasks} onChange={(tasks) => updateField('tasks', tasks)} />

          <HighlightsSection
            highlights={form.highlights}
            onChange={(highlights) => updateField('highlights', highlights)}
          />

          <HoursBreakdownSection
            entries={form.hoursBreakdown}
            onChange={(hoursBreakdown) => updateField('hoursBreakdown', hoursBreakdown)}
          />

          <div>
            <label className="block text-sm font-medium mb-1">Tasks Planned for Next Week</label>
            <textarea
              value={form.tasksNextWeek}
              onChange={(e) => updateField('tasksNextWeek', e.target.value)}
              className="w-full border rounded px-3 py-2 text-black"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes / Links (optional)</label>
            <textarea
              value={form.notesLinks}
              onChange={(e) => updateField('notesLinks', e.target.value)}
              className="w-full border rounded px-3 py-2 text-black"
              rows={2}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
        </form>
      </main>
    </ProtectedRoute>
  );
}