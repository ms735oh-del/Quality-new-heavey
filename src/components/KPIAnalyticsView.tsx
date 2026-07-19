/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KPI } from '../types';
import {
  TrendingUp,
  Award,
  CheckCircle,
  Plus,
  RefreshCw,
  Edit3,
  Calendar,
  Save,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const KPIAnalyticsView: React.FC = () => {
  const {
    language,
    kpis,
    updateKPI,
    actingRole,
    t
  } = useApp();

  const [selectedKpi, setSelectedKpi] = useState<KPI | null>(kpis[0] || null);
  const [newValue, setNewValue] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleUpdateKpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKpi || !newValue) return;

    const val = Number(newValue);
    if (isNaN(val)) return;

    updateKPI(selectedKpi.id, val);
    
    // Refresh selected KPI reference locally to display updated value on the chart
    const matched = kpis.find(k => k.id === selectedKpi.id);
    if (matched) {
      setSelectedKpi({
        ...matched,
        value: val,
        history: [
          ...matched.history.slice(1),
          { date: 'New', value: val }
        ]
      });
    }

    setNewValue('');
    setSuccessMsg(t('kpiUpdateSuccess'));
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Academics':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-500/10';
      case 'Research':
        return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/10';
      case 'Resources':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/10';
      default:
        return 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-500/10';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="kpi-analytics-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
        <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
            <TrendingUp className="w-7 h-7 text-emerald-500" />
            <span>{t('kpiTitle')}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">{t('kpiSubtitle')}</p>
        </div>
      </div>

      {/* Trigger alert */}
      {successMsg && (
        <div id="kpi-success-alert" className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI main layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Metric selection deck */}
        <div className="lg:col-span-1 space-y-3" id="kpis-selection-deck">
          {kpis.map(kpi => {
            const isSelected = selectedKpi?.id === kpi.id;
            const progressPercent = Math.min(Math.round((kpi.value / kpi.target) * 100), 100);

            return (
              <div
                key={kpi.id}
                id={`kpi-card-${kpi.id}`}
                onClick={() => setSelectedKpi(kpi)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                }`}
                style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
              >
                <div className="flex items-center justify-between mb-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                    isSelected ? 'bg-white/20 border-white/10 text-white' : getCategoryColor(kpi.category)
                  }`}>
                    {language === 'ar' ? kpi.arabicCategory : kpi.category}
                  </span>
                  
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    Target: {kpi.target} {kpi.unit}
                  </span>
                </div>

                <h4 className={`text-xs font-extrabold truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {language === 'ar' ? kpi.arabicName : kpi.name}
                </h4>

                <div className="mt-3 flex items-baseline gap-1" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                  <span className="text-lg font-black font-mono">
                    {kpi.value}
                  </span>
                  <span className="text-[10px] opacity-75">{kpi.unit}</span>
                </div>

                {/* mini slider bar */}
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden mt-3">
                  <div 
                    className={`h-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed charts and update form deck */}
        <div className="lg:col-span-2" id="kpi-chart-and-updater">
          {selectedKpi ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
              {/* Selected header banner */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${getCategoryColor(selectedKpi.category)}`}>
                    {language === 'ar' ? selectedKpi.arabicCategory : selectedKpi.category}
                  </span>
                  <h3 className="text-md font-black text-slate-900 dark:text-white mt-3">
                    {language === 'ar' ? selectedKpi.arabicName : selectedKpi.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Statistical indices mapped across historical audit intervals.</p>
                </div>

                {/* Numerical statistics bubble */}
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200 dark:border-slate-850">
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Current</span>
                    <span className="text-sm font-black font-mono text-emerald-500">{selectedKpi.value}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Target</span>
                    <span className="text-sm font-black font-mono text-slate-600 dark:text-slate-300">{selectedKpi.target}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Linechart */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-4">{t('historyChart')}</h4>
                <div className="h-64 w-full" id="kpi-specific-trendchart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedKpi.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="value" name="Metric Value" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Update value Form */}
              {['Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean', 'Department Head', 'Program Coordinator'].includes(actingRole) && (
                <form onSubmit={handleUpdateKpi} id="kpi-value-logging-form" className="p-4 border border-emerald-250 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                    <div className="flex-1" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('updateKpi')}</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder={`e.g. Enter value (${selectedKpi.unit})`}
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mt-1.5 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10 self-start sm:self-auto"
                      style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
                    >
                      <Save className="w-4 h-4" />
                      <span>{t('save')}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <TrendingUp className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm">Select an institutional KPI on the sidebar deck to examine historical charts and submit current metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
