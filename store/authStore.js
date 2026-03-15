import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  onboardingCompleted: false,

  initialize: async () => {
    try {
      // Check for existing session
      const sessionJson = await AsyncStorage.getItem('session');
      const profileJson = await AsyncStorage.getItem('userProfile');

      if (sessionJson) {
        // Verify session with backend
        try {
          console.log('[Auth] Verifying existing session...');
          const response = await api.getCurrentUser();

          if (response.success && response.data?.user) {
            const user = response.data.user;
            await AsyncStorage.setItem('currentUser', JSON.stringify(user));

            // Check backend profile first, then local profile
            const backendProfile = user.profile || {};
            const localProfile = profileJson ? JSON.parse(profileJson) : null;
            const onboarded =
              backendProfile.onboarding_completed ||
              localProfile?.onboardingCompleted ||
              false;

            set({
              user,
              isAuthenticated: true,
              onboardingCompleted: onboarded,
              isLoading: false,
            });
            console.log('[Auth] Session verified, user logged in, onboarded:', onboarded);
            return;
          }
        } catch (error) {
          console.log('[Auth] Session expired or invalid, clearing...');
          await AsyncStorage.removeItem('session');
          await AsyncStorage.removeItem('currentUser');
        }
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('[Auth] Initialize error:', error);
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      console.log('[Auth] Logging in...');
      const response = await api.signin(email, password);

      if (response.success && response.data) {
        const user = response.data.user;
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));

        // Use backend profile's onboarding_completed (snake_case from Supabase)
        const backendProfile = user.profile || {};
        const backendOnboarded = backendProfile.onboarding_completed || false;

        // Also check local profile as fallback
        const profileJson = await AsyncStorage.getItem(`profile_${email.toLowerCase()}`);
        const localProfile = profileJson ? JSON.parse(profileJson) : null;

        const onboarded = backendOnboarded || localProfile?.onboardingCompleted || false;

        // Sync backend profile locally
        if (backendProfile.id) {
          const merged = {
            ...localProfile,
            ...backendProfile,
            onboardingCompleted: onboarded,
          };
          await AsyncStorage.setItem(`profile_${email.toLowerCase()}`, JSON.stringify(merged));
          await AsyncStorage.setItem('userProfile', JSON.stringify(merged));
        }

        set({
          user,
          isAuthenticated: true,
          onboardingCompleted: onboarded,
        });

        console.log('[Auth] Login successful, onboarded:', onboarded);
        return user;
      }

      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('[Auth] Login error:', error.message);
      throw error;
    }
  },

  signup: async (email, password, displayName, termsAccepted = true) => {
    try {
      console.log('[Auth] Signing up...');
      const response = await api.signup(email, password, displayName, termsAccepted);

      if (response.success && response.data) {
        const user = response.data.user;
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));

        set({
          user,
          isAuthenticated: true,
          onboardingCompleted: false,
        });

        console.log('[Auth] Signup successful');
        return user;
      }

      throw new Error(response.message || 'Signup failed');
    } catch (error) {
      console.error('[Auth] Signup error:', error.message);
      throw error;
    }
  },

  completeOnboarding: async (profileData) => {
    const { user } = get();
    if (!user) return;

    const profile = {
      ...profileData,
      email: user.email,
      onboardingCompleted: true,
    };

    await AsyncStorage.setItem(`profile_${user.email}`, JSON.stringify(profile));
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    set({ onboardingCompleted: true });

    console.log('[Auth] Onboarding completed');
  },

  getProfile: async () => {
    const { user } = get();
    if (!user) return null;

    const profileJson = await AsyncStorage.getItem(`profile_${user.email}`);
    return profileJson ? JSON.parse(profileJson) : null;
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    const profileJson = await AsyncStorage.getItem(`profile_${user.email}`);
    const profile = profileJson ? JSON.parse(profileJson) : {};
    const updated = { ...profile, ...updates };

    await AsyncStorage.setItem(`profile_${user.email}`, JSON.stringify(updated));
    await AsyncStorage.setItem('userProfile', JSON.stringify(updated));

    console.log('[Auth] Profile updated');
  },

  logout: async () => {
    try {
      await api.signout();
    } catch (error) {
      console.log('[Auth] Signout API error (continuing anyway):', error.message);
    }

    await AsyncStorage.removeItem('currentUser');
    await AsyncStorage.removeItem('userProfile');
    await AsyncStorage.removeItem('session');

    set({ user: null, isAuthenticated: false, onboardingCompleted: false });
    console.log('[Auth] Logged out');
  },

  deleteAccount: async () => {
    await api.deleteAccount();
    await AsyncStorage.removeItem('currentUser');
    await AsyncStorage.removeItem('userProfile');
    await AsyncStorage.removeItem('session');
    set({ user: null, isAuthenticated: false, onboardingCompleted: false });
    console.log('[Auth] Account deleted');
  },
}));

export default useAuthStore;
