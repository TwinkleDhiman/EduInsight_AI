import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  Layers,
  Calendar,
  Activity,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { studentService } from '../services/api';
import { getTopicsForSubject } from '../data/subjectCurriculum';
import { getStudentTopicMasteries, getStudentQuizHistory } from '../services/studentDataStore';

// High-impact SVG chart components
import ConceptMasteryDonut from '../components/charts/ConceptMasteryDonut';
import LearningTwinNetwork from '../components/charts/LearningTwinNetwork';
import PerformanceTrendLine from '../components/charts/PerformanceTrendLine';
import ConceptPerformanceTable from '../components/charts/ConceptPerformanceTable';

export default function StudentDashboard({ user, onRefresh }) {
  const [data, setData] = useState(null);
  const [shapData, setShapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Effective student ID supporting both student_id and user_id fallback
  const studentId = user?.student_id || user?.user_id || user?.id;
  const teacherSubject = user?.teacher_subject || user?.subject || 'Computer Science';
  const teacherName = user?.teacher_name || 'Prof. Alan Turing';
  const studentName = data?.student?.name || user?.name || 'Student';

  const fetchDashboardData = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const dashRes = await studentService.getDashboard(studentId, teacherSubject);
      setData(dashRes);

      if (dashRes.has_activity) {
        try {
          const shapRes = await studentService.getShap(studentId);
          setShapData(shapRes);
        } catch (shapErr) {
          console.warn('SHAP data unavailable:', shapErr);
          setShapData(null);
        }
      } else {
        setShapData(null);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [studentId, teacherSubject]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time synchronization on quiz completion
  useEffect(() => {
    const handleSync = () => {
      fetchDashboardData();
    };
    window.addEventListener('eduinsight_quiz_completed', handleSync);
    const handleStorage = (e) => {
      if (e.key === 'eduinsight_last_quiz_sync') {
        fetchDashboardData();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('eduinsight_quiz_completed', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchDashboardData]);

  if (onRefresh) {
    onRefresh(fetchDashboardData);
  }

  // Authentic subject topics & masteries
  const subjectTopics = getTopicsForSubject(teacherSubject);
  const localMasteries = getStudentTopicMasteries(studentId) || {};
  const localHistory = getStudentQuizHistory(studentId) || [];

  // Merge backend quiz_attempts with local history
  const backendAttempts = data?.quiz_attempts || [];
  const combinedHistory = [...backendAttempts];
  localHistory.forEach(lh => {
    if (!combinedHistory.some(bh => bh.id === lh.id || (bh.topic === lh.topic && Math.abs(new Date(bh.date || bh.created_at) - new Date(lh.date)) < 10000))) {
      combinedHistory.push(lh);
    }
  });

  const subjectHistory = combinedHistory.filter(h => {
    if (!h) return false;
    if (!teacherSubject) return true;
    // Backend attempts have subject field; local may not — include local entries that lack subject only if topic matches curriculum
    if (h.subject) return h.subject.toLowerCase() === teacherSubject.toLowerCase();
    // Local entry with no subject: check if topic belongs to this subject's curriculum
    const topicName = (h.topic || h.topicName || h.topic_name || '').toLowerCase();
    return subjectTopics.some(t => topicName && (topicName.includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(topicName)));
  });

  // Merge backend skills with local real masteries
  const mergedConcepts = subjectTopics.map(topic => {
    const apiSkill = (data?.skills || []).find(s =>
      s.skill_id === topic.id ||
      s.skill_name?.toLowerCase().includes(topic.name.toLowerCase()) ||
      topic.name.toLowerCase().includes(s.skill_name?.toLowerCase())
    );
    const local = localMasteries[topic.id];

    let mastery = 0;
    let isAttempted = false;

    if (apiSkill && apiSkill.mastery > 0) {
      mastery = Math.round(apiSkill.mastery);
      isAttempted = true;
    } else if (local && local.mastery > 0) {
      mastery = Math.round(local.mastery);
      isAttempted = true;
    }

    // Check if any attempt exists in subjectHistory for this topic
    if (!isAttempted) {
      const matchedAtt = subjectHistory.find(h =>
        (h.topic && (h.topic.toLowerCase().includes(topic.name.toLowerCase()) || topic.name.toLowerCase().includes(h.topic.toLowerCase()))) ||
        (h.topicName && (h.topicName.toLowerCase().includes(topic.name.toLowerCase()) || topic.name.toLowerCase().includes(h.topicName.toLowerCase())))
      );
      if (matchedAtt) {
        mastery = Math.round(matchedAtt.percentage || 0);
        isAttempted = true;
      }
    }

    const status = !isAttempted
      ? 'Not Started'
      : mastery >= 80 ? 'Mastered' : mastery >= 50 ? 'In Progress' : 'At Risk';

    return {
      id: topic.id,
      name: topic.name,
      subject: teacherSubject,
      mastery,
      status,
      isAttempted
    };
  });

  const attemptedConcepts = mergedConcepts.filter(c => c.isAttempted);
  const masteredConcepts = mergedConcepts.filter(c => c.mastery >= 80);
  const inProgressConcepts = mergedConcepts.filter(c => c.mastery > 0 && c.mastery < 80);
  const unattemptedConcepts = mergedConcepts.filter(c => !c.isAttempted);
  const atRiskConcepts = mergedConcepts.filter(c => c.status === 'At Risk');

  // Overall Subject Mastery (BKT curriculum percentage)
  const curriculumMastery = data?.overall_mastery !== undefined
    ? Math.round(data.overall_mastery)
    : Math.round(mergedConcepts.reduce((acc, c) => acc + c.mastery, 0) / Math.max(1, mergedConcepts.length));

  // Authentic Average Accuracy on Attempted Quizzes
  const attemptedAccuracy = attemptedConcepts.length > 0
    ? Math.round(attemptedConcepts.reduce((acc, c) => acc + c.mastery, 0) / attemptedConcepts.length)
    : (subjectHistory.length > 0
        ? Math.round(subjectHistory.reduce((acc, h) => acc + (h.percentage || 0), 0) / subjectHistory.length)
        : null);

  // Donut chart colors
  const DONUT_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
  const donutItems = mergedConcepts.map((c, i) => ({
    label: c.name,
    value: c.mastery,
    color: DONUT_COLORS[i % DONUT_COLORS.length]
  }));

  // Trend graph data from authentic quiz history (ZERO fake Session 1, 2, 3!)
  const trendData = subjectHistory.map((h, i) => {
    const rawDate = h.date || h.created_at;
    const formattedDate = rawDate
      ? new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : `Attempt ${i + 1}`;
    return {
      date: formattedDate,
      topic: h.topic || h.topicName || h.topic_name,
      accuracy: Math.round(h.percentage || 0),
      attempts: h.score !== undefined ? Math.round((h.score / (h.total || h.total_questions || 1)) * 100) : Math.round(h.percentage || 0),
      score: h.score,
      total: h.total || h.total_questions
    };
  }).reverse();

  // Dynamic stats calculation (ZERO bluffed numbers!)
  const totalQuestions = data?.questions_attempted || subjectHistory.reduce((s, h) => s + (h.total || h.total_questions || 0), 0) || 0;
  const avgTimeSec = data?.avg_response_time_sec || (data?.avg_response_time_ms ? Math.round(data.avg_response_time_ms / 1000) : 0);

  // Build real recommendations from mergedConcepts (zero bluffed data)
  const computedRecs = mergedConcepts
    .filter(c => c.mastery < 80 || !c.isAttempted)
    .slice(0, 3)
    .map(c => {
      if (!c.isAttempted) return {
        title: `Start: ${c.name}`,
        suggested_action: `Take your first quiz on ${c.name} to initialize your BKT learning model.`,
        topic_name: c.name,
        priority: 'MEDIUM'
      };
      if (c.mastery < 50) return {
        title: `Revise Fundamentals: ${c.name}`,
        suggested_action: `Review key concepts and retake the quiz on ${c.name}.`,
        topic_name: c.name,
        priority: 'HIGH'
      };
      return {
        title: `Practice & Refine: ${c.name}`,
        suggested_action: `Complete a focused practice session on ${c.name} to push past 80% mastery.`,
        topic_name: c.name,
        priority: 'MEDIUM'
      };
    });

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Header Greeting ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good Morning, {studentName}!
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Here's your authentic <strong>{teacherSubject}</strong> learning overview and personalized insights for today.
          </p>
        </div>

        {/* Inspirational quote pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl shadow-2xs">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <p className="text-xs font-semibold text-purple-900">
            "Small steps every day lead to big results."
          </p>
        </div>
      </div>

      {/* ── 4 Top Stat Cards (ZERO Bluffed Numbers!) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Concepts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Concepts
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {mergedConcepts.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {masteredConcepts.length} mastered • {inProgressConcepts.length} in progress
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Quiz Accuracy
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {attemptedAccuracy !== null ? `${attemptedAccuracy}%` : '--'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {subjectHistory.length > 0
                ? `Across ${subjectHistory.length} quiz ${subjectHistory.length === 1 ? 'attempt' : 'attempts'}`
                : 'No quizzes taken yet'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* Avg. Response Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Avg. Response Pace
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {avgTimeSec > 0 ? `${avgTimeSec}s` : '--'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {avgTimeSec > 0 ? 'Pace per question answered' : 'Take a quiz to track speed'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Questions Answered */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Questions Solved
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalQuestions}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {subjectHistory.length > 0
                ? `${subjectHistory.length} total quiz sessions`
                : '0 practice sessions completed'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── PROMINENT HERO FEATURE: Dynamic Knowledge State Network ── */}
      <LearningTwinNetwork
        studentName={studentName}
        concepts={mergedConcepts}
        title="Dynamic Knowledge State Network"
        subtitle={`Interactive BKT concept connections and cognitive mastery states for ${teacherSubject}.`}
        detailsLink="/student/learning-twin"
      />

      {/* ── Main Dashboard Layout: 2 Columns (Left: Visual Charts & Table, Right: Side Panels) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT / CENTER (2 Columns): Visual Charts & Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Row 1: Concept Mastery Donut + Performance Trend Line */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Concept Mastery Overview (Donut Chart) */}
            <ConceptMasteryDonut
              overallMastery={curriculumMastery}
              items={donutItems}
              title="Curriculum Mastery"
              subtitle={`Authentic progress across ${teacherSubject} topics.`}
            />

            {/* Performance Trend Line Chart */}
            <PerformanceTrendLine
              data={trendData}
              title="Accuracy Trajectory"
              subtitle={`Chronological performance in ${teacherSubject}.`}
            />
          </div>

          {/* Row 2: Concept-wise Performance Table */}
          <ConceptPerformanceTable
            concepts={mergedConcepts}
            subject={teacherSubject}
            onAction={(item) => navigate(`/student/quiz?topic=${encodeURIComponent(item.name || item.id)}&title=${encodeURIComponent(item.name)}`)}
          />

          {/* Row 3: Assigned Quizzes by Teacher */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Quizzes Assigned by Your Teacher ({teacherName})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Active published assignments for {teacherSubject}.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                {(data?.assigned_quizzes || []).filter(q => !q.is_completed).length} Pending
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(data?.assigned_quizzes || []).map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700">
                        {quiz.subject}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {quiz.time_limit} Mins
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{quiz.title}</h4>
                    <p className="text-xs font-medium text-blue-600 mt-0.5">Topic: {quiz.topic}</p>
                    {quiz.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{quiz.description}</p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {quiz.is_completed ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {quiz.percentage}%
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Assigned
                      </span>
                    )}

                    <button
                      onClick={() => navigate(`/student/quiz?activity_id=${quiz.id}&topic=${encodeURIComponent(quiz.topic)}&title=${encodeURIComponent(quiz.title)}`)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                    >
                      <span>{quiz.is_completed ? 'Retake' : 'Start'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 Column): Side Panels (Risks, Recs, Recent Activity) */}
        <div className="space-y-6">
          {/* Learning Risks Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-sm">Learning Risks</h3>
              </div>
              <button
                onClick={() => navigate('/student/learning-twin')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {atRiskConcepts.length > 0 ? (
                atRiskConcepts.map(c => (
                  <div key={c.id} className="p-3 bg-rose-50/60 border border-rose-200/60 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{c.name}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        High Risk
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Mastery is currently {c.mastery}%. Review recommended actions to strengthen fundamentals.
                    </p>
                  </div>
                ))
              ) : inProgressConcepts.length > 0 ? (
                inProgressConcepts.slice(0, 2).map(c => (
                  <div key={c.id} className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{c.name}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        In Progress
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Currently developing at {c.mastery}%. A targeted revision will reach full mastery.
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-700">No Critical Risks</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All tracked concepts are performing on target.</p>
                </div>
              )}
            </div>
          </div>

          {/* Personalized Recommendations Panel (ZERO Fake Values!) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-sm">Personalized Recommendations</h3>
              </div>
              <button
                onClick={() => navigate('/student/learning-twin?tab=recommendations')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {(computedRecs.length > 0 ? computedRecs : (data?.recommendations || [])).slice(0, 3).map((rec, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">{rec.title}</p>
                    {rec.priority && (
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                        rec.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {rec.suggested_action || rec.explanation}
                  </p>
                  <button
                    onClick={() => {
                      const topicTarget = rec.topic_name || rec.title?.replace(/^(Revise|Practice|Start Learning:|Mastery Challenge:)\s*/i, '');
                      navigate(`/student/quiz?topic=${encodeURIComponent(topicTarget)}&title=${encodeURIComponent(topicTarget)}`);
                    }}
                    className="px-3 py-1 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 font-bold text-[11px] rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <span>Practice Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Panel (Authentic Activity!) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Activity className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-sm">Recent Activity</h3>
              </div>
            </div>

            <div className="space-y-3">
              {subjectHistory.length > 0 ? (
                subjectHistory.slice(0, 3).map((h, i) => (
                  <div key={i} className="flex items-start justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">{h.topic || h.topicName || h.topic_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {h.date || h.created_at
                          ? new Date(h.date || h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'Recorded attempt'}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Score: {h.percentage}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-slate-400 text-xs">
                  <p>Complete a quiz to record real-time activity.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
