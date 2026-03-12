import { Briefcase, CalendarClock, Eye, Mail, Users, X } from 'lucide-react';
import type { Job, ScreeningRecord } from '../types/models';
import { getApplicationStatusMeta } from '../utils/applicationStatus';

type JobApplicantsDrawerProps = {
    open: boolean;
    job: Job | null;
    candidates: ScreeningRecord[];
    onClose: () => void;
    onOpenApplicant: (candidateId: string) => void;
};

const JobApplicantsDrawer = ({
    open,
    job,
    candidates,
    onClose,
    onOpenApplicant
}: JobApplicantsDrawerProps) => {
    if (!open || !job) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-4">
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
                onClick={onClose}
                aria-label="Close applicants preview"
            />

            <aside className="relative w-full max-w-4xl h-[100dvh] md:h-auto md:max-h-[calc(100dvh-2rem)] bg-white dark:bg-dark-main md:border border-gray-100 dark:border-gray-800 shadow-2xl overflow-y-auto transition-colors duration-300 rounded-none md:rounded-[32px]">
                <div className="sticky top-0 z-10 bg-white/95 dark:bg-dark-main/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-6 md:px-8 py-5 transition-colors duration-300">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-brand-secondary/10 text-brand-secondary px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide mb-3">
                                <Users size={12} />
                                <span>Applicants Preview</span>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                                {job.title}
                            </h2>
                            <p className="text-base font-bold text-brand-primary dark:text-brand-primary transition-colors duration-300">
                                {job.company || 'HireChain AI'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                {candidates.length} applicant{candidates.length === 1 ? '' : 's'} for this role
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-3 rounded-2xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-dark-surface dark:hover:text-gray-200 transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="px-6 md:px-8 py-6">
                    <div className="rounded-[28px] bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary text-white p-6 shadow-lg mb-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="rounded-3xl bg-white/8 border border-white/10 p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Company</p>
                                <p className="font-black">{job.company || 'HireChain AI'}</p>
                            </div>
                            <div className="rounded-3xl bg-white/8 border border-white/10 p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Role</p>
                                <p className="font-black">{job.title}</p>
                            </div>
                            <div className="rounded-3xl bg-white/8 border border-white/10 p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Department</p>
                                <p className="font-black">{job.department || 'Not specified'}</p>
                            </div>
                            <div className="rounded-3xl bg-white/8 border border-white/10 p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Location</p>
                                <p className="font-black">{job.location || 'Remote'}</p>
                            </div>
                        </div>
                    </div>

                    {candidates.length > 0 ? (
                        <div className="space-y-4">
                            {candidates.map((candidate) => {
                                const candidateId = candidate.candidateId?._id;
                                const applicantName = candidate.candidateId?.userId?.name || 'Unnamed Candidate';
                                const applicantEmail = candidate.candidateId?.userId?.email || candidate.candidateId?.email || 'No email provided';
                                const status = candidate.candidateId?.applicationStatus || 'pending';
                                const statusMeta = getApplicationStatusMeta(status);

                                return (
                                    <div key={candidate._id} className="rounded-[28px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface shadow-sm p-5 transition-colors duration-300">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center font-black shadow-md shrink-0">
                                                        {applicantName.charAt(0) || '?'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">
                                                            {applicantName}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="inline-flex items-center gap-2">
                                                                <Mail size={14} />
                                                                {applicantEmail}
                                                            </span>
                                                            <span className="inline-flex items-center gap-2">
                                                                <CalendarClock size={14} />
                                                                {new Date(candidate.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-3 gap-3 mt-5">
                                                    <div className="rounded-2xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 px-4 py-3 transition-colors duration-300">
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Match Score</p>
                                                        <p className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">
                                                            {candidate.score ?? 0}%
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 px-4 py-3 transition-colors duration-300">
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Status</p>
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide ${statusMeta.badge}`}>
                                                            {statusMeta.label}
                                                        </span>
                                                    </div>
                                                    <div className="rounded-2xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 px-4 py-3 transition-colors duration-300">
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Top Skills</p>
                                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                                            {(candidate.skills || []).slice(0, 2).join(', ') || 'No skills extracted'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 w-full lg:w-auto lg:min-w-[170px]">
                                                <button
                                                    type="button"
                                                    disabled={!candidateId}
                                                    onClick={() => candidateId && onOpenApplicant(candidateId)}
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl premium-gradient text-white font-bold shadow-lg hover:opacity-95 transition-all disabled:opacity-40"
                                                >
                                                    <Eye size={16} />
                                                    <span>Open Application</span>
                                                </button>
                                                <div className="rounded-2xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                    <div className="inline-flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                        <Briefcase size={14} />
                                                        <span>{job.type || 'Full-time'}</span>
                                                    </div>
                                                    <p>{job.company || 'HireChain AI'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-[28px] border border-dashed border-gray-200 dark:border-gray-800 p-14 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            No applicants have applied to this job yet.
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
};

export default JobApplicantsDrawer;
