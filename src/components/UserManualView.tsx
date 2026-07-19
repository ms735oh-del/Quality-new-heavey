/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, FileText, Download, Printer, User, PlusCircle, 
  Trash2, Star, CheckCircle, Shield, AlertTriangle, ChevronRight, 
  ArrowRight, Search, FileDown, BookOpenCheck
} from 'lucide-react';
import { jsPDF } from 'jspdf';

type TabSection = 'overview' | 'roles' | 'actions-add' | 'actions-delete' | 'actions-evaluate' | 'export-center';

export const UserManualView: React.FC = () => {
  const { language, actingRole } = useApp();
  const [activeSec, setActiveSec] = useState<TabSection>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isAr = language === 'ar';

  const handleDownloadPDF = () => {
    try {
      // Create jsPDF instance
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Simple, beautiful high-fidelity text-only structural PDF generation
      // AURA SaaS Standard Layout
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(26, 54, 93); // Dark slate blue
      doc.text('AURA SaaS Academic Quality Platform', 20, 25);
      
      doc.setFontSize(14);
      doc.setTextColor(74, 85, 104);
      doc.text('Complete Operational Guide & User Manual', 20, 33);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 38, 190, 38);

      // Section 1: Intro
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(43, 108, 176);
      doc.text('1. Platform Overview', 20, 48);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(45, 55, 72);
      const introText = 'AURA is an enterprise-grade full-stack Academic Quality Assurance & Accreditation platform. It bridges institutional metadata, course file audits, Self-Evaluation reports (SER), site visits, and operational remediation action plans into a single secure workspace with role-based access control (RBAC).';
      const introLines = doc.splitTextToSize(introText, 170);
      doc.text(introLines, 20, 54);

      // Section 2: Roles & RBAC
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(43, 108, 176);
      doc.text('2. User Roles & Access Rights', 20, 75);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(45, 55, 72);
      const rolesDetails = [
        '* Super & Platform Admin: Universal access. Can manage tenants, view audit logs, adjust global configurations, and reset datasets.',
        '* Institution Admin & Quality Manager: Directs quality reviews. Can add academic structures, assign coordinators, and update SER benchmarks.',
        '* Deans & Dept Heads: Reviews college portfolios. Approves syllabi, inspects courses, and audits compliance metrics.',
        '* Program Coordinators & Lecturers: Modifies specific courses, uploads self-study narratives, and inputs survey metrics.',
        '* External Reviewers: Conducts site audits, adds CAPA directives, and rates final SER portfolios.'
      ];
      let yOffset = 82;
      rolesDetails.forEach(line => {
        const splitLine = doc.splitTextToSize(line, 170);
        doc.text(splitLine, 20, yOffset);
        yOffset += (splitLine.length * 5);
      });

      // Section 3: Core Operations
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(43, 108, 176);
      doc.text('3. Detailed Workflows: Add, Delete & Evaluate', 20, yOffset + 5);
      yOffset += 11;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(26, 54, 93);
      doc.text('A. HOW TO ADD RECORDS:', 20, yOffset);
      yOffset += 5;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(45, 55, 72);
      const addWorkflowText = 'To register new structures (Faculties, Departments, Lecturers, Students, Courses), navigate to the "Academics Directory" tab. Under each corresponding sub-tab, click on the primary colored action button (e.g. "+ Add Lecturer" or "+ Register Program"). Complete the required localized English/Arabic forms and submit. High priority action plans can also be added directly under "Operations & Risk" or auto-generated inside the "AI Strategic Insights" tab.';
      const addLines = doc.splitTextToSize(addWorkflowText, 170);
      doc.text(addLines, 20, yOffset);
      yOffset += (addLines.length * 5) + 3;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(26, 54, 93);
      doc.text('B. HOW TO DELETE RECORDS:', 20, yOffset);
      yOffset += 5;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(45, 55, 72);
      const deleteWorkflowText = 'Deletion is strictly governed by RBAC permissions. Platform Admins and Institution Quality leads can delete records by clicking the red "Trash Icon" on corresponding datagrids within the "Academics Directory". Every single deletion is securely logged with timestamps, operator IP, and detailed description in the "Security Audit Logs" ledger.';
      const deleteLines = doc.splitTextToSize(deleteWorkflowText, 170);
      doc.text(deleteLines, 20, yOffset);
      yOffset += (deleteLines.length * 5) + 3;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(26, 54, 93);
      doc.text('C. HOW TO EVALUATE & RATE:', 20, yOffset);
      yOffset += 5;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(45, 55, 72);
      const evalWorkflowText = '1. Syllabus Approval: Navigate to "Quality Review", open the respective program, locate the course, and select "Approve Syllabus" or "Request Revision".\n2. Self-Study (SER): Navigate to "Self-Evaluation (SER)". Rate each criterion from 1-100, insert your feedback, and click "Save Draft" or lock-submit "Submit to Board".\n3. External Audit: Reviewers can grade program dossiers and issue remedial CAPA recommendations.';
      const evalLines = doc.splitTextToSize(evalWorkflowText, 170);
      doc.text(evalLines, 20, yOffset);

      // Save PDF
      doc.save('AURA_Complete_User_Manual.pdf');
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF Generation Failed', err);
    }
  };

  const handlePrintManual = () => {
    window.print();
  };

  // Content databases based on search
  const guideSections = [
    {
      id: 'overview',
      titleEn: '1. Platform Core Overview',
      titleAr: '1. نظرة عامة على جوهر المنصة',
      contentEn: 'AURA Quality SaaS is designed to provide high-fidelity automation and tracking for academic reviews. It features Multi-Tenant Isolation, absolute role separation, real-time analytics dashboards, and interactive audits.',
      contentAr: 'تم تصميم منصة AURA Quality SaaS لتوفر أتمتة وتتبعاً فائق الدقة لعمليات التقييم الأكاديمي. تتميز المنصة بعزل آمن للبيانات، وفصل مطلق للأدوار والمهام، ولوحات تحكم تفاعلية في الوقت الفعلي.'
    },
    {
      id: 'roles',
      titleEn: '2. User Roles & RBAC Matrix',
      titleAr: '2. أدوار المستخدمين ومصفوفة الصلاحيات (RBAC)',
      contentEn: 'Our system enforces strict Role-Based Access Control (RBAC). A user in the platform can switch their acting role from the sidebar to test permissions. Only Admins can modify global structural directories.',
      contentAr: 'تطبق المنصة نظاماً صارماً للتحكم في الصلاحيات بناءً على الأدوار. يمكن للمستخدم تبديل دوره التشغيلي في النظام من شريط القوائم الجانبي لتجربة الصلاحيات المختلفة. يمتلك مسؤولو النظام فقط الصلاحيات الكاملة لإجراء التعديلات الهيكلية الكلية.'
    },
    {
      id: 'add',
      titleEn: '3. How to ADD University Records',
      titleAr: '3. كيفية إضافة سجلات جامعية جديدة',
      contentEn: 'Navigate to "Academics Directory". Select the sub-tab (Faculties, Departments, Lecturers, Students, Programs, Courses) and click "+ Add". Complete the required modal form in English and Arabic. Your additions will be securely persisted and indexed instantly.',
      contentAr: 'توجه إلى "دليل الكليات والمساقات". اختر التبويب الفرعي المطلوب (الكليات، الأقسام، المدرسون، الطلاب، البرامج، المساقات) ثم انقر على زر "+ إضافة". املأ حقول النموذج باللغتين العربية والإنجليزية. سيتم حفظ وإدراج الإضافات الجديدة فوراً وتحديث المؤشرات.'
    },
    {
      id: 'delete',
      titleEn: '4. How to DELETE and Archive Data',
      titleAr: '4. كيفية حذف وأرشفة البيانات التشغيلية',
      contentEn: 'To delete structures, programs, or courses, authorized roles can click the red "Trash Icon" on corresponding datagrids inside the "Academics Directory". Deletions generate automated security logs securely tracked in the audit trail ledger to preserve data lineage.',
      contentAr: 'لحذف الكليات أو الأقسام أو المدرسين أو الطلاب، يمكن للأدوار المصرح لها النقر على "أيقونة السلة" الحمراء بجانب السجل في لوحة "دليل الكليات والمساقات". تولد عمليات الحذف سجلاً أمنياً مؤتمتاً في "سجل التدقيق الأمني" لضمان الشفافية وتتبع الأثر.'
    },
    {
      id: 'evaluate',
      titleEn: '5. How to Conduct EVALUATIONS & Syllabus Approvals',
      titleAr: '5. كيفية التقييم والموافقة وإسناد الدرجات للأقسام والبرامج الأكاديمية',
      contentEn: '1. Syllabus Approval: Under "Quality Review", click a program and toggle specific course portfolios to Approved or Needs Revision.\n2. Self-Evaluation: Under "Self-Evaluation (SER)", rate each standard (1-100), log evidence, and click Save or lock-submit.\n3. External Audits: Reviewers can log CAPA action plans directly.',
      contentAr: '1. مواءمة المناهج: من تبويب "التقييمات وضمان الجودة"، اضغط على البرنامج وحدد المقررات لتغيير حالتها إلى "معتمد" أو "يتطلب تعديل".\n2. التقييم الذاتي (SER): في تبويب "الدراسة الذاتية"، أسند درجات (0-100) لكل محور، وثق الأدلة والملاحظات، ثم احفظ كمسودة أو أرسل للاعتماد النهائي.\n3. التقييمات الخارجية: يسجل المراجع الخارجي خطط العمل التصحيحية (CAPA) مباشرة لمواجهة الفجوات.'
    }
  ];

  const filteredGuides = guideSections.filter(g => {
    const q = searchQuery.toLowerCase();
    return g.titleEn.toLowerCase().includes(q) || 
           g.titleAr.includes(q) || 
           g.contentEn.toLowerCase().includes(q) || 
           g.contentAr.includes(q);
  });

  return (
    <div className="space-y-8 animate-fade-in" id="user-manual-view-container">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <div style={{ textAlign: isAr ? 'right' : 'left' }}>
          <div className="flex items-center gap-2 mb-1.5" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">
              {isAr ? 'دليل تشغيل النظام المعتمد' : 'System Operational Standard Manual'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isAr ? 'دليل الاستخدام والتشغيل المتكامل' : 'Interactive User Manual & Guides'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {isAr 
              ? 'مستند تشغيلي رسمي يغطي مصفوفة الصلاحيات، كيفية إدارة وإضافة وحذف الكيانات، وإجراء تقييمات مواءمة المناهج والدراسة الذاتية.'
              : 'Official training blueprint documenting RBAC matrices, data administration workflows (add/delete), curriculum mapping approvals, and self-evaluation score structures.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handlePrintManual}
            className="flex items-center justify-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold rounded-xl shadow-sm transition-all font-mono"
            style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isAr ? 'طباعة الدليل الورقي' : 'Print Manual'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 transition-all font-mono"
            style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تنزيل الدليل بصيغة PDF' : 'Download Manual (PDF)'}</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold p-3 rounded-xl flex items-center justify-between" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <span>
            {isAr 
              ? '✓ تم تجميع وتصدير ملف الـ PDF بنجاح! يبدأ التنزيل تلقائياً في المتصفح.' 
              : '✓ PDF manual generated and compiled successfully! Download started in browser.'}
          </span>
          <button onClick={() => setDownloadSuccess(false)} className="text-[10px] underline">
            {isAr ? 'تجاهل' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Grid: Search and Layout splits */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Index Navigation Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder={isAr ? 'ابحث في محاور الدليل...' : 'Search manual index...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                style={{ textAlign: isAr ? 'right' : 'left', paddingRight: isAr ? '2rem' : '0.75rem', paddingLeft: isAr ? '0.75rem' : '2rem' }}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5" style={{ left: isAr ? 'auto' : '0.75rem', right: isAr ? '0.75rem' : 'auto' }} />
            </div>

            <div className="space-y-1">
              {[
                { id: 'overview', labelEn: 'Overview & Standard', labelAr: 'نظرة عامة والنموذج', icon: BookOpen },
                { id: 'roles', labelEn: 'Roles & RBAC permissions', labelAr: 'الصلاحيات وتوزيع الأدوار', icon: Shield },
                { id: 'actions-add', labelEn: 'How to ADD Data', labelAr: 'خطوات إضافة السجلات', icon: PlusCircle },
                { id: 'actions-delete', labelEn: 'How to DELETE Data', labelAr: 'طريقة حذف وأرشفة السجلات', icon: Trash2 },
                { id: 'actions-evaluate', labelEn: 'How to EVALUATE Quality', labelAr: 'كيفية التقييم وإسناد الدرجات', icon: Star },
                { id: 'export-center', labelEn: 'Official PDF Export Center', labelAr: 'مركز طباعة التقارير والـ PDF', icon: FileDown },
              ].map(sec => {
                const Icon = sec.icon;
                const isActive = activeSec === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSec(sec.id as TabSection);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{isAr ? sec.labelAr : sec.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850" style={{ textAlign: isAr ? 'right' : 'left' }}>
            <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1 flex items-center gap-1.5" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isAr ? 'عن صلاحيات دورك النشط' : 'Your Active Role Authority'}</span>
            </h5>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {isAr 
                ? `أنت تشغل حالياً دور: (${actingRole}). يمكنك مراجعة دليل الاستخدام المخصص لدورك والتحقق من الصلاحيات الممنوحة من تبويب الصلاحيات.` 
                : `You are currently acting as: (${actingRole}). Check your assigned role guides and test actions on responsive tables.`}
            </p>
          </div>
        </div>

        {/* Right Side: Detailed Guideline Canvas */}
        <div className="lg:col-span-3 space-y-6">

          {/* Search Result Overlay */}
          {searchQuery && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider font-mono" style={{ textAlign: isAr ? 'right' : 'left' }}>
                {isAr ? `نتائج البحث عن (${searchQuery})` : `Search results for (${searchQuery})`}
              </h3>
              {filteredGuides.length === 0 ? (
                <p className="text-xs text-slate-400 py-4" style={{ textAlign: isAr ? 'right' : 'left' }}>
                  {isAr ? 'لا توجد نتائج مطابقة لبحثك في فهارس الدليل.' : 'No matched sections found in the manual index.'}
                </p>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredGuides.map(g => (
                    <div key={g.id} className="pt-4 first:pt-0 space-y-2" style={{ textAlign: isAr ? 'right' : 'left' }}>
                      <h4 className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                        {isAr ? g.titleAr : g.titleEn}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {isAr ? g.contentAr : g.contentEn}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!searchQuery && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
              
              {/* Tab section 1: Overview */}
              {activeSec === 'overview' && (
                <div className="space-y-6" style={{ textAlign: isAr ? 'right' : 'left' }}>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-150 dark:border-slate-850" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-black text-lg text-slate-900 dark:text-white">
                      {isAr ? 'نظرة عامة والنموذج القياسي للجودة' : 'Overview & System Blueprint'}
                    </h2>
                  </div>

                  <div className="prose dark:prose-invert text-xs text-slate-500 leading-relaxed space-y-4">
                    <p>
                      {isAr 
                        ? 'منصة AURA هي نظام برامجي متكامل لإدارة جودة التعليم العالي والحصول على الاعتمادات الأكاديمية (مثل اعتماد هيئة تقويم التعليم والتدريب NCAAA والاعتمادات الدولية ABET). يقوم النظام بتبسيط الإجراءات الورقية وتحويلها إلى لوحات تحكم تفاعلية متكاملة.' 
                        : 'AURA Quality SaaS is an enterprise-grade platform built specifically for higher education. It streamlines course reviews, compliance trackers, self-evaluation reports (SER), and corrective action plans (CAPA) into an integrated cloud experience.'}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase font-mono">{isAr ? 'عزل المستأجر الآمن' : 'Secure Multi-Tenancy'}</span>
                        <p className="text-[10px] text-slate-400">
                          {isAr ? 'بيانات الجامعة وتصنيفاتها تدار بخوادم معزولة تفصل مفاتيح الحماية والملفات الحساسة بالكامل.' : 'All data, metrics, and documents are securely sandboxed. Institutional separation is enforced at the database levels.'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase font-mono">{isAr ? 'مؤشرات الأداء (KPI)' : 'Academic KPI Analytics'}</span>
                        <p className="text-[10px] text-slate-400">
                          {isAr ? 'مزامنة مستمرة لمعدلات المواءمة، تقييمات المقررات والطلاب، ونسب اجتياز المعايير مع رسوم بيانية.' : 'Provides instant progress bars, radar charts, and comparative analytics across campuses.'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase font-mono">{isAr ? 'تحليل ذكي بالفلاش' : 'Gemini AI Insights'}</span>
                        <p className="text-[10px] text-slate-400">
                          {isAr ? 'تحليل ثنائي اللغة يكتشف فجوات الاعتماد ويولد توصيات علاجية قابلة للحفظ في قاعدة البيانات بنقرة واحدة.' : 'Securely scans current performance and creates actionable remedial action plans dynamically.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab section 2: Roles */}
              {activeSec === 'roles' && (
                <div className="space-y-6" style={{ textAlign: isAr ? 'right' : 'left' }}>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-150 dark:border-slate-850" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                    <Shield className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-black text-lg text-slate-900 dark:text-white">
                      {isAr ? 'مصفوفة الأدوار والصلاحيات (RBAC)' : 'User Role Authority & Access Matrix'}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isAr
                        ? 'تعتمد المنصة تصنيفاً هرمياً للمستخدمين للتحكم في قراءة وكتابة وتعديل البيانات وحالة الملفات. يمكنك تبديل دورك الحالي من القائمة الجانبية لتجربة الواجهة المخصصة لكل دور.'
                        : 'AURA enforces strict Role-Based Access Control (RBAC). Use the role swapper in the sidebar to simulate individual workflows and view dynamic tab permissions.'}
                    </p>

                    <div className="space-y-3">
                      {[
                        { role: 'Super & Platform Admin', descEn: 'Absolute authority. Can view/delete all data, manage tenants, inspect technical API keys, and access complete security audit trail logs.', descAr: 'صلاحية مطلقة. تتيح إدارة مستودعات البيانات والتبديل بين الجامعات، مراجعة سجلات الأمان، وتكوين المطورين والـ API.' },
                        { role: 'Institution Admin & Quality Manager', descEn: 'Quality leaders. Controls internal auditing. Can register new colleges, departments, add programs, and set Self-Study score metrics.', descAr: 'قادة الجودة. يديرون العمليات التشغيلية، يسجلون برامج جديدة، ويعدلون مصفوفات تقييم معايير الاعتماد.' },
                        { role: 'Dean & Department Head', descEn: 'College leadership. Reviews and approves course syllabi. Monitors faculty compliance indices, students ratings, and manages program portfolios.', descAr: 'قيادات الكلية والأقسام. يقومون بمراجعة المناهج الدراسية وإصدار قرارات الاعتماد أو طلب التعديل، ومتابعة الطلاب والمدرسين.' },
                        { role: 'Program Coordinator & Lecturer', descEn: 'Course owners. Can upload course portfolios, write self-study narratives, and view action plans assigned to their departments.', descAr: 'منسقو البرامج وأعضاء التدريس. يمكنهم تحديث ملفات المقررات ومتابعة خطط العمل العلاجية الموكلة إليهم.' },
                        { role: 'External Reviewer', descEn: 'Independent academic auditors. Can evaluate self-study dossiers (SER) and log corrective CAPA recommendations during active site visits.', descAr: 'المقيمون الخارجيون. يمكنهم تقييم ومراجعة ملفات الدراسة الذاتية وإضافة خطط تصحيحية وتوصيات الزيارة الميدانية.' }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-1">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.role}</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {isAr ? item.descAr : item.descEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab section 3: Actions - Add */}
              {activeSec === 'actions-add' && (
                <div className="space-y-6" style={{ textAlign: isAr ? 'right' : 'left' }}>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-150 dark:border-slate-850" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                    <PlusCircle className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-black text-lg text-slate-900 dark:text-white">
                      {isAr ? 'دليل خطوة بخطوة: كيفية إضافة سجلات جديدة' : 'Detailed Guide: How to Add Platform Records'}
                    </h2>
                  </div>

                  <div className="space-y-5 text-xs text-slate-500 leading-relaxed">
                    <p>
                      {isAr
                        ? 'يوفر النظام إضافة سريعة ومنسقة بمختلف المستويات الأكاديمية والتشغيلية لدعم جودة البيانات:'
                        : 'AURA streamlines creating records with multi-language validation forms. Follow these structured steps to add new content:'}
                    </p>

                    <div className="space-y-4">
                      <div className="flex gap-3" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                        <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-[11px] font-mono">1</div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 dark:text-white">{isAr ? 'إضافة كيانات الكلية والأقسام والمدرسين' : 'Adding Academic Structures'}</h4>
                          <p className="text-[11px] text-slate-400">
                            {isAr
                              ? 'انتقل إلى تبويب "دليل الكليات والمساقات"، اختر التبويب الفرعي المطلوب (مثل المدرسون أو الطلاب أو الكليات)، وانقر فوق الزر الأزرق "+ إضافة" لفتح النموذج المزدوج (عربي/إنجليزي).'
                              : 'Go to "Academics Directory", select the targeted tab (e.g., Lecturers or Students) and click the primary "+ Add" button to open the bilingual metadata modal.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                        <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-[11px] font-mono">2</div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 dark:text-white">{isAr ? 'تسجيل البرامج الأكاديمية والمساقات الدراسية' : 'Registering Programs and Courses'}</h4>
                          <p className="text-[11px] text-slate-400">
                            {isAr
                              ? 'يمكنك تسجيل البرامج من دليل الكليات أو مباشرة عبر لوحة "التقييمات وضمان الجودة" من خلال النقر على "+ تسجيل برنامج أكاديمي جديد". بعد حفظ البرنامج، اضغط عليه لعرض المساقات وإضافة موديول دراسي جديد.'
                              : 'In "Academics Directory" under Programs or via "Evaluations & Standards", click "+ Register Program". Once created, click on the program card to add individual course modules and details.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                        <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-[11px] font-mono">3</div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 dark:text-white">{isAr ? 'إضافة خطط العمل العلاجية والـ CAPA' : 'Creating Remediation CAPA Plans'}</h4>
                          <p className="text-[11px] text-slate-400">
                            {isAr
                              ? 'يمكن للمستخدمين المصرح لهم (المراجع الخارجي، مدير الجودة) إضافة بنود علاجية تحت لوحة "العمليات والمخاطر" أو تحويل توصية ذكية مولدة بالذكاء الاصطناعي بنقرة واحدة من تبويب "التحليلات الاستشارية الذكية".'
                              : 'Log plans directly under "Operations & Risk" or auto-fill via "AI Strategic Insights" using the single-click directive converter.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab section 4: Actions - Delete */}
              {activeSec === 'actions-delete' && (
                <div className="space-y-6" style={{ textAlign: isAr ? 'right' : 'left' }}>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-150 dark:border-slate-850" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                    <Trash2 className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-black text-lg text-slate-900 dark:text-white">
                      {isAr ? 'دليل خطوة بخطوة: كيفية حذف البيانات وسجلات النظام' : 'Detailed Guide: How to Delete University Records'}
                    </h2>
                  </div>

                  <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
                    <p>
                      {isAr
                        ? 'تعتبر عمليات الحذف في المنصة عمليات حساسة وتخضع لمعايير صارمة لحماية تكامل البيانات والتدقيق الأكاديمي:'
                        : 'Deletion of metadata structures is tightly restricted to preserve systemic integrity. Below is how to delete elements safely:'}
                    </p>

                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="text-[11px] space-y-1">
                        <p className="font-bold">{isAr ? 'تنبيه أمني هام بشأن عزل وحذف البيانات' : 'Strict Security Lineage Warnings'}</p>
                        <p>
                          {isAr
                            ? 'كل إجراء حذف يسجل فوراً باسم المستخدم، بروتوكول الإنترنت الخاص به (IP)، واسم العنصر المحذوف في "سجل التدقيق الأمني" الذي لا يمكن تعديله أو حذفه أبداً.'
                            : 'All delete actions are hard-linked to the operator\'s account and permanently written to the immutable "Security Audit Logs" database.'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-2" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                        <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{isAr ? 'خطوات حذف الكليات أو المدرسين أو الطلاب' : 'Deleting Core Directory Records'}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {isAr
                              ? 'انتقل لـ "دليل الكليات والمساقات" وتصفح للقسم المطلوب. بجانب السجل، انقر فوق "أيقونة السلة" الحمراء. سيعرض المتصفح تذبيباً تأكيدياً لحفظ سلامة السجلات.'
                              : 'Navigate to "Academics Directory", switch to the specific target sub-tab, click the red "Trash Icon" on the datatable, and confirm the confirmation alert.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                        <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{isAr ? 'حذف المهام وخطط العمل المعلقة' : 'Deleting Operational Tasks and Remedial Actions'}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {isAr
                              ? 'يمكن تصفية وحذف المهام أو إلغاؤها من جدول لوحة التحكم الرئيسي أو من مصفوفة العمليات التشغيلية لضمان تطابق الأداء.'
                              : 'Clear outstanding tasks or CAPA plans directly under "Dashboard" or "Operations & Risk" tables via the delete controls where authorized.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab section 5: Actions - Evaluate */}
              {activeSec === 'actions-evaluate' && (
                <div className="space-y-6" style={{ textAlign: isAr ? 'right' : 'left' }}>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-150 dark:border-slate-850" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                    <Star className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-black text-lg text-slate-900 dark:text-white">
                      {isAr ? 'دليل خطوة بخطوة: كيفية التقييم وإسناد درجات الجودة' : 'Detailed Guide: How to Perform Academic Evaluations'}
                    </h2>
                  </div>

                  <div className="space-y-5 text-xs text-slate-500 leading-relaxed">
                    <p>
                      {isAr
                        ? 'تتضمن منصة AURA ثلاثة محاور رئيسية للتقييم الأكاديمي وإسناد الدرجات للبرامج والمساقات:'
                        : 'AURA houses three distinct evaluation layers to support robust curriculum mapping. Perform reviews using these guidelines:'}
                    </p>

                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl space-y-2">
                        <div className="flex items-center gap-2" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                          <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">A</span>
                          <h4 className="font-bold text-slate-900 dark:text-white">{isAr ? 'اعتماد المساقات الدراسية وتطابق المنهج' : 'Syllabus Portfolios Audit'}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {isAr
                            ? 'انتقل لـ "التقييمات وضمان الجودة"، اضغط على البرنامج لرؤية المساقات التابعة له. اضغط على "تفاصيل المساق". يمكن للعميد أو رئيس القسم الضغط على "اعتماد المنهج" أو "يتطلب تعديل" لتغيير نتيجة الامتثال.'
                            : 'Navigate to "Evaluations & Standards", select an active Program, inspect the course portfolio list, and toggle status to "Approve Syllabus" or "Request Revision" to update compliance.'}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl space-y-2">
                        <div className="flex items-center gap-2" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                          <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">B</span>
                          <h4 className="font-bold text-slate-900 dark:text-white">{isAr ? 'استكمال ملف التقييم الذاتي للبرامج (SER)' : 'Self-Evaluation Report (SER) Dossier'}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {isAr
                            ? 'في تبويب "الدراسة الذاتية (SER)"، قم بمراجعة المحاور المحددة لاعتماد البرامج (مثل مخرجات التعلم، المناهج، الكادر التعليمي)، اكتب الملاحظات وأرفق ملفات الدعم، ثم أسند درجة للمعيار من (1-100) ثم احفظ كمسودة.'
                            : 'In "Self-Evaluation (SER)", write narrative descriptions for key NCAAA criteria, attach PDF supporting evidence, assign scores (1-100), and click "Save Local Draft" or "Submit to Board".'}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl space-y-2">
                        <div className="flex items-center gap-2" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                          <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">C</span>
                          <h4 className="font-bold text-slate-900 dark:text-white">{isAr ? 'تقييم زيارات الاعتماد الخارجي والـ CAPA' : 'External Auditor Evaluation & Site Visits'}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {isAr
                            ? 'يمكن للمقيم الخارجي في لوحة "زيارات التقييم الخارجي" إدخال التوصيات والفجوات المكتشفة وتوزيع المهام التصحيحية (Action Plans) مع تحديد المواعيد والمسؤوليات لمتابعتها.'
                            : 'Under "Site Visit Audits", external reviewers write formal directives, identify curriculum compliance gaps, and log corrective CAPA remediation actions directly.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab section 6: Export Center */}
              {activeSec === 'export-center' && (
                <div className="space-y-6 animate-fade-in" style={{ textAlign: isAr ? 'right' : 'left' }}>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-150 dark:border-slate-850" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                    <FileDown className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-black text-lg text-slate-900 dark:text-white">
                      {isAr ? 'مركز تصدير المستندات والأدلة الرقمية' : 'Document Export Center'}
                    </h2>
                  </div>

                  <div className="prose dark:prose-invert text-xs text-slate-500 leading-relaxed space-y-4">
                    <p>
                      {isAr
                        ? 'تتيح لك هذه المنصة توليد وتصدير أدلة استخدام وملفات تقارير جودة مخصصة لتلبية احتياجات لجان الاعتماد الداخلي والخارجي بالجامعة.'
                        : 'AURA features advanced client-side rendering engines designed to compile university operational manuals and quality dashboards into standards-compliant dossiers.'}
                    </p>

                    <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-5 space-y-3">
                      <h4 className="font-bold text-indigo-900 dark:text-indigo-400">
                        {isAr ? 'تنزيل الدليل الكامل كملف PDF معتمد' : 'Download Verified PDF Operational Blueprint'}
                      </h4>
                      <p className="text-[11px] text-indigo-700/80 dark:text-slate-400">
                        {isAr
                          ? 'يقوم محرك تصدير البيانات (jsPDF) بتجميع كل مصفوفات الأدوار، شرح الإجراءات (إضافة، حذف، تعديل) وإصدار ملف مستندات رسمي جاهز للطباعة والتسجيل بالجامعة.'
                          : 'Our dynamic compiler creates an official client-side layout containing complete walkthrough instructions for your institution. Click below to download.'}
                      </p>
                      
                      <button
                        onClick={handleDownloadPDF}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2 font-mono"
                        style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تصدير دليل الاستخدام الرسمي (PDF)' : 'Export Official User Guide PDF'}</span>
                      </button>
                    </div>

                    <div className="p-4 border border-slate-150 dark:border-slate-850 rounded-xl space-y-2">
                      <h5 className="font-bold text-slate-800 dark:text-slate-300">{isAr ? 'نصيحة لتحقيق جودة طباعة ورقية مثالية' : 'Pro-Tip for High-Fidelity Printing'}</h5>
                      <p className="text-[10px] text-slate-400">
                        {isAr
                          ? 'لقد قمنا بتحسين ملفات الواجهات البرمجية لتتوافق تماماً مع الطباعة الورقية للمتصفح. يمكنك في أي وقت الضغط على Ctrl+P في لوحة المفاتيح لتصدير أي تبويب أو جدول في المنصة كملف PDF عالي الدقة دون أي تشويه في الألوان والمحاذاة.'
                          : 'All system styles are optimized via @media print CSS rules. Press Ctrl+P (or Cmd+P on Mac) on any page to perfectly print/save dashboards, tables, or audit logs directly to PDF with 100% vector accuracy.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
