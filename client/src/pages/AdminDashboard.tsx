
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Users, BadgeDollarSign, ShieldCheck, UserCog } from 'lucide-react';

interface Stats {
    totalUsers: number;
    totalSales: number;
    activeMembers: number;
}

interface User {
    id: number;
    email: string;
    name: string;
    role: 'USER' | 'STAFF' | 'ADMIN';
    isActive: boolean;
    membership: { status: string; plan?: { name: string } } | null;
    _count?: { sessions: number };
}

const AdminDashboard = () => {
    const { token, user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (!['ADMIN', 'STAFF'].includes(user?.role || '')) {
            navigate('/dashboard');
            return;
        }

        const fetchAdminData = async () => {
            try {
                const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (statsRes.ok) setStats(await statsRes.json());

                const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (usersRes.ok) setUsers(await usersRes.json());
            } catch (e) {
                console.error(e);
            }
        };

        fetchAdminData();
    }, [token, user, navigate]);

    const isSuperAdmin = user?.role === 'ADMIN';

    const students = users.filter((u) => u.role === 'USER');
    const staff = users.filter((u) => u.role === 'STAFF');
    const superAdmins = users.filter((u) => u.role === 'ADMIN');

    const handleRevoke = async (userId: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/admin/revoke`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });
            await fetchAdminData();
        } catch (e) {
            console.error(e);
        }
    };

    const handleGrant = async (userId: number) => {
        if (!confirm('Grant membership to this user?')) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/admin/grant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId, planId: 1 })
            });
            await fetchAdminData();
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAdminData = async () => {
        try {
            const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (statsRes.ok) setStats(await statsRes.json());

            const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (usersRes.ok) setUsers(await usersRes.json());
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 md:p-8 shadow-lg">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-slate-300 font-semibold">Administration</p>
                        <h1 className="text-3xl md:text-4xl font-bold mt-1">Admin Dashboard</h1>
                        <p className="text-slate-300 mt-2">
                            {isSuperAdmin
                                ? 'Super admin view: full control over students, staff, and system access.'
                                : 'Staff admin view: manage students, memberships, and operational reports.'}
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to App</Button>
                </div>
            </section>

            {stats && (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Total Users</p>
                            <Users className="h-5 w-5 text-indigo-500" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Active Members</p>
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-emerald-600">{stats.activeMembers}</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Total Revenue</p>
                            <BadgeDollarSign className="h-5 w-5 text-violet-500" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-slate-900">${stats.totalSales.toFixed(2)}</p>
                    </div>
                </section>
            )}

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">User Panel</h2>
                    <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                        <UserCog className="h-4 w-4" />
                        {users.length} users
                    </span>
                </div>

                <div className="p-5 space-y-6">
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-900">Students / Customers ({students.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[880px]">
                                <thead>
                                    <tr className="bg-white text-slate-600 text-sm">
                                        <th className="p-4 font-semibold">Name</th>
                                        <th className="p-4 font-semibold">Email</th>
                                        <th className="p-4 font-semibold">Membership</th>
                                        <th className="p-4 font-semibold">Plan</th>
                                        <th className="p-4 font-semibold">Usage (Sessions)</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((u) => (
                                        <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                                            <td className="p-4 font-medium text-slate-900">{u.name || '-'}</td>
                                            <td className="p-4 text-slate-600">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.membership?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {u.membership?.status || 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-600">{u.membership?.plan?.name || '-'}</td>
                                            <td className="p-4 text-slate-700">{u._count?.sessions ?? 0}</td>
                                            <td className="p-4 text-right">
                                                {u.membership?.status === 'ACTIVE' ? (
                                                    <button onClick={() => handleRevoke(u.id)} className="text-rose-600 hover:text-rose-700 text-sm font-semibold">Revoke</button>
                                                ) : (
                                                    <button onClick={() => handleGrant(u.id)} className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold">Grant</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-900">Admin Staff ({staff.length})</h3>
                        </div>
                        <div className="p-4">
                            {staff.length === 0 ? (
                                <p className="text-sm text-slate-500">No staff users found.</p>
                            ) : (
                                <div className="space-y-2">
                                    {staff.map((u) => (
                                        <div key={u.id} className="rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">{u.name || '-'}</p>
                                                <p className="text-sm text-slate-500">{u.email}</p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {isSuperAdmin && (
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-900">Super Admins ({superAdmins.length})</h3>
                            </div>
                            <div className="p-4">
                                {superAdmins.length === 0 ? (
                                    <p className="text-sm text-slate-500">No super admins found.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {superAdmins.map((u) => (
                                            <div key={u.id} className="rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-900">{u.name || '-'}</p>
                                                    <p className="text-sm text-slate-500">{u.email}</p>
                                                </div>
                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">SUPER ADMIN</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-sm text-indigo-800">
                <strong>Permission Policy:</strong> Staff admins can manage students/customers only. Super admins can manage students, staff, and super-admin access.
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Question Bank Management</h3>
                        <p className="text-sm text-slate-500 mt-1">Add, review, and update student questions including options and solutions.</p>
                    </div>
                    <Button onClick={() => navigate('/admin/questions')}>Open Question Bank</Button>
                </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Image & API Settings</h3>
                        <p className="text-sm text-slate-500 mt-1">Store your imgBB API key and upload website images from the admin panel.</p>
                    </div>
                    <Button onClick={() => navigate('/admin/settings')}>Open Settings</Button>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
