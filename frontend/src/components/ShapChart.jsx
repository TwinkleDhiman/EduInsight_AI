import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { HelpCircle, AlertTriangle } from 'lucide-react';

export default function ShapChart({ shapData }) {
  if (!shapData || !shapData.feature_contributions) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          Why am I at risk?
        </h3>
        <p className="text-sm text-slate-500 mt-2">Loading feature importance analysis...</p>
      </div>
    );
  }

  const chartData = shapData.feature_contributions.map((item) => ({
    name: item.friendly_label,
    value: item.shap_value,
    impact: item.impact,
    rawValue: item.value
  }));

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {shapData.title || "Why am I at risk?"}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key factors contributing to your learning risk assessment
          </p>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          shapData.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-700' :
          shapData.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
          'bg-emerald-100 text-emerald-700'
        }`}>
          Risk: {shapData.risk_level} ({Math.round((shapData.risk_probability || 0) * 100)}%)
        </span>
      </div>

      {/* Bullet Points */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Key Model Contributors</h4>
        <ul className="space-y-1.5 text-sm text-slate-700">
          {shapData.top_bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Horizontal SHAP Bar Chart */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Feature Impact (SHAP Contribution)</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#334155' }} width={140} />
              <Tooltip
                formatter={(val, name, item) => [
                  `SHAP: ${val} (${item.payload.impact})`,
                  item.payload.name
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value > 0 ? '#ef4444' : '#10b981'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scientific Note */}
      <p className="text-xs text-slate-400 italic text-center border-t border-slate-100 pt-3">
        {shapData.scientific_note || "SHAP identifies features that contributed to the model's prediction."}
      </p>
    </div>
  );
}
