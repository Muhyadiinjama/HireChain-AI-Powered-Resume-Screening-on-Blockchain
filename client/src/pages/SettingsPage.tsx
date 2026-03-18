import { MoonStar, Sun } from 'lucide-react';
import AccountShell from '../components/account/AccountShell';
import { useTheme } from '../hooks/useTheme';

const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <AccountShell showHero={false}>
            <div className="max-w-4xl mx-auto">
                <section className="rounded-[24px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-brand-primary/6 via-brand-secondary/6 to-brand-accent/6 dark:from-brand-primary/10 dark:via-brand-secondary/10 dark:to-brand-accent/10">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-secondary/70">Settings</p>
                        <h2 className="mt-2 text-xl md:text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                            Personalize your workspace
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            Adjust appearance and account preferences in a smaller, cleaner settings layout.
                        </p>
                    </div>

                    <div className="p-5 md:p-6 space-y-4">
                        <div className="rounded-[20px] border border-brand-primary/10 dark:border-white/5 bg-gradient-to-r from-brand-primary/6 to-transparent dark:from-brand-primary/10 dark:to-transparent p-4 transition-colors duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-dark-card flex items-center justify-center text-brand-primary shadow-sm">
                                        {theme === 'dark' ? <MoonStar size={18} /> : <Sun size={18} />}
                                    </div>
                                    <div>
                                        <h3 className="text-sm md:text-base font-black text-gray-900 dark:text-white transition-colors duration-300">Dark mode</h3>
                                        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                            Switch between light and dark themes instantly across the app.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm font-bold shadow-sm hover:text-brand-primary transition-colors"
                                >
                                    {theme === 'dark' ? <Sun size={16} /> : <MoonStar size={16} />}
                                    <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="rounded-[20px] border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-main p-5 transition-colors duration-300">
                            <h3 className="text-base font-black text-gray-900 dark:text-white transition-colors duration-300">Display preference</h3>
                            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                Use this page to switch the interface theme between light and dark mode.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </AccountShell>
    );
};

export default SettingsPage;
