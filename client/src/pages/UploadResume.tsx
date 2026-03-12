import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FileText, Sparkles, CheckCircle2, 
    Briefcase, MapPin, DollarSign, Clock, Users,
    User, Link as LinkIcon, GraduationCap, Code, FileSignature, HelpCircle, Building2, UploadCloud, Shield, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getJobById, screenResume } from '../services/api';
import FairnessPrivacyPanel from '../components/FairnessPrivacyPanel';
import type { Job } from '../types/models';

const UploadResume = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState<Job | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [consentAccepted, setConsentAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [jobLoading, setJobLoading] = useState(true);
    const navigate = useNavigate();

    // Form state (mostly for UI realism as requested)
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', currentLocation: '',
        linkedin: '', github: '', portfolio: '',
        recentRole: '', recentCompany: '', experience: '',
        educationLevel: '', fieldOfStudy: '', gradYear: '',
        technicalSkills: '', languages: '',
        coverLetter: '', availability: '', expectedSalary: '', authorization: '', relocate: ''
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await getJobById(jobId!);
                setJob(res.data.job);
            } catch (err) {
                console.error(err);
            } finally {
                setJobLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            const isPlainTextFile =
                selectedFile.type.startsWith('text/') ||
                /\.(txt|md|rtf)$/i.test(selectedFile.name);

            if (!isPlainTextFile) {
                setResumeText('');
                toast('Your resume will be parsed on the server and anonymized before AI analysis.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (evt) => {
                const text = evt.target?.result as string;
                setResumeText(text || '');
            };
            reader.onerror = () => {
                setResumeText('');
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please upload a resume file first');
            return;
        }
        if (!consentAccepted) {
            toast.error('Please confirm consent for anonymized AI screening and verification.');
            return;
        }

        setLoading(true);
        try {
            const candidateProfileText = `
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
Location: ${formData.currentLocation}
Current Role: ${formData.recentRole}
Company: ${formData.recentCompany}
Experience: ${formData.experience} years
Education: ${formData.educationLevel} in ${formData.fieldOfStudy} (${formData.gradYear})
Technical Skills: ${formData.technicalSkills}
Languages: ${formData.languages}
Cover Letter: ${formData.coverLetter}
LinkedIn: ${formData.linkedin}
GitHub: ${formData.github}
Portfolio: ${formData.portfolio}
            `.trim();

            const submitData = new FormData();
            submitData.append('resume', file);
            submitData.append('email', formData.email || 'applicant@example.com');
            submitData.append('jobId', jobId!);
            submitData.append('candidateProfileText', candidateProfileText);
            submitData.append('resumeText', resumeText);
            submitData.append('consentAccepted', String(consentAccepted));

            const res = await screenResume(submitData);
            toast.success('Application submitted! AI screening in progress...');
            navigate(`/result/${res.data.result._id}`, { state: { verification: res.data.verification } });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const msg = error.response?.data?.message || 'Screening failed. Please try again.';
            toast.error(msg);
            console.error('Submit error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (jobLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8faff] dark:bg-dark-main transition-colors duration-300">
            <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading application...</p>
        </div>
    );

    const calculateProgress = () => {
        const requiredFields = [
            formData.firstName,
            formData.lastName,
            formData.email,
            formData.phone,
            formData.currentLocation,
            formData.recentRole,
            formData.experience,
            formData.educationLevel,
            formData.technicalSkills,
            formData.availability,
            formData.authorization,
            file,
            consentAccepted
        ];
        
        const filled = requiredFields.filter(field => {
            if (typeof field === 'string') return field.trim() !== '';
            if (typeof field === 'boolean') return field;
            return field !== null;
        }).length;
        
        return Math.floor((filled / requiredFields.length) * 100);
    };

    const progressValue = calculateProgress();

    const inputClass = "w-full bg-[#f8fafc] dark:bg-dark-main border border-transparent dark:border-gray-800 focus:bg-white dark:focus:bg-dark-surface focus:border-brand-primary rounded-xl px-4 py-3 text-sm transition-all outline-none text-gray-700 dark:text-white shadow-sm hover:border-gray-200 dark:hover:border-gray-700";
    const labelClass = "block text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors duration-300";

    return (
        <div className="min-h-screen bg-[#f8faff] dark:bg-dark-main font-sans pb-20 transition-colors duration-300">
            {/* Sticky Progress Bar - Positioned below Navbar */}
            <div className="sticky top-[73px] md:top-[80px] z-30 bg-white/80 dark:bg-dark-main/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-4 md:px-6 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider mb-1.5">
                                <span className="text-gray-500 dark:text-gray-400">Application Strength</span>
                                <span className="text-brand-primary dark:text-brand-primary">{progressValue}%</span>
                            </div>
                            <div className="w-full bg-gray-200/50 dark:bg-gray-800/50 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent h-full rounded-full transition-all duration-700 ease-out" 
                                    style={{ width: `${progressValue}%` }} 
                                />
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${progressValue === 100 ? 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                {progressValue === 100 ? <Check size={16} strokeWidth={3} /> : <FileText size={16} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-6 md:gap-8 mt-6 md:mt-8">
                {/* Left Sidebar */}
                <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                    {/* Job Details Card - Sticky on Desktop */}
                    <div className="sticky top-[140px] bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center text-white mb-4 shadow-md">
                            <Building2 size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1">{job?.title}</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-6">{job?.company || 'TechCorp Inc.'}</p>
                        
                        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                            <div className="flex items-center space-x-3"><MapPin size={16} className="text-gray-400 dark:text-gray-500" /><span>{job?.location || 'Remote'}</span></div>
                            <div className="flex items-center space-x-3"><Briefcase size={16} className="text-gray-400 dark:text-gray-500" /><span>{job?.type || 'Full-time'}</span></div>
                            <div className="flex items-center space-x-3"><DollarSign size={16} className="text-gray-400 dark:text-gray-500" /><span>{job?.salaryRange || '$120,000 - $160,000'}</span></div>
                            <div className="flex items-center space-x-3"><Clock size={16} className="text-gray-400 dark:text-gray-500" /><span>{job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : '2 days ago'}</span></div>
                        </div>

                        <hr className="my-6 border-gray-100 dark:border-gray-800" />

                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center"><CheckCircle2 size={16} className="mr-2 text-brand-primary dark:text-brand-primary" /> Key Responsibilities</h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-5">
                                <li>Build and maintain high-quality web applications.</li>
                                <li>Collaborate with design and product teams.</li>
                                <li>Mentor junior developers.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center"><Code size={16} className="mr-2 text-brand-secondary dark:text-brand-secondary" /> Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {(job?.tags && job.tags.length > 0 ? job.tags : ['React', 'TypeScript', 'Node.js', 'Next.js']).map((tag: string, i: number) => (
                                    <span key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg text-xs font-bold">{tag}</span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex flex-col justify-center items-center text-center border border-blue-100 dark:border-blue-800">
                            <Users size={20} className="text-brand-primary dark:text-brand-primary mb-1" />
                            <p className="text-xs font-bold text-brand-primary dark:text-brand-primary">24 Applicants</p>
                            <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1">Hiring Team typically responds in 3 days</p>
                        </div>
                    </div>
                </div>

                {/* Right Form Area */}
                <div className="flex-1 space-y-6">
                    {/* Banner */}
                    <div className="bg-[#f0f4ff] dark:bg-indigo-900/20 border border-[#dbeafe] dark:border-indigo-800 p-5 rounded-3xl flex items-start space-x-4 transition-colors duration-300">
                        <div className="bg-brand-primary p-2.5 rounded-xl text-white shrink-0 shadow-sm mt-1">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-primary dark:text-brand-primary text-sm mb-1">AI-Powered Fair Screening Process</h4>
                            <p className="text-brand-primary/80 dark:text-brand-primary/60 text-[13px] leading-relaxed">
                                Your application is screened using anonymized resume text. We remove personal identifiers such as name, email, phone, address, and profile links before the AI evaluates role fit.
                            </p>
                        </div>
                    </div>

                    <FairnessPrivacyPanel
                        anonymized
                        consentAccepted={consentAccepted}
                        verificationStatus="Resume hash and screening metadata are logged for recruiter verification and blockchain traceability."
                        auditabilityCopy="Recruiters can review the AI result, verification record, and resume preview in one transparent audit trail."
                    />

                    {/* Main Form container */}
                    <motion.form 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        onSubmit={handleSubmit} 
                        className="bg-white dark:bg-dark-surface rounded-[28px] md:rounded-[32px] p-5 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                    >
                        <div className="mb-6 md:mb-8">
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center"><FileSignature className="mr-3 text-brand-primary dark:text-brand-primary" /> Application Form</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-2">Fill out all required fields to submit your application. Fields marked with * are required.</p>
                        </div>

                        <div className="space-y-10">
                            {/* Section 1 */}
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                            >
                                <h3 className="text-lg font-bold flex items-center mb-5"><User size={20} className="mr-2 text-brand-primary dark:text-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20 p-1 rounded-md" /> Personal Information</h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>First Name *</label>
                                        <input required type="text" className={inputClass} placeholder="John" onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Last Name *</label>
                                        <input required type="text" className={inputClass} placeholder="Doe" onChange={(e) => setFormData({...formData, lastName: e.target.value})}/>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Email Address *</label>
                                        <input required type="email" className={inputClass} placeholder="john.doe@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Phone Number *</label>
                                        <input required type="tel" className={inputClass} placeholder="+1 (555) 000-0000" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Current Location *</label>
                                        <input required type="text" className={inputClass} placeholder="e.g. San Francisco, CA" onChange={(e) => setFormData({...formData, currentLocation: e.target.value})} />
                                    </div>
                                </div>
                            </motion.div>

                            <hr className="border-gray-100 dark:border-gray-800" />

                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                            >
                                <h3 className="text-lg font-bold flex items-center mb-5"><LinkIcon size={20} className="mr-2 text-brand-secondary dark:text-brand-secondary bg-brand-secondary/10 dark:bg-brand-secondary/20 p-1 rounded-md" /> Professional Links</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className={labelClass}>LinkedIn Profile</label>
                                        <input type="url" className={inputClass} placeholder="linkedin.com/in/johndoe" onChange={(e) => setFormData({...formData, linkedin: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>GitHub Profile</label>
                                        <input type="url" className={inputClass} placeholder="github.com/johndoe" onChange={(e) => setFormData({...formData, github: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Portfolio / Personal Website</label>
                                        <input type="url" className={inputClass} placeholder="https://johndoe.com" onChange={(e) => setFormData({...formData, portfolio: e.target.value})} />
                                    </div>
                                </div>
                            </motion.div>

                            <hr className="border-gray-100 dark:border-gray-800" />

                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                            >
                                <h3 className="text-lg font-bold flex items-center mb-5"><Briefcase size={20} className="mr-2 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 p-1 rounded-md" /> Professional Background</h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>Current/Most Recent Role *</label>
                                        <input required type="text" className={inputClass} placeholder="e.g. Frontend Developer" onChange={(e) => setFormData({...formData, recentRole: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Current/Most Recent Company</label>
                                        <input type="text" className={inputClass} placeholder="e.g. TechCo" onChange={(e) => setFormData({...formData, recentCompany: e.target.value})} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Total Years of Experience *</label>
                                        <select required className={inputClass} onChange={(e) => setFormData({...formData, experience: e.target.value})}>
                                            <option value="">Select experience level</option>
                                            <option value="0-1">0-1 Years</option>
                                            <option value="1-3">1-3 Years</option>
                                            <option value="3-5">3-5 Years</option>
                                            <option value="5-10">5-10 Years</option>
                                            <option value="10+">10+ Years</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>

                            <hr className="border-gray-100 dark:border-gray-800" />

                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                            >
                                <h3 className="text-lg font-bold flex items-center mb-5"><GraduationCap size={20} className="mr-2 text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 p-1 rounded-md" /> Education</h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>Highest Education Level *</label>
                                        <select required className={inputClass} onChange={(e) => setFormData({...formData, educationLevel: e.target.value})}>
                                            <option value="">Select education level</option>
                                            <option value="highschool">High School</option>
                                            <option value="bachelors">Bachelor's Degree</option>
                                            <option value="masters">Master's Degree</option>
                                            <option value="phd">Ph.D.</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Field of Study</label>
                                        <input type="text" className={inputClass} placeholder="e.g. Computer Science" onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Graduation Year</label>
                                        <input type="text" className={inputClass} placeholder="e.g. 2020" onChange={(e) => setFormData({...formData, gradYear: e.target.value})} />
                                    </div>
                                </div>
                            </motion.div>
                            
                            <hr className="border-gray-100 dark:border-gray-800" />

                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                            >
                                <h3 className="text-lg font-bold flex items-center mb-5"><Code size={20} className="mr-2 text-brand-accent dark:text-brand-accent bg-brand-accent/10 dark:bg-brand-accent/20 p-1 rounded-md" /> Skills & Languages</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className={labelClass}>Technical Skills *</label>
                                        <textarea required rows={3} className={inputClass} placeholder="List your technical skills separated by commas (e.g. React, TypeScript, Node.js, AWS...)" onChange={(e) => setFormData({...formData, technicalSkills: e.target.value})}></textarea>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Languages Spoken</label>
                                        <input type="text" className={inputClass} placeholder="e.g. English (Native), Spanish (Fluent)" onChange={(e) => setFormData({...formData, languages: e.target.value})} />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                            >
                                <h3 className="text-lg font-bold flex items-center mb-5"><FileText size={20} className="mr-2 text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30 p-1 rounded-md" /> Resume & Documents</h3>
                                <label className={labelClass}>Upload your resume for AI analysis *</label>
                                <motion.div 
                                    whileHover={{ scale: 1.005 }}
                                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[28px] md:rounded-3xl p-6 md:p-10 text-center hover:border-brand-primary dark:hover:border-brand-primary transition-all bg-[#f8fafc] dark:bg-gray-900 group relative cursor-pointer"
                                >
                                    <input type="file" required accept=".pdf,.doc,.docx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                                    <div className="flex flex-col items-center">
                                        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm mb-4 text-brand-primary group-hover:scale-110 group-hover:bg-brand-primary/10 dark:group-hover:bg-brand-primary/20 transition-all">
                                            {file ? <FileText size={32} /> : <UploadCloud size={32} />}
                                        </div>
                                        {file ? (
                                            <div>
                                                <p className="text-gray-900 dark:text-white font-bold text-lg mb-1">{file.name}</p>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">{(file.size / 1024).toFixed(1)} KB • Click or drag to replace</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-gray-900 dark:text-white font-bold text-lg mb-2">Click to upload your resume</p>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">or drag and drop your file here</p>
                                                <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">PDF, DOCX up to 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                                <div className="mt-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl flex items-start space-x-3 text-sm text-blue-700 dark:text-blue-300">
                                    <Sparkles size={18} className="text-blue-500 mt-0.5 shrink-0" />
                                    <p>The uploaded resume is converted to text on the server, anonymized, and then sent to the AI for skill and fit analysis.</p>
                                </div>
                            </motion.div>

                            <hr className="border-gray-100 dark:border-gray-800" />

                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                            >
                                <h3 className="text-lg font-bold flex items-center mb-5"><FileSignature size={20} className="mr-2 text-brand-primary dark:text-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20 p-1 rounded-md" /> Cover Letter</h3>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className={labelClass}>Why are you interested in this role?</label>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">Optional</span>
                                    </div>
                                    <textarea rows={4} className={inputClass} placeholder="Share your motivation, relevant experience that makes you a great fit, and how you see yourself contributing to the team. Be specific and authentic..." onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}></textarea>
                                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 text-right">0 / 2000 words</p>
                                </div>
                            </motion.div>

                            <hr className="border-gray-100 dark:border-gray-800" />

                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                            >
                                <h3 className="text-lg font-bold flex items-center mb-5"><HelpCircle size={20} className="mr-2 text-brand-accent dark:text-brand-accent bg-brand-accent/10 dark:bg-brand-accent/20 p-1 rounded-md" /> Additional Information</h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>Availability to Start *</label>
                                        <select required className={inputClass} onChange={(e) => setFormData({...formData, availability: e.target.value})}>
                                            <option value="">Select availability</option>
                                            <option value="immediate">Immediate</option>
                                            <option value="2weeks">2 Weeks Notice</option>
                                            <option value="1month">1 Month Notice</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Expected Salary Range</label>
                                        <input type="text" className={inputClass} placeholder="e.g. $120,000 - $140,000" onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Work Authorization *</label>
                                        <select required className={inputClass} onChange={(e) => setFormData({...formData, authorization: e.target.value})}>
                                            <option value="">Please select</option>
                                            <option value="citizen">Citizen / Permanent Resident</option>
                                            <option value="visa">Require Visa Sponsorship</option>
                                            <option value="authorized">Authorized to work</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Willing to Relocate?</label>
                                        <select className={inputClass} onChange={(e) => setFormData({...formData, relocate: e.target.value})}>
                                            <option value="">Please select</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                            <option value="remote">Remote Only</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>

                            {/* What happens next card */}
                            <div className="bg-[#f8faff] dark:bg-indigo-900/10 border border-[#e0e7ff] dark:border-indigo-900/30 rounded-2xl p-6 relative overflow-hidden transition-colors duration-300">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                    <Shield className="text-brand-primary dark:text-brand-primary" size={18} />
                                    <span>What happens next?</span>
                                </h4>
                                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-start"><CheckCircle2 size={16} className="text-emerald-500 mr-2 mt-0.5 shrink-0" /> Your application receives transparent AI analysis within minutes</li>
                                    <li className="flex items-start"><CheckCircle2 size={16} className="text-emerald-500 mr-2 mt-0.5 shrink-0" /> Personal identifiers are removed before your resume is sent to AI</li>
                                    <li className="flex items-start"><CheckCircle2 size={16} className="text-emerald-500 mr-2 mt-0.5 shrink-0" /> Receive detailed match score with skill breakdown</li>
                                    <li className="flex items-start"><CheckCircle2 size={16} className="text-emerald-500 mr-2 mt-0.5 shrink-0" /> Results verified and recorded to blockchain</li>
                                    <li className="flex items-start"><CheckCircle2 size={16} className="text-emerald-500 mr-2 mt-0.5 shrink-0" /> Hiring team notified if you meet initial qualifications</li>
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-dark-main/70 p-6 transition-colors duration-300">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={consentAccepted}
                                        onChange={(event) => setConsentAccepted(event.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                            I consent to anonymized AI screening and verification logging.
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                            HireChain will remove personal identifiers before AI analysis and store screening metadata for recruiter review, verification, and auditability.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="mt-8 md:mt-10 flex flex-col-reverse sm:flex-row items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6 md:pt-8 transition-colors duration-300 gap-4">
                            <button type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto px-6 py-3 font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all">Cancel</button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white px-6 md:px-10 py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 sm:min-w-[200px]"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={18} />
                                        <span>Submit Application</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.form>
                </div>
            </div>
        </div>
    );
};

export default UploadResume;
