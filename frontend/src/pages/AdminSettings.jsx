import React, { useState } from 'react';
import { Settings, Save, Shield, Bell, Database, Key } from 'lucide-react';

export default function AdminSettings({ user, showToast }) {
  const [bktInit, setBktInit] = useState(0.20);
  const [bktTransit, setBktTransit] = useState(0.15);
  const [riskThreshold, setRiskThreshold] = useState(0.60);
  const [allowRegistration, setAllowRegistration] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    showToast && showToast('Configuration settings updated successfully', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Configure Bayesian Knowledge Tracing hyperparameters, risk alert thresholds, and security policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ML & Knowledge Tracing Parameters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Knowledge Tracing Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Prior Probability P(L0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.99"
                value={bktInit}
                onChange={(e) => setBktInit(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Learning Transition Rate P(T)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.99"
                value={bktTransit}
                onChange={(e) => setBktTransit(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Risk Thresholds */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900">Early Intervention Thresholds</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              High Risk Alert Cutoff Probability: {Math.round(riskThreshold * 100)}%
            </label>
            <input
              type="range"
              min="0.30"
              max="0.90"
              step="0.05"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
