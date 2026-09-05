'use client';
import Sidebar from '@/components/Sidebar';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
            {/* Sidebar — fixed left */}
            <Sidebar />

            {/* Main content — offset by sidebar width */}
            <div className="ml-60">
                {children}
            </div>
        </div>
    );
}
