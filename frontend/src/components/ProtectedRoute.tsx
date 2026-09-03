'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Props = {
    children: React.ReactNode;
    allowedRoles?: ('TEAM_MEMBER' | 'MANAGER' | 'ADMIN')[];
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return; // wait until we've checked localStorage

        if (!user) {
            router.replace('/login');
            return;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            router.replace('/dashboard'); // logged in, but wrong role
        }
    }, [user, loading, allowedRoles, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        return null; // brief flash before redirect completes
    }

    return <>{children}</>;
}