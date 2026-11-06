import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Plus, Trash2, Edit2, CheckCircle2, ChevronRight,
  ChevronLeft, Search, X, Save, Layers, HelpCircle, Check, RefreshCw,
  BookMarked, AlertCircle, Filter
} from 'lucide-react';
import { teacherService } from '../services/api';

// Subject → topic mapping used for the topic dropdown
const SUBJECT_TOPICS = {
  Mathematics: [
    'Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry',
    'Number Theory', 'Probability', 'Combinatorics', 'Linear Algebra', 'Differential Equations'
  ],
  Science: [
    'Biology', 'Chemistry', 'Physics', 'Ecology', 'Genetics',
    'Atomic Structure', 'Chemical Bonding', 'Mechanics', 'Thermodynamics', 'Optics'
  ],
  English: [
    'Grammar', 'Comprehension', 'Essay Writing', 'Poetry', 'Vocabulary',
    'Literature', 'Punctuation', 'Sentence Structure', 'Reading Skills', 'Creative Writing'
  ],
  'Computer Science': [
    'Algorithms', 'Data Structures', 'Programming Basics', 'Databases', 'Networking',
    'Operating Systems', 'Software Engineering', 'AI & ML', 'Cybersecurity', 'Web Development'
  ],
  Physics: [
    'Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Wave Motion',
    'Kinematics', 'Nuclear Physics', 'Electricity & Magnetism', 'Fluid Dynamics'
  ],
  'Social Studies': [
    'World History', 'Civics & Governance', 'Geography & Cartography', 'Macroeconomics',
    'Political Science', 'Sociology', 'Modern Indian History', 'Global Trade'
  ]
};

const CORRECT_OPTIONS = ['A', 'B', 'C', 'D'];

const EMPTY_QUESTION = () => ({
  id: Date.now() + Math.random(),
  question: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A',
  skill_id: null,
});

export default function TeacherQuizManager({ user, showToast }) {
  const teacherSubject = user?.teacher_subject || user?.class_name || 'Mathematics';
  const availableTopics = SUBJECT_TOPICS[teacherSubject] || SUBJECT_TOPICS['Mathematics'];

  // Step state: 1 = Select Topic & Quiz Title, 2 = Add Questions, 3 = Published Quiz View
  const [step, setStep] = useState(1);

  // Step 1 state
  const [quizTitle, setQuizTitle] = useState('');
  const [selectedSubject] = useState(teacherSubject);
  const [selectedTopic, setSelectedTopic] = useState(availableTopics[0] || '');
  const [timeLimit, setTimeLimit] = useState(20);
  const [description, setDescription] = useState('');

  // Skills from DB mapped by name/topic
  const [skills, setSkills] = useState([]);
  const [skillForTopic, setSkillForTopic] = useState(null);

  // Step 2 question list (draft)
  const [questions, setQuestions] = useState([EMPTY_QUESTION()]);

  // Published questions (from teacher's own questions via API)
  const [publishedQuestions, setPublishedQuestions] = useState([]);
  const [loadingPublished, setLoadingPublished] = useState(false);
  const [filterSkillId, setFilterSkillId] = useState('all');

  // Edit modal
  const [editingQ, setEditingQ] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [searchPublished, setSearchPublished] = useState('');

  // Fetch skills on mount
  useEffect(() => {
    fetchSkills();
    fetchPublishedQuestions();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await teacherService.getSkills();
      setSkills(res || []);
    } catch (_) {
      setSkills([]);
    }
  };

  const fetchPublishedQuestions = async () => {
    try {
      setLoadingPublished(true);
      const res = await teacherService.getQuizQuestions();
      setPublishedQuestions(res || []);
    } catch (_) {
      setPublishedQuestions([]);
    } finally {
      setLoadingPublished(false);
    }
  };

  // When topic changes, pick the best matching skill
  useEffect(() => {
    if (!skills.length) return;
    const match = skills.find(s =>
      s.skill_name.toLowerCase().includes(selectedTopic.toLowerCase()) ||
      selectedTopic.toLowerCase().includes(s.skill_name.toLowerCase())
    ) || skills[0];
    setSkillForTopic(match || null);
    // Reset all questions' skill_id
    setQuestions(prev => prev.map(q => ({ ...q, skill_id: match?.skill_id || null })));
  }, [selectedTopic, skills]);

  // ─── Step 1 handlers ───────────────────────────────────────────
  const handleProceedToQuestions = (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      showToast?.('Please enter a quiz title', 'error');
      return;
    }
    if (!selectedTopic) {
      showToast?.('Please select a topic', 'error');
      return;
    }
    setStep(2);
  };

  // ─── Step 2 (question builder) handlers ────────────────────────
  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { ...EMPTY_QUESTION(), skill_id: skillForTopic?.skill_id || null }
    ]);
  };

  const handleRemoveQuestion = (id) => {
    if (questions.length === 1) return; // keep at least one
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleQChange = (id, field, value) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const validateQuestions = () => {
    for (const q of questions) {
      if (!q.question.trim()) return 'All question texts are required.';
      if (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim())
        return 'All four options are required for each question.';
    }
    return null;
  };

  const handlePublishQuiz = async (e) => {
    e.preventDefault();
    const validationError = validateQuestions();
    if (validationError) {
      showToast?.(validationError, 'error');
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Create the Learning Activity first
      await teacherService.createActivity({
        title: quizTitle,
        subject: selectedSubject,
        topic: selectedTopic,
        time_limit: Number(timeLimit) || 20,
        status: 'Published',
        description: description.trim()
      });

      // Now save each question
      const skill = skillForTopic;
      for (const q of questions) {
        try {
          await teacherService.createQuizQuestion({
            skill_id: skill?.skill_id || null,
            topic: selectedTopic,
            question: q.question.trim(),
            option_a: q.option_a.trim(),
            option_b: q.option_b.trim(),
            option_c: q.option_c.trim(),
            option_d: q.option_d.trim(),
            correct_answer: q.correct_answer,
          });
          successCount++;
        } catch (_) {
          errorCount++;
        }
      }

      showToast?.(
        `Quiz published! ${successCount} question${successCount !== 1 ? 's' : ''} saved.${errorCount ? ` (${errorCount} failed)` : ''}`,
        'success'
      );
      // Go to Published view
      await fetchPublishedQuestions();
      setStep(3);
      // Reset draft state
      setQuizTitle('');
      setDescription('');
      setQuestions([EMPTY_QUESTION()]);
    } catch (err) {
      console.error(err);
      showToast?.('Failed to publish quiz. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Published questions (step 3 / sidebar) handlers ───────────
  const handleDeletePublished = async (questionId) => {
    if (!window.confirm('Delete this question? Students will no longer see it.')) return;
    try {
      await teacherService.deleteQuizQuestion(questionId);
      setPublishedQuestions(prev => prev.filter(q => q.id !== questionId));
      showToast?.('Question deleted', 'info');
    } catch (err) {
      showToast?.(err?.response?.data?.detail || 'Could not delete question', 'error');
    }
  };

  const handleOpenEdit = (q) => {
    setEditingQ(q);
    setEditForm({ ...q });
  };

  const handleSaveEdit = async () => {
    if (!editForm.question.trim() || !editForm.option_a.trim() || !editForm.option_b.trim()
      || !editForm.option_c.trim() || !editForm.option_d.trim()) {
      showToast?.('All fields are required', 'error');
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await teacherService.updateQuizQuestion(editingQ.id, {
        skill_id: editForm.skill_id,
        question: editForm.question.trim(),
        option_a: editForm.option_a.trim(),
        option_b: editForm.option_b.trim(),
        option_c: editForm.option_c.trim(),
        option_d: editForm.option_d.trim(),
        correct_answer: editForm.correct_answer,
      });
      setPublishedQuestions(prev =>
        prev.map(q => q.id === editingQ.id ? { ...q, ...editForm, skill_name: updated.skill_name } : q)
      );
      showToast?.('Question updated!', 'success');
      setEditingQ(null);
      setEditForm(null);
    } catch (err) {
      showToast?.(err?.response?.data?.detail || 'Failed to update question', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Filtered published questions
  const filteredPublished = publishedQuestions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchPublished.toLowerCase()) ||
      q.skill_name.toLowerCase().includes(searchPublished.toLowerCase());
    const matchesSkill = filterSkillId === 'all' || String(q.skill_id) === String(filterSkillId);
    return matchesSearch && matchesSkill;
  });

  // Unique skills for filter dropdown
  const uniqueSkillsInPublished = Array.from(
    new Map(publishedQuestions.map(q => [q.skill_id, q.skill_name])).entries()
  ).map(([id, name]) => ({ id, name }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookMarked className="w-7 h-7 text-blue-600" />
            Quiz Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Generate quizzes, manage questions for&nbsp;
            <span className="text-blue-600 font-bold">{selectedSubject}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setStep(step === 3 ? 1 : 3); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              step === 3
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            My Questions ({publishedQuestions.length})
          </button>
          {step !== 1 && step !== 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Quiz
            </button>
          )}
        </div>
      </div>

      {/* ── STEP 1: Quiz details ─────────────────────────────────── */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">1</span>
              Quiz Details
            </h2>

            <form onSubmit={handleProceedToQuestions} className="space-y-5">
              {/* Quiz Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quiz Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  placeholder="e.g. Algebra Midterm Quiz"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Subject (read-only) + Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Your Subject
                  </label>
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold">
                    {selectedSubject}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Your assigned teaching subject</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Topic <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={e => setSelectedTopic(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {availableTopics.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Time Limit (minutes) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  required
                  value={timeLimit}
                  onChange={e => setTimeLimit(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description about this quiz..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  <span>Next: Add Questions</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right: Topic info card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Available Topics</h3>
            <p className="text-xs text-slate-500">Topics for <span className="font-bold text-blue-600">{selectedSubject}</span></p>
            <div className="space-y-2">
              {availableTopics.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTopic(t)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedTopic === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Add Questions ──────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Quiz info bar */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-blue-900 text-sm">{quizTitle}</p>
              <p className="text-xs text-blue-700 mt-0.5">
                {selectedSubject} · <span className="font-bold">{selectedTopic}</span> · {timeLimit} min
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-blue-700 hover:underline shrink-0"
            >
              ← Edit Details
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">2</span>
              Add Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          <form onSubmit={handlePublishQuiz} className="space-y-5">
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                index={idx + 1}
                question={q}
                onRemove={() => handleRemoveQuestion(q.id)}
                onChange={(field, val) => handleQChange(q.id, field, val)}
                canRemove={questions.length > 1}
              />
            ))}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Publish Quiz
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── STEP 3: Published Questions Management ─────────────────── */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Published Questions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Edit or delete questions you've created</p>
            </div>
            <button
              onClick={() => { setStep(1); }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create New Quiz
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPublished}
                onChange={e => setSearchPublished(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterSkillId}
                onChange={e => setFilterSkillId(e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Topics</option>
                {uniqueSkillsInPublished.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={fetchPublishedQuestions}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loadingPublished ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loadingPublished ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPublished.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 font-semibold">No questions found</p>
              <p className="text-xs text-slate-400">
                {publishedQuestions.length === 0
                  ? 'Create a quiz to add your first question.'
                  : 'Try adjusting your search or filter.'}
              </p>
              <button
                onClick={() => setStep(1)}
                className="mx-auto mt-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Create Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPublished.map((q, idx) => (
                <PublishedQuestionRow
                  key={q.id}
                  index={idx + 1}
                  question={q}
                  onEdit={() => handleOpenEdit(q)}
                  onDelete={() => handleDeletePublished(q.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────── */}
      {editingQ && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => { setEditingQ(null); setEditForm(null); }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                Edit Question
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Topic: <span className="font-semibold text-slate-700">{editingQ.skill_name}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Question Text <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={editForm.question}
                onChange={e => setEditForm(f => ({ ...f, question: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map(letter => (
                <div key={letter}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Option {letter}
                  </label>
                  <input
                    type="text"
                    value={editForm[`option_${letter.toLowerCase()}`]}
                    onChange={e => setEditForm(f => ({ ...f, [`option_${letter.toLowerCase()}`]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Correct Answer <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                {CORRECT_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEditForm(f => ({ ...f, correct_answer: opt }))}
                    className={`w-11 h-11 rounded-xl font-bold text-sm border transition-all ${
                      editForm.correct_answer === opt
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingEdit ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
              <button
                onClick={() => { setEditingQ(null); setEditForm(null); }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function QuestionCard({ index, question, onRemove, onChange, canRemove }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white text-xs font-black rounded-full flex items-center justify-center">
            {index}
          </span>
          Question {index}
        </h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Remove this question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Question Text <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={2}
          required
          value={question.question}
          onChange={e => onChange('question', e.target.value)}
          placeholder="Enter the question prompt..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {['A', 'B', 'C', 'D'].map(letter => (
          <div key={letter}>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Option {letter}
            </label>
            <input
              type="text"
              required
              value={question[`option_${letter.toLowerCase()}`]}
              onChange={e => onChange(`option_${letter.toLowerCase()}`, e.target.value)}
              placeholder={`Option ${letter}`}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        ))}
      </div>

      {/* Correct Answer */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Correct Answer <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {CORRECT_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange('correct_answer', opt)}
              className={`w-11 h-11 rounded-xl font-bold text-sm border transition-all ${
                question.correct_answer === opt
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {opt}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-2">
            Correct: <span className="font-bold text-blue-600">{question.correct_answer}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function PublishedQuestionRow({ index, question, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 line-clamp-2">{question.question}</p>
          <p className="text-xs text-slate-500 mt-1">
            Topic: <span className="font-bold text-blue-700">{question.skill_name}</span>
            &nbsp;·&nbsp;Correct: <span className="font-bold text-emerald-600">{question.correct_answer}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/60">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['A', 'B', 'C', 'D'].map(letter => {
              const isCorrect = question.correct_answer === letter;
              return (
                <div
                  key={letter}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-start gap-1.5 ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span className={`font-black ${isCorrect ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {letter}.
                  </span>
                  <span>{question[`option_${letter.toLowerCase()}`]}</span>
                  {isCorrect && <Check className="w-3 h-3 text-emerald-600 shrink-0 ml-auto" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
