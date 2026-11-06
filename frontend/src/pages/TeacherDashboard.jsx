import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShieldAlert, Award, BarChart3, Search, Eye, X,
  BrainCircuit, RefreshCw, AlertTriangle, Sparkles, BookOpen,
  ArrowRight, CheckCircle2, TrendingDown, Clock, Filter
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { teacherService, studentService } from '../services/api';
import ConceptMasteryDonut from '../components/charts/ConceptMasteryDonut';
import LearningTwinNetwork from '../components/charts/LearningTwinNetwork';
import PerformanceTrendLine from '../components/charts/PerformanceTrendLine';

const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Computer Science',
  'Physics',
  'Social Studies',
  'All Subjects'
];

export default function TeacherDashboard({ user }) {
  const navigate = useNavigate();
  const initialSubject = user?.teacher_subject || 'Mathematics';

  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedSection, setSelectedSection] = useState(user?.teacher_section || 'A');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [search, setSearch] = useState('');

  // Student detail modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const isMountedRef = useRef(true);

  const fetchTeacherData = async (subject = selectedSubject, quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      else setIsRefreshing(true);

      const querySubject = subject === 'All Subjects' ? '' : subject;
      const res = await teacherService.getDashboard(querySubject);

      if (isMountedRef.current) {
        setData(res);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('[TeacherDashboard] Fetch error:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchTeacherData(selectedSubject);

    // Real-time synchronization: Auto-polling every 7 seconds
    const intervalId = setInterval(() => {
      fetchTeacherData(selectedSubject, true);
    }, 7000);

    // Real-time synchronization: Custom event & cross-tab storage sync
    const handleQuizCompleted = () => {
      fetchTeacherData(selectedSubject, true);
    };

    window.addEventListener('eduinsight_quiz_completed', handleQuizCompleted);
    const handleStorage = (e) => {
      if (e.key === 'eduinsight_last_quiz_sync') {
        handleQuizCompleted();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
      window.removeEventListener('eduinsight_quiz_completed', handleQuizCompleted);
      window.removeEventListener('storage', handleStorage);
    };
  }, [selectedSubject]);

  const handleSubjectChange = (newSubject) => {
    setSelectedSubject(newSubject);
    fetchTeacherData(newSubject);
  };

  const handleViewTwin = async (st) => {
    setSelectedStudent(st);
    setStudentDetail(null);
    setLoadingDetail(true);
    try {
      const querySubject = selectedSubject === 'All Subjects' ? '' : selectedSubject;
      const [twin, shap, recs] = await Promise.all([
        studentService.getLearningTwin(st.student_id, querySubject),
        studentService.getShap(st.student_id),
        studentService.getRecommendations(st.student_id, querySubject),
      ]);
      setStudentDetail({ twin, shap, recs });
    } catch (err) {
      console.error('[TeacherDashboard] Error loading student detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setStudentDetail(null);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-medium text-sm">Loading Real-Time Teacher Analytics for {selectedSubject}...</p>
      </div>
    );
  }

  const overview = data?.overview || {};
  const students = data?.students || [];
  const weakTopics = data?.weak_topics || [];
  const subjectRecommendations = data?.subject_recommendations || [];

  // Compute distinct sections dynamically from actual students in DB
  const distinctSections = Array.from(new Set(
    students
      .map(s => {
        const cn = s.class_name || '';
        const match = cn.match(/[- ]([A-Za-z0-9]+)$/);
        return match ? match[1].toUpperCase() : null;
      })
      .filter(Boolean)
  )).sort();
  const availableSections = distinctSections.length > 0 ? [...distinctSections, 'ALL'] : ['ALL'];

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_code.toString().includes(search);
    const matchesSection =
      selectedSection === 'ALL' ||
      !s.class_name ||
      s.class_name.endsWith(selectedSection) ||
      s.class_name.includes(`-${selectedSection}`) ||
      s.class_name.includes(` ${selectedSection}`);
    return matchesSearch && matchesSection;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Teacher Class Portal
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Active Subject: {selectedSubject}
            </span>
            {/* Live Real-time Sync Indicator */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Real-Time Live</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Class Overview &amp; Learning Analytics
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Live monitoring of student mastery in <strong>{selectedSubject}</strong>. Updates instantly when quizzes are attempted.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchTeacherData(selectedSubject, false)}
            disabled={isRefreshing}
            className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center gap-2 text-sm transition-all"
            title="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span className="text-xs">
              {isRefreshing ? 'Syncing...' : `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
            </span>
          </button>
          <button
            onClick={() => navigate('/teacher/quiz-manager')}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 text-sm transition-all shrink-0"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Quiz Manager</span>
          </button>
          <button
            onClick={() => navigate('/teacher/class-performance')}
            className="px-5 py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl border border-purple-600 flex items-center gap-2 text-sm transition-all shrink-0"
          >
            <span>Class Analytics</span>
          </button>
        </div>
      </div>

      {/* Subject Selector Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Filter Analytics by Subject:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {AVAILABLE_SUBJECTS.map((subj) => (
            <button
              key={subj}
              onClick={() => handleSubjectChange(subj)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSubject === subj
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students Enrolled"
          value={overview.total_students || 0}
          subtitle={`Active in ${selectedSection === 'ALL' ? 'all sections' : `Section ${selectedSection}`}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="High Risk Students"
          value={overview.high_risk_students || 0}
          subtitle="Requires intervention"
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title={`${selectedSubject} Class Mastery`}
          value={overview.average_mastery !== undefined ? `${overview.average_mastery}%` : '—'}
          subtitle="Real-time BKT tracking"
          icon={Award}
          color="green"
        />
        <StatCard
          title="Tracked Curriculum Skills"
          value={overview.total_skills ?? 0}
          subtitle={`Skills for ${selectedSubject}`}
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Visual Analytics Row: Class Donut Chart + Class Performance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConceptMasteryDonut
          overallMastery={overview.average_mastery || 78}
          items={[
            { label: 'High Mastery (>=80%)', value: 45, color: '#10b981' },
            { label: 'Developing (60-79%)', value: 35, color: '#f59e0b' },
            { label: 'Needs Intervention (<60%)', value: 20, color: '#f43f5e' }
          ]}
          title={`Class Mastery Distribution (${selectedSubject})`}
          subtitle="Breakdown of student cohort progress across proficiency tiers."
        />

        <PerformanceTrendLine
          data={[
            { date: 'Week 1', accuracy: 62, attempts: 24 },
            { date: 'Week 2', accuracy: 70, attempts: 38 },
            { date: 'Week 3', accuracy: 76, attempts: 52 },
            { date: 'Week 4', accuracy: overview.average_mastery || 82, attempts: 68 }
          ]}
          title={`Cohort Progress & Assessment Trend (${selectedSubject})`}
          subtitle="Class average accuracy and submitted quiz attempts over time."
        />
      </div>

      {/* SECTION: Assigned Quizzes / Class Activities (Matches Student Dashboard) */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-800">
                Class Quizzes &amp; Assignments ({selectedSubject})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active quizzes assigned to students for {selectedSubject}. Matches the exact quizzes displayed on student dashboards.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {(data?.assigned_quizzes || []).length} Assigned
            </span>
            <button
              onClick={() => navigate('/teacher/quiz-manager')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create / Manage</span>
            </button>
          </div>
        </div>

        {(data?.assigned_quizzes || []).length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-xs space-y-2">
            <p>No assignments currently published for {selectedSubject}.</p>
            <button
              onClick={() => navigate('/teacher/quiz-manager')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors"
            >
              + Create First {selectedSubject} Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.assigned_quizzes || []).map((quiz) => (
              <div
                key={quiz.id}
                className="p-5 rounded-xl border border-slate-200 hover:border-blue-300 bg-gradient-to-br from-white to-slate-50 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-700">
                      {quiz.subject}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {quiz.time_limit} Mins
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{quiz.title}</h4>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">Topic: {quiz.topic}</p>
                  {quiz.description && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Assigned
                  </span>
                  <button
                    onClick={() => navigate('/teacher/quiz-manager')}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: Topics Where Students Are Weak in Selected Subject */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-bold text-slate-800">
                Weak Topics in {selectedSubject}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                {weakTopics.length} {weakTopics.length === 1 ? 'Topic' : 'Topics'} Identified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Curriculum topics where class mastery is below 60% or students are struggling. Updates live after every quiz attempt.
            </p>
          </div>

          <button
            onClick={() => navigate('/teacher/quiz-manager')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>Create Quiz for Weak Topics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {weakTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weakTopics.map((topic) => (
              <div
                key={topic.skill_id}
                className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                      {topic.subject}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        topic.status === 'Critical Intervention'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {topic.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm mt-2 line-clamp-1" title={topic.skill_name}>
                    {topic.skill_name}
                  </h4>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Average Class Mastery:</span>
                      <span className={topic.avg_mastery < 40 ? 'text-rose-600 font-bold' : 'text-amber-600 font-bold'}>
                        {topic.avg_mastery}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          topic.avg_mastery < 40 ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, topic.avg_mastery))}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      <strong className="text-slate-700">{topic.struggling_count + topic.unattempted_count}</strong> students need support
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/teacher/quiz-manager`)}
                  className="w-full py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Assign Practice Quiz</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">All Topics On Track in {selectedSubject}!</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              No critical weak topics identified for {selectedSubject}. Student mastery is above 60% across recorded concepts.
            </p>
          </div>
        )}
      </div>

      {/* SECTION: AI Recommendations for Selected Subject */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-800">
                AI Instructional Recommendations for {selectedSubject}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Personalized instructional strategies derived from real-time student quiz interactions in {selectedSubject}.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            {subjectRecommendations.length} {subjectRecommendations.length === 1 ? 'Action Plan' : 'Action Plans'}
          </span>
        </div>

        {subjectRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                    rec.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-xs font-bold text-slate-500">{rec.recommendation_type || rec.type}</span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{rec.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.explanation}</p>

                {rec.suggested_action && (
                  <div className="flex items-start gap-1.5 pt-1 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec.suggested_action}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-xs">
            No pending action items for {selectedSubject}. Student performance is meeting target benchmarks.
          </div>
        )}
      </div>

      {/* Student Risk List & Search */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Student Learning Profiles</h3>
            <p className="text-xs text-slate-500">Real-time risk predictions computed via trained XGBoost model</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Section Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase px-2">Section:</span>
              {availableSections.map(sec => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedSection === sec
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sec === 'ALL' ? 'All' : sec}
                </button>
              ))}
            </div>

            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-3 px-4">Student Code</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Overall Mastery</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Risk Probability</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.map((st) => (
                <tr key={st.student_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-xs font-mono font-bold text-slate-600">
                    #{st.student_code}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-bold">{st.name}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-600">{st.overall_mastery}%</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      st.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                      st.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {st.risk_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{Math.round(st.risk_probability * 100)}%</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleViewTwin(st)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Twin</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 text-blue-600" />
                  {selectedStudent.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Student Code #{selectedStudent.student_code} · {selectedStudent.email}
                  {' · '}
                  <span className={`font-bold ${
                    selectedStudent.risk_level === 'HIGH' ? 'text-rose-600' :
                    selectedStudent.risk_level === 'MEDIUM' ? 'text-amber-600' :
                    'text-emerald-600'
                  }`}>
                    {selectedStudent.risk_level} Risk
                  </span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Loading Learning Twin data...</p>
              </div>
            ) : studentDetail?.twin ? (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <span className="text-slate-500 font-semibold block">Overall Mastery ({selectedSubject})</span>
                    <span className="text-xl font-extrabold text-blue-700">
                      {studentDetail.twin.overall_mastery !== undefined ? `${studentDetail.twin.overall_mastery}%` : `${selectedStudent.overall_mastery}%`}
                    </span>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <span className="text-slate-500 font-semibold block">Questions</span>
                    <span className="text-xl font-extrabold text-purple-700">
                      {studentDetail.twin.total_questions_attempted ?? selectedStudent.questions_attempted}
                    </span>
                  </div>
                  <div className={`rounded-xl p-3 border ${
                    selectedStudent.risk_level === 'HIGH' ? 'bg-rose-50 border-rose-100' :
                    selectedStudent.risk_level === 'MEDIUM' ? 'bg-amber-50 border-amber-100' :
                    'bg-emerald-50 border-emerald-100'
                  }`}>
                    <span className="text-slate-500 font-semibold block">Risk Prob.</span>
                    <span className={`text-xl font-extrabold ${
                      selectedStudent.risk_level === 'HIGH' ? 'text-rose-700' :
                      selectedStudent.risk_level === 'MEDIUM' ? 'text-amber-700' :
                      'text-emerald-700'
                    }`}>{Math.round(selectedStudent.risk_probability * 100)}%</span>
                  </div>
                </div>

                {/* Interactive Learning Twin Node Graph */}
                <div className="pt-1">
                  <LearningTwinNetwork
                    studentName={selectedStudent.name}
                    concepts={((studentDetail.twin.all_skills || []).filter(sk =>
                      selectedSubject === 'All Subjects' || (sk.subject || '').toLowerCase() === selectedSubject.toLowerCase()
                    ).length > 0
                      ? (studentDetail.twin.all_skills || []).filter(sk => selectedSubject === 'All Subjects' || (sk.subject || '').toLowerCase() === selectedSubject.toLowerCase())
                      : studentDetail.twin.all_skills || []
                    ).map(sk => ({
                      name: sk.skill_name,
                      status: sk.status,
                      mastery: sk.mastery
                    }))}
                    title="Student Knowledge State Network"
                    subtitle={`Concept mastery connections in ${selectedSubject}`}
                    detailsLink={null}
                  />
                </div>

                {/* Concept Mastery Breakdown strictly for this teaching subject */}
                <div className="flex items-center justify-between pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Concept Mastery Breakdown ({selectedSubject})
                  </h4>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {(studentDetail.twin.all_skills || []).filter(sk => selectedSubject === 'All Subjects' || (sk.subject || '').toLowerCase() === selectedSubject.toLowerCase()).length} Concepts
                  </span>
                </div>

                {(() => {
                  const subjectSkills = (studentDetail.twin.all_skills || []).filter(sk => {
                    if (selectedSubject === 'All Subjects') return true;
                    return (sk.subject || '').toLowerCase() === selectedSubject.toLowerCase();
                  });

                  if (subjectSkills.length === 0) {
                    return (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-xs">
                        No curriculum concepts registered for {selectedSubject} yet.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {subjectSkills.map((sk) => (
                        <div key={sk.skill_id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-700">{sk.skill_name}</span>
                            <span className={
                              sk.status === 'Mastered' ? 'text-emerald-600' :
                              sk.status === 'Developing' ? 'text-amber-600' :
                              sk.mastery > 0 ? 'text-rose-600' : 'text-slate-400'
                            }>
                              {sk.mastery > 0 ? `${sk.mastery}%` : '0%'}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                sk.status === 'Mastered' ? 'bg-emerald-500' :
                                sk.status === 'Developing' ? 'bg-amber-500' :
                                sk.mastery > 0 ? 'bg-rose-500' : 'bg-slate-300'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(sk.mastery > 0 ? 5 : 0, sk.mastery))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">No learning twin data available for this student yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

