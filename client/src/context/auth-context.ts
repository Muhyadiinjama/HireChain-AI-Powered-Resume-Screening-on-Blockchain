import { createContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { DBUser } from '../types/models';

export interface AuthContextType {
    user: DBUser | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    firebaseUser: FirebaseUser | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
