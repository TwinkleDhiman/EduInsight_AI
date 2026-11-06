import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, XCircle, PlusCircle, ChevronDown, Layers, AlertTriangle } from 'lucide-react';
import { teacherService } from '../services/api';

const ANSWER_OPTIONS = ['A', 'B', 'C', 'D'];

const emptyForm = {
  skill_id: '',
  question: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A',
};

export default function TeacherQuizGenerator({ user }) {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loadingSkills, setLoadingSkills] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        const data = await teacherService.getSkills();
        setSkills(data || []);
        if (data && data.length > 0) {
          setForm((prev) => ({ ...prev, skill_id: data[0].skill_id }));
        }
      } catch (err) {
        console.error('Failed to load skills', err);
        setError('Unable to fetch curriculum skills. Is the backend running?');
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccessMsg('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Basic client-side validation
    const trimmed = {
      ...form,
      question: form.question.trim(),
      option_a: form.option_a.trim(),
      option_b: form.option_b.trim(),
      option_c: form.option_c.trim(),
      option_d: form.option_d.trim(),
    };

    if (!trimmed.skill_id) { setError('Please select a skill/concept.'); return; }
    if (!trimmed.question) { setError('Question text is required.'); return; }
    if (!trimmed.option_a || !trimmed.option_b || !trimmed.option_c || !trimmed.option_d) {
      setError('All four answer options (A, B, C, D) are required.'); return;
    }

    setSubmitting(true);
    try {
      const res = await teacherService.createQuizQuestion({
        skill_id: Number(trimmed.skill_id),
        question: trimmed.question,
        option_a: trimmed.option_a,
        option_b: trimmed.option_b,
        option_c: trimmed.option_c,
        option_d: trimmed.option_d,
        correct_answer: form.correct_answer,
      });

      setSuccessMsg(
        `Question #${res.question_id} added to "${res.skill_name}" successfully.`
      );
      // Reset form but keep the selected skill
      setForm((prev) => ({ ...emptyForm, skill_id: prev.skill_id }));
    } catch (err) {
      console.error('Failed to create question', err);
      setError(err?.response?.data?.detail || 'Failed to create question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-600" />
          Add Quiz Question
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create a new multiple-choice question for any curriculum concept. Students will receive it in their quiz pool.
        </p>
      </div>

      {/* Status messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm font-medium">
          <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loadingSkills ? (
        <div className="flex items-center justify-center min-h-[200px] space-x-3 text-slate-500">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading curriculum skills...</span>
        </div>
      ) : skills.length === 0 ? (
        <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <p className="font-bold text-amber-800">No skills found in the database.</p>
          <p className="text-sm text-amber-700">Run the backend seed script to populate curriculum skills first.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">

          {/* Skill Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Curriculum Concept / Skill
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                name="skill_id"
                value={form.skill_id}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none transition-all"
              >
                {skills.map((sk) => (
                  <option key={sk.skill_id} value={sk.skill_id}>
                    #{sk.skill_id} — {sk.skill_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Question Text
            </label>
            <textarea
              name="question"
              value={form.question}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Type the question here..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none transition-all"
            />
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Answer Options
            </label>
            {ANSWER_OPTIONS.map((letter) => {
              const fieldName = `option_${letter.toLowerCase()}`;
              return (
                <div key={letter} className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    form.correct_answer === letter
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {letter}
                  </span>
                  <input
                    type="text"
                    name={fieldName}
                    value={form[fieldName]}
                    onChange={handleChange}
                    required
                    placeholder={`Option ${letter}`}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              );
            })}
          </div>

          {/* Correct Answer Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Correct Answer
            </label>
            <div className="flex gap-2">
              {ANSWER_OPTIONS.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, correct_answer: letter }));
                    setError('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    form.correct_answer === letter
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Select the letter that matches the correct answer option above.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 text-sm transition-all"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adding Question...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>Add Question to Quiz Pool</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
