import React from 'react';
import { User, Mail, Shield, GraduationCap, Calendar, CheckCircle2 } from 'lucide-react';

export default function Profile({ user }) {
  const roleLabel = user?.role === 'ADMIN' ? 'Administrator' : (user?.role === 'TEACHER' ? 'Teacher' : 'Student');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          View your credentials and academic association in EduInsight AI.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-blue-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name || 'Rahul Sharma'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{roleLabel} • {user?.email || 'user@school.com'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-semibold block uppercase">Account Role</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">{roleLabel}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-semibold block uppercase">Status</span>
            <span className="text-sm font-bold text-emerald-600 mt-1 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Active System Account
            </span>
          </div>

          {user?.role === 'STUDENT' && (
            <>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block uppercase">Student Code</span>
                <span className="text-sm font-bold text-blue-600 mt-1 block">#{user?.student_code || '100001'}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block uppercase">Class Assignment</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">{user?.class_name || 'Class 10-A'}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
