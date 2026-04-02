import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import useCourseStore from './courseStore';

// Returns true if the user's department_id is a legacy mockData ID (no university prefix)
// Real DB IDs have the format "oau-dept_phy", mockData IDs are "dept_phy"
const hasValidProfile = (user) => {
  const deptId = user?.department_id || user?.profile?.department_id;
  if (!deptId) return false;           // never completed onboarding
  return deptId.includes('-');         // real DB IDs always have a dash
};

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  onboardingCompleted: false,
  semester: 1,

  initialize: async () => {
    try {
      useCourseStore.getState().hydrate();
      const semesterRaw = await AsyncStorage.getItem('user_semester');
      const semester = semesterRaw ? parseInt(semesterRaw, 10) : 1;

      const sessionJson = await AsyncStorage.getItem('session');
      if (!sessionJson) {
        set({ semester, isLoading: false });
        return;
      }

      const session = JSON.parse(sessionJson);

      // Verify token is still valid
      try {
        const res = await api.get('/auth/me');
        const user = res?.data?.user;
        const mergedUser = { ...user, ...(user?.profile || {}) };
        set({
          user: mergedUser,
          session,
          isAuthenticated: true,
          onboardingCompleted: (user?.profile?.onboarding_completed || false) && hasValidProfile(user),
          semester,
          isLoading: false,
        });
      } catch {
        // Token expired — try refresh
        try {
          const refreshRes = await api.post('/auth/refresh', {
            refreshToken: session.refresh_token,
          });
          const newSession = refreshRes?.data?.session;
          await AsyncStorage.setItem('session', JSON.stringify(newSession));
          api.token = newSession.access_token;

          const meRes = await api.get('/auth/me');
          const user = meRes?.data?.user;
          const mergedUser = { ...user, ...(user?.profile || {}) };
          set({
            user: mergedUser,
            session: newSession,
            isAuthenticated: true,
            onboardingCompleted: (user?.profile?.onboarding_completed || false) && hasValidProfile(user),
            semester,
            isLoading: false,
          });
        } catch {
          await AsyncStorage.removeItem('session');
          api.token = null;
          set({ semester, isLoading: false });
        }
      }
    } catch (error) {
      console.error('[Auth] Initialize error:', error);
      set({ isLoading: false });
    }
  },

  setSemester: async (id) => {
    await AsyncStorage.setItem('user_semester', String(id));
    set({ semester: id });
  },

  login: async (email, password) => {
    const res = await api.post('/auth/signin', { email, password });
    const { user, session } = res.data;

    await AsyncStorage.setItem('session', JSON.stringify(session));
    api.token = session.access_token;

    const mergedUser = { ...user, ...(user.profile || {}) };

    set({
      user: mergedUser,
      session,
      isAuthenticated: true,
      onboardingCompleted: (user?.profile?.onboarding_completed || false) && hasValidProfile(user),
    });

    // Pre-load course cache in background
    const uniId = mergedUser.university_id || user?.profile?.university_id;
    if (uniId) useCourseStore.getState().loadForUniversity(uniId);

    return mergedUser;
  },

  signup: async (email, password, displayName, termsAccepted) => {
    const res = await api.post('/auth/signup', {
      email,
      password,
      displayName,
      termsAccepted,
    });
    const { user, session } = res.data;

    await AsyncStorage.setItem('session', JSON.stringify(session));
    api.token = session.access_token;

    const mergedUser = { ...user, ...(user.profile || {}) };

    set({
      user: mergedUser,
      session,
      isAuthenticated: true,
      onboardingCompleted: false,
    });

    return mergedUser;
  },

  loginWithGoogle: async (idToken, accessToken) => {
    const res = await api.post('/auth/google', { idToken, accessToken });
    const { user, session } = res.data;

    await AsyncStorage.setItem('session', JSON.stringify(session));
    api.token = session.access_token;

    const mergedUser = { ...user, ...(user.profile || {}) };

    set({
      user: mergedUser,
      session,
      isAuthenticated: true,
      onboardingCompleted: (user?.profile?.onboarding_completed || false) && hasValidProfile(user),
    });

    return mergedUser;
  },

  resetOnboarding: () => {
    set({ onboardingCompleted: false });
  },

  completeOnboarding: async (profileData) => {
    await api.post('/users/onboarding', profileData);
    // Persist semester preference
    const semesterNum = profileData.semester?.toLowerCase().includes('second') ? 2 : 1;
    await AsyncStorage.setItem('user_semester', String(semesterNum));
    try {
      const res = await api.get('/auth/me');
      const user = res?.data?.user;
      if (user) {
        const mergedUser = { ...user, ...(user.profile || {}) };
        set({ user: mergedUser, onboardingCompleted: true, semester: semesterNum });
        const uniId = mergedUser.university_id || user?.profile?.university_id;
        if (uniId) useCourseStore.getState().loadForUniversity(uniId);
        return;
      }
    } catch (_) {}
    set({ onboardingCompleted: true, semester: semesterNum });
  },

  updateProfile: async (updates) => {
    const res = await api.put('/users/profile', updates);
    const updated = res?.data;
    set((state) => ({ user: { ...state.user, ...updated } }));
    return updated;
  },

  getToken: () => {
    return get().session?.access_token || null;
  },

  logout: async () => {
    try { await api.post('/auth/signout', {}); } catch (_) {}
    await AsyncStorage.removeItem('session');
    api.token = null;
    set({ user: null, session: null, isAuthenticated: false, onboardingCompleted: false });
  },

  deleteAccount: async () => {
    await api.delete('/users/account');
    await AsyncStorage.removeItem('session');
    api.token = null;
    set({ user: null, session: null, isAuthenticated: false, onboardingCompleted: false });
  },
}));

export default useAuthStore;
