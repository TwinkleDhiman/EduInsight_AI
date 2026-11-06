import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, CheckCircle2, AlertTriangle, Database,
  Cpu, Sparkles, Layers, RefreshCw, Server, HardDrive,
  Activity, Check, Info
} from 'lucide-react';
import { adminService } from '../services/api';

export default function AdminSystemStatus({ user, showToast }) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getSystemStatus();
      setStatusData(res);
    } catch (err) {
      console.warn('System status fetch failed:', err);
      setError('Unable to load system status. Ensure the backend is running.');
      setStatusData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSystemStatus();
    setRefreshing(false);
    showToast && showToast('System status refreshed', 'info');
  };

  const data = statusData;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title & Refresh Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage the health and configuration of your system.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
          <span>Refresh Health</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-slate-100 rounded-2xl h-36" />
          ))}
        </div>
      )}

      {/* Error Banner */}
      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-2">
          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-700">{error}</p>
          <button
            onClick={fetchSystemStatus}
            className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid of Status Cards */}
      {!loading && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Backend Health */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Backend Health</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-lg font-extrabold text-slate-900">{data.backend_health?.status}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Uptime: {data.backend_health?.uptime} · Latency: {data.backend_health?.latency}
                </p>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                Service: {data.backend_health?.service || 'FastAPI ASGI'}
              </div>
            </div>

            {/* Card 2: Database */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Database</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-lg font-extrabold text-slate-900">{data.database?.status}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  SQLite (eduinsight.db)
                </p>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                {data.database?.total_records != null
                  ? `Records: ${data.database.total_records.toLocaleString()} · SQLite3 Active`
                  : 'SQLite3 Connection Pool Active'}
              </div>
            </div>

            {/* Card 3: Dataset */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Dataset</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-lg font-extrabold text-slate-900">{data.dataset?.status}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  ASSISTments (Kaggle)
                </p>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                Rows: {data.dataset?.total_records?.toLocaleString() || '1,737,242'} Cleaned · {data.dataset?.features || 7} Live Features
              </div>
            </div>

            {/* Card 4: ML Model */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">ML Model</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-lg font-extrabold text-slate-900">{data.ml_model?.status}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  XGBoost Classifier + Random Forest
                </p>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                Accuracy: {data.ml_model?.accuracy} · AUC: {data.ml_model?.auc}
              </div>
            </div>

            {/* Card 5: SHAP Explainability */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">SHAP Explainability</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-lg font-extrabold text-slate-900">{data.shap_explainability?.status}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  TreeExplainer Active
                </p>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                Local & Global Feature Attribution Ready
              </div>
            </div>

            {/* Card 6: AI Recommendations */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">AI Recommendations</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-lg font-extrabold text-slate-900">{data.ai_recommendations?.status}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  BKT Heuristic Engine Active
                </p>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                Bayesian Mastery Driven Interventions
              </div>
            </div>
          </div>

          {/* Application Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Application Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Version</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">{data.app_info?.version}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Environment</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">{data.app_info?.environment}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Last Updated</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">{data.app_info?.last_updated}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

