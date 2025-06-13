
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
          // This case might happen if user document is not created yet or deleted
          // Defaulting to undefined role, or handle as an error/specific state
          setUser({ ...firebaseUser, role: undefined });
           console.warn(`User document not found for UID: ${firebaseUser.uid}. User might not have a role assigned.`);
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
    let signedInUser: AppUser | null = null;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      signedInUser = firebaseUser as AppUser; // Temporarily assign

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userActualRole = userData.role as UserRole;
        
        let validationError: string | null = null;

        // Admin can only log in as admin
        if (loginAsRole === 'admin' && userActualRole !== 'admin') {
          validationError = `You do not have permission to log in as Admin. Your role is ${userActualRole}.`;
        } 
        // Dosen can log in as dosen or mahasiswa.
        // Mahasiswa can only log in as mahasiswa.
        else if (loginAsRole === 'dosen' && userActualRole === 'mahasiswa') {
          validationError = `Your account role (${userActualRole}) does not match the selected login role (${loginAsRole}).`;
        }


        if (validationError) {
          setError(validationError);
          // Sign out the user if they were inadvertently logged in by signInWithEmailAndPassword
          if (auth.currentUser) {
            await firebaseSignOut(auth);
          }
          setUser(null);
          signedInUser = null; 
          return; 
        }

        setUser({ ...firebaseUser, role: userActualRole });
        router.push('/');
      } else {
        const firestoreError = 'User data not found in Firestore. Please contact support.';
        setError(firestoreError);
        console.error("Login error (Firestore data missing):", firestoreError);
        if (auth.currentUser) {
          await firebaseSignOut(auth);
        }
        setUser(null);
        signedInUser = null;
        return; 
      }
    } catch (e: any) {
      const knownFirebaseAuthErrorCodes = [
        'auth/invalid-credential',
        'auth/wrong-password',
        'auth/user-not-found',
        'auth/invalid-email',
        'auth/user-disabled',
        'auth/too-many-requests',
      ];

      if (e.code && knownFirebaseAuthErrorCodes.includes(e.code)) {
        setError(e.message || 'Login failed. Please check your credentials.');
      } else {
        setError(e.message || 'An unexpected error occurred during login.');
        console.error("Login error (unexpected or non-auth Firebase error):", e);
      }
      
      if (signedInUser || auth.currentUser) { // If user was somehow signed in or is still current
        try {
          await firebaseSignOut(auth);
        } catch (signOutError) {
          console.error("Error signing out after login failure:", signOutError);
        }
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
