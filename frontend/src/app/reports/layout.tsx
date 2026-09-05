'use client';
import Sidebar from '@/components/Sidebar';
import ManagerSidebar from '@/components/ManagerSidebar';
import { useAuth } from '@/context/AuthContext';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
            {/* Sidebar — fixed left */}
            {user?.role === 'MANAGER' || user?.role === 'ADMIN' ? <ManagerSidebar /> : <Sidebar />}

            {/* Main content — offset by sidebar width */}
            <div className="ml-60">
                {children}
            </div>
        </div>
    );
}
