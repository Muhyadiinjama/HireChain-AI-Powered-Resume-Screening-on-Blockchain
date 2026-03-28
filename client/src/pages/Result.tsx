import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, XCircle, ChevronRight, Award, Zap } from 'lucide-react';
import { getApplicationResult } from '../services/api';
import FairnessPrivacyPanel from '../components/FairnessPrivacyPanel';
import type { ApplicationResultData } from '../types/models';

const Result = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<ApplicationResultData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            if (!id) return;
            try {
                const res = await getApplicationResult(id);
                setData(res.data);
            } catch (err) {
                console.error('Error fetching result:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    if (loading) return <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] dark:bg-dark-main transition-colors duration-300" />;

    if (!data) return (
        <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] px-4 md:px-6 py-8 md:py-12 dark:bg-dark-main transition-colors duration-300">
            <div className="max-w-5xl mx-auto flex flex-col items-center pt-8 md:pt-12">
                <h2 className="text-2xl font-bold mb-4 dark:text-white transition-colors">Result not found</h2>
            </div>
        </div>
    );

    const { screening, blockchain, job, candidate } = data;
    const screeningScore = screening?.score ?? 0;
    const redactedFields = screening?.redactedFields || [];

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 transition-colors duration-300">
            <div className="text-center mb-10 md:text-center md:mb-16">
                <div className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/30 px-4 md:px-6 py-2 rounded-full text-emerald-600 dark:text-emerald-400 font-bold mb-4 md:mb-6 transition-colors text-xs md:text-base">
                    <Shield size={18} className="md:w-5 md:h-5" />
                    <span>Screening Complete & Verified</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 md:mb-4 transition-colors">Your AI Screening Result</h1>
                <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 font-medium transition-colors">{job?.title} at {job?.company}</p>
                {screening?.anonymizedAnalysis && (
                    <div className="inline-flex items-center space-x-2 mt-5 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full text-xs md:text-sm font-bold">
                        <Shield size={16} />
                        <span>Analyzed in anonymized mode before AI scoring</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Score Card */}
                <div className="bg-white dark:bg-dark-surface p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center transition-colors duration-300">
                    <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="96" cy="96" r="88" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                            <circle cx="96" cy="96" r="88" fill="none" stroke="url(#scoreGradient)" strokeWidth="12"
                                strokeDasharray={553} strokeDashoffset={553 - (553 * screeningScore / 100)}
                                strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#2563EB" />
                                    <stop offset="100%" stopColor="#7C3AED" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white transition-colors">{screeningScore}</span>
                            <span className="text-xs md:text-gray-400 dark:text-gray-500 font-bold transition-colors">MATCH</span>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
                        {screeningScore > 80 ? 'Perfect Match!' : screeningScore > 60 ? 'Strong Candidate' : 'Keep Improving'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 transition-colors">Based on AI analysis of anonymized resume content and the job requirements.</p>
                </div>

                {/* Breakdown Card */}
                <div className="md:col-span-2 space-y-8">
                    {screening?.anonymizedAnalysis && (
                        <div className="bg-blue-50/70 dark:bg-blue-900/20 p-6 rounded-[32px] shadow-sm border border-blue-100 dark:border-blue-900/40 transition-colors duration-300">
                            <h4 className="text-lg font-bold text-brand-primary dark:text-brand-primary mb-3 flex items-center">
                                <Shield size={20} className="mr-3" />
                                Anonymized Screening
                            </h4>
                            <p className="text-sm text-brand-primary/80 dark:text-blue-200 leading-relaxed mb-4">
                                Personal identifiers were removed before the AI reviewed this application. The scoring focused on skills, experience, and role alignment.
                            </p>
                            {redactedFields.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {redactedFields.map((field) => (
                                        <span key={field} className="px-3 py-1 rounded-full bg-white/80 dark:bg-dark-main text-brand-primary dark:text-blue-200 text-xs font-bold border border-blue-100 dark:border-blue-900/40">
                                            {field}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white dark:bg-dark-surface p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center transition-colors">
                            <Award size={22} className="mr-3 text-amber-500" />
                            Skills Analysis
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {screening?.skills?.map((skill: string, i: number) => (
                                <span key={i} className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold border border-emerald-100 dark:border-emerald-800 transition-colors">
                                    <CheckCircle2 size={16} />
                                    <span>{skill}</span>
                                </span>
                            ))}
                            {screening?.missingSkills?.map((skill: string, i: number) => (
                                <span key={i} className="flex items-center space-x-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-4 py-2 rounded-xl font-bold border border-rose-100 dark:border-rose-800 opacity-60 transition-colors">
                                    <XCircle size={16} />
                                    <span>{skill}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-surface p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center transition-colors">
                            <Zap size={22} className="mr-3 text-brand-secondary" />
                            AI Insights
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg transition-colors">
                            {screening?.aiExplanation || 'No detailed explanation provided.'}
                        </p>
                    </div>
                </div>
            </div>

            <FairnessPrivacyPanel
                anonymized={Boolean(screening?.anonymizedAnalysis)}
                consentAccepted={Boolean(candidate?.consentAccepted)}
                consentAcceptedAt={candidate?.consentAcceptedAt}
                verificationStatus={
                    blockchain?.txHash
                        ? `Verification recorded on ${blockchain.network || 'configured network'} with transaction proof available.`
                        : 'Screening hash and verification metadata were generated for this application.'
                }
                auditabilityCopy="Recruiters can trace the score, redacted-field summary, resume preview, and verification record from the same application."
                className="mt-8"
            />

            {/* Blockchain Verification Footer */}
            {blockchain && (
                <div className="mt-12 bg-dark-main dark:bg-[#0f243a] dark:border dark:border-gray-800 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl transition-colors duration-300">
                    <div className="flex items-center space-x-6 mb-6 md:mb-0">
                        <div className="bg-white/10 p-4 rounded-2xl">
                            <Shield size={32} className="text-brand-accent" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1 transition-colors">Blockchain Verification ID</p>
                            <h4 className="text-2xl font-mono font-bold text-brand-accent transition-colors">{blockchain.verificationId}</h4>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <div className="text-right hidden md:block mr-4">
                            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Submission Hash</p>
                            <p className="text-gray-400 text-xs font-mono truncate w-48">{blockchain.hash}</p>
                        </div>
                        <button
                            onClick={() => navigate(`/verify/${blockchain.hash}`)}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 border border-white/10"
                        >
                            <span>View Blockchain Log</span>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-12 text-center">
                <p className="text-xs md:text-gray-400 mb-6 font-medium transition-colors">Verified by decentralized HireChain ledger.</p>
            </div>
        </div>
    );
};

export default Result;
