import React, { useState, useEffect } from 'react';
import { BarChart3, Database, CheckCircle, ShieldCheck, Layers, GitCompare, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { adminService } from '../services/api';

export default function AdminModelPerformance({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getModelPerformance();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-semibold text-sm">Loading ML Model Performance Metrics...</p>
      </div>
    );
  }

  const rf = data?.models?.random_forest || {};
  const xgb = data?.models?.xgboost || {};
  const datasetInfo = data?.dataset_info || {};

  const rfMap = (rf.feature_importance || []).reduce((acc, curr) => {
    acc[curr.feature] = Number(curr.percentage.toFixed(2));
    return acc;
  }, {});

  const xgbMap = (xgb.feature_importance || []).reduce((acc, curr) => {
    acc[curr.feature] = Number(curr.percentage.toFixed(2));
    return acc;
  }, {});

  const featureKeys = data?.features || [
    'attempt_count',
    'hint_count',
    'bottom_hint',
    'overlap_time',
    'ms_first_response',
    'skill_id',
    'actions'
  ];

  const featureChartData = featureKeys.map((feat) => ({
    feature: feat,
    RF: rfMap[feat] ?? 0,
    XGB: xgbMap[feat] ?? 0
  }));

  const testRowsFormatted = datasetInfo.test_rows ? datasetInfo.test_rows.toLocaleString() : '—';
  const cleanedRows = datasetInfo.total_rows_cleaned ? datasetInfo.total_rows_cleaned.toLocaleString() : '—';
  const trainRows = datasetInfo.train_rows ? datasetInfo.train_rows.toLocaleString() : '—';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Admin System Metrics
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          ML Model Performance &amp; Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Recorded offline training evaluation results on the ASSISTments dataset ({testRowsFormatted} test rows).
        </p>
      </div>

      {/* Dataset & Setup Info */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-base">{datasetInfo.name || 'ASSISTments 2012-2013 Dataset'}</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold">Cleaned Rows</span>
            <span className="text-base font-extrabold text-purple-300">
              {datasetInfo.total_rows_cleaned ? datasetInfo.total_rows_cleaned.toLocaleString() : cleanedRows}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Train Set (80%)</span>
            <span className="text-base font-extrabold text-blue-300">
              {datasetInfo.train_rows ? datasetInfo.train_rows.toLocaleString() : trainRows}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Test Set (20%)</span>
            <span className="text-base font-extrabold text-emerald-300">
              {datasetInfo.test_rows ? datasetInfo.test_rows.toLocaleString() : testRowsFormatted}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Split Strategy</span>
            <span className="text-base font-extrabold text-amber-300">80/20 Stratified</span>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Head-to-Head Model Evaluation</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            Evaluated on Test Split
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Model</th>
                <th className="py-3.5 px-6">Accuracy</th>
                <th className="py-3.5 px-6">Precision</th>
                <th className="py-3.5 px-6">Recall</th>
                <th className="py-3.5 px-6">F1-Score</th>
                <th className="py-3.5 px-6">ROC-AUC</th>
                <th className="py-3.5 px-6">Deployment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {/* XGBoost */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  XGBoost Classifier
                </td>
                <td className="py-4 px-6 font-semibold">{xgb.metrics?.accuracy != null ? `${xgb.metrics.accuracy}%` : '—'}</td>
                <td className="py-4 px-6">{xgb.metrics?.precision != null ? `${xgb.metrics.precision}%` : '—'}</td>
                <td className="py-4 px-6 text-emerald-600 font-semibold">{xgb.metrics?.recall != null ? `${xgb.metrics.recall}%` : '—'}</td>
                <td className="py-4 px-6 font-semibold">{xgb.metrics?.f1_score != null ? `${xgb.metrics.f1_score}%` : '—'}</td>
                <td className="py-4 px-6 text-blue-600 font-bold">{xgb.metrics?.auc ?? '—'}</td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Primary Live Model
                  </span>
                </td>
              </tr>
              {/* Random Forest */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  Random Forest
                </td>
                <td className="py-4 px-6 font-semibold">{rf.metrics?.accuracy != null ? `${rf.metrics.accuracy}%` : '—'}</td>
                <td className="py-4 px-6">{rf.metrics?.precision != null ? `${rf.metrics.precision}%` : '—'}</td>
                <td className="py-4 px-6 text-emerald-600 font-semibold">{rf.metrics?.recall != null ? `${rf.metrics.recall}%` : '—'}</td>
                <td className="py-4 px-6 font-semibold">{rf.metrics?.f1_score != null ? `${rf.metrics.f1_score}%` : '—'}</td>
                <td className="py-4 px-6 text-purple-600 font-bold">{rf.metrics?.auc ?? '—'}</td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Benchmark Baseline
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance Comparison Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900">Feature Importance Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Percentage contribution of each interaction feature to the risk prediction models.
          </p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="feature" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis unit="%" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                formatter={(val) => [`${val}%`, '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
              <Bar dataKey="XGB" fill="#2563eb" name="XGBoost" radius={[4, 4, 0, 0]} />
              <Bar dataKey="RF" fill="#9333ea" name="Random Forest" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
