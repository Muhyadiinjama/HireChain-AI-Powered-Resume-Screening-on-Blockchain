import type { User as FirebaseUser } from 'firebase/auth';

export const PROFILE_STORAGE_PREFIX = 'hirechain-profile:';
export const SETTINGS_STORAGE_PREFIX = 'hirechain-settings:';

export type AccountPreferences = {
    emailUpdates: boolean;
    productUpdates: boolean;
    compactDashboard: boolean;
    publicVerification: boolean;
};

export const defaultPreferences: AccountPreferences = {
    emailUpdates: true,
    productUpdates: false,
    compactDashboard: false,
    publicVerification: true
};

export const getProfileStorageKey = (userId: string) => `${PROFILE_STORAGE_PREFIX}${userId}`;
export const getSettingsStorageKey = (userId: string) => `${SETTINGS_STORAGE_PREFIX}${userId}`;

export const getInitials = (name: string) => name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const getProviderIds = (firebaseUser: FirebaseUser | null) =>
    firebaseUser?.providerData.map((provider) => provider.providerId).filter(Boolean) ?? [];

export const getProviderSummary = (providerIds: string[]) => {
    if (providerIds.length === 0) {
        return 'Protected account';
    }

    return providerIds.map((providerId) => {
        if (providerId === 'password') {
            return 'Email and password';
        }

        if (providerId === 'google.com') {
            return 'Google';
        }

        return providerId;
    }).join(' + ');
};

export const loadStoredAvatar = (userId: string) => {
    try {
        const raw = localStorage.getItem(getProfileStorageKey(userId));
        const parsed = raw ? JSON.parse(raw) as { avatarPreview?: string } : null;
        return parsed?.avatarPreview || '';
    } catch {
        return '';
    }
};

export const saveStoredAvatar = (userId: string, avatarPreview: string) => {
    localStorage.setItem(getProfileStorageKey(userId), JSON.stringify({ avatarPreview }));
};

export const loadStoredPreferences = (userId: string) => {
    try {
        const raw = localStorage.getItem(getSettingsStorageKey(userId));
        const parsed = raw ? JSON.parse(raw) as Partial<AccountPreferences> : null;
        return {
            ...defaultPreferences,
            ...parsed
        };
    } catch {
        return defaultPreferences;
    }
};

export const saveStoredPreferences = (userId: string, preferences: AccountPreferences) => {
    localStorage.setItem(getSettingsStorageKey(userId), JSON.stringify(preferences));
};
