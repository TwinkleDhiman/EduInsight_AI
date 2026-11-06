import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eduinsight_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('eduinsight_token');
      localStorage.removeItem('eduinsight_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/api/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/api/student/me');
    return res.data;
  }
};

export const studentService = {
  getDashboard: async (studentId, subject = null) => {
    const url = subject && subject.toLowerCase() !== 'all'
      ? `/api/student/${studentId}/dashboard?subject=${encodeURIComponent(subject)}`
      : `/api/student/${studentId}/dashboard`;
    const res = await api.get(url);
    return res.data;
  },
  getAssignedQuizzes: async (studentId, subject = null) => {
    const url = subject && subject.toLowerCase() !== 'all'
      ? `/api/student/${studentId}/assigned-quizzes?subject=${encodeURIComponent(subject)}`
      : `/api/student/${studentId}/assigned-quizzes`;
    const res = await api.get(url);
    return res.data;
  },
  getSkills: async (studentId, subject = null) => {
    const url = subject && subject.toLowerCase() !== 'all'
      ? `/api/student/${studentId}/skills?subject=${encodeURIComponent(subject)}`
      : `/api/student/${studentId}/skills`;
    const res = await api.get(url);
    return res.data;
  },
  getLearningTwin: async (studentId, subject = null) => {
    const url = subject && subject.toLowerCase() !== 'all'
      ? `/api/student/${studentId}/learning-twin?subject=${encodeURIComponent(subject)}`
      : `/api/student/${studentId}/learning-twin`;
    const res = await api.get(url);
    return res.data;
  },
  getRisk: async (studentId) => {
    const res = await api.get(`/api/student/${studentId}/risk`);
    return res.data;
  },
  getShap: async (studentId) => {
    const res = await api.get(`/api/student/${studentId}/shap`);
    return res.data;
  },
  getRecommendations: async (studentId, subject = null) => {
    const url = subject && subject.toLowerCase() !== 'all'
      ? `/api/student/${studentId}/recommendations?subject=${encodeURIComponent(subject)}`
      : `/api/student/${studentId}/recommendations`;
    const res = await api.get(url);
    return res.data;
  },
  getTopics: async (studentId) => {
    const res = await api.get(`/api/student/${studentId}/topics`);
    return res.data;
  },
  getQuiz: async (studentId, skillId = null) => {
    const url = skillId ? `/api/student/${studentId}/quiz?skill_id=${skillId}` : `/api/student/${studentId}/quiz`;
    const res = await api.get(url);
    return res.data;
  },
  submitQuiz: async (studentId, submissionData) => {
    const res = await api.post(`/api/student/${studentId}/quiz/submit`, submissionData);
    return res.data;
  },
  getHistory: async (studentId) => {
    const res = await api.get(`/api/student/${studentId}/history`);
    return res.data;
  },
  generateAIQuiz: async (params) => {
    const res = await api.post('/api/student/generate-ai-quiz', params);
    return res.data;
  }
};

export const teacherService = {
  getDashboard: async (subject = null) => {
    const url = subject && subject.toLowerCase() !== 'all'
      ? `/api/teacher/dashboard?subject=${encodeURIComponent(subject)}`
      : '/api/teacher/dashboard';
    const res = await api.get(url);
    return res.data;
  },
  getStudents: async () => {
    const res = await api.get('/api/teacher/students');
    return res.data;
  },
  getClasses: async () => {
    const res = await api.get('/api/teacher/classes');
    return res.data;
  },
  getActivities: async (subject = null) => {
    const url = subject && subject.toLowerCase() !== 'all'
      ? `/api/teacher/activities?subject=${encodeURIComponent(subject)}`
      : '/api/teacher/activities';
    const res = await api.get(url);
    return res.data;
  },
  createActivity: async (data) => {
    const res = await api.post('/api/teacher/activities', data);
    return res.data;
  },
  updateActivity: async (id, data) => {
    const res = await api.put(`/api/teacher/activities/${id}`, data);
    return res.data;
  },
  deleteActivity: async (id) => {
    const res = await api.delete(`/api/teacher/activities/${id}`);
    return res.data;
  },
  getModelPerformance: async () => {
    const res = await api.get('/api/teacher/model-performance');
    return res.data;
  },
  getTeachers: async () => {
    const res = await api.get('/api/teachers');
    return res.data;
  },
  createQuizQuestion: async (questionData) => {
    const res = await api.post('/api/teacher/quiz-questions', questionData);
    return res.data;
  },
  getQuizQuestions: async (params = {}) => {
    let url = '/api/teacher/quiz-questions';
    const query = new URLSearchParams();
    if (params.skillId) query.append('skill_id', params.skillId);
    if (params.subject) query.append('subject', params.subject);
    if (query.toString()) url += `?${query.toString()}`;
    const res = await api.get(url);
    return res.data;
  },
  updateQuizQuestion: async (questionId, data) => {
    const res = await api.put(`/api/teacher/quiz-questions/${questionId}`, data);
    return res.data;
  },
  deleteQuizQuestion: async (questionId) => {
    const res = await api.delete(`/api/teacher/quiz-questions/${questionId}`);
    return res.data;
  },
  getClassPerformance: async (subject = null) => {
    const url = subject ? `/api/teacher/class-performance?subject=${encodeURIComponent(subject)}` : '/api/teacher/class-performance';
    const res = await api.get(url);
    return res.data;
  },
  getSkills: async (subject = null) => {
    const url = subject ? `/api/teacher/skills?subject=${encodeURIComponent(subject)}` : '/api/teacher/skills';
    const res = await api.get(url);
    return res.data;
  }
};

export const adminService = {
  getDashboard: async () => {
    const res = await api.get('/api/admin/dashboard');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/api/admin/users');
    return res.data;
  },
  createUser: async (userData) => {
    const res = await api.post('/api/admin/users', userData);
    return res.data;
  },
  updateUser: async (userId, userData) => {
    const res = await api.put(`/api/admin/users/${userId}`, userData);
    return res.data;
  },
  deleteUser: async (userId) => {
    const res = await api.delete(`/api/admin/users/${userId}`);
    return res.data;
  },
  getSystemStatus: async () => {
    const res = await api.get('/api/admin/system-status');
    return res.data;
  },
  getModelPerformance: async () => {
    const res = await api.get('/api/admin/model-performance');
    return res.data;
  }
};

export default api;
