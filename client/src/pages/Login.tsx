import { useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Chrome, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { loginUser } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Register from './Register';
import { formatErrorMessage } from '../utils/errorHandlers';
import { useTheme } from '../hooks/useTheme';
import blackLogo from '../assets/logos/black-logo.png';
import whiteLogo from '../assets/logos/white-logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const { theme } = useTheme();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            await loginUser({ token });
            await refreshUser();

            toast.success('Successfully logged in!');
            navigate('/dashboard');
        } catch (err: unknown) {
            toast.error(formatErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken();

            await loginUser({ token });
            await refreshUser();

            toast.success('Logged in with Google!');
            navigate('/dashboard');
        } catch (err: unknown) {
            toast.error(formatErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 md:py-14 bg-gray-50 dark:bg-dark-main transition-colors duration-300">
            <div className="bg-white dark:bg-dark-surface p-6 md:p-10 rounded-[24px] md:rounded-[28px] shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src={theme === 'dark' ? blackLogo : whiteLogo}
                            alt="HireChain AI Logo"
                            className="h-16 md:h-20 w-auto object-contain"
                        />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                        {showRegister ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {showRegister ? 'Join HireChain today' : 'Sign in to your account'}
                    </p>
                </div>

                <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl mb-8 transition-colors duration-300">
                    <button
                        onClick={() => setShowRegister(false)}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${!showRegister ? 'bg-white dark:bg-dark-surface text-brand-primary dark:text-brand-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setShowRegister(true)}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${showRegister ? 'bg-white dark:bg-dark-surface text-brand-primary dark:text-brand-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {!showRegister ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1 transition-colors duration-300">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-gray-400 text-gray-900 dark:text-white"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2 ml-1">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    className="block w-full pl-11 pr-12 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-gray-400 text-gray-900 dark:text-white"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-brand-primary transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full premium-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-primary-500/30 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <Register isEmbed={true} />
                )}

                <div className="mt-10">
                    <div className="relative flex items-center justify-center mb-8">
                        <div className="border-t border-gray-100 dark:border-gray-800 w-full transition-colors duration-300" />
                        <span className="absolute bg-white dark:bg-dark-main px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest transition-colors duration-300">
                            Or login with
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-3 py-4 bg-white dark:bg-dark-surface rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-2 border-gray-100 dark:border-gray-800 font-semibold text-gray-700 dark:text-gray-300 active:scale-95"
                    >
                        <Chrome size={22} className="text-red-500" />
                        <span>Continue with Google</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
