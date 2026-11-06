import React, { useState, useEffect } from 'react';
import { BarChart3, Database, CheckCircle, ShieldCheck, Layers, GitCompare } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { teacherService } from '../services/api';

export default function TeacherModelPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const res = await teacherService.getModelPerformance();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading ML Model Performance Metrics...</div>;
  }

  const rf = data?.models?.random_forest || {};
  const xgb = data?.models?.xgboost || {};
  const datasetInfo = data?.dataset_info || {};

  // Dynamically compile feature importance from API responses
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

  const testRowsFormatted = datasetInfo.test_rows ? datasetInfo.test_rows.toLocaleString() : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          ML Model Performance & Evaluation Results
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Recorded offline training evaluation results on the ASSISTments dataset
          {testRowsFormatted ? ` (${testRowsFormatted} test rows)` : ''}.
        </p>
      </div>

      {/* Dataset & Setup Info */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-base">{datasetInfo.name || 'ASSISTments Dataset Setup'}</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold">Cleaned Rows</span>
            <span className="text-base font-extrabold text-purple-300">
              {datasetInfo.total_rows_cleaned ? datasetInfo.total_rows_cleaned.toLocaleString() : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Train Set (80%)</span>
            <span className="text-base font-extrabold text-blue-300">
              {datasetInfo.train_rows ? datasetInfo.train_rows.toLocaleString() : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Test Set (20%)</span>
            <span className="text-base font-extrabold text-emerald-300">
              {datasetInfo.test_rows ? datasetInfo.test_rows.toLocaleString() : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Locked Features</span>
            <span className="text-base font-extrabold text-amber-300">
              {data?.features?.length ? `${data.features.length} Features` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Model Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Random Forest Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{rf.name || 'Random Forest Classifier'}</h3>
              <p className="text-xs text-slate-400 font-mono">{rf.file_name || 'eduinsight_rf.pkl'}</p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
              Random Forest
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-400 font-semibold block">Accuracy</span>
              <span className="text-xl font-extrabold text-slate-800">
                {rf.metrics?.accuracy !== undefined ? `${rf.metrics.accuracy}%` : '—'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-400 font-semibold block">Precision</span>
              <span className="text-xl font-extrabold text-slate-800">
                {rf.metrics?.precision !== undefined ? `${rf.metrics.precision}%` : '—'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-400 font-semibold block">Recall</span>
              <span className="text-xl font-extrabold text-slate-800">
                {rf.metrics?.recall !== undefined ? `${rf.metrics.recall}%` : '—'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center pt-1">
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
              <span className="text-xs text-slate-500 font-semibold block">F1 Score</span>
              <span className="text-xl font-extrabold text-blue-700">
                {rf.metrics?.f1_score !== undefined ? `${rf.metrics.f1_score}%` : '—'}
              </span>
            </div>
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
              <span className="text-xs text-slate-500 font-semibold block">AUC ROC</span>
              <span className="text-xl font-extrabold text-purple-700">
                {rf.metrics?.auc !== undefined ? rf.metrics.auc : '—'}
              </span>
            </div>
          </div>

          {/* Confusion Matrix */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Confusion Matrix {testRowsFormatted ? `(${testRowsFormatted} Test Samples)` : ''}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono font-bold">
              <div className="p-2.5 bg-slate-100 rounded">
                TN: {rf.confusion_matrix?.[0]?.[0] !== undefined ? rf.confusion_matrix[0][0].toLocaleString() : '—'}
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded">
                FP: {rf.confusion_matrix?.[0]?.[1] !== undefined ? rf.confusion_matrix[0][1].toLocaleString() : '—'}
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded">
                FN: {rf.confusion_matrix?.[1]?.[0] !== undefined ? rf.confusion_matrix[1][0].toLocaleString() : '—'}
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded">
                TP: {rf.confusion_matrix?.[1]?.[1] !== undefined ? rf.confusion_matrix[1][1].toLocaleString() : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* XGBoost Card (Primary Live Model) */}
        <div className="bg-white rounded-xl p-6 border-2 border-purple-500 shadow-md space-y-5 relative">
          <span className="absolute -top-3 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-sm">
            Primary Live Model
          </span>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{xgb.name || 'XGBoost Classifier'}</h3>
              <p className="text-xs text-slate-400 font-mono">{xgb.file_name || 'eduinsight_xgb.pkl'}</p>
            </div>
            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
              XGBoost
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-purple-50/50 rounded-lg">
              <span className="text-xs text-slate-400 font-semibold block">Accuracy</span>
              <span className="text-xl font-extrabold text-purple-900">
                {xgb.metrics?.accuracy !== undefined ? `${xgb.metrics.accuracy}%` : '—'}
              </span>
            </div>
            <div className="p-3 bg-purple-50/50 rounded-lg">
              <span className="text-xs text-slate-400 font-semibold block">Precision</span>
              <span className="text-xl font-extrabold text-purple-900">
                {xgb.metrics?.precision !== undefined ? `${xgb.metrics.precision}%` : '—'}
              </span>
            </div>
            <div className="p-3 bg-purple-50/50 rounded-lg">
              <span className="text-xs text-slate-400 font-semibold block">Recall</span>
              <span className="text-xl font-extrabold text-purple-900">
                {xgb.metrics?.recall !== undefined ? `${xgb.metrics.recall}%` : '—'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center pt-1">
            <div className="p-3 bg-purple-100/60 border border-purple-200 rounded-lg">
              <span className="text-xs text-purple-700 font-semibold block">F1 Score</span>
              <span className="text-xl font-extrabold text-purple-900">
                {xgb.metrics?.f1_score !== undefined ? `${xgb.metrics.f1_score}%` : '—'}
              </span>
            </div>
            <div className="p-3 bg-indigo-100/60 border border-indigo-200 rounded-lg">
              <span className="text-xs text-indigo-700 font-semibold block">AUC ROC</span>
              <span className="text-xl font-extrabold text-indigo-900">
                {xgb.metrics?.auc !== undefined ? xgb.metrics.auc : '—'}
              </span>
            </div>
          </div>

          {/* Confusion Matrix */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Confusion Matrix {testRowsFormatted ? `(${testRowsFormatted} Test Samples)` : ''}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono font-bold">
              <div className="p-2.5 bg-slate-100 rounded">
                TN: {xgb.confusion_matrix?.[0]?.[0] !== undefined ? xgb.confusion_matrix[0][0].toLocaleString() : '—'}
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded">
                FP: {xgb.confusion_matrix?.[0]?.[1] !== undefined ? xgb.confusion_matrix[0][1].toLocaleString() : '—'}
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded">
                FN: {xgb.confusion_matrix?.[1]?.[0] !== undefined ? xgb.confusion_matrix[1][0].toLocaleString() : '—'}
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded">
                TP: {xgb.confusion_matrix?.[1]?.[1] !== undefined ? xgb.confusion_matrix[1][1].toLocaleString() : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance Comparison Bar Chart */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-purple-600" />
          Feature Importance Comparison (Random Forest vs XGBoost)
        </h3>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="feature" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis label={{ value: 'Importance %', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(val) => [`${val}%`, 'Importance']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Bar dataKey="RF" fill="#3b82f6" name="Random Forest (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="XGB" fill="#8b5cf6" name="XGBoost (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
