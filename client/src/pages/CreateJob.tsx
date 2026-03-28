import { useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, FileText, MapPin, DollarSign, AlignLeft,
    CheckCircle, ChevronDown, Check,
    Zap
} from 'lucide-react';
import { JOB_CATEGORY_LABELS, getSubcategoriesForCategory } from '../constants/jobCategories';
import { createJob } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { JobMutationPayload } from '../types/models';

const CreateJob = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        salaryRange: '',
        description: '',
        requirements: '',
        experienceLevel: 'Mid Level (2-5 years)',
        category: '',
        subcategory: ''
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const availableSubcategories = getSubcategoriesForCategory(formData.category);
    const fieldClassName = 'w-full px-5 py-3.5 bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-gray-800 rounded-2xl focus:bg-white dark:focus:bg-dark-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400';
    const textAreaClassName = 'w-full px-5 py-4 bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-dark-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary transition-all text-sm leading-relaxed placeholder:text-gray-500 dark:placeholder:text-gray-400';
    const selectClassName = 'w-full px-5 py-3.5 bg-gray-50 dark:bg-dark-main border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-dark-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary transition-all font-medium appearance-none';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((current) => ({
            ...current,
            [name]: value,
            ...(name === 'category' ? { subcategory: '' } : {})
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: JobMutationPayload = {
                ...formData,
                tags: formData.requirements.split(',').map(s => s.trim())
            };
            await createJob(payload);
            toast.success('Job published successfully!');
            navigate('/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg = error.response?.data?.message || 'Failed to publish job. Please check all required fields.';
            toast.error(errorMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-main transition-colors duration-300">
            <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto w-full max-w-3xl rounded-[32px] border border-gray-200/70 bg-white p-6 shadow-xl shadow-gray-200/40 dark:border-gray-800 dark:bg-dark-surface dark:shadow-black/20 md:p-10"
                >
                    {/* Header */}
                    <div className="flex items-center space-x-3 md:space-x-4 mb-2">
                        <div className="bg-brand-primary/10 dark:bg-brand-primary/20 p-2 md:p-2.5 rounded-xl text-brand-primary dark:text-brand-primary transition-colors duration-300">
                            <Briefcase size={22} className="md:w-7 md:h-7" />
                        </div>
                        <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">Create New Job Post</h1>
                    </div>
                    <p className="text-xs md:text-base text-gray-500 dark:text-gray-400 mb-8 md:mb-10 ml-1 transition-colors duration-300">Fill in the details to post a new job opening on HireChain.</p>

                    <div className="mb-8 rounded-3xl border border-brand-primary/15 bg-brand-primary/[0.06] p-5 transition-colors duration-300">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary/70 mb-2">Company Profile</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">
                            {user?.company || 'Add your company in Profile Settings'}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                            This job post will automatically use your recruiter/admin company profile everywhere in the platform.
                        </p>
                    </div>

                    <div className="space-y-10">
                        {/* Section 1: Basic Information */}
                        <section>
                            <div className="flex items-center space-x-3 mb-6">
                                <FileText className="text-brand-primary dark:text-brand-primary transition-colors" size={20} />
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors">Basic Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Job Title *</label>
                                    <input
                                        required
                                        name="title"
                                        placeholder="e.g., Senior Frontend Developer"
                                        className={fieldClassName}
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Department *</label>
                                    <input
                                        required
                                        name="department"
                                        placeholder="e.g., Engineering"
                                        className={fieldClassName}
                                        value={formData.department}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Location *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" size={18} />
                                        <input
                                            required
                                            name="location"
                                            placeholder="e.g., Remote, New York, N"
                                            className={`${fieldClassName} pl-12 pr-5`}
                                            value={formData.location}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Employment Type *</label>
                                    <div className="relative">
                                        <select
                                            name="type"
                                            className={selectClassName}
                                            value={formData.type}
                                            onChange={handleChange}
                                        >
                                            <option>Full-time</option>
                                            <option>Part-time</option>
                                            <option>Contract</option>
                                            <option>Internship</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" size={18} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Salary Range *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" size={18} />
                                        <input
                                            required
                                            name="salaryRange"
                                            placeholder="e.g., $120,000 - $160,000"
                                            className={`${fieldClassName} pl-12 pr-5`}
                                            value={formData.salaryRange}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Job Description */}
                        <section>
                            <div className="flex items-center space-x-3 mb-6">
                                <AlignLeft className="text-brand-secondary dark:text-brand-secondary transition-colors" size={20} />
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors">Job Description</h3>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Description *</label>
                                <textarea
                                    required
                                    name="description"
                                    rows={4}
                                    placeholder="Describe the role, key responsibilities, team culture, and what makes this opportunity exciting..."
                                    className={textAreaClassName}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        {/* Section 3: Requirements & Skills */}
                        <section>
                            <div className="flex items-center space-x-3 mb-6">
                                <CheckCircle className="text-brand-accent border-none dark:text-brand-accent transition-colors" size={20} />
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors">Requirements & Skills</h3>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Required Skills & Qualifications *</label>
                                <textarea
                                    required
                                    name="requirements"
                                    rows={3}
                                    placeholder="Enter skills separated by commas. For example: React, TypeScript, 5+ years experience, Node.js..."
                                    className={textAreaClassName}
                                    value={formData.requirements}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">Our AI will use these requirements to match and score candidates</p>
                            </div>
                        </section>

                        {/* Section 4: Additional Details */}
                        <section>
                            <div className="flex items-center space-x-3 mb-6">
                                <Zap className="text-brand-secondary dark:text-brand-secondary transition-colors" size={20} />
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors">Additional Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-3">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Experience Level</label>
                                    <div className="relative">
                                        <select
                                            name="experienceLevel"
                                            className={selectClassName}
                                            value={formData.experienceLevel}
                                            onChange={handleChange}
                                        >
                                            <option>Entry Level (0-2 years)</option>
                                            <option>Mid Level (2-5 years)</option>
                                            <option>Senior Level (5-10 years)</option>
                                            <option>Lead/Executive (10+ years)</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" size={18} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Job Category *</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            required
                                            className={selectClassName}
                                            value={formData.category}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled>Select a job category</option>
                                            {JOB_CATEGORY_LABELS.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" size={18} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Job Subcategory *</label>
                                    <div className="relative">
                                        <select
                                            name="subcategory"
                                            required
                                            disabled={!formData.category}
                                            className={`${selectClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                                            value={formData.subcategory}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled>
                                                {formData.category ? 'Select a subcategory' : 'Choose category first'}
                                            </option>
                                            {availableSubcategories.map((subcategory) => (
                                                <option key={subcategory} value={subcategory}>{subcategory}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" size={18} />
                                    </div>
                                </div>
                            </div>
                            <p className="mb-8 text-xs text-gray-500 dark:text-gray-400">
                                Select a main category first, then choose the professional subcategory that best matches this role.
                            </p>

                            {/* AI Enabled Banner */}
                             <div className="bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 dark:border-brand-primary/30 p-5 rounded-2xl flex items-start space-x-4 transition-colors">
                                <div className="bg-white dark:bg-dark-surface p-2 rounded-xl text-brand-primary dark:text-brand-primary shadow-sm shrink-0 transition-colors">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <p className="text-brand-primary dark:text-brand-primary font-bold mb-0.5 transition-colors">AI-Powered Screening Enabled</p>
                                    <p className="text-[13px] text-brand-primary/80 dark:text-brand-primary/60 font-medium transition-colors">
                                        All applicants will be automatically screened by our bias-free AI and results will be verified on the blockchain for complete transparency.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center space-x-4 mt-12 pt-8 border-t border-gray-50 dark:border-gray-800 transition-colors">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 active:scale-95"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check size={20} className="stroke-[3px]" />
                                    <span>Publish Job Post</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-4 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-dark-main hover:border-gray-300 dark:hover:border-gray-600 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;
