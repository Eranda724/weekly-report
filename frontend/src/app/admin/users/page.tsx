'use client';
import { Suspense } from 'react';
import UserManagementContent from './_content';

export default function UserManagementPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
            </div>
        }>
            <UserManagementContent />
        </Suspense>
    );
}
