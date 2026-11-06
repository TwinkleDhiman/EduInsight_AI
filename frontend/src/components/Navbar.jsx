import React, { useState, useRef, useEffect } from 'react';
import {
  Menu, Search, ChevronDown, User as UserIcon,
  Mail, Layers, BookOpen, LogOut, GraduationCap,
  Shield, Award, Check
} from 'lucide-react';

export default function Navbar({ user, setIsOpen }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const getRoleLabel = () => {
    if (user?.role === 'ADMIN') return 'Administrator';
    if (user?.role === 'TEACHER') return 'Teacher';
    return 'Student';
  };

  const getRoleBadgeClass = () => {
    if (user?.role === 'ADMIN') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (user?.role === 'TEACHER') return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const handleLogout = () => {
    localStorage.removeItem('eduinsight_token');
    localStorage.removeItem('eduinsight_user');
    window.location.href = '/login';
  };

  const studentName = user?.name || 'Rahul Sharma';
  const studentEmail = user?.email || 'rahul@school.com';
  const studentClass = user?.class_name || (user?.student_class ? `Class ${user.student_class}-${user.student_section || 'A'}` : 'Class 10-A');
  const teacherName = user?.teacher_name || 'Dr. Sarah Jenkins';
  const subjectName = user?.teacher_subject || user?.subject || 'Science';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right User Profile Dropdown */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition-all text-left"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-blue-100 overflow-hidden">
              {studentName ? studentName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-800 leading-none">{studentName}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">{getRoleLabel()}</span>
          </div>

          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </button>

        {/* Profile Details Dropdown Card */}
        {dropdownOpen && (
          <div className="absolute right-0 top-12 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header: Name, Avatar, and Role */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-500/20 shrink-0">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-extrabold text-slate-900 truncate">
                  {studentName}
                </h4>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${getRoleBadgeClass()}`}>
                  {getRoleLabel()}
                </span>
              </div>
            </div>

            {/* Student Profile Info Rows */}
            <div className="py-3 space-y-2.5 text-xs">
              {/* Email */}
              <div className="flex items-start gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</span>
                  <span className="font-semibold text-slate-800 truncate block">{studentEmail}</span>
                </div>
              </div>

              {/* Class & Section */}
              {user?.role !== 'ADMIN' && (
                <div className="flex items-start gap-2.5 text-slate-600">
                  <Layers className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {user?.role === 'TEACHER' ? 'Section Managed' : 'Class & Section'}
                    </span>
                    <span className="font-semibold text-slate-800 block">
                      {user?.role === 'TEACHER'
                        ? `Section ${user?.teacher_section || 'A'}`
                        : studentClass}
                    </span>
                  </div>
                </div>
              )}

              {/* Assigned Teacher (or Subject for Teacher) */}
              {user?.role === 'STUDENT' ? (
                <div className="flex items-start gap-2.5 text-slate-600">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teacher Assigned</span>
                    <span className="font-bold text-slate-800 block">
                      {teacherName}
                    </span>
                    <span className="text-[11px] font-medium text-blue-600 block">
                      Subject: {subjectName}
                    </span>
                  </div>
                </div>
              ) : user?.role === 'TEACHER' ? (
                <div className="flex items-start gap-2.5 text-slate-600">
                  <BookOpen className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teaching Subject</span>
                    <span className="font-bold text-slate-800 block">
                      {user?.teacher_subject || user?.subject || 'Mathematics'}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-1"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
