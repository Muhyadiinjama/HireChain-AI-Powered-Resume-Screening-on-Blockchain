import { useEffect, useState, type ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials, getProviderIds, getProviderSummary, loadStoredAvatar } from '../../utils/accountHelpers';

type AccountShellProps = {
    badge?: string;
    title?: string;
    description?: string;
    showHero?: boolean;
    children: ReactNode;
};

const AccountShell = ({ badge, title, description, showHero = true, children }: AccountShellProps) => {
    const { user, firebaseUser } = useAuth();
    const [avatarPreview, setAvatarPreview] = useState('');

    useEffect(() => {
        if (!user) {
            return;
        }

        setAvatarPreview(loadStoredAvatar(user._id));
    }, [user]);

    if (!user) {
        return null;
    }

    const initials = getInitials(user.name);
    const providerSummary = getProviderSummary(getProviderIds(firebaseUser));

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
            {showHero && (
                <section className="relative overflow-hidden rounded-[28px] md:rounded-[36px] premium-gradient text-white p-5 md:p-10 shadow-xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.16),transparent_30%)]" />
                    <div className="relative grid gap-5 md:gap-8 lg:grid-cols-[1.5fr,1fr]">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                            <div className="h-16 w-16 md:h-24 md:w-24 rounded-[20px] md:rounded-[28px] bg-white/15 border border-white/20 overflow-hidden flex items-center justify-center text-lg md:text-2xl font-black shadow-lg">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt={`${user.name} profile`} className="h-full w-full object-cover" />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>

                            {(badge || title || description) && (
                                <div>
                                    {badge && (
                                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.24em]">
                                            <ShieldCheck size={14} />
                                            <span>{badge}</span>
                                        </div>
                                    )}
                                    {title && <h1 className="mt-3 text-2xl md:text-5xl font-black">{title}</h1>}
                                    {description && <p className="mt-2 max-w-2xl text-sm md:text-base text-white/80 leading-relaxed">{description}</p>}
                                </div>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-3 md:gap-4">
                            <div className="rounded-[20px] md:rounded-[28px] bg-white/10 border border-white/15 p-4 md:p-5">
                                <p className="text-xs uppercase tracking-[0.25em] text-white/70 font-black">Role</p>
                                <p className="mt-2 text-lg md:text-xl font-black capitalize">{user.role}</p>
                            </div>
                            <div className="rounded-[20px] md:rounded-[28px] bg-white/10 border border-white/15 p-4 md:p-5">
                                <p className="text-xs uppercase tracking-[0.25em] text-white/70 font-black">Email</p>
                                <p className="mt-2 text-sm font-semibold break-all">{user.email}</p>
                            </div>
                            <div className="rounded-[20px] md:rounded-[28px] bg-white/10 border border-white/15 p-4 md:p-5">
                                <p className="text-xs uppercase tracking-[0.25em] text-white/70 font-black">Access</p>
                                <p className="mt-2 text-sm font-semibold">{providerSummary}</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <div className={showHero ? 'mt-8' : ''}>
                {children}
            </div>
        </div>
    );
};

export default AccountShell;
