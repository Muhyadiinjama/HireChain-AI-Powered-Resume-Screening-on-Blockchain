import { Database, FileCheck2, Shield, Sparkles } from 'lucide-react';
import FairnessPrivacyPanel from '../components/FairnessPrivacyPanel';

const Privacy = () => {
    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-8">
            <section className="rounded-[36px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-8 md:p-10 transition-colors duration-300">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-4 py-2 text-sm font-black text-brand-primary">
                    <Shield size={16} />
                    <span>Privacy and Fairness</span>
                </div>
                <h1 className="mt-5 text-3xl md:text-5xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                    How HireChain handles screening trust
                </h1>
                <p className="mt-5 max-w-3xl text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    HireChain is designed to make resume screening more transparent. The platform removes personal
                    identifiers before AI analysis, records candidate consent, stores verification data for auditability,
                    and lets recruiters review the result with the original resume in one controlled workflow.
                </p>
            </section>

            <FairnessPrivacyPanel
                anonymized
                consentAccepted
                consentAcceptedAt={new Date().toISOString()}
                verificationStatus="Each screening generates a verification record with hash metadata and optional blockchain transaction details."
                auditabilityCopy="Recruiters and admins can review the AI result, decision notes, resume preview, and verification trail from the same application record."
            />

            <section className="grid lg:grid-cols-3 gap-6">
                {[
                    {
                        icon: <Sparkles className="text-brand-secondary" />,
                        title: 'Anonymized AI Screening',
                        description: 'Names, emails, phone numbers, addresses, and profile links are redacted before Gemini receives resume content.'
                    },
                    {
                        icon: <FileCheck2 className="text-brand-primary" />,
                        title: 'Consent Before Screening',
                        description: 'Candidates must confirm consent before HireChain runs AI scoring and records verification metadata.'
                    },
                    {
                        icon: <Database className="text-brand-accent" />,
                        title: 'Verification and Auditability',
                        description: 'Hash records, verification IDs, and recruiter decisions are kept together so the screening flow can be audited later.'
                    }
                ].map((item) => (
                    <div
                        key={item.title}
                        className="rounded-[32px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-7 transition-colors duration-300"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-dark-main flex items-center justify-center">
                            {item.icon}
                        </div>
                        <h2 className="mt-5 text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                            {item.title}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                            {item.description}
                        </p>
                    </div>
                ))}
            </section>

            <section className="rounded-[36px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-8 md:p-10 transition-colors duration-300">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                    What recruiters can see
                </h2>
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                    <div className="rounded-3xl bg-gray-50 dark:bg-dark-main p-6 transition-colors duration-300">
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-primary/70">During review</p>
                        <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li>AI score, matched skills, missing skills, and explanation</li>
                            <li>Original uploaded resume preview or download</li>
                            <li>Verification ID, hash, and transaction metadata when available</li>
                            <li>Decision notes and status updates from pending to final outcome</li>
                        </ul>
                    </div>
                    <div className="rounded-3xl bg-gray-50 dark:bg-dark-main p-6 transition-colors duration-300">
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-primary/70">Public explorer</p>
                        <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <li>Public visitors can verify safe blockchain metadata only</li>
                            <li>Candidate identity and application details are restricted to admins</li>
                            <li>Verification records remain visible without exposing sensitive applicant data</li>
                            <li>This separation supports trust without leaking private screening details</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Privacy;
