import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, ShieldAlert, CheckSquare, FileText, ClipboardList, 
  MessageSquare, Plus, Search, Edit2, Trash2, Filter, ArrowUpDown, 
  Download, Printer, FileSpreadsheet, CheckCircle, Clock, Calendar,
  X, ChevronLeft, ChevronRight, Paperclip, Activity, Flame, Shield, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ComplaintSuggestion, InternalAudit, RiskItem, CapaItem, DocumentItem } from '../types';

export const OperationsRiskView: React.FC = () => {
  const { 
    language, activeInstitution, actingRole, currentUser, t,
    complaintsSuggestions, addNewComplaintSuggestion, updateComplaintSuggestion,
    internalAudits, addNewInternalAudit, updateInternalAudit,
    riskItems, addNewRiskItem, updateRiskItem, deleteRiskItem,
    capaItems, addNewCapaItem, updateCapaItem,
    documentItems, addNewDocumentItem, updateDocumentItem
  } = useApp();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'complaints' | 'audits' | 'risks' | 'capa' | 'documents'>('risks');

  // --- Search & Filters State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<string>('severity');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- CRUD/Details Modals ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Toast
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' }>({ show: false, msg: '', type: 'info' });
  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const canWrite = useMemo(() => {
    return ['Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean', 'Department Head'].includes(actingRole);
  }, [actingRole]);

  // --- Form States ---
  const [csForm, setCsForm] = useState({
    title: '', arabicTitle: '',
    type: 'Suggestion',
    category: 'Academic',
    description: '', arabicDescription: '',
    isAnonymous: false,
    contactInfo: ''
  });

  const [iaForm, setIaForm] = useState({
    scope: 'FE&T Course Files Review',
    arabicScope: 'مراجعة ملفات المساقات بكلية الهندسة FE&T',
    auditorName: 'Dr. Sarah Jenkins',
    arabicAuditorName: 'د. سارة جينكينز',
    auditDate: '2026-06-15',
    findingsSummary: 'Minor misalignment in CLO scoring matrices on three syllabus files.',
    nonComplianceCount: 3,
    status: 'Scheduled',
    arabicStatus: 'مجدول'
  });

  const [rkForm, setRkForm] = useState({
    title: 'Disruption in Online Evaluation Portal',
    arabicTitle: 'انقطاع بوابة التقييم الإلكتروني للطلاب',
    category: 'Operational',
    likelihood: 3, // 1 to 5
    impact: 4, // 1 to 5
    mitigationStrategy: 'Enable redundant server architecture on Cloud Run.',
    arabicMitigationStrategy: 'تفعيل بنية الخوادم الاحتياطية على السحابة لمنع التوقف.',
    owner: 'IT Department Head',
    status: 'Mitigated',
    arabicStatus: 'تم تخفيف الأثر'
  });

  const [cpForm, setCpForm] = useState({
    sourceAuditId: 'AUD-3044',
    rootCause: 'Lack of central guidelines on course learning outcomes alignment.',
    arabicRootCause: 'عدم وجود مبادئ توجيهية مركزية بشأن محاذاة مخرجات المساقات الدراسية.',
    correctiveAction: 'Deploy Aura SaaS Syllabus Builder and run full staff training.',
    arabicCorrectiveAction: 'نشر نظام منشئ المناهج Aura SaaS وتشغيل تدريب كامل للموظفين.',
    preventiveAction: 'Enforce pre-semester syllabus audits across all departments.',
    arabicPreventiveAction: 'فرض تدقيق مسبق للمناهج الدراسية قبل بداية الفصل بجميع الأقسام.',
    verificationDate: '2026-09-01',
    progress: 70,
    status: 'In Progress',
    arabicStatus: 'قيد التنفيذ'
  });

  const [docForm, setDocForm] = useState({
    title: 'NCAAA Standard 4 Self-Study Guide',
    arabicTitle: 'دليل التقييم الذاتي للمعيار الرابع NCAAA',
    category: 'Policy',
    version: '1.4.2',
    author: 'Quality Office Coordinator',
    fileUrl: 'https://aurasub.edu/documents/ncaaa_std4.pdf',
    status: 'Active',
    arabicStatus: 'نشط'
  });

  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  // Sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    const filename = `operations_risk_export_${activeTab}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    triggerToast(
      isAr 
        ? `جاري تصدير العمليات بصيغة ${format.toUpperCase()}... تم تنزيل الملف (${filename})`
        : `Exporting operations as ${format.toUpperCase()}... Downloaded (${filename})`, 
      'success'
    );
  };

  // Filter & Sort
  const filteredData = useMemo(() => {
    let base: any[] = [];
    if (activeTab === 'complaints') base = complaintsSuggestions;
    else if (activeTab === 'audits') base = internalAudits;
    else if (activeTab === 'risks') base = riskItems;
    else if (activeTab === 'capa') base = capaItems;
    else if (activeTab === 'documents') base = documentItems;

    return base.filter(item => {
      const s = searchQuery.toLowerCase();
      const matchesSearch = 
        (item.title && item.title.toLowerCase().includes(s)) ||
        (item.arabicTitle && item.arabicTitle.toLowerCase().includes(s)) ||
        (item.scope && item.scope.toLowerCase().includes(s)) ||
        (item.auditorName && item.auditorName.toLowerCase().includes(s)) ||
        (item.rootCause && item.rootCause.toLowerCase().includes(s));

      let matchesStatus = true;
      if (statusFilter !== 'ALL') {
        matchesStatus = item.status === statusFilter;
      }

      let matchesCategory = true;
      if (categoryFilter !== 'ALL') {
        matchesCategory = item.category === categoryFilter;
      }

      return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => {
      let valA = a[sortBy] !== undefined ? a[sortBy] : '';
      let valB = b[sortBy] !== undefined ? b[sortBy] : '';

      // Likelihood * Impact score sorting for Risks
      if (activeTab === 'risks' && sortBy === 'severity') {
        valA = (a.likelihood || 1) * (a.impact || 1);
        valB = (b.likelihood || 1) * (b.impact || 1);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [activeTab, complaintsSuggestions, internalAudits, riskItems, capaItems, documentItems, searchQuery, statusFilter, categoryFilter, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleOpenAdd = () => {
    setAttachedFiles([]);
    if (activeTab === 'complaints') {
      setCsForm({ title: '', arabicTitle: '', type: 'Suggestion', category: 'Academic', description: '', arabicDescription: '', isAnonymous: false, contactInfo: '' });
    } else if (activeTab === 'audits') {
      setIaForm({ scope: '', arabicScope: '', auditorName: '', arabicAuditorName: '', auditDate: '2026-06-15', findingsSummary: '', nonComplianceCount: 0, status: 'Scheduled', arabicStatus: 'مجدول' });
    } else if (activeTab === 'risks') {
      setRkForm({ title: '', arabicTitle: '', category: 'Operational', likelihood: 3, impact: 3, mitigationStrategy: '', arabicMitigationStrategy: '', owner: '', status: 'Identified', arabicStatus: 'محدد' });
    } else if (activeTab === 'capa') {
      setCpForm({ sourceAuditId: 'AUD-' + Math.floor(1000 + Math.random() * 9000), rootCause: '', arabicRootCause: '', correctiveAction: '', arabicCorrectiveAction: '', preventiveAction: '', arabicPreventiveAction: '', verificationDate: '2026-09-01', progress: 0, status: 'Identified', arabicStatus: 'محدد' });
    } else if (activeTab === 'documents') {
      setDocForm({ title: '', arabicTitle: '', category: 'Policy', version: '1.0.0', author: currentUser.name, fileUrl: '', status: 'Active', arabicStatus: 'نشط' });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'complaints') {
      addNewComplaintSuggestion({
        ...csForm,
        date: new Date().toISOString().split('T')[0],
        status: 'Submitted',
        arabicStatus: 'تم التقديم',
        resolutionNotes: '',
        arabicResolutionNotes: ''
      });
      triggerToast(isAr ? 'تم إرسال الشكوى/المقترح بنجاح لمكتب ضمان الجودة!' : 'Feedback submitted successfully to Quality Assurance!');
    } else if (activeTab === 'audits') {
      if (!canWrite) return;
      addNewInternalAudit({
        ...iaForm,
        checklistItems: [
          { item: 'Syllabus Course Objectives check', done: true },
          { item: 'Student evaluation score maps validation', done: false },
          { item: 'Compliance documentation review', done: false }
        ]
      });
      triggerToast(isAr ? 'تم جدولة التدقيق الأكاديمي الداخلي!' : 'Internal Audit registered successfully!');
    } else if (activeTab === 'risks') {
      if (!canWrite) return;
      addNewRiskItem({
        ...rkForm
      });
      triggerToast(isAr ? 'تم قيد البند في سجل المخاطر بنجاح!' : 'Risk profile registered on the Register!');
    } else if (activeTab === 'capa') {
      if (!canWrite) return;
      addNewCapaItem({
        ...cpForm
      });
      triggerToast(isAr ? 'تم إنشاء بطاقة الإجراء العلاجي والوقائي (CAPA)!' : 'CAPA action card created successfully!');
    } else if (activeTab === 'documents') {
      if (!canWrite) return;
      addNewDocumentItem({
        ...docForm,
        uploadedAt: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        tags: [docForm.category]
      });
      triggerToast(isAr ? 'تم حفظ المستند بمركز الوثائق المعتمد!' : 'Document uploaded on Aura repository!');
    }

    setIsAddModalOpen(false);
  };

  const handleToggleComplaint = (item: ComplaintSuggestion) => {
    const updated = {
      ...item,
      status: 'Resolved' as const,
      arabicStatus: 'تم حلها',
      resolutionNotes: 'Verified alignment and resolved communication lag.',
      arabicResolutionNotes: 'تم التحقق وتوفير الدعم وتعديل مسار الاتصال.'
    };
    updateComplaintSuggestion(updated);
    triggerToast(isAr ? 'تم تصنيف البند كـ محلول ومغلق!' : 'Feedback item marked as Resolved!');
  };

  const handleDownloadDoc = (item: DocumentItem) => {
    triggerToast(
      isAr 
        ? `جاري تحميل الملف: ${item.title}... (تحميل آمن)`
        : `Secure download initiated for: ${item.title}`,
      'info'
    );
  };

  return (
    <div className="space-y-6" id="ops-risk-main">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-blue-600'}`}
          >
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm" id="ops-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            {isAr ? 'العمليات والمخاطر والامتثال' : 'Operations, Risk & Compliance Registry'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isAr 
              ? 'إدارة التدقيق الأكاديمي، سجل المخاطر التشغيلية، الإجراءات التصحيحية والوقائية CAPA، وحفظ وثائق المناهج والسياسات'
              : 'Audit checkbooks, Risk severity mapping, CAPA remediation, and secure document version archives'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleExport('excel')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
          >
            <FileText className="h-4 w-4" />
            PDF
          </button>
          {canWrite || activeTab === 'complaints' ? (
            <button 
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-xs font-bold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              {activeTab === 'complaints' 
                ? (isAr ? 'تقديم مقترح / شكوى' : 'File Complaint/Suggestion')
                : (isAr ? 'قيد بند جديد' : 'Add Register Entry')
              }
            </button>
          ) : null}
        </div>
      </div>

      {/* Directory Tab Switcher */}
      <div className="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 gap-1" id="ops-tabs-switch">
        {[
          { key: 'risks', label: isAr ? 'سجل المخاطر التشغيلية' : 'SaaS Risk Register', icon: Shield },
          { key: 'audits', label: isAr ? 'التدقيق الأكاديمي الداخلي' : 'Internal Audits', icon: ClipboardList },
          { key: 'capa', label: isAr ? 'الإجراءات التصحيحية والوقائية (CAPA)' : 'CAPA Management', icon: CheckSquare },
          { key: 'documents', label: isAr ? 'مركز الوثائق والسياسات' : 'Document control & Policies', icon: FileText },
          { key: 'complaints', label: isAr ? 'الشكاوى والاقتراحات' : 'Complaints & Suggestions', icon: MessageSquare }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setCurrentPage(1);
                setSearchQuery('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-150 ${
                isActive 
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' 
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <IconComp className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters Area */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4" id="ops-filters">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input 
            type="text"
            placeholder={isAr ? 'البحث بالاسم أو التفاصيل...' : 'Search records...'}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className={`w-full text-xs py-2 pr-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 ${isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full text-xs py-2 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none text-zinc-600 dark:text-zinc-400"
          >
            <option value="ALL">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
            {activeTab === 'risks' && (
              <>
                <option value="Identified">{isAr ? 'محدد الأثر' : 'Identified'}</option>
                <option value="Mitigated">{isAr ? 'تم تخفيف الأثر' : 'Mitigated'}</option>
              </>
            )}
            {activeTab === 'audits' && (
              <>
                <option value="Scheduled">{isAr ? 'مجدول' : 'Scheduled'}</option>
                <option value="In Progress">{isAr ? 'قيد التنفيذ' : 'In Progress'}</option>
                <option value="Completed">{isAr ? 'مكتمل' : 'Completed'}</option>
              </>
            )}
            {activeTab === 'capa' && (
              <>
                <option value="In Progress">{isAr ? 'قيد التنفيذ' : 'In Progress'}</option>
                <option value="Resolved">{isAr ? 'تم الإغلاق بنجاح' : 'Resolved'}</option>
              </>
            )}
          </select>
        </div>

        <div className="text-xs text-zinc-500 flex items-center justify-end md:col-start-4">
          {isAr 
            ? `تم العثور على ${filteredData.length} سجل` 
            : `Found ${filteredData.length} records`}
        </div>
      </div>

      {/* Main Table Layout */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden" id="ops-data-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
                {activeTab === 'risks' && (
                  <>
                    <th className="p-4">{isAr ? 'بند الخطر' : 'Risk Scenario'}</th>
                    <th className="p-4">{isAr ? 'التصنيف' : 'Category'}</th>
                    <th className="p-4 text-center">{isAr ? 'الاحتمالية' : 'Likelihood (1-5)'}</th>
                    <th className="p-4 text-center">{isAr ? 'الأثر المترتب' : 'Impact (1-5)'}</th>
                    <th className="p-4 text-center">{isAr ? 'مستوى الخطورة الشامل' : 'Severity Matrix'}</th>
                    <th className="p-4">{isAr ? 'خطة الحد من الأثر' : 'Mitigation Strategy'}</th>
                    <th className="p-4">{isAr ? 'القسم المسؤول' : 'Owner'}</th>
                  </>
                )}

                {activeTab === 'audits' && (
                  <>
                    <th className="p-4">{isAr ? 'نطاق عملية التدقيق' : 'Audit Scope'}</th>
                    <th className="p-4">{isAr ? 'المدقق المكلف' : 'Assigned Auditor'}</th>
                    <th className="p-4">{isAr ? 'تاريخ التدقيق' : 'Audit Date'}</th>
                    <th className="p-4 text-center">{isAr ? 'حالات عدم المطابقة' : 'Non-compliances'}</th>
                    <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
                  </>
                )}

                {activeTab === 'capa' && (
                  <>
                    <th className="p-4">{isAr ? 'رمز التدقيق المصدر' : 'Audit Ref'}</th>
                    <th className="p-4">{isAr ? 'السبب الجذري للمشكلة' : 'Root Cause Analysis'}</th>
                    <th className="p-4">{isAr ? 'الإجراء العلاجي (CAPA)' : 'Corrective Remediation Plan'}</th>
                    <th className="p-4 text-center">{isAr ? 'نسبة التقدم' : 'Progress'}</th>
                    <th className="p-4">{isAr ? 'تاريخ التحقق' : 'Verification Date'}</th>
                    <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
                  </>
                )}

                {activeTab === 'documents' && (
                  <>
                    <th className="p-4">{isAr ? 'اسم المستند' : 'Document Title'}</th>
                    <th className="p-4">{isAr ? 'النوع' : 'Category'}</th>
                    <th className="p-4 text-center">{isAr ? 'الإصدار الحالي' : 'Active Version'}</th>
                    <th className="p-4">{isAr ? 'بواسطة' : 'Author'}</th>
                    <th className="p-4">{isAr ? 'تاريخ النشر' : 'Released At'}</th>
                    <th className="p-4 text-center">{isAr ? 'التحميلات' : 'Downloads'}</th>
                    <th className="p-4 text-right">{isAr ? 'الإجراء' : 'Download File'}</th>
                  </>
                )}

                {activeTab === 'complaints' && (
                  <>
                    <th className="p-4">{isAr ? 'عنوان البند' : 'Title'}</th>
                    <th className="p-4">{isAr ? 'النوع' : 'Type'}</th>
                    <th className="p-4">{isAr ? 'تاريخ التقديم' : 'Date Filed'}</th>
                    <th className="p-4">{isAr ? 'التفاصيل' : 'Details'}</th>
                    <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="p-4 text-right">{isAr ? 'العمليات' : 'Actions'}</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                    {isAr ? 'لا توجد سجلات مطابقة للبحث.' : 'No records found matching the criteria.'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  let severityScore = 0;
                  let severityColor = 'bg-zinc-100 text-zinc-700';
                  let severityLabel = 'Low';
                  if (activeTab === 'risks') {
                    severityScore = (item.likelihood || 1) * (item.impact || 1);
                    if (severityScore >= 16) {
                      severityColor = 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-extrabold';
                      severityLabel = 'Critical';
                    } else if (severityScore >= 10) {
                      severityColor = 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold';
                      severityLabel = 'High';
                    } else if (severityScore >= 5) {
                      severityColor = 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 font-semibold';
                      severityLabel = 'Medium';
                    } else {
                      severityColor = 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400';
                      severityLabel = 'Low';
                    }
                  }

                  return (
                    <tr key={item.id || idx} className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100">
                      {activeTab === 'risks' && (
                        <>
                          <td className="p-4 font-semibold text-zinc-950 dark:text-zinc-50">
                            {isAr ? item.arabicTitle : item.title}
                          </td>
                          <td className="p-4 font-medium text-zinc-600 dark:text-zinc-400">{item.category}</td>
                          <td className="p-4 text-center font-mono">{item.likelihood}/5</td>
                          <td className="p-4 text-center font-mono">{item.impact}/5</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded text-[10px] ${severityColor}`}>
                              {severityScore} ({isAr ? (severityLabel === 'Critical' ? 'حرج' : severityLabel === 'High' ? 'عالٍ' : severityLabel === 'Medium' ? 'متوسط' : 'منخفض') : severityLabel})
                            </span>
                          </td>
                          <td className="p-4 text-zinc-500 max-w-[200px] truncate" title={isAr ? item.arabicMitigationStrategy : item.mitigationStrategy}>
                            {isAr ? item.arabicMitigationStrategy : item.mitigationStrategy}
                          </td>
                          <td className="p-4 text-zinc-600 dark:text-zinc-400 font-semibold">{item.owner}</td>
                        </>
                      )}

                      {activeTab === 'audits' && (
                        <>
                          <td className="p-4 font-semibold text-zinc-950 dark:text-zinc-50">
                            {isAr ? item.arabicScope : item.scope}
                          </td>
                          <td className="p-4">{isAr ? item.arabicAuditorName : item.auditorName}</td>
                          <td className="p-4 font-mono font-medium text-zinc-500">{item.auditDate}</td>
                          <td className="p-4 text-center font-mono font-bold text-red-600 dark:text-red-400">{item.nonComplianceCount}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'Completed' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {isAr ? item.arabicStatus : item.status}
                            </span>
                          </td>
                        </>
                      )}

                      {activeTab === 'capa' && (
                        <>
                          <td className="p-4 font-mono font-bold text-zinc-500">{item.sourceAuditId}</td>
                          <td className="p-4 max-w-[180px] truncate" title={isAr ? item.arabicRootCause : item.rootCause}>
                            {isAr ? item.arabicRootCause : item.rootCause}
                          </td>
                          <td className="p-4 font-semibold text-zinc-800 dark:text-zinc-200 max-w-[200px] truncate" title={isAr ? item.arabicCorrectiveAction : item.correctiveAction}>
                            {isAr ? item.arabicCorrectiveAction : item.correctiveAction}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center gap-1.5 justify-center">
                              <span className="font-mono font-bold text-[10px]">{item.progress}%</span>
                              <div className="w-12 bg-zinc-100 h-1.5 rounded overflow-hidden">
                                <div className="bg-zinc-900 h-full" style={{ width: `${item.progress}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-zinc-500">{item.verificationDate}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'Resolved' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {isAr ? item.arabicStatus : item.status}
                            </span>
                          </td>
                        </>
                      )}

                      {activeTab === 'documents' && (
                        <>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">📄</span>
                              <div className="font-semibold text-zinc-950 dark:text-zinc-50">{isAr ? item.arabicTitle : item.title}</div>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-zinc-500">{item.category}</td>
                          <td className="p-4 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300">v{item.version}</td>
                          <td className="p-4 text-zinc-600 dark:text-zinc-400">{item.author}</td>
                          <td className="p-4 font-mono text-zinc-500">{item.uploadedAt}</td>
                          <td className="p-4 text-center font-mono">{item.downloadCount || 0}</td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleDownloadDoc(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-[10px] font-bold"
                            >
                              <Download className="h-3 w-3" />
                              {isAr ? 'تحميل' : 'Download'}
                            </button>
                          </td>
                        </>
                      )}

                      {activeTab === 'complaints' && (
                        <>
                          <td className="p-4 font-semibold text-zinc-950 dark:text-zinc-50">
                            {isAr ? item.arabicTitle : item.title}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-850 font-bold text-[10px]">{item.type}</span>
                          </td>
                          <td className="p-4 font-mono text-zinc-500">{item.date}</td>
                          <td className="p-4 max-w-[200px] truncate" title={isAr ? item.arabicDescription : item.description}>
                            {isAr ? item.arabicDescription : item.description}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'Resolved' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-zinc-100 text-zinc-600'
                            }`}>
                              {isAr ? item.arabicStatus : item.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {item.status !== 'Resolved' && ['Platform Admin', 'Institution Admin', 'Quality Manager'].includes(actingRole) && (
                              <button 
                                onClick={() => handleToggleComplaint(item)}
                                className="px-2 py-1 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold"
                              >
                                {isAr ? 'حل الإشكال' : 'Resolve'}
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-500 text-xs">
              {isAr 
                ? `عرض الصفحة ${currentPage} من أصل ${totalPages}` 
                : `Showing Page ${currentPage} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 text-zinc-600 dark:text-zinc-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2.5 py-1 text-xs rounded font-semibold ${
                    currentPage === i + 1 
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' 
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 text-zinc-600 dark:text-zinc-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CRUD / File Modal Dialog */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden"
            >
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                  {isAr ? `إضافة سجل جديد لـ ${activeTab}` : `Add New ${activeTab.slice(0, -1)} Entry`}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdd} className="p-6 space-y-4">
                {activeTab === 'risks' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'سيناريو الخطر المحتمل (EN)' : 'Risk Scenario Title (EN)'}</label>
                      <input type="text" required value={rkForm.title} onChange={e => setRkForm(p => ({ ...p, title: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'سيناريو الخطر المحتمل (AR)' : 'Risk Scenario Title (AR)'}</label>
                      <input type="text" required value={rkForm.arabicTitle} onChange={e => setRkForm(p => ({ ...p, arabicTitle: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'الاحتمالية (1-5)' : 'Likelihood Likelihood (1-5)'}</label>
                      <input type="number" min="1" max="5" value={rkForm.likelihood} onChange={e => setRkForm(p => ({ ...p, likelihood: parseInt(e.target.value) }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'الأثر المترتب (1-5)' : 'Impact (1-5)'}</label>
                      <input type="number" min="1" max="5" value={rkForm.impact} onChange={e => setRkForm(p => ({ ...p, impact: parseInt(e.target.value) }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'نوع الخطر' : 'Category'}</label>
                      <select value={rkForm.category} onChange={e => setRkForm(p => ({ ...p, category: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border">
                        <option value="Operational">Operational</option>
                        <option value="Academic">Academic</option>
                        <option value="Financial">Financial</option>
                        <option value="Reputational">Reputational</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'الجهة المسؤولة' : 'Owner / Dept'}</label>
                      <input type="text" required value={rkForm.owner} onChange={e => setRkForm(p => ({ ...p, owner: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'استراتيجية الحد من الأثر والتخفيف' : 'Mitigation Strategy'}</label>
                      <textarea rows={2} required value={rkForm.mitigationStrategy} onChange={e => setRkForm(p => ({ ...p, mitigationStrategy: e.target.value, arabicMitigationStrategy: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                  </div>
                )}

                {activeTab === 'audits' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'نطاق عملية التدقيق (EN)' : 'Audit Scope Title (EN)'}</label>
                      <input type="text" required value={iaForm.scope} onChange={e => setIaForm(p => ({ ...p, scope: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'نطاق عملية التدقيق (AR)' : 'Audit Scope Title (AR)'}</label>
                      <input type="text" required value={iaForm.arabicScope} onChange={e => setIaForm(p => ({ ...p, arabicScope: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'اسم المدقق' : 'Auditor Name'}</label>
                      <input type="text" required value={iaForm.auditorName} onChange={e => setIaForm(p => ({ ...p, auditorName: e.target.value, arabicAuditorName: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'تاريخ التدقيق المجدول' : 'Date'}</label>
                      <input type="date" value={iaForm.auditDate} onChange={e => setIaForm(p => ({ ...p, auditDate: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                  </div>
                )}

                {activeTab === 'capa' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'رمز التدقيق المرجعي' : 'Source Audit Reference ID'}</label>
                      <input type="text" required value={cpForm.sourceAuditId} onChange={e => setCpForm(p => ({ ...p, sourceAuditId: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'تاريخ التحقق المقرر' : 'Verification Date'}</label>
                      <input type="date" value={cpForm.verificationDate} onChange={e => setCpForm(p => ({ ...p, verificationDate: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'تحليل السبب الجذري للمشكلة' : 'Root Cause Description'}</label>
                      <textarea rows={2} required value={cpForm.rootCause} onChange={e => setCpForm(p => ({ ...p, rootCause: e.target.value, arabicRootCause: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'الإجراء التصحيحي المقرر' : 'Corrective Action'}</label>
                      <textarea rows={2} required value={cpForm.correctiveAction} onChange={e => setCpForm(p => ({ ...p, correctiveAction: e.target.value, arabicCorrectiveAction: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'عنوان المستند المرجعي (EN)' : 'Document Title (EN)'}</label>
                      <input type="text" required value={docForm.title} onChange={e => setDocForm(p => ({ ...p, title: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'عنوان المستند المرجعي (AR)' : 'Document Title (AR)'}</label>
                      <input type="text" required value={docForm.arabicTitle} onChange={e => setDocForm(p => ({ ...p, arabicTitle: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'نوع المستند والسياسة' : 'Category'}</label>
                      <select value={docForm.category} onChange={e => setDocForm(p => ({ ...p, category: e.target.value as any }))} className="w-full text-xs p-2 rounded bg-zinc-50 border">
                        <option value="Policy">Policy</option>
                        <option value="Syllabus">Syllabus Archive</option>
                        <option value="SER Report">Self-Study Report</option>
                        <option value="NCAAA Criteria">Accreditation Standard Dossier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'الإصدار (e.g. 1.0.2)' : 'Version'}</label>
                      <input type="text" required value={docForm.version} onChange={e => setDocForm(p => ({ ...p, version: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                  </div>
                )}

                {activeTab === 'complaints' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'المقترح أو الشكوى باختصار (EN)' : 'Feedback / Complaint Title (EN)'}</label>
                      <input type="text" required value={csForm.title} onChange={e => setCsForm(p => ({ ...p, title: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'المقترح أو الشكوى باختصار (AR)' : 'Feedback / Complaint Title (AR)'}</label>
                      <input type="text" required value={csForm.arabicTitle} onChange={e => setCsForm(p => ({ ...p, arabicTitle: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'النوع' : 'Type'}</label>
                      <select value={csForm.type} onChange={e => setCsForm(p => ({ ...p, type: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border">
                        <option value="Suggestion">Suggestion / مقترح</option>
                        <option value="Complaint">Complaint / شكوى</option>
                        <option value="Grievance">Grievance / مظلمة</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'التصنيف' : 'Category'}</label>
                      <select value={csForm.category} onChange={e => setCsForm(p => ({ ...p, category: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border">
                        <option value="Academic">Academic</option>
                        <option value="Facility">Facility & Equipment</option>
                        <option value="Admin">Administrative</option>
                        <option value="Technical">IT / Portal Support</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'وصف تفصيلي' : 'Detailed Narrative'}</label>
                      <textarea rows={3} required value={csForm.description} onChange={e => setCsForm(p => ({ ...p, description: e.target.value, arabicDescription: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-6">
                  <button 
                    type="button" onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-xs font-bold text-white dark:text-zinc-900 hover:bg-zinc-800"
                  >
                    {isAr ? 'حفظ السجل' : 'Save Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
