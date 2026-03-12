import { CheckCircle2, Database, FileCheck2, Shield } from 'lucide-react';

type FairnessPrivacyPanelProps = {
    anonymized: boolean;
    consentAccepted: boolean;
    consentAcceptedAt?: string | null;
    verificationStatus: string;
    auditabilityCopy: string;
    className?: string;
};

const FairnessPrivacyPanel = ({
    anonymized,
    consentAccepted,
    consentAcceptedAt,
    verificationStatus,
    auditabilityCopy,
    className = ''
}: FairnessPrivacyPanelProps) => {
    const consentLabel = consentAccepted
        ? consentAcceptedAt
            ? `Captured ${new Date(consentAcceptedAt).toLocaleDateString()}`
            : 'Captured before submission'
        : 'Required before submission';

    const items = [
        {
            icon: Shield,
            title: 'Anonymized Screening',
            description: anonymized
                ? 'Name, email, phone, address, and profile links are removed before AI scoring.'
                : 'Legacy screening result without anonymization metadata.'
        },
        {
            icon: CheckCircle2,
            title: 'Candidate Consent',
            description: consentLabel
        },
        {
            icon: FileCheck2,
            title: 'Verification Process',
            description: verificationStatus
        },
        {
            icon: Database,
            title: 'Auditability',
            description: auditabilityCopy
        }
    ];

    return (
        <section className={`rounded-[28px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface shadow-sm p-6 transition-colors duration-300 ${className}`}>
            <div className="mb-5">
                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-primary/70">Ethics and Privacy</p>
                <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">Fairness and Trust Controls</h3>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/90 dark:bg-dark-main/70 p-4 transition-colors duration-300"
                        >
                            <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                                <Icon size={18} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">
                                {item.title}
                            </p>
                            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                {item.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default FairnessPrivacyPanel;
