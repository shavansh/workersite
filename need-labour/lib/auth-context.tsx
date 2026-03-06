'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserData, UserRole } from './types';

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, data: Omit<UserData, 'uid' | 'createdAt'>) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    setUserData({ uid: firebaseUser.uid, ...userDoc.data() } as UserData);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
            setUserData({ uid: cred.user.uid, ...userDoc.data() } as UserData);
        }
    };

    const signUp = async (email: string, password: string, data: Omit<UserData, 'uid' | 'createdAt'>) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const userDataToSave = {
            ...data,
            createdAt: new Date(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), userDataToSave);
        setUserData({ uid: cred.user.uid, ...userDataToSave });
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUserData(null);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
