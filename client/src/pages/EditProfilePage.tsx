import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Building2, Mail, Save, Upload, UserRound } from 'lucide-react';
import AccountShell from '../components/account/AccountShell';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../services/api';
import { formatErrorMessage } from '../utils/errorHandlers';
import { getInitials, getProfileStorageKey, loadStoredAvatar, saveStoredAvatar } from '../utils/accountHelpers';

const EditProfilePage = () => {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [avatarPreview, setAvatarPreview] = useState('');
    const [loading, setLoading] = useState(false);

    const needsCompany = user?.role === 'recruiter' || user?.role === 'admin';

    const profileStorageKey = useMemo(() => (
        user ? getProfileStorageKey(user._id) : ''
    ), [user]);

    useEffect(() => {
        if (!user) {
            return;
        }

        setName(user.name || '');
        setCompany(user.company || '');
        setAvatarPreview(loadStoredAvatar(user._id));
    }, [user]);

    if (!user) {
        return null;
    }

    const initials = getInitials(user.name);

    const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Please choose an image file for the profile picture.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Profile picture must be smaller than 2 MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setAvatarPreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

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
                company: needsCompany ? company.trim() : ''
            });

            if (avatarPreview || localStorage.getItem(profileStorageKey)) {
                saveStoredAvatar(user._id, avatarPreview);
            }

            await refreshUser();
            toast.success('Personal information saved successfully.');
        } catch (error) {
            toast.error(formatErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AccountShell showHero={false}>
            <div className="max-w-4xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="rounded-[24px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300"
                >
                    <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-brand-primary/6 via-brand-secondary/6 to-brand-accent/6 dark:from-brand-primary/10 dark:via-brand-secondary/10 dark:to-brand-accent/10">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-primary/70">Edit Profile</p>
                            <h2 className="mt-2 text-xl md:text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                                Update your account details
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                Change your name, photo, and company details from this page.
                            </p>
                        </div>

                        <Link
                            to="/profile"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/90 dark:bg-dark-main px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-800 hover:text-brand-primary transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span>Back</span>
                        </Link>
                    </div>

                    <div className="p-5 md:p-6 grid gap-5 lg:grid-cols-[220px,1fr]">
                        <div className="rounded-[20px] bg-gradient-to-br from-brand-primary/8 via-brand-secondary/8 to-brand-accent/8 dark:from-brand-primary/12 dark:via-brand-secondary/12 dark:to-brand-accent/12 p-5 border border-brand-primary/10 dark:border-white/5 transition-colors duration-300">
                            <div className="mx-auto h-24 w-24 rounded-[24px] overflow-hidden bg-white dark:bg-dark-card text-brand-primary flex items-center justify-center text-3xl font-black shadow-sm">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt={`${user.name} avatar`} className="h-full w-full object-cover" />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>

                            <div className="mt-4 space-y-2">
                                <label className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-dark-card px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white cursor-pointer transition-colors border border-brand-primary/10 dark:border-white/5">
                                    <Upload size={16} className="text-brand-primary" />
                                    <span>Upload Photo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setAvatarPreview('')}
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-primary transition-colors"
                                >
                                    Remove Photo
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <UserRound size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        className="block w-full pl-10 pr-4 py-3.5 bg-gradient-to-r from-brand-primary/5 to-transparent dark:from-brand-primary/8 dark:to-transparent border border-brand-primary/10 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-gray-900 dark:text-white"
                                        placeholder="Your full name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        value={user.email}
                                        readOnly
                                        className="block w-full pl-10 pr-4 py-3.5 bg-gray-100 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Role</label>
                                <div className="px-4 py-3.5 rounded-xl bg-gradient-to-r from-brand-secondary/6 to-transparent dark:from-brand-secondary/10 dark:to-transparent border border-brand-secondary/10 dark:border-white/5 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wide">
                                    {user.role}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                    Company Name{needsCompany ? ' *' : ''}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Building2 size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(event) => setCompany(event.target.value)}
                                        required={needsCompany}
                                        disabled={!needsCompany}
                                        className="block w-full pl-10 pr-4 py-3.5 bg-gradient-to-r from-emerald-500/6 to-transparent dark:from-emerald-500/10 dark:to-transparent border border-emerald-500/10 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-gray-900 dark:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                        placeholder={needsCompany ? 'Your company or organization' : 'Company not required for this role'}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {needsCompany
                                        ? 'Recruiter and admin accounts need a company name for employer-side workflows.'
                                        : 'Candidate accounts do not require a company name.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 md:px-6 pb-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl premium-gradient text-white text-sm font-bold hover:opacity-95 transition-all disabled:opacity-70 shadow-sm"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>
            </div>
        </AccountShell>
    );
};

export default EditProfilePage;
