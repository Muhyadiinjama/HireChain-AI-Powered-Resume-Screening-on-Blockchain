import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Info,
    LayoutDashboard,
    LockKeyhole,
    LogOut,
    Menu,
    MessageSquare,
    Moon,
    Plus,
    Settings,
    Shield,
    Sun,
    UserRound,
    X as CloseIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import blackLogo from '../assets/logos/black-logo.png';
import whiteLogo from '../assets/logos/white-logo.png';
import { loadStoredAvatar } from '../utils/accountHelpers';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!user) {
            setAvatarPreview('');
            return;
        }

        setAvatarPreview(loadStoredAvatar(user._id));
    }, [user, location.pathname]);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface transition-colors duration-300">
            <div className="flex items-center justify-between max-w-7xl mx-auto h-16 md:h-20 px-4 md:px-8">
                <div className="flex items-center">
                    <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                        <img
                            src={theme === 'dark' ? blackLogo : whiteLogo}
                            alt="HireChain Logo"
                            className="h-11 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="hidden lg:flex items-center space-x-8 text-gray-600 dark:text-gray-300 font-bold mr-12 xl:mr-16">
                        <Link to="/jobs" className="hover:text-brand-primary transition-colors text-sm">Jobs</Link>
                        <Link to="/blockchain" className="hover:text-brand-primary transition-colors text-sm">Blockchain</Link>
                        <Link to="/about" className="hover:text-brand-primary transition-colors text-sm">About</Link>
                        <Link to="/contact" className="hover:text-brand-primary transition-colors text-sm">Contact</Link>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors text-gray-500 dark:text-gray-400"
                        aria-label="Toggle Dark Mode"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {user ? (
                        <div className="hidden lg:flex items-center space-x-4">
                            {(user.role === 'recruiter' || user.role === 'admin') && (
                                <Link
                                    to="/create-job"
                                    className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white rounded-lg transition-all border border-transparent shadow-md shadow-brand-primary/15 hover:opacity-95 text-sm font-semibold"
                                >
                                    <Plus size={16} />
                                    <span>Add Job</span>
                                </Link>
                            )}

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen((current) => !current)}
                                    className="flex items-center bg-transparent p-0 rounded-lg transition-all active:scale-95"
                                >
                                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-dark-main text-gray-700 dark:text-gray-200 text-sm font-semibold">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt={`${user.name} profile`} className="h-full w-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 py-3 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right z-50">
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
                                            <button
                                                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-dark-main text-gray-600 dark:text-gray-300 hover:text-brand-primary transition-colors group"
                                            >
                                                <div className="bg-gray-100 dark:bg-dark-main p-2 rounded-xl group-hover:bg-brand-primary/10 transition-colors">
                                                    <UserRound size={18} />
                                                </div>
                                                <span className="font-bold text-sm">Personal Info</span>
                                            </button>

                                            <button
                                                onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-dark-main text-gray-600 dark:text-gray-300 hover:text-brand-primary transition-colors group"
                                            >
                                                <div className="bg-gray-100 dark:bg-dark-main p-2 rounded-xl group-hover:bg-brand-primary/10 transition-colors">
                                                    <Settings size={18} />
                                                </div>
                                                <span className="font-bold text-sm">Settings</span>
                                            </button>

                                            <button
                                                onClick={() => { navigate('/security'); setDropdownOpen(false); }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-dark-main text-gray-600 dark:text-gray-300 hover:text-brand-primary transition-colors group"
                                            >
                                                <div className="bg-gray-100 dark:bg-dark-main p-2 rounded-xl group-hover:bg-brand-primary/10 transition-colors">
                                                    <LockKeyhole size={18} />
                                                </div>
                                                <span className="font-bold text-sm">Security</span>
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
                        <div className="hidden lg:flex items-center">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-brand-primary text-white px-6 md:px-8 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/95 transition-all active:scale-95 text-sm md:text-base"
                            >
                                Sign In
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setMobileMenuOpen((current) => !current)}
                        className="lg:hidden p-2 rounded-lg bg-gray-50 dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card transition-all active:scale-90"
                        aria-label="Toggle Menu"
                    >
                        {mobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-16 z-40 md:top-20">
                    <button
                        type="button"
                        aria-label="Close mobile menu"
                        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    <div className="relative ml-auto h-full w-[84vw] max-w-[296px] border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface px-3 pb-4 pt-3 shadow-2xl overflow-y-auto">
                        <div className="space-y-2">
                            {user && (
                                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 mb-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt={`${user.name} profile`} className="h-full w-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{user.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-semibold text-sm transition-all active:scale-[0.98]">
                                <div className="bg-brand-secondary/10 p-2 rounded-lg text-brand-secondary"><Briefcase size={17} /></div>
                                <span>Jobs</span>
                            </Link>

                            {user && (
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-semibold text-sm transition-all active:scale-[0.98]">
                                    <div className="bg-brand-accent/10 p-2 rounded-lg text-brand-accent"><LayoutDashboard size={17} /></div>
                                    <span>Dashboard</span>
                                </Link>
                            )}

                            <Link to="/blockchain" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-semibold text-sm transition-all active:scale-[0.98]">
                                <div className="bg-brand-secondary/10 p-2 rounded-lg text-brand-secondary"><Shield size={17} /></div>
                                <span>Blockchain</span>
                            </Link>

                            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-semibold text-sm transition-all active:scale-[0.98]">
                                <div className="bg-brand-primary/10 p-2 rounded-lg text-brand-primary"><Info size={17} /></div>
                                <span>About</span>
                            </Link>

                            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-semibold text-sm transition-all active:scale-[0.98]">
                                <div className="bg-brand-accent/10 p-2 rounded-lg text-brand-accent"><MessageSquare size={17} /></div>
                                <span>Contact</span>
                            </Link>

                            {(user?.role === 'recruiter' || user?.role === 'admin') && (
                                <Link to="/create-job" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-brand-primary/12 via-brand-secondary/12 to-brand-accent/12 dark:from-brand-primary/18 dark:via-brand-secondary/18 dark:to-brand-accent/18 text-gray-900 dark:text-white font-semibold text-sm border border-brand-primary/20 dark:border-brand-primary/25 transition-all active:scale-[0.98]">
                                    <div className="bg-brand-primary/15 dark:bg-brand-primary/20 p-2 rounded-lg text-brand-primary"><Plus size={17} /></div>
                                    <span>Add Job</span>
                                </Link>
                            )}

                            {user && (
                                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-semibold text-sm transition-all active:scale-[0.98]">
                                    <div className="bg-brand-primary/10 p-2 rounded-lg text-brand-primary"><UserRound size={17} /></div>
                                    <span>Personal Info</span>
                                </Link>
                            )}

                            {user && (
                                <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-semibold text-sm transition-all active:scale-[0.98]">
                                    <div className="bg-brand-primary/10 p-2 rounded-lg text-brand-primary"><Settings size={17} /></div>
                                    <span>Settings</span>
                                </Link>
                            )}

                            {user && (
                                <Link to="/security" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-main text-gray-900 dark:text-white font-semibold text-sm transition-all active:scale-[0.98]">
                                    <div className="bg-brand-accent/10 p-2 rounded-lg text-brand-accent"><LockKeyhole size={17} /></div>
                                    <span>Security</span>
                                </Link>
                            )}

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                                {user ? (
                                    <button
                                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                                        className="w-full p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 active:scale-95"
                                    >
                                        <LogOut size={18} />
                                        <span>Sign Out</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                                        className="w-full p-3 bg-brand-primary text-white font-semibold text-sm rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 active:scale-95"
                                    >
                                        Sign In
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
