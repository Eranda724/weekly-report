'use client';
import { useEffect, useState, FormEvent } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { usersAdminApi, usersApi, AdminUser, projectsApi, Project } from '@/lib/api';
import ManagerSidebar from '@/components/ManagerSidebar';
import { useSearchParams, useRouter } from 'next/navigation';

const roleColors: Record<string, string> = {
    TEAM_MEMBER: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    MANAGER: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
    ADMIN: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800',
};

const roleLabels: Record<string, string> = {
    TEAM_MEMBER: 'Team Member',
    MANAGER: 'Manager',
    ADMIN: 'Admin',
};

export default function UserManagementContent() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // Data states
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);

    // UI States
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') === 'teams' ? 'teams' : (user?.role === 'MANAGER' ? 'teams' : 'users');

    const setActiveTab = (tab: 'users' | 'teams') => {
        router.push(`/admin/users${tab === 'teams' ? '?tab=teams' : ''}`);
    };
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);

    // Form States
    const [inviteForm, setInviteForm] = useState({ name: '', email: '', password: '', role: 'TEAM_MEMBER' });
    const [createdPassword, setCreatedPassword] = useState<string | null>(null);
    const [isInviting, setIsInviting] = useState(false);

    const [teamForm, setTeamForm] = useState({ name: '' });
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);

    // Team Member Assignment State
    const [selectedUsers, setSelectedUsers] = useState<Record<string, string>>({}); // projectId -> userId
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    async function loadData() {
        setLoading(true);
        try {
            const [usersData, projectsData] = await Promise.all([
                user?.role === 'ADMIN' ? usersAdminApi.listAll() : user?.role === 'MANAGER' ? usersApi.list() : Promise.resolve([]),
                projectsApi.list()
            ]);
            setUsers(usersData);
            setProjects(projectsData);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user?.role) loadData();
    }, [user?.role]);

    // -- User Actions --
    async function handleInviteSubmit(e: FormEvent) {
        e.preventDefault();
        setIsInviting(true);
        setError('');
        try {
            await usersAdminApi.create(inviteForm);
            setCreatedPassword(inviteForm.password); // Show it to the user
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsInviting(false);
        }
    }

    function closeInviteModal() {
        setShowInviteModal(false);
        setCreatedPassword(null);
        setInviteForm({ name: '', email: '', password: '', role: 'TEAM_MEMBER' });
    }

    async function handleRoleChange(id: string, role: string) {
        setBusyId(id);
        try {
            await usersAdminApi.updateRole(id, role);
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    async function handleToggleActive(u: AdminUser) {
        setBusyId(u.id);
        try {
            if (u.isActive) await usersAdminApi.deactivate(u.id);
            else await usersAdminApi.reactivate(u.id);
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    // -- Team Actions --
    async function handleCreateTeam(e: FormEvent) {
        e.preventDefault();
        setIsCreatingTeam(true);
        setError('');
        try {
            await projectsApi.create(teamForm.name);
            setShowTeamModal(false);
            setTeamForm({ name: '' });
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsCreatingTeam(false);
        }
    }

    async function handleAddMember(projectId: string) {
        const userId = selectedUsers[projectId];
        if (!userId) return;
        setBusyId(`add-${projectId}`);
        try {
            await projectsApi.addMember(projectId, userId);
            setSelectedUsers({ ...selectedUsers, [projectId]: '' });
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    async function handleRemoveMember(projectId: string, userId: string) {
        setBusyId(`rem-${projectId}-${userId}`);
        try {
            await projectsApi.removeMember(projectId, userId);
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    async function handleDeleteTeam(id: string) {
        if (!confirm('Delete this team?')) return;
        setBusyId(`del-${id}`);
        setError('');
        try {
            await projectsApi.remove(id);
            await loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    const initial = user?.name?.[0]?.toUpperCase() ?? '?';



    return (
        <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
                {/* Side Panel */}
                <ManagerSidebar />

                {/* Main Content */}
                <div className="flex-1 ml-60 flex flex-col overflow-hidden">
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm px-6 h-16 flex items-center justify-between gap-4 shrink-0">
                        <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase whitespace-nowrap">
                            Organization
                        </h1>
                    </div>

                    <main className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
                        {error && (
                            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg p-4 text-sm flex items-start">
                                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                                {/* USERS TAB */}
                                {activeTab === 'users' && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">All Users</h2>
                                            <button onClick={() => setShowInviteModal(true)} className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 border-none cursor-pointer">
                                                Invite Members
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                                                        <th className="px-6 py-4">Name & Email</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4">Role</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {users.map(u => (
                                                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="font-medium text-slate-900 dark:text-slate-100">{u.name}</div>
                                                                <div className="text-sm text-slate-500 dark:text-slate-400">{u.email}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="relative inline-block">
                                                                    <select
                                                                        value={u.role}
                                                                        disabled={busyId === u.id || u.id === user?.id}
                                                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                                        className={`text-xs font-medium rounded-full pl-3 pr-7 py-1 border outline-none appearance-none cursor-pointer ${roleColors[u.role]}`}
                                                                    >
                                                                        <option value="TEAM_MEMBER">Team Member</option>
                                                                        <option value="MANAGER">Manager</option>
                                                                        <option value="ADMIN">Admin</option>
                                                                    </select>
                                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-600 dark:text-slate-300">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    onClick={() => handleToggleActive(u)}
                                                                    disabled={busyId === u.id || u.id === user?.id}
                                                                    className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-40 bg-transparent border-none cursor-pointer ${u.isActive ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                                                >
                                                                    {u.isActive ? 'Deactivate' : 'Reactivate'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {users.length === 0 && (
                                                <div className="p-8 text-center text-slate-500 dark:text-slate-400">No users found.</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* TEAMS TAB */}
                                {activeTab === 'teams' && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-visible">
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Teams</h2>
                                            <button onClick={() => setShowTeamModal(true)} className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 border-none cursor-pointer">
                                                Create Team
                                            </button>
                                        </div>

                                        {projects.length > 0 ? (
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {projects.map(project => (
                                                <div key={project.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-gradient-to-r from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h3>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{project.projectMembers?.length || 0} members</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteTeam(project.id)}
                                                            disabled={busyId === `del-${project.id}`}
                                                            className="text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer p-1.5 -mr-1.5 -mt-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                            title="Delete Team"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                    <div className="p-6">
                                                        <div className="mb-4">
                                                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Members</h4>
                                                            <ul className="space-y-3">
                                                                {project.projectMembers?.map(member => (
                                                                    <li key={member.user.id} className="flex items-center justify-between group">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700">
                                                                                {member.user.name.charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{member.user.name}</p>
                                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabels[member.user.role]}</p>
                                                                            </div>
                                                                        </div>
                                                                        {!(user?.role === 'MANAGER' && member.user.role !== 'TEAM_MEMBER') && (
                                                                            <button
                                                                                onClick={() => handleRemoveMember(project.id, member.user.id)}
                                                                                disabled={busyId === `rem-${project.id}-${member.user.id}`}
                                                                                className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 bg-transparent border-none cursor-pointer"
                                                                                title="Remove from team"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                            </button>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                                {(!project.projectMembers || project.projectMembers.length === 0) && (
                                                                    <li className="text-sm text-slate-400 dark:text-slate-500 italic">No members in this team yet.</li>
                                                                )}
                                                            </ul>
                                                        </div>

                                                        {(() => {
                                                            const availableUsers = users.filter(u => u.isActive && u.role !== 'ADMIN' && !project.projectMembers?.find(m => m.user.id === u.id));
                                                            return (
                                                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                                                    <div className="relative flex-1">
                                                                        <div
                                                                            className={`w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none flex justify-between items-center ${availableUsers.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                                            onClick={() => {
                                                                                if (availableUsers.length > 0) {
                                                                                    setOpenDropdownId(openDropdownId === project.id ? null : project.id);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <span className="truncate">
                                                                                {(() => {
                                                                                    const selectedUser = users.find(u => u.id === selectedUsers[project.id]);
                                                                                    return selectedUser
                                                                                        ? `${selectedUser.name} (${selectedUser.email})`
                                                                                        : (availableUsers.length === 0 ? 'All users added' : 'Select user to add...');
                                                                                })()}
                                                                            </span>
                                                                            <div className="flex items-center flex-shrink-0">
                                                                                {(() => {
                                                                                    const selectedUser = users.find(u => u.id === selectedUsers[project.id]);
                                                                                    return selectedUser && (
                                                                                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mr-2">
                                                                                            {roleLabels[selectedUser.role] || selectedUser.role}
                                                                                        </span>
                                                                                    );
                                                                                })()}
                                                                                <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                                            </div>
                                                                        </div>

                                                                        {openDropdownId === project.id && availableUsers.length > 0 && (
                                                                            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
                                                                                {availableUsers.map(u => (
                                                                                    <div
                                                                                        key={u.id}
                                                                                        className="flex justify-between items-center px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm"
                                                                                        onClick={() => {
                                                                                            setSelectedUsers({ ...selectedUsers, [project.id]: u.id });
                                                                                            setOpenDropdownId(null);
                                                                                        }}
                                                                                    >
                                                                                        <span className="text-slate-700 dark:text-slate-300 truncate mr-2">{u.name} <span className="text-slate-400">({u.email})</span></span>
                                                                                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                                                            {roleLabels[u.role] || u.role}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleAddMember(project.id)}
                                                                        disabled={!selectedUsers[project.id] || busyId === `add-${project.id}` || availableUsers.length === 0}
                                                                        className={`font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer ${selectedUsers[project.id]
                                                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                                            }`}
                                                                    >
                                                                        Add
                                                                    </button>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center">
                                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                                                    <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No Teams Created</h3>
                                                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">Create a team to group your users and manage their projects and reports.</p>
                                                <button onClick={() => setShowTeamModal(true)} className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-all inline-flex items-center gap-2 border-none cursor-pointer">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                    Create First Team
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                    {showInviteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                                <button onClick={closeInviteModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Invite Team Member</h2>

                                {createdPassword ? (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-6 text-center animate-in slide-in-from-bottom-4">
                                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <h3 className="text-emerald-900 dark:text-emerald-300 font-semibold mb-2">User Created Successfully!</h3>
                                        <p className="text-sm text-emerald-700 dark:text-emerald-400/80 mb-4">Share these temporary credentials securely with the user.</p>
                                        <div className="bg-white dark:bg-slate-900 rounded border border-emerald-200 dark:border-emerald-800/50 p-3 flex items-center justify-between">
                                            <code className="text-emerald-900 dark:text-emerald-300 font-mono">{createdPassword}</code>
                                            <button onClick={() => navigator.clipboard.writeText(createdPassword)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm font-medium">Copy</button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleInviteSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                            <input required placeholder="Jane Doe" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                            <input required type="email" placeholder="jane@example.com" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temporary Password</label>
                                            <input required type="password" placeholder="••••••••" value={inviteForm.password} onChange={e => setInviteForm({ ...inviteForm, password: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                            <div className="relative">
                                                <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg pl-4 pr-10 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer">
                                                    <option value="TEAM_MEMBER">Team Member</option>
                                                    <option value="MANAGER">Manager</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <button type="submit" disabled={isInviting} className="w-full bg-indigo-600 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-50 mt-6 border-none">
                                            {isInviting ? 'Generating Invite...' : 'Create & Invite User'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                    {showTeamModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
                                <button onClick={() => setShowTeamModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Create New Team</h2>
                                <form onSubmit={handleCreateTeam} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Team Name</label>
                                        <input required placeholder="e.g. Engineering, Marketing" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                    </div>
                                    <button type="submit" disabled={isCreatingTeam} className="w-full bg-indigo-600 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-50 mt-6 border-none">
                                        {isCreatingTeam ? 'Creating...' : 'Create Team'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}