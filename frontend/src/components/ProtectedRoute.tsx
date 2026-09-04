'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Props = {
    children: React.ReactNode;
    allowedRoles?: ('TEAM_MEMBER' | 'MANAGER' | 'ADMIN')[];
};

function homeRouteFor(role: string) {
    return role === 'TEAM_MEMBER' ? '/reports' : '/dashboard';
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace('/login');
            return;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            router.replace(homeRouteFor(user.role));
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
        return null;
    }

    return <>{children}</>;
}