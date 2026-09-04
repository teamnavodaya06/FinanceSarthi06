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
import { getApiBaseUrl } from '../api/config';
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
  completeOnboarding: (data: any) => Promise<void>;
  deleteAccount: () => Promise<void>;
  authInitTimeout: boolean;
  setAuthInitTimeout: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInitTimeout, setAuthInitTimeout] = useState<boolean>(false);

  // Sync REAL Firebase Authentication state with Firestore document
  // Sync REAL Firebase Authentication state with Firestore document
  useEffect(() => {
    let timeoutId: any;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("[AUTH START] onAuthStateChanged callback triggered for UID:", fbUser?.uid || "null");
      setLoading(true);
      setAuthInitTimeout(false);

      if (fbUser) {
        // Start 10-second initialization timeout protection
        timeoutId = setTimeout(() => {
          console.warn("[AUTH TIMEOUT] Initialization took more than 10 seconds!");
          setAuthInitTimeout(true);
          setAuthError("We couldn't finish signing you in.");
          setLoading(false);
        }, 10000);
      }

      try {
        if (fbUser) {
          console.log("Google Login Success, Received UID:", fbUser.uid);
          setUser(fbUser);
          
          // Sync JWT token with backend (with AbortController 10s timeout)
          const jwtController = new AbortController();
          const jwtTimeout = setTimeout(() => jwtController.abort(), 10000);
          try {
            console.log("Fetching JWT token from backend with 10s timeout...");
            const res = await fetch(`${getApiBaseUrl()}/auth/token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                uid: fbUser.uid, 
                email: fbUser.email,
                displayName: fbUser.displayName,
                photoURL: fbUser.photoURL,
                emailVerified: fbUser.emailVerified
              }),
              signal: jwtController.signal
            });
            clearTimeout(jwtTimeout);
            const json = await res.json();
            if (json.success && json.data?.token) {
              console.log("JWT token retrieved and saved successfully.");
              localStorage.setItem('auth_token', json.data.token);
            }
          } catch (err) {
            clearTimeout(jwtTimeout);
            console.warn('Failed to retrieve Express JWT auth token within 10s:', err);
          }

          console.log("Fetching User Profile from Firestore with 3.5s timeout...");
          try {
            // Profile fetch with 3.5s timeout promise race
            const profilePromise = profileService.getProfile();
            const timeoutPromise = new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error("Firestore profile query timed out")), 3500)
            );

            const profileData = await Promise.race([profilePromise, timeoutPromise]);

            if (profileData) {
              console.log("User Found in Firestore profile:", profileData);
              const isLocalOnboarded = localStorage.getItem(`onboarded_${fbUser.uid}`) === 'true';
              if (isLocalOnboarded || profileData.isOnboarded) {
                profileData.isOnboarded = true;
              }
              setUserProfile(profileData);
              
              // Background update (don't block the UI!)
              profileService.updateProfile({
                lastLogin: new Date().toISOString(),
                ...(profileData.isOnboarded ? { isOnboarded: true } : {})
              }).catch(e => console.warn("Background profile write warning:", e));
              
              activityService.logActivity('login', { email: fbUser.email })
                .catch(e => console.warn("Background activity log warning:", e));
                
              console.log("Initializing Context - Existing user updated.");
            } else {
              console.log("User NOT Found in Firestore. Creating User profile...");
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

              // Background create (don't block the UI!)
              profileService.updateProfile(newProfile)
                .catch(e => console.warn("Background initial profile write warning:", e));
                
              setUserProfile(newProfile);
              console.log("User Created and context initialized.");
              
              activityService.logActivity('login', { email: fbUser.email, isNewUser: true })
                .catch(e => console.warn("Background activity log warning:", e));
            }
          } catch (e: any) {
            console.error('Error syncing Firestore user document, using fallback:', e);
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
          console.log("User state empty (Signed Out)");
          setUser(null);
          setUserProfile(null);
        }
      } catch (globalError: any) {
        console.error("CRITICAL AUTH LIFECYCLE ERROR:", globalError);
        setAuthError(globalError.message || "An unexpected error occurred during auth initialization.");
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        console.log("AUTH FINISHED - Setting loading to false");
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
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

  const completeOnboarding = async (onboardingData: any) => {
    if (userProfile && user) {
      const updated = {
        ...userProfile,
        ...onboardingData,
        updatedAt: new Date().toISOString(),
      };
      if (onboardingData.isOnboarded) {
        localStorage.setItem(`onboarded_${user.uid}`, 'true');
      }
      setUserProfile(updated);
      try {
        await profileService.updateProfile(updated);
        await activityService.logActivity('profileUpdate', { fields: Object.keys(onboardingData) });
      } catch (e) {
        console.warn('Firestore update warning:', e);
      }
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${getApiBaseUrl()}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json',
        }
      });
    } catch (e) {
      console.warn('Failed to wipe Postgres records:', e);
    }

    try {
      localStorage.removeItem(`onboarded_${user.uid}`);
      localStorage.removeItem('auth_token');
    } catch (e) {
      console.warn(e);
    }

    try {
      await user.delete();
    } catch (e) {
      console.warn('Firebase user delete failed, signing out instead:', e);
      await firebaseSignOut(auth);
    }

    setUser(null);
    setUserProfile(null);
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
        deleteAccount,
        authInitTimeout,
        setAuthInitTimeout,
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
