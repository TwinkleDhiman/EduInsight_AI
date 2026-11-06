import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Search, CheckCircle, AlertTriangle, BookOpen,
  TrendingUp, ArrowRight, X, Sparkles, BrainCircuit,
  Calculator, Shapes, Compass, PieChart, Activity, Zap
} from 'lucide-react';
import { studentService } from '../services/api';
import { getTopicsForSubject } from '../data/subjectCurriculum';
import { getStudentTopicMasteries, getStudentQuizHistory } from '../services/studentDataStore';

export default function Skills({ user }) {
  const navigate = useNavigate();
  const studentId = user?.student_id || user?.user_id || user?.id;

  // Active subject strictly determined by assigned teacher
  const teacherSubject = user?.teacher_subject || user?.subject || 'Computer Science';
  const teacherName = user?.teacher_name || 'Prof. Alan Turing';

  const [skills, setSkills] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All'); // All | Not Attempted | Needs Improvement | Developing | Mastered
  const [selectedSkillModal, setSelectedSkillModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSubjectSkills = useCallback(async () => {
    try {
      setLoading(true);
      const subjectTopics = getTopicsForSubject(teacherSubject);

      // Authentic masteries from actual quiz submissions in local storage
      const realMasteries = {
        ...(user?.id ? getStudentTopicMasteries(user.id) : {}),
        ...(studentId ? getStudentTopicMasteries(studentId) : {})
      };

      const localHist = [
        ...(studentId ? getStudentQuizHistory(studentId) : []),
        ...(user?.id ? getStudentQuizHistory(user.id) : [])
      ];

      // Also check API for recorded mastery and backend quiz attempts
      let apiSkillsList = [];
      let backendAttempts = [];

      if (studentId) {
        try {
          const dashRes = await studentService.getDashboard(studentId, teacherSubject);
          if (dashRes?.skills) apiSkillsList = dashRes.skills;
          if (dashRes?.quiz_attempts) backendAttempts = dashRes.quiz_attempts;
        } catch (_) {
          try {
            const res = await studentService.getSkills(studentId, teacherSubject);
            if (res?.skills) apiSkillsList = res.skills;
          } catch (_) {}
        }
      }

      const allAttempts = [...localHist, ...backendAttempts];

      const formatted = subjectTopics.map(topic => {
        // Robust matching against backend skills by ID or fuzzy name
        const apiMatch = apiSkillsList.find(s =>
          s.skill_id === topic.id ||
          s.skill_name?.toLowerCase().includes(topic.name.toLowerCase()) ||
          topic.name.toLowerCase().includes(s.skill_name?.toLowerCase())
        );

        const localRecord = realMasteries[topic.id];

        // Also check if any attempt exists in allAttempts for this topic
        const attempt = allAttempts.find(a =>
          (a.topic && (a.topic.toLowerCase().includes(topic.name.toLowerCase()) || topic.name.toLowerCase().includes(a.topic.toLowerCase()))) ||
          (a.topicName && (a.topicName.toLowerCase().includes(topic.name.toLowerCase()) || topic.name.toLowerCase().includes(a.topicName.toLowerCase()))) ||
          (a.topic_name && (a.topic_name.toLowerCase().includes(topic.name.toLowerCase()) || topic.name.toLowerCase().includes(a.topic_name.toLowerCase())))
        );

        let mastery = 0;
        let isAttempted = false;
        let practiceCount = 0;

        if (apiMatch && apiMatch.mastery > 0) {
          mastery = Math.round(apiMatch.mastery);
          isAttempted = true;
          practiceCount = apiMatch.practice_count || 1;
        } else if (localRecord && localRecord.mastery > 0) {
          mastery = Math.round(localRecord.mastery);
          isAttempted = true;
          practiceCount = localRecord.attemptCount || 1;
        } else if (attempt) {
          mastery = Math.round(attempt.percentage || 0);
          isAttempted = true;
          practiceCount = 1;
        }

        const status = !isAttempted
          ? 'Not Attempted'
          : mastery >= 80 ? 'Mastered' : mastery >= 50 ? 'Developing' : 'Needs Improvement';

        return {
          id: topic.id,
          name: topic.name,
          subject: teacherSubject,
          description: topic.description,
          mastery,
          status,
          isAttempted,
          questionCount: topic.questions?.length || 20,
          p_init: 0.20,
          p_transit: 0.15,
          practiceCount
        };
      });

      setSkills(formatted);
    } catch (err) {
      console.error('Error loading subject skills:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherSubject, studentId, user?.id]);

  useEffect(() => {
    loadSubjectSkills();
  }, [loadSubjectSkills]);

  // Real-time synchronization when a quiz is submitted
  useEffect(() => {
    const handleSync = () => {
      loadSubjectSkills();
    };
    window.addEventListener('eduinsight_quiz_completed', handleSync);
    const handleStorage = (e) => {
      if (e.key === 'eduinsight_last_quiz_sync') {
        loadSubjectSkills();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('eduinsight_quiz_completed', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadSubjectSkills]);

  const filteredSkills = skills.filter(sk => {
    if (activeFilter === 'All') return true;
    return sk.status === activeFilter;
  });

  const getStatusBadge = (status) => {
    if (status === 'Mastered') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'Developing') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'Needs Improvement') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const attemptedCount = skills.filter(s => s.isAttempted).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title & Description Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Curriculum Mastery
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Subject: {teacherSubject}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700">
              Teacher: {teacherName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            My {teacherSubject} Skills
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Authentic concept mastery in <strong>{teacherSubject}</strong>. Concepts show <strong>Not Attempted (0%)</strong> until you complete a quiz.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/quiz')}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 text-xs transition-all shrink-0"
        >
          <Zap className="w-4 h-4" />
          <span>Take {teacherSubject} Quiz</span>
        </button>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Not Attempted', 'Needs Improvement', 'Developing', 'Mastered'].map((filterName) => {
          const isActive = activeFilter === filterName;
          const count = filterName === 'All' ? skills.length : skills.filter(s => s.status === filterName).length;
          return (
            <button
              key={filterName}
              onClick={() => setActiveFilter(filterName)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{filterName}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Skills List Cards */}
      <div className="space-y-3">
        {filteredSkills.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No skills found for filter "{activeFilter}"</p>
            <p className="text-xs">Take quizzes to build progress in your {teacherSubject} curriculum.</p>
          </div>
        ) : (
          filteredSkills.map((sk) => {
            const isNotAttempted = !sk.isAttempted;
            const isMastered = sk.status === 'Mastered';
            const isDev = sk.status === 'Developing';

            return (
              <div
                key={sk.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-5 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{sk.name}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(sk.status)}`}>
                        {sk.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {sk.description}
                    </p>
                  </div>
                </div>

                {/* Center Mastery Progress Bar */}
                <div className="w-full sm:w-64 space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>BKT Mastery</span>
                    <span className="font-bold text-slate-900">
                      {isNotAttempted ? '0%' : `${sk.mastery}%`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isNotAttempted ? 'bg-slate-300' :
                        isMastered ? 'bg-emerald-500' : isDev ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${sk.isAttempted ? Math.max(5, sk.mastery) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => setSelectedSkillModal(sk)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all text-center"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/student/quiz?topic=${encodeURIComponent(sk.name)}&title=${encodeURIComponent(sk.name)}`)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-xs transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <span>{isNotAttempted ? 'Start Quiz' : 'Retake Quiz'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Concept Breakdown Detail Modal */}
      {selectedSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in duration-200">
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
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                {selectedSkillModal.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Subject: <strong>{selectedSkillModal.subject}</strong> · Questions in Bank: <strong>{selectedSkillModal.questionCount}</strong>
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
              <button
                type="button"
                onClick={() => setSelectedSkillModal(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetName = selectedSkillModal.name;
                  setSelectedSkillModal(null);
                  navigate(`/student/quiz?topic=${encodeURIComponent(targetName)}&title=${encodeURIComponent(targetName)}`);
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
    </div>
  );
}
