'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';

type NavItem = {
    label: string;
    href: string;
    icon: string;
};

const NAV_ITEMS: NavItem[] = [
    { label: 'My Reports', href: '/reports', icon: "/assets/report.png" },
    { label: 'New Report', href: '/reports/new', icon: '/assets/add.png' },
    { label: 'Profile', href: '/profile', icon: '/assets/user.png' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    function isActive(href: string) {
        if (href === '/reports') return pathname === '/reports';
        return pathname.startsWith(href);
    }

    return (
        <aside className="fixed top-0 left-0 h-screen w-60 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-20 shadow-sm">

            {/* ── Brand ── */}
            <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-white text-sm font-bold">W</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">
                    Weekly Report<br />
                    <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Generator</span>
                </span>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="flex flex-col gap-1 list-none m-0 p-0">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all duration-150
                                        ${active
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                                        }
                                    `}
                                >
                                    <span className={`flex items-center justify-center transition-transform duration-150 ${active ? 'scale-110' : ''}`}>
                                        {item.icon.startsWith('/') ? (
                                            <img src={item.icon} alt={item.label} className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100 dark:invert" />
                                        ) : (
                                            <span className="text-base leading-none">{item.icon}</span>
                                        )}
                                    </span>
                                    {item.label}
                                    {active && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* ── Bottom: theme + user ── */}
            <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-transparent border-none"
                >
                    <span className="flex items-center justify-center">
                        <img
                            src={theme === 'light' ? '/assets/moon.png' : '/assets/sun.png'}
                            alt="Theme toggle"
                            className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                    </span>
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>

                {/* User info + logout */}
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                            {user?.name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.name}</p>
                        <p className="text-[0.62rem] text-slate-400 dark:text-slate-500 truncate capitalize">
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
