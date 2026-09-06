'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';

const NAV_ITEMS = [
    { label: 'Overview', href: '/dashboard', icon: '/assets/report.png' },
    { label: 'Reports', href: '/dashboard/reports', icon: '/assets/add.png' },
    { label: 'Profile', href: '/profile', icon: '/assets/user.png' },
];

function ManagerSidebarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    function isActive(href: string, tab?: string) {
        if (href === '/admin/users') {
            const currentTab = searchParams.get('tab') || 'users';
            const expectedTab = tab || 'users';
            return pathname === '/admin/users' && currentTab === expectedTab;
        }
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    }

    const initial = user?.name?.[0]?.toUpperCase() ?? '?';

    return (
        <aside className="fixed top-0 left-0 h-screen w-60 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-20 shadow-sm">

            {/* Brand */}
            <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 overflow-hidden bg-white dark:bg-slate-800">
                    <img src="/assets/logo.jpg" alt="Reeweek Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">
                    Reeweek
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="flex flex-col gap-1 list-none m-0 p-0">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all duration-150
                                        ${active
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <span className={`flex items-center justify-center w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`}>
                                        <img src={item.icon} alt={item.label} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 dark:invert" />
                                    </span>
                                    {item.label}
                                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Admin link */}
                {user?.role === 'ADMIN' && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Admin Control
                        </div>
                        <ul className="flex flex-col gap-1 list-none m-0 p-0">
                            <li>
                                <Link
                                    href="/admin/users"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all duration-150 ${isActive('/admin/users', 'users')
                                        ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-800/50 shadow-sm'
                                        : 'text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                                        }`}
                                >
                                    <span className="flex items-center justify-center w-5 h-5"><img src="/assets/add-user.png" alt="Invite Members" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 dark:invert" /></span> Invite Members
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin/users?tab=teams"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all duration-150 ${isActive('/admin/users', 'teams')
                                        ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-800/50 shadow-sm'
                                        : 'text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                                        }`}
                                >
                                    <span className="flex items-center justify-center w-5 h-5"><img src="/assets/project.png" alt="Projects" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 dark:invert" /></span> Projects
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-transparent border-none"
                >
                    <span className="text-base">{theme === 'light' ? '🌙' : '☀️'}</span>
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{initial}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.name}</p>
                        <p className="text-[0.62rem] text-slate-400 dark:text-slate-500 capitalize truncate">
                            {user?.role?.toLowerCase().replace('_', ' ')}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        title="Log out"
                        className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 bg-transparent border-none cursor-pointer text-base leading-none transition-colors shrink-0"
                    >
                        ⏻
                    </button>
                </div>
            </div>
        </aside>
    );
}
export default function ManagerSidebar() {
    return (
        <Suspense
            fallback={
                <aside className="fixed top-0 left-0 h-screen w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-20" />
            }
        >
            <ManagerSidebarContent />
        </Suspense>
    );
}
