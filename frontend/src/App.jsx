import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import MobileBottomNav from './components/MobileBottomNav';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import LearningTwin from './pages/LearningTwin';
import Quiz from './pages/Quiz';
import Skills from './pages/Skills';
import Recommendations from './pages/Recommendations';
import RiskAnalysis from './pages/RiskAnalysis';

// Teacher Pages
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherStudents from './pages/TeacherStudents';
import TeacherAddQuiz from './pages/TeacherAddQuiz';
import TeacherActivities from './pages/TeacherActivities';
import TeacherQuizManager from './pages/TeacherQuizManager';
import TeacherClassPerformance from './pages/TeacherClassPerformance';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSystemStatus from './pages/AdminSystemStatus';
import AdminModelPerformance from './pages/AdminModelPerformance';
import AdminSettings from './pages/AdminSettings';

// Shared Profile Page
import Profile from './pages/Profile';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eduinsight_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const isAuthenticated = !!localStorage.getItem('eduinsight_token');

  // Compute default landing route based on role
  const getDefaultRoute = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'TEACHER') return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />

          {/* Protected Routes Wrapper */}
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <div className="flex min-h-screen">
                  <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                  <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                    <Navbar user={user} setIsOpen={setSidebarOpen} />
                    <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
                      <Routes>
                        {/* ── Student Routes ── */}
                        <Route path="/student/dashboard" element={<StudentDashboard user={user} />} />
                        <Route path="/student/learning-twin" element={<LearningTwin user={user} />} />
                        <Route path="/student/quiz" element={<Quiz user={user} showToast={showToast} />} />
                        {/* Skills & Recommendations are now tabs inside Learning Twin */}
                        <Route path="/student/skills" element={<Navigate to="/student/learning-twin?tab=skills" replace />} />
                        <Route path="/student/recommendations" element={<Navigate to="/student/learning-twin?tab=recommendations" replace />} />
                        <Route path="/student/risk" element={<RiskAnalysis user={user} />} />
                        <Route path="/student/profile" element={<Profile user={user} />} />

                        {/* ── Teacher Routes ── */}
                        <Route path="/teacher/dashboard" element={<TeacherDashboard user={user} />} />
                        <Route path="/teacher/classes" element={<TeacherStudents user={user} />} />
                        <Route path="/teacher/students" element={<TeacherStudents user={user} />} />
                        <Route path="/teacher/quiz-manager" element={<TeacherQuizManager user={user} showToast={showToast} />} />
                        <Route path="/teacher/class-performance" element={<TeacherClassPerformance user={user} />} />
                        <Route path="/teacher/add-quiz" element={<TeacherQuizManager user={user} showToast={showToast} />} />
                        <Route path="/teacher/assign-quiz" element={<TeacherQuizManager user={user} showToast={showToast} />} />
                        <Route path="/teacher/activities" element={<TeacherActivities user={user} showToast={showToast} />} />
                        <Route path="/teacher/analytics" element={<TeacherDashboard user={user} />} />
                        <Route path="/teacher/models" element={<Navigate to="/admin/models" replace />} />
                        <Route path="/teacher/profile" element={<Profile user={user} />} />

                        {/* ── Admin Routes (Separated Admin Dashboard & Shifted Model Performance) ── */}
                        <Route path="/admin/dashboard" element={<AdminDashboard user={user} />} />
                        <Route path="/admin/users" element={<AdminUsers user={user} showToast={showToast} />} />
                        <Route path="/admin/status" element={<AdminSystemStatus user={user} showToast={showToast} />} />
                        <Route path="/admin/models" element={<AdminModelPerformance user={user} />} />
                        <Route path="/admin/settings" element={<AdminSettings user={user} showToast={showToast} />} />
                        <Route path="/admin/profile" element={<Profile user={user} />} />

                        {/* Root & Fallback Redirects */}
                        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    {/* Mobile Bottom Navigation for Students */}
                    <MobileBottomNav user={user} />
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </Router>
  );
}
