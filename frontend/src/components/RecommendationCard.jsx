import React from 'react';
import { Sparkles, ArrowRight, Clock, Target, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecommendationCard({ recommendation }) {
  const navigate = useNavigate();

  const priorityStyles = {
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const getIcon = (type) => {
    if (type?.includes('Concept') || type?.includes('Revise')) return BookOpen;
    if (type?.includes('Timed') || type?.includes('Speed')) return Clock;
    if (type?.includes('Strategy') || type?.includes('Hint')) return AlertCircle;
    return Target;
  };

  const Icon = getIcon(recommendation.recommendation_type);

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
            priorityStyles[recommendation.priority] || priorityStyles.MEDIUM
          }`}>
            {recommendation.priority || 'MEDIUM'} Priority
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {recommendation.recommendation_type}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">{recommendation.title}</h4>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{recommendation.explanation}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{recommendation.suggested_action}</span>
        </div>

        <button
          onClick={() => navigate('/student/quiz')}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors shrink-0 ml-2"
        >
          <span>Start Practice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
