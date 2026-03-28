import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Users, Briefcase, ChevronDown, ChevronRight, Search, Filter,
    FileText, TrendingUp, Eye,
    CheckCircle, MapPin, Edit2, Trash2,
    Shield, Clock, Download, Database,
    Upload, DollarSign, Building2, BarChart3, X
} from 'lucide-react';
import {
    deleteJob,
    getAllCandidates,
    getJobs,
    getMyApplications,
    updateJob
} from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import blackLogo from '../assets/logos/black-logo.png';
import whiteLogo from '../assets/logos/white-logo.png';
import type {
    ApplicationRecord,
    ApplicationStatus,
    Job,
    JobStatus,
    ScreeningRecord
} from '../types/models';
import {
    applicationStatusOptions,
    getApplicationStatusMeta,
    scoreBandOptions
} from '../utils/applicationStatus';
import {
    buildCandidatePipelineByJob,
    buildDailyTrend,
    buildDecisionCounts,
    buildDepartmentStats,
    buildFairnessAlerts,
    buildSkillFrequency,
    emptyRecruiterCandidateFilters,
    filterRecruiterCandidates,
    type RecruiterCandidateFilters
} from '../utils/dashboardAnalytics';

type DashboardTab = 'browse' | 'history' | 'jobs' | 'candidates';

type DashboardStat = {
    icon: ReactNode;
    label: string;
    value: number | string;
    bg: string;
    badge: string;
};

const Dashboard = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<ApplicationRecord[]>([]);
    const [recruiterCandidates, setRecruiterCandidates] = useState<ScreeningRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<DashboardTab>('browse');
    const [searchQuery, setSearchQuery] = useState('');
    const [candidateFilters, setCandidateFilters] = useState<RecruiterCandidateFilters>(emptyRecruiterCandidateFilters);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (user?.role === 'recruiter' || user?.role === 'admin') {
            setActiveTab('jobs');
        } else if (user?.role === 'candidate') {
            setActiveTab('browse');
        }
    }, [user]);

    const fetchData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            setIsRefreshing(false);
            return;
        }

        setLoading(true);
        try {
            if (user.role === 'recruiter' || user.role === 'admin') {
                const [jobsRes, candRes] = await Promise.all([
                    getJobs(),
                    getAllCandidates()
                ]);
                setJobs(jobsRes.data.jobs);
                setRecruiterCandidates(candRes.data.candidates);
            } else {
                const [jobsRes, appsRes] = await Promise.all([
                    getJobs(),
                    getMyApplications()
                ]);
                setJobs(jobsRes.data.jobs);
                setApplications(appsRes.data.applications);
            }
        } catch (err) {
            console.error(err);
            toast.error('Unable to load dashboard data right now.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [user]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        void fetchData();
    };

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const downloadBlobFile = (content: BlobPart, fileName: string, type: string) => {
        const blob = new Blob([content], { type });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1500);
    };

    const handleExport = () => {
        const headers = ['Candidate', 'Email', 'Position', 'Department', 'Match Score', 'Status', 'Skills', 'Date'];
        const csvContent = [
            headers.join(','),
            ...filteredRecruiterCandidates.map(c => [
                c.candidateId?.userId?.name,
                c.candidateId?.userId?.email || c.candidateId?.email,
                c.candidateId?.jobId?.title,
                c.candidateId?.jobId?.department,
                `${c.score}%`,
                c.candidateId?.applicationStatus || 'pending',
                (c.skills || []).join(';'),
                new Date(c.createdAt).toISOString().split('T')[0]
            ].join(','))
        ].join('\n');

        downloadBlobFile(csvContent, 'candidates_export.csv', 'text/csv;charset=utf-8;');
    };

    const handleExportAuditCsv = () => {
        const headers = ['Candidate', 'Role', 'Company', 'Status', 'Score', 'Verification ID', 'Hash', 'Transaction Hash', 'Reviewed At'];
        const csvContent = [
            headers.join(','),
            ...filteredRecruiterCandidates.map((candidate) => [
                candidate.candidateId?.userId?.name || 'Unnamed Candidate',
                candidate.candidateId?.jobId?.title || 'Unassigned role',
                candidate.candidateId?.jobId?.company || '',
                candidate.candidateId?.applicationStatus || 'pending',
                `${candidate.score || 0}%`,
                candidate.blockchain?.verificationId || '',
                candidate.blockchain?.hash || '',
                candidate.blockchain?.txHash || '',
                candidate.candidateId?.reviewedAt ? new Date(candidate.candidateId.reviewedAt).toLocaleString() : ''
            ].map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        downloadBlobFile(csvContent, 'candidate_audit_log.csv', 'text/csv;charset=utf-8;');
    };

    const handleExportAuditReport = () => {
        const reportWindow = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=900');
        if (!reportWindow) {
            toast.error('Please allow pop-ups to export the audit report.');
            return;
        }

        const reportRows = filteredRecruiterCandidates.map((candidate) => `
            <tr>
                <td>${candidate.candidateId?.userId?.name || 'Unnamed Candidate'}</td>
                <td>${candidate.candidateId?.jobId?.title || 'Unassigned role'}</td>
                <td>${candidate.candidateId?.applicationStatus || 'pending'}</td>
                <td>${candidate.score || 0}%</td>
                <td>${candidate.blockchain?.verificationId || '-'}</td>
                <td>${candidate.blockchain?.txHash || '-'}</td>
            </tr>
        `).join('');

        reportWindow.document.write(`
            <html>
                <head>
                    <title>HireChain Audit Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
                        h1, h2 { margin: 0 0 12px; }
                        .meta { margin-bottom: 24px; color: #4b5563; }
                        .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
                        .card { border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
                        th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 13px; }
                        th { background: #f9fafb; }
                    </style>
                </head>
                <body>
                    <h1>HireChain Candidate Audit Report</h1>
                    <p class="meta">Generated ${new Date().toLocaleString()}</p>
                    <div class="cards">
                        <div class="card"><strong>Screened Candidates</strong><div>${filteredRecruiterCandidates.length}</div></div>
                        <div class="card"><strong>Pending</strong><div>${decisionCounts.pending}</div></div>
                        <div class="card"><strong>Shortlisted + Interview</strong><div>${decisionCounts.shortlisted + decisionCounts.interview}</div></div>
                        <div class="card"><strong>Fairness Alerts</strong><div>${fairnessAlerts.length}</div></div>
                    </div>
                    <h2>Candidate Verification Trail</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Score</th>
                                <th>Verification ID</th>
                                <th>Transaction Hash</th>
                            </tr>
                        </thead>
                        <tbody>${reportRows || '<tr><td colspan="6">No candidate audit rows available.</td></tr>'}</tbody>
                    </table>
                </body>
            </html>
        `);
        reportWindow.document.close();
        reportWindow.focus();
        reportWindow.print();
    };

    const handleStatusToggle = async (jobId: string, currentStatus: JobStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
        try {
            await updateJob(jobId, { status: newStatus });
            setJobs(jobs.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await deleteJob(jobId);
            setJobs(jobs.filter(j => j._id !== jobId));
            toast.success('Job deleted successfully');
        } catch (err) {
            console.error('Failed to delete job:', err);
            toast.error('Failed to delete job');
        }
    };

    const getApplicantsForJob = useCallback((jobId: string) => {
        return recruiterCandidates.filter((candidate) => {
            const linkedJobId = candidate.candidateId?.jobId?._id || candidate.candidateId?.jobId;
            return linkedJobId === jobId;
        });
    }, [recruiterCandidates]);

    if (!user) return null;

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const recruiterManagedJobs = jobs.filter((job) =>
        user.role === 'admin' || (typeof job.createdBy === 'string' ? job.createdBy === user._id : job.createdBy?._id === user._id)
    );

    const filteredRecruiterCandidates = filterRecruiterCandidates(recruiterCandidates, candidateFilters);
    const scoreDistribution = [
        {
            label: '0-49',
            count: recruiterCandidates.filter((candidate) => (candidate.score || 0) < 50).length,
            tone: 'from-rose-500 to-orange-400'
        },
        {
            label: '50-69',
            count: recruiterCandidates.filter((candidate) => (candidate.score || 0) >= 50 && (candidate.score || 0) < 70).length,
            tone: 'from-amber-500 to-yellow-400'
        },
        {
            label: '70-84',
            count: recruiterCandidates.filter((candidate) => (candidate.score || 0) >= 70 && (candidate.score || 0) < 85).length,
            tone: 'from-sky-500 to-brand-primary'
        },
        {
            label: '85-100',
            count: recruiterCandidates.filter((candidate) => (candidate.score || 0) >= 85).length,
            tone: 'from-emerald-500 to-brand-accent'
        }
    ];
    const maxScoreBucketCount = Math.max(...scoreDistribution.map((bucket) => bucket.count), 1);

    const decisionCounts = buildDecisionCounts(recruiterCandidates);
    const topMatchedSkills = buildSkillFrequency(recruiterCandidates, (candidate) => candidate.skills);
    const topMissingSkills = buildSkillFrequency(recruiterCandidates, (candidate) => candidate.missingSkills);
    const candidatePipelineByJob = buildCandidatePipelineByJob(recruiterManagedJobs, recruiterCandidates);
    const dailyTrend = buildDailyTrend(recruiterCandidates);
    const departmentStats = buildDepartmentStats(recruiterManagedJobs, recruiterCandidates);
    const totalRecruiterCandidates = recruiterCandidates.length;
    const formatPercent = (value: number, total: number) => `${total ? Math.round((value / total) * 100) : 0}%`;
    const anonymizedCoverageCount = recruiterCandidates.filter((candidate) => candidate.anonymizedAnalysis).length;
    const consentCoverageCount = recruiterCandidates.filter((candidate) => candidate.candidateId?.consentAccepted).length;
    const averageRedactedFields = totalRecruiterCandidates
        ? (recruiterCandidates.reduce((acc, candidate) => acc + (candidate.redactedFields?.length || 0), 0) / totalRecruiterCandidates).toFixed(1)
        : '0.0';
    const fairnessAlerts = buildFairnessAlerts(recruiterCandidates);
    const fairnessAlertCount = fairnessAlerts.length;
    const fairnessBands = [
        {
            label: 'High Match',
            range: '85-100',
            note: 'These candidates should normally be accepted or manually reviewed, not rejected outright.',
            candidates: recruiterCandidates.filter((candidate) => (candidate.score || 0) >= 85)
        },
        {
            label: 'Review Band',
            range: '70-84',
            note: 'This is the balanced manual-review zone for recruiters.',
            candidates: recruiterCandidates.filter((candidate) => (candidate.score || 0) >= 70 && (candidate.score || 0) < 85)
        },
        {
            label: 'Development Band',
            range: '0-69',
            note: 'Lower scores can still be reviewed for transferable skills and growth potential.',
            candidates: recruiterCandidates.filter((candidate) => (candidate.score || 0) < 70)
        }
    ].map((band) => {
            const decisions = band.candidates.reduce(
                (acc, candidate) => {
                    const status = candidate.candidateId?.applicationStatus || 'pending';
                    acc[status] += 1;
                    return acc;
                },
                { pending: 0, shortlisted: 0, interview: 0, accepted: 0, rejected: 0 } as Record<ApplicationStatus, number>
            );

            return {
                ...band,
                total: band.candidates.length,
            ...decisions
        };
    });

    const recruiterStats: DashboardStat[] = [
        { icon: <Users className="text-brand-primary" />, label: 'Total Candidates', value: recruiterCandidates.length, bg: 'bg-blue-50', badge: recruiterCandidates.length > 0 ? `+${Math.floor(recruiterCandidates.length / 2)} this week` : '' },
        { 
            icon: <TrendingUp className="text-emerald-600" />, 
            label: 'Avg. Match Score', 
            value: recruiterCandidates.length > 0 ? `${Math.round(recruiterCandidates.reduce((acc, c) => acc + (c.score || 0), 0) / recruiterCandidates.length)}%` : '0%', 
            bg: 'bg-emerald-50', 
            badge: 'Excellent' 
        },
        { icon: <img src={theme === 'dark' ? blackLogo : whiteLogo} alt="Logo" className="w-6 h-6 object-contain" />, label: 'Verified Today', value: recruiterCandidates.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length, bg: 'bg-purple-50', badge: 'Immutable' },
        {
            icon: <Clock className="text-brand-accent" />,
            label: 'Pending Review',
            value: recruiterCandidates.filter(c => (c.candidateId?.applicationStatus || 'pending') === 'pending').length,
            bg: 'bg-orange-50',
            badge: 'Priority'
        },
    ];
    const candidateStatusCounts = applications.reduce<Record<ApplicationStatus, number>>(
        (acc, application) => {
            const status = application.applicationStatus || 'pending';
            acc[status] += 1;
            return acc;
        },
        { pending: 0, shortlisted: 0, interview: 0, accepted: 0, rejected: 0 }
    );

    const candidateStats: DashboardStat[] = [
        { icon: <FileText className="text-brand-primary" />, label: 'Applications Sent', value: applications.length, bg: 'bg-blue-50', badge: '' },
        { 
            icon: <TrendingUp className="text-emerald-600" />, 
            label: 'Avg. Match Score', 
            value: applications.length > 0 ? `${Math.round(applications.reduce((acc, a) => acc + (a.screening?.score || 0), 0) / applications.length)}%` : '0%', 
            bg: 'bg-emerald-50', 
            badge: '' 
        },
        { icon: <Eye className="text-brand-secondary" />, label: 'Interviews', value: candidateStatusCounts.interview, bg: 'bg-purple-50', badge: '' },
        { icon: <CheckCircle className="text-brand-accent" />, label: 'Success Rate', value: applications.length > 0 ? `${Math.round((candidateStatusCounts.accepted / applications.length) * 100)}%` : '0%', bg: 'bg-gray-50', badge: '' },
    ];

    const currentStats: DashboardStat[] = user.role === 'admin' ? recruiterStats : (user.role === 'recruiter' ? recruiterStats : candidateStats);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-12 space-y-4 md:space-y-6 lg:space-y-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight-custom text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                        {user.role === 'admin' ? 'Admin Dashboard' : (user.role === 'recruiter' ? 'Recruiter Dashboard' : 'Candidate Dashboard')}
                    </h1>
                    <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">
                        {user.role === 'admin'
                            ? 'Complete platform oversight and system-wide analytics'
                            : user.role === 'recruiter'
                                ? 'Manage and review AI-screened candidates'
                                : 'Find your next opportunity with AI-powered matching'}
                    </p>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                    {(user.role === 'recruiter' || user.role === 'admin') && (
                        <button
                            onClick={() => navigate('/create-job')}
                            className="flex-1 md:flex-none bg-brand-primary text-white px-5 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-brand-primary/95 transition-all active:scale-95 text-sm md:text-base"
                        >
                            <Plus size={20} />
                            <span>Post New Job</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
                {currentStats.map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            handleRefresh();
                            if (user.role === 'recruiter' || user.role === 'admin') {
                                if (stat.label === 'Total Candidates' || stat.label === 'Pending Review' || stat.label === 'Avg. Match Score') {
                                    setActiveTab('candidates');
                                } else if (stat.label === 'Verified Today') {
                                    document.getElementById('transparency-log')?.scrollIntoView({ behavior: 'smooth' });
                                }
                            } else {
                                if (stat.label === 'Applications Sent' || stat.label === 'Avg. Match Score') {
                                    setActiveTab('history');
                                }
                            }
                        }}
                        className={`bg-white dark:bg-dark-surface p-4 md:p-6 rounded-[22px] md:rounded-[32px] border border-gray-50 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all cursor-pointer active:scale-95`}
                    >
                        <div className={`absolute inset-0 bg-white/20 dark:bg-dark-main/20 backdrop-blur-[1px] flex items-center justify-center opacity-0 transition-opacity ${isRefreshing ? 'opacity-100' : 'pointer-events-none'}`}>
                            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div className="flex items-start justify-between mb-3 md:mb-4">
                            <div className="bg-gray-50 dark:bg-dark-main w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white dark:group-hover:bg-dark-card transition-all">
                                {stat.icon}
                            </div>
                            {stat.badge && (
                                <span className="hidden sm:inline-block text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2.5 py-1 rounded-lg border border-white dark:border-gray-700">
                                    {stat.badge}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-1 transition-colors duration-300">{stat.label}</p>
                            <h4 className={`text-xl md:text-3xl font-black text-gray-900 dark:text-white group-hover:translate-x-1 transition-all duration-300 ${isRefreshing ? 'blur-sm grayscale opacity-50' : ''}`}>{stat.value}</h4>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                        </div>
                    </div>
                ))}
            </div>

            {(user.role === 'recruiter' || user.role === 'admin') && !loading && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
                    <section className="xl:col-span-5 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm transition-colors duration-300">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-primary/70">Score Distribution</p>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">AI Match Score Spread</h3>
                            </div>
                            <div className="rounded-2xl bg-brand-primary/10 px-4 py-2 text-sm font-black text-brand-primary">
                                {recruiterCandidates.length} screened
                            </div>
                        </div>
                        <div className="space-y-4">
                            {scoreDistribution.map((bucket) => (
                                <div key={bucket.label}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors duration-300">{bucket.label}%</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-white transition-colors duration-300">{bucket.count}</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-gray-100 dark:bg-dark-main overflow-hidden transition-colors duration-300">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${bucket.tone}`}
                                            style={{ width: `${Math.max((bucket.count / maxScoreBucketCount) * 100, bucket.count ? 18 : 0)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="xl:col-span-3 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm transition-colors duration-300">
                        <div className="mb-6">
                            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-accent/70">Decision Overview</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">Application Status</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                {
                                    label: 'Pending',
                                    value: decisionCounts.pending,
                                    className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300'
                                },
                                {
                                    label: 'Shortlisted',
                                    value: decisionCounts.shortlisted,
                                    className: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300'
                                },
                                {
                                    label: 'Interview',
                                    value: decisionCounts.interview,
                                    className: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300'
                                },
                                {
                                    label: 'Accepted',
                                    value: decisionCounts.accepted,
                                    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                                },
                                {
                                    label: 'Rejected',
                                    value: decisionCounts.rejected,
                                    className: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300'
                                }
                            ].map((item) => (
                                <div key={item.label} className={`rounded-3xl border p-4 ${item.className} transition-colors duration-300`}>
                                    <p className="text-xs font-black uppercase tracking-[0.25em]">{item.label}</p>
                                    <p className="mt-2 text-3xl font-black">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="xl:col-span-4 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm transition-colors duration-300">
                        <div className="mb-6">
                            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-secondary/70">Skills Intelligence</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">Top Strengths and Gaps</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400 mb-3 transition-colors duration-300">Top Skills</p>
                                <div className="space-y-3">
                                    {topMatchedSkills.length ? topMatchedSkills.map(([skill, count]) => (
                                        <div key={skill} className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-dark-main px-4 py-3 transition-colors duration-300">
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">{skill}</span>
                                            <span className="text-xs font-black text-brand-primary">{count}</span>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors duration-300">No matched skills yet.</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400 mb-3 transition-colors duration-300">Missing Skills</p>
                                <div className="space-y-3">
                                    {topMissingSkills.length ? topMissingSkills.map(([skill, count]) => (
                                        <div key={skill} className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-dark-main px-4 py-3 transition-colors duration-300">
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">{skill}</span>
                                            <span className="text-xs font-black text-brand-secondary">{count}</span>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors duration-300">No missing-skill trend yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="xl:col-span-12 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm transition-colors duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-primary/70">Candidate Pipeline</p>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">Applicants Per Job</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                Company profile sync is active for all recruiter/admin jobs.
                            </p>
                        </div>
                            <div className="space-y-4">
                                {candidatePipelineByJob.length ? candidatePipelineByJob.map((entry) => (
                                <div
                                    key={entry.job._id}
                                    className="rounded-[28px] border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-dark-main/70 p-5 transition-colors duration-300"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">{entry.job.title}</p>
                                            <p className="text-sm font-semibold text-brand-primary">{entry.job.company || user.company || 'HireChain AI'}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-wide">
                                            <span className="rounded-full bg-white dark:bg-dark-surface px-3 py-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                                {entry.total} applicants
                                            </span>
                                            <span className="rounded-full bg-brand-primary/10 px-3 py-2 text-brand-primary">
                                                Avg. {entry.averageScore}%
                                            </span>
                                            <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                                                Pending {entry.pending}
                                            </span>
                                            <span className="rounded-full bg-sky-50 px-3 py-2 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
                                                Shortlisted {entry.shortlisted}
                                            </span>
                                            <span className="rounded-full bg-violet-50 px-3 py-2 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300">
                                                Interview {entry.interview}
                                            </span>
                                            <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                                Accepted {entry.accepted}
                                            </span>
                                            <span className="rounded-full bg-rose-50 px-3 py-2 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                                                Rejected {entry.rejected}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="rounded-[28px] border border-dashed border-gray-200 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500 transition-colors duration-300">
                                    Analytics will appear here once candidates start applying to your jobs.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="xl:col-span-6 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm transition-colors duration-300">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-primary/70">Trend Chart</p>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">Screenings Over Time</h3>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-2xl bg-gray-50 dark:bg-dark-main px-4 py-2 text-sm font-black text-gray-600 dark:text-gray-300">
                                <BarChart3 size={16} />
                                <span>Last 7 days</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                            {dailyTrend.map((entry) => {
                                const height = Math.max(entry.count * 28, entry.count ? 44 : 16);
                                return (
                                    <div key={entry.label} className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-4 transition-colors duration-300">
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{entry.label}</p>
                                        <div className="mt-4 h-32 flex items-end">
                                            <div
                                                className="w-full rounded-2xl bg-gradient-to-t from-brand-primary via-brand-secondary to-brand-accent"
                                                style={{ height }}
                                            />
                                        </div>
                                        <p className="mt-4 text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">{entry.count}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                            Avg. score {entry.averageScore}%
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="xl:col-span-6 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm transition-colors duration-300">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-secondary/70">Department View</p>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">Applicant Flow by Department</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                Compare volume, score quality, and recruiter progress.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {departmentStats.length ? departmentStats.map((department) => (
                                <div key={department.department} className="rounded-[28px] border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-dark-main/70 p-5 transition-colors duration-300">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">{department.department}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                {department.applicants} applicants with average score {department.averageScore}%
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs font-black uppercase">
                                            <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">Pending {department.pending}</span>
                                            <span className="rounded-full bg-sky-50 px-3 py-2 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">Shortlisted {department.shortlisted}</span>
                                            <span className="rounded-full bg-violet-50 px-3 py-2 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300">Interview {department.interview}</span>
                                            <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">Accepted {department.accepted}</span>
                                            <span className="rounded-full bg-rose-50 px-3 py-2 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">Rejected {department.rejected}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="rounded-[28px] border border-dashed border-gray-200 dark:border-gray-800 p-10 text-center text-gray-400 dark:text-gray-500 transition-colors duration-300">
                                    Department analytics will appear after more applications are screened.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {(user.role === 'recruiter' || user.role === 'admin') && !loading && (
                <section className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 md:p-7 shadow-sm mb-8 transition-colors duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-secondary/70">Fairness Benchmarking</p>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                                Bias Safeguards and Review Consistency
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                These metrics show whether anonymized screening, candidate consent, and recruiter decisions stay aligned with fair-review controls.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-brand-secondary/10 px-4 py-2 text-sm font-black text-brand-secondary">
                            {fairnessAlertCount} fairness alerts to review
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/90 dark:bg-dark-main/70 p-5 transition-colors duration-300">
                            <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                                <Shield size={18} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Anonymized Coverage</p>
                            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                                {formatPercent(anonymizedCoverageCount, totalRecruiterCandidates)}
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                {anonymizedCoverageCount} of {totalRecruiterCandidates} screenings ran in anonymized mode.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/90 dark:bg-dark-main/70 p-5 transition-colors duration-300">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center mb-4">
                                <CheckCircle size={18} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Consent Coverage</p>
                            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                                {formatPercent(consentCoverageCount, totalRecruiterCandidates)}
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                Explicit candidate consent captured before screening and verification.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/90 dark:bg-dark-main/70 p-5 transition-colors duration-300">
                            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-4">
                                <Database size={18} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Redaction Depth</p>
                            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                                {averageRedactedFields}
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                Average personal-identifier fields removed per screening.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/90 dark:bg-dark-main/70 p-5 transition-colors duration-300">
                            <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center mb-4">
                                <TrendingUp size={18} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Manual Review Safeguard</p>
                            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                                {formatPercent(decisionCounts.pending, totalRecruiterCandidates)}
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                Applications still pending recruiter review instead of forced automatic decisions.
                            </p>
                        </div>
                    </div>

                    <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
                        <div className="rounded-[28px] border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-dark-main/70 p-5 transition-colors duration-300">
                            <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                                Decision Consistency by Score Band
                            </h4>
                            <div className="space-y-4">
                                {fairnessBands.map((band) => (
                                    <div key={band.label} className="rounded-3xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 p-4 transition-colors duration-300">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white transition-colors duration-300">
                                                    {band.label} <span className="text-brand-primary">({band.range})</span>
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                    {band.note}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-black text-brand-primary">
                                                {band.total} candidates
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 text-sm">
                                            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-3 text-amber-700 dark:text-amber-300">
                                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Pending</p>
                                                <p className="mt-1 text-2xl font-black">{band.pending}</p>
                                            </div>
                                            <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/30 p-3 text-sky-700 dark:text-sky-300">
                                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Shortlisted</p>
                                                <p className="mt-1 text-2xl font-black">{band.shortlisted}</p>
                                            </div>
                                            <div className="rounded-2xl bg-violet-50 dark:bg-violet-950/30 p-3 text-violet-700 dark:text-violet-300">
                                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Interview</p>
                                                <p className="mt-1 text-2xl font-black">{band.interview}</p>
                                            </div>
                                            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-3 text-emerald-700 dark:text-emerald-300">
                                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Accepted</p>
                                                <p className="mt-1 text-2xl font-black">{band.accepted}</p>
                                            </div>
                                            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 p-3 text-rose-700 dark:text-rose-300">
                                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Rejected</p>
                                                <p className="mt-1 text-2xl font-black">{band.rejected}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-dark-main/70 p-5 transition-colors duration-300">
                            <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                                Fairness Watchlist
                            </h4>
                            <div className="rounded-3xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Decision Anomalies</p>
                                <p className="mt-2 text-4xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                                    {fairnessAlertCount}
                                </p>
                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                    Alerts count applications with a low score accepted below 60% or a high score rejected at 80% and above. These are not always wrong, but they are the best places to inspect for consistency.
                                </p>
                            </div>

                            <div className="mt-4 rounded-3xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Why This Matters</p>
                                <ul className="mt-3 space-y-3 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                    <li>Anonymized screening reduces the chance that identity data influences the AI score.</li>
                                    <li>Consent tracking makes the data-processing step explicit and auditable.</li>
                                    <li>Score-band monitoring helps reviewers explain decisions and spot inconsistent outcomes.</li>
                                </ul>
                            </div>

                            <div className="mt-4 rounded-3xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Flagged Applications</p>
                                <div className="mt-3 space-y-3">
                                    {fairnessAlerts.length ? fairnessAlerts.slice(0, 4).map((candidate) => (
                                        <div key={candidate._id} className="rounded-2xl bg-gray-50 dark:bg-dark-main px-4 py-3 transition-colors duration-300">
                                            <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                                {candidate.candidateId?.userId?.name || 'Unnamed Candidate'}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                {candidate.candidateId?.jobId?.title || 'Unassigned role'} · {candidate.score || 0}% · {getApplicationStatusMeta(candidate.candidateId?.applicationStatus || 'pending').label}
                                            </p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                            No anomaly cases are flagged right now.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-dark-surface rounded-xl md:rounded-2xl mb-6 md:mb-8 w-full md:w-fit overflow-x-auto transition-colors duration-300 no-scrollbar">
                {(user.role === 'recruiter' || user.role === 'admin') ? (
                    <>
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`px-4 md:px-8 py-2.5 rounded-lg md:rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'jobs' ? 'bg-white dark:bg-dark-surface text-brand-primary dark:text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            Manage Jobs
                        </button>
                        <button
                            onClick={() => setActiveTab('candidates')}
                            className={`px-4 md:px-8 py-2.5 rounded-lg md:rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'candidates' ? 'bg-white dark:bg-dark-surface text-brand-primary dark:text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            Candidate List
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`px-4 md:px-8 py-2.5 rounded-lg md:rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'browse' ? 'bg-white dark:bg-dark-surface text-brand-primary dark:text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            Browse Jobs
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 md:px-8 py-2.5 rounded-lg md:rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-white dark:bg-dark-surface text-brand-primary dark:text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            Application History
                        </button>
                    </>
                )}
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-dark-main rounded-[28px] md:rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                {/* --- RECRUITER: JOBS TAB --- */}
                {(user.role === 'recruiter' || user.role === 'admin') && activeTab === 'jobs' && (
                    <>
                        <div className="p-5 md:p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-300">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Job Posts</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1 transition-colors duration-300">Manage and monitor all job postings</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                                <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
                                <p>Loading jobs...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white dark:bg-dark-main text-gray-900 dark:text-gray-200 text-xs font-bold border-y border-gray-100 dark:border-gray-800 transition-colors duration-300">
                                            <th className="px-8 py-4">Job Title</th>
                                            <th className="px-8 py-4">Department</th>
                                            <th className="px-8 py-4">Location</th>
                                            <th className="px-8 py-4 text-center">Type</th>
                                            <th className="px-8 py-4 text-center">Applicants</th>
                                            <th className="px-8 py-4">Status</th>
                                            <th className="px-8 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {recruiterManagedJobs.length > 0 ? recruiterManagedJobs.map((job) => {
                                            const jobApplicants = getApplicantsForJob(job._id);

                                            return (
                                            <tr key={job._id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-gray-100 mb-0.5">{job.title}</p>
                                                        <p className="text-sm font-semibold text-brand-primary dark:text-brand-primary mb-0.5">{job.company || 'HireChain AI'}</p>
                                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">Posted {new Date(job.createdAt).toISOString().split('T')[0]}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-gray-50 dark:bg-dark-surface text-gray-600 dark:text-gray-400 px-4 py-1.5 rounded-xl text-[11px] font-bold border border-gray-100 dark:border-gray-800 transition-colors">{job.department || 'Engineering'}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-[13px] font-medium">
                                                        <MapPin size={14} className="mr-2 text-gray-300 dark:text-gray-600" />
                                                        {job.location || 'Remote'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="bg-gray-50 dark:bg-dark-surface text-gray-500 dark:text-gray-400 px-3 py-1 rounded-lg text-[11px] font-bold border border-gray-100 dark:border-gray-800 transition-colors uppercase tracking-tight">{job.type || 'Full-time'}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/jobs/${job._id}/applicants`)}
                                                        className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:text-brand-primary hover:border-brand-primary/20 transition-all"
                                                    >
                                                        <Users size={14} className="text-gray-300 dark:text-gray-500" />
                                                        <span>{jobApplicants.length}</span>
                                                        <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                                            Preview
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <button
                                                        onClick={() => handleStatusToggle(job._id, job.status || 'Active')}
                                                        className={`inline-flex min-w-[124px] items-center justify-between gap-3 px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                                                            job.status === 'Closed' 
                                                            ? 'bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-dark-card' 
                                                            : 'bg-brand-accent/10 dark:bg-brand-accent/20 text-brand-accent dark:text-brand-accent border-brand-accent/20 dark:border-brand-accent/30 hover:bg-brand-accent/20 dark:hover:bg-brand-accent/30'
                                                        }`}
                                                    >
                                                        <span className="inline-flex items-center gap-2">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'Closed' ? 'bg-gray-400 dark:bg-gray-500' : 'bg-brand-accent dark:bg-brand-accent'}`} />
                                                            <span>{job.status || 'Active'}</span>
                                                        </span>
                                                        <ChevronDown size={14} className="shrink-0 text-gray-400 dark:text-gray-500" />
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/jobs/${job._id}/applicants`)}
                                                            className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-brand-secondary dark:hover:text-brand-secondary hover:bg-brand-secondary/10 rounded-xl transition-all active:scale-90"
                                                            title="Open applicants page"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/edit-job/${job._id}`)}
                                                            className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-brand-primary/10 dark:hover:bg-brand-primary/10 rounded-xl transition-all active:scale-90"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteJob(job._id)}
                                                            className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                                                        >
                                                            <CheckCircle size={18} className="hidden" /> {/* Spacer */}
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}) : (
                                            <tr><td colSpan={7} className="p-20 text-center text-gray-400">No jobs posted yet</td></tr>
                                        )}
                                    </tbody>
                                </table>

                            </div>
                        )}
                    </>
                )}

                {/* --- RECRUITER: CANDIDATES TAB --- */}
                {(user.role === 'recruiter' || user.role === 'admin') && activeTab === 'candidates' && (
                    <>
                        <div className="p-5 md:p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Candidate List</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1 transition-colors duration-300">AI-screened candidates with match scores</p>
                            </div>
                            <div className="flex flex-col gap-3 w-full xl:w-auto">
                                <div className="relative w-full sm:w-[300px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        placeholder="Search candidates..."
                                        value={candidateFilters.search}
                                        onChange={(e) => setCandidateFilters((current) => ({ ...current, search: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-surface rounded-2xl border-none text-sm focus:ring-2 focus:ring-brand-primary transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 w-full">
                                    <select
                                        value={candidateFilters.status}
                                        onChange={(event) => setCandidateFilters((current) => ({ ...current, status: event.target.value as RecruiterCandidateFilters['status'] }))}
                                        className="rounded-2xl bg-gray-50 dark:bg-dark-surface px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-none focus:ring-2 focus:ring-brand-primary"
                                    >
                                        {applicationStatusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={candidateFilters.scoreBand}
                                        onChange={(event) => setCandidateFilters((current) => ({ ...current, scoreBand: event.target.value as RecruiterCandidateFilters['scoreBand'] }))}
                                        className="rounded-2xl bg-gray-50 dark:bg-dark-surface px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-none focus:ring-2 focus:ring-brand-primary"
                                    >
                                        {scoreBandOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        placeholder="Filter by skill"
                                        value={candidateFilters.skill}
                                        onChange={(event) => setCandidateFilters((current) => ({ ...current, skill: event.target.value }))}
                                        className="rounded-2xl bg-gray-50 dark:bg-dark-surface px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-none focus:ring-2 focus:ring-brand-primary"
                                    />
                                    <button
                                        onClick={handleExport}
                                        className="w-full bg-brand-primary text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-brand-primary/95 flex items-center justify-center space-x-2 transition-all active:scale-95"
                                    >
                                        <Download size={18} />
                                        <span>Export CSV</span>
                                    </button>
                                    <button
                                        onClick={handleExportAuditCsv}
                                        className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-5 py-3 rounded-2xl font-bold text-sm hover:border-brand-primary/30 hover:text-brand-primary transition-all"
                                    >
                                        Audit CSV
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleExportAuditReport}
                                        className="w-full sm:w-auto bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-200 px-5 py-3 rounded-2xl font-bold text-sm hover:text-brand-primary transition-all"
                                    >
                                        Audit Report
                                    </button>
                                    {(candidateFilters.search || candidateFilters.skill || candidateFilters.status !== 'all' || candidateFilters.scoreBand !== 'all') && (
                                        <button
                                            type="button"
                                            onClick={() => setCandidateFilters(emptyRecruiterCandidateFilters)}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-brand-primary/30 hover:text-brand-primary transition-all"
                                        >
                                            <X size={16} />
                                            <span>Clear Filters</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                                <div className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin mb-4" />
                                <p>Loading candidate data...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-widest border-y border-gray-50 dark:border-gray-800 transition-colors duration-300">
                                            <th className="px-8 py-4">Candidate</th>
                                            <th className="px-8 py-4">Position</th>
                                            <th className="px-8 py-4">Match Score</th>
                                            <th className="px-8 py-4">Top Skills</th>
                                            <th className="px-8 py-4">Date</th>
                                            <th className="px-8 py-4">Status</th>
                                            <th className="px-8 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {filteredRecruiterCandidates.length > 0 ? filteredRecruiterCandidates.map((c) => {
                                            const applicationStatus = getApplicationStatusMeta(c.candidateId?.applicationStatus);
                                            const candidateId = c.candidateId?._id;

                                            return (
                                                <tr key={c._id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/30 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                                                                {c.candidateId?.userId?.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 dark:text-gray-200">
                                                                    {c.candidateId?.userId?.name || 'Unnamed Candidate'}
                                                                </p>
                                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                    {c.candidateId?.userId?.email || c.candidateId?.email || 'No email provided'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        {c.candidateId?.jobId?.title || 'Unassigned role'}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-black text-gray-900 dark:text-white">{c.score}%</span>
                                                            <span className={`${c.score > 85 ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' :
                                                                c.score > 70 ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                                                                    'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20'
                                                                } px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase`}>
                                                                {c.score > 85 ? 'Excellent' : c.score > 70 ? 'Good' : 'Moderate'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-2">
                                                            {c.skills?.slice(0, 2).map((s: string, i: number) => (
                                                                <span key={i} className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-md text-[10px] font-bold border border-gray-100 dark:border-gray-800 italic">{s}</span>
                                                            ))}
                                                            {(c.skills?.length ?? 0) > 2 && <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600">+{(c.skills?.length ?? 0) - 2}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-medium text-gray-400">
                                                        {new Date(c.createdAt).toISOString().split('T')[0]}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="space-y-2">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide ${applicationStatus.badge}`}>
                                                                {applicationStatus.label}
                                                            </span>
                                                            <div className="flex items-center space-x-1.5 text-brand-accent font-black text-[10px] uppercase">
                                                                <CheckCircle size={14} />
                                                                <span>Verified</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            type="button"
                                                            disabled={!candidateId}
                                                            onClick={() => candidateId && navigate(`/applications/${candidateId}/review`)}
                                                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-primary hover:bg-brand-primary/10 rounded-2xl transition-all disabled:opacity-40"
                                                        >
                                                            <Eye size={18} />
                                                            <span>Review</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan={7} className="p-20 text-center text-gray-400">{recruiterCandidates.length ? 'No candidates match the current filters.' : 'No candidates have applied yet.'}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Transparency Log Section */}
                        <div id="transparency-log" className="p-10 bg-gray-50/50 dark:bg-dark-main/50 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
                            <div className="flex items-center space-x-3 mb-8">
                                <div className="bg-brand-secondary text-white p-2 rounded-xl shadow-lg shadow-brand-secondary/20 dark:shadow-brand-secondary/30">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-300">Transparency Log</h4>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium transition-colors duration-300">Recent blockchain-verified activities</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {recruiterCandidates.slice(0, 3).map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => window.open(item.blockchain?.explorerUrl || `/verify/${item.blockchain?.hash}`, '_blank')}
                                        className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:border-brand-secondary transition-all cursor-pointer hover:shadow-md"
                                    >
                                        <div className="flex items-center space-x-6">
                                            <div className="bg-brand-secondary/10 dark:bg-brand-secondary/20 text-brand-secondary dark:text-brand-secondary p-4 rounded-2xl group-hover:bg-brand-secondary group-hover:text-white transition-all">
                                                <Database size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <h5 className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{i % 2 === 0 ? 'Candidate Screened' : 'Score Verified'}</h5>
                                                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-0.5 rounded-lg text-[10px] font-bold transition-colors duration-300">{item.candidateId?.userId?.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 font-medium mb-3 flex items-center"><Clock size={12} className="mr-1.5" />{new Date(item.createdAt).toLocaleString()}</p>
                                                <p className="text-xs font-mono text-gray-300 dark:text-gray-600 group-hover:text-brand-secondary transition-colors break-all flex items-center">
                                                    <span className="font-bold mr-2 uppercase tracking-tighter text-[10px]">Hash:</span>
                                                    {item.blockchain?.hash || '0x' + Math.random().toString(16).slice(2, 10) + '...'}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="p-3 text-gray-400 hover:text-brand-secondary hover:bg-brand-secondary/10 rounded-2xl transition-all">
                                            <Eye size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* --- CANDIDATE: BROWSE TAB --- */}
                {user.role === 'candidate' && activeTab === 'browse' && (
                    <>
                        <div className="p-5 md:p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-300">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Available Positions</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">{filteredJobs.length} jobs match your search</p>
                            </div>
                            <div className="flex w-full md:w-auto space-x-2">
                                <div className="relative flex-1 md:flex-none">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input placeholder="Search jobs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-auto sm:min-w-[250px] pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-none rounded-xl text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-colors duration-300" />
                                </div>
                                <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"><Filter size={18} /></button>
                            </div>
                        </div>
                        <div className="p-5 md:p-8">
                            <div className="space-y-6">
                                {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                                    <div key={job._id} className="p-5 md:p-6 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-xl md:rounded-2xl hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm group">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            {/* Left: Icon, Title, Company */}
                                            <div className="flex items-start space-x-4 md:space-x-5 flex-1">
                                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent flex items-center justify-center text-white shrink-0 shadow-md transform group-hover:scale-105 transition-transform">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg md:text-[20px] font-bold text-gray-900 dark:text-white leading-tight group-hover:text-brand-primary transition-colors">{job.title}</h4>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">{job.company || 'TechCorp Inc.'}</p>
                                                    
                                                    {/* Metadata Row */}
                                                    <div className="flex flex-wrap items-center text-[13px] text-gray-500 dark:text-gray-400 font-medium gap-x-5 gap-y-2 mt-3">
                                                        <div className="flex items-center"><MapPin size={15} className="mr-1.5 text-gray-400 dark:text-gray-500" />{job.location}</div>
                                                        <div className="flex items-center"><Briefcase size={15} className="mr-1.5 text-gray-400 dark:text-gray-500" />{job.type}</div>
                                                        <div className="flex items-center"><DollarSign size={15} className="mr-1 text-gray-400 dark:text-gray-500" />{job.salaryRange}</div>
                                                        <div className="flex items-center"><Clock size={15} className="mr-1.5 text-gray-400 dark:text-gray-500" />{new Date(job.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Right: Actions */}
                                            <div className="flex w-full md:w-[190px] flex-col items-center shrink-0 md:mt-0 mt-4">
                                                <button onClick={() => navigate(`/upload/${job._id}`)} className="w-full py-2.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white rounded-lg md:rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2">
                                                    <Upload size={16} /><span>Apply Now</span>
                                                </button>
                                                <button onClick={() => navigate(`/job/${job._id}`)} className="mt-3 flex w-full items-center justify-center space-x-2 text-gray-700 dark:text-gray-300 font-bold text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
                                                    <Eye size={16} className="text-gray-500 dark:text-gray-400" />
                                                    <span>View Details</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Description Snippet */}
                                        <p className="text-gray-600 dark:text-gray-400 mt-5 text-[15px] leading-relaxed line-clamp-2">
                                            {job.description || "We're looking for an experienced professional to join our team and make a significant impact on our core operations and user experiences."}
                                        </p>

                                        {/* Tags */}
                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {job.tags?.map((tag: string, i: number) => (
                                                <span key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3.5 py-1.5 rounded-xl text-[12px] font-bold">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )) : <div className="p-14 md:p-20 text-center text-gray-400 dark:text-gray-500">No jobs found</div>}
                            </div>
                        </div>
                    </>
                )}

                {/* --- CANDIDATE: HISTORY TAB --- */}
                {user.role === 'candidate' && activeTab === 'history' && (
                    <>
                        <div className="p-5 md:p-8 border-b border-gray-50 dark:border-gray-800 transition-colors duration-300">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Application History</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">Track status changes, recruiter review progress, and AI screening results</p>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-800 transition-colors duration-300">
                            {applications.length > 0 ? applications.map((app) => {
                                const statusMeta = getApplicationStatusMeta(app.applicationStatus);
                                return (
                                <div key={app._id} className="p-5 md:p-8 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-300">{app.job?.title}</h4>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusMeta.badge}`}>
                                                    {statusMeta.label}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 font-semibold mb-1 transition-colors duration-300">{app.job?.company}</p>
                                            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 transition-colors duration-300">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                                            <div className="mb-4 grid sm:grid-cols-3 gap-3 max-w-3xl">
                                                <div className="rounded-2xl bg-gray-50 dark:bg-dark-main px-4 py-3 transition-colors duration-300">
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">Status</p>
                                                    <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">{statusMeta.description}</p>
                                                </div>
                                                <div className="rounded-2xl bg-gray-50 dark:bg-dark-main px-4 py-3 transition-colors duration-300">
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">Consent</p>
                                                    <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                                        {app.consentAccepted ? 'Accepted before screening' : 'Not captured'}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl bg-gray-50 dark:bg-dark-main px-4 py-3 transition-colors duration-300">
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">Last Review</p>
                                                    <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                                        {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : 'Waiting for recruiter'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="max-w-md">
                                                <div className="flex items-center justify-between text-xs font-bold mb-2">
                                                    <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">AI Match Score</span>
                                                    <span className="text-gray-900 dark:text-white transition-colors duration-300">{app.screening?.score || 0}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden mb-3 transition-colors duration-300">
                                                    <div className="h-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent rounded-full transition-all duration-1000" style={{ width: `${app.screening?.score || 0}%` }} />
                                                </div>
                                            </div>
                                            {app.decisionNotes && (
                                                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                                    <span className="font-bold text-gray-900 dark:text-white">Recruiter note:</span> {app.decisionNotes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-3 w-full md:w-auto md:min-w-[180px]">
                                            <button onClick={() => navigate(`/result/${app._id}`)} className="w-full py-3 bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-200 rounded-xl font-bold flex items-center justify-center space-x-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-300">
                                                <Eye size={18} /><span>View Results</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}) : (
                                <div className="p-24 text-center text-gray-400 dark:text-gray-500">No applications yet</div>
                            )}
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default Dashboard;
