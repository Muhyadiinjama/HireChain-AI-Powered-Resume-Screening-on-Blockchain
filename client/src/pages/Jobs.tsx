import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    Search, Filter, MapPin, Briefcase, DollarSign,
    Clock, Upload, Eye, Sparkles, Shield, ChevronRight,
    Building2, X
} from 'lucide-react';
import { getJobs } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Job } from '../types/models';

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];
const CATEGORIES = ['All', 'Engineering', 'Design', 'Marketing', 'Sales', 'Product', 'Finance', 'HR'];

const Jobs = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await getJobs();
                setJobs(res.data.jobs || []);
            } catch {
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleApply = (jobId: string) => {
        if (authLoading) {
            toast('Checking your session...');
            return;
        }

        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'candidate') {
            toast.error('Only candidate accounts can apply for jobs.');
            navigate('/dashboard');
            return;
        }

        navigate(`/upload/${jobId}`);
    };

    const filteredJobs = jobs.filter(job => {
        const matchSearch =
            job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = selectedType === 'All' || job.type === selectedType;
        const matchCategory = selectedCategory === 'All' || job.department === selectedCategory;
        return matchSearch && matchType && matchCategory;
    });

    return (
        <div className="min-h-screen transition-colors duration-300">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent py-16 md:py-20">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px]" />
                </div>
                <div className="relative max-w-5xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold mb-6 text-sm">
                        <Sparkles size={16} />
                        <span>AI-Screened Opportunities</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight-custom">
                        Find Your Next Role
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        Every position is blockchain-verified and AI-matched for fairness and transparency.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title, company, or location…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-14 py-4 rounded-2xl bg-white dark:bg-dark-surface text-gray-900 dark:text-white placeholder:text-gray-400 text-base font-medium shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
                {/* Stats Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse" />
                            <span className="font-bold text-gray-900 dark:text-white text-sm">
                                {filteredJobs.length} <span className="text-gray-500 dark:text-gray-400 font-medium">positions available</span>
                            </span>
                        </div>
                        <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-400 font-medium bg-gray-50 dark:bg-dark-surface px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                            <Shield size={12} className="text-brand-secondary" />
                            <span>Blockchain Verified</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${showFilters ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-primary/30'}`}
                    >
                        <Filter size={16} />
                        <span>Filters</span>
                        {(selectedType !== 'All' || selectedCategory !== 'All') && (
                            <span className="bg-white/30 text-white px-1.5 py-0.5 rounded-md text-xs">
                                {[selectedType !== 'All', selectedCategory !== 'All'].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-8 shadow-sm animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Job Type</p>
                                <div className="flex flex-wrap gap-2">
                                    {JOB_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${selectedType === type ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20' : 'bg-gray-50 dark:bg-dark-main text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-brand-primary/30'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Department</p>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${selectedCategory === cat ? 'bg-brand-secondary text-white border-brand-secondary shadow-md shadow-brand-secondary/20' : 'bg-gray-50 dark:bg-dark-main text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-brand-secondary/30'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {(selectedType !== 'All' || selectedCategory !== 'All') && (
                            <button
                                onClick={() => { setSelectedType('All'); setSelectedCategory('All'); }}
                                className="mt-4 text-xs text-brand-primary font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}

                {/* Job Cards */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
                        <p className="font-medium">Loading opportunities…</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-32">
                        <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center mx-auto mb-6">
                            <Briefcase size={36} className="text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No jobs found</h3>
                        <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
                        <button onClick={() => { setSearchQuery(''); setSelectedType('All'); setSelectedCategory('All'); }} className="mt-6 w-full sm:w-auto px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-brand-primary/95 transition-all active:scale-95">
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {filteredJobs.map((job, idx) => (
                            <div
                                key={job._id || idx}
                                className="group bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl dark:hover:shadow-brand-primary/5 hover:border-brand-primary/20 dark:hover:border-brand-primary/30 transition-all duration-300 overflow-hidden"
                            >
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row md:items-start gap-5">
                                        {/* Company Logo/Icon */}
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                                            <Building2 size={24} />
                                        </div>

                                        {/* Main Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors leading-tight">
                                                        {job.title}
                                                    </h2>
                                                    <p className="text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                                                        {job.company || 'HireChain Partner'}
                                                    </p>
                                                </div>
                                                <span className={`shrink-0 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-tight border ${
                                                    job.status === 'Closed'
                                                        ? 'bg-gray-100 dark:bg-dark-main text-gray-400 border-gray-200 dark:border-gray-700'
                                                        : 'bg-brand-accent/10 dark:bg-brand-accent/20 text-brand-accent border-brand-accent/20'
                                                }`}>
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${job.status === 'Closed' ? 'bg-gray-400' : 'bg-brand-accent'}`} />
                                                    {job.status || 'Active'}
                                                </span>
                                            </div>

                                            {/* Metadata */}
                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                {job.location && (
                                                    <div className="flex items-center space-x-1.5">
                                                        <MapPin size={14} className="text-gray-400 dark:text-gray-600 shrink-0" />
                                                        <span>{job.location}</span>
                                                    </div>
                                                )}
                                                {job.type && (
                                                    <div className="flex items-center space-x-1.5">
                                                        <Briefcase size={14} className="text-gray-400 dark:text-gray-600 shrink-0" />
                                                        <span>{job.type}</span>
                                                    </div>
                                                )}
                                                {job.salaryRange && (
                                                    <div className="flex items-center space-x-1.5">
                                                        <DollarSign size={14} className="text-gray-400 dark:text-gray-600 shrink-0" />
                                                        <span>{job.salaryRange}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-1.5">
                                                    <Clock size={14} className="text-gray-400 dark:text-gray-600 shrink-0" />
                                                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {job.description && (
                                                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed line-clamp-2 mb-4">
                                                    {job.description}
                                                </p>
                                            )}

                                            {/* Tags */}
                                            {job.tags && job.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-5">
                                                    {job.tags.slice(0, 5).map((tag: string, i: number) => (
                                                        <span key={i} className="bg-gray-100 dark:bg-dark-main text-gray-600 dark:text-gray-300 px-3 py-1 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                {job.status !== 'Closed' ? (
                                                    <button
                                                        onClick={() => handleApply(job._id)}
                                                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                                                    >
                                                        <Upload size={16} />
                                                        <span>
                                                            {!user ? 'Sign In to Apply' : user.role === 'candidate' ? 'Apply Now' : 'Candidate Account Required'}
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <span className="flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-dark-main text-gray-400 rounded-2xl font-bold text-sm cursor-not-allowed">
                                                        Position Closed
                                                    </span>
                                                )}

                                                <button
                                                    onClick={() => navigate(`/job/${job._id}`)}
                                                    className="flex items-center justify-center space-x-2 px-5 py-3 bg-gray-50 dark:bg-dark-main text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-sm border border-gray-200 dark:border-gray-700 hover:border-brand-primary/30 hover:text-brand-primary transition-all"
                                                >
                                                    <Eye size={16} />
                                                    <span>View Details</span>
                                                </button>

                                                {!user && (
                                                    <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500 sm:ml-2">
                                                        <Shield size={12} className="text-brand-secondary shrink-0" />
                                                        <span>Login required to apply</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom accent bar on hover */}
                                <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent transition-all duration-500" />
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA for unauthenticated users */}
                {!user && filteredJobs.length > 0 && (
                    <div className="mt-12 premium-gradient rounded-3xl p-8 md:p-10 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,#fff,transparent)]" />
                        <div className="relative">
                            <div className="flex justify-center mb-4">
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                                    <Sparkles size={28} className="text-white" />
                                </div>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black mb-3">Ready to Apply?</h3>
                            <p className="text-white/80 mb-7 max-w-md mx-auto">
                                Create your free account and let our AI match your skills to the best opportunities — blockchain-verified for complete fairness.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-white text-brand-primary px-8 py-3.5 rounded-2xl font-black shadow-lg hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Get Started Free
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-8 py-3.5 rounded-2xl font-bold hover:bg-white/30 transition-all flex items-center justify-center space-x-2"
                                >
                                    <span>Sign In</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;
