
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export type UserRole = 'mahasiswa' | 'dosen' | 'admin';

export interface AppUser extends User {
  role?: UserRole;
  name?: string; // Full name
  studentId?: string; // NIM for mahasiswa, NIP for dosen (can be optional)
  // Add other role-specific fields if necessary, e.g., faculty, major from student-data
  faculty?: string;
  major?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  sklUrl?: string;
  stijazahUrl?: string;
  profileCompletedAt?: any; // Timestamp for when profile was completed
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
  refreshUser: () => Promise<void>; // Function to manually refresh user data
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

  const fetchUserData = async (firebaseUser: User): Promise<AppUser | null> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return {
        ...firebaseUser,
        role: userData.role as UserRole,
        name: userData.name,
        studentId: userData.studentId,
        faculty: userData.faculty,
        major: userData.major,
        phone: userData.phone,
        address: userData.address,
        avatarUrl: userData.avatarUrl,
        sklUrl: userData.sklUrl,
        stijazahUrl: userData.stijazahUrl,
        profileCompletedAt: userData.profileCompletedAt,
      };
    } else {
      console.warn(`User document not found for UID: ${firebaseUser.uid}.`);
      // For newly registered users, the document might be partially created.
      // Or if a user exists in Auth but not Firestore for some reason.
      return { ...firebaseUser, role: undefined }; // Or a default role if applicable
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await fetchUserData(firebaseUser);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setInitialLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      setLoading(true);
      const appUser = await fetchUserData(auth.currentUser);
      setUser(appUser);
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const registerUser = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      // Initial document creation, name and studentId will be added after profile completion
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: 'mahasiswa', 
        createdAt: serverTimestamp(),
      });
      // Fetch the newly created (partial) user data to set in context
      const appUser = await fetchUserData(firebaseUser);
      setUser(appUser); 
      router.push('/auth/complete-profile'); // Redirect to complete profile page
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
      
      const appUser = await fetchUserData(firebaseUser);

      if (appUser) {
        const userActualRole = appUser.role;
        let validationError: string | null = null;

        if (loginAsRole === 'admin' && userActualRole !== 'admin') {
          validationError = `You do not have permission to log in as Admin. Your role is ${userActualRole}.`;
        } else if (loginAsRole === 'dosen' && userActualRole === 'mahasiswa') {
           validationError = `Your account role (${userActualRole}) does not match the selected login role (${loginAsRole}).`;
        }

        if (validationError) {
          setError(validationError);
          await firebaseSignOut(auth);
          setUser(null);
          return; 
        }
        
        setUser(appUser);
        // Check if profile is complete (for mahasiswa)
        if (appUser.role === 'mahasiswa' && (!appUser.name || !appUser.studentId)) {
          router.push('/auth/complete-profile');
        } else {
          router.push('/');
        }

      } else {
        const firestoreError = 'User data not found. Please contact support.';
        setError(firestoreError);
        console.warn("Login error (Firestore data missing):", firestoreError);
        await firebaseSignOut(auth);
        setUser(null);
        return; 
      }
    } catch (e: any) { // Added the missing opening curly brace here
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
      
      if (auth.currentUser) {
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
    <AuthContext.Provider value={{ user, loading, initialLoading, error, registerUser, loginUser, logoutUser, clearError, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to update user data in Firestore (can be expanded)
export const updateUserDocument = async (uid: string, data: Partial<AppUser>) => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

