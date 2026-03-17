import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  onboardingCompleted: false,

  initialize: async () => {
    try {
      const userJson = await AsyncStorage.getItem('mockUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        const profileJson = await AsyncStorage.getItem(`profile_${user.email}`);
        const profile = profileJson ? JSON.parse(profileJson) : {};
        set({
          user,
          isAuthenticated: true,
          onboardingCompleted: profile.onboardingCompleted || false,
          isLoading: false,
        });
        console.log('[Auth] Mock session restored for', user.email);
        return;
      }
      set({ isLoading: false });
    } catch (error) {
      console.error('[Auth] Initialize error:', error);
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const isAdmin = email.toLowerCase() === 'admin@vectra.app';
    const user = {
      id: `mock_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: email.toLowerCase(),
      display_name: isAdmin ? 'Vectra Admin' : email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: isAdmin ? 'admin' : 'user',
      profile: {},
    };

    await AsyncStorage.setItem('mockUser', JSON.stringify(user));

    const profileJson = await AsyncStorage.getItem(`profile_${email.toLowerCase()}`);
    const profile = profileJson ? JSON.parse(profileJson) : {};

    set({
      user,
      isAuthenticated: true,
      onboardingCompleted: profile.onboardingCompleted || false,
    });

    console.log('[Auth] Mock login successful for', email);
    return user;
  },

  loginWithGoogle: async () => {
    const user = {
      id: `google_${Date.now()}`,
      email: 'google.user@gmail.com',
      display_name: 'Google User',
      role: 'user',
      profile: {},
      provider: 'google',
    };

    await AsyncStorage.setItem('mockUser', JSON.stringify(user));
    const profileJson = await AsyncStorage.getItem(`profile_${user.email}`);
    const profile = profileJson ? JSON.parse(profileJson) : {};

    set({
      user,
      isAuthenticated: true,
      onboardingCompleted: profile.onboardingCompleted || false,
    });

    console.log('[Auth] Mock Google login successful');
    return user;
  },

  signup: async (email, password, displayName) => {
    const user = {
      id: `mock_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: email.toLowerCase(),
      display_name: displayName || email.split('@')[0],
      role: 'user',
      profile: {},
    };

    await AsyncStorage.setItem('mockUser', JSON.stringify(user));

    set({
      user,
      isAuthenticated: true,
      onboardingCompleted: false,
    });

    console.log('[Auth] Mock signup successful for', email);
    return user;
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
    await AsyncStorage.removeItem('mockUser');
    await AsyncStorage.removeItem('userProfile');
    set({ user: null, isAuthenticated: false, onboardingCompleted: false });
    console.log('[Auth] Mock logged out');
  },

  deleteAccount: async () => {
    const { user } = get();
    if (user) {
      await AsyncStorage.removeItem(`profile_${user.email}`);
    }
    await AsyncStorage.removeItem('mockUser');
    await AsyncStorage.removeItem('userProfile');
    set({ user: null, isAuthenticated: false, onboardingCompleted: false });
    console.log('[Auth] Mock account deleted');
  },
}));

export default useAuthStore;
