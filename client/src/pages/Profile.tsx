import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { Building2, Mail, Save, ShieldCheck, UserRound } from 'lucide-react';
import { updateProfile } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatErrorMessage } from '../utils/errorHandlers';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }

        setName(user.name || '');
        setCompany(user.company || '');
    }, [user]);

    if (!user) {
        return null;
    }

    const needsCompany = user.role === 'recruiter' || user.role === 'admin';

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (needsCompany && !company.trim()) {
            toast.error('Company name is required for recruiter and admin accounts.');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                name: name.trim(),
                company: company.trim()
            });
            await refreshUser();
            toast.success('Profile updated successfully.');
        } catch (error) {
            toast.error(formatErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="rounded-[36px] bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary text-white p-8 md:p-10 shadow-xl mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wide mb-4">
                    <ShieldCheck size={13} />
                    <span>Profile Settings</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-2">Manage Your Profile</h1>
                <p className="text-white/80 max-w-2xl">
                    Keep your account details up to date. Recruiter and admin accounts must include a company name.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[36px] bg-white dark:bg-dark-main border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Account Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Edit your name and organization details here.
                    </p>
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <UserRound size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all text-gray-900 dark:text-white"
                                placeholder="Your full name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={user.email}
                                readOnly
                                className="block w-full pl-11 pr-4 py-4 bg-gray-100 dark:bg-gray-900/70 border-none rounded-2xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Role</label>
                        <div className="px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wide">
                            {user.role}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                            Company Name{needsCompany ? ' *' : ''}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Building2 size={18} />
                            </div>
                            <input
                                type="text"
                                value={company}
                                onChange={(event) => setCompany(event.target.value)}
                                required={needsCompany}
                                disabled={!needsCompany}
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all text-gray-900 dark:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                placeholder={needsCompany ? 'Your company or organization' : 'Company not required for this role'}
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {needsCompany
                                ? 'This field is required for recruiter and admin accounts.'
                                : 'Candidate accounts do not require a company name.'}
                        </p>
                    </div>
                </div>

                <div className="px-6 md:px-8 pb-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl premium-gradient text-white font-bold shadow-lg hover:opacity-95 transition-all disabled:opacity-70"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                        <span>Save Profile</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
