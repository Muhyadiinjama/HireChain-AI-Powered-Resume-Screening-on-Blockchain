import type { ApplicationStatus } from '../types/models';

export const applicationStatusOrder: ApplicationStatus[] = [
    'pending',
    'shortlisted',
    'interview',
    'accepted',
    'rejected'
];

export const applicationStatusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interview' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
] as const;

export const getApplicationStatusMeta = (status: ApplicationStatus = 'pending') => {
    switch (status) {
        case 'shortlisted':
            return {
                label: 'Shortlisted',
                badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800',
                button: 'bg-sky-600 hover:bg-sky-700 text-white',
                description: 'Recruiter has advanced this application for closer review.'
            };
        case 'interview':
            return {
                label: 'Interview',
                badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800',
                button: 'bg-violet-600 hover:bg-violet-700 text-white',
                description: 'Candidate is ready for interview coordination.'
            };
        case 'accepted':
            return {
                label: 'Accepted',
                badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
                button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
                description: 'The application has been approved by the recruiter.'
            };
        case 'rejected':
            return {
                label: 'Rejected',
                badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
                button: 'bg-rose-600 hover:bg-rose-700 text-white',
                description: 'The application was reviewed and not selected.'
            };
        default:
            return {
                label: 'Pending',
                badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
                button: 'bg-amber-500 hover:bg-amber-600 text-white',
                description: 'This application is waiting for recruiter review.'
            };
    }
};

export const scoreBandOptions = [
    { value: 'all', label: 'All scores' },
    { value: '0-49', label: '0-49' },
    { value: '50-69', label: '50-69' },
    { value: '70-84', label: '70-84' },
    { value: '85-100', label: '85-100' }
] as const;
