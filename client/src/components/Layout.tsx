import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    LayoutDashboard,
    FileQuestion,
    Shield,
    Users,
    LayoutTemplate,
    LogOut,
    Menu,
    X,
    User,
    BookOpen,
    BarChart3,
    Settings
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors duration-200 border-l-4 ${isActive
                        ? 'border-indigo-600 text-indigo-900 bg-indigo-50'
                        : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
            >
                <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-[#fcfbf9] flex font-sans">
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                <div className="font-serif font-bold text-xl text-slate-800">TMUA Prep</div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Sidebar Header / Profile */}
                <div className="p-6 border-b border-slate-100 mb-2">
                    <h1 className="font-serif text-2xl font-bold text-amber-700 tracking-wide mb-6">
                        TMUA Prep
                    </h1>
                    <div className="flex items-center space-x-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    {['ADMIN', 'STAFF'].includes(user?.role || '') && (
                        <span className="inline-block px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider rounded mt-2">
                            {user?.role === 'ADMIN' ? 'Super Admin' : 'Staff Admin'}
                        </span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto space-y-1">
                    {['ADMIN', 'STAFF'].includes(user?.role || '') ? (
                        <>
                            <div className="px-6 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                System
                            </div>
                            <NavItem to="/admin" icon={Shield} label="Admin Dashboard" />
                            <NavItem to="/admin/users" icon={Users} label="User Management" />
                            <NavItem to="/admin/questions" icon={FileQuestion} label="Question Bank" />
                            <NavItem to="/admin/homepage" icon={LayoutTemplate} label="Homepage Builder" />
                            <NavItem to="/admin/settings" icon={Settings} label="Settings" />
                        </>
                    ) : (
                        <>
                            <div className="px-6 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Main
                            </div>
                            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <NavItem to="/quiz" icon={FileQuestion} label="Practice Questions" />

                            <div className="px-6 pb-2 pt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Analytics
                            </div>
                            <NavItem to="#" icon={BarChart3} label="Performance" />
                            <NavItem to="#" icon={BookOpen} label="History" />
                        </>
                    )}
                </nav>

                {/* Footer Links */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-3 px-4 py-2 w-full text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
                    >
                        <User size={18} />
                        <span>View Profile</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 w-full text-red-500 hover:bg-red-50 text-sm font-medium transition-colors rounded-md mt-1"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0 lg:pt-0 pt-16">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
