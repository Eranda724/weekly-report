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
            <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
                <ManagerSidebar />
                <div className="flex-1 ml-60 flex flex-col overflow-hidden">
                    <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm px-6 h-16 flex items-center justify-between gap-4 shrink-0">
                        <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase whitespace-nowrap">
                            Categories
                        </h1>
                    </div>
                    <main className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
                        {error && (
                            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg p-4 text-sm flex items-start">
                                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {error}
                            </div>
                        )}
                        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                    <form onSubmit={create} className="flex gap-3 max-w-xl">
                                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" required className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        <button type="submit" disabled={busy} className="rounded-lg border-none bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 cursor-pointer hover:bg-indigo-700 transition-colors">Add Category</button>
                                    </form>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? <p className="p-6 text-sm text-slate-500">Loading...</p> : categories.length === 0 ? <p className="p-6 text-sm text-slate-500">No categories yet.</p> : categories.map((category) => (
                                        <div key={category.id} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            {editingId === category.id ? (
                                                <div className="flex items-center gap-3 flex-1 max-w-xl">
                                                    <input value={editingName} onChange={(e) => setEditingName(e.target.value)} autoFocus className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                                    <button onClick={() => update(category.id)} disabled={busy} className="bg-transparent border-none text-sm font-medium text-indigo-600 cursor-pointer hover:text-indigo-700">Save</button>
                                                    <button onClick={() => setEditingId(null)} className="bg-transparent border-none text-sm text-slate-500 cursor-pointer hover:text-slate-700">Cancel</button>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{category.name}</span>
                                            )}
                                            
                                            {editingId !== category.id && (
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => { setEditingId(category.id); setEditingName(category.name); }} className="bg-transparent border-none text-sm font-medium text-indigo-600 cursor-pointer hover:text-indigo-700">Edit</button>
                                                    <button onClick={() => remove(category.id)} disabled={busy} className="bg-transparent border-none text-sm font-medium text-red-600 cursor-pointer hover:text-red-700 disabled:opacity-50">Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}