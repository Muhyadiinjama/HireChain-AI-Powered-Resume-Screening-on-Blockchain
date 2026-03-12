import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FairnessPrivacyPanel from './FairnessPrivacyPanel';

describe('FairnessPrivacyPanel', () => {
    it('renders the key fairness and trust controls', () => {
        render(
            <FairnessPrivacyPanel
                anonymized
                consentAccepted
                consentAcceptedAt="2026-03-13T00:00:00.000Z"
                verificationStatus="Verification metadata stored."
                auditabilityCopy="Recruiter review trail is available."
            />
        );

        expect(screen.getByText('Fairness and Trust Controls')).toBeInTheDocument();
        expect(screen.getByText('Anonymized Screening')).toBeInTheDocument();
        expect(screen.getByText('Candidate Consent')).toBeInTheDocument();
        expect(screen.getByText('Verification Process')).toBeInTheDocument();
        expect(screen.getByText('Auditability')).toBeInTheDocument();
    });
});
