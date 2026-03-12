import { describe, expect, it } from 'vitest';
import { getApplicationStatusMeta } from './applicationStatus';

describe('getApplicationStatusMeta', () => {
    it('returns metadata for interview stage', () => {
        const meta = getApplicationStatusMeta('interview');

        expect(meta.label).toBe('Interview');
        expect(meta.description).toContain('interview');
    });

    it('falls back to pending metadata', () => {
        const meta = getApplicationStatusMeta('pending');

        expect(meta.label).toBe('Pending');
        expect(meta.badge).toContain('amber');
    });
});
