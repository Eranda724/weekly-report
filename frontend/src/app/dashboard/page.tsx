'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute>
            <main className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
                    <button
                        onClick={logout}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Log Out
                    </button>
                </div>
                <p className="text-gray-600">Role: {user?.role}</p>
            </main>
        </ProtectedRoute>
    );
}