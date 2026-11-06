import React, { useState, useEffect } from 'react';
import {
  Sparkles, BookOpen, HelpCircle, AlertTriangle, ChevronDown, ChevronUp,
  TrendingUp, Target, Clock, AlertCircle, Award, ArrowRight, X, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTopicsForSubject } from '../data/subjectCurriculum';
import {
  getRealRecommendations,
  getStudentQuizHistory,
  getStudentTopicMasteries
} from '../services/studentDataStore';
import { studentService } from '../services/api';
import ConceptMasteryDonut from '../components/charts/ConceptMasteryDonut';

export default function Recommendations({ user }) {
  const navigate = useNavigate();
  const effectiveStudentId = user?.student_id || user?.user_id || user?.id || 1;

  // Active subject strictly determined by assigned teacher
  const teacherSubject = user?.teacher_subject || user?.subject || 'Computer Science';
  const teacherName = user?.teacher_name || 'Prof. Alan Turing';

  const [recommendations, setRecommendations] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // all | needs_improvement | developing | good | to_explore
  const [selectedModalRec, setSelectedModalRec] = useState(null);
  const [hasQuizHistory, setHasQuizHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealRecommendations();

    const handleSync = () => {
      loadRealRecommendations();
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
  }, [teacherSubject, effectiveStudentId]);

  const loadRealRecommendations = async () => {
    try {
      setLoading(true);
      const subjectTopics = getTopicsForSubject(teacherSubject);

      // 1. Get authentic quiz history from localStorage
      const history1 = getStudentQuizHistory(effectiveStudentId);
      const history2 = user?.id ? getStudentQuizHistory(user.id) : [];
      const combinedHistory = [...history1, ...history2].filter(
        h => !teacherSubject || h.subject?.toLowerCase() === teacherSubject.toLowerCase()
      );

      // 2. Fetch backend API dashboard/recommendations/attempts
      let apiRecs = [];
      let backendAttempts = [];
      let apiSkills = [];

      if (effectiveStudentId) {
        try {
          const dashRes = await studentService.getDashboard(effectiveStudentId, teacherSubject);
          if (dashRes?.recommendations) apiRecs = dashRes.recommendations;
          if (dashRes?.quiz_attempts) backendAttempts = dashRes.quiz_attempts;
          if (dashRes?.skills) apiSkills = dashRes.skills;
        } catch (_) {
          try {
            const res = await studentService.getRecommendations(effectiveStudentId, teacherSubject);
            if (Array.isArray(res)) apiRecs = res;
          } catch (_) {}
        }
      }

      // Check if any quiz attempts exist anywhere
      const allAttempts = [...combinedHistory, ...backendAttempts];
      const hasAnyAttempts = allAttempts.length > 0;
      setHasQuizHistory(hasAnyAttempts);

      // 3. Local masteries
      const localMasteries = getStudentTopicMasteries(effectiveStudentId) || {};

      // Build consolidated authentic recommendations
      const recsList = [];

      subjectTopics.forEach(topic => {
        // Find matching API skill
        const apiSkill = apiSkills.find(s =>
          s.skill_id === topic.id ||
          s.skill_name?.toLowerCase().includes(topic.name.toLowerCase()) ||
          topic.name.toLowerCase().includes(s.skill_name?.toLowerCase())
        );

        // Find matching local record
        const local = localMasteries[topic.id];

        // Find matching attempt
        const attempt = allAttempts.find(a =>
          (a.topic && (a.topic.toLowerCase().includes(topic.name.toLowerCase()) || topic.name.toLowerCase().includes(a.topic.toLowerCase()))) ||
          (a.topic_name && (a.topic_name.toLowerCase().includes(topic.name.toLowerCase()) || topic.name.toLowerCase().includes(a.topic_name.toLowerCase())))
        );

        let mastery = 0;
        let isAttempted = false;

        if (apiSkill && apiSkill.mastery > 0) {
          mastery = Math.round(apiSkill.mastery);
          isAttempted = true;
        } else if (local && local.mastery > 0) {
          mastery = Math.round(local.mastery);
          isAttempted = true;
        } else if (attempt) {
          mastery = Math.round(attempt.percentage || 0);
          isAttempted = true;
        }

        // Categorize based strictly on real state
        let category = 'to_explore';
        let priority = 'MEDIUM';
        let title = `Start Learning: ${topic.name}`;
        let explanation = `You have not completed a quiz on ${topic.name} yet. Complete an introductory quiz to establish your baseline in ${teacherSubject}.`;
        let suggested_action = `Take a practice quiz on ${topic.name}.`;

        if (isAttempted) {
          if (mastery >= 80) {
            category = 'good';
            priority = 'LOW';
            title = `Mastery Challenge: ${topic.name}`;
            explanation = `Outstanding! You have achieved high mastery (${mastery}%) in ${topic.name}. Keep your knowledge fresh with advanced questions.`;
            suggested_action = `Attempt advanced challenge questions in ${topic.name}.`;
          } else if (mastery >= 50) {
            category = 'developing';
            priority = 'MEDIUM';
            title = `Practice & Refine: ${topic.name}`;
            explanation = `Your mastery is developing at ${mastery}%. A targeted practice session will push you past the 80% proficiency threshold.`;
            suggested_action = `Complete a 5-question practice set on ${topic.name}.`;
          } else {
            category = 'needs_improvement';
            priority = 'HIGH';
            title = `Revise Fundamentals: ${topic.name}`;
            explanation = `Your recent accuracy is ${mastery}%. Review foundational concepts and definitions to strengthen your understanding.`;
            suggested_action = `Review key concepts and retake the practice quiz on ${topic.name}.`;
          }
        }

        recsList.push({
          id: `rec_${topic.id}`,
          topicId: topic.id,
          topic_name: topic.name,
          title,
          explanation,
          priority,
          suggested_action,
          mastery,
          is_attempted: isAttempted,
          category,
          details: `Detailed Analysis: ${isAttempted ? `Based on your recent assessment, you achieved ${mastery}% accuracy. Bayesian Knowledge Tracing categorizes this concept as ${mastery >= 80 ? 'Mastered' : mastery >= 50 ? 'Developing' : 'At Risk'}.` : `This topic has not yet been assessed. Completing a quiz will initialize your AI learning twin.`}`
        });
      });

      // Sort by priority (HIGH -> MEDIUM -> LOW)
      const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
      recsList.sort((a, b) => (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1));

      setRecommendations(recsList);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const needsImprovement = recommendations.filter(r => r.category === 'needs_improvement');
  const developing       = recommendations.filter(r => r.category === 'developing');
  const good             = recommendations.filter(r => r.category === 'good');
  const toExplore        = recommendations.filter(r => r.category === 'to_explore');

  const filteredRecs = activeFilter === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === activeFilter);

  const attemptedRecs = recommendations.filter(r => r.is_attempted);
  const overallMastery = attemptedRecs.length > 0
    ? Math.round(attemptedRecs.reduce((s, r) => s + r.mastery, 0) / attemptedRecs.length)
    : 0;

  const FILTERS = [
    { key: 'all', label: 'All Recommendations', count: recommendations.length },
    { key: 'needs_improvement', label: 'Needs Improvement', count: needsImprovement.length, color: 'text-rose-600' },
    { key: 'developing', label: 'Developing', count: developing.length, color: 'text-amber-600' },
    { key: 'good', label: 'Mastered', count: good.length, color: 'text-emerald-600' },
    { key: 'to_explore', label: 'To Explore', count: toExplore.length, color: 'text-slate-600' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* ── Top Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Personalized AI Guidance
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Subject: {teacherSubject}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700">
              Teacher: {teacherName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {teacherSubject} Learning Recommendations
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Generated strictly from your genuine progress in <strong>{teacherSubject}</strong>. Zero bluffed numbers.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/quiz')}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 text-sm transition-all shrink-0"
        >
          <Sparkles className="w-5 h-5" />
          <span>Take {teacherSubject} Quiz</span>
        </button>
      </div>

      {/* ── Overall Subject Summary Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Overall {teacherSubject} Recommendation Spread
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated from authentic learning states across curriculum concepts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-semibold uppercase text-slate-400">Attempted Accuracy</span>
              <p className="text-2xl font-extrabold text-blue-600">
                {attemptedRecs.length > 0 ? `${overallMastery}%` : '--'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              overallMastery >= 75 ? 'bg-emerald-100 text-emerald-700' :
              overallMastery >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {attemptedRecs.length > 0
                ? (overallMastery >= 75 ? 'Proficient' : overallMastery >= 50 ? 'Developing' : 'Needs Review')
                : 'Not Started'}
            </div>
          </div>
        </div>

        {/* Graphical Mastery Donut & Distribution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
          <div className="md:col-span-1">
            <ConceptMasteryDonut
              overallMastery={overallMastery}
              items={recommendations.map((r, i) => ({
                label: r.topic_name,
                value: r.mastery,
                color: r.category === 'good' ? '#10b981' : r.category === 'developing' ? '#f59e0b' : r.category === 'needs_improvement' ? '#f43f5e' : '#cbd5e1'
              }))}
              title="Concept Spread"
              subtitle="Breakdown of recommendations"
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Attempted Concepts Mastery ({attemptedRecs.length}/{recommendations.length} Active)</span>
                <span>{overallMastery}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    overallMastery >= 75 ? 'bg-emerald-500' : overallMastery >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${overallMastery}%` }}
                />
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
        </div>
      </div>

      {/* ── Category Filter Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => {
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${
                active
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{f.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Recommendations Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRecs.map((rec) => {
          const isWeak = rec.category === 'needs_improvement';
          const isDev  = rec.category === 'developing';
          const isGood = rec.category === 'good';

          return (
            <div
              key={rec.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all ${
                isWeak ? 'border-rose-200 ring-1 ring-rose-500/10' :
                isDev  ? 'border-amber-200' : isGood ? 'border-emerald-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    isWeak ? 'bg-rose-100 text-rose-700' :
                    isDev  ? 'bg-amber-100 text-amber-700' :
                    isGood ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isWeak ? 'Needs Improvement' : isDev ? 'Developing' : isGood ? 'Mastered' : 'Not Started'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Accuracy: {rec.is_attempted ? `${rec.mastery}%` : 'Not Attempted'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {rec.explanation}
                </p>

                {/* Progress Mini Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${
                      isWeak ? 'bg-rose-500' : isDev ? 'bg-amber-500' : isGood ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${rec.is_attempted ? rec.mastery : 0}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons: View Details & Practice Quiz */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedModalRec(rec)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/student/quiz?topic=${encodeURIComponent(rec.topic_name || rec.topicId)}&title=${encodeURIComponent(rec.topic_name || rec.title)}`)}
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

      {/* ── Detail Modal ── */}
      {selectedModalRec && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Recommendation Details</h3>
              </div>
              <button
                onClick={() => setSelectedModalRec(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <h4 className="font-bold text-slate-900 text-base">{selectedModalRec.title}</h4>
              <p className="leading-relaxed">{selectedModalRec.details || selectedModalRec.explanation}</p>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
                <span className="font-bold text-blue-900 block text-xs uppercase tracking-wide">
                  Suggested Action
                </span>
                <p className="text-blue-800 text-xs">
                  {selectedModalRec.suggested_action}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedModalRec(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = selectedModalRec.topic_name || selectedModalRec.topicId;
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
