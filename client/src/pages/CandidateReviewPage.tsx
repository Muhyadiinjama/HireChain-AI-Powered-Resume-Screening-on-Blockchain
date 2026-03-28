import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import CandidateReviewDrawer from '../components/CandidateReviewDrawer';
import {
    getCandidateResume,
    getCandidateReview,
    updateCandidateDecision
} from '../services/api';
import type { ApplicationStatus, CandidateReviewData } from '../types/models';

const CandidateReviewPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [candidateReview, setCandidateReview] = useState<CandidateReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [decisionLoading, setDecisionLoading] = useState(false);
    const [decisionNotes, setDecisionNotes] = useState('');
    const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
    const [resumeLoading, setResumeLoading] = useState(false);

    useEffect(() => {
        return () => {
            if (resumePreviewUrl) {
                URL.revokeObjectURL(resumePreviewUrl);
            }
        };
    }, [resumePreviewUrl]);

    const loadResumePreview = useCallback(async (
        candidateId: string,
        options?: { download?: boolean; fileName?: string; mimeType?: string }
    ) => {
        const { download = false, fileName, mimeType } = options || {};

        setResumeLoading(true);
        try {
            const response = await getCandidateResume(candidateId);
            const blobType = response.data.type || mimeType || 'application/octet-stream';
            const blob = new Blob([response.data], { type: blobType });
            const objectUrl = URL.createObjectURL(blob);

            if (download) {
                const link = document.createElement('a');
                link.href = objectUrl;
                link.download = fileName || 'resume';
                link.target = '_blank';
                link.rel = 'noopener';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
                return;
            }

            setResumePreviewUrl((currentUrl) => {
                if (currentUrl) {
                    URL.revokeObjectURL(currentUrl);
                }
                return objectUrl;
            });
        } catch (error) {
            console.error('Failed to load candidate resume:', error);
            toast.error('Unable to open the uploaded resume.');
        } finally {
            setResumeLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchReview = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                const response = await getCandidateReview(id);
                const reviewData = response.data as CandidateReviewData;
                setCandidateReview(reviewData);
                setDecisionNotes(reviewData.candidate?.decisionNotes || '');

                if (reviewData.candidate?.resumeMimeType?.toLowerCase().includes('pdf')) {
                    void loadResumePreview(id, {
                        fileName: reviewData.candidate.resumeOriginalName,
                        mimeType: reviewData.candidate.resumeMimeType
                    });
                }
            } catch (error) {
                console.error('Failed to load candidate review:', error);
                toast.error('Unable to load the applicant review page.');
            } finally {
                setLoading(false);
            }
        };

        void fetchReview();
    }, [id, loadResumePreview]);

    const handleCandidateDecision = useCallback(async (status: ApplicationStatus) => {
        if (!id) {
            return;
        }

        setDecisionLoading(true);
        try {
            const response = await updateCandidateDecision(id, {
                status,
                decisionNotes
            });
            const reviewData = response.data as CandidateReviewData;
            setCandidateReview(reviewData);
            setDecisionNotes(reviewData.candidate?.decisionNotes || '');
            toast.success(reviewData.message || `Candidate marked as ${status}.`);
        } catch (error) {
            console.error('Failed to update candidate decision:', error);
            toast.error('Unable to update the applicant status.');
        } finally {
            setDecisionLoading(false);
        }
    }, [decisionNotes, id]);

    if (!loading && !candidateReview?.candidate) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-main transition-colors duration-300 flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">Applicant review not found</p>
                </div>
            </div>
        );
    }

    if (loading && !candidateReview?.candidate) {
        return <div className="min-h-screen bg-gray-50 dark:bg-dark-main transition-colors duration-300" />;
    }

    return (
        <CandidateReviewDrawer
            mode="page"
            open
            loading={loading}
            decisionLoading={decisionLoading}
            resumeLoading={resumeLoading}
            resumePreviewUrl={resumePreviewUrl}
            decisionNotes={decisionNotes}
            data={candidateReview}
            onClose={() => navigate(-1)}
            onDecisionNotesChange={setDecisionNotes}
            onChangeStatus={(status) => void handleCandidateDecision(status)}
            onDownloadResume={() => {
                if (!id) {
                    return;
                }

                void loadResumePreview(id, {
                    download: true,
                    fileName: candidateReview?.candidate?.resumeOriginalName,
                    mimeType: candidateReview?.candidate?.resumeMimeType
                });
            }}
            onViewResult={() => {
                if (id) {
                    navigate(`/result/${id}`);
                }
            }}
        />
    );
};

export default CandidateReviewPage;
