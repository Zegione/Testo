
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export type UserRole = 'mahasiswa' | 'dosen' | 'admin';

export interface AppUser extends User {
  role?: UserRole;
}

export interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  registerUser: (email: string, pass: string) => Promise<void>;
  loginUser: (email: string, pass: string, loginAsRole: UserRole) => Promise<void>;
  logoutUser: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser({ ...firebaseUser, role: userData.role as UserRole });
        } else {
          setUser({ ...firebaseUser, role: undefined });
        }
      } else {
        setUser(null);
      }
      setInitialLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const registerUser = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: 'mahasiswa', 
        createdAt: serverTimestamp(),
      });
      setUser({ ...firebaseUser, role: 'mahasiswa' });
      router.push('/');
    } catch (e: any) {
      setError(e.message);
      console.error("Registration error:", e);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email: string, pass: string, loginAsRole: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userActualRole = userData.role as UserRole;
        
        let validationError: string | null = null;

        if (loginAsRole === 'admin' && userActualRole !== 'admin') {
          validationError = `You do not have permission to log in as Admin.`;
        } else if (loginAsRole === 'dosen' && userActualRole === 'mahasiswa') {
          validationError = `Your account role (${userActualRole}) does not match the selected login role (${loginAsRole}).`;
        }

        if (validationError) {
          setError(validationError);
          // console.warn("Login validation failed:", validationError); // Optional: for debugging handled validations
          if (auth.currentUser) { 
            await firebaseSignOut(auth);
          }
          setUser(null);
          return; // Exit after setting error for validation, finally block will still run
        }

        setUser({ ...firebaseUser, role: userActualRole });
        router.push('/');
      } else {
        const firestoreError = 'User data not found. Please contact support.';
        setError(firestoreError);
        console.error("Login error (Firestore data missing):", firestoreError);
        if (auth.currentUser) {
          await firebaseSignOut(auth);
        }
        setUser(null);
        return; // Exit, finally block will still run
      }
    } catch (e: any) { // Catches Firebase auth errors or other unexpected errors
      setError(e.message);
      console.error("Login error (auth or unexpected):", e);
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/auth/login');
    } catch (e: any) {
      setError(e.message);
      console.error("Logout error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, initialLoading, error, registerUser, loginUser, logoutUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
