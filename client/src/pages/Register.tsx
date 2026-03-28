import { useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, Briefcase, UserCircle, Building2 } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { registerUser } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatErrorMessage } from '../utils/errorHandlers';

interface RegisterProps {
    isEmbed?: boolean;
}

const Register = ({ isEmbed = false }: RegisterProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (role === 'recruiter' && !company.trim()) {
                toast.error('Company name is required for recruiter accounts.');
                setLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            await registerUser({ token, role, name, company: company.trim() });

            await refreshUser();
            toast.success('Registration successful! Welcome to the platform.');

            navigate('/dashboard');
        } catch (err: unknown) {
            toast.error(formatErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
        <div className={`${isEmbed ? '' : 'bg-white/80 dark:bg-dark-main/80 backdrop-blur-xl p-6 md:p-12 rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-xl border border-white dark:border-gray-800 transition-colors duration-300'}`}>
            {!isEmbed && (
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="bg-brand-primary text-white p-4 rounded-2xl shadow-lg ring-8 ring-brand-primary/10 transition-shadow">
                            <UserPlus size={32} />
                        </div>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Create Account</h2>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 transition-colors duration-300">Join HireChain for a fairer recruitment experience</p>
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
                <div className={`grid ${isEmbed ? 'grid-cols-1' : 'md:grid-cols-2'} gap-6`}>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1 transition-colors duration-300">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-gray-400 text-gray-900 dark:text-white"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1 transition-colors duration-300">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-gray-400 text-gray-900 dark:text-white"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1 transition-colors duration-300">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-gray-400 text-gray-900 dark:text-white"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 ml-1 text-center font-bold transition-colors duration-300">I am a...</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setRole('candidate')}
                            className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${role === 'candidate' ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border-brand-primary ring-4 ring-brand-primary/10' : 'bg-white dark:bg-dark-surface border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}
                        >
                            <UserCircle size={32} className={role === 'candidate' ? 'text-brand-primary' : 'text-gray-400'} />
                            <span className={`mt-2 font-bold ${role === 'candidate' ? 'text-brand-primary dark:text-brand-primary' : 'text-gray-500 dark:text-gray-400'}`}>Candidate</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('recruiter')}
                            className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${role === 'recruiter' ? 'bg-brand-secondary/10 dark:bg-brand-secondary/20 border-brand-secondary ring-4 ring-brand-secondary/10' : 'bg-white dark:bg-dark-surface border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}
                        >
                            <Briefcase size={32} className={role === 'recruiter' ? 'text-brand-secondary' : 'text-gray-400'} />
                            <span className={`mt-2 font-bold ${role === 'recruiter' ? 'text-brand-secondary dark:text-brand-secondary' : 'text-gray-500 dark:text-gray-400'}`}>Recruiter</span>
                        </button>
                    </div>
                </div>

                {role === 'recruiter' && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1 transition-colors duration-300">Company Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Building2 size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-gray-400 text-gray-900 dark:text-white"
                                placeholder="Your company or organization"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Recruiter accounts must be linked to a company profile.
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full premium-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-primary-500/30 transition-all active:scale-95 disabled:opacity-70 mt-4"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <UserPlus size={20} />
                            <span>Create Account</span>
                        </>
                    )}
                </button>
            </form>

            {!isEmbed && (
                <div className="mt-10 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-primary font-bold hover:underline">Sign In</Link>
                </div>
            )}
        </div>
    );

    if (isEmbed) {
        return formContent;
    }

    return (
        <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex items-start justify-center px-4 py-8 md:py-12 relative overflow-hidden transition-colors duration-300">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gray-50 dark:bg-dark-main overflow-hidden transition-colors duration-300">
                <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full blur-[120px] transition-colors duration-300" />
                <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-brand-secondary/10 dark:bg-brand-secondary/20 rounded-full blur-[120px] transition-colors duration-300" />
            </div>
            {formContent}
        </div>
    );
};

export default Register;
