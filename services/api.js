/**
 * Vectra API Service
 * Handles all API calls to the backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = null;
  }

  // Get stored token
  async getToken() {
    if (this.token) return this.token;
    try {
      const session = await AsyncStorage.getItem('session');
      if (session) {
        const parsed = JSON.parse(session);
        this.token = parsed.access_token;
        return this.token;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return null;
  }

  // Set token after login
  async setToken(token) {
    this.token = token;
  }

  // Clear token on logout
  async clearToken() {
    this.token = null;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);

      // Safely parse body — empty responses (e.g. rate-limit or server crash) return null
      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server error (${response.status}): ${text.substring(0, 120)}`);
        }
      } else {
        throw new Error(`Server returned empty response (status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file (multipart/form-data) using XMLHttpRequest for reliability
  async uploadFile(endpoint, formData) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.timeout = 300000; // 5 minute timeout for large files

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            console.error(`[API Upload Error] ${endpoint}:`, data.message || 'Upload failed');
            reject(new Error(data.message || 'Upload failed'));
          }
        } catch (e) {
          console.error(`[API Upload Error] ${endpoint}: Failed to parse response`);
          reject(new Error('Failed to parse server response'));
        }
      };

      xhr.onerror = () => {
        console.error(`[API Upload Error] ${endpoint}: Network error`);
        reject(new Error('Network error during upload'));
      };

      xhr.ontimeout = () => {
        console.error(`[API Upload Error] ${endpoint}: Upload timed out`);
        reject(new Error('Upload timed out'));
      };

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          console.log(`[API] UPLOAD ${endpoint}: ${percent}%`);
        }
      };

      console.log(`[API] UPLOAD ${url}`);
      xhr.send(formData);
    });
  }

  // ==========================================
  // AUTH METHODS
  // ==========================================

  async signup(email, password, displayName, termsAccepted = true) {
    const response = await this.post(API_ENDPOINTS.AUTH.SIGNUP, {
      email,
      password,
      displayName,
      termsAccepted,
    });

    if (response.data?.session) {
      await AsyncStorage.setItem('session', JSON.stringify(response.data.session));
      await this.setToken(response.data.session.access_token);
    }

    return response;
  }

  async signin(email, password) {
    const response = await this.post(API_ENDPOINTS.AUTH.SIGNIN, {
      email,
      password,
    });

    if (response.data?.session) {
      await AsyncStorage.setItem('session', JSON.stringify(response.data.session));
      await this.setToken(response.data.session.access_token);
    }

    return response;
  }

  async signout() {
    try {
      await this.post(API_ENDPOINTS.AUTH.SIGNOUT, {});
    } finally {
      await AsyncStorage.removeItem('session');
      await this.clearToken();
    }
  }

  async getCurrentUser() {
    return this.get(API_ENDPOINTS.AUTH.ME);
  }

  // ==========================================
  // LECTURES METHODS
  // ==========================================

  async getLectures(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${API_ENDPOINTS.LECTURES.LIST}?${query}`
      : API_ENDPOINTS.LECTURES.LIST;
    return this.get(endpoint);
  }

  async getLecture(id) {
    return this.get(API_ENDPOINTS.LECTURES.GET(id));
  }

  async createLecture(data) {
    return this.post(API_ENDPOINTS.LECTURES.CREATE, data);
  }

  async updateLecture(id, data) {
    return this.put(API_ENDPOINTS.LECTURES.UPDATE(id), data);
  }

  async deleteLecture(id) {
    return this.delete(API_ENDPOINTS.LECTURES.DELETE(id));
  }

  async uploadAudio(lectureId, audioFile) {
    const formData = new FormData();
    formData.append('lectureId', lectureId);
    formData.append('audio', {
      uri: audioFile.uri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    });
    return this.uploadFile(API_ENDPOINTS.LECTURES.UPLOAD_AUDIO, formData);
  }

  async uploadLectureImages(lectureId, images) {
    const formData = new FormData();
    formData.append('lectureId', lectureId);

    images.forEach((uri, index) => {
      const filename = uri.split('/').pop();
      const ext = filename.split('.').pop().toLowerCase();
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      formData.append('images', {
        uri,
        type: mimeType,
        name: `image_${index}.${ext}`,
      });
    });

    return this.uploadFile(API_ENDPOINTS.LECTURES.UPLOAD_IMAGES, formData);
  }

  async processLecture(lectureId) {
    return this.post(API_ENDPOINTS.LECTURES.PROCESS, { lectureId });
  }

  async toggleFavorite(id) {
    return this.post(API_ENDPOINTS.LECTURES.TOGGLE_FAVORITE(id), {});
  }

  // ==========================================
  // AI METHODS
  // ==========================================

  async chatWithAI(lectureId, message, history = []) {
    return this.post(API_ENDPOINTS.AI.CHAT, { lectureId, message, history });
  }

  async generateRecap(lectureId) {
    return this.post(API_ENDPOINTS.AI.RECAP, { lectureId });
  }

  async getChatHistory(lectureId) {
    return this.get(API_ENDPOINTS.AI.CHAT_HISTORY(lectureId));
  }

  async clearChatHistory(lectureId) {
    return this.delete(API_ENDPOINTS.AI.CLEAR_CHAT_HISTORY(lectureId));
  }

  async deleteAccount() {
    return this.delete(API_ENDPOINTS.USER.DELETE_ACCOUNT);
  }

  // ==========================================
  // SHARING METHODS
  // ==========================================

  async createShareCode(data) {
    return this.post(API_ENDPOINTS.SHARES.CREATE, data);
  }

  async redeemShareCode(code) {
    return this.post(API_ENDPOINTS.SHARES.REDEEM, { code });
  }

  async getMyShares() {
    return this.get(API_ENDPOINTS.SHARES.MY_SHARES);
  }

  async getSharedWithMe() {
    return this.get(API_ENDPOINTS.SHARES.SHARED_WITH_ME);
  }

  async deactivateShareCode(code) {
    return this.delete(API_ENDPOINTS.SHARES.DEACTIVATE(code));
  }

  // ==========================================
  // UPLOAD METHODS
  // ==========================================

  async uploadPastQuestion(formData) {
    return this.uploadFile(API_ENDPOINTS.UPLOADS.QUESTION, formData);
  }

  async uploadTextbook(formData) {
    return this.uploadFile(API_ENDPOINTS.UPLOADS.TEXTBOOK, formData);
  }

  async getMyUploads(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${API_ENDPOINTS.UPLOADS.MY_UPLOADS}?${query}`
      : API_ENDPOINTS.UPLOADS.MY_UPLOADS;
    return this.get(endpoint);
  }

  async getPublishedUploads(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${API_ENDPOINTS.UPLOADS.PUBLISHED}?${query}`
      : API_ENDPOINTS.UPLOADS.PUBLISHED;
    return this.get(endpoint);
  }

  // ==========================================
  // DATA METHODS
  // ==========================================

  async getUniversities() {
    return this.get(API_ENDPOINTS.DATA.UNIVERSITIES);
  }

  async getUniversity(id) {
    return this.get(API_ENDPOINTS.DATA.UNIVERSITY(id));
  }

  async getFaculties(universityId) {
    return this.get(API_ENDPOINTS.DATA.FACULTIES(universityId));
  }

  async getDepartments(facultyId) {
    return this.get(API_ENDPOINTS.DATA.DEPARTMENTS(facultyId));
  }

  async getCourses(departmentId) {
    return this.get(API_ENDPOINTS.DATA.COURSES(departmentId));
  }

  async getTextbooks(courseId) {
    return this.get(API_ENDPOINTS.DATA.TEXTBOOKS(courseId));
  }

  async getSessions() {
    return this.get(API_ENDPOINTS.DATA.SESSIONS);
  }

  async searchCourses(query) {
    return this.get(`${API_ENDPOINTS.DATA.SEARCH_COURSES}?q=${encodeURIComponent(query)}`);
  }

  // ==========================================
  // QUESTIONS METHODS
  // ==========================================

  async getQuestions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${API_ENDPOINTS.QUESTIONS.LIST}?${query}`
      : API_ENDPOINTS.QUESTIONS.LIST;
    return this.get(endpoint);
  }

  async getQuestion(id) {
    return this.get(API_ENDPOINTS.QUESTIONS.GET(id));
  }

  // ==========================================
  // AUTH ADDITIONS
  // ==========================================

  async requestPasswordReset(email) {
    return this.post(API_ENDPOINTS.AUTH.PASSWORD_RESET, { email });
  }

  // ==========================================
  // ADMIN METHODS
  // ==========================================

  async getAdminDashboard() {
    return this.get(API_ENDPOINTS.ADMIN.DASHBOARD);
  }

  async getAdminActivityLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`${API_ENDPOINTS.ADMIN.ACTIVITY_LOGS}?${query}`);
  }

  async getPendingQuestions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${API_ENDPOINTS.QUESTIONS.ADMIN_PENDING}?${query}`
      : API_ENDPOINTS.QUESTIONS.ADMIN_PENDING;
    return this.get(endpoint);
  }

  async approveQuestion(id) {
    return this.post(API_ENDPOINTS.QUESTIONS.APPROVE(id), {});
  }

  async rejectQuestion(id, reason) {
    return this.post(API_ENDPOINTS.QUESTIONS.REJECT(id), { rejection_reason: reason });
  }

  async getPendingUploads(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${API_ENDPOINTS.UPLOADS.ADMIN_PENDING}?${query}`
      : API_ENDPOINTS.UPLOADS.ADMIN_PENDING;
    return this.get(endpoint);
  }

  async approveUpload(id, adminNotes) {
    return this.post(API_ENDPOINTS.UPLOADS.ADMIN_APPROVE(id), { admin_notes: adminNotes });
  }

  async rejectUpload(id, reason) {
    return this.post(API_ENDPOINTS.UPLOADS.ADMIN_REJECT(id), { rejection_reason: reason });
  }

  async getUploadStats() {
    return this.get(API_ENDPOINTS.UPLOADS.ADMIN_STATS);
  }

  async getAllUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${API_ENDPOINTS.USER.ALL}?${query}`
      : API_ENDPOINTS.USER.ALL;
    return this.get(endpoint);
  }

  async updateUserRole(userId, role) {
    return this.put(API_ENDPOINTS.USER.UPDATE_ROLE(userId), { role });
  }

  async suspendUser(userId) {
    return this.post(API_ENDPOINTS.USER.SUSPEND(userId), {});
  }

  async unsuspendUser(userId) {
    return this.post(API_ENDPOINTS.USER.UNSUSPEND(userId), {});
  }

  // ==========================================
  // COURSES CRUD (Admin)
  // ==========================================

  async listAllCourses(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${API_ENDPOINTS.COURSES.LIST}?${query}`
      : API_ENDPOINTS.COURSES.LIST;
    return this.get(endpoint);
  }

  async getCourseById(id) {
    return this.get(API_ENDPOINTS.COURSES.GET(id));
  }

  async createCourse(data) {
    return this.post(API_ENDPOINTS.COURSES.CREATE, data);
  }

  async updateCourseById(id, data) {
    return this.put(API_ENDPOINTS.COURSES.UPDATE(id), data);
  }

  async deleteCourse(id) {
    return this.delete(API_ENDPOINTS.COURSES.DELETE(id));
  }

  // ==========================================
  // ENROLLMENT
  // ==========================================

  async enrollInCourses(courseIds) {
    return this.post(API_ENDPOINTS.COURSES.ENROLL, { course_ids: courseIds });
  }

  async getEnrolledCourses() {
    return this.get(API_ENDPOINTS.COURSES.MY_COURSES);
  }

  // ==========================================
  // DATA - Levels
  // ==========================================

  async getLevels(universityId) {
    return this.get(API_ENDPOINTS.DATA.LEVELS(universityId));
  }

  // ==========================================
  // STUDY GROUPS
  // ==========================================

  async getMyGroups() {
    return this.get(API_ENDPOINTS.GROUPS.LIST_MINE);
  }

  async createGroup(data) {
    return this.post(API_ENDPOINTS.GROUPS.CREATE, data);
  }

  async joinGroupByCode(invite_code) {
    return this.post(API_ENDPOINTS.GROUPS.JOIN, { invite_code });
  }

  async getGroup(id) {
    return this.get(API_ENDPOINTS.GROUPS.GET(id));
  }

  async getGroupMessages(id, params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${API_ENDPOINTS.GROUPS.MESSAGES(id)}?${query}`
      : API_ENDPOINTS.GROUPS.MESSAGES(id);
    return this.get(endpoint);
  }

  async sendGroupMessage(id, content) {
    return this.post(API_ENDPOINTS.GROUPS.SEND_MESSAGE(id), { content });
  }

  async leaveGroup(id) {
    return this.delete(API_ENDPOINTS.GROUPS.LEAVE(id));
  }

  async deleteGroup(id) {
    return this.delete(API_ENDPOINTS.GROUPS.DELETE(id));
  }

  // ==========================================
  // ADMIN STRUCTURE (Universities/Faculties/Departments)
  // ==========================================

  async getAdminUniversities() {
    return this.get(API_ENDPOINTS.COURSES.ADMIN_UNIVERSITIES);
  }

  async createUniversity(data) {
    return this.post(API_ENDPOINTS.COURSES.ADMIN_UNIVERSITIES, data);
  }

  async updateUniversity(id, data) {
    return this.put(API_ENDPOINTS.COURSES.ADMIN_UNIVERSITY(id), data);
  }

  async publishUniversity(id) {
    return this.post(API_ENDPOINTS.COURSES.PUBLISH_UNIVERSITY(id), {});
  }

  async unpublishUniversity(id) {
    return this.post(API_ENDPOINTS.COURSES.UNPUBLISH_UNIVERSITY(id), {});
  }

  async createFaculty(data) {
    return this.post(API_ENDPOINTS.COURSES.ADMIN_FACULTIES, data);
  }

  async updateFaculty(id, data) {
    return this.put(API_ENDPOINTS.COURSES.ADMIN_FACULTY(id), data);
  }

  async createDepartment(data) {
    return this.post(API_ENDPOINTS.COURSES.ADMIN_DEPARTMENTS, data);
  }

  async updateDepartment(id, data) {
    return this.put(API_ENDPOINTS.COURSES.ADMIN_DEPARTMENT(id), data);
  }

  // ==========================================
  // STREAKS
  // ==========================================

  async getStudyStreak() {
    return this.get('/streaks');
  }

  async recordStudyActivity() {
    return this.post('/streaks/record', {});
  }

  // ==========================================
  // BOOKMARKS
  // ==========================================

  async getBookmarks() {
    return this.get('/bookmarks');
  }

  async addBookmark(data) {
    return this.post('/bookmarks', data);
  }

  async removeBookmark(id) {
    return this.delete(`/bookmarks/${id}`);
  }

  // ==========================================
  // DOWNLOADS
  // ==========================================

  async getDownloads() {
    return this.get('/downloads');
  }

  async deleteDownload(id) {
    return this.delete(`/downloads/${id}`);
  }

  // ==========================================
  // ANALYTICS
  // ==========================================

  async getAnalytics(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(query ? `/admin/analytics?${query}` : '/admin/analytics');
  }

  // ==========================================
  // REPEATED QUESTIONS
  // ==========================================

  async getRepeatedQuestions(courseCode) {
    return this.get(`/questions/repeated/${courseCode}`);
  }

  // ==========================================
  // EXAM COUNTDOWNS
  // ==========================================

  async getExamCountdowns() {
    return this.get('/exams/countdowns');
  }

  async addExamCountdown(data) {
    return this.post('/exams/countdowns', data);
  }

  async deleteExamCountdown(id) {
    return this.delete(`/exams/countdowns/${id}`);
  }

  // ==========================================
  // RECENTLY VIEWED
  // ==========================================

  async getRecentlyViewed() {
    return this.get('/recently-viewed');
  }

  async addRecentlyViewed(data) {
    return this.post('/recently-viewed', data);
  }
}

// Export singleton instance
export const api = new ApiService();
export default api;
