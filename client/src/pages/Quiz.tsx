
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import { Timer, CircleCheckBig, CircleX, PlayCircle } from 'lucide-react';

interface Question {
    id: number;
    text: string;
    options: string[];
}

const Quiz = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean, correctAnswer: number | null } | null>(null);

    useEffect(() => {
        startNewSession();
    }, []);

    const startNewSession = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/sessions/start`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const session = await res.json();
                setSessionId(session.id);
                fetchNextQuestion();
            } else {
                alert('Failed to start session');
                navigate('/dashboard');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchNextQuestion = async () => {
        setLoading(true);
        setFeedback(null);
        setSelectedOption(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/questions/random`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const question = await res.json();
                setCurrentQuestion(question);
            } else {
                // assume no more questions or error
                alert('No questions available or error fetching question');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedOption === null || !sessionId || !currentQuestion) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/sessions/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId,
                    questionId: currentQuestion.id,
                    selectedOption
                })
            });

            const result = await res.json();
            setFeedback(result); // { isCorrect: boolean, correctAnswer: number | null }

        } catch (e) {
            console.error(e);
        }
    };

    const handleNext = () => {
        fetchNextQuestion();
    };

    const handleEndSession = async () => {
        if (!sessionId) return;
        await fetch(`${import.meta.env.VITE_API_URL}/sessions/end`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId })
        });
        navigate('/dashboard');
    };

    if (loading && !currentQuestion) {
        return (
            <div className="min-h-[70vh] grid place-items-center">
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
                    <div className="mx-auto mb-4 h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-700 font-medium">Preparing your next question...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 shadow-lg">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-slate-300 font-semibold">Practice Session</p>
                        <h2 className="text-2xl md:text-3xl font-bold mt-1">TMUA Quiz Mode</h2>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm">
                        <Timer className="h-4 w-4" />
                        Session #{sessionId ?? '-'}
                    </div>
                </div>
            </section>

            <section className="w-full max-w-3xl bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="inline-flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full font-medium">
                        <PlayCircle className="h-4 w-4" />
                        Live Question
                    </div>
                    <Button variant="outline" size="sm" onClick={handleEndSession}>End Session</Button>
                </div>

                {currentQuestion && (
                    <div>
                        <p className="text-lg md:text-xl font-semibold text-slate-900 mb-6 leading-relaxed">{currentQuestion.text}</p>

                        <div className="space-y-3 mb-6">
                            {currentQuestion.options.map((opt, idx) => {
                                let contentClass = "p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition border-slate-200";
                                if (selectedOption === idx) contentClass = "p-4 border-2 border-indigo-500 rounded-xl bg-indigo-50";

                                if (feedback) {
                                    if (feedback.isCorrect && idx === selectedOption) contentClass = "p-4 border-2 border-emerald-500 bg-emerald-50 rounded-xl";
                                    else if (!feedback.isCorrect && idx === selectedOption) contentClass = "p-4 border-2 border-rose-500 bg-rose-50 rounded-xl";
                                    else if (!feedback.isCorrect && idx === feedback.correctAnswer) contentClass = "p-4 border-2 border-emerald-500 bg-emerald-50 rounded-xl";
                                }

                                return (
                                    <div
                                        key={idx}
                                        className={contentClass}
                                        onClick={() => !feedback && setSelectedOption(idx)}
                                    >
                                        <span className="font-bold mr-2 text-slate-700">{String.fromCharCode(65 + idx)}.</span>
                                        <span className="text-slate-800">{opt}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {!feedback ? (
                            <Button
                                className="w-full"
                                disabled={selectedOption === null}
                                onClick={handleSubmit}
                            >
                                Submit Answer
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl text-center font-semibold flex items-center justify-center gap-2 ${feedback.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                    {feedback.isCorrect ? <CircleCheckBig className="h-5 w-5" /> : <CircleX className="h-5 w-5" />}
                                    {feedback.isCorrect ? 'Correct answer' : 'Incorrect answer'}
                                </div>
                                <Button className="w-full" onClick={handleNext}>Next Question</Button>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Quiz;
