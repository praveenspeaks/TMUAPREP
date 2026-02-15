import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import Input from '../components/Input';
import { BookOpenCheck, Sigma, PencilLine, PlusCircle } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Question {
    id: number;
    text: string;
    options: string[];
    correctOptionIndex: number;
    markings?: string;
    createdAt: string;
}

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

const renderMathText = (value: string) => {
    if (!value) return '';

    const blocks: string[] = [];
    let processed = value.replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => {
        const token = `__MATH_BLOCK_${blocks.length}__`;
        try {
            blocks.push(
                katex.renderToString(expr.trim(), {
                    displayMode: true,
                    throwOnError: false,
                })
            );
        } catch {
            blocks.push(`<pre class="text-rose-600">${escapeHtml(expr)}</pre>`);
        }
        return token;
    });

    processed = processed.replace(/\$([^$\n]+)\$/g, (_, expr) => {
        const token = `__MATH_INLINE_${blocks.length}__`;
        try {
            blocks.push(
                katex.renderToString(expr.trim(), {
                    displayMode: false,
                    throwOnError: false,
                })
            );
        } catch {
            blocks.push(`<span class="text-rose-600">${escapeHtml(expr)}</span>`);
        }
        return token;
    });

    let safe = escapeHtml(processed).replace(/\n/g, '<br/>');
    blocks.forEach((block, idx) => {
        safe = safe
            .replace(`__MATH_BLOCK_${idx}__`, block)
            .replace(`__MATH_INLINE_${idx}__`, block);
    });

    return safe;
};

const emptyForm = {
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    markings: '',
};

const AdminQuestions = () => {
    const { token } = useAuthStore();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);

    const selectedQuestion = useMemo(
        () => questions.find((question) => question.id === selectedQuestionId) || null,
        [questions, selectedQuestionId]
    );

    const fetchQuestions = async () => {
        try {
            setError('');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/questions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to fetch questions');
            setQuestions(data);
        } catch (e: any) {
            setError(e.message || 'Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const selectQuestion = (question: Question) => {
        setSelectedQuestionId(question.id);
        setForm({
            text: question.text,
            options: [...question.options, '', '', '', ''].slice(0, 4),
            correctOptionIndex: question.correctOptionIndex,
            markings: question.markings || '',
        });
        setError('');
    };

    const clearSelection = () => {
        setSelectedQuestionId(null);
        setForm(emptyForm);
        setError('');
    };

    const handleOptionChange = (index: number, value: string) => {
        setForm((prev) => {
            const next = [...prev.options];
            next[index] = value;
            return { ...prev, options: next };
        });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                text: form.text,
                options: form.options,
                correctOptionIndex: Number(form.correctOptionIndex),
                markings: form.markings,
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to add question');

            clearSelection();
            await fetchQuestions();
        } catch (e: any) {
            setError(e.message || 'Create failed');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuestionId) return;

        try {
            const payload = {
                text: form.text,
                options: form.options,
                correctOptionIndex: Number(form.correctOptionIndex),
                markings: form.markings,
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL}/questions/${selectedQuestionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update question');

            await fetchQuestions();
        } catch (e: any) {
            setError(e.message || 'Update failed');
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 md:p-8 shadow-lg">
                <p className="text-xs uppercase tracking-wider text-slate-300 font-semibold">Question Bank</p>
                <h1 className="text-3xl md:text-4xl font-bold mt-1">Manage TMUA Questions</h1>
                <p className="text-slate-300 mt-2">Add new questions, review current bank, and update options/solutions with live LaTeX preview.</p>
            </section>

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <BookOpenCheck className="h-5 w-5 text-indigo-600" />
                            Current Question Bank
                        </h2>
                        <span className="text-sm text-slate-500">{questions.length} questions</span>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-6 text-slate-500">Loading questions...</div>
                        ) : (
                            <table className="w-full text-left min-w-[860px]">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm">
                                        <th className="p-4 font-semibold">Question</th>
                                        <th className="p-4 font-semibold">Options</th>
                                        <th className="p-4 font-semibold">Correct</th>
                                        <th className="p-4 font-semibold">Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {questions.map((question) => (
                                        <tr
                                            key={question.id}
                                            className={`border-t border-slate-100 cursor-pointer hover:bg-slate-50 ${selectedQuestionId === question.id ? 'bg-indigo-50/70' : ''}`}
                                            onClick={() => selectQuestion(question)}
                                        >
                                            <td className="p-4 text-slate-800 max-w-[420px] truncate" title={question.text}>{question.text}</td>
                                            <td className="p-4 text-slate-600">{question.options.length}</td>
                                            <td className="p-4 text-slate-600">{String.fromCharCode(65 + question.correctOptionIndex)}</td>
                                            <td className="p-4 text-slate-500 text-sm">{new Date(question.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            {selectedQuestion ? <PencilLine className="h-5 w-5 text-amber-600" /> : <PlusCircle className="h-5 w-5 text-emerald-600" />}
                            {selectedQuestion ? `Edit Question #${selectedQuestion.id}` : 'Add New Question'}
                        </h3>

                        <form className="mt-4 space-y-3" onSubmit={selectedQuestion ? handleUpdate : handleCreate}>
                            <textarea
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm min-h-[90px]"
                                placeholder="Question text (LaTeX supported with $...$ or $$...$$)"
                                value={form.text}
                                onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                                required
                            />

                            {form.options.map((option, index) => (
                                <Input
                                    key={index}
                                    placeholder={`Option ${String.fromCharCode(65 + index)} (LaTeX supported)`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    required
                                />
                            ))}

                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                value={form.correctOptionIndex}
                                onChange={(e) => setForm((prev) => ({ ...prev, correctOptionIndex: Number(e.target.value) }))}
                            >
                                {form.options.map((_, index) => (
                                    <option key={index} value={index}>Correct Option: {String.fromCharCode(65 + index)}</option>
                                ))}
                            </select>

                            <textarea
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm min-h-[90px]"
                                placeholder="Solution / explanation (LaTeX supported)"
                                value={form.markings}
                                onChange={(e) => setForm((prev) => ({ ...prev, markings: e.target.value }))}
                            />

                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">{selectedQuestion ? 'Update Question' : 'Create Question'}</Button>
                                <Button type="button" variant="outline" className="flex-1" onClick={clearSelection}>Clear</Button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Sigma className="h-5 w-5 text-violet-600" />
                            Live LaTeX Preview
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Use inline $a^2+b^2=c^2$ or block $$\\int_0^1 x^2 dx$$ notation.</p>

                        <div className="mt-4 space-y-3 text-sm">
                            <div className="rounded-lg border border-slate-200 p-3">
                                <p className="text-xs font-semibold text-slate-500 mb-2">Question</p>
                                <div dangerouslySetInnerHTML={{ __html: renderMathText(form.text || '-') }} />
                            </div>
                            <div className="rounded-lg border border-slate-200 p-3">
                                <p className="text-xs font-semibold text-slate-500 mb-2">Options</p>
                                <div className="space-y-1.5">
                                    {form.options.map((option, index) => (
                                        <div key={index} className={`rounded px-2 py-1 ${index === form.correctOptionIndex ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}`}>
                                            <span className="font-semibold mr-1">{String.fromCharCode(65 + index)}.</span>
                                            <span dangerouslySetInnerHTML={{ __html: renderMathText(option || '-') }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-lg border border-slate-200 p-3">
                                <p className="text-xs font-semibold text-slate-500 mb-2">Solution</p>
                                <div dangerouslySetInnerHTML={{ __html: renderMathText(form.markings || '-') }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminQuestions;
