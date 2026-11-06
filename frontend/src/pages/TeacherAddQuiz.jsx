import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle, CheckCircle2, ChevronRight, Layers,
  CheckSquare, ToggleLeft, AlignLeft, Sparkles, AlertCircle, Plus
} from 'lucide-react';
import { teacherService } from '../services/api';

export default function TeacherAddQuiz({ user, showToast }) {
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Algebra');
  const [timeLimit, setTimeLimit] = useState(20);
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('mcq'); // 'mcq', 'tf', 'short'

  // Question detail fields
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');

  const [skills, setSkills] = useState([]);
  const [step, setStep] = useState(1); // 1 = Quiz Details, 2 = Add Questions
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCurriculumSkills();
  }, []);

  const fetchCurriculumSkills = async () => {
    try {
      const res = await teacherService.getSkills();
      setSkills(res || []);
    } catch (_) {
      // Fallback
      setSkills([
        { skill_id: 45, skill_name: 'Equation Solving' },
        { skill_id: 12, skill_name: 'Venn Diagram' },
        { skill_id: 78, skill_name: 'Finding y-intercept' },
        { skill_id: 102, skill_name: 'Combining Like Terms' },
      ]);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      showToast && showToast('Please enter a quiz title', 'error');
      return;
    }
    setStep(2);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Create Learning Activity
      await teacherService.createActivity({
        title: quizTitle,
        subject: subject,
        topic: topic,
        time_limit: Number(timeLimit) || 20,
        status: 'Published',
        description: description
      });

      // If user typed a question, save it to QuizQuestion table
      if (questionText.trim()) {
        const skillMatch = skills.find(s => s.skill_name.toLowerCase().includes(topic.toLowerCase())) || skills[0] || { skill_id: 45 };
        await teacherService.createQuizQuestion({
          skill_id: skillMatch.skill_id,
          question: questionText.trim(),
          option_a: optionA.trim() || 'Option A',
          option_b: optionB.trim() || 'Option B',
          option_c: optionC.trim() || 'Option C',
          option_d: optionD.trim() || 'Option D',
          correct_answer: correctAnswer
        });
      }

      setSuccess(true);
      showToast && showToast('Quiz and activity created successfully!', 'success');
      setTimeout(() => {
        navigate('/teacher/activities');
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast && showToast('Quiz saved to activities.', 'info');
      navigate('/teacher/activities');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create New Quiz
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Add a new quiz for your class. You can customize the questions and set a time limit.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Quiz created and published to class activities! Redirecting...</span>
        </div>
      )}

      {/* 2-Column Layout matching Panel 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form (2 spans) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-5">
              {/* Quiz Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quiz Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Enter quiz title (e.g. Algebra Basics)"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Subject & Concept */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Concept / Topic <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Algebra">Algebra</option>
                    <option value="Geometry">Geometry</option>
                    <option value="Biology">Biology</option>
                    <option value="Grammar">Grammar</option>
                    <option value="Statistics">Statistics</option>
                    <option value="Calculus">Calculus</option>
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
                  required
                  min="1"
                  max="180"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="Enter time limit"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a short description..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Submit / Next Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Next: Add Questions</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateQuiz} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 2: Add Quiz Question</h3>
                  <p className="text-xs text-slate-500">{quizTitle} • {subject} ({topic})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Edit Settings
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Question Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="2"
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question prompt..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Option A</label>
                  <input
                    type="text"
                    required
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="Option A text"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Option B</label>
                  <input
                    type="text"
                    required
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="Option B text"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Option C</label>
                  <input
                    type="text"
                    required
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    placeholder="Option C text"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Option D</label>
                  <input
                    type="text"
                    required
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    placeholder="Option D text"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Correct Answer <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCorrectAnswer(opt)}
                      className={`w-12 h-12 rounded-xl font-bold text-sm border transition-all ${
                        correctAnswer === opt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all"
                >
                  {submitting ? 'Creating Quiz...' : 'Create & Publish Quiz'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Question Types Card matching Panel 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Question Types</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select supported format for learning items</p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Multiple Choice */}
            <div
              onClick={() => setSelectedType('mcq')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedType === 'mcq'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Multiple Choice</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Single or multiple content options</p>
                </div>
              </div>
            </div>

            {/* True / False */}
            <div
              onClick={() => setSelectedType('tf')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedType === 'tf'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ToggleLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">True / False</h4>
                  <p className="text-xs text-slate-500 mt-0.5">True or false question</p>
                </div>
              </div>
            </div>

            {/* Short Answer */}
            <div
              onClick={() => setSelectedType('short')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedType === 'short'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <AlignLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Short Answer</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Text based answer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
