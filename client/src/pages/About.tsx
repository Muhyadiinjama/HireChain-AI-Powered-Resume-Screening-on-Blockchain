import { ArrowRight, Brain, Database, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const About = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-14 space-y-6 md:space-y-8">
            <section className="relative overflow-hidden rounded-[28px] md:rounded-[40px] premium-gradient text-white p-6 md:p-10 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_28%)]" />
                <div className="relative grid gap-6 md:gap-8 xl:grid-cols-[1.15fr_0.85fr] items-stretch">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/14 border border-white/15 px-4 py-2 text-xs sm:text-sm font-black text-white">
                            <Sparkles size={16} />
                            <span>About HireChain</span>
                        </div>
                        <h1 className="mt-5 text-3xl md:text-6xl font-black tracking-tight-custom text-white">
                            A more transparent way to screen resumes
                        </h1>
                        <p className="mt-5 max-w-3xl text-sm md:text-lg leading-relaxed text-white/85">
                            HireChain combines AI-assisted resume screening, privacy-aware review flows, and blockchain-ready verification
                            so hiring teams can move faster without losing fairness, explainability, or trust.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => navigate(user ? '/dashboard' : '/jobs')}
                                className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm md:text-base font-black text-brand-primary shadow-lg hover:bg-gray-50 transition-colors"
                            >
                                <span>{user ? 'Open Dashboard' : 'Explore Jobs'}</span>
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => navigate('/blockchain')}
                                className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm md:text-base font-bold text-white hover:bg-white/15 transition-colors"
                            >
                                <span>Open Blockchain Explorer</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                        {[
                            {
                                icon: <Brain size={18} />,
                                title: 'AI Screening',
                                copy: 'Role-aware analysis with clearer reasoning and skill alignment.'
                            },
                            {
                                icon: <ShieldCheck size={18} />,
                                title: 'Privacy First',
                                copy: 'Anonymized review and candidate consent are part of the workflow.'
                            },
                            {
                                icon: <Database size={18} />,
                                title: 'Verification Ready',
                                copy: 'Evidence and hashes are prepared for stronger trust and auditability.'
                            }
                        ].map((item) => (
                            <div key={item.title} className="rounded-[22px] md:rounded-[28px] border border-white/15 bg-white/10 p-4 md:p-5 backdrop-blur-sm">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14 text-white">
                                    {item.icon}
                                </div>
                                <h2 className="mt-4 text-lg font-black text-white">{item.title}</h2>
                                <p className="mt-2 text-sm leading-6 text-white/80">{item.copy}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid lg:grid-cols-3 gap-4 md:gap-6">
                {[
                    {
                        icon: <Brain className="text-brand-secondary" />,
                        title: 'AI with context',
                        description: 'Resume screening is structured around job requirements so teams can review skills, gaps, role fit, and decision context more clearly.'
                    },
                    {
                        icon: <ShieldCheck className="text-brand-primary" />,
                        title: 'Fairness by design',
                        description: 'Candidate privacy, consent capture, and anonymized analysis are treated as product features rather than afterthoughts.'
                    },
                    {
                        icon: <Database className="text-brand-accent" />,
                        title: 'Verification ready',
                        description: 'HireChain keeps screening results tied to verification metadata so teams can support auditability and stronger hiring trust.'
                    }
                ].map((item) => (
                    <div
                        key={item.title}
                        className="rounded-[22px] md:rounded-[32px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-5 md:p-7 transition-colors duration-300"
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gray-50 dark:bg-dark-main flex items-center justify-center">
                            {item.icon}
                        </div>
                        <h2 className="mt-4 md:mt-5 text-lg md:text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">{item.title}</h2>
                        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300 transition-colors duration-300">{item.description}</p>
                    </div>
                ))}
            </section>

            <section className="grid xl:grid-cols-[1.05fr,0.95fr] gap-4 md:gap-6">
                <div className="rounded-[24px] md:rounded-[36px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-5 md:p-10 transition-colors duration-300">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-secondary/70">How HireChain Works</p>
                    <h2 className="mt-3 text-2xl md:text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                        A practical workflow from application to verified decision
                    </h2>
                    <p className="mt-4 text-sm md:text-base leading-7 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        HireChain is designed as a full hiring workflow, not only a score page. Candidates apply to jobs,
                        share consent, upload their resumes, and receive a structured screening outcome. Recruiters then
                        review the result alongside the resume, status history, and verification details before making a decision.
                    </p>

                    <div className="mt-6 md:mt-8 space-y-4">
                        {[
                            {
                                step: '01',
                                title: 'Job publishing and role setup',
                                copy: 'Recruiters create roles with job details, required skills, department information, and hiring context.'
                            },
                            {
                                step: '02',
                                title: 'Candidate application and consent',
                                copy: 'Applicants upload resumes and confirm consent before the system runs anonymized AI analysis.'
                            },
                            {
                                step: '03',
                                title: 'Screening, scoring, and explanation',
                                copy: 'The platform returns match scores, skill coverage, missing skills, and a readable AI explanation.'
                            },
                            {
                                step: '04',
                                title: 'Verification and recruiter review',
                                copy: 'Hashes and verification metadata support stronger trust while recruiters inspect results and update candidate status.'
                            }
                        ].map((item) => (
                            <div key={item.step} className="rounded-[18px] md:rounded-[28px] bg-gray-50 dark:bg-dark-main p-4 md:p-5 transition-colors duration-300">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary text-sm font-black">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                            {item.copy}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[24px] md:rounded-[36px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-5 md:p-10 transition-colors duration-300">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary/70">Why It Matters</p>
                    <h2 className="mt-3 text-2xl md:text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                        Useful information for teams that want clearer hiring signals
                    </h2>

                    <div className="mt-6 space-y-5">
                        {[
                            {
                                title: 'For candidates',
                                points: 'Candidates get a more understandable process, clearer feedback direction, and stronger confidence that screening is based on role fit rather than personal identity.'
                            },
                            {
                                title: 'For recruiters',
                                points: 'Recruiters save time by seeing structured match data, AI reasoning, and verification context in one place instead of reviewing disconnected tools.'
                            },
                            {
                                title: 'For admins and project owners',
                                points: 'Admins can monitor fairness-related workflow details, oversight signals, and verification readiness across the platform.'
                            },
                            {
                                title: 'For trust and transparency',
                                points: 'Verification metadata helps make each screening event easier to defend, inspect, and explain during review or demonstration.'
                            }
                        ].map((item) => (
                            <div key={item.title} className="rounded-[18px] md:rounded-[28px] border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-main p-4 md:p-5 transition-colors duration-300">
                                <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                    {item.points}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid xl:grid-cols-[1.1fr,0.9fr] gap-4 md:gap-6">
                <div className="rounded-[24px] md:rounded-[36px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-5 md:p-10 transition-colors duration-300">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary/70">What We Built</p>
                    <h2 className="mt-3 text-2xl md:text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                        One connected workflow for candidates, recruiters, and admins
                    </h2>
                    <div className="mt-6 md:mt-8 space-y-4 md:space-y-5">
                        {[
                            'Candidates can explore jobs, upload resumes, give consent, and review screening outcomes in a more understandable flow.',
                            'Recruiters can publish openings, compare applicants, inspect resumes, and track decisions with less manual review overhead.',
                            'Admins can oversee trust, verification, workflow quality, and the overall health of the screening process.'
                        ].map((line) => (
                            <div key={line} className="rounded-[18px] md:rounded-[28px] bg-gray-50 dark:bg-dark-main p-4 md:p-5 transition-colors duration-300">
                                <p className="text-sm leading-7 text-gray-600 dark:text-gray-300 transition-colors duration-300">{line}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[24px] md:rounded-[36px] premium-gradient text-white p-5 md:p-10 shadow-xl">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/70">Core Principles</p>
                    <div className="mt-6 space-y-6">
                        {[
                            { title: 'Explainability', description: 'Hiring decisions should be supported by reasoning that candidates, recruiters, and stakeholders can understand.' },
                            { title: 'Integrity', description: 'Verification data should reinforce confidence and keep evidence attached to the screening workflow.' },
                            { title: 'Usability', description: 'Powerful systems still need interfaces that feel clear, fast, practical, and professional in everyday use.' }
                        ].map((item) => (
                            <div key={item.title} className="rounded-[18px] md:rounded-[28px] bg-white/10 border border-white/15 p-4 md:p-5">
                                <h3 className="text-base md:text-lg font-black">{item.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-white/80">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-[24px] md:rounded-[36px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-5 md:p-10 transition-colors duration-300">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="max-w-2xl">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-secondary/70">Platform Vision</p>
                        <h2 className="mt-3 text-2xl md:text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                            Trust should be visible inside the hiring workflow, not added later
                        </h2>
                        <p className="mt-4 text-gray-600 dark:text-gray-300 leading-7 transition-colors duration-300">
                            HireChain is designed to help teams move from opaque screening toward a process that is fairer,
                            clearer, and easier to defend with evidence. The goal is not only to automate screening,
                            but to make the full decision path easier to inspect, communicate, and improve.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(user ? '/dashboard' : '/jobs')}
                        className="inline-flex items-center justify-center gap-3 rounded-xl md:rounded-2xl premium-gradient text-white px-5 py-3 font-black text-sm md:text-base shadow-lg hover:opacity-95 transition-all"
                    >
                        <Users size={18} />
                        <span>{user ? 'Open Dashboard' : 'Explore Jobs'}</span>
                        <ArrowRight size={18} />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default About;
