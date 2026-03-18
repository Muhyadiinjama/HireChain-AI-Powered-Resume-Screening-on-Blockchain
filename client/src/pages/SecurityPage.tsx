import { useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { Camera, KeyRound, LockKeyhole, Mail, Save, ShieldCheck } from 'lucide-react';
import { EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import AccountShell from '../components/account/AccountShell';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../services/firebase';
import { formatErrorMessage } from '../utils/errorHandlers';
import { getProviderIds, getProviderSummary } from '../utils/accountHelpers';

const SecurityPage = () => {
    const { user, firebaseUser } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!user) {
        return null;
    }

    const providerIds = getProviderIds(firebaseUser);
    const providerSummary = getProviderSummary(providerIds);
    const canChangePassword = providerIds.includes('password');
    const usesGoogle = providerIds.includes('google.com');

    const handlePasswordReset = async () => {
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast.success('Password reset link sent to your email.');
        } catch (error) {
            toast.error(formatErrorMessage(error));
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!firebaseUser || !firebaseUser.email) {
            toast.error('No active account session was found.');
            return;
        }

        if (!canChangePassword) {
            toast.error('Password changes are only available for email and password accounts.');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New password and confirmation do not match.');
            return;
        }

        setLoading(true);
        try {
            const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
            await reauthenticateWithCredential(firebaseUser, credential);
            await updatePassword(firebaseUser, newPassword);

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast.success('Password updated successfully.');
        } catch (error) {
            toast.error(formatErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AccountShell showHero={false}>
            <div className="max-w-4xl mx-auto">
                <section className="rounded-[24px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-brand-primary/6 via-brand-secondary/6 to-brand-accent/6 dark:from-brand-primary/10 dark:via-brand-secondary/10 dark:to-brand-accent/10">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-accent/70">Security</p>
                        <h2 className="mt-2 text-xl md:text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                            Protect your access
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            Manage your sign-in method, recovery email, and password from a smaller security layout.
                        </p>
                    </div>

                    <div className="p-5 md:p-6 space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[20px] bg-gradient-to-br from-brand-primary/6 to-brand-primary/2 dark:from-brand-primary/10 dark:to-brand-primary/5 p-4 border border-brand-primary/10 dark:border-white/5 transition-colors duration-300">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-primary/70">Sign-in Method</p>
                                <p className="mt-3 text-base font-black text-gray-900 dark:text-white transition-colors duration-300">{providerSummary}</p>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                    Password management is available for accounts using email and password authentication.
                                </p>
                            </div>

                            <div className="rounded-[20px] bg-gradient-to-br from-brand-accent/8 to-brand-accent/3 dark:from-brand-accent/12 dark:to-brand-accent/5 p-4 border border-brand-accent/10 dark:border-white/5 transition-colors duration-300">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-primary/70">Recovery Email</p>
                                <p className="mt-3 text-base font-black text-gray-900 dark:text-white break-all transition-colors duration-300">{user.email}</p>
                                <button
                                    type="button"
                                    onClick={handlePasswordReset}
                                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                                >
                                    <Mail size={14} />
                                    <span>Send reset link</span>
                                </button>
                            </div>
                        </div>

                        {canChangePassword ? (
                            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Current Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <LockKeyhole size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={currentPassword}
                                            onChange={(event) => setCurrentPassword(event.target.value)}
                                            className="block w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-gray-900 dark:text-white"
                                            placeholder="Enter your current password"
                                            autoComplete="current-password"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <KeyRound size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={newPassword}
                                            onChange={(event) => setNewPassword(event.target.value)}
                                            className="block w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-gray-900 dark:text-white"
                                            placeholder="Use at least 6 characters"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Confirm New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            className="block w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-gray-900 dark:text-white"
                                            placeholder="Retype your new password"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary/95 transition-colors disabled:opacity-70"
                                    >
                                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                                        <span>Update Password</span>
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="rounded-[20px] border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-main p-5 transition-colors duration-300">
                                <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                                    <Camera size={16} className="text-brand-primary" />
                                    <h3 className="text-base font-black">Password controls are limited for this account</h3>
                                </div>
                                <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                    {usesGoogle
                                        ? 'This profile currently signs in with Google. Keep using Google for authentication or connect an email and password sign-in method if you want in-app password updates later.'
                                        : 'This account does not currently expose a password-based sign-in method, so password changes are unavailable in this panel.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AccountShell>
    );
};

export default SecurityPage;
