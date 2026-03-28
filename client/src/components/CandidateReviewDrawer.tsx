import {
    Award,
    Briefcase,
    Building2,
    CalendarClock,
    CheckCircle2,
    Database,
    Download,
    FileBadge2,
    FileText,
    Hash,
    Mail,
    Shield,
    UserRound,
    X
} from 'lucide-react';
import FairnessPrivacyPanel from './FairnessPrivacyPanel';
import type { ApplicationStatus, CandidateReviewData } from '../types/models';
import { getApplicationStatusMeta } from '../utils/applicationStatus';

type CandidateReviewDrawerProps = {
    open: boolean;
    loading: boolean;
    decisionLoading: boolean;
    resumeLoading: boolean;
    resumePreviewUrl: string | null;
    decisionNotes: string;
    data: CandidateReviewData | null;
    onClose: () => void;
    onDecisionNotesChange: (value: string) => void;
    onChangeStatus: (status: ApplicationStatus) => void;
    onDownloadResume: () => void;
    onViewResult: () => void;
    mode?: 'modal' | 'page';
};

const CandidateReviewDrawer = ({
    open,
    loading,
    decisionLoading,
    resumeLoading,
    resumePreviewUrl,
    decisionNotes,
    data,
    onClose,
    onDecisionNotesChange,
    onChangeStatus,
    onDownloadResume,
    onViewResult,
    mode = 'modal'
}: CandidateReviewDrawerProps) => {
    if (mode === 'modal' && !open) {
        return null;
    }

    const isPage = mode === 'page';
    const candidate = data?.candidate;
    const screening = data?.screening;
    const blockchain = data?.blockchain;
    const currentStatus = candidate?.applicationStatus || 'pending';
    const candidateName = candidate?.userId?.name || 'Unnamed Candidate';
    const candidateEmail = candidate?.userId?.email || candidate?.email || 'No email available';
    const jobTitle = candidate?.jobId?.title || 'Unassigned role';
    const company = candidate?.jobId?.company || 'HireChain AI';
    const location = candidate?.jobId?.location || 'Location not specified';
    const employmentType = candidate?.jobId?.type || 'Type not specified';
    const salaryRange = candidate?.jobId?.salaryRange || 'Salary not specified';
    const candidateProfileLines = (candidate?.candidateProfileText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    const canPreviewPdf = Boolean(
        resumePreviewUrl &&
        candidate?.resumeMimeType?.toLowerCase().includes('pdf')
    );
    const screeningScore = screening?.score ?? 0;
    const redactedFields = screening?.redactedFields || [];
    const statusMeta = getApplicationStatusMeta(currentStatus);

    const reviewCard = (
            <aside className={isPage
                ? 'w-full bg-white dark:bg-dark-main border border-gray-100 dark:border-gray-800 shadow-xl overflow-y-auto transition-colors duration-300 rounded-[32px]'
                : 'relative w-full max-w-6xl h-[100dvh] md:h-auto md:max-h-[calc(100dvh-2rem)] bg-white dark:bg-dark-main md:border border-gray-100 dark:border-gray-800 shadow-2xl overflow-y-auto transition-colors duration-300 rounded-none md:rounded-[32px]'
            }>
                <div className="sticky top-0 z-10 bg-white/95 dark:bg-dark-main/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-6 md:px-8 py-5 transition-colors duration-300">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide mb-3">
                                <Shield size={12} />
                                <span>Applicant Review</span>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                                {candidateName}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                {jobTitle} at {company}
                            </p>
                        </div>
                        {!isPage && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-3 rounded-2xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-dark-surface dark:hover:text-gray-200 transition-all"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="px-8 py-12" />
                ) : !candidate ? (
                    <div className="px-8 py-20 text-center">
                        <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            Candidate details could not be loaded.
                        </p>
                    </div>
                ) : (
                    <div className="px-6 md:px-8 py-6 space-y-6">
                        <section className="rounded-[32px] bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary text-white shadow-xl overflow-hidden">
                            <div className="grid lg:grid-cols-[280px_1fr] gap-6 p-6 md:p-8">
                                <div className="rounded-[28px] bg-white/8 border border-white/10 p-6 flex flex-col items-center justify-center text-center">
                                    <div className="relative w-40 h-40 flex items-center justify-center mb-5">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="68"
                                                fill="none"
                                                stroke="url(#candidate-review-score)"
                                                strokeWidth="10"
                                                strokeDasharray={427}
                                                strokeDashoffset={427 - (427 * screeningScore / 100)}
                                                strokeLinecap="round"
                                            />
                                            <defs>
                                                <linearGradient id="candidate-review-score" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#22d3ee" />
                                                    <stop offset="100%" stopColor="#60a5fa" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-5xl font-black">{screeningScore}</span>
                                            <span className="text-xs font-black uppercase tracking-[0.3em] text-white/60">Match</span>
                                        </div>
                                    </div>
                                    <p className="text-lg font-black">
                                        {screeningScore >= 85 ? 'High Priority Candidate' : screeningScore >= 70 ? 'Strong Candidate' : 'Needs Manual Review'}
                                    </p>
                                    <p className="text-sm text-white/65 mt-2">
                                        Profile, AI result, verification record, and resume preview in one place.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="rounded-3xl bg-white/8 border border-white/10 p-5">
                                        <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Application Status</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wide ${statusMeta.badge}`}>
                                            {statusMeta.label}
                                        </span>
                                        <p className="text-sm text-white/65 mt-3">
                                            {statusMeta.description}
                                        </p>
                                    </div>

                                    <div className="rounded-3xl bg-white/8 border border-white/10 p-5">
                                        <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Verification ID</p>
                                        <p className="text-base font-black break-all">
                                            {blockchain?.verificationId || 'Awaiting verification'}
                                        </p>
                                        <p className="text-sm text-white/65 mt-3">
                                            Immutable verification metadata for this screening.
                                        </p>
                                    </div>

                                    <div className="rounded-3xl bg-white/8 border border-white/10 p-5">
                                        <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">AI Screening Mode</p>
                                        <p className="text-base font-black">
                                            {screening?.anonymizedAnalysis ? 'Anonymized' : 'Standard'}
                                        </p>
                                        <p className="text-sm text-white/65 mt-3">
                                            {screening?.anonymizedAnalysis
                                                ? 'Personal identifiers were removed before AI evaluation.'
                                                : 'Legacy screening result without anonymization metadata.'}
                                        </p>
                                    </div>

                                    <div className="rounded-3xl bg-white/8 border border-white/10 p-5">
                                        <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Resume File</p>
                                        <p className="text-base font-black">
                                            {candidate.resumeOriginalName || 'Uploaded resume'}
                                        </p>
                                        <p className="text-sm text-white/65 mt-3">
                                            {candidate.resumeMimeType || 'File type unavailable'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <FairnessPrivacyPanel
                            anonymized={Boolean(screening?.anonymizedAnalysis)}
                            consentAccepted={Boolean(candidate.consentAccepted)}
                            consentAcceptedAt={candidate.consentAcceptedAt}
                            verificationStatus={
                                blockchain?.txHash
                                    ? `Verification anchored on ${blockchain.network || 'configured network'} with transaction metadata available for review.`
                                    : 'Verification hash and screening metadata were stored for recruiter review.'
                            }
                            auditabilityCopy="The application keeps the full AI result, recruiter decision, blockchain verification, and resume preview in one review record."
                        />

                        <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
                            <div className="space-y-6">
                                <section className="rounded-[28px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5 transition-colors duration-300">
                                        Full Applicant Information
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-brand-primary flex items-center justify-center shrink-0">
                                                    <UserRound size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Name</p>
                                                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{candidateName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-brand-secondary flex items-center justify-center shrink-0">
                                                    <Mail size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Email</p>
                                                    <p className="font-bold text-gray-900 dark:text-white break-all transition-colors duration-300">{candidateEmail}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 text-brand-accent flex items-center justify-center shrink-0">
                                                    <Briefcase size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Applied Role</p>
                                                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{jobTitle}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{company}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <CalendarClock size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Applied On</p>
                                                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                                        {new Date(candidate.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0">
                                                    <Building2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Location</p>
                                                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center shrink-0">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Employment Details</p>
                                                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{employmentType}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{salaryRange}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-[28px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                                            <Award size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">
                                                Full AI Result
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                Complete screening explanation and skills breakdown.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mb-5">
                                        <div className="rounded-3xl bg-emerald-50/70 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/40 p-5 transition-colors duration-300">
                                            <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3">Matched Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(screening?.skills || []).length > 0 ? (
                                                    screening?.skills?.map((skill, index) => (
                                                        <span key={`${skill}-${index}`} className="px-3 py-1 rounded-full bg-white dark:bg-dark-main text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-100 dark:border-emerald-900/40">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">No matched skills were returned.</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-3xl bg-rose-50/70 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/40 p-5 transition-colors duration-300">
                                            <p className="text-xs font-black uppercase tracking-widest text-rose-700 dark:text-rose-400 mb-3">Missing Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(screening?.missingSkills || []).length > 0 ? (
                                                    screening?.missingSkills?.map((skill, index) => (
                                                        <span key={`${skill}-${index}`} className="px-3 py-1 rounded-full bg-white dark:bg-dark-main text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-100 dark:border-rose-900/40">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">No missing skills were flagged.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-3">AI Explanation</p>
                                        <p className="text-sm leading-7 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                            {screening?.aiExplanation || 'No AI explanation available.'}
                                        </p>
                                    </div>

                                    {screening?.anonymizedAnalysis && (
                                        <div className="rounded-3xl bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 p-5 transition-colors duration-300">
                                            <p className="text-xs font-black uppercase tracking-widest text-brand-primary dark:text-blue-200 mb-3">
                                                Privacy Protection
                                            </p>
                                            <p className="text-sm text-brand-primary/80 dark:text-blue-100 leading-7 mb-4">
                                                The AI reviewed anonymized resume text only. Recruiters can still inspect the original resume separately in this panel.
                                            </p>
                                            {redactedFields.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {redactedFields.map((field) => (
                                                        <span key={field} className="px-3 py-1 rounded-full bg-white dark:bg-dark-main text-brand-primary dark:text-blue-200 text-xs font-bold border border-blue-100 dark:border-blue-900/40">
                                                            {field}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {(screening?.anonymizationWarnings || []).length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {screening?.anonymizationWarnings?.map((warning, index) => (
                                                        <p key={`${warning}-${index}`} className="text-xs text-blue-700 dark:text-blue-200">
                                                            {warning}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>

                                <section className="rounded-[28px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center">
                                            <Database size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">
                                                Blockchain Result
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                Verification details attached to this resume screening.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4 mb-5">
                                        <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-4 transition-colors duration-300">
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-2">Verification ID</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white break-all transition-colors duration-300">
                                                {blockchain?.verificationId || 'Not available'}
                                            </p>
                                        </div>
                                        <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-4 transition-colors duration-300">
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-2">Recorded At</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white transition-colors duration-300">
                                                {blockchain?.timestamp ? new Date(blockchain.timestamp).toLocaleString() : 'Not available'}
                                            </p>
                                        </div>
                                        <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-4 transition-colors duration-300">
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-2">Verified Candidate</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white transition-colors duration-300">
                                                {candidateName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl bg-slate-950 text-slate-100 p-5 border border-slate-900">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Hash size={18} className="text-cyan-300" />
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Submission Hash</p>
                                        </div>
                                        <p className="font-mono text-sm break-all text-cyan-100">
                                            {blockchain?.hash || 'Not available'}
                                        </p>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section className="rounded-[28px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">
                                                Resume Preview
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                {candidate.resumeOriginalName || 'Uploaded resume'}
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={onDownloadResume}
                                                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-dark-main text-gray-700 dark:text-gray-300 font-bold hover:text-brand-primary transition-all"
                                            >
                                                <Download size={16} />
                                                <span>{canPreviewPdf ? 'Download PDF' : 'Open Resume'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={onViewResult}
                                                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl premium-gradient text-white font-bold shadow-lg hover:opacity-95 transition-all"
                                            >
                                                <FileText size={16} />
                                                <span>Standalone Result</span>
                                            </button>
                                        </div>
                                    </div>

                                    {resumeLoading ? (
                                        <div className="h-[520px] rounded-[24px] border border-dashed border-gray-200 dark:border-gray-800 transition-colors duration-300" />
                                    ) : canPreviewPdf ? (
                                        <iframe
                                            src={resumePreviewUrl || ''}
                                            title="Candidate resume preview"
                                            className="w-full h-[640px] rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white"
                                        />
                                    ) : (
                                        <div className="h-[260px] rounded-[24px] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center px-6 transition-colors duration-300">
                                            <FileBadge2 size={28} className="text-gray-400 mb-4" />
                                            <p className="font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                                                Inline preview is available for PDF resumes
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                This file type can still be opened or downloaded from the button above.
                                            </p>
                                        </div>
                                    )}
                                </section>

                                <section className="rounded-[28px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5 transition-colors duration-300">
                                        Applicant Notes And Decision
                                    </h3>

                                    {candidateProfileLines.length > 0 ? (
                                        <div className="grid gap-3 mb-5">
                                            {candidateProfileLines.map((line, index) => (
                                                <div key={`${line}-${index}`} className="rounded-2xl bg-gray-50 dark:bg-dark-main px-4 py-3 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                                    {line}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 transition-colors duration-300">
                                            No structured profile notes were saved with this application.
                                        </p>
                                    )}

                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-2">
                                        Decision Notes
                                    </label>
                                    <textarea
                                        value={decisionNotes}
                                        onChange={(event) => onDecisionNotesChange(event.target.value)}
                                        rows={4}
                                        className="w-full rounded-2xl bg-gray-50 dark:bg-dark-main border-none px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary transition-all"
                                        placeholder="Add a professional note for the hiring decision..."
                                    />

                                    <div className="flex flex-wrap gap-3 mt-5">
                                        <button
                                            type="button"
                                            disabled={decisionLoading}
                                            onClick={() => onChangeStatus('shortlisted')}
                                            className={`px-5 py-3 rounded-2xl font-bold transition-all disabled:opacity-60 ${getApplicationStatusMeta('shortlisted').button}`}
                                        >
                                            Shortlist
                                        </button>
                                        <button
                                            type="button"
                                            disabled={decisionLoading}
                                            onClick={() => onChangeStatus('interview')}
                                            className={`px-5 py-3 rounded-2xl font-bold transition-all disabled:opacity-60 ${getApplicationStatusMeta('interview').button}`}
                                        >
                                            Move to Interview
                                        </button>
                                        <button
                                            type="button"
                                            disabled={decisionLoading}
                                            onClick={() => onChangeStatus('accepted')}
                                            className={`px-5 py-3 rounded-2xl font-bold transition-all disabled:opacity-60 ${getApplicationStatusMeta('accepted').button}`}
                                        >
                                            Accept Applicant
                                        </button>
                                        <button
                                            type="button"
                                            disabled={decisionLoading}
                                            onClick={() => onChangeStatus('rejected')}
                                            className={`px-5 py-3 rounded-2xl font-bold transition-all disabled:opacity-60 ${getApplicationStatusMeta('rejected').button}`}
                                        >
                                            Reject Applicant
                                        </button>
                                        <button
                                            type="button"
                                            disabled={decisionLoading}
                                            onClick={() => onChangeStatus('pending')}
                                            className={`px-5 py-3 rounded-2xl font-bold transition-all disabled:opacity-60 ${getApplicationStatusMeta('pending').button}`}
                                        >
                                            Mark Pending
                                        </button>
                                    </div>

                                    {candidate.reviewedAt && (
                                        <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                            <CheckCircle2 size={14} />
                                            <span>Last reviewed {new Date(candidate.reviewedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
    );

    if (isPage) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-main transition-colors duration-300">
                <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
                    {reviewCard}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-4">
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
                onClick={onClose}
                aria-label="Close candidate review"
            />
            {reviewCard}
        </div>
    );
};

export default CandidateReviewDrawer;
