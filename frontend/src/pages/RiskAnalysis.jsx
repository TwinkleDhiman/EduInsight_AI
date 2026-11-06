import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShapChart from '../components/ShapChart';
import { studentService } from '../services/api';

export default function RiskAnalysis({ user }) {
  const [riskData, setRiskData] = useState(null);
  const [shapData, setShapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const studentId = user?.student_id || user?.user_id || user?.id;

  useEffect(() => {
    if (!studentId) return;
    fetchRisk();
  }, [studentId]);

  const fetchRisk = async () => {
    try {
      setLoading(true);
      const [risk, shap] = await Promise.all([
        studentService.getRisk(studentId),
        studentService.getShap(studentId)
      ]);
      setRiskData(risk);
      setShapData(shap?.has_activity ? shap : null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const hasActivity = riskData?.has_activity === true;
  const level = riskData?.risk_level || 'N/A';

  const levelConfig = {
    HIGH: { color: 'rose', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800', icon: AlertTriangle },
    MEDIUM: { color: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', icon: ShieldAlert },
    LOW: { color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  };
  const cfg = levelConfig[level] || {};

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
          AI Risk Analysis
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Risk prediction computed from your real quiz interactions using the ASSISTments-trained XGBoost model.
        </p>
      </div>

      {!hasActivity ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center space-y-4">
          <BookOpen className="w-14 h-14 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-amber-900">No Risk Data Yet</h2>
          <p className="text-sm text-amber-700 max-w-md mx-auto">
            Your learning risk is computed from real quiz interaction data.
            Take a quiz to generate your personalized risk profile.
          </p>
          <button
            onClick={() => navigate('/student/quiz')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-sm"
          >
            <HelpCircle className="w-4 h-4" />
            Start Quiz Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Risk Level Card */}
          <div className={`${cfg.bg} ${cfg.border} border rounded-2xl p-6 flex items-center gap-6`}>
            <div className={`w-20 h-20 rounded-2xl ${cfg.badge} flex items-center justify-center shrink-0`}>
              <span className="text-3xl font-extrabold">{level}</span>
            </div>
            <div>
              <h2 className={`text-2xl font-extrabold ${cfg.text}`}>
                {level} Risk
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Risk Probability: <strong>{Math.round((riskData?.risk_probability || 0) * 100)}%</strong>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Model: {riskData?.model_name}
              </p>
            </div>
          </div>

          {/* SHAP Explanation */}
          {shapData && <ShapChart shapData={shapData} />}
        </div>
      )}
    </div>
  );
}
