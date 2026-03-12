export type UserRole = 'admin' | 'recruiter' | 'candidate';
export type ApplicationStatus = 'pending' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';

export interface DBUser {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    company?: string;
    firebaseUID: string;
}

export type JobStatus = 'Active' | 'Closed';

export interface Job {
    _id: string;
    title: string;
    company?: string;
    location?: string;
    type?: string;
    salaryRange?: string;
    description?: string;
    tags?: string[];
    department?: string;
    experienceLevel?: string;
    category?: string;
    status?: JobStatus;
    createdBy?: string | DBUser;
    applicationLink?: string;
    createdAt: string;
}

export interface JobMutationPayload {
    title?: string;
    department?: string;
    location?: string;
    type?: string;
    salaryRange?: string;
    description?: string;
    requirements?: string;
    experienceLevel?: string;
    category?: string;
    tags?: string[];
    status?: JobStatus;
}

export interface CandidateRecord {
    _id: string;
    email: string;
    userId?: Pick<DBUser, '_id' | 'name' | 'email'>;
    resumeURL?: string;
    resumeOriginalName?: string;
    resumeMimeType?: string;
    candidateProfileText?: string;
    consentAccepted?: boolean;
    consentAcceptedAt?: string | null;
    applicationStatus?: ApplicationStatus;
    decisionNotes?: string;
    reviewedAt?: string | null;
    jobId?: Job;
    createdAt: string;
}

export interface BlockchainLog {
    _id: string;
    hash: string;
    timestamp: string;
    candidateId?: CandidateRecord;
    verificationId: string;
    txHash?: string;
    blockNumber?: number | null;
    contractAddress?: string;
    chainId?: number;
    network?: string;
    onChainConfirmed?: boolean;
    explorerUrl?: string;
}

export interface BlockchainLogResponse {
    success: boolean;
    log?: BlockchainLog;
    viewerCanSeeSensitiveDetails?: boolean;
}

export interface BlockchainLogsResponse {
    success: boolean;
    logs: BlockchainLog[];
    viewerCanSeeSensitiveDetails?: boolean;
}

export interface ScreeningRecord {
    _id: string;
    candidateId?: CandidateRecord;
    candidate?: CandidateRecord;
    score: number;
    skills?: string[];
    missingSkills?: string[];
    aiExplanation?: string;
    analysisMode?: string;
    anonymizedAnalysis?: boolean;
    redactedFields?: string[];
    resumeParser?: string;
    anonymizationWarnings?: string[];
    blockchain?: BlockchainLog | null;
    createdAt: string;
}

export interface ApplicationRecord {
    _id: string;
    email: string;
    applicationStatus?: ApplicationStatus;
    decisionNotes?: string;
    reviewedAt?: string | null;
    consentAccepted?: boolean;
    consentAcceptedAt?: string | null;
    job?: Job;
    screening?: ScreeningRecord | null;
    blockchain?: BlockchainLog | null;
    createdAt: string;
}

export interface ApplicationResultData {
    success: boolean;
    candidate?: CandidateRecord;
    job?: Job;
    screening?: ScreeningRecord | null;
    blockchain?: BlockchainLog | null;
}

export interface CandidateReviewData {
    success: boolean;
    candidate?: CandidateRecord;
    screening?: ScreeningRecord | null;
    blockchain?: BlockchainLog | null;
    message?: string;
}
