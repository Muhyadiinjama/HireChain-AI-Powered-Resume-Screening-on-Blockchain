import { Link } from 'react-router-dom';
import { Building2, Mail, PencilLine, ShieldCheck, UserRound } from 'lucide-react';
import AccountShell from '../components/account/AccountShell';
import { useAuth } from '../hooks/useAuth';
import { getInitials, getProviderIds, getProviderSummary, loadStoredAvatar } from '../utils/accountHelpers';

const Profile = () => {
    const { user, firebaseUser } = useAuth();

    if (!user) {
        return null;
    }

    const avatarPreview = loadStoredAvatar(user._id);
    const initials = getInitials(user.name);
    const providerSummary = getProviderSummary(getProviderIds(firebaseUser));

    return (
        <AccountShell showHero={false}>
            <div className="max-w-4xl mx-auto">
                <section className="rounded-[24px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="relative p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-brand-primary/6 via-brand-secondary/6 to-brand-accent/6 dark:from-brand-primary/10 dark:via-brand-secondary/10 dark:to-brand-accent/10">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-primary/70">Profile</p>
                            <h2 className="mt-2 text-xl md:text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                                Personal information
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                View your account details and open the edit page when you want to make changes.
                            </p>
                        </div>
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

                            <div className="mt-4 text-center">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">{user.name}</h3>
                                <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="rounded-[20px] bg-gradient-to-br from-brand-primary/6 to-brand-primary/2 dark:from-brand-primary/10 dark:to-brand-primary/5 p-4 border border-brand-primary/10 dark:border-white/5 transition-colors duration-300">
                                <div className="flex items-center gap-3 text-brand-primary">
                                    <UserRound size={16} />
                                    <p className="text-xs font-black uppercase tracking-[0.22em]">Full Name</p>
                                </div>
                                <p className="mt-3 text-lg font-black text-gray-900 dark:text-white">{user.name}</p>
                            </div>

                            <div className="rounded-[20px] bg-gradient-to-br from-brand-secondary/6 to-brand-secondary/2 dark:from-brand-secondary/10 dark:to-brand-secondary/5 p-4 border border-brand-secondary/10 dark:border-white/5 transition-colors duration-300">
                                <div className="flex items-center gap-3 text-brand-primary">
                                    <Mail size={16} />
                                    <p className="text-xs font-black uppercase tracking-[0.22em]">Email Address</p>
                                </div>
                                <p className="mt-3 text-base font-black break-all text-gray-900 dark:text-white">{user.email}</p>
                            </div>

                            <div className="rounded-[20px] bg-gradient-to-br from-emerald-500/8 to-emerald-500/3 dark:from-emerald-500/12 dark:to-emerald-500/5 p-4 border border-emerald-500/10 dark:border-white/5 transition-colors duration-300">
                                <div className="flex items-center gap-3 text-brand-primary">
                                    <Building2 size={16} />
                                    <p className="text-xs font-black uppercase tracking-[0.22em]">Company</p>
                                </div>
                                <p className="mt-3 text-base font-black text-gray-900 dark:text-white">
                                    {user.company?.trim() ? user.company : 'No company added'}
                                </p>
                            </div>

                            <div className="rounded-[20px] bg-gradient-to-br from-brand-accent/8 to-brand-accent/3 dark:from-brand-accent/12 dark:to-brand-accent/5 p-4 border border-brand-accent/10 dark:border-white/5 transition-colors duration-300">
                                <div className="flex items-center gap-3 text-brand-primary">
                                    <ShieldCheck size={16} />
                                    <p className="text-xs font-black uppercase tracking-[0.22em]">Access</p>
                                </div>
                                <p className="mt-3 text-base font-black text-gray-900 dark:text-white">{providerSummary}</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 md:px-6 pb-6">
                        <div className="flex justify-start md:justify-end">
                            <Link
                                to="/profile/edit"
                                className="inline-flex items-center justify-center gap-2 rounded-xl premium-gradient text-white px-4 py-2.5 text-sm font-bold hover:opacity-95 transition-all shadow-sm"
                            >
                                <PencilLine size={16} />
                                <span>Edit Profile</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </AccountShell>
    );
};

export default Profile;
