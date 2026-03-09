'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@/types';

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const { setUser, setProfile, setLoading, clearAuth } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch or create Firestore profile
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile({ uid: firebaseUser.uid, ...profileSnap.data() } as UserProfile);
          // Update last login
          await updateDoc(profileRef, { lastLogin: serverTimestamp() });
        }
      } else {
        clearAuth();
      }
      setLoading(false);
      setInitialized(true);
    });
    return () => unsubscribe();
  }, [setUser, setProfile, setLoading, clearAuth]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: cred.user };
    } catch (error: unknown) {
      const e = error as { code?: string; message?: string };
      return { success: false, error: e.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      // Check if Firestore profile exists, create if not
      const profileRef = doc(db, 'users', cred.user.uid);
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        const newProfile: Omit<UserProfile, 'uid'> = {
          name: cred.user.displayName || '',
          email: cred.user.email || '',
          phone: '',
          role: 'student',
          department: '',
          year: null,
          photoURL: cred.user.photoURL || '',
          preferences: {
            categories: [],
            notifications: { email: true, sms: false, inApp: true },
          },
          createdAt: serverTimestamp() as unknown as import('firebase/firestore').Timestamp,
          lastLogin: serverTimestamp() as unknown as import('firebase/firestore').Timestamp,
        };
        await setDoc(profileRef, newProfile);
        setProfile({ uid: cred.user.uid, ...newProfile } as UserProfile);
      }
      return { success: true };
    } catch (error: unknown) {
      const e = error as { code?: string; message?: string };
      return { success: false, error: e.message || 'Google login failed' };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProfile]);

  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    department: string,
    year: number | null
  ) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create Firestore user document
      const newProfile: Omit<UserProfile, 'uid'> = {
        name,
        email,
        phone: '',
        role: 'student', // default role
        department,
        year,
        photoURL: '',
        preferences: {
          categories: [],
          notifications: { email: true, sms: false, inApp: true },
        },
        createdAt: serverTimestamp() as unknown as import('firebase/firestore').Timestamp,
        lastLogin: serverTimestamp() as unknown as import('firebase/firestore').Timestamp,
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setProfile({ uid: cred.user.uid, ...newProfile } as UserProfile);
      return { success: true };
    } catch (error: unknown) {
      const e = error as { code?: string; message?: string };
      return { success: false, error: e.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProfile]);

  const logout = useCallback(async () => {
    await signOut(auth);
    clearAuth();
  }, [clearAuth]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: unknown) {
      const e = error as { code?: string; message?: string };
      return { success: false, error: e.message || 'Reset failed' };
    }
  }, []);

  return { login, loginWithGoogle, register, logout, resetPassword, initialized };
}
