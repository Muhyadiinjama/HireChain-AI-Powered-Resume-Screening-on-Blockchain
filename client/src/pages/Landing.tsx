import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Briefcase,
    CheckCircle2,
    Database,
    Shield,
    Sparkles,
    Upload,
    Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const primaryAction = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role === 'candidate') {
            navigate('/jobs');
            return;
        }

        navigate('/dashboard');
    };

    const secondaryAction = () => {
        if (!user) {
            navigate('/jobs');
            return;
        }

        navigate('/dashboard');
    };

    return (
        <div className="overflow-hidden">
            <section className="relative pt-12 md:pt-24 pb-16 md:pb-32 flex flex-col items-center justify-center text-center px-4 md:px-8">
                <div className="absolute top-0 -z-10 w-full h-full overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[45%] bg-indigo-200/30 rounded-full blur-[120px]" />
                </div>

                <div className="w-full max-w-5xl mx-auto">
                    <div className="inline-flex items-center space-x-2 bg-brand-secondary/10 dark:bg-brand-secondary/20 px-3 py-1.5 rounded-full text-brand-secondary dark:text-brand-secondary font-semibold text-xs sm:text-sm mb-6 md:mb-8 shadow-sm">
                        <Sparkles size={16} />
                        <span>AI-Powered Fair Recruitment</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-7xl font-extrabold tracking-tight-custom text-gray-900 dark:text-white mb-5 md:mb-6 drop-shadow-sm transition-colors duration-300">
                        HireChain <br />
                        <span className="premium-text-gradient">AI-Powered Resume Screening</span>
                    </h1>

                    <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed transition-colors duration-300">
                        Leverage AI to screen resumes without bias. Use blockchain to ensure transparency, data integrity, and recruiter confidence in every hiring decision.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <button
                            onClick={primaryAction}
                            className="premium-gradient text-white w-full sm:w-auto sm:min-w-[210px] px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold flex items-center justify-center space-x-3 shadow-lg hover:scale-105 transition-transform active:scale-95"
                        >
                            <Upload size={18} />
                            <span>Get Started</span>
                        </button>
                        <button
                            onClick={secondaryAction}
                            className="bg-white dark:bg-dark-surface border-2 border-brand-primary/20 dark:border-brand-primary/30 text-gray-700 dark:text-gray-200 w-full sm:w-auto sm:min-w-[210px] px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold flex items-center justify-center space-x-3 hover:bg-gray-50 dark:hover:bg-dark-main transition-colors shadow-sm"
                        >
                            <span>{!user ? 'Explore Jobs' : 'View Workflow'}</span>
                            <ArrowRight size={18} className="text-brand-primary" />
                        </button>
                    </div>

                    <div className="mt-8 md:mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-dark-surface/80 px-3.5 py-2 shadow-sm border border-gray-100 dark:border-gray-800">
                            <Shield size={16} className="text-brand-primary" />
                            <span>Anonymized AI Review</span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-dark-surface/80 px-3.5 py-2 shadow-sm border border-gray-100 dark:border-gray-800">
                            <Database size={16} className="text-brand-secondary" />
                            <span>Verification Ready</span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-dark-surface/80 px-3.5 py-2 shadow-sm border border-gray-100 dark:border-gray-800">
                            <Users size={16} className="text-brand-accent" />
                            <span>Recruiter Decision Flow</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-14 md:py-20 bg-white dark:bg-dark-main transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="max-w-3xl mx-auto mb-12 text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-primary/70">Why HireChain</p>
                        <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                            Built for a more explainable hiring workflow
                        </h2>
                        <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg transition-colors duration-300">
                            This is not only a job board. HireChain gives candidates and hiring teams a workflow that explains what happened during screening and preserves the evidence behind each decision.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                        {[
                            {
                                icon: <Sparkles className="text-brand-secondary" />,
                                title: 'AI-Powered Screening',
                                description: 'Gemini evaluates anonymized resume content against job requirements and returns a structured match result.'
                            },
                            {
                                icon: <Shield className="text-brand-primary" />,
                                title: 'Fairness by Design',
                                description: 'The platform removes identity data before AI analysis and records candidate consent before screening.'
                            },
                            {
                                icon: <Database className="text-brand-accent" />,
                                title: 'Verification Ready',
                                description: 'Screenings generate hashes and verification records that can be anchored to Sepolia for stronger trust.'
                            },
                            {
                                icon: <Users className="text-emerald-600" />,
                                title: 'Recruiter Review',
                                description: 'Recruiters see the result, resume preview, verification data, and decision controls in one review flow.'
                            }
                        ].map((feature) => (
                            <div key={feature.title} className="rounded-[24px] md:rounded-[32px] border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-surface p-5 md:p-7 shadow-sm hover:shadow-xl transition-all">
                                <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-white dark:bg-dark-card flex items-center justify-center shadow-sm">
                                    {feature.icon}
                                </div>
                                <h3 className="mt-4 md:mt-6 text-lg md:text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">{feature.title}</h3>
                                <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-14 md:py-20 bg-primary-50 dark:bg-primary-900/10 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="max-w-3xl mx-auto mb-12 text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-secondary/70">Platform Roles</p>
                        <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                            One platform, three clear user journeys
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                        {[
                            {
                                icon: <Upload className="text-brand-primary" />,
                                title: 'For Candidates',
                                description: 'Apply to jobs, upload a resume, give consent, and receive an AI result with a transparent score and skills feedback.'
                            },
                            {
                                icon: <Briefcase className="text-brand-secondary" />,
                                title: 'For Recruiters',
                                description: 'Publish roles, review applicants, preview resumes, compare scores, and move candidates through accept or reject decisions.'
                            },
                            {
                                icon: <Shield className="text-brand-accent" />,
                                title: 'For Admins',
                                description: 'Monitor candidate pipelines, analytics, fairness benchmarks, verification records, and job activity across the platform.'
                            }
                        ].map((role) => (
                            <div key={role.title} className="rounded-[24px] md:rounded-[32px] bg-white dark:bg-dark-surface border border-primary-100 dark:border-primary-900/30 p-5 md:p-7 shadow-sm transition-colors duration-300">
                                <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gray-50 dark:bg-dark-main flex items-center justify-center">
                                    {role.icon}
                                </div>
                                <h3 className="mt-4 md:mt-6 text-xl md:text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">{role.title}</h3>
                                <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">{role.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-14 md:py-20 bg-white dark:bg-dark-main transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-4 md:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <p className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-primary/70">How It Works</p>
                        <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                            Transparent screening in six steps
                        </h2>
                        <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg transition-colors duration-300">
                            Every application follows the same controlled flow from resume submission to recruiter review.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                        {[
                            { step: '01', title: 'Authenticate', desc: 'Candidates and recruiters sign in through role-aware account access.' },
                            { step: '02', title: 'Upload Resume', desc: 'The candidate submits a resume file and structured application details.' },
                            { step: '03', title: 'Anonymize', desc: 'The system redacts personal identifiers before AI analysis begins.' },
                            { step: '04', title: 'Analyze and Score', desc: 'Gemini returns a match score, matched skills, missing skills, and explanation.' },
                            { step: '05', title: 'Verify', desc: 'A verification record and hash are created for trust and later auditing.' },
                            { step: '06', title: 'Recruiter Review', desc: 'Recruiters inspect the applicant, resume, result, and verification log in one place.' }
                        ].map((step) => (
                            <div key={step.step} className="rounded-[22px] md:rounded-[30px] border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-surface p-5 md:p-6 shadow-sm transition-colors duration-300">
                                <div className="flex items-center justify-between mb-5">
                                    <span className="text-sm font-black text-brand-primary">{step.step}</span>
                                    <CheckCircle2 size={18} className="text-brand-accent" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">{step.title}</h3>
                                <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12 md:py-24">
                <div className="max-w-6xl mx-auto px-4 md:px-8">
                    <div className="premium-gradient rounded-[28px] md:rounded-[42px] p-6 md:p-12 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_40%,#fff,transparent)]" />
                        <div className="relative max-w-3xl">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/70">Ready to Start</p>
                            <h2 className="mt-4 text-2xl md:text-5xl font-black leading-tight">
                                Make your hiring flow more explainable and more professional
                            </h2>
                            <p className="mt-4 md:mt-5 text-base md:text-lg text-primary-100 opacity-90 leading-relaxed">
                                Use HireChain to show how candidates are screened, how trust is preserved, and how recruiters make decisions with stronger evidence.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={primaryAction}
                                    className="bg-white text-brand-primary px-6 py-3 rounded-xl md:rounded-2xl text-sm md:text-base font-black shadow-lg hover:bg-gray-50 transition-colors"
                                >
                                    {!user ? 'Get Started' : user.role === 'candidate' ? 'Browse Jobs' : 'Go to Dashboard'}
                                </button>
                                <button
                                    onClick={() => navigate('/blockchain')}
                                    className="bg-white/15 backdrop-blur-sm border border-white/25 px-6 py-3 rounded-xl md:rounded-2xl text-sm md:text-base font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-3"
                                >
                                    <span>View Verification Explorer</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
