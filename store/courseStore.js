import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const CACHE_KEY = 'course_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const useCourseStore = create((set, get) => ({
  allCourses: [],       // all courses for the university
  cacheUniversityId: null,
  cacheTimestamp: null,
  loading: false,

  // Load from AsyncStorage on app start
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const { courses, universityId, timestamp } = JSON.parse(raw);
      if (courses && universityId) {
        set({ allCourses: courses, cacheUniversityId: universityId, cacheTimestamp: timestamp });
      }
    } catch (_) {}
  },

  // Fetch all courses for the university and cache
  loadForUniversity: async (universityId) => {
    if (!universityId) return;

    const { cacheUniversityId, cacheTimestamp, loading } = get();
    if (loading) return;

    // Use cache if same university and not expired
    const now = Date.now();
    if (
      cacheUniversityId === universityId &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_TTL
    ) return;

    set({ loading: true });
    try {
      const res = await api.get(`/data/universities/${universityId}/courses`);
      const courses = Array.isArray(res?.data) ? res.data : [];
      set({ allCourses: courses, cacheUniversityId: universityId, cacheTimestamp: now, loading: false });
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ courses, universityId, timestamp: now }));
    } catch (err) {
      console.warn('[CourseStore] Failed to load university courses:', err.message);
      set({ loading: false });
    }
  },

  // Local search across all cached courses — instant, no API
  search: (query) => {
    const { allCourses } = get();
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allCourses.filter(
      (c) =>
        (c.code || '').toLowerCase().includes(q) ||
        (c.course_code || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q)
    );
  },

  clearCache: async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    set({ allCourses: [], cacheUniversityId: null, cacheTimestamp: null });
  },
}));

export default useCourseStore;
