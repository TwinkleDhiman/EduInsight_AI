import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowUpRight, CheckCircle2, RotateCcw } from 'lucide-react';

/**
 * ConceptPerformanceTable
 * Renders the clean concept-level performance table matching the user's reference UI.
 * Features Concept, Subject, Accuracy, Status pills, and Action buttons.
 */
export default function ConceptPerformanceTable({
  concepts = [],
  subject = "Computer Science",
  onAction
}) {
  const navigate = useNavigate();

  const handleAction = (item) => {
    if (onAction) {
      onAction(item);
    } else {
      navigate(`/student/quiz?topic=${encodeURIComponent(item.name || item.skill_name || item.id)}&title=${encodeURIComponent(item.name || item.skill_name)}`);
    }
  };

  const getStatusBadge = (status, accuracy) => {
    const s = (status || '').toLowerCase();
    if (s.includes('master') || accuracy >= 80) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Mastered
        </span>
      );
    }
    if (s.includes('risk') || (accuracy > 0 && accuracy < 50)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          At Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {accuracy > 0 ? 'In Progress' : 'Not Started'}
      </span>
    );
  };

  const getActionLabel = (status, accuracy) => {
    if (accuracy >= 80) return 'Revise';
    if (accuracy > 0) return 'Practice';
    return 'Learn';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Concept-wise Performance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed view of your learning progress in {subject}.
          </p>
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          {concepts.length} Concepts Tracked
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Concept</th>
              <th className="py-3.5 px-6">Subject</th>
              <th className="py-3.5 px-6">Accuracy</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {concepts.map((item, idx) => {
              const name = item.name || item.skill_name || `Concept #${idx + 1}`;
              const accuracy = item.mastery !== undefined ? item.mastery : (item.accuracy || 0);
              const actionLabel = getActionLabel(item.status, accuracy);

              return (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-800 text-sm">
                    {name}
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-500">
                    {item.subject || subject}
                  </td>
                  <td className="py-4 px-6 font-extrabold text-slate-900 text-sm">
                    {accuracy}%
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(item.status, accuracy)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleAction(item)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 hover:border-blue-600 transition-all inline-flex items-center gap-1 shadow-2xs"
                    >
                      <span>{actionLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
