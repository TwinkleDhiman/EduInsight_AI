import React, { useState, useEffect, useCallback } from 'react';
import {
  BrainCircuit, CheckCircle2, TrendingUp, Clock, Sparkles,
  ArrowRight, Play, Award, FileText, HelpCircle, X,
  BookOpen, AlertTriangle, Zap
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTopicsForSubject } from '../data/subjectCurriculum';
import {
  getStudentTopicMasteries,
  getStudentQuizHistory
} from '../services/studentDataStore';
import { studentService } from '../services/api';

// Chart components
import ConceptMasteryDonut from '../components/charts/ConceptMasteryDonut';
import LearningTwinNetwork from '../components/charts/LearningTwinNetwork';
import PerformanceTrendLine from '../components/charts/PerformanceTrendLine';

export default function LearningTwin({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = user?.student_id || user?.user_id || user?.id;

  const teacherSubject = user?.teacher_subject || user?.subject || 'Computer Science';
  const teacherName   = user?.teacher_name   || 'Prof. Alan Turing';

  // ── Shared State ──────────────────────────────────────────────
  const [skillsList, setSkillsList]   = useState([]);
  const [history,    setHistory]      = useState([]);
  const [loading,    setLoading]      = useState(true);

  // Tab: 'progress' | 'history' | 'quizzes' | 'skills' | 'recommendations'
  const tabFromQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromQuery || 'progress');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && ['progress', 'history', 'quizzes', 'skills', 'recommendations'].includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  // Skills sub-state
  const [skillsFilter,      setSkillsFilter]      = useState('All');
  const [selectedSkillModal, setSelectedSkillModal] = useState(null);

  // Recommendations sub-state
  const [recommendations,    setRecommendations]    = useState([]);
  const [recsFilter,         setRecsFilter]         = useState('all');
  const [selectedModalRec,   setSelectedModalRec]   = useState(null);

  // ── Data Loader ───────────────────────────────────────────────
  const loadTwinData = useCallback(async () => {
    try {
      setLoading(true);
      const subjectTopics = getTopicsForSubject(teacherSubject) || [];

      const localHistory = [
        ...(studentId   ? getStudentQuizHistory(studentId)   : []),
        ...(user?.id    ? getStudentQuizHistory(user.id)     : [])
      ];

      const realMasteries = {
        ...(studentId ? getStudentTopicMasteries(studentId) : {}),
        ...(user?.id  ? getStudentTopicMasteries(user.id)  : {})
      };

      let apiSkillsList  = [];
      let backendAttempts = [];

      if (studentId) {
        try {
          const dashRes = await studentService.getDashboard(studentId, teacherSubject);
          if (dashRes?.skills      && Array.isArray(dashRes.skills))       apiSkillsList   = dashRes.skills;
          if (dashRes?.quiz_attempts && Array.isArray(dashRes.quiz_attempts)) backendAttempts = dashRes.quiz_attempts;
        } catch (_) {
          try {
            const res = await studentService.getSkills(studentId, teacherSubject);
            if (res?.skills && Array.isArray(res.skills)) apiSkillsList = res.skills;
          } catch (_) {}
        }
      }

      // Merge history (deduplicate)
      const allHistory = [...backendAttempts];
      (localHistory || []).forEach(lh => {
        if (!lh) return;
        const lhTopic = (lh.topic || lh.topicName || lh.topic_name || '').toLowerCase();
        const lhDate  = lh.date || lh.created_at;
        const exists  = allHistory.some(bh => {
          if (bh?.id && lh?.id && bh.id === lh.id) return true;
          const bhTopic = (bh?.topic || bh?.topicName || bh?.topic_name || '').toLowerCase();
          const bhDate  = bh?.date || bh?.created_at;
          if (bhTopic && lhTopic && bhTopic === lhTopic) {
            if (bhDate && lhDate) {
              const diff = Math.abs(new Date(bhDate).getTime() - new Date(lhDate).getTime());
              return !isNaN(diff) && diff < 10000;
            }
            return true;
          }
          return false;
        });
        if (!exists) allHistory.push(lh);
      });

      const subjectHistory = allHistory.filter(h => {
        if (!h) return false;
        if (!teacherSubject) return true;
        if (h.subject) return String(h.subject).toLowerCase() === String(teacherSubject).toLowerCase();
        return false;
      });
      setHistory(subjectHistory);

      // Build unified skills list (used by all 3 tabs)
      const formatted = subjectTopics.map(topic => {
        if (!topic) return null;
        const localRecord = realMasteries[topic.id];
        const apiMatch = apiSkillsList.find(s => {
          if (!s) return false;
          if (s.skill_id === topic.id) return true;
          const sName = String(s.skill_name || '').toLowerCase();
          const tName = String(topic.name   || '').toLowerCase();
          return sName && tName && (sName.includes(tName) || tName.includes(sName));
        });
        const attempt = subjectHistory.find(h => {
          if (!h) return false;
          const hName = String(h.topic || h.topicName || h.topic_name || '').toLowerCase();
          const tName = String(topic.name || '').toLowerCase();
          return hName && tName && (hName.includes(tName) || tName.includes(hName));
        });

        let mastery = 0, isAttempted = false, practiceCount = 0;
        if (apiMatch && Number(apiMatch.mastery) > 0) {
          mastery = Math.round(Number(apiMatch.mastery));
          isAttempted  = true;
          practiceCount = apiMatch.practice_count || 1;
        } else if (localRecord && Number(localRecord.mastery) > 0) {
          mastery = Math.round(Number(localRecord.mastery));
          isAttempted  = true;
          practiceCount = localRecord.attemptCount || 1;
        } else if (attempt && attempt.percentage !== undefined) {
          mastery = Math.round(Number(attempt.percentage) || 0);
          isAttempted  = true;
          practiceCount = 1;
        }

        const status = !isAttempted ? 'Not Attempted'
          : mastery >= 80 ? 'Mastered' : mastery >= 50 ? 'Developing' : 'Needs Improvement';

        return {
          skill_id:      topic.id,
          skill_name:    topic.name || 'Core Topic',
          mastery,
          status,
          isAttempted,
          questionCount: Array.isArray(topic.questions) ? topic.questions.length : 20,
          description:   topic.description || '',
          practiceCount
        };
      }).filter(Boolean);

      setSkillsList(formatted);

      // Build recommendations from the same data
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      const recsList = formatted.map(sk => {
        let category = 'to_explore', priority = 'MEDIUM';
        let title    = `Start Learning: ${sk.skill_name}`;
        let explanation    = `You have not completed a quiz on ${sk.skill_name} yet. Complete an introductory quiz to establish your baseline.`;
        let suggested_action = `Take a practice quiz on ${sk.skill_name}.`;

        if (sk.isAttempted) {
          if (sk.mastery >= 80) {
            category = 'good'; priority = 'LOW';
            title = `Mastery Challenge: ${sk.skill_name}`;
            explanation = `Outstanding! You have achieved ${sk.mastery}% in ${sk.skill_name}. Keep your knowledge fresh with advanced questions.`;
            suggested_action = `Attempt advanced challenge questions in ${sk.skill_name}.`;
          } else if (sk.mastery >= 50) {
            category = 'developing'; priority = 'MEDIUM';
            title = `Practice & Refine: ${sk.skill_name}`;
            explanation = `Your mastery is developing at ${sk.mastery}%. A targeted practice session will push you past the 80% proficiency threshold.`;
            suggested_action = `Complete a 5-question practice set on ${sk.skill_name}.`;
          } else {
            category = 'needs_improvement'; priority = 'HIGH';
            title = `Revise Fundamentals: ${sk.skill_name}`;
            explanation = `Your recent accuracy is ${sk.mastery}%. Review foundational concepts to strengthen your understanding.`;
            suggested_action = `Review key concepts and retake the practice quiz on ${sk.skill_name}.`;
          }
        }

        const gapToMastery    = Math.max(0, 80 - sk.mastery);
        const gapToDeveloping = Math.max(0, 50 - sk.mastery);
        const nextMilestone   = sk.mastery >= 80 ? null : sk.mastery >= 50 ? 'Mastered (80%)' : 'Developing (50%)';
        const nextMilestoneTarget = sk.mastery >= 80 ? null : sk.mastery >= 50 ? 80 : 50;
        const progressToNext  = sk.mastery >= 80 ? 100
          : sk.mastery >= 50 ? Math.round((sk.mastery / 80) * 100)
          : Math.round((sk.mastery / 50) * 100);

        return {
          id: `rec_${sk.skill_id}`,
          topicId: sk.skill_id,
          topic_name: sk.skill_name,
          title, explanation, priority, suggested_action,
          mastery: sk.mastery,
          is_attempted: sk.isAttempted,
          category,
          questionCount: sk.questionCount,
          practiceCount: sk.practiceCount,
          gapToMastery,
          gapToDeveloping,
          nextMilestone,
          nextMilestoneTarget,
          progressToNext,
          details: sk.isAttempted
            ? `BKT Analysis for ${sk.skill_name}: You have completed ${sk.practiceCount} quiz session(s) and achieved ${sk.mastery}% mastery. ${sk.mastery < 80 ? `You need ${gapToMastery}% more to reach Mastered status.` : 'You have achieved full mastery — focus on retention.'} The question bank has ${sk.questionCount} questions available for further practice.`
            : `BKT Analysis for ${sk.skill_name}: No quiz has been submitted for this topic yet. The question bank contains ${sk.questionCount} questions. Start with an introductory session to initialize your BKT learning model.`
        };
      });
      recsList.sort((a, b) => (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1));
      setRecommendations(recsList);

    } catch (err) {
      console.error('Error loading Learning Twin data:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherSubject, studentId, user?.id]);

  useEffect(() => { loadTwinData(); }, [loadTwinData]);

  useEffect(() => {
    const handleSync = () => loadTwinData();
    window.addEventListener('eduinsight_quiz_completed', handleSync);
    const handleStorage = e => { if (e.key === 'eduinsight_last_quiz_sync') loadTwinData(); };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('eduinsight_quiz_completed', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadTwinData]);

  // ── Derived values ────────────────────────────────────────────
  const safeSkillsList  = Array.isArray(skillsList) ? skillsList : [];
  const attemptedSkills = safeSkillsList.filter(s => s?.isAttempted);
  const overallMastery  = attemptedSkills.length > 0
    ? Math.round(attemptedSkills.reduce((a, s) => a + (Number(s.mastery) || 0), 0) / attemptedSkills.length)
    : 0;

  const fmtDate = iso => {
    if (!iso) return 'Recent';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
           + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch { return String(iso); }
  };

  const trendData = (Array.isArray(history) ? history : []).map((h, i) => {
    const rawDate = h?.date || h?.created_at;
    let formattedDate = `Attempt ${i + 1}`;
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    const pct      = Math.round(Number(h?.percentage) || 0);
    const scoreVal = h?.score !== undefined ? Number(h.score) : pct;
    const totalVal = Number(h?.total || h?.total_questions) || 1;
    return {
      date: formattedDate,
      topic: h?.topic || h?.topicName || h?.topic_name || `Session ${i + 1}`,
      accuracy: pct,
      attempts: Math.round((scoreVal / totalVal) * 100) || pct,
      score: scoreVal,
      total: totalVal
    };
  }).reverse();

  // Skills helpers
  const getStatusBadge = status => {
    if (status === 'Mastered')         return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'Developing')       return 'bg-amber-100  text-amber-700  border-amber-200';
    if (status === 'Needs Improvement') return 'bg-rose-100   text-rose-700   border-rose-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const filteredSkills = safeSkillsList.filter(sk =>
    skillsFilter === 'All' ? true : sk.status === skillsFilter
  );

  // Recommendations helpers
  const needsImprovement = recommendations.filter(r => r.category === 'needs_improvement');
  const developing       = recommendations.filter(r => r.category === 'developing');
  const good             = recommendations.filter(r => r.category === 'good');
  const toExplore        = recommendations.filter(r => r.category === 'to_explore');
  const attemptedRecs    = recommendations.filter(r => r.is_attempted);
  const recsOverallMastery = attemptedRecs.length > 0
    ? Math.round(attemptedRecs.reduce((s, r) => s + r.mastery, 0) / attemptedRecs.length)
    : 0;
  const filteredRecs = recsFilter === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === recsFilter);
  const REC_FILTERS = [
    { key: 'all',              label: 'All',              count: recommendations.length },
    { key: 'needs_improvement', label: 'Needs Improvement', count: needsImprovement.length },
    { key: 'developing',       label: 'Developing',       count: developing.length },
    { key: 'good',             label: 'Mastered',         count: good.length },
    { key: 'to_explore',       label: 'To Explore',       count: toExplore.length }
  ];

  // ── Tab config ────────────────────────────────────────────────
  const tabs = [
    { key: 'progress',        label: 'Topic Progress',    icon: TrendingUp },
    { key: 'history',         label: 'Quiz History',      icon: Clock },
    { key: 'quizzes',         label: 'Practice',          icon: Play },
    { key: 'skills',          label: 'My Skills',         icon: Award },
    { key: 'recommendations', label: 'Recommendations',   icon: Sparkles },
  ];

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-12">

      {/* ── Header Banner ── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              AI Learning Twin
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Subject: {teacherSubject}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700">
              Teacher: {teacherName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-blue-400" />
            My {teacherSubject} Learning Twin
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Real-time concept tracker, skill mastery, and AI recommendations — all in one place.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/quiz')}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 text-sm transition-all shrink-0"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Take {teacherSubject} Quiz</span>
        </button>
      </div>

      {/* ── 3 Overview Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">Attempted Accuracy</span>
          <h3 className="text-3xl font-black text-blue-600 mt-2">
            {attemptedSkills.length > 0 ? `${overallMastery}%` : '—'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {attemptedSkills.length > 0 ? `Across ${attemptedSkills.length} attempted topic(s)` : 'No quizzes attempted yet'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">Curriculum Progress</span>
          <h3 className="text-3xl font-black text-emerald-600 mt-2">
            {attemptedSkills.length} / {safeSkillsList.length}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {Math.max(0, safeSkillsList.length - attemptedSkills.length)} remaining to attempt
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">Quiz Attempts Logged</span>
          <h3 className="text-3xl font-black text-purple-600 mt-2">{history.length}</h3>
          <p className="text-xs text-slate-500 mt-1">Real authenticated sessions</p>
        </div>
      </div>

      {/* ── Dynamic Knowledge State Network ── */}
      <LearningTwinNetwork
        studentName={user?.name || 'You'}
        concepts={safeSkillsList.map(s => ({ name: s.skill_name, status: s.status, mastery: s.mastery }))}
        title="Dynamic Knowledge State Network"
        subtitle={`Interactive BKT concept connections and cognitive mastery states for ${teacherSubject}.`}
        detailsLink={null}
      />

      {/* ── Analytics: Donut + Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConceptMasteryDonut
          overallMastery={overallMastery}
          items={safeSkillsList.map((s, idx) => ({
            label: s.skill_name,
            value: s.mastery,
            color: ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ec4899','#06b6d4'][idx % 6]
          }))}
          title={`Concept Mastery Distribution (${teacherSubject})`}
          subtitle="Real-time mastery across registered curriculum topics."
        />
        <PerformanceTrendLine
          data={trendData}
          title={`Learning Velocity & Accuracy Trajectory (${teacherSubject})`}
          subtitle="Chronological accuracy and cumulative interaction points."
        />
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(t => {
          const Icon   = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                active ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════
          TAB 1 — Topic Progress
      ══════════════════════════════════════════════ */}
      {activeTab === 'progress' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Curriculum Concept Mastery Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each topic is tracked independently. Topics show <strong>Not Attempted (0%)</strong> until a quiz is taken.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {safeSkillsList.length} Concepts Tracked
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {safeSkillsList.map(skill => {
              const isNotAttempted = !skill.isAttempted;
              const isMastered     = skill.status === 'Mastered';
              const isDev          = skill.status === 'Developing';
              return (
                <div key={skill.skill_id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800 text-sm">{skill.skill_name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isNotAttempted ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : isMastered  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : isDev       ? 'bg-amber-100 text-amber-700 border-amber-200'
                        :               'bg-rose-100 text-rose-700 border-rose-200'
                      }`}>
                        {skill.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{skill.description}</p>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="w-36 text-right">
                      <span className="text-xs font-extrabold text-slate-800">
                        {isNotAttempted ? 'Not Attempted' : `${skill.mastery}%`}
                      </span>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isNotAttempted ? 'bg-slate-200' : isMastered ? 'bg-emerald-500' : isDev ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${skill.isAttempted ? Math.max(5, skill.mastery) : 0}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/student/quiz?topic=${encodeURIComponent(skill.skill_name)}&title=${encodeURIComponent(skill.skill_name)}`)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 transition-all shrink-0"
                    >
                      <span>{isNotAttempted ? 'Start Quiz' : 'Retake Quiz'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2 — Quiz History
      ══════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">Authenticated Quiz Attempts</h3>
            <p className="text-xs text-slate-500 mt-0.5">Chronological log of submitted quizzes for {teacherSubject}.</p>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No quiz attempts recorded yet.</p>
              <p className="text-xs">Take your first quiz to record authentic trajectory analytics.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((h, idx) => (
                <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">{h.topic || h.topicName || h.topic_name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        h.percentage >= 80 ? 'bg-emerald-100 text-emerald-700'
                        : h.percentage >= 50 ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                      }`}>
                        {h.percentage >= 80 ? 'Mastered' : h.percentage >= 50 ? 'Developing' : 'Needs Review'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Completed: {fmtDate(h.date || h.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">{h.percentage}%</span>
                    <p className="text-xs text-slate-400">Score: {h.score} / {h.total || h.total_questions || 20}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 3 — Practice
      ══════════════════════════════════════════════ */}
      {activeTab === 'quizzes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {safeSkillsList.map(skill => (
            <div key={skill.skill_id} className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all">
              <div>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {teacherSubject}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-2">{skill.skill_name}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{skill.description}</p>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {skill.isAttempted ? `${skill.mastery}% Accuracy` : 'Not Attempted'}
                </span>
                <button
                  onClick={() => navigate(`/student/quiz?topic=${encodeURIComponent(skill.skill_name)}&title=${encodeURIComponent(skill.skill_name)}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{skill.isAttempted ? 'Retake' : 'Start'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 4 — My Skills (merged from Skills.jsx)
      ══════════════════════════════════════════════ */}
      {activeTab === 'skills' && (
        <div className="space-y-5">
          {/* Filter bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Not Attempted', 'Needs Improvement', 'Developing', 'Mastered'].map(f => {
              const isActive = skillsFilter === f;
              const count    = f === 'All' ? safeSkillsList.length : safeSkillsList.filter(s => s.status === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setSkillsFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{f}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[11px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Skills list */}
          <div className="space-y-3">
            {filteredSkills.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">No skills found for filter "{skillsFilter}"</p>
                <p className="text-xs">Take quizzes to build progress in your {teacherSubject} curriculum.</p>
              </div>
            ) : filteredSkills.map(sk => {
              const isNotAttempted = !sk.isAttempted;
              const isMastered     = sk.status === 'Mastered';
              const isDev          = sk.status === 'Developing';
              return (
                <div
                  key={sk.skill_id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-5 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{sk.skill_name}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(sk.status)}`}>
                          {sk.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">{sk.description}</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-56 space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>BKT Mastery</span>
                      <span className="font-bold text-slate-900">{isNotAttempted ? '0%' : `${sk.mastery}%`}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isNotAttempted ? 'bg-slate-300' : isMastered ? 'bg-emerald-500' : isDev ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${sk.isAttempted ? Math.max(5, sk.mastery) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => setSelectedSkillModal(sk)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all text-center"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate(`/student/quiz?topic=${encodeURIComponent(sk.skill_name)}&title=${encodeURIComponent(sk.skill_name)}`)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-xs transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <span>{isNotAttempted ? 'Start Quiz' : 'Retake'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 5 — Recommendations (merged from Recommendations.jsx)
      ══════════════════════════════════════════════ */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Summary card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Overall {teacherSubject} Recommendation Spread
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Aggregated from authentic learning states across curriculum concepts</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-semibold uppercase text-slate-400">Attempted Accuracy</span>
                  <p className="text-2xl font-extrabold text-blue-600">
                    {attemptedRecs.length > 0 ? `${recsOverallMastery}%` : '--'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  recsOverallMastery >= 75 ? 'bg-emerald-100 text-emerald-700'
                  : recsOverallMastery >= 50 ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-700'
                }`}>
                  {attemptedRecs.length > 0
                    ? (recsOverallMastery >= 75 ? 'Proficient' : recsOverallMastery >= 50 ? 'Developing' : 'Needs Review')
                    : 'Not Started'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-600 uppercase block">Needs Rev.</span>
                <span className="text-lg font-black text-rose-700">{needsImprovement.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-600 uppercase block">Developing</span>
                <span className="text-lg font-black text-amber-700">{developing.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Mastered</span>
                <span className="text-lg font-black text-emerald-700">{good.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">To Explore</span>
                <span className="text-lg font-black text-slate-700">{toExplore.length}</span>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {REC_FILTERS.map(f => {
              const active = recsFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setRecsFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[11px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Recommendation cards — enhanced, zero bluffed data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRecs.map(rec => {
              const isWeak = rec.category === 'needs_improvement';
              const isDev  = rec.category === 'developing';
              const isGood = rec.category === 'good';
              const priorityColors = {
                HIGH:   'bg-rose-100 text-rose-700',
                MEDIUM: 'bg-amber-100 text-amber-700',
                LOW:    'bg-blue-100 text-blue-700'
              };
              return (
                <div
                  key={rec.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col gap-4 hover:shadow-md transition-all ${
                    isWeak ? 'border-rose-200 ring-1 ring-rose-500/10'
                    : isDev  ? 'border-amber-200'
                    : isGood ? 'border-emerald-200'
                    : 'border-slate-200'
                  }`}
                >
                  {/* Row 1: Status badge + priority badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      isWeak ? 'bg-rose-100 text-rose-700'
                      : isDev  ? 'bg-amber-100 text-amber-700'
                      : isGood ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isWeak ? 'Needs Improvement' : isDev ? 'Developing' : isGood ? 'Mastered' : 'Not Started'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${priorityColors[rec.priority] || priorityColors.MEDIUM}`}>
                      {rec.priority}
                    </span>
                  </div>

                  {/* Row 2: Title + explanation */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.explanation}</p>
                  </div>

                  {/* Row 3: Progress to next milestone (only when applicable) */}
                  {rec.nextMilestone ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>Progress to {rec.nextMilestone}</span>
                        <span className="font-bold text-slate-800">{rec.progressToNext}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWeak ? 'bg-rose-500' : isDev ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, rec.progressToNext)}%` }}
                        />
                      </div>
                    </div>
                  ) : isGood ? (
                    <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-emerald-500 rounded-full" />
                    </div>
                  ) : null}

                  {/* Row 4: Mini stat chips */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Sessions</p>
                      <p className="text-base font-extrabold text-slate-800 mt-0.5">{rec.practiceCount}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Questions</p>
                      <p className="text-base font-extrabold text-slate-800 mt-0.5">{rec.questionCount}</p>
                    </div>
                    <div className={`rounded-xl p-2 border ${
                      isGood ? 'bg-emerald-50 border-emerald-100'
                      : isDev  ? 'bg-amber-50 border-amber-100'
                      : isWeak ? 'bg-rose-50 border-rose-100'
                      : 'bg-slate-50 border-slate-100'
                    }`}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Gap</p>
                      <p className={`text-base font-extrabold mt-0.5 ${
                        isGood ? 'text-emerald-600'
                        : isDev  ? 'text-amber-600'
                        : isWeak ? 'text-rose-600'
                        : 'text-slate-400'
                      }`}>
                        {rec.is_attempted ? (isGood ? '✓' : `+${rec.gapToMastery}%`) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Row 5: Suggested action box */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-800 font-medium leading-relaxed">{rec.suggested_action}</p>
                  </div>

                  {/* Row 6: Action buttons */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedModalRec(rec)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>BKT Analysis</span>
                    </button>
                    <button
                      onClick={() => navigate(`/student/quiz?topic=${encodeURIComponent(rec.topic_name)}&title=${encodeURIComponent(rec.topic_name)}`)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>{rec.is_attempted ? 'Retake Quiz' : 'Start Quiz'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Skill Detail Modal ── */}
      {selectedSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative">
            <button
              onClick={() => setSelectedSkillModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getStatusBadge(selectedSkillModal.status)}`}>
                {selectedSkillModal.status} · {selectedSkillModal.isAttempted ? `${selectedSkillModal.mastery}% Mastery` : '0% (Not Attempted)'}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">{selectedSkillModal.skill_name}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Subject: <strong>{teacherSubject}</strong> · Questions in Bank: <strong>{selectedSkillModal.questionCount}</strong>
              </p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {selectedSkillModal.description}
            </p>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Quiz Sessions</span>
                <p className="text-lg font-extrabold text-blue-600 mt-0.5">{selectedSkillModal.practiceCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Questions Available</span>
                <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{selectedSkillModal.questionCount}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setSelectedSkillModal(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs">
                Close
              </button>
              <button
                onClick={() => {
                  const n = selectedSkillModal.skill_name;
                  setSelectedSkillModal(null);
                  navigate(`/student/quiz?topic=${encodeURIComponent(n)}&title=${encodeURIComponent(n)}`);
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                <span>Take Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Recommendation Detail Modal ── */}
      {selectedModalRec && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">BKT Analysis</h3>
              </div>
              <button onClick={() => setSelectedModalRec(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedModalRec.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedModalRec.explanation}</p>
              </div>

              {/* Stat grid — all real data */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Current Mastery</p>
                  <p className="text-xl font-extrabold text-blue-600 mt-0.5">
                    {selectedModalRec.is_attempted ? `${selectedModalRec.mastery}%` : '—'}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Sessions Done</p>
                  <p className="text-xl font-extrabold text-purple-600 mt-0.5">{selectedModalRec.practiceCount}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Questions in Bank</p>
                  <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{selectedModalRec.questionCount}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Gap to Mastered</p>
                  <p className="text-xl font-extrabold text-rose-600 mt-0.5">
                    {selectedModalRec.is_attempted
                      ? (selectedModalRec.gapToMastery === 0 ? '✓ Done' : `+${selectedModalRec.gapToMastery}%`)
                      : '—'}
                  </p>
                </div>
              </div>

              {/* BKT narrative */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedModalRec.details}
              </p>

              {/* Suggested action */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-900 block text-[10px] uppercase tracking-wide mb-0.5">Suggested Action</span>
                  <p className="text-blue-800 text-xs leading-relaxed">{selectedModalRec.suggested_action}</p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setSelectedModalRec(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">
                Close
              </button>
              <button
                onClick={() => {
                  const target = selectedModalRec.topic_name;
                  setSelectedModalRec(null);
                  navigate(`/student/quiz?topic=${encodeURIComponent(target)}&title=${encodeURIComponent(target)}`);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5"
              >
                <span>Practice Topic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
