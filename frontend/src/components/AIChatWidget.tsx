'use client';
import { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/lib/api';

type Message = { role: 'user' | 'assistant'; text: string };

export default function AIChatWidget({ weekStartDate }: { weekStartDate?: string }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading, summaryLoading]);

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
                className="fixed bottom-6 right-6 z-50 bg-violet-600 hover:bg-violet-500 text-white rounded-full px-5 py-2.5 shadow-lg shadow-violet-900/30 text-sm font-semibold transition-all flex items-center gap-2 border border-violet-500 cursor-pointer"
            >
                <img src="/assets/robot.png" alt="AI" className="w-8 h-8" />
                Ask AI
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[520px] bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-[#0f172a]/60">
                <div className="flex items-center gap-2.5">
                    <img src="/assets/robot.png" alt="AI Avatar" className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-500/40 shadow-sm" />
                    <div>
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">Team AI Assistant</p>
                        <p className="text-[0.65rem] text-slate-400 dark:text-slate-500 leading-none">Powered by AI</p>
                    </div>
                </div>
                <button
                    onClick={() => setOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-none cursor-pointer text-lg leading-none transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-4">
                        <img src="/assets/robot.png" alt="AI" className="w-16 h-16 rounded-full object-cover ring-4 ring-violet-500/20 shadow-lg" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Ask about team activity<br />or generate a weekly summary.
                        </p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {m.role === 'assistant' && (
                            <img src="/assets/robot.png" alt="AI" className="w-6 h-6 rounded-full object-cover shrink-0 mb-0.5 ring-1 ring-violet-400/30" />
                        )}
                        <div
                            className={`text-sm px-3.5 py-2.5 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed ${m.role === 'user'
                                    ? 'bg-violet-600 text-white rounded-br-sm shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                                }`}
                        >
                            {m.text}
                        </div>
                    </div>
                ))}
                {(loading || summaryLoading) && (
                    <div className="text-sm px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 max-w-[85%] flex items-center gap-2">
                        <span className="inline-flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:300ms]" />
                        </span>
                        Thinking…
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-[#0f172a]/40 space-y-2">
                <button
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                    className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl px-3 py-2 disabled:opacity-50 transition-colors font-medium cursor-pointer"
                >
                    ✨ Generate Weekly Team Summary
                </button>
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question…"
                        className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors cursor-pointer border-none"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

