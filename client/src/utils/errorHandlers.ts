/**
 * Formats Firebase and API error messages into user-friendly, professional strings.
 */
type ErrorLike = {
    response?: {
        data?: {
            message?: string;
        };
    };
    code?: string;
    message?: string;
};

export const formatErrorMessage = (error: unknown): string => {
    const resolvedError = (error ?? {}) as ErrorLike;

    // If it's an Axios/API error with a message from our backend
    if (resolvedError.response?.data?.message) {
        return resolvedError.response.data.message;
    }

    const errorCode = resolvedError.code || resolvedError.message || '';
    const normalizedCode = String(errorCode).toLowerCase();

    switch (errorCode) {
        // Registration Errors
        case 'auth/email-already-in-use':
        case 'Firebase: Error (auth/email-already-in-use).':
            return 'This email is already registered. Please try logging in instead.';
        case 'auth/invalid-email':
            return 'The email address provided is not valid.';
        case 'auth/weak-password':
            return 'Your password is too weak. Please use at least 6 characters.';

        // Login Errors
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
        case 'Firebase: Error (auth/invalid-credential).':
            return 'Incorrect password. Please verify your credentials and try again.';
        case 'auth/too-many-requests':
            return 'Too many failed login attempts. Please try again later for security.';

        // General Errors
        case 'auth/popup-closed-by-user':
            return 'Sign-in window was closed before completion.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';

        default:
            if (
                normalizedCode.includes('auth/invalid-credential') ||
                normalizedCode.includes('auth/invalid-login-credentials')
            ) {
                return 'Incorrect email or password. Please check your credentials and try again.';
            }

            if (normalizedCode === 'network error') {
                return 'Unable to reach the server. Please try again in a moment.';
            }

            return resolvedError.message || 'An unexpected error occurred. Please try again.';
    }
};
