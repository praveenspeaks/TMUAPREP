import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import Input from '../components/Input';
import { UserPlus, Users, KeyRound, Shield, UserCheck } from 'lucide-react';

type Role = 'USER' | 'STAFF' | 'ADMIN';

interface ManagedUser {
    id: number;
    email: string;
    name?: string;
    role: Role;
    isActive: boolean;
    membership: { status: string } | null;
    createdAt: string;
}

type UserFilter = 'ALL' | 'USER' | 'STAFF' | 'ADMIN';

const AdminUsers = () => {
    const { token, user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER' as Role,
        isActive: true,
    });

    const [editing, setEditing] = useState<ManagedUser | null>(null);
    const [filter, setFilter] = useState<UserFilter>('ALL');
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: 'USER' as Role,
        isActive: true,
    });

    const isSuperAdmin = currentUser?.role === 'ADMIN';
    const canManageUser = (target: ManagedUser) => isSuperAdmin || target.role === 'USER';

    const filteredUsers = users.filter((u) => {
        if (filter === 'ALL') return true;
        return u.role === filter;
    });

    const fetchUsers = async () => {
        try {
            setError('');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (e: any) {
            setError(e.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...createForm,
                    role: isSuperAdmin ? createForm.role : 'USER',
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create user');

            setCreateForm({
                name: '',
                email: '',
                password: '',
                role: 'USER',
                isActive: true,
            });
            await fetchUsers();
        } catch (e: any) {
            setError(e.message || 'Create failed');
        }
    };

    const startEdit = (user: ManagedUser) => {
        if (!canManageUser(user)) {
            setError('Staff admins can only edit student/customer accounts.');
            return;
        }
        setError('');
        setEditing(user);
        setEditForm({
            name: user.name || '',
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${editing.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...editForm,
                    role: isSuperAdmin ? editForm.role : 'USER',
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update user');

            setEditing(null);
            await fetchUsers();
        } catch (e: any) {
            setError(e.message || 'Update failed');
        }
    };

    const clearEdit = () => {
        setEditing(null);
        setEditForm({
            name: '',
            email: '',
            role: 'USER',
            isActive: true,
        });
    };

    const handleDelete = async (id: number) => {
        const target = users.find((u) => u.id === id);
        if (target && !canManageUser(target)) {
            setError('Staff admins can only delete student/customer accounts.');
            return;
        }
        if (!window.confirm('Delete this user account permanently?')) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete user');
            await fetchUsers();
        } catch (e: any) {
            setError(e.message || 'Delete failed');
        }
    };

    const handleResetPassword = async (id: number) => {
        const target = users.find((u) => u.id === id);
        if (target && !canManageUser(target)) {
            setError('Staff admins can only reset passwords for student/customer accounts.');
            return;
        }
        const password = window.prompt('Enter new password (min 6 chars):');
        if (!password) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to reset password');
            alert('Password updated successfully');
        } catch (e: any) {
            setError(e.message || 'Password reset failed');
        }
    };

    const studentCount = users.filter((u) => u.role === 'USER').length;
    const staffCount = users.filter((u) => u.role === 'STAFF').length;
    const superAdminCount = users.filter((u) => u.role === 'ADMIN').length;
    const activeCount = users.filter((u) => u.isActive).length;

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 md:p-8 shadow-lg">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-slate-300 font-semibold">Admin Access Control</p>
                        <h1 className="text-3xl md:text-4xl font-bold mt-1">User & Staff Management</h1>
                        <p className="text-slate-300 mt-2">Create users, update details, set active/inactive status, reset staff passwords, and delete accounts.</p>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">Total Accounts</p>
                        <Users className="h-5 w-5 text-indigo-500" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{users.length}</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">Active Accounts</p>
                        <UserCheck className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-emerald-600">{activeCount}</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Staff / Super Admin</p>
                        <Shield className="h-5 w-5 text-violet-500" />
                    </div>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{staffCount + superAdminCount}</p>
                </div>
            </section>

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-amber-600" />
                            {editing ? `Edit ${editing.name || editing.email}` : 'Select a user from panel'}
                        </h3>

                        {editing ? (
                            <form className="mt-4 space-y-3" onSubmit={handleUpdate}>
                                <Input placeholder="Name" value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} />
                                <Input placeholder="Email" type="email" required value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} />

                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                        value={editForm.role}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value as Role }))}
                                        disabled={!isSuperAdmin}
                                    >
                                        <option value="USER">USER</option>
                                        <option value="STAFF">STAFF</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                    <label className="flex items-center gap-2 text-sm text-slate-600 border border-slate-300 rounded-md px-3 py-2">
                                        <input
                                            type="checkbox"
                                            checked={editForm.isActive}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                                        />
                                        Active
                                    </label>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" className="flex-1">Save Changes</Button>
                                    <Button type="button" variant="outline" className="flex-1" onClick={clearEdit}>
                                        Clear
                                    </Button>
                                </div>

                                <div className="pt-2 flex gap-2">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => handleResetPassword(editing.id)}>
                                        Reset Password
                                    </Button>
                                    {currentUser?.id !== editing.id && (
                                        <Button type="button" variant="danger" className="flex-1" onClick={() => handleDelete(editing.id)}>
                                            Delete User
                                        </Button>
                                    )}
                                </div>
                            </form>
                        ) : (
                            <p className="mt-3 text-sm text-slate-500">
                                Click any row in User Panel (right side). The selected user will load here for updates based on your access.
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-indigo-600" />
                            Add User/Staff
                        </h3>
                        <form className="mt-4 space-y-3" onSubmit={handleCreate}>
                            <Input placeholder="Name" value={createForm.name} onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))} />
                            <Input placeholder="Email" type="email" required value={createForm.email} onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))} />
                            <Input placeholder="Password" type="password" required value={createForm.password} onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))} />

                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    value={createForm.role}
                                    onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value as Role }))}
                                    disabled={!isSuperAdmin}
                                >
                                    <option value="USER">USER</option>
                                    <option value="STAFF">STAFF</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                                <label className="flex items-center gap-2 text-sm text-slate-600 border border-slate-300 rounded-md px-3 py-2">
                                    <input
                                        type="checkbox"
                                        checked={createForm.isActive}
                                        onChange={(e) => setCreateForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                                    />
                                    Active
                                </label>
                            </div>
                            <Button type="submit" className="w-full">Create Account</Button>
                        </form>
                    </div>
                </div>

                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                        <h2 className="text-xl font-semibold text-slate-900">User Panel</h2>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setFilter('ALL')} className={`px-3 py-1 rounded-full text-xs font-semibold ${filter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>All ({users.length})</button>
                            <button onClick={() => setFilter('USER')} className={`px-3 py-1 rounded-full text-xs font-semibold ${filter === 'USER' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Students ({studentCount})</button>
                            <button onClick={() => setFilter('STAFF')} className={`px-3 py-1 rounded-full text-xs font-semibold ${filter === 'STAFF' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Staff ({staffCount})</button>
                            {isSuperAdmin && (
                                <button onClick={() => setFilter('ADMIN')} className={`px-3 py-1 rounded-full text-xs font-semibold ${filter === 'ADMIN' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Super Admin ({superAdminCount})</button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-6 text-slate-500">Loading users...</div>
                        ) : (
                            <table className="w-full text-left min-w-[920px]">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm">
                                        <th className="p-4 font-semibold">Name</th>
                                        <th className="p-4 font-semibold">Email</th>
                                        <th className="p-4 font-semibold">User Type</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Membership</th>
                                        <th className="p-4 font-semibold">Updated By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr
                                            key={u.id}
                                            className={`border-t border-slate-100 cursor-pointer hover:bg-slate-50/70 ${editing?.id === u.id ? 'bg-indigo-50/60' : ''}`}
                                            onClick={() => startEdit(u)}
                                        >
                                            <td className="p-4 text-slate-900 font-medium">{u.name || '-'}</td>
                                            <td className="p-4 text-slate-600">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : u.role === 'STAFF' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {u.role === 'USER' ? 'STUDENT' : u.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-600">{u.membership?.status || '-'}</td>
                                            <td className="p-4 text-sm text-slate-500">
                                                {canManageUser(u) ? 'You can manage' : 'Super admin only'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminUsers;
