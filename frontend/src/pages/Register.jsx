import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, ArrowRight, ArrowLeft, AlertCircle, ChevronDown, Layers } from 'lucide-react';

const CLASSES  = ['6','7','8','9','10','11','12'];
const SECTIONS = ['A','B','C','D','E'];
import { authService } from '../services/api';

export default function Register({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [teacherId, setTeacherId] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [cls, setCls] = useState('10');
  const [section, setSection] = useState('A');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch available teachers so students can choose who to be assigned to
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // Use the public /api/teachers endpoint
        const res = await fetch(
          (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000') + '/api/teachers'
        );
        if (res.ok) {
          const data = await res.json();
          setTeachers(data);
          if (data.length > 0) setTeacherId(data[0].id);
        }
      } catch (_) {
        // Not critical — teacher can also be auto-assigned by the backend
      }
    };
    fetchTeachers();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registrationPayload = {
        name,
        email,
        password,
        role,
        ...(role === 'STUDENT' && teacherId ? { teacher_id: Number(teacherId) } : {})
      };

      const data = await authService.register(registrationPayload);
      localStorage.setItem('eduinsight_token', data.access_token);
      localStorage.setItem('eduinsight_user', JSON.stringify(data));
      setUser(data);

      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/quiz');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Top Navigation: Back to Home */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-500 hover:bg-slate-700/60 transition-all group shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400 group-hover:-translate-x-1 transition-transform" />
            <span>← Back to Home</span>
          </Link>
          <span className="text-xs text-slate-500 font-medium">EduInsight Portal</span>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block group cursor-pointer" title="Go to EduInsight AI Landing Page">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-4 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                EduInsight AI
              </h1>
            </Link>
            <p className="text-xs text-slate-400 mt-1">Join EduInsight AI Personalized Learning Platform</p>
          </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Role Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              I am a
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  role === 'STUDENT'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('TEACHER')}
                className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  role === 'TEACHER'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  role === 'ADMIN'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'TEACHER' ? 'teacher@school.edu' : 'student@school.edu'}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Class + Section (Students only) */}
          {role === 'STUDENT' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Class</label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select value={cls} onChange={e => setCls(e.target.value)} className="w-full pl-9 pr-9 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 appearance-none transition-all">
                    {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Section</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select value={section} onChange={e => setSection(e.target.value)} className="w-full pl-9 pr-9 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 appearance-none transition-all">
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Assign Teacher (Students only) */}
          {role === 'STUDENT' && teachers.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Assign to Teacher
              </label>
              <div className="relative">
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 appearance-none transition-all"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create {role === 'TEACHER' ? 'Teacher' : 'Student'} Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-blue-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);
}
