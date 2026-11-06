import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, AlertTriangle, Clock, Target, Layers } from 'lucide-react';

/**
 * LearningTwinNetwork
 * Renders an expansive, prominent dynamic knowledge network graph.
 * Features a central student identity node connected to full-sized concept satellite nodes
 * displaying complete concept titles, live BKT masteries, and status badges without truncation.
 */
export default function LearningTwinNetwork({
  studentName = "You",
  concepts = [],
  title = "Dynamic Knowledge State Network",
  subtitle = "Interactive BKT concept connections and cognitive mastery states.",
  detailsLink = "/student/learning-twin"
}) {
  const navigate = useNavigate();

  const getStatusConfig = (status, mastery = 0) => {
    const s = String(status || '').toLowerCase();
    const m = Math.round(Number(mastery) || 0);

    if (s.includes('master') || m >= 80) {
      return {
        label: 'Mastered',
        pctText: `${m}%`,
        border: 'border-emerald-300 bg-white/95 text-emerald-800 shadow-sm shadow-emerald-500/10',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        line: '#10b981',
        icon: CheckCircle2
      };
    }
    if (s.includes('risk') || (m > 0 && m < 50)) {
      return {
        label: 'At Risk',
        pctText: `${m}%`,
        border: 'border-rose-300 bg-white/95 text-rose-800 shadow-sm shadow-rose-500/10',
        badge: 'bg-rose-100 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        line: '#f43f5e',
        icon: AlertTriangle
      };
    }
    if (m > 0) {
      return {
        label: 'In Progress',
        pctText: `${m}%`,
        border: 'border-amber-300 bg-white/95 text-amber-800 shadow-sm shadow-amber-500/10',
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        line: '#f59e0b',
        icon: Clock
      };
    }
    return {
      label: 'Not Started',
      pctText: '0%',
      border: 'border-slate-200 bg-white/95 text-slate-700 shadow-xs',
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      line: '#cbd5e1',
      icon: Target
    };
  };

  // Safe fallback if concepts is empty or not an array
  const safeConcepts = Array.isArray(concepts) ? concepts.filter(Boolean) : [];
  const displayConcepts = safeConcepts.length > 0 ? safeConcepts.slice(0, 6) : [
    { name: 'Core Foundations', status: 'Not Started', mastery: 0 },
    { name: 'Data Architecture', status: 'Not Started', mastery: 0 },
    { name: 'Applied Reasoning', status: 'Not Started', mastery: 0 },
    { name: 'Algorithmic Logic', status: 'Not Started', mastery: 0 }
  ];
  const count = displayConcepts.length;

  // Center coordinate on 800 x 420 SVG coordinate space
  const centerX = 400;
  const centerY = 210;
  const rx = 280;
  const ry = 140;

  // Parametric ellipse distribution around central node
  const nodePositions = displayConcepts.map((_, i) => {
    const angle = (i * 2 * Math.PI / Math.max(1, count)) - Math.PI / 2;
    const x = centerX + rx * Math.cos(angle);
    const y = centerY + ry * Math.sin(angle);
    return { x, y, angle };
  });

  const studentDisplayName = (studentName && typeof studentName === 'string')
    ? (studentName === 'You' ? 'You' : studentName.trim().split(' ')[0] || 'You')
    : 'You';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-lg shadow-xs shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {detailsLink && (
          <button
            onClick={() => navigate(detailsLink)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200/60 self-start sm:self-auto"
          >
            <span>Full Twin View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Prominent Knowledge Network Canvas */}
      <div className="relative w-full h-96 sm:h-[440px] my-4 select-none">
        {/* SVG Background Layer for Curved Connecting Rays */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 800 420"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </radialGradient>
          </defs>

          {/* Central ambient glow circle */}
          <circle cx={centerX} cy={centerY} r="95" fill="url(#centerGlow)" />

          {/* Connecting Rays */}
          {nodePositions.map((pos, i) => {
            const c = displayConcepts[i] || {};
            const cfg = getStatusConfig(c.status, c.mastery);
            return (
              <g key={`ray-${i}`}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={cfg.line}
                  strokeWidth="2.2"
                  strokeDasharray={cfg.label === 'Not Started' ? "4 4" : "6 4"}
                  strokeOpacity={cfg.label === 'Not Started' ? "0.45" : "0.85"}
                  strokeLinecap="round"
                />
                {/* Midpoint glowing particle */}
                {cfg.label !== 'Not Started' && (
                  <circle
                    cx={(centerX + pos.x) / 2}
                    cy={(centerY + pos.y) / 2}
                    r="3.5"
                    fill={cfg.line}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Central Hub Node (Student Persona) */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(centerX / 800) * 100}%`, top: `${(centerY / 420) * 100}%` }}
        >
          <div className="relative flex flex-col items-center group">
            {/* Pulsing halo */}
            <div className="absolute -inset-2 rounded-full bg-blue-500/20 blur-sm animate-pulse" />

            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white font-black text-sm sm:text-base flex flex-col items-center justify-center shadow-xl shadow-indigo-950/30 border-2 border-white ring-4 ring-blue-500/20 transition-transform group-hover:scale-105">
              <span className="tracking-tight">{studentDisplayName}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-300">Hub</span>
            </div>
          </div>
        </div>

        {/* Prominent Concept Satellite Nodes */}
        {nodePositions.map((pos, i) => {
          const c = displayConcepts[i] || {};
          const cfg = getStatusConfig(c.status, c.mastery);
          const conceptName = c.name || `Concept #${i + 1}`;

          return (
            <div
              key={`node-${i}`}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-105 hover:z-30 cursor-pointer"
              style={{
                left: `${(pos.x / 800) * 100}%`,
                top: `${(pos.y / 420) * 100}%`
              }}
              onClick={() => {
                if (detailsLink) {
                  navigate(detailsLink);
                } else if (conceptName) {
                  navigate(`/student/quiz?topic=${encodeURIComponent(conceptName)}&title=${encodeURIComponent(conceptName)}`);
                }
              }}
            >
              <div
                className={`p-3 rounded-2xl border ${cfg.border} transition-shadow hover:shadow-md`}
                style={{ minWidth: '160px', maxWidth: '200px' }}
              >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${cfg.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                    {cfg.label}
                  </span>
                  <span className="text-[11px] font-black text-slate-800 shrink-0">
                    {cfg.pctText}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800 leading-tight break-words">
                  {conceptName}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network Legend Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Mastered (≥80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-semibold text-slate-700">In Progress (50-79%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-semibold text-slate-700">At Risk (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="font-semibold text-slate-700">Not Started (0%)</span>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-400">
          Click any concept node to explore or practice
        </span>
      </div>
    </div>
  );
}
