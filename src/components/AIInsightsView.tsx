/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ActionPlan } from '../types';
import {
  Sparkles,
  TrendingUp,
  Brain,
  Award,
  AlertTriangle,
  Users,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Layers,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

type FocusArea = 'overall' | 'curriculum' | 'risk-capa' | 'evaluations';

export const AIInsightsView: React.FC = () => {
  const {
    language,
    activeInstitution,
    actingRole,
    programs,
    kpis,
    riskItems,
    capaItems,
    tasks,
    addNewActionPlan,
    t
  } = useApp();

  const [focusArea, setFocusArea] = useState<FocusArea>('overall');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [insightsText, setInsightsText] = useState('');
  const [error, setError] = useState('');

  // Remediation Action Plan form state
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planTitleAr, setPlanTitleAr] = useState('');
  const [planRecommendation, setPlanRecommendation] = useState('');
  const [planRecommendationAr, setPlanRecommendationAr] = useState('');
  const [planResponsible, setPlanResponsible] = useState('');
  const [planResponsibleAr, setPlanResponsibleAr] = useState('');
  const [planDueDate, setPlanDueDate] = useState('');
  const [planPriority, setPlanPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [planProgramId, setPlanProgramId] = useState('');

  // Aggregate metrics to feed the AI context
  const totalProgramsCount = programs.length;
  const averageCompliance = programs.length > 0 
    ? Math.round(programs.reduce((acc, p) => acc + p.complianceRate, 0) / programs.length) 
    : 0;
  const averageSelfStudy = programs.length > 0 
    ? Math.round(programs.reduce((acc, p) => acc + p.selfStudyScore, 0) / programs.length) 
    : 0;
  const activeRisks = riskItems.filter(r => r.status !== 'Controlled').length;
  const pendingCapas = capaItems.filter(c => c.status !== 'Closed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;

  // Loading indicator messages to enhance UX
  const loadingStages = language === 'ar' 
    ? [
        'جارٍ سحب وتجميع مؤشرات أداء الجامعة والملفات الأكاديمية...',
        'جارٍ تغذية محرك الذكاء الاصطناعي بنطاق عزل بيانات المستأجر المعزول...',
        'جارٍ تشغيل خوارزمية تحليل الفجوات والامتثال للبرامج الدراسية...',
        'تحليل جودة هيئة التدريس وسير العمل التشغيلي للمؤسسة...',
        'صياغة التوصيات الاستراتيجية والمبادرات التصحيحية المقترحة...'
      ]
    : [
        'Fetching university KPI metrics and course files...',
        'Preparing contextual variables within secure tenant isolation space...',
        'Running compliance gap analysis across academic programs...',
        'Evaluating faculty metrics and operational risk matrices...',
        'Synthesizing strategic recommendations and corrective directives...'
      ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStage(prev => (prev + 1) % loadingStages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading, language]);

  // Initial fetch on mount or focus area change
  useEffect(() => {
    handleGenerateInsights();
  }, [focusArea, activeInstitution.id]);

  const handleGenerateInsights = async () => {
    setLoading(true);
    setLoadingStage(0);
    setError('');
    setInsightsText('');

    // Formulate a structured payload context of the current isolated tenant
    const contextPayload = {
      institution: {
        name: activeInstitution.name,
        accreditationStatus: activeInstitution.accreditationStatus,
        studentCount: activeInstitution.studentCount,
        facultyCount: activeInstitution.facultyCount,
      },
      metrics: {
        totalPrograms: totalProgramsCount,
        averageCompliance: `${averageCompliance}%`,
        averageSelfStudyScore: `${averageSelfStudy}/100`,
        activeRisksCount: activeRisks,
        pendingCapasCount: pendingCapas,
        pendingTasksCount: pendingTasks,
        kpis: kpis.map(k => ({ name: k.name, value: k.value, target: k.target, unit: k.unit }))
      },
      focusArea,
      actingRole,
      language
    };

    try {
      const response = await fetch('/api/ai/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceType: 'strategic-insights',
          payload: contextPayload
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setInsightsText(data.text || '');
    } catch (err: any) {
      console.error('Failed to generate AI insights:', err);
      setError(language === 'ar' 
        ? `فشل محرك الذكاء الاصطناعي في جلب التوصيات: ${err.message}` 
        : `AI Engine failed to fetch strategic recommendations: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Convert AI Recommendation into a real Action Plan
  const handleApplyActionPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle) return;

    addNewActionPlan({
      programId: planProgramId || (programs[0]?.id || 'prog-all'),
      title: planTitle,
      arabicTitle: planTitleAr || planTitle,
      recommendation: planRecommendation,
      arabicRecommendation: planRecommendationAr || planRecommendation,
      responsibleParty: planResponsible,
      arabicResponsibleParty: planResponsibleAr || planResponsible,
      dueDate: planDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
      status: 'Not Started',
      arabicStatus: 'لم تبدأ بعد',
      priority: planPriority
    });

    // Reset Form
    setPlanTitle('');
    setPlanTitleAr('');
    setPlanRecommendation('');
    setPlanRecommendationAr('');
    setPlanResponsible('');
    setPlanResponsibleAr('');
    setPlanDueDate('');
    setPlanPriority('Medium');
    setPlanProgramId('');
    setShowPlanForm(false);

    // Create system notification
    // AppContext adds notification automatically when calling addNewActionPlan
  };

  const autofillFromAI = () => {
    if (focusArea === 'overall') {
      setPlanTitle('Optimize Course Syllabus Mapping');
      setPlanTitleAr('تحسين مواءمة المناهج الدراسية');
      setPlanRecommendation('Address the curriculum syllabus compliance gaps identified in mechanical engineering courses.');
      setPlanRecommendationAr('معالجة فجوات امتثال المناهج الدراسية المحددة في مقررات الهندسة الميكانيكية.');
      setPlanResponsible('Dean of Engineering');
      setPlanResponsibleAr('عميد كلية الهندسة');
    } else if (focusArea === 'curriculum') {
      setPlanTitle('Align CS exam assessment methods');
      setPlanTitleAr('مواءمة أساليب تقييم اختبارات علوم الحاسب');
      setPlanRecommendation('Update direct mapping matrices for final exams to align with ABET qualification requirements.');
      setPlanRecommendationAr('تحديث مصفوفات المواءمة المباشرة للاختبارات النهائية لتتوافق مع متطلبات اعتماد ABET.');
      setPlanResponsible('CS Department Head');
      setPlanResponsibleAr('رئيس قسم علوم الحاسب');
    } else if (focusArea === 'risk-capa') {
      setPlanTitle('NCAAA Self-Study Auditing Acceleration');
      setPlanTitleAr('تسريع تدقيق ملفات التقييم الذاتي لـ NCAAA');
      setPlanRecommendation('Form a dedicated task force to review the pending Self-Study files ahead of scheduled site visits.');
      setPlanRecommendationAr('تشكيل فريق عمل مخصص لمراجعة ملفات الدراسة الذاتية المعلقة قبل زيارات التقييم المجدولة.');
      setPlanResponsible('Quality Office Coordinator');
      setPlanResponsibleAr('منسق مكتب الجودة');
    } else {
      setPlanTitle('Implement Student Engagement Seminars');
      setPlanTitleAr('تطبيق ورش عمل لتعزيز مشاركة الطلاب');
      setPlanRecommendation('Conduct office hours alignment and interactive feedback review with Level 4 instructors.');
      setPlanRecommendationAr('تنسيق الساعات المكتبية وإجراء مراجعة تفاعلية للملاحظات مع مدرسي المستوى الرابع.');
      setPlanResponsible('Dean of Student Affairs');
      setPlanResponsibleAr('عميد شؤون الطلاب');
    }
    setPlanDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  };

  // Custom regular-expression based markdown parser to guarantee beautiful, safe formatting without dependency conflicts
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded"></span>
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-lg font-extrabold text-slate-900 dark:text-white mt-6 mb-3 border-b border-slate-100 dark:border-slate-850 pb-1">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-xl font-black text-slate-900 dark:text-white mt-7 mb-4">
            {line.replace('# ', '')}
          </h2>
        );
      }
      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const cleanContent = line.substring(2);
        return (
          <li key={idx} className="text-sm text-slate-600 dark:text-slate-350 ml-5 list-disc my-1.5 leading-relaxed">
            {renderInlineFormatting(cleanContent)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const cleanContent = line.replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="text-sm text-slate-600 dark:text-slate-350 ml-5 list-decimal my-1.5 leading-relaxed">
            {renderInlineFormatting(cleanContent)}
          </li>
        );
      }
      // Spacing
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      // General paragraph
      return (
        <p key={idx} className="text-sm text-slate-600 dark:text-slate-350 my-2 leading-relaxed">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  const renderInlineFormatting = (line: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-extrabold text-slate-900 dark:text-white">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? parts : line;
  };

  return (
    <div className="space-y-8 animate-fade-in" id="ai-insights-view-container">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
        <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
          <div className="flex items-center gap-2 mb-1.5" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
            <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">
              Google Gemini Powered
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'ar' ? 'التحليلات الاستشارية الذكية' : 'AI Strategic Insights Engine'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {language === 'ar'
              ? 'توليد مبادرات وتوصيات استراتيجية في الوقت الفعلي لضمان مواءمة الاعتمادات، وحل الفجوات الأكاديمية والمخاطر التشغيلية.'
              : 'Synthesizing real-time strategic directives and compliance remedial initiatives to ensure robust program accreditation and quality levels.'}
          </p>
        </div>

        <button
          onClick={handleGenerateInsights}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/55 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/15 transition-all self-start md:self-center font-mono"
          style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{language === 'ar' ? 'إعادة تحليل البيانات وتوليد' : 'Re-Generate Strategic Insights'}</span>
        </button>
      </div>

      {/* Focus Areas Toggles */}
      <div className="flex gap-2 p-1 bg-slate-150/50 dark:bg-slate-950/40 rounded-xl max-w-2xl border border-slate-200/50 dark:border-slate-850/50" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
        {[
          { id: 'overall', label: language === 'ar' ? 'الأداء العام' : 'Overall Performance', icon: Award },
          { id: 'curriculum', label: language === 'ar' ? 'تطابق المناهج' : 'Curriculum Audit', icon: Layers },
          { id: 'risk-capa', label: language === 'ar' ? 'المخاطر والـ CAPA' : 'Operational Risks', icon: AlertTriangle },
          { id: 'evaluations', label: language === 'ar' ? 'آراء واستبيانات' : 'Feedback & Ratings', icon: Users }
        ].map(area => {
          const Icon = area.icon;
          const isActive = focusArea === area.id;
          return (
            <button
              key={area.id}
              onClick={() => setFocusArea(area.id as FocusArea)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold border border-slate-200/50 dark:border-slate-800'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{area.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: KPI Academic Context Summary */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-150 dark:border-slate-850" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
              <Layers className="w-4.5 h-4.5 text-blue-600" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                {language === 'ar' ? 'البيانات المغذية للذكاء الاصطناعي' : 'Active Context Feeds'}
              </h4>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <span className="text-slate-400 font-medium">{language === 'ar' ? 'المستأجر النشط' : 'Active Tenant'}</span>
                <span className="font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                  {language === 'ar' ? activeInstitution.arabicName : activeInstitution.name}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <span className="text-slate-400 font-medium">{language === 'ar' ? 'البرامج الدراسية' : 'Academic Programs'}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">{totalProgramsCount}</span>
              </div>

              <div className="flex items-center justify-between text-xs" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <span className="text-slate-400 font-medium">{language === 'ar' ? 'متوسط الامتثال' : 'Average Compliance'}</span>
                <span className="font-mono font-bold text-emerald-500">{averageCompliance}%</span>
              </div>

              <div className="flex items-center justify-between text-xs" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <span className="text-slate-400 font-medium">{language === 'ar' ? 'درجة التقييم الذاتي' : 'Average SER Score'}</span>
                <span className="font-mono font-bold text-indigo-500">{averageSelfStudy}/100</span>
              </div>

              <div className="flex items-center justify-between text-xs" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <span className="text-slate-400 font-medium">{language === 'ar' ? 'المخاطر غير المسيطر عليها' : 'Active Operations Risks'}</span>
                <span className="font-mono font-bold text-amber-500">{activeRisks}</span>
              </div>

              <div className="flex items-center justify-between text-xs" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <span className="text-slate-400 font-medium">{language === 'ar' ? 'إجراءات CAPA المعلقة' : 'Pending CAPA Items'}</span>
                <span className="font-mono font-bold text-blue-500">{pendingCapas}</span>
              </div>

              <div className="flex items-center justify-between text-xs" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <span className="text-slate-400 font-medium">{language === 'ar' ? 'المهام المعلقة' : 'Pending Tasks'}</span>
                <span className="font-mono font-bold text-red-400">{pendingTasks}</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-150 dark:border-slate-850 text-[11px] text-slate-400 leading-relaxed" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
              <div className="flex items-center gap-1 text-slate-500 font-bold mb-1" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'ar' ? 'مبدأ عزل البيانات الآمن' : 'Compliance Isolation Integrity'}</span>
              </div>
              {language === 'ar'
                ? 'يتم تغذية محرك الذكاء الاصطناعي بالمؤشرات الإحصائية العامة والترتيبية فقط داخل خادم معزول. تظل المفاتيح الأمنية والأسماء الصريحة مشفرة تماماً.'
                : 'Only anonymized high-level telemetry and KPI scores are sent. Absolute cryptographic separation of keys and records is enforced server-side.'}
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-md relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-32 h-32 rotate-12" />
            </div>
            <div className="relative z-10 space-y-3" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
              <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-sm inline-block">
                {language === 'ar' ? 'ربط التوصية بالواقع' : 'Actionable Alignment'}
              </span>
              <h4 className="font-black text-base leading-snug">
                {language === 'ar' ? 'تحويل توصيات الذكاء الاصطناعي إلى خطة عمل' : 'Remediation Workflow Panel'}
              </h4>
              <p className="text-xs text-white/80 leading-relaxed">
                {language === 'ar'
                  ? 'قم بنقل التوصية الاستشارية بنقرة واحدة لتسجيل خطة تصحيحية تشغيلية حقيقية للجامعة فوراً.'
                  : 'Instantly convert any dynamic AI strategic insight into a real remedial action plan on your database, assigning resources and deadlines.'}
              </p>
              <button
                onClick={() => {
                  autofillFromAI();
                  setShowPlanForm(true);
                }}
                className="w-full bg-white hover:bg-slate-50 text-blue-600 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm font-mono"
                style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'صياغة خطة عمل علاجية' : 'Create Action Plan'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Suggestions Content Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Plan Form Modal/Slide Down */}
          {showPlanForm && (
            <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-5 shadow-lg space-y-4 animate-fade-in" id="action-plan-form-container">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                  <PlusCircle className="w-4.5 h-4.5 text-blue-500" />
                  <span>{language === 'ar' ? 'إنشاء مبادرة علاجية حقيقية' : 'Create Institutional Remediation Initiative'}</span>
                </h3>
                <button
                  onClick={() => setShowPlanForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>

              <form onSubmit={handleApplyActionPlan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      {language === 'ar' ? 'اسم المبادرة (English)' : 'Remediation Title (English)'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Conduct CS Syllabus Alignment"
                      value={planTitle}
                      onChange={e => setPlanTitle(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      {language === 'ar' ? 'اسم المبادرة (العربية)' : 'Remediation Title (Arabic)'}
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: إجراء موائمة شاملة لمنهج الحاسب"
                      value={planTitleAr}
                      onChange={e => setPlanTitleAr(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      {language === 'ar' ? 'التوصية الأصلية (English)' : 'Auditor Recommendation (English)'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Detail the advice or requirement..."
                      value={planRecommendation}
                      onChange={e => setPlanRecommendation(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      {language === 'ar' ? 'التوصية الأصلية (العربية)' : 'Auditor Recommendation (Arabic)'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder="تفاصيل التوصية المحددة باللغة العربية..."
                      value={planRecommendationAr}
                      onChange={e => setPlanRecommendationAr(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      {language === 'ar' ? 'المسؤول (English)' : 'Officer Responsible (English)'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Head of CS Department"
                      value={planResponsible}
                      onChange={e => setPlanResponsible(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      {language === 'ar' ? 'المسؤول (العربية)' : 'Officer Responsible (Arabic)'}
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: رئيس قسم علوم الحاسب"
                      value={planResponsibleAr}
                      onChange={e => setPlanResponsibleAr(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      {language === 'ar' ? 'البرنامج المستهدف' : 'Target Program'}
                    </label>
                    <select
                      value={planProgramId}
                      onChange={e => setPlanProgramId(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    >
                      <option value="">{language === 'ar' ? '--- اختر البرنامج الأكاديمي ---' : '--- Select Target Program ---'}</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {language === 'ar' ? p.arabicName : p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      {language === 'ar' ? 'تاريخ الاستحقاق' : 'Target Deadline'}
                    </label>
                    <input
                      type="date"
                      required
                      value={planDueDate}
                      onChange={e => setPlanDueDate(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      {language === 'ar' ? 'مستوى الأولوية' : 'Priority Level'}
                    </label>
                    <select
                      value={planPriority}
                      onChange={e => setPlanPriority(e.target.value as any)}
                      className="w-full text-xs p-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    >
                      <option value="High">High / عالية</option>
                      <option value="Medium">Medium / متوسطة</option>
                      <option value="Low">Low / منخفضة</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setShowPlanForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    {language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all"
                  >
                    {language === 'ar' ? 'حفظ وإدراج الخطة العلاجية' : 'Commit Action Remediation'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* AI Insights Display Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
            {/* Header / Meta */}
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
              <div className="flex items-center gap-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <Brain className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                  {focusArea === 'overall' && (language === 'ar' ? 'تحليل الأداء العام للجامعة' : 'Overall Institutional Evaluation')}
                  {focusArea === 'curriculum' && (language === 'ar' ? 'تحليل ومواءمة المناهج والمقررات' : 'Curriculum alignment evaluation')}
                  {focusArea === 'risk-capa' && (language === 'ar' ? 'تحليل مصفوفة المخاطر والإجراءات العلاجية' : 'Operations Risk & CAPA Metrics')}
                  {focusArea === 'evaluations' && (language === 'ar' ? 'ملخص تقارير آراء الطلاب والتقييمات' : 'Evaluations & Student feedback analysis')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-slate-400">Gemini-3.5-flash</span>
              </div>
            </div>

            {/* Content Box */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin"></div>
                    <div className="absolute inset-2.5 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
                  </div>
                  <div className="text-center max-w-sm space-y-2">
                    <p className="text-xs text-slate-400 font-mono font-medium animate-pulse">
                      {loadingStages[loadingStage]}
                    </p>
                    <p className="text-[11px] text-slate-350 italic">
                      {language === 'ar' ? 'يرجى الانتظار، يجري الاتصال بخوادم غوغل الآمنة...' : 'Connecting safely to secure Google Cloud services...'}
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-5 flex items-start gap-3 my-8">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">{language === 'ar' ? 'خطأ في معالجة الذكاء الاصطناعي' : 'AI Engine Failure'}</p>
                    <p>{error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  {/* Generated Text */}
                  <div 
                    className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 transition-all duration-300"
                    style={{ textAlign: language === 'ar' ? 'right' : 'left', direction: language === 'ar' ? 'rtl' : 'ltr' }}
                  >
                    {renderMarkdown(insightsText)}
                  </div>

                  {/* Operational Sync Row */}
                  <div className="mt-8 pt-6 border-t border-slate-150 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20 -mx-6 -mb-6 p-6" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                    <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {language === 'ar' ? 'توصيات ذكية قابلة للتنفيذ' : 'Actionable Recommendations Detected'}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {language === 'ar'
                          ? 'يمكنك تطبيق هذه التوصية في جدول خطط العمل الأكاديمية تلقائياً.'
                          : 'This advice is structured for compliance. Commit to standard remediation ledger.'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        autofillFromAI();
                        setShowPlanForm(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm font-mono"
                      style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تحويل التوصية لخطة علاجية' : 'Apply Remediation Initiative'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
