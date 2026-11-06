import React, { useState } from 'react';
import { TrendingUp, HelpCircle } from 'lucide-react';

/**
 * PerformanceTrendLine
 * Renders authentic accuracy and attempt trajectory over actual student quiz sessions.
 * ZERO bluffed data: If no sessions have been taken, displays a clean onboarding state.
 */
export default function PerformanceTrendLine({
  data = [],
  title = "Performance Trend",
  subtitle = "Your accuracy and progress over time."
}) {
  const [activePoint, setActivePoint] = useState(null);

  const points = Array.isArray(data) ? data : [];
  const hasData = points.length > 0;

  const width = 560;
  const height = 180;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 28;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const getX = (idx) => {
    if (points.length <= 1) return padLeft + chartWidth / 2;
    return padLeft + (idx / (points.length - 1)) * chartWidth;
  };
  const getY = (val) => padTop + chartHeight - (Math.max(0, Math.min(100, val || 0)) / 100) * chartHeight;

  // Build SVG path strings
  const accuracyCoords = points.map((p, i) => ({ x: getX(i), y: getY(p.accuracy), item: p }));
  const attemptsCoords = points.map((p, i) => ({ x: getX(i), y: getY(p.attempts || (p.score !== undefined ? (p.score / (p.total || 1)) * 100 : 0)), item: p }));

  const createSmoothPath = (coords) => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const accuracyPath = createSmoothPath(accuracyCoords);
  const attemptsPath = createSmoothPath(attemptsCoords);

  const accuracyArea = points.length > 1
    ? `${accuracyPath} L ${getX(points.length - 1)} ${padTop + chartHeight} L ${getX(0)} ${padTop + chartHeight} Z`
    : '';

  const yLabels = [100, 75, 50, 25, 0];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Legend */}
        {hasData && (
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-blue-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 rotate-45" />
              <span>Accuracy (%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-purple-600 rotate-45" />
              <span>Score / Velocity</span>
            </div>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="py-10 text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <TrendingUp className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-bold text-slate-700">No Quiz Sessions Recorded Yet</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Complete your first quiz to record authentic trajectory analytics and accuracy progression.
          </p>
        </div>
      ) : (
        /* SVG Multi-line Canvas */
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 sm:h-48">
            <defs>
              <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines & Y-axis labels */}
            {yLabels.map((lbl, idx) => {
              const y = getY(lbl);
              return (
                <g key={idx}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray={lbl === 0 ? "0" : "3 3"}
                    strokeWidth="1.2"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {lbl}%
                  </text>
                </g>
              );
            })}

            {/* Area fill for Accuracy */}
            {accuracyArea && <path d={accuracyArea} fill="url(#accGrad)" />}

            {/* Attempts Curve (Purple) */}
            {points.length > 1 && (
              <path
                d={attemptsPath}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Accuracy Curve (Blue) */}
            {points.length > 1 && (
              <path
                d={accuracyPath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Attempts Points */}
            {attemptsCoords.map((c, idx) => (
              <circle
                key={`att-${idx}`}
                cx={c.x}
                cy={c.y}
                r="4"
                fill="#8b5cf6"
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer hover:r-5 transition-all"
              />
            ))}

            {/* Accuracy Points */}
            {accuracyCoords.map((c, idx) => (
              <circle
                key={`acc-${idx}`}
                cx={c.x}
                cy={c.y}
                r="5"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth="2.5"
                className="cursor-pointer hover:r-6 transition-all"
                onMouseEnter={() => setActivePoint(idx)}
                onMouseLeave={() => setActivePoint(null)}
              />
            ))}

            {/* X-axis Session / Date labels */}
            {points.map((p, idx) => {
              const x = getX(idx);
              const label = p.date || (p.topic ? p.topic.substring(0, 10) : `#${idx + 1}`);
              return (
                <text
                  key={`lbl-${idx}`}
                  x={x}
                  y={height - 6}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="600"
                >
                  {label}
                </text>
              );
            })}
          </svg>

          {/* Active Hover Tooltip */}
          {activePoint !== null && points[activePoint] && (
            <div
              className="absolute pointer-events-none bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs z-30 transition-all -translate-x-1/2 -translate-y-full mb-2"
              style={{
                left: `${(accuracyCoords[activePoint].x / width) * 100}%`,
                top: `${(accuracyCoords[activePoint].y / height) * 100}%`
              }}
            >
              <p className="font-bold text-slate-200">
                {points[activePoint].topic || points[activePoint].date}
              </p>
              <div className="flex items-center gap-3 mt-1 font-semibold text-[11px]">
                <span className="text-blue-300">
                  Accuracy: {points[activePoint].accuracy}%
                </span>
                <span className="text-purple-300">
                  Score: {points[activePoint].score || points[activePoint].attempts || points[activePoint].accuracy}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
