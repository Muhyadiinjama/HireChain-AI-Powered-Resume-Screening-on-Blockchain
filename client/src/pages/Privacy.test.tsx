import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Privacy from './Privacy';

describe('Privacy page', () => {
    it('shows the public privacy and fairness explanation', () => {
        render(<Privacy />);

        expect(screen.getByText('How HireChain handles screening trust')).toBeInTheDocument();
        expect(screen.getByText('Anonymized AI Screening')).toBeInTheDocument();
        expect(screen.getByText('Consent Before Screening')).toBeInTheDocument();
        expect(screen.getByText('What recruiters can see')).toBeInTheDocument();
    });
});
