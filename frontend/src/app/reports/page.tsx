'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { reportsApi } from '@/lib/api';
import { Report } from '@/types/report';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-200 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  NEEDS_CORRECTION: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
};

export default function ReportHistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsApi
      .listMine()
      .then((res) => setReports(res.reports))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
      <main className="max-w-3xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Report History</h1>
          <Link
            href="/reports/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            + New Report
          </Link>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-500">No reports yet. Create your first one above.</p>
        ) : (
          <div className="divide-y border rounded">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="flex justify-between items-center p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">
                    Week of {new Date(report.weekStartDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">{report.project?.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                  {report.status.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
