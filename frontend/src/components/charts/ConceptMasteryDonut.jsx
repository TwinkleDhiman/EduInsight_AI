import React, { useState } from 'react';

/**
 * ConceptMasteryDonut
 * Displays authentic concept mastery without bluffed values.
 * Displays overall percentage in the center and color-coded arcs.
 */
export default function ConceptMasteryDonut({
  overallMastery = 0,
  items = [],
  title = "Concept Mastery Overview",
  subtitle = "Performance breakdown across curriculum concepts."
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const radius = 68;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  // Authentic items without fake fallbacks
  const validItems = Array.isArray(items) ? items : [];
  const attemptedItems = validItems.filter(it => (it.value || 0) > 0);
  const totalValue = attemptedItems.reduce((acc, it) => acc + it.value, 0) || 1;

  // Compute strokeDasharray offsets for attempted items
  let accumulatedAngle = 0;
  const segments = attemptedItems.map((item, idx) => {
    const fraction = (item.value || 0) / totalValue;
    const strokeDash = fraction * circumference;
    const strokeOffset = circumference - strokeDash;
    const rotation = (accumulatedAngle / totalValue) * 360 - 90;
    accumulatedAngle += (item.value || 0);

    return {
      ...item,
      strokeDash,
      strokeOffset,
      rotation,
      fraction,
      originalIdx: validItems.indexOf(item)
    };
  });

  const activeHoverItem = hoveredIdx !== null ? validItems[hoveredIdx] : null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-4">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
            {/* Background track (shows full circle when nothing attempted) */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Arcs for attempted concepts */}
            {segments.map((seg, i) => {
              const isHovered = hoveredIdx === seg.originalIdx;
              return (
                <circle
                  key={i}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${seg.strokeDash} ${circumference}`}
                  strokeDashoffset={-((seg.rotation + 90) / 360) * circumference}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(seg.originalIdx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {activeHoverItem ? `${activeHoverItem.value}%` : `${overallMastery}%`}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 max-w-[110px] truncate">
              {activeHoverItem ? activeHoverItem.label : 'Overall Mastery'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 w-full max-w-xs">
          {validItems.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const isAttempted = (item.value || 0) > 0;
            return (
              <div
                key={idx}
                className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isHovered ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`truncate font-semibold ${isHovered ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                </div>
                <span className={`text-[11px] font-extrabold shrink-0 ${isAttempted ? 'text-slate-900' : 'text-slate-400'}`}>
                  {isAttempted ? `${item.value}%` : 'Not Started'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
