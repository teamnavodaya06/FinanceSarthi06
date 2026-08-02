import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, initRecaptcha } from '../config/firebase';
import { profileService, activityService } from '../services/firestore';
import { FirestoreUserProfile, CityTier, RiskProfile, FinancialGoalType, OccupationType } from '@financesarthi/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: FirestoreUserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  showWelcomeScreen: boolean;
  setShowWelcomeScreen: (show: boolean) => void;
  showSignOutModal: boolean;
  setShowSignOutModal: (show: boolean) => void;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  completeOnboarding: (data: {
    cityTier: CityTier;
    occupation: OccupationType;
    monthlySalary: number;
    financialGoals: FinancialGoalType[];
    riskProfile: RiskProfile;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync REAL Firebase Authentication state with Firestore document
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setUser(fbUser);
        
        // Sync JWT token with backend
        try {
          const res = await fetch('http://localhost:5000/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: fbUser.uid, email: fbUser.email })
          });
          const json = await res.json();
          if (json.success && json.data?.token) {
            localStorage.setItem('auth_token', json.data.token);
          }
        } catch (err) {
          console.warn('Failed to retrieve Express JWT auth token:', err);
        }

        try {
          const profileData = await profileService.getProfile();

          if (profileData) {
            // Returning User: Load specific Firestore profile for this Firebase UID
            const isLocalOnboarded = localStorage.getItem(`onboarded_${fbUser.uid}`) === 'true';
            if (isLocalOnboarded) {
              profileData.isOnboarded = true;
            }
            setUserProfile(profileData);
            await profileService.updateProfile({
              lastLogin: new Date().toISOString(),
              ...(isLocalOnboarded ? { isOnboarded: true } : {})
            });
            await activityService.logActivity('login', { email: fbUser.email });
          } else {
            // First Time User: Create Firestore document under /users/${fbUser.uid}/profile/basic
            const providerId = fbUser.providerData[0]?.providerId || '';
            const providerType = providerId.includes('google')
              ? 'google'
              : fbUser.phoneNumber
              ? 'phone'
              : 'password';

            const newProfile: FirestoreUserProfile = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'FinanceSarthi User',
              email: fbUser.email || '',
              phoneNumber: fbUser.phoneNumber || undefined,
              photoURL: fbUser.photoURL || undefined,
              provider: providerType,
              occupation: 'Salaried',
              cityTier: 'TIER_2',
              monthlySalary: 75000,
              financialGoals: ['EMERGENCY_FUND', 'INVESTMENT'],
              riskProfile: 'MODERATE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              isOnboarded: false,
              preferredLanguage: 'en',
              theme: 'dark',
              notificationsEnabled: true,
            };

            await profileService.updateProfile(newProfile);
            setUserProfile(newProfile);
            await activityService.logActivity('login', { email: fbUser.email, isNewUser: true });
          }
        } catch (e: any) {
          console.error('Error syncing Firestore user document:', e);
          const isLocalOnboarded = localStorage.getItem(`onboarded_${fbUser.uid}`) === 'true';
          setUserProfile({
            uid: fbUser.uid,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            email: fbUser.email || '',
            phoneNumber: fbUser.phoneNumber || undefined,
            photoURL: fbUser.photoURL || undefined,
            provider: 'google',
            occupation: 'Salaried',
            cityTier: 'TIER_2',
            monthlySalary: 75000,
            financialGoals: ['EMERGENCY_FUND', 'INVESTMENT'],
            riskProfile: 'MODERATE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isOnboarded: isLocalOnboarded,
            preferredLanguage: 'en',
            theme: 'dark',
            notificationsEnabled: true,
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setUser(res.user);
      setShowWelcomeScreen(true);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Google sign-in popup was closed before completing.');
      } else if (err.code === 'auth/network-request-failed') {
        setAuthError('Network error. Please check your internet connection.');
      } else {
        setAuthError(err.message || 'Google Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setUser(res.user);
      setShowWelcomeScreen(true);
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Incorrect email or password. Please check your credentials.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setAuthError("Email/Password provider is disabled in the Firebase Console. Please open Firebase Console ➔ Authentication ➔ Sign-in method tab, select 'Email/Password', and turn it on/enable it.");
      } else {
        setAuthError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone?: string): Promise<boolean> => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(res.user);
      const newProf: FirestoreUserProfile = {
        uid: res.user.uid,
        displayName: name,
        email,
        phoneNumber: phone,
        provider: 'password',
        occupation: 'Salaried',
        cityTier: 'TIER_2',
        monthlySalary: 75000,
        financialGoals: ['EMERGENCY_FUND', 'INVESTMENT'],
        riskProfile: 'MODERATE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isOnboarded: false,
        preferredLanguage: 'en',
        theme: 'dark',
        notificationsEnabled: true,
      };
      try {
        await profileService.updateProfile(newProf);
      } catch (e) {
        console.warn('Firestore write warning:', e);
      }
      setUserProfile(newProf);
      setShowWelcomeScreen(true);
      return true;
    } catch (err: any) {
      console.error('Sign Up Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setAuthError("Email/Password provider is disabled in the Firebase Console. Please open Firebase Console ➔ Authentication ➔ Sign-in method tab, select 'Email/Password', and turn it on/enable it.");
      } else {
        setAuthError(err.message || 'Sign up failed.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      setAuthError(err.message || 'Failed to send password reset email.');
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      await activityService.logActivity('logout', { email: user?.email });
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('Sign Out Error:', e);
    }
    localStorage.removeItem('auth_token');
    setUser(null);
    setUserProfile(null);
    setShowSignOutModal(false);
  };

  const completeOnboarding = async (onboardingData: {
    cityTier: CityTier;
    occupation: OccupationType;
    monthlySalary: number;
    financialGoals: FinancialGoalType[];
    riskProfile: RiskProfile;
  }) => {
    if (userProfile && user) {
      const updated = {
        ...userProfile,
        ...onboardingData,
        isOnboarded: true,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`onboarded_${user.uid}`, 'true');
      setUserProfile(updated);
      try {
        await profileService.updateProfile(updated);
        await activityService.logActivity('profileUpdate', { fields: Object.keys(onboardingData) });
      } catch (e) {
        console.warn('Firestore update warning:', e);
      }
      setShowWelcomeScreen(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAuthenticated: Boolean(userProfile),
        showWelcomeScreen,
        setShowWelcomeScreen,
        showSignOutModal,
        setShowSignOutModal,
        authError,
        setAuthError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOutUser,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
