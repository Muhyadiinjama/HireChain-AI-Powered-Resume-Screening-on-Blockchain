import type { ApplicationStatus, Job, ScreeningRecord } from '../types/models';

export type RecruiterCandidateFilters = {
    search: string;
    status: 'all' | ApplicationStatus;
    scoreBand: 'all' | '0-49' | '50-69' | '70-84' | '85-100';
    skill: string;
};

export const emptyRecruiterCandidateFilters: RecruiterCandidateFilters = {
    search: '',
    status: 'all',
    scoreBand: 'all',
    skill: ''
};

export const matchesScoreBand = (score: number, band: RecruiterCandidateFilters['scoreBand']) => {
    if (band === 'all') {
        return true;
    }

    if (band === '0-49') {
        return score < 50;
    }

    if (band === '50-69') {
        return score >= 50 && score < 70;
    }

    if (band === '70-84') {
        return score >= 70 && score < 85;
    }

    return score >= 85;
};

export const filterRecruiterCandidates = (
    recruiterCandidates: ScreeningRecord[],
    filters: RecruiterCandidateFilters
) => {
    const normalizedSearch = filters.search.trim().toLowerCase();
    const normalizedSkill = filters.skill.trim().toLowerCase();

    return recruiterCandidates.filter((candidate) => {
        const candidateName = candidate.candidateId?.userId?.name?.toLowerCase() || '';
        const candidateEmail = candidate.candidateId?.userId?.email?.toLowerCase() || candidate.candidateId?.email?.toLowerCase() || '';
        const jobTitle = candidate.candidateId?.jobId?.title?.toLowerCase() || '';
        const status = candidate.candidateId?.applicationStatus || 'pending';
        const skills = [...(candidate.skills || []), ...(candidate.missingSkills || [])].map((skill) => skill.toLowerCase());
        const score = candidate.score || 0;

        const matchesSearch = !normalizedSearch || [
            candidateName,
            candidateEmail,
            jobTitle,
            status
        ].some((value) => value.includes(normalizedSearch));

        const matchesStatus = filters.status === 'all' || status === filters.status;
        const matchesBand = matchesScoreBand(score, filters.scoreBand);
        const matchesSkill = !normalizedSkill || skills.some((skill) => skill.includes(normalizedSkill));

        return matchesSearch && matchesStatus && matchesBand && matchesSkill;
    });
};

export const buildDecisionCounts = (recruiterCandidates: ScreeningRecord[]) =>
    recruiterCandidates.reduce<Record<ApplicationStatus, number>>(
        (acc, candidate) => {
            const status = candidate.candidateId?.applicationStatus || 'pending';
            acc[status] += 1;
            return acc;
        },
        { pending: 0, shortlisted: 0, interview: 0, accepted: 0, rejected: 0 }
    );

export const buildSkillFrequency = (
    recruiterCandidates: ScreeningRecord[],
    selector: (candidate: ScreeningRecord) => string[] | undefined
) =>
    Object.entries(
        recruiterCandidates.reduce<Record<string, number>>((acc, candidate) => {
            (selector(candidate) || []).forEach((skill) => {
                const normalizedSkill = skill.trim();
                if (!normalizedSkill) {
                    return;
                }

                acc[normalizedSkill] = (acc[normalizedSkill] || 0) + 1;
            });
            return acc;
        }, {})
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

export const buildCandidatePipelineByJob = (
    jobs: Job[],
    recruiterCandidates: ScreeningRecord[]
) =>
    jobs
        .map((job) => {
            const applicants = recruiterCandidates.filter((candidate) => {
                const linkedJobId = candidate.candidateId?.jobId?._id || candidate.candidateId?.jobId;
                return linkedJobId === job._id;
            });

            const pipeline = applicants.reduce<Record<ApplicationStatus, number>>(
                (acc, candidate) => {
                    const status = candidate.candidateId?.applicationStatus || 'pending';
                    acc[status] += 1;
                    return acc;
                },
                { pending: 0, shortlisted: 0, interview: 0, accepted: 0, rejected: 0 }
            );

            return {
                job,
                total: applicants.length,
                averageScore: applicants.length
                    ? Math.round(applicants.reduce((acc, candidate) => acc + (candidate.score || 0), 0) / applicants.length)
                    : 0,
                ...pipeline
            };
        })
        .sort((a, b) => b.total - a.total || b.averageScore - a.averageScore);

export const buildDailyTrend = (recruiterCandidates: ScreeningRecord[], days = 7) => {
    const items = Array.from({ length: days }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (days - index - 1));
        return date;
    });

    return items.map((date) => {
        const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const sameDayCandidates = recruiterCandidates.filter((candidate) => {
            const candidateDate = new Date(candidate.createdAt);
            candidateDate.setHours(0, 0, 0, 0);
            return candidateDate.getTime() === date.getTime();
        });

        return {
            label,
            count: sameDayCandidates.length,
            averageScore: sameDayCandidates.length
                ? Math.round(sameDayCandidates.reduce((acc, candidate) => acc + (candidate.score || 0), 0) / sameDayCandidates.length)
                : 0
        };
    });
};

export const buildDepartmentStats = (jobs: Job[], recruiterCandidates: ScreeningRecord[]) =>
    Object.values(
        jobs.reduce<Record<string, {
            department: string;
            applicants: number;
            averageScore: number;
            pending: number;
            shortlisted: number;
            interview: number;
            accepted: number;
            rejected: number;
        }>>((acc, job) => {
            const department = job.department || 'Unassigned';
            if (!acc[department]) {
                acc[department] = {
                    department,
                    applicants: 0,
                    averageScore: 0,
                    pending: 0,
                    shortlisted: 0,
                    interview: 0,
                    accepted: 0,
                    rejected: 0
                };
            }

            const applicants = recruiterCandidates.filter((candidate) => {
                const linkedJobId = candidate.candidateId?.jobId?._id || candidate.candidateId?.jobId;
                return linkedJobId === job._id;
            });
            const totalScore = applicants.reduce((accScore, candidate) => accScore + (candidate.score || 0), 0);

            acc[department].applicants += applicants.length;
            acc[department].averageScore += totalScore;
            applicants.forEach((candidate) => {
                const status = candidate.candidateId?.applicationStatus || 'pending';
                acc[department][status] += 1;
            });
            return acc;
        }, {})
    )
        .map((department) => ({
            ...department,
            averageScore: department.applicants ? Math.round(department.averageScore / department.applicants) : 0
        }))
        .sort((a, b) => b.applicants - a.applicants || b.averageScore - a.averageScore);

export const buildFairnessAlerts = (recruiterCandidates: ScreeningRecord[]) =>
    recruiterCandidates.filter((candidate) => {
        const status = candidate.candidateId?.applicationStatus || 'pending';
        const score = candidate.score || 0;

        return (status === 'accepted' && score < 60) || (status === 'rejected' && score >= 80);
    });
