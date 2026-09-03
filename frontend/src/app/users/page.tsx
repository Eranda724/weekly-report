'use client';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UsersPage() {
    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            <main className="p-8">
                <h1 className="text-2xl font-semibold">User Management (Manager/Admin only)</h1>
            </main>
        </ProtectedRoute>
    );
}