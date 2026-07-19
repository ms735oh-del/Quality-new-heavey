/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActionPlan } from '../types';
import {
  Building2,
  Plus,
  TrendingUp,
  Award,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  Briefcase
} from 'lucide-react';

export const SiteVisitAuditsView: React.FC = () => {
  const {
    language,
    actionPlans,
    addNewActionPlan,
    changeActionPlanStatus,
    programs,
    currentUser,
    actingRole,
    t
  } = useApp();

  const [showApForm, setShowApForm] = useState(false);
  const [apTitle, setApTitle] = useState('');
  const [apTitleAr, setApTitleAr] = useState('');
  const [apRec, setApRec] = useState('');
  const [apRecAr, setApRecAr] = useState('');
  const [apResponsible, setApResponsible] = useState('');
  const [apResponsibleAr, setApResponsibleAr] = useState('');
  const [apProgramId, setApProgramId] = useState('');
  const [apDueDate, setApDueDate] = useState('');
  const [apPriority, setApPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const handleCreateActionPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apTitle || !apRec) return;

    addNewActionPlan({
      programId: apProgramId || (programs[0]?.id || ''),
      title: apTitle,
      arabicTitle: apTitleAr || apTitle,
      recommendation: apRec,
      arabicRecommendation: apRecAr || apRec,
      responsibleParty: apResponsible || 'Dean of Faculty',
      arabicResponsibleParty: apResponsibleAr || 'عميد الكلية',
      dueDate: apDueDate || new Date().toISOString().split('T')[0],
      status: 'Not Started',
      arabicStatus: 'لم يبدأ بعد',
      priority: apPriority
    });

    setApTitle('');
    setApTitleAr('');
    setApRec('');
    setApRecAr('');
    setApResponsible('');
    setApResponsibleAr('');
    setApProgramId('');
    setApDueDate('');
    setApPriority('Medium');
    setShowApForm(false);
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'High':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default:
        return 'bg-slate-400/10 text-slate-400 border border-slate-500/10';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      default:
        return 'bg-slate-400/10 text-slate-400 border border-slate-500/10';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="site-visit-audits-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
        <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
            <Building2 className="w-7 h-7 text-indigo-500" />
            <span>{t('siteVisitTitle')}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">{t('siteVisitSubtitle')}</p>
        </div>

        {['Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean', 'External Reviewer'].includes(actingRole) && (
          <button
            id="ap-add-form-trigger"
            onClick={() => setShowApForm(!showApForm)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all self-start"
            style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
          >
            <Plus className="w-4 h-4" />
            <span>{t('addActionPlan')}</span>
          </button>
        )}
      </div>

      {/* Action Plan registration form block */}
      {showApForm && (
        <form onSubmit={handleCreateActionPlan} id="actionplan-registration-form" className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">{t('apTitle')}</label>
              <input
                type="text"
                required
                placeholder="e.g. Modernise Thermodynamics Thermal Couplers"
                value={apTitle}
                onChange={e => setApTitle(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">{t('apTitle')} (العربية)</label>
              <input
                type="text"
                placeholder="مثال: ترقية برمجيات مختبرات الديناميكا الحرارية"
                value={apTitleAr}
                onChange={e => setApTitleAr(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">{t('recommendation')}</label>
              <input
                type="text"
                required
                placeholder="Details of finding or recommendation standard..."
                value={apRec}
                onChange={e => setApRec(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">{t('recommendation')} (العربية)</label>
              <input
                type="text"
                placeholder="تفاصيل التوصية الأكاديمية أو الملاحظة..."
                value={apRecAr}
                onChange={e => setApRecAr(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs uppercase font-bold text-slate-500">{t('responsible')}</label>
              <input
                type="text"
                placeholder="e.g. Dean of Engineering / Coordinator"
                value={apResponsible}
                onChange={e => setApResponsible(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">{t('dueDate')}</label>
              <input
                type="date"
                value={apDueDate}
                onChange={e => setApDueDate(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">{t('priority')}</label>
              <select
                value={apPriority}
                onChange={e => setApPriority(e.target.value as any)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">Related Program</label>
              <select
                value={apProgramId}
                onChange={e => setApProgramId(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
              >
                <option value="">Select Target Program...</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowApForm(false)}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
            >
              {t('save')}
            </button>
          </div>
        </form>
      )}

      {/* Main timeline listing */}
      <div className="space-y-4" id="actionplans-timeline-list">
        {actionPlans.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-sm">
            Zero pending remediation initiatives found for this tenant. External review recommendations are completely resolved.
          </div>
        ) : (
          actionPlans.map(ap => {
            const correspondingProg = programs.find(p => p.id === ap.programId);
            return (
              <div
                key={ap.id}
                id={`actionplan-row-${ap.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6"
                style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
              >
                {/* Info block */}
                <div className="flex-1 min-w-0" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-500 font-bold px-2 py-0.5 rounded-full">
                      {correspondingProg ? correspondingProg.code : 'INSTITUTION'}
                    </span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${getPriorityBadge(ap.priority)}`}>
                      {ap.priority} Priority
                    </span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusBadge(ap.status)}`}>
                      {language === 'ar' ? ap.arabicStatus : ap.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {language === 'ar' ? ap.arabicTitle : ap.title}
                  </h3>
                  
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Auditors Directive: </span>
                    {language === 'ar' ? ap.arabicRecommendation : ap.recommendation}
                  </p>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50 dark:border-slate-850 flex-wrap" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {ap.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>Owner: {language === 'ar' ? ap.arabicResponsibleParty : ap.responsibleParty}</span>
                    </div>
                  </div>
                </div>

                {/* State toggle action buttons */}
                {['Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean', 'Department Head'].includes(actingRole) && (
                  <div className="flex items-center gap-2 self-end xl:self-center">
                    <button
                      id={`ap-status-inprogress-btn-${ap.id}`}
                      onClick={() => changeActionPlanStatus(ap.id, 'In Progress')}
                      className="px-3 py-1.5 text-[10px] border border-blue-500/20 text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 font-bold rounded-lg transition-colors"
                    >
                      {language === 'ar' ? 'البدء بالتنفيذ' : 'Start Progress'}
                    </button>
                    <button
                      id={`ap-status-complete-btn-${ap.id}`}
                      onClick={() => changeActionPlanStatus(ap.id, 'Completed')}
                      className="px-3 py-1.5 text-[10px] border border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 font-bold rounded-lg transition-colors"
                    >
                      {language === 'ar' ? 'إكمال المبادرة' : 'Resolve & Close'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
