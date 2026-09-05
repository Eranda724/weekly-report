'use client';
import ManagerSidebar from '@/components/ManagerSidebar';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 flex">
            <ManagerSidebar />
            <div className="ml-60 flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
