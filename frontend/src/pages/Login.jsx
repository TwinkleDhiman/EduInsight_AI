import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle,
  User, BookOpen, ShieldCheck, ChevronDown, Layers
} from 'lucide-react';
import { authService } from '../services/api';

const CLASSES  = ['6','7','8','9','10','11','12'];
const SECTIONS = ['A','B','C','D','E'];
const SUBJECTS = ['Mathematics','Science','English','Computer Science','Physics','Social Studies'];

export const TEACHERS_LIST = [
  { id: '1', name: 'Dr. Sarah Jenkins', subject: 'Mathematics', email: 'teacher@eduinsight.ai' },
  { id: '2', name: 'Dr. Rosalind Franklin', subject: 'Science', email: 'franklin@school.edu' },
  { id: '3', name: 'Mr. William Shakespeare', subject: 'English', email: 'shakespeare@school.edu' },
  { id: '4', name: 'Prof. Alan Turing', subject: 'Computer Science', email: 'turing@school.edu' },
  { id: '5', name: 'Dr. Homi Bhabha', subject: 'Physics', email: 'bhabha@school.edu' },
];

const DEMO = {
  STUDENT: {
    name: 'Rahul Sharma',
    email: 'rahul@school.com',
    password: 'password123',
    cls: '10',
    section: 'A',
    teacherId: '1',
  },
  TEACHER: {
    name: 'Dr. Sarah Jenkins',
    email: 'teacher@eduinsight.ai',
    password: 'password123',
    section: 'A',
    subject: 'Mathematics',
  },
  ADMIN: {
    name: 'Admin Officer',
    email: 'admin@school.com',
    password: 'password123',
  },
};

const ROLE_META = {
  STUDENT: { color: 'blue',   icon: GraduationCap, label: 'Student',  desc: 'Personalized dashboard based on assigned subject teacher' },
  TEACHER: { color: 'purple', icon: BookOpen,       label: 'Teacher',  desc: 'Monitor classes, manage quizzes & track student progress' },
  ADMIN:   { color: 'indigo', icon: ShieldCheck,    label: 'Admin',    desc: 'System administration, AI models & school analytics' },
};

const inputClass = 'w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all';
const selectClass = 'w-full pl-10 pr-8 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer';

export default function Login({ setUser }) {
  const [role, setRole]                 = useState('STUDENT');
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [cls, setCls]                   = useState('10');
  const [section, setSection]           = useState('A');
  const [teacherId, setTeacherId]       = useState('1');
  const [subject, setSubject]           = useState('Mathematics');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const navigate = useNavigate();

  const meta = ROLE_META[role];

  // Sync subject whenever student changes teacher
  const selectedTeacher = TEACHERS_LIST.find(t => t.id === teacherId) || TEACHERS_LIST[0];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(email, password);

      if (role === 'STUDENT') {
        data.student_class   = cls;
        data.student_section = section;
        data.class_name      = `Class ${cls}-${section}`;
        data.teacher_id      = selectedTeacher.id;
        data.teacher_name    = selectedTeacher.name;
        data.teacher_subject = selectedTeacher.subject;
        data.subject         = selectedTeacher.subject;
      }
      if (role === 'TEACHER') {
        data.teacher_section = section;
        data.teacher_subject = subject;
        data.subject         = subject;
      }
      if (name) {
        data.name = name;
      }

      localStorage.setItem('eduinsight_token', data.access_token);
      localStorage.setItem('eduinsight_user', JSON.stringify(data));
      setUser(data);

      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else {
        navigate(data.has_activity === false ? '/student/quiz' : '/student/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyDemo = (demoRole) => {
    const d = DEMO[demoRole];
    setRole(demoRole);
    setName(d.name || '');
    setEmail(d.email);
    setPassword(d.password);
    if (d.cls)       setCls(d.cls);
    if (d.section)   setSection(d.section);
    if (d.teacherId) setTeacherId(d.teacherId);
    if (d.subject)   setSubject(d.subject);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10 my-8">
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

        {/* Logo Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block group cursor-pointer" title="Go to EduInsight AI Landing Page">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/40 mb-3 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-blue-300 transition-colors">
              EduInsight AI
            </h1>
          </Link>
          <p className="text-xs text-blue-400 font-semibold tracking-wide uppercase mt-1">
            Understand Learning · Predict Risk · Improve Outcomes
          </p>
        </div>

        {/* ── 1. Role Selection: Student, Teacher, Admin ── */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-2.5">
            Select Your Role
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {Object.entries(ROLE_META).map(([key, m]) => {
              const Icon = m.icon;
              const active = role === key;
              const bg = active
                ? key === 'STUDENT' ? 'bg-blue-600 border-blue-500 shadow-blue-600/30'
                : key === 'TEACHER' ? 'bg-purple-600 border-purple-500 shadow-purple-600/30'
                : 'bg-indigo-600 border-indigo-500 shadow-indigo-600/30'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-500';
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setRole(key);
                    const d = DEMO[key];
                    if (d) {
                      setName(d.name || '');
                      setEmail(d.email);
                      setPassword(d.password);
                    }
                  }}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border font-bold text-xs transition-all duration-200 shadow-md ${bg} ${active ? 'text-white scale-102 ring-2 ring-white/20' : 'text-slate-400'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-center text-xs text-slate-400 mt-2 px-2">{meta.desc}</p>
        </div>

        {/* ── Login Form Card ── */}
        <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-7">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Full Name — For all roles */}
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
                  onChange={e => setName(e.target.value)}
                  placeholder={role === 'STUDENT' ? 'e.g. Rahul Sharma' : role === 'TEACHER' ? 'e.g. Ms. Priya Nair' : 'e.g. Admin User'}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email Address — All roles */}
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
                  onChange={e => setEmail(e.target.value)}
                  placeholder={role === 'TEACHER' ? 'teacher@school.edu' : role === 'ADMIN' ? 'admin@school.com' : 'student@school.edu'}
                  className={inputClass}
                />
              </div>
            </div>

            {/* ── STUDENT SPECIFIC: Class + Section + Teacher ── */}
            {role === 'STUDENT' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Class
                    </label>
                    <div className="relative">
                      <Layers className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select value={cls} onChange={e => setCls(e.target.value)} className={selectClass}>
                        {CLASSES.map(c => <option key={c} value={c} className="bg-slate-800 text-white">Class {c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Section
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select value={section} onChange={e => setSection(e.target.value)} className={selectClass}>
                        {SECTIONS.map(s => <option key={s} value={s} className="bg-slate-800 text-white">Section {s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Teacher Selection (opens dashboard of that teacher's subject) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Subject Teacher
                    </label>
                    <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                      Subject: {selectedTeacher.subject}
                    </span>
                  </div>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={teacherId}
                      onChange={e => setTeacherId(e.target.value)}
                      className={selectClass}
                    >
                      {TEACHERS_LIST.map(t => (
                        <option key={t.id} value={t.id} className="bg-slate-800 text-white">
                          {t.name} — {t.subject}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    * Your dashboard will automatically load curriculum and analytics for <strong>{selectedTeacher.subject}</strong>.
                  </p>
                </div>
              </>
            )}

            {/* ── TEACHER SPECIFIC: Section to View + Subject ── */}
            {role === 'TEACHER' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Section to View
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select value={section} onChange={e => setSection(e.target.value)} className={selectClass}>
                      {SECTIONS.map(s => <option key={s} value={s} className="bg-slate-800 text-white">Section {s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Teaching Subject
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select value={subject} onChange={e => setSubject(e.target.value)} className={selectClass}>
                      {SUBJECTS.map(s => <option key={s} value={s} className="bg-slate-800 text-white">{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Password — All roles */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In as {meta.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Demo Accounts Section ── */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-2.5">
              1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DEMO).map(([key, d]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyDemo(key)}
                  className={`py-2 px-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 ${role === key ? 'ring-1 ring-blue-400 bg-slate-700' : ''}`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${key === 'STUDENT' ? 'text-blue-400' : key === 'TEACHER' ? 'text-purple-400' : 'text-indigo-400'}`} />
                  <span>{ROLE_META[key].label}</span>
                </button>
              ))}
            </div>
            {role === 'STUDENT' && (
              <div className="mt-2 text-center text-[11px] text-slate-400">
                Demo Student auto-fills Rahul Sharma (Maths). Change teacher dropdown to test Science/English!
              </div>
            )}
          </div>

          {/* ── Sign Up Link ── */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 font-semibold hover:underline">
                Create Account (Sign Up)
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
