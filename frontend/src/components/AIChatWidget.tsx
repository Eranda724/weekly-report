'use client';
import { useState } from 'react';
import { aiApi } from '@/lib/api';

type Message = { role: 'user' | 'assistant'; text: string };

export default function AIChatWidget({ weekStartDate }: { weekStartDate?: string }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;
        const question = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', text: question }]);
        setLoading(true);
        try {
            const res = await aiApi.chat(question);
            setMessages((prev) => [...prev, { role: 'assistant', text: res.answer }]);
        } catch (err: any) {
            setMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerateSummary() {
        setSummaryLoading(true);
        try {
            const res = await aiApi.getSummary(weekStartDate);
            setMessages((prev) => [...prev, { role: 'assistant', text: res.summary }]);
        } catch (err: any) {
            setMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
        } finally {
            setSummaryLoading(false);
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full px-5 py-3 shadow-lg hover:bg-blue-700 text-sm font-medium"
            >
                💬 Ask AI
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white border rounded-lg shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-3 border-b">
                <p className="font-medium text-sm">Team AI Assistant</p>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                    <p className="text-sm text-gray-400">
                        Ask about team activity, or generate a weekly summary below.
                    </p>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`text-sm p-2 rounded max-w-[85%] whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
                            }`}
                    >
                        {m.text}
                    </div>
                ))}
                {(loading || summaryLoading) && (
                    <div className="text-sm p-2 rounded bg-gray-100 max-w-[85%] text-gray-500">
                        Thinking...
                    </div>
                )}
            </div>

            <div className="p-2 border-t">
                <button
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                    className="w-full mb-2 text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1.5 disabled:opacity-50"
                >
                    Generate Weekly Team Summary
                </button>
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 border rounded px-2 py-1.5 text-black text-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}