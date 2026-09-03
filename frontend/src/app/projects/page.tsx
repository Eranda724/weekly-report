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
            <main className="max-w-2xl mx-auto p-8">
                <h1 className="text-2xl font-semibold mb-6">Project / Category Management</h1>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <form onSubmit={handleCreate} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="New project name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 border rounded px-3 py-2 text-black"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Add
                    </button>
                </form>

                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : (
                    <ul className="divide-y border rounded">
                        {projects.map((project) => (
                            <li key={project.id} className="flex items-center justify-between p-3">
                                {editingId === project.id ? (
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="flex-1 border rounded px-2 py-1 mr-2 text-black"
                                    />
                                ) : (
                                    <span>{project.name}</span>
                                )}

                                <div className="flex gap-2">
                                    {editingId === project.id ? (
                                        <>
                                            <button onClick={() => handleUpdate(project.id)} className="text-green-600 text-sm">
                                                Save
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-500 text-sm">
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEdit(project)} className="text-blue-600 text-sm">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(project.id)} className="text-red-600 text-sm">
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                        {projects.length === 0 && (
                            <li className="p-3 text-gray-500">No projects yet — add one above.</li>
                        )}
                    </ul>
                )}
            </main>
        </ProtectedRoute>
    );
}