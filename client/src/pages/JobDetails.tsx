import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../services/api';
import { 
    Briefcase, MapPin, DollarSign, Building2, 
    Share2, BookmarkPlus, CheckCircle2,
    Calendar, Users, ArrowRight, Code, Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { Job } from '../types/models';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await getJobById(id!);
                setJob(res.data.job);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-[#f8faff] dark:bg-dark-main transition-colors duration-300" />;

    if (!job) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8faff] dark:bg-dark-main transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job not found</h2>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8faff] dark:bg-dark-main font-sans pb-20 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 md:px-8 py-4 sticky top-0 z-10 transition-colors duration-300">
                <div />
                <div className="flex space-x-2 md:space-x-3">
                    <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded-xl transition-all"><Share2 size={18} className="md:w-5 md:h-5" /></button>
                    <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded-xl transition-all"><BookmarkPlus size={18} className="md:w-5 md:h-5" /></button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-10 flex flex-col lg:flex-row gap-10">
                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    {/* Hero Section */}
                    <div className="bg-white dark:bg-dark-surface p-6 md:p-10 rounded-[28px] md:rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 transition-colors duration-300">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                                    <Building2 size={32} className="md:w-9 md:h-9" />
                                </div>
                                <div className="mt-1">
                                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2 transition-colors">{job.title}</h1>
                                    <p className="text-base md:text-lg font-bold text-brand-primary dark:text-brand-primary mb-5 transition-colors">{job.company || 'TechCorp Inc.'}</p>
                                    
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 md:gap-x-6 gap-y-3 text-[13px] md:text-sm font-bold text-gray-500 dark:text-gray-400 transition-colors">
                                        <div className="flex items-center"><MapPin size={16} className="mr-2 text-gray-400 dark:text-gray-500" />{job.location}</div>
                                        <div className="flex items-center"><Briefcase size={16} className="mr-2 text-gray-400 dark:text-gray-500" />{job.type}</div>
                                        <div className="flex items-center"><DollarSign size={16} className="mr-0.5 text-gray-400 dark:text-gray-500" />{job.salaryRange}</div>
                                    </div>
                                    {(job.category || job.subcategory) && (
                                        <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                            {job.category && (
                                                <span className="rounded-xl border border-brand-primary/20 bg-brand-primary/10 px-3 py-1.5 text-xs font-black text-brand-primary dark:border-brand-primary/30 dark:bg-brand-primary/20">
                                                    {job.category}
                                                </span>
                                            )}
                                            {job.subcategory && (
                                                <span className="rounded-xl border border-brand-secondary/20 bg-brand-secondary/10 px-3 py-1.5 text-xs font-black text-brand-secondary dark:border-brand-secondary/30 dark:bg-brand-secondary/20">
                                                    {job.subcategory}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {user?.role === 'candidate' && (
                                <button onClick={() => navigate(`/upload/${job._id}`)} className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white px-8 py-4 rounded-xl md:rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center space-x-2 shrink-0 md:w-auto w-full">
                                    <span>Apply Now</span>
                                    <ArrowRight size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white dark:bg-dark-surface p-6 md:p-10 rounded-[28px] md:rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 transition-colors duration-300">
                        <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center transition-colors"><Code className="mr-3 text-brand-secondary dark:text-brand-secondary" size={24} /> About The Role</h2>
                        <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-[15px] transition-colors">
                            {job.description ? job.description.split('\n').map((para: string, idx: number) => (
                                <p key={idx} className="mb-4">{para}</p>
                            )) : (
                                <p>We're looking for an experienced professional to join our team and make a significant impact on our core operations and user experiences. You will be responsible for leading projects, mentoring junior developers, and contributing to the technical direction of our products.</p>
                            )}
                        </div>

                        <hr className="my-8 border-gray-100 dark:border-gray-800 transition-colors" />

                        <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-5 flex items-center transition-colors"><CheckCircle2 className="mr-3 text-brand-primary dark:text-brand-primary" size={20} /> Requirements & Skills</h3>
                        <div className="flex flex-wrap gap-2 md:gap-3 mb-8">
                            {(job.tags && job.tags.length > 0 ? job.tags : ['React', 'TypeScript', 'Node.js', 'Next.js', 'Web3']).map((tag: string, i: number) => (
                                <span key={i} className="bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold border border-brand-primary/20 dark:border-brand-primary/30 transition-colors">{tag}</span>
                            ))}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-[15px] leading-relaxed mb-4 transition-colors">You should have previous experience building scalable applications and a strong understanding of modern web technologies. Familiarity with our tech stack is highly preferred.</p>
                        <ul className="list-none space-y-3 mb-4">
                            <li className="flex items-start text-gray-600 dark:text-gray-300 text-sm md:text-[15px] transition-colors"><div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded-full mr-3 mt-0.5"><CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" /></div> Proven track record in delivery</li>
                            <li className="flex items-start text-gray-600 dark:text-gray-300 text-sm md:text-[15px] transition-colors"><div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded-full mr-3 mt-0.5"><CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" /></div> Strong communication skills</li>
                            <li className="flex items-start text-gray-600 dark:text-gray-300 text-sm md:text-[15px] transition-colors"><div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded-full mr-3 mt-0.5"><CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" /></div> Problem-solving mindset</li>
                        </ul>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-[340px] shrink-0 space-y-6">
                    {/* Summary Widget */}
                    <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-sm border border-transparent dark:border-gray-800 transition-colors duration-300">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 transition-colors">Job Summary</h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-brand-primary/10 dark:bg-brand-primary/20 p-3 rounded-xl text-brand-primary dark:text-brand-primary shrink-0 transition-colors"><Calendar size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 transition-colors">Posted</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-200 transition-colors">{new Date(job.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4">
                                <div className="bg-brand-secondary/10 dark:bg-brand-secondary/20 p-3 rounded-xl text-brand-secondary dark:text-brand-secondary shrink-0 transition-colors"><Users size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 transition-colors">Company Size</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-200 transition-colors">50-200 Employees</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-brand-accent/10 dark:bg-brand-accent/20 p-3 rounded-xl text-brand-accent dark:text-brand-accent shrink-0 transition-colors"><CheckCircle2 size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 transition-colors">Department</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-200 transition-colors">{job.department || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-brand-primary/10 dark:bg-brand-primary/20 p-3 rounded-xl text-brand-primary dark:text-brand-primary shrink-0 transition-colors"><Briefcase size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 transition-colors">Category</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-200 transition-colors">{job.category || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-brand-secondary/10 dark:bg-brand-secondary/20 p-3 rounded-xl text-brand-secondary dark:text-brand-secondary shrink-0 transition-colors"><Code size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 transition-colors">Subcategory</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-200 transition-colors">{job.subcategory || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>

                        {user?.role === 'candidate' && (
                            <button onClick={() => navigate(`/upload/${job._id}`)} className="w-full mt-8 bg-gray-50 dark:bg-dark-main hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-700 dark:text-gray-300 font-bold py-4 rounded-xl transition-all border border-gray-200 dark:border-gray-700">
                                Apply for this job
                            </button>
                        )}
                    </div>

                    {/* Fair Recruitment Widget */}
                    <div className="bg-gradient-to-br from-dark-main via-dark-surface to-dark-card p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-brand-primary/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <h3 className="font-black text-xl mb-3 flex items-center">
                            <Shield className="mr-2 text-brand-primary" size={20} />
                            AI Screening
                        </h3>
                        <p className="text-indigo-200 text-[13px] leading-relaxed font-medium">
                            This employer uses HireChain for objective, bias-free initial screenings. Your application will be evaluated purely on skills and experience, securely verified on the blockchain.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
