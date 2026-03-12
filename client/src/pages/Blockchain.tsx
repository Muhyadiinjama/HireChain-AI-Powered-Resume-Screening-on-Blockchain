import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    CalendarClock,
    CheckCircle2,
    Copy,
    Database,
    FileBadge2,
    Hash,
    MapPin,
    Shield,
    UserRound
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBlockchainLogByHash } from '../services/api';
import type { BlockchainLog } from '../types/models';

const Blockchain = () => {
    const { hash } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [log, setLog] = useState<BlockchainLog | null>(null);
    const [error, setError] = useState('');
    const [viewerCanSeeSensitiveDetails, setViewerCanSeeSensitiveDetails] = useState(false);

    useEffect(() => {
        const fetchLog = async () => {
            if (!hash) {
                setError('Verification hash is missing.');
                setLoading(false);
                return;
            }

            try {
                const res = await getBlockchainLogByHash(hash);
                setLog(res.data.log || null);
                setViewerCanSeeSensitiveDetails(Boolean(res.data.viewerCanSeeSensitiveDetails));
            } catch (err: unknown) {
                const message =
                    (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
                    'Unable to load the verification record.';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        void fetchLog();
    }, [hash]);

    const handleCopy = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
        } catch {
            toast.error(`Unable to copy ${label.toLowerCase()}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-dark-main transition-colors duration-300">
                <div className="max-w-5xl mx-auto px-4 md:px-6 py-20 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-5" />
                    <p className="text-gray-500 dark:text-gray-400 font-bold tracking-wide transition-colors duration-300">
                        Loading verification record...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !log) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-dark-main transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
                    <button
                        onClick={() => navigate('/blockchain')}
                        className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary font-bold transition-colors mb-8"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Explorer</span>
                    </button>

                    <div className="bg-white dark:bg-dark-surface rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm p-8 md:p-10 transition-colors duration-300">
                        <div className="w-14 h-14 rounded-2xl premium-gradient flex items-center justify-center text-white mb-6">
                            <Database size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                            Verification Record Not Found
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
                            {error || 'The requested verification record could not be found.'}
                        </p>
                        <button
                            onClick={() => navigate('/blockchain')}
                            className="premium-gradient text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:opacity-95 transition-all"
                        >
                            Open Blockchain Explorer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const candidateName = log.candidateId?.userId?.name || 'Sensitive details hidden';
    const candidateEmail = log.candidateId?.userId?.email || log.candidateId?.email || 'Admin login required';
    const jobTitle = log.candidateId?.jobId?.title || 'Protected application';
    const companyName = log.candidateId?.jobId?.company || 'Admin login required';
    const location = log.candidateId?.jobId?.location || 'Admin login required';
    const verificationStatus = log.onChainConfirmed ? 'On-chain Confirmed' : 'Stored Off-chain';

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-dark-main transition-colors duration-300 overflow-hidden">
            <section className="relative pt-12 md:pt-20 pb-12">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 left-[10%] w-72 h-72 bg-primary-200/40 dark:bg-brand-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-[5%] w-96 h-96 bg-cyan-200/40 dark:bg-brand-accent/10 rounded-full blur-[140px]" />
                </div>

                <div className="max-w-6xl mx-auto px-4 md:px-6">
                    <button
                        onClick={() => navigate('/blockchain')}
                        className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary font-bold transition-colors mb-8"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Explorer</span>
                    </button>

                    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 md:gap-8">
                        <div className="bg-white dark:bg-dark-surface rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm p-8 md:p-10 transition-colors duration-300">
                            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full font-bold text-sm mb-6 transition-colors duration-300">
                                <CheckCircle2 size={16} />
                                <span>{verificationStatus}</span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black tracking-tight-custom text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                                Blockchain Verification Record
                            </h1>
                            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed transition-colors duration-300">
                                This record shows the screening fingerprint, verification ID, and the Sepolia transaction that anchored the submission to the blockchain.
                            </p>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                                <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-2">Verification ID</p>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-mono text-brand-primary font-bold break-all">{log.verificationId}</p>
                                        <button
                                            onClick={() => handleCopy(log.verificationId, 'Verification ID')}
                                            className="p-2 rounded-xl hover:bg-white dark:hover:bg-dark-surface text-gray-500 dark:text-gray-400 hover:text-brand-primary transition-colors"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-2">Recorded At</p>
                                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                </div>

                                <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-2">Network</p>
                                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                        {log.network || 'sepolia'}
                                    </p>
                                </div>

                                <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-2">Block Number</p>
                                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                        {log.blockNumber || 'Pending'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="premium-gradient rounded-[32px] shadow-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_45%)] opacity-80" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-6">
                                    <Shield size={24} />
                                </div>
                                <h2 className="text-2xl font-black mb-3">Sepolia Snapshot</h2>
                                <p className="text-white/85 leading-relaxed mb-8">
                                    The blockchain transaction below is the public proof. The SHA-256 hash remains the exact fingerprint of the screening payload.
                                </p>
                                <div className="bg-white/10 border border-white/15 rounded-3xl p-5 mb-4">
                                    <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-2">Transaction Hash</p>
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-mono text-sm break-all">{log.txHash || 'Transaction not available'}</p>
                                        {log.txHash && (
                                            <button
                                                onClick={() => handleCopy(log.txHash || '', 'Transaction hash')}
                                                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white/10 border border-white/15 rounded-3xl p-5">
                                    <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-2">SHA-256 Hash</p>
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-mono text-sm break-all">{log.hash}</p>
                                        <button
                                            onClick={() => handleCopy(log.hash, 'Hash')}
                                            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                                {log.explorerUrl && (
                                    <a
                                        href={log.explorerUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex mt-5 items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-2xl font-bold transition-all border border-white/10"
                                    >
                                        <span>Open Sepolia Transaction</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6 md:gap-8 mt-8">
                        <div className="bg-white dark:bg-dark-surface rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm p-8 transition-colors duration-300">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                                {viewerCanSeeSensitiveDetails ? 'Candidate Context' : 'Protected Context'}
                            </h3>
                            {viewerCanSeeSensitiveDetails ? (
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-brand-primary flex items-center justify-center shrink-0">
                                            <UserRound size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Candidate</p>
                                            <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{candidateName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{candidateEmail}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-brand-secondary flex items-center justify-center shrink-0">
                                            <FileBadge2 size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Position</p>
                                            <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{jobTitle}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 text-brand-accent flex items-center justify-center shrink-0">
                                            <Building2 size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Company</p>
                                            <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{companyName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Location</p>
                                            <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{location}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-4">
                                        <Shield size={20} />
                                    </div>
                                    <p className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">
                                        Sensitive applicant details are restricted
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                        Candidate name, email, company, and application context are visible only to authenticated admin accounts. Public visitors can verify the hash, verification ID, timestamp, and blockchain transaction without seeing private hiring data.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-dark-surface rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm p-8 transition-colors duration-300">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                                Ledger Entry Details
                            </h3>

                            <div className="space-y-4">
                                <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Hash size={16} className="text-brand-primary" />
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">Record Hash</p>
                                    </div>
                                    <p className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all transition-colors duration-300">
                                        {log.hash}
                                    </p>
                                </div>

                                <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
                                    <div className="flex items-center gap-3 mb-3">
                                        <CalendarClock size={16} className="text-brand-accent" />
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">Timestamp</p>
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                        {new Date(log.timestamp).toUTCString()}
                                    </p>
                                </div>

                                <div className="rounded-3xl bg-gray-50 dark:bg-dark-main border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Shield size={16} className="text-brand-accent" />
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">Contract</p>
                                    </div>
                                    <p className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all transition-colors duration-300">
                                        {log.contractAddress || 'Not available'}
                                    </p>
                                </div>

                                <div className={`rounded-3xl border p-5 transition-colors duration-300 ${
                                    log.onChainConfirmed
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800'
                                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
                                }`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle2 size={18} className={log.onChainConfirmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-300'} />
                                        <p className={`font-black transition-colors duration-300 ${log.onChainConfirmed ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                            {log.onChainConfirmed ? 'On-chain Confirmation Complete' : 'On-chain Confirmation Pending'}
                                        </p>
                                    </div>
                                    <p className={`text-sm transition-colors duration-300 ${log.onChainConfirmed ? 'text-emerald-700/80 dark:text-emerald-300/80' : 'text-amber-700/80 dark:text-amber-300/80'}`}>
                                        {log.onChainConfirmed
                                            ? 'The screening record was anchored on Sepolia and can be validated through the transaction hash and contract address above.'
                                            : 'This record exists locally, but the Sepolia transaction has not been confirmed yet.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Blockchain;
