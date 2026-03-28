import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    Briefcase,
    CalendarClock,
    Eye,
    Mail,
    MapPin,
    Users
} from 'lucide-react';
import {
    getJobById,
    getJobCandidates
} from '../services/api';
import type { Job, ScreeningRecord } from '../types/models';
import { getApplicationStatusMeta } from '../utils/applicationStatus';

const JobApplicantsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<Job | null>(null);
    const [candidates, setCandidates] = useState<ScreeningRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplicantsPage = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setJob(null);
            setCandidates([]);

            try {
                const [jobResponse, candidatesResponse] = await Promise.all([
                    getJobById(id),
                    getJobCandidates(id)
                ]);

                setJob(jobResponse.data.job);
                const candidatesForCurrentJob = (candidatesResponse.data.candidates || []).filter((candidate: ScreeningRecord) => {
                    const linkedJobId =
                        candidate.candidateId?.jobId?._id ||
                        candidate.candidate?.jobId?._id ||
                        candidate.candidateId?.jobId ||
                        candidate.candidate?.jobId;

                    return linkedJobId === id;
                });

                setCandidates(candidatesForCurrentJob);
            } catch (error) {
                console.error('Failed to load job applicants page:', error);
                toast.error('Unable to load the job applicants page.');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        void fetchApplicantsPage();
    }, [id, navigate]);

    if (!job && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-main transition-colors duration-300 flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">Job not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-main transition-colors duration-300">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
                <div className="rounded-[32px] bg-white dark:bg-dark-surface border border-gray-200/70 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/20 overflow-hidden transition-colors duration-300">
                    <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-6 md:px-8 md:py-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-brand-secondary/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-brand-secondary">
                                    <Users size={12} />
                                    <span>Applicants Page</span>
                                </div>
                                <h1 className="mt-4 text-3xl font-black text-gray-900 dark:text-white">
                                    {job?.title || ''}
                                </h1>
                                <p className="mt-1 text-lg font-bold text-brand-primary">
                                    {job?.company || ''}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="inline-flex items-center gap-2 rounded-2xl bg-gray-50 dark:bg-dark-main px-3 py-2 border border-gray-100 dark:border-gray-800">
                                        <Users size={14} />
                                        {candidates.length} applicant{candidates.length === 1 ? '' : 's'}
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-2xl bg-gray-50 dark:bg-dark-main px-3 py-2 border border-gray-100 dark:border-gray-800">
                                        <Briefcase size={14} />
                                        {job?.type || 'Full-time'}
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-2xl bg-gray-50 dark:bg-dark-main px-3 py-2 border border-gray-100 dark:border-gray-800">
                                        <MapPin size={14} />
                                        {job?.location || 'Remote'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-3xl bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary px-5 py-4 text-white">
                                    <p className="text-xs font-black uppercase tracking-[0.28em] text-white/60">Department</p>
                                    <p className="mt-2 text-lg font-black">{job?.department || 'Not specified'}</p>
                                </div>
                                <div className="rounded-3xl bg-gray-50 dark:bg-dark-main px-5 py-4 border border-gray-100 dark:border-gray-800">
                                    <p className="text-xs font-black uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">Category</p>
                                    <p className="mt-2 text-lg font-black text-gray-900 dark:text-white">{job?.category || 'Not specified'}</p>
                                    {job?.subcategory && (
                                        <p className="mt-1 text-sm font-semibold text-brand-secondary">{job.subcategory}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-6 md:px-8 md:py-8">
                        {candidates.length > 0 ? (
                            <div className="space-y-4">
                                {candidates.map((candidate) => {
                                    const candidateId = candidate.candidateId?._id;
                                    const applicantName = candidate.candidateId?.userId?.name || 'Unnamed Candidate';
                                    const applicantEmail = candidate.candidateId?.userId?.email || candidate.candidateId?.email || 'No email provided';
                                    const status = candidate.candidateId?.applicationStatus || 'pending';
                                    const statusMeta = getApplicationStatusMeta(status);

                                    return (
                                        <div key={candidate._id} className="rounded-[28px] border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-dark-main/60 p-5 shadow-sm transition-colors duration-300">
                                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-black shadow-md">
                                                            {applicantName.charAt(0) || '?'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h2 className="text-lg font-black text-gray-900 dark:text-white">
                                                                {applicantName}
                                                            </h2>
                                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
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

                                                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                                                        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 px-4 py-3">
                                                            <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">Match Score</p>
                                                            <p className="text-lg font-black text-gray-900 dark:text-white">{candidate.score ?? 0}%</p>
                                                        </div>
                                                        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 px-4 py-3">
                                                            <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">Status</p>
                                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${statusMeta.badge}`}>
                                                                {statusMeta.label}
                                                            </span>
                                                        </div>
                                                        <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 px-4 py-3">
                                                            <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">Top Skills</p>
                                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                                {(candidate.skills || []).slice(0, 2).join(', ') || 'No skills extracted'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[156px]">
                                                    <button
                                                        type="button"
                                                        disabled={!candidateId}
                                                        onClick={() => candidateId && navigate(`/applications/${candidateId}/review`)}
                                                        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl premium-gradient px-3.5 py-2 text-xs sm:text-sm text-white font-bold shadow-lg transition-all disabled:opacity-40"
                                                    >
                                                        <Eye size={14} />
                                                        <span>Review Applicant</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={!candidateId}
                                                        onClick={() => candidateId && navigate(`/result/${candidateId}`)}
                                                        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border border-gray-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-gray-700 font-bold hover:text-brand-primary hover:border-brand-primary/30 dark:bg-dark-surface dark:border-gray-700 dark:text-gray-300 transition-all disabled:opacity-40"
                                                    >
                                                        <Briefcase size={14} />
                                                        <span>Open Result Page</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : loading ? (
                            <div />
                        ) : (
                            <div className="rounded-[28px] border border-dashed border-gray-200 dark:border-gray-800 p-14 text-center text-gray-500 dark:text-gray-400">
                                No applicants have applied to this job yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobApplicantsPage;
