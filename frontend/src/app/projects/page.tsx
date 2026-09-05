'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { projectsApi, Project } from '@/lib/api';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [error, setError] = useState('');

    async function loadProjects() {
        setLoading(true);
        try {
            const data = await projectsApi.list();
            setProjects(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProjects();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!newName.trim()) return;
        try {
            await projectsApi.create(newName.trim());
            setNewName('');
            loadProjects();
        } catch (err: any) {
            setError(err.message);
        }
    }

    function startEdit(project: Project) {
        setEditingId(project.id);
        setEditingName(project.name);
    }

    async function handleUpdate(id: string) {
        setError('');
        if (!editingName.trim()) return;
        try {
            await projectsApi.update(id, editingName.trim());
            setEditingId(null);
            loadProjects();
        } catch (err: any) {
            setError(err.message);
        }
    }

    async function handleDelete(id: string) {
        setError('');
        if (!confirm('Delete this project? Existing reports referencing it will keep their data.')) return;
        try {
            await projectsApi.remove(id);
            loadProjects();
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            {/* ── Top bar ── */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm px-6 h-16 flex items-center justify-between">
                <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase whitespace-nowrap">
                    Project Management
                </h1>
            </div>

            <div className="px-6 py-6 space-y-6">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* ── Add Project Card ── */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl shrink-0 shadow-sm text-white">
                        📁
                    </div>
                    <div className="flex-1 w-full">
                        <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-1">Add New Project</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Create a new category for team members to log their work against.</p>
                        <form onSubmit={handleCreate} className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Enter project name..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="flex-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow"
                            />
                            <button 
                                type="submit" 
                                disabled={!newName.trim()}
                                className="text-sm bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            >
                                Add Project
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── Projects List ── */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Active Projects</h2>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{projects.length} result{projects.length !== 1 ? 's' : ''}</span>
                    </div>
                    
                    {loading && (
                        <div className="px-6 py-8 space-y-3">
                            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
                        </div>
                    )}
                    
                    {!loading && projects.length === 0 && (
                        <div className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                            No projects found. Add one above.
                        </div>
                    )}

                    {!loading && (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
                            {projects.map((project) => (
                                <li key={project.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">📁</span>
                                        </div>
                                        {editingId === project.id ? (
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="flex-1 text-sm border border-slate-200 dark:border-slate-600 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                                                {project.name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4 shrink-0">
                                        {editingId === project.id ? (
                                            <>
                                                <button 
                                                    onClick={() => handleUpdate(project.id)} 
                                                    className="text-xs bg-emerald-500 text-white font-semibold px-3 py-1 rounded-lg hover:bg-emerald-600 transition-colors"
                                                >
                                                    Save
                                                </button>
                                                <button 
                                                    onClick={() => setEditingId(null)} 
                                                    className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 font-semibold px-3 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => startEdit(project)} 
                                                    className="text-xs text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-semibold px-3 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(project.id)} 
                                                    className="text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}