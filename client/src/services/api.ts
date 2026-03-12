import axios from 'axios';
import { auth } from './firebase';
import type { ApplicationStatus, JobMutationPayload, UserRole } from '../types/models';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add interceptor to include Firebase ID token in every request
API.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Auth API
export const registerUser = (data: { token: string, role: UserRole, name: string, company?: string }) => API.post('/auth/register', data);
export const loginUser = (data: { token: string }) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data: { name: string, company?: string }) => API.patch('/auth/profile', data);

// Jobs API
export const createJob = (data: JobMutationPayload) => API.post('/jobs', data);
export const getJobs = () => API.get('/jobs');
export const getJobById = (id: string) => API.get(`/jobs/${id}`);
export const updateJob = (id: string, data: JobMutationPayload) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id: string) => API.delete(`/jobs/${id}`);


// Screening API
export const screenResume = (formData: FormData) => API.post('/screen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getJobCandidates = (jobId: string) => API.get(`/screen/job/${jobId}`);
export const getMyApplications = () => API.get('/screen/my-applications');
export const getApplicationResult = (id: string) => API.get(`/screen/application/${id}`);
export const getCandidateReview = (id: string) => API.get(`/screen/application/${id}/review`);
export const updateCandidateDecision = (id: string, data: { status: ApplicationStatus, decisionNotes?: string }) =>
    API.patch(`/screen/application/${id}/status`, data);
export const getCandidateResume = (id: string) => API.get(`/screen/application/${id}/resume`, {
    responseType: 'blob'
});
export const getBlockchainLogs = () => API.get('/screen/blockchain-logs');
export const getBlockchainLogByHash = (hash: string) => API.get(`/screen/blockchain-logs/${hash}`);
export const getAllCandidates = () => API.get('/screen/all-candidates');

export default API;
