'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { usersAdminApi, AdminUser } from '@/lib/api';

const roleColors: Record<string, string> = {
    TEAM_MEMBER: 'bg-gray-200 text-gray-800',
    MANAGER: 'bg-blue-100 text-blue-800',
    ADMIN: 'bg-purple-100 text-purple-800',
};

export default function UserManagementPage() {
    const { user, logout } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'TEAM_MEMBER' });
    const [creating, setCreating] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try {
            const res = await usersAdminApi.listAll();
            setUsers(res);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        setError('');
        try {
            await usersAdminApi.create(form);
            setForm({ name: '', email: '', password: '', role: 'TEAM_MEMBER' });
            setShowCreate(false);
            await load();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    }

    async function handleRoleChange(id: string, role: string) {
        setBusyId(id);
        try {
            await usersAdminApi.updateRole(id, role);
            await load();
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
            await load();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <main className="max-w-4xl mx-auto p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">User Management</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{user?.name} ({user?.role})</span>
                        <button onClick={logout} className="text-sm text-red-600 hover:underline">Log Out</button>
                    </div>
                </div>

                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setShowCreate((s) => !s)}
                        className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {showCreate ? 'Cancel' : '+ Invite Team Member'}
                    </button>
                </div>

                {showCreate && (
                    <form onSubmit={handleCreate} className="border rounded p-4 mb-6 grid grid-cols-2 gap-3">
                        <input
                            required placeholder="Name" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="border rounded px-3 py-2 text-black text-sm"
                        />
                        <input
                            required type="email" placeholder="Email" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="border rounded px-3 py-2 text-black text-sm"
                        />
                        <input
                            required type="password" placeholder="Temporary password" value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="border rounded px-3 py-2 text-black text-sm"
                        />
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="border rounded px-3 py-2 text-black text-sm"
                        >
                            <option value="TEAM_MEMBER">Team Member</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <button
                            type="submit" disabled={creating}
                            className="col-span-2 bg-green-600 text-white text-sm px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create User'}
                        </button>
                    </form>
                )}

                {error && <p className="text-red-600 mb-4">{error}</p>}

                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : (
                    <div className="border rounded divide-y">
                        {users.map((u) => (
                            <div key={u.id} className="flex justify-between items-center p-4">
                                <div>
                                    <p className="font-medium">
                                        {u.name} {!u.isActive && <span className="text-xs text-red-500">(deactivated)</span>}
                                    </p>
                                    <p className="text-sm text-gray-500">{u.email}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={u.role}
                                        disabled={busyId === u.id || u.id === user?.id}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${roleColors[u.role]}`}
                                    >
                                        <option value="TEAM_MEMBER">Team Member</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                    <button
                                        onClick={() => handleToggleActive(u)}
                                        disabled={busyId === u.id || u.id === user?.id}
                                        className={`text-sm px-3 py-1.5 rounded disabled:opacity-40 ${u.isActive
                                                ? 'text-red-600 border border-red-300 hover:bg-red-50'
                                                : 'text-green-600 border border-green-300 hover:bg-green-50'
                                            }`}
                                    >
                                        {u.isActive ? 'Deactivate' : 'Reactivate'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </ProtectedRoute>
    );
}