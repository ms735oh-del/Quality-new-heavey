/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QualityReport } from '../types';
import {
  FileCheck,
  Save,
  Send,
  AlertTriangle,
  Award,
  BookOpen,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const SelfStudyFormView: React.FC = () => {
  const {
    language,
    reports,
    submitReport,
    programs,
    currentUser,
    actingRole,
    t
  } = useApp();

  // Pick first report as active for edit, or create a blank one
  const initialReport: QualityReport = reports[0] || {
    id: 'report-new',
    institutionId: '',
    title: 'Institutional Self-Study Dossier',
    arabicTitle: 'ملف تقرير الدراسة الذاتية للمؤسسة',
    type: 'Self-Evaluation',
    arabicType: 'تقييم ذاتي',
    authorId: currentUser.id,
    status: 'Draft',
    arabicStatus: 'مسودة',
    overallScore: 78,
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'sec-1',
        title: 'Mission & Objectives Alignment',
        arabicTitle: 'مواءمة الرسالة والأهداف',
        score: 80,
        feedback: 'Enter alignment analysis notes here...',
        arabicFeedback: 'أدخل ملاحظات تحليل المواءمة هنا...'
      },
      {
        id: 'sec-2',
        title: 'Curriculum & Program Learning Outcomes',
        arabicTitle: 'المناهج ومخرجات تعلم البرنامج',
        score: 75,
        feedback: 'Enter mapping and syllabus alignment review details...',
        arabicFeedback: 'أدخل تفاصيل مراجعة مواءمة المناهج والمخرجات...'
      },
      {
        id: 'sec-3',
        title: 'Student Assessment Quality',
        arabicTitle: 'جودة تقييم الطلاب',
        score: 82,
        feedback: 'Detail examination validity and grading matrices...',
        arabicFeedback: 'قم بتفصيل مدى صحة الامتحانات ومصفوفات الدرجات...'
      },
      {
        id: 'sec-4',
        title: 'Faculty Qualifications and Research Output',
        arabicTitle: 'مؤهلات هيئة التدريس والإنتاج البحثي',
        score: 70,
        feedback: 'Summary of publication citation counts and PhD rates...',
        arabicFeedback: 'ملخص لعدد الاستشهادات بالمطبوعات ومعدلات الدكتوراه...'
      }
    ]
  };

  const [activeReport, setActiveReport] = useState<QualityReport>(initialReport);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const currentSection = activeReport.sections[activeSectionIdx] || activeReport.sections[0];

  const handleScoreChange = (val: number) => {
    const updatedSections = activeReport.sections.map((sec, idx) => 
      idx === activeSectionIdx ? { ...sec, score: val } : sec
    );
    // Recalculate average score
    const avgScore = Math.round(updatedSections.reduce((acc, s) => acc + s.score, 0) / updatedSections.length);
    setActiveReport({
      ...activeReport,
      sections: updatedSections,
      overallScore: avgScore
    });
  };

  const handleFeedbackChange = (val: string) => {
    const updatedSections = activeReport.sections.map((sec, idx) => {
      if (idx === activeSectionIdx) {
        return language === 'ar' 
          ? { ...sec, arabicFeedback: val } 
          : { ...sec, feedback: val };
      }
      return sec;
    });
    setActiveReport({
      ...activeReport,
      sections: updatedSections
    });
  };

  const handleSaveDraft = () => {
    const updated: QualityReport = {
      ...activeReport,
      status: 'Draft',
      arabicStatus: 'مسودة',
      updatedAt: new Date().toISOString()
    };
    submitReport(updated);
    setActiveReport(updated);
    setSuccessMsg(t('serSavedSuccess'));
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleLockSubmit = () => {
    const updated: QualityReport = {
      ...activeReport,
      status: 'Submitted',
      arabicStatus: 'تم التقديم',
      updatedAt: new Date().toISOString()
    };
    submitReport(updated);
    setActiveReport(updated);
    setSuccessMsg(t('serSubmittedSuccess'));
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const isLocked = activeReport.status === 'Submitted' || activeReport.status === 'Approved';

  return (
    <div className="space-y-8 animate-fade-in" id="self-study-view-container">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
        <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
            <FileCheck className="w-7 h-7 text-indigo-500" />
            <span>{t('serTitle')}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">{t('serSubtitle')}</p>
        </div>

        {/* Action controls */}
        {!isLocked && ['Platform Admin', 'Institution Admin', 'Quality Manager', 'Program Coordinator', 'Lecturer'].includes(actingRole) && (
          <div className="flex items-center gap-2.5">
            <button
              id="ser-save-draft-btn"
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
            >
              <Save className="w-4 h-4" />
              <span>{t('saveDraft')}</span>
            </button>
            <button
              id="ser-submit-btn"
              onClick={handleLockSubmit}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/15 animate-pulse"
              style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
            >
              <Send className="w-4 h-4" />
              <span>{t('submitForAudit')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Trigger messages */}
      {successMsg && (
        <div id="ser-success-alert" className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Lock Warning banner */}
      {isLocked && (
        <div id="ser-locked-alert" className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs flex items-start gap-2">
          <Info className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">{t('submittedDisclaimer')}</p>
            <p className="opacity-85 text-[11px]">Audit trails lock was automatically placed. This document is under active review by assigned External Reviewers.</p>
          </div>
        </div>
      )}

      {/* Bento Grid: Overall Score Indicator and standard list */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Quality Standard List Checklist */}
        <div className="lg:col-span-1 space-y-3" id="ser-section-tabs">
          {/* Overall score card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-5 text-center shadow-md">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-300 block mb-2">
              {t('overallSerScore')}
            </span>
            <div className="text-4xl font-black font-mono tracking-tight text-white inline-block relative">
              <span>{activeReport.overallScore}</span>
              <span className="text-xs text-indigo-400 absolute bottom-1 -right-4 font-normal">/100</span>
            </div>
            {/* compliance gauge */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-indigo-400" style={{ width: `${activeReport.overallScore}%` }}></div>
            </div>
          </div>

          {/* Sections buttons */}
          <div className="space-y-2">
            {activeReport.sections.map((sec, idx) => {
              const isSelected = activeSectionIdx === idx;
              return (
                <button
                  key={sec.id}
                  id={`ser-sec-btn-${sec.id}`}
                  onClick={() => setActiveSectionIdx(idx)}
                  className={`w-full text-left p-4 rounded-lg border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
                >
                  <p className="font-bold truncate">{language === 'ar' ? sec.arabicTitle : sec.title}</p>
                  <div className="flex items-center justify-between mt-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      Score Segment:
                    </span>
                    <span className={`font-mono font-black ${isSelected ? 'text-white' : 'text-indigo-500'}`}>
                      {sec.score}/100
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editing criteria workspace */}
        <div className="lg:col-span-3" id="ser-section-workspace">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded">
                Section Standard Criteria {activeSectionIdx + 1}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-3">
                {language === 'ar' ? currentSection.arabicTitle : currentSection.title}
              </h3>
            </div>

            {/* Score rating input */}
            <div className="space-y-3" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
              <div className="flex items-center justify-between" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('sectionScore')}</label>
                <span className="text-sm font-mono font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-lg">
                  {currentSection.score} / 100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                disabled={isLocked}
                value={currentSection.score}
                onChange={e => handleScoreChange(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer disabled:opacity-50"
              />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Provide a realistic self-evaluation score mapping. Quality assurance audits require verified, auditable physical evidence matching this score.
              </p>
            </div>

            {/* Notes Feedback */}
            <div className="space-y-3" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('sectionFeedback')}</label>
              <textarea
                rows={6}
                disabled={isLocked}
                value={language === 'ar' ? (currentSection.arabicFeedback || '') : (currentSection.feedback || '')}
                onChange={e => handleFeedbackChange(e.target.value)}
                placeholder="Explanatory notes and lists of physical academic archives as verification evidence..."
                className="w-full text-xs p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 focus:outline-indigo-500 dark:text-white disabled:opacity-50 disabled:bg-slate-100"
              />
            </div>

            {/* Quick Helper card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg flex items-start gap-2.5 text-[11px] text-slate-500">
              <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">Self-Study Evidence Guidelines</p>
                <p className="mt-0.5 opacity-80 leading-relaxed">Ensure to list exact links or references to syllabi archives, meeting minutes, research citation reports, or student evaluation surveys to pass the external review visit without correction plans.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
