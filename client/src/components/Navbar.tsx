import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, LogOut,
    Settings, Plus, Sun, Moon,
    Menu, X as CloseIcon, Shield, Briefcase
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import blackLogo from '../assets/logos/black-logo.png';
import whiteLogo from '../assets/logos/white-logo.png';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <nav className="glass sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            {/* Main Navbar Bar */}
            <div className="flex items-center justify-between max-w-7xl mx-auto h-20 px-4 md:px-8">
                {/* Left: Logo only */}
                <div className="flex items-center">
                    <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                        <img
                            src={theme === 'dark' ? blackLogo : whiteLogo}
                            alt="HireChain Logo"
                            className="h-14 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </div>

                {/* Right: Nav links + Actions */}
                <div className="flex items-center space-x-2 md:space-x-3">
                    {/* Desktop Nav Links — right side, near dark mode toggle */}
                    <div className="hidden lg:flex items-center space-x-6 text-gray-600 dark:text-gray-300 font-bold mr-2">
                        <Link to="/jobs" className="hover:text-brand-primary transition-colors text-sm">Jobs</Link>
                        <Link to="/blockchain" className="hover:text-brand-primary transition-colors text-sm">Blockchain</Link>
                    </div>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors text-gray-500 dark:text-gray-400"
                        aria-label="Toggle Dark Mode"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {user ? (
                        /* Logged in - Desktop only: Dashboard + Avatar */
                        <div className="hidden lg:flex items-center space-x-3">
                            <Link
                                to="/dashboard"
                                className="flex items-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary font-bold rounded-xl transition-all border border-transparent hover:border-brand-primary/20"
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>

                            {/* Avatar Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-main p-1 rounded-xl border border-gray-200 dark:border-gray-800 transition-all shadow-sm active:scale-95 group"
                                >
                                    <div className="bg-brand-primary text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-md group-hover:rotate-3 transition-transform">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 py-3 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right z-50">
                                        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 mb-2">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">User Account</p>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{user.email}</p>
                                        </div>

                                        <div className="px-2 space-y-1">
                                            <button
                                                onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-brand-primary transition-colors group"
                                            >
                                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl group-hover:bg-brand-primary/10 transition-colors">
                                                    <LayoutDashboard size={18} />
                                                </div>
                                                <span className="font-bold text-sm">Dashboard</span>
                                            </button>

                                            {(user.role === 'recruiter' || user.role === 'admin') && (
                                                <button
                                                    onClick={() => { navigate('/create-job'); setDropdownOpen(false); }}
                                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-dark-main text-gray-600 dark:text-gray-300 hover:text-brand-primary transition-colors group"
                                                >
                                                    <div className="bg-gray-100 dark:bg-dark-main p-2 rounded-xl group-hover:bg-brand-primary/10 transition-colors">
                                                        <Plus size={18} />
                                                    </div>
                                                    <span className="font-bold text-sm">Post New Job</span>
                                                </button>
                                            )}

                                            <button
                                                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-dark-main text-gray-600 dark:text-gray-300 hover:text-brand-primary transition-colors group"
                                            >
                                                <div className="bg-gray-100 dark:bg-dark-main p-2 rounded-xl group-hover:bg-brand-primary/10 transition-colors">
                                                    <Settings size={18} />
                                                </div>
                                                <span className="font-bold text-sm">Settings</span>
                                            </button>
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800 px-2">
                                            <button
                                                onClick={() => { setDropdownOpen(false); logout(); }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold transition-all"
                                            >
                                                <LogOut size={18} />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Logged out - Desktop only: Sign In */
                        <div className="hidden lg:flex items-center">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-brand-primary text-white px-6 md:px-8 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/95 transition-all active:scale-95 text-sm md:text-base"
                            >
                                Sign In
                            </button>
                        </div>
                    )}

                    {/* Mobile Hamburger — always visible on mobile */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card transition-all active:scale-90"
                        aria-label="Toggle Menu"
                    >
                        {mobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Panel — slides down below navbar, part of normal document flow */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface px-4 pb-4 pt-3 z-40">
                    <div className="space-y-2">
                        {/* User info card when logged in */}
                        {user && (
                            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 mb-3">
                                <div className="bg-brand-primary text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{user.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Nav Links */}
                        <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-bold transition-all active:scale-[0.98]">
                            <div className="bg-brand-secondary/10 p-2 rounded-xl text-brand-secondary"><Briefcase size={18} /></div>
                            <span>Browse Jobs</span>
                        </Link>

                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-bold transition-all active:scale-[0.98]">
                            <div className="bg-brand-accent/10 p-2 rounded-xl text-brand-accent"><LayoutDashboard size={18} /></div>
                            <span>Dashboard</span>
                        </Link>

                        <Link to="/blockchain" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-bold transition-all active:scale-[0.98]">
                            <div className="bg-brand-secondary/10 p-2 rounded-xl text-brand-secondary"><Shield size={18} /></div>
                            <span>Blockchain</span>
                        </Link>

                        {(user?.role === 'recruiter' || user?.role === 'admin') && (
                            <Link to="/create-job" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-bold transition-all active:scale-[0.98]">
                                <div className="bg-brand-primary/10 p-2 rounded-xl text-brand-primary"><Plus size={18} /></div>
                                <span>Post New Job</span>
                            </Link>
                        )}

                        {user && (
                            <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-bold transition-all active:scale-[0.98]">
                                <div className="bg-brand-primary/10 p-2 rounded-xl text-brand-primary"><Settings size={18} /></div>
                                <span>Profile Settings</span>
                            </Link>
                        )}

                        {/* Bottom Action */}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                            {user ? (
                                <button
                                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                                    className="w-full p-3.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-2xl flex items-center justify-center space-x-2 active:scale-95"
                                >
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                                    className="w-full p-3.5 bg-brand-primary text-white font-bold rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 active:scale-95"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
