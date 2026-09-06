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
import { auth, db, googleProvider } from '../config/firebase';
import { profileService, activityService } from '../services/firestore';
import { getApiBaseUrl } from '../api/config';
import { FirestoreUserProfile } from '@financesarthi/types';

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
  signInAsGuest: () => void;
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
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      console.warn("[AUTH] Firebase auth listener safety timeout - unblocking loading state");
      setLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      clearTimeout(safetyTimer);
      console.log("[AUTH START] onAuthStateChanged callback triggered for UID:", fbUser?.uid || "null");
      setLoading(true);
      setAuthInitTimeout(false);
      setAuthError(null);

      if (!fbUser) {
        console.log("User state empty (Signed Out)");
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      console.log("Google/Firebase Login Success, Received UID:", fbUser.uid);
      setUser(fbUser);
      localStorage.setItem('fb_uid', fbUser.uid);

      // 1. Background non-blocking fetch of Express JWT token
      const fetchJwtBackground = async () => {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3000);
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
            signal: controller.signal
          });
          clearTimeout(timer);
          const json = await res.json();
          if (json.success && json.data?.token) {
            localStorage.setItem('auth_token', json.data.token);
          }
        } catch (err) {
          console.warn('Background Express JWT sync bypassed:', err);
        }
      };
      fetchJwtBackground();

      // 2. Fetch User Profile with instant local fallback (<1.5s timeout)
      try {
        const isLocalOnboarded = localStorage.getItem(`onboarded_${fbUser.uid}`) === 'true';

        const profilePromise = profileService.getProfile();
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error("Firestore profile query timed out")), 1500)
        );

        const profileData = await Promise.race([profilePromise, timeoutPromise]);

        if (profileData) {
          profileData.isOnboarded = true;
          setUserProfile(profileData);
          
          // Background update
          profileService.updateProfile({
            lastLogin: new Date().toISOString(),
            isOnboarded: true
          }).catch(e => console.warn("Background profile write warning:", e));
        } else {
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
            isOnboarded: true,
            preferredLanguage: 'en',
            theme: 'dark',
            notificationsEnabled: true,
          };

          profileService.updateProfile(newProfile).catch(e => console.warn("Background profile write warning:", e));
          setUserProfile(newProfile);
        }
      } catch (e) {
        console.warn('Using instant fallback profile context:', e);
        setUserProfile({
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'FinanceSarthi User',
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
          isOnboarded: true,
          preferredLanguage: 'en',
          theme: 'dark',
          notificationsEnabled: true,
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setShowWelcomeScreen(true);
      setTimeout(() => setShowWelcomeScreen(false), 2500);
      activityService.logActivity('login', { email: result.user.email, provider: 'google' })
        .catch(e => console.warn("Activity log warning:", e));
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign in popup was closed. Please try again.');
      } else {
        setAuthError(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = () => {
    setAuthError(null);
    setLoading(true);
    const mockUid = 'guest_demo_user';
    const guestUser: any = {
      uid: mockUid,
      email: 'guest@financesarthi.ai',
      displayName: 'Guest Demo User',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      emailVerified: true,
    };
    setUser(guestUser);
    const prof: FirestoreUserProfile = {
      uid: mockUid,
      displayName: 'Guest Demo User',
      email: 'guest@financesarthi.ai',
      provider: 'google',
      occupation: 'Salaried',
      cityTier: 'TIER_1',
      monthlySalary: 120000,
      financialGoals: ['EMERGENCY_FUND', 'INVESTMENT', 'RETIREMENT'],
      riskProfile: 'MODERATE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isOnboarded: true,
      preferredLanguage: localStorage.getItem('sarthi_lang_pref') || 'English',
      theme: 'dark',
      notificationsEnabled: true,
    };
    setUserProfile(prof);
    localStorage.setItem(`onboarded_${mockUid}`, 'true');
    setShowWelcomeScreen(true);
    setTimeout(() => setShowWelcomeScreen(false), 2000);
    setLoading(false);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setShowWelcomeScreen(true);
      setTimeout(() => setShowWelcomeScreen(false), 2500);
    } catch (err: any) {
      console.error('Email Sign-In Error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setAuthError(err.message || 'Failed to sign in.');
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
      const newProf: FirestoreUserProfile = {
        uid: res.user.uid,
        displayName: name || email.split('@')[0],
        email: email,
        phoneNumber: phone || undefined,
        provider: 'password',
        occupation: 'Salaried',
        cityTier: 'TIER_2',
        monthlySalary: 75000,
        financialGoals: ['EMERGENCY_FUND'],
        riskProfile: 'MODERATE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isOnboarded: true,
        preferredLanguage: 'en',
        theme: 'dark',
        notificationsEnabled: true,
      };
      await profileService.updateProfile(newProf);
      setUserProfile(newProf);
      setShowWelcomeScreen(true);
      setTimeout(() => setShowWelcomeScreen(false), 2500);
      return true;
    } catch (err: any) {
      console.error('Email Sign-Up Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered. Please sign in instead.');
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
      setAuthInitTimeout(false);
      setAuthError(null);
      setShowSignOutModal(false);
      setLoading(false);

      localStorage.removeItem('auth_token');
      localStorage.removeItem('fb_uid');

      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Sign Out Warning:', e);
    } finally {
      setUser(null);
      setUserProfile(null);
      setAuthInitTimeout(false);
      setAuthError(null);
      setLoading(false);
      setShowSignOutModal(false);
    }
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
      } catch (err) {
        console.warn('Background onboarding write warning:', err);
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
      await user.delete();
      await signOutUser();
    } catch (e: any) {
      console.error('Delete Account Error:', e);
      setAuthError(e.message || 'Failed to delete account');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAuthenticated: !!user,
        showWelcomeScreen,
        setShowWelcomeScreen,
        showSignOutModal,
        setShowSignOutModal,
        authError,
        setAuthError,
        signInWithGoogle,
        signInAsGuest,
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
