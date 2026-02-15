
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import { Star, ArrowRight, Crown, CalendarDays, Target, Sparkles } from 'lucide-react';

interface Plan {
    id: number;
    name: string;
    price: number;
    durationMonths: number;
}

interface Session {
    id: number;
    startTime: string;
    score: number;
}

const Dashboard = () => {
    const { user, token } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [history, setHistory] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [membershipStatus, setMembershipStatus] = useState<string>('INACTIVE');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch User details for membership status
                const userRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (userData.membership && userData.membership.status === 'ACTIVE') {
                        setMembershipStatus('ACTIVE');
                    }
                }

                // Fetch Plans
                const plansRes = await fetch(`${import.meta.env.VITE_API_URL}/memberships/plans`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (plansRes.ok) setPlans(await plansRes.json());

                // Fetch History
                const historyRes = await fetch(`${import.meta.env.VITE_API_URL}/sessions/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (historyRes.ok) setHistory(await historyRes.json());

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Check query params for payment success
        const params = new URLSearchParams(location.search);
        if (params.get('success')) {
            const verifyPayment = async () => {
                const sessionId = params.get('session_id');
                if (sessionId) {
                    await fetch(`${import.meta.env.VITE_API_URL}/memberships/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ session_id: sessionId })
                    });
                    window.location.href = '/dashboard';
                }
            }
            verifyPayment();
        }

    }, [token, navigate, location.search]);

    const handleBuy = async (planId: number) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/memberships/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ planId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Failed to start checkout');
            }
        } catch (error) {
            console.error('Checkout error:', error);
        }
    };

    const handleStartQuiz = () => {
        navigate('/quiz');
    };

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    const averageScore = history.length > 0
        ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)
        : 0;

    return (
        <div className="space-y-8">
            <section className="rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-700 text-white p-6 md:p-8 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                            <Star className="h-3.5 w-3.5 fill-white" />
                            STUDY COMMAND CENTER
                        </div>
                        <h1 className="mt-4 text-3xl md:text-4xl font-bold">Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
                        <p className="mt-2 text-indigo-100 max-w-2xl">Track your TMUA practice, continue your quiz sessions, and monitor progress from one dashboard.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleStartQuiz} className="bg-white text-indigo-700 hover:bg-indigo-50">Start Practice</Button>
                        {membershipStatus !== 'ACTIVE' && (
                            <Button variant="secondary" onClick={() => handleBuy(2)} className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                                Upgrade
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">Total Sessions</p>
                        <CalendarDays className="h-5 w-5 text-indigo-500" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{history.length}</p>
                    <Link to="/quiz" className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                        Continue Practice <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">Average Score</p>
                        <Target className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{averageScore}%</p>
                    <p className="mt-4 text-sm text-slate-500">Based on completed sessions.</p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">Membership</p>
                        <Crown className="h-5 w-5 text-amber-500" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{membershipStatus === 'ACTIVE' ? 'PRO' : 'FREE'}</p>
                    <p className="mt-4 text-sm text-slate-500">{membershipStatus === 'ACTIVE' ? 'Premium features enabled' : 'Upgrade for full access'}</p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">Available Plans</p>
                        <Sparkles className="h-5 w-5 text-violet-500" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{plans.length}</p>
                    <p className="mt-4 text-sm text-slate-500">Subscription options ready.</p>
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h2 className="text-xl font-semibold text-slate-900">Recent Sessions</h2>
                    </div>
                    <div className="p-4">
                        {history.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                                No session history yet. Start your first practice round.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {history.slice(0, 6).map((session, idx) => (
                                    <div key={session.id} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-slate-50">
                                        <div>
                                            <p className="font-medium text-slate-800">Session #{history.length - idx}</p>
                                            <p className="text-sm text-slate-500">{new Date(session.startTime).toLocaleString()}</p>
                                        </div>
                                        <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${session.score >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                            Score {session.score}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-slate-900">Membership Plans</h2>
                    <p className="mt-1 text-sm text-slate-500">Choose a plan to unlock premium prep.</p>
                    <div className="mt-5 space-y-3">
                        {plans.length === 0 ? (
                            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No plans available right now.</div>
                        ) : (
                            plans.map((plan) => (
                                <div key={plan.id} className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-900">{plan.name}</p>
                                            <p className="text-sm text-slate-500">{plan.durationMonths} month access</p>
                                        </div>
                                        <p className="font-bold text-slate-900">${plan.price}</p>
                                    </div>
                                    <Button
                                        onClick={() => handleBuy(plan.id)}
                                        className="w-full mt-3"
                                        variant={membershipStatus === 'ACTIVE' ? 'outline' : 'primary'}
                                    >
                                        {membershipStatus === 'ACTIVE' ? 'Buy Another Plan' : 'Buy Plan'}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
