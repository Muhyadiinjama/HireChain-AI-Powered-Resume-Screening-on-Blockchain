import { describe, expect, it } from 'vitest';
import { buildDecisionCounts, filterRecruiterCandidates } from './dashboardAnalytics';
import type { ScreeningRecord } from '../types/models';

const sampleCandidates: ScreeningRecord[] = [
    {
        _id: '1',
        score: 91,
        createdAt: new Date().toISOString(),
        candidateId: {
            _id: 'candidate-1',
            email: 'ali@example.com',
            applicationStatus: 'interview',
            createdAt: new Date().toISOString(),
            userId: { _id: 'user-1', name: 'Ali Salah', email: 'ali@example.com' },
            jobId: { _id: 'job-1', title: 'AI Engineer', createdAt: new Date().toISOString() }
        },
        skills: ['React', 'Node.js'],
        missingSkills: ['Solidity']
    },
    {
        _id: '2',
        score: 58,
        createdAt: new Date().toISOString(),
        candidateId: {
            _id: 'candidate-2',
            email: 'maria@example.com',
            applicationStatus: 'pending',
            createdAt: new Date().toISOString(),
            userId: { _id: 'user-2', name: 'Maria Tan', email: 'maria@example.com' },
            jobId: { _id: 'job-2', title: 'Product Designer', createdAt: new Date().toISOString() }
        },
        skills: ['Figma'],
        missingSkills: ['Research']
    }
];

describe('dashboard analytics helpers', () => {
    it('filters candidates by status, score band, and skill', () => {
        const filtered = filterRecruiterCandidates(sampleCandidates, {
            search: 'ali',
            status: 'interview',
            scoreBand: '85-100',
            skill: 'react'
        });

        expect(filtered).toHaveLength(1);
        expect(filtered[0].candidateId?.userId?.name).toBe('Ali Salah');
    });

    it('builds counts for all recruiter workflow statuses', () => {
        const counts = buildDecisionCounts(sampleCandidates);

        expect(counts.interview).toBe(1);
        expect(counts.pending).toBe(1);
        expect(counts.shortlisted).toBe(0);
    });
});
