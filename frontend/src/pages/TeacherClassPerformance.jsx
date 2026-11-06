import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, TrendingUp, TrendingDown, Users, BookOpen,
  Award, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Search, Filter, Plus
} from 'lucide-react';
import { teacherService } from '../services/api';

// Color helpers
function getMasteryColor(pct) {
  if (pct === 0) return { bar: 'bg-slate-200', text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-600' };
  if (pct >= 70) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' };
  if (pct >= 40) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' };
  return { bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700' };
}

function getMasteryLabel(pct) {
  if (pct === 0) return 'Not Started';
  if (pct >= 70) return 'Strong';
  if (pct >= 40) return 'Developing';
  return 'Needs Work';
}

export default function TeacherClassPerformance({ user }) {
  const navigate = useNavigate();
  const teacherSubject = user?.teacher_subject || user?.class_name || 'Mathematics';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('my'); // 'my' or 'all'
  const [sortField, setSortField] = useState('avg_mastery');
  const [sortDir, setSortDir] = useState('asc'); // asc = weakest first
  const [expandedTopic, setExpandedTopic] = useState(null);

  const fetchPerformance = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      setError(null);
      const res = await teacherService.getClassPerformance();
      setData(res);
    } catch (err) {
      console.error('[TeacherClassPerformance] Error:', err);
      if (!quiet) setError('Failed to load class performance data.');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();

    const handleSync = () => {
      fetchPerformance(true);
    };

    window.addEventListener('eduinsight_quiz_completed', handleSync);
    const handleStorage = (e) => {
      if (e.key === 'eduinsight_last_quiz_sync') {
        handleSync();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('eduinsight_quiz_completed', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const topics = (data?.topics || []).filter(t => {
    const matchesSearch = t.skill_name.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || !t.subject || t.subject.toLowerCase() === teacherSubject.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  const sorted = [...topics].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const totalStudents = data?.total_students || 0;
  const avgClassMastery = topics.length
    ? Math.round(topics.reduce((s, t) => s + t.avg_mastery, 0) / topics.length)
    : 0;
  const weakTopics = topics.filter(t => t.avg_mastery < 40).length;
  const strongTopics = topics.filter(t => t.avg_mastery >= 70).length;

  const SortIcon = ({ field }) => (
    <span className="ml-1 text-slate-400">
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-purple-600" />
            Class Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Topic-wise mastery analytics for your&nbsp;
            <span className="text-purple-700 font-bold">{teacherSubject}</span> class
          </p>
        </div>
        <button
          onClick={fetchPerformance}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Class Students"
          value={totalStudents}
          icon={Users}
          color="blue"
        />
        <StatTile
          label="Avg Class Mastery"
          value={`${avgClassMastery}%`}
          icon={Award}
          color={avgClassMastery >= 70 ? 'green' : avgClassMastery >= 40 ? 'amber' : 'red'}
        />
        <StatTile
          label="Strong Topics"
          value={strongTopics}
          icon={TrendingUp}
          color="green"
          subtitle="≥ 70% mastery"
        />
        <StatTile
          label="Needs Attention"
          value={weakTopics}
          icon={AlertTriangle}
          color="red"
          subtitle="< 40% mastery"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            {/* Subject Scope Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setSubjectFilter('my')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  subjectFilter === 'my'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Subject ({teacherSubject})
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  subjectFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Subjects
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {sorted.length} topic{sorted.length !== 1 ? 's' : ''} · Click a row to expand
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="font-semibold">No topics found for this subject filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Topic / Skill</th>
                  <th
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-800 transition-colors select-none"
                    onClick={() => handleSort('avg_mastery')}
                  >
                    Avg Mastery <SortIcon field="avg_mastery" />
                  </th>
                  <th className="py-3.5 px-5">Progress</th>
                  <th
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-800 transition-colors select-none"
                    onClick={() => handleSort('mastered')}
                  >
                    Mastered <SortIcon field="mastered" />
                  </th>
                  <th
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-800 transition-colors select-none"
                    onClick={() => handleSort('needs_improvement')}
                  >
                    Needs Help <SortIcon field="needs_improvement" />
                  </th>
                  <th className="py-3.5 px-5">Questions</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map(t => {
                  const colors = getMasteryColor(t.avg_mastery);
                  const label = getMasteryLabel(t.avg_mastery);
                  const isExpanded = expandedTopic === t.skill_id;

                  return (
                    <React.Fragment key={t.skill_id}>
                      <tr
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => setExpandedTopic(isExpanded ? null : t.skill_id)}
                      >
                        {/* Topic Name & Subject */}
                        <td className="py-4 px-5">
                          <div className="flex items-start gap-2">
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            }
                            <div>
                              <span className="font-bold text-slate-800 text-sm block">{t.skill_name}</span>
                              {t.subject && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md border border-purple-200">
                                  {t.subject}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Avg Mastery */}
                        <td className="py-4 px-5">
                          <span className={`text-base font-extrabold ${colors.text}`}>
                            {t.avg_mastery}%
                          </span>
                        </td>

                        {/* Progress Bar */}
                        <td className="py-4 px-5">
                          <div className="w-28 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${colors.bar}`}
                              style={{ width: `${Math.min(100, Math.max(2, t.avg_mastery))}%` }}
                            />
                          </div>
                        </td>

                        {/* Mastered */}
                        <td className="py-4 px-5">
                          <span className="text-sm font-bold text-emerald-700">{t.mastered}</span>
                          <span className="text-xs text-slate-400"> / {t.total_students}</span>
                        </td>

                        {/* Needs Help */}
                        <td className="py-4 px-5">
                          <span className={`text-sm font-bold ${t.needs_improvement > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                            {t.needs_improvement}
                          </span>
                          <span className="text-xs text-slate-400"> / {t.total_students}</span>
                        </td>

                        {/* Questions */}
                        <td className="py-4 px-5 text-slate-600 font-semibold text-sm">
                          {t.question_count}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.badge}`}>
                            {label}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="py-0">
                            <div className={`px-6 py-5 border-t border-b ${colors.border} ${colors.bg}`}>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Distribution breakdown */}
                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    Student Distribution
                                  </p>
                                  <DistBar
                                    label="Mastered (≥70%)"
                                    count={t.mastered}
                                    total={t.total_students}
                                    color="bg-emerald-500"
                                    textColor="text-emerald-700"
                                  />
                                  <DistBar
                                    label="Developing (40–70%)"
                                    count={t.developing}
                                    total={t.total_students}
                                    color="bg-amber-500"
                                    textColor="text-amber-700"
                                  />
                                  <DistBar
                                    label="Needs Help (<40%)"
                                    count={t.needs_improvement}
                                    total={t.total_students}
                                    color="bg-rose-500"
                                    textColor="text-rose-700"
                                  />
                                </div>

                                {/* Mastery gauge */}
                                <div className="flex flex-col items-center justify-center">
                                  <div className={`w-20 h-20 rounded-full border-4 ${colors.border} flex items-center justify-center`}>
                                    <span className={`text-xl font-extrabold ${colors.text}`}>{t.avg_mastery}%</span>
                                  </div>
                                  <p className="text-xs font-semibold text-slate-500 mt-2">Class Average</p>
                                </div>

                                {/* Recommendations */}
                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    Teacher Insights & Actions
                                  </p>
                                  {t.avg_mastery < 40 && (
                                    <p className="text-xs text-rose-700 font-medium flex items-start gap-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                                      This topic needs urgent attention — consider re-teaching core concepts.
                                    </p>
                                  )}
                                  {t.avg_mastery >= 40 && t.avg_mastery < 70 && (
                                    <p className="text-xs text-amber-700 font-medium flex items-start gap-1.5">
                                      <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                                      Progress is moderate — targeted practice quizzes may help.
                                    </p>
                                  )}
                                  {t.avg_mastery >= 70 && (
                                    <p className="text-xs text-emerald-700 font-medium flex items-start gap-1.5">
                                      <Award className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                                      Class has mastered this topic — advance to harder material.
                                    </p>
                                  )}
                                  {t.question_count < 3 && (
                                    <p className="text-xs text-blue-700 font-medium flex items-start gap-1.5">
                                      <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
                                      Only {t.question_count} question{t.question_count !== 1 ? 's' : ''} available — add more for better assessment.
                                    </p>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/teacher/quiz-manager');
                                    }}
                                    className="mt-2 w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow flex items-center justify-center gap-1.5 transition-all"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Generate Quiz for this Topic
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatTile({ label, value, icon: Icon, color, subtitle }) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    red: 'text-rose-600 bg-rose-50 border-rose-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
  };
  const iconClass = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${iconClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function DistBar({ label, count, total, color, textColor }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className={`font-bold ${textColor}`}>{count} ({pct}%)</span>
      </div>
      <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden border border-slate-200/50">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}
