/**
 * Vectra API Configuration
 */

// Reads from EXPO_PUBLIC_API_URL in .env, falls back to hardcoded URL
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://172.20.182.66:3001/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: '/auth/signup',
    SIGNIN: '/auth/signin',
    SIGNOUT: '/auth/signout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    PASSWORD_RESET: '/auth/password/reset',
  },

  // Lectures
  LECTURES: {
    LIST: '/lectures',
    CREATE: '/lectures',
    GET: (id) => `/lectures/${id}`,
    UPDATE: (id) => `/lectures/${id}`,
    DELETE: (id) => `/lectures/${id}`,
    UPLOAD_AUDIO: '/lectures/upload-audio',
    UPLOAD_PHOTOS: '/lectures/upload-photos',
    UPLOAD_IMAGES: '/lectures/upload-images',
    PROCESS: '/lectures/process',
    TOGGLE_FAVORITE: (id) => `/lectures/${id}/favorite`,
  },

  // AI
  AI: {
    CHAT: '/ai/chat',
    RECAP: '/ai/recap',
    CHAT_HISTORY: (lectureId) => `/ai/chat-history/${lectureId}`,
    CLEAR_CHAT_HISTORY: (lectureId) => `/ai/chat-history/${lectureId}`,
  },

  // Sharing
  SHARES: {
    CREATE: '/shares',
    REDEEM: '/shares/redeem',
    MY_SHARES: '/shares/my-shares',
    SHARED_WITH_ME: '/shares/shared-with-me',
    DEACTIVATE: (code) => `/shares/${code}`,
  },

  // Uploads
  UPLOADS: {
    QUESTION: '/uploads/question',
    TEXTBOOK: '/uploads/textbook',
    MY_UPLOADS: '/uploads/my-uploads',
    PUBLISHED: '/uploads/published',
    GET: (id) => `/uploads/${id}`,
    ADMIN_PENDING: '/uploads/admin/pending',
    ADMIN_APPROVE: (id) => `/uploads/admin/${id}/approve`,
    ADMIN_REJECT: (id) => `/uploads/admin/${id}/reject`,
    ADMIN_STATS: '/uploads/admin/stats',
  },

  // Questions
  QUESTIONS: {
    LIST: '/questions',
    GET: (id) => `/questions/${id}`,
    ADMIN_PENDING: '/questions/admin/pending',
    ADMIN_ALL: '/questions/admin/all',
    APPROVE: (id) => `/questions/${id}/approve`,
    REJECT: (id) => `/questions/${id}/reject`,
  },

  // Data (public endpoints for onboarding)
  DATA: {
    UNIVERSITIES: '/data/universities',
    UNIVERSITY: (id) => `/data/universities/${id}`,
    FACULTIES: (universityId) => `/data/faculties/${universityId}`,
    DEPARTMENTS: (facultyId) => `/data/departments/${facultyId}`,
    COURSES: (departmentId) => `/data/courses/${departmentId}`,
    LEVELS: (universityId) => `/data/levels/${universityId}`,
    TEXTBOOKS: (courseId) => `/data/courses/${courseId}/textbooks`,
    SESSIONS: '/data/sessions',
    SEARCH_COURSES: '/data/search/courses',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ACTIVITY_LOGS: '/admin/activity-logs',
    REVENUE: '/admin/analytics/revenue',
    USERS: '/admin/analytics/users',
    CONTENT: '/admin/analytics/content',
  },

  // Courses (CRUD + enrollment + admin structure)
  COURSES: {
    LIST: '/courses',
    GET: (id) => `/courses/${id}`,
    CREATE: '/courses',
    UPDATE: (id) => `/courses/${id}`,
    DELETE: (id) => `/courses/${id}`,
    ENROLL: '/courses/enroll',
    MY_COURSES: '/courses/my-courses',
    // Admin structure management
    ADMIN_UNIVERSITIES: '/courses/universities',
    ADMIN_UNIVERSITY: (id) => `/courses/universities/${id}`,
    PUBLISH_UNIVERSITY: (id) => `/courses/universities/${id}/publish`,
    UNPUBLISH_UNIVERSITY: (id) => `/courses/universities/${id}/unpublish`,
    ADMIN_FACULTIES: '/courses/faculties',
    ADMIN_FACULTY: (id) => `/courses/faculties/${id}`,
    ADMIN_DEPARTMENTS: '/courses/departments',
    ADMIN_DEPARTMENT: (id) => `/courses/departments/${id}`,
  },

  // Study Groups
  GROUPS: {
    LIST_MINE: '/groups/my',
    CREATE: '/groups',
    JOIN: '/groups/join',
    GET: (id) => `/groups/${id}`,
    MESSAGES: (id) => `/groups/${id}/messages`,
    SEND_MESSAGE: (id) => `/groups/${id}/messages`,
    LEAVE: (id) => `/groups/${id}/leave`,
    DELETE: (id) => `/groups/${id}`,
  },

  // User
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    ALL: '/users/all',
    UPDATE_ROLE: (id) => `/users/${id}/role`,
    SUSPEND: (id) => `/users/${id}/suspend`,
    UNSUSPEND: (id) => `/users/${id}/unsuspend`,
    DELETE_ACCOUNT: '/users/account',
  },
};
