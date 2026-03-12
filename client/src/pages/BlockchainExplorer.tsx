import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    Copy,
    Database,
    FileBadge2,
    Hash,
    Search,
    Shield,
    UserRound
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBlockchainLogs } from '../services/api';
import type { BlockchainLog } from '../types/models';

const BlockchainExplorer = () => {
    const [logs, setLogs] = useState<BlockchainLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [viewerCanSeeSensitiveDetails, setViewerCanSeeSensitiveDetails] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await getBlockchainLogs();
                setLogs(res.data.logs || []);
                setViewerCanSeeSensitiveDetails(Boolean(res.data.viewerCanSeeSensitiveDetails));
                setError('');
            } catch (err: unknown) {
                const message =
                    (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
                    'Unable to load blockchain records.';
                setError(message);
                setLogs([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchLogs();
    }, []);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredLogs = logs.filter((log) =>
        !normalizedQuery ||
        log.hash?.toLowerCase().includes(normalizedQuery) ||
        log.txHash?.toLowerCase().includes(normalizedQuery) ||
        log.verificationId?.toLowerCase().includes(normalizedQuery) ||
        (viewerCanSeeSensitiveDetails && (
            log.candidateId?.userId?.name?.toLowerCase().includes(normalizedQuery) ||
            log.candidateId?.jobId?.title?.toLowerCase().includes(normalizedQuery)
        ))
    );

    const handleCopy = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
        } catch {
            toast.error(`Unable to copy ${label.toLowerCase()}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-main transition-colors duration-300 overflow-hidden">
            <section className="relative pt-16 pb-12 md:pt-20 md:pb-16">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-8%] w-[36rem] h-[36rem] bg-primary-200/35 dark:bg-brand-primary/10 rounded-full blur-[150px]" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[34rem] h-[34rem] bg-cyan-200/35 dark:bg-brand-accent/10 rounded-full blur-[160px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8 items-stretch">
                        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-[32px] shadow-sm p-8 md:p-10 transition-colors duration-300">
                            <div className="inline-flex items-center gap-2 bg-brand-secondary/10 dark:bg-brand-secondary/20 text-brand-secondary px-4 py-2 rounded-full font-bold text-sm mb-6">
                                <Shield size={16} />
                                <span>Verification Ledger</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black tracking-tight-custom text-gray-900 dark:text-white mb-5 transition-colors duration-300">
                                Blockchain Explorer
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed transition-colors duration-300">
                                Browse immutable HireChain verification records, search by hash or verification ID, and inspect the public proof behind each entry.
                            </p>

                            <div className="relative mt-8">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by hash, verification ID, candidate, or job"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/30 transition-all"
                                />
                            </div>
                        </div>

                        <div className="premium-gradient rounded-[32px] shadow-2xl p-8 md:p-10 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_44%)] opacity-90" />
                            <div className="relative grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-6">
                                        <Database size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black mb-2">Ledger Status</h2>
                                    <p className="text-white/85 mb-6">
                                    Public verification records generated from resume screening submissions.
                                </p>
                                </div>

                                <div className="bg-white/10 border border-white/15 rounded-3xl p-5">
                                    <p className="text-xs uppercase font-black tracking-widest text-white/60 mb-2">Total Records</p>
                                    <p className="text-3xl font-black">{logs.length}</p>
                                </div>

                                <div className="bg-white/10 border border-white/15 rounded-3xl p-5">
                                    <p className="text-xs uppercase font-black tracking-widest text-white/60 mb-2">Visible Results</p>
                                    <p className="text-3xl font-black">{filteredLogs.length}</p>
                                </div>

                                <div className="col-span-2 bg-white/10 border border-white/15 rounded-3xl p-5">
                                    <p className="text-xs uppercase font-black tracking-widest text-white/60 mb-2">Access Model</p>
                                    <p className="text-lg font-bold">
                                        {viewerCanSeeSensitiveDetails
                                            ? 'Admin view includes full candidate and role context'
                                            : 'Public view shows verification metadata only'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pb-16">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    {loading ? (
                        <div className="bg-white dark:bg-dark-surface rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm p-12 flex flex-col items-center transition-colors duration-300">
                            <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-5" />
                            <p className="text-gray-500 dark:text-gray-400 font-bold transition-colors duration-300">
                                Loading blockchain records...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="bg-white dark:bg-dark-surface rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm p-10 text-center transition-colors duration-300">
                            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mx-auto mb-6">
                                <Database size={26} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                                Unable to Load Explorer
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{error}</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="bg-white dark:bg-dark-surface rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center transition-colors duration-300">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-main text-gray-500 flex items-center justify-center mx-auto mb-6">
                                <Search size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                                {searchQuery ? 'No matching verification record' : 'No blockchain records yet'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                {searchQuery ? 'Try another search term.' : 'Records will appear here after candidates submit screened applications.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {filteredLogs.map((log) => {
                                const candidateName = log.candidateId?.userId?.name || 'Sensitive details hidden';
                                const jobTitle = log.candidateId?.jobId?.title || 'Protected application';
                                const verificationStatus = log.onChainConfirmed ? 'On-chain' : 'Pending chain';

                                return (
                                    <div
                                        key={log._id}
                                        className="bg-white dark:bg-dark-surface rounded-[30px] border border-gray-100 dark:border-gray-800 shadow-sm p-6 md:p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                                    >
                                        <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary/15 to-brand-accent/15 dark:from-brand-primary/20 dark:to-brand-accent/20 text-brand-primary flex items-center justify-center shrink-0">
                                                <Database size={22} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                                                        log.onChainConfirmed
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300'
                                                    }`}>
                                                        <CheckCircle2 size={12} />
                                                        <span>{verificationStatus}</span>
                                                    </span>
                                                    <span className="text-gray-900 dark:text-white font-black text-lg transition-colors duration-300">
                                                        {viewerCanSeeSensitiveDetails ? candidateName : log.verificationId}
                                                    </span>
                                                    {viewerCanSeeSensitiveDetails ? (
                                                        <>
                                                            <span className="text-gray-400 dark:text-gray-500">for</span>
                                                            <span className="text-gray-600 dark:text-gray-300 font-bold transition-colors duration-300">
                                                                {jobTitle}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-500 dark:text-gray-400 font-bold transition-colors duration-300">
                                                            Public verification snapshot
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid md:grid-cols-4 gap-4">
                                                    <div className="rounded-2xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-4 transition-colors duration-300">
                                                        <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-500">
                                                            <Hash size={14} />
                                                            <p className="text-[11px] uppercase tracking-widest font-black">Hash</p>
                                                        </div>
                                                        <p className="font-mono text-sm text-brand-primary truncate">{log.hash}</p>
                                                    </div>

                                                    <div className="rounded-2xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-4 transition-colors duration-300">
                                                        <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-500">
                                                            <Shield size={14} />
                                                            <p className="text-[11px] uppercase tracking-widest font-black">Verification ID</p>
                                                        </div>
                                                        <p className="font-mono text-sm text-gray-900 dark:text-white transition-colors duration-300">
                                                            {log.verificationId}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-4 transition-colors duration-300">
                                                        <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-500">
                                                            <Shield size={14} />
                                                            <p className="text-[11px] uppercase tracking-widest font-black">Tx Hash</p>
                                                        </div>
                                                        <p className="font-mono text-sm text-gray-900 dark:text-white truncate transition-colors duration-300">
                                                            {log.txHash || 'Not submitted'}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-4 transition-colors duration-300">
                                                        <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-500">
                                                            <CalendarClock size={14} />
                                                            <p className="text-[11px] uppercase tracking-widest font-black">Recorded</p>
                                                        </div>
                                                        <p className="text-sm text-gray-900 dark:text-white font-bold transition-colors duration-300">
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row xl:flex-col gap-3 shrink-0">
                                                <button
                                                    onClick={() => navigate(`/verify/${log.hash}`)}
                                                    className="premium-gradient text-white px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all"
                                                >
                                                    <FileBadge2 size={16} />
                                                    <span>Open Record</span>
                                                    <ArrowRight size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(log.hash, 'Hash')}
                                                    className="bg-gray-100 dark:bg-dark-main border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-brand-primary/20 hover:text-brand-primary transition-all"
                                                >
                                                    <Copy size={16} />
                                                    <span>Copy Hash</span>
                                                </button>
                                                {log.explorerUrl && (
                                                    <a
                                                        href={log.explorerUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-brand-secondary/20 hover:text-brand-secondary transition-all"
                                                    >
                                                        <ArrowRight size={16} />
                                                        <span>Open Tx</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                            {viewerCanSeeSensitiveDetails ? (
                                                <>
                                                    <span className="inline-flex items-center gap-2">
                                                        <UserRound size={14} />
                                                        <span>{candidateName}</span>
                                                    </span>
                                                    <span className="inline-flex items-center gap-2">
                                                        <FileBadge2 size={14} />
                                                        <span>{jobTitle}</span>
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="inline-flex items-center gap-2">
                                                    <Shield size={14} />
                                                    <span>Candidate and job details are visible to logged-in admins only</span>
                                                </span>
                                            )}
                                            {log.network && (
                                                <span className="inline-flex items-center gap-2">
                                                    <Shield size={14} />
                                                    <span>{log.network}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default BlockchainExplorer;
