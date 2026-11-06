import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, BarChart3, Database, HardDrive,
  Activity, ArrowRight, UserPlus, CheckCircle2,
  Sparkles, Layers
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { adminService } from '../services/api';

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      setDashboardData(res);
    } catch (err) {
      console.warn('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const overview = dashboardData?.overview || {
    total_users: 0,
    total_students: 0,
    total_teachers: 0,
    total_admins: 0,
    total_activities: 0,
    system_status: 'Online',
    models_active: 'XGBoost + Random Forest'
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Administrator Command Center
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Monitor infrastructure health, manage users, and review AI model evaluation metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/users')}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 text-sm transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Users</span>
          </button>
          <button
            onClick={() => navigate('/admin/models')}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 text-sm transition-all shrink-0"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Model Performance</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value={overview.total_users ?? 0}
          subtitle="Students, Teachers, Admins"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={overview.total_students ?? 0}
          subtitle="Class 10-A & Class 10-B"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Active Teachers"
          value={overview.total_teachers ?? 0}
          subtitle="Curriculum Instructors"
          icon={Shield}
          color="purple"
        />
        <StatCard
          title="Learning Activities"
          value={overview.total_activities ?? 0}
          subtitle="Published & Draft quizzes"
          icon={Activity}
          color="amber"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">User Management</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, edit, assign roles, or deactivate students and teachers.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-600 pt-2">
            <span>Open User Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/models')}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Model Performance</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review ASSISTments test evaluation, ROC-AUC (0.8975), and feature importance.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-purple-600 pt-2">
            <span>View ML Benchmark</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
