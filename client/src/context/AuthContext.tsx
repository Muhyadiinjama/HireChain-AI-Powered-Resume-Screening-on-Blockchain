import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import API from '../services/api';
import type { DBUser } from '../types/models';
import { AuthContext } from './auth-context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<DBUser | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const res = await API.get('/auth/me');
            setUser(res.data.user);
        } catch (error) {
            console.error('Failed to fetch user from DB', error);
            setUser(null);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
            setFirebaseUser(fUser);
            if (fUser) {
                // User is signed in to Firebase, now fetch from MongoDB
                await refreshUser();
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setFirebaseUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, refreshUser, firebaseUser }}>
            {children}
        </AuthContext.Provider>
    );
};
