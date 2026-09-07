'use client';

import { FormEvent, useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ManagerSidebar from '@/components/ManagerSidebar';
import { categoriesApi, Category } from '@/lib/api';

export default function CategoryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    async function loadCategories() {
        setLoading(true);
        try {
            setCategories(await categoriesApi.list());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load categories');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    async function create(e: FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        setBusy(true);
        setError('');
        try {
            await categoriesApi.create(name);
            setName('');
            await loadCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to create category');
        } finally {
            setBusy(false);
        }
    }

    async function update(id: string) {
        if (!editingName.trim()) return;
        setBusy(true);
        try {
            await categoriesApi.update(id, editingName);
            setEditingId(null);
            await loadCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to update category');
        } finally {
            setBusy(false);
        }
    }

    async function remove(id: string) {
        if (!confirm('Delete this category?')) return;
        setBusy(true);
        try {
            await categoriesApi.remove(id);
            await loadCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to delete category');
        } finally {
            setBusy(false);
        }
    }

    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
                <ManagerSidebar />
                <main className="ml-60 flex-1 p-8">
                    <div className="max-w-3xl">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Category Management</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage categories available on weekly reports.</p>
                        {error && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <form onSubmit={create} className="flex gap-3">
                                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" required className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                                <button type="submit" disabled={busy} className="rounded-lg border-none bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Add Category</button>
                            </form>
                            <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? <p className="py-4 text-sm text-slate-500">Loading...</p> : categories.length === 0 ? <p className="py-4 text-sm text-slate-500">No categories yet.</p> : categories.map((category) => (
                                    <div key={category.id} className="flex items-center gap-3 py-4">
                                        {editingId === category.id ? <input value={editingName} onChange={(e) => setEditingName(e.target.value)} autoFocus className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /> : <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">{category.name}</span>}
                                        {editingId === category.id ? <><button onClick={() => update(category.id)} disabled={busy} className="border-none bg-transparent text-sm font-medium text-indigo-600">Save</button><button onClick={() => setEditingId(null)} className="border-none bg-transparent text-sm text-slate-500">Cancel</button></> : <><button onClick={() => { setEditingId(category.id); setEditingName(category.name); }} className="border-none bg-transparent text-sm font-medium text-indigo-600">Edit</button><button onClick={() => remove(category.id)} disabled={busy} className="border-none bg-transparent text-sm font-medium text-red-600">Delete</button></>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}