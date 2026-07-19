import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckSquare, Award, Star, Compass, UserCheck, ShieldCheck,
  Plus, Search, Edit2, Trash2, Filter, ArrowUpDown, Download, 
  Printer, FileSpreadsheet, FileText, CheckCircle, Clock, Calendar,
  X, ChevronLeft, ChevronRight, Paperclip, Activity, FilePlus, AlertTriangle,
  Settings, ArrowUp, ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QualityObjective, StudentEvaluation, LecturerSelfEvaluation, PeerReview, ExternalReview, AccreditationStandard } from '../types';

export const QualityEvaluationsView: React.FC = () => {
  const { 
    language, activeInstitution, actingRole, currentUser, t,
    qualityObjectives, addNewQualityObjective, updateQualityObjective, deleteQualityObjective,
    studentEvaluations, addNewStudentEvaluation,
    lecturerSelfEvaluations, addNewLecturerSelfEvaluation,
    peerReviews, addNewPeerReview, updatePeerReviewStatus,
    externalReviews, addNewExternalReview,
    accreditationStandards, addNewAccreditationStandard, updateAccreditationStandard,
    programs, lecturers, courses,
    evaluationQuestions, addNewEvaluationQuestion, updateEvaluationQuestion, deleteEvaluationQuestion
  } = useApp();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'objectives' | 'student-evals' | 'lecturer-self' | 'peer-reviews' | 'external-reviews' | 'accreditation' | 'questions-config'>('student-evals');
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('Student evaluates Lecturer');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [questionForm, setQuestionForm] = useState({
    textEn: '',
    textAr: '',
    isActive: true,
    evaluationType: 'Student evaluates Lecturer',
    order: 0
  });

  // --- Search & Filters State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- CRUD/Interaction Modals ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // --- Toast State ---
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' }>({ show: false, msg: '', type: 'info' });
  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const canWrite = useMemo(() => {
    return ['Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean', 'Department Head', 'Lecturer', 'Student'].includes(actingRole);
  }, [actingRole]);

  // --- Questionnaire Interactive Form States ---
  const [seForm, setSeForm] = useState({
    courseId: courses[0]?.id || '',
    lecturerId: lecturers[0]?.id || '',
    term: 'Spring 2026',
    q1: 5, q2: 5, q3: 5, q4: 5, q5: 5,
    writtenFeedback: '',
    sentiment: 'Positive'
  });

  const [lseForm, setLseForm] = useState({
    lecturerId: lecturers[0]?.id || '',
    courseId: courses[0]?.id || '',
    term: 'Spring 2026',
    teachingSelfScore: 5,
    researchSelfScore: 5,
    communitySelfScore: 5,
    adminSelfScore: 5,
    personalGoals: '',
    arabicPersonalGoals: ''
  });

  const [prForm, setPrForm] = useState({
    reviewerId: lecturers[0]?.id || '',
    targetLecturerId: lecturers[1]?.id || lecturers[0]?.id || '',
    courseId: courses[0]?.id || '',
    syllabusScore: 90,
    teachingMethodScore: 85,
    assessmentScore: 95,
    overallRecommendation: 'Approved as Excellence',
    arabicOverallRecommendation: 'معتمد بتقدير ممتاز',
    comments: '',
    arabicComments: ''
  });

  const [erForm, setErForm] = useState({
    agencyName: 'NCAAA Evaluation Committee',
    arabicAgencyName: 'الهيئة الوطنية للتقويم والاعتماد الأكاديمي',
    reviewStartDate: '2026-05-10',
    reviewEndDate: '2026-05-15',
    overallScore: 92,
    strengths: 'Rigorous curriculum assessment maps; solid institutional framework.',
    recommendations: 'Introduce more localized continuous learning modules.',
    status: 'Compliant',
    arabicStatus: 'متوافق'
  });

  const [qoForm, setQoForm] = useState({
    title: '', arabicTitle: '',
    description: '', arabicDescription: '',
    targetValue: 95,
    currentValue: 80,
    unit: '%',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    status: 'In Progress',
    arabicStatus: 'قيد التنفيذ'
  });

  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  // Calculate student evaluation averages dynamically
  const seAverages = useMemo(() => {
    const list = studentEvaluations;
    if (list.length === 0) return { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, overall: 0 };
    let t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0;
    list.forEach(item => {
      t1 += item.q1 || 5;
      t2 += item.q2 || 5;
      t3 += item.q3 || 5;
      t4 += item.q4 || 5;
      t5 += item.q5 || 5;
    });
    const len = list.length;
    const avgOverall = (t1 + t2 + t3 + t4 + t5) / (5 * len);
    return {
      q1: (t1 / len).toFixed(1),
      q2: (t2 / len).toFixed(1),
      q3: (t3 / len).toFixed(1),
      q4: (t4 / len).toFixed(1),
      q5: (t5 / len).toFixed(1),
      overall: (avgOverall * 20).toFixed(1) // convert 5 scale to percentage
    };
  }, [studentEvaluations]);

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
    const filename = `evaluation_report_${activeTab}_2026.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    triggerToast(
      isAr 
        ? `جاري تصدير التقرير بصيغة ${format.toUpperCase()}... تم تنزيل الملف (${filename})`
        : `Exporting evaluation reports as ${format.toUpperCase()}... Downloaded (${filename})`, 
      'success'
    );
  };

  // Filter & Sort
  const filteredData = useMemo(() => {
    let base: any[] = [];
    if (activeTab === 'objectives') base = qualityObjectives;
    else if (activeTab === 'student-evals') base = studentEvaluations;
    else if (activeTab === 'lecturer-self') base = lecturerSelfEvaluations;
    else if (activeTab === 'peer-reviews') base = peerReviews;
    else if (activeTab === 'external-reviews') base = externalReviews;
    else if (activeTab === 'accreditation') base = accreditationStandards;
    else if (activeTab === 'questions-config') base = evaluationQuestions;

    return base.filter(item => {
      const s = searchQuery.toLowerCase();
      const matchesSearch = !s ||
        (item.title && item.title.toLowerCase().includes(s)) ||
        (item.arabicTitle && item.arabicTitle.toLowerCase().includes(s)) ||
        (item.writtenFeedback && item.writtenFeedback.toLowerCase().includes(s)) ||
        (item.agencyName && item.agencyName.toLowerCase().includes(s)) ||
        (item.textEn && item.textEn.toLowerCase().includes(s)) ||
        (item.textAr && item.textAr.toLowerCase().includes(s)) ||
        (item.personalGoals && item.personalGoals.toLowerCase().includes(s)) ||
        (item.arabicPersonalGoals && item.arabicPersonalGoals.toLowerCase().includes(s)) ||
        (item.standardNumber && String(item.standardNumber).includes(s));

      let matchesStatus = true;
      if (statusFilter !== 'ALL') {
        if (item.status) matchesStatus = item.status === statusFilter;
        else if (item.sentiment) matchesStatus = item.sentiment === statusFilter;
      }

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [activeTab, qualityObjectives, studentEvaluations, lecturerSelfEvaluations, peerReviews, externalReviews, accreditationStandards, evaluationQuestions, searchQuery, statusFilter, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleOpenAdd = () => {
    setAttachedFiles([]);
    if (activeTab === 'student-evals') {
      setSeForm({
        courseId: courses[0]?.id || '',
        lecturerId: lecturers[0]?.id || '',
        term: 'Spring 2026',
        q1: 5, q2: 5, q3: 5, q4: 5, q5: 5,
        writtenFeedback: '',
        sentiment: 'Positive'
      });
    } else if (activeTab === 'lecturer-self') {
      setLseForm({
        lecturerId: lecturers[0]?.id || '',
        courseId: courses[0]?.id || '',
        term: 'Spring 2026',
        teachingSelfScore: 5,
        researchSelfScore: 5,
        communitySelfScore: 5,
        adminSelfScore: 5,
        personalGoals: 'Increase international peer-reviewed publications by 20%.',
        arabicPersonalGoals: 'زيادة الأبحاث المنشورة في مجلات علمية عالمية بنسبة 20٪.'
      });
    } else if (activeTab === 'peer-reviews') {
      setPrForm({
        reviewerId: lecturers[0]?.id || '',
        targetLecturerId: lecturers[1]?.id || lecturers[0]?.id || '',
        courseId: courses[0]?.id || '',
        syllabusScore: 90,
        teachingMethodScore: 85,
        assessmentScore: 95,
        overallRecommendation: 'Approved with High Commendation',
        arabicOverallRecommendation: 'معتمد بتقدير امتياز مع مرتبة الشرف',
        comments: 'Outstanding lesson structures and alignment with course learning outcomes (CLOs).',
        arabicComments: 'بنية الدرس متميزة وتتوافق تماماً مع مخرجات التعلم للمقرر الأكاديمي.'
      });
    } else if (activeTab === 'external-reviews') {
      setErForm({
        agencyName: 'NCAAA Board of Auditors',
        arabicAgencyName: 'مجلس المدققين بالهيئة الوطنية NCAAA',
        reviewStartDate: '2026-05-15',
        reviewEndDate: '2026-05-20',
        overallScore: 94,
        strengths: 'Excellent strategic KPI dashboards and full multi-tenant storage compliance.',
        recommendations: 'Enhance direct student participation workflows in quality board discussions.',
        status: 'Compliant',
        arabicStatus: 'متوافق'
      });
    } else if (activeTab === 'objectives') {
      setQoForm({
        title: 'Upgrade Syllabus Learning Analytics',
        arabicTitle: 'ترقية تحليلات مخرجات التعلم بالمنهج',
        description: 'Implement computerized CLO trackers across FE&T departments.',
        arabicDescription: 'تطبيق أنظمة تتبع مخرجات التعلم المحوسبة بكلية الهندسة وتكنولوجيا المعلومات.',
        targetValue: 100,
        currentValue: 85,
        unit: '%',
        startDate: '2026-01-10',
        endDate: '2026-08-30',
        status: 'In Progress',
        arabicStatus: 'قيد التنفيذ'
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    if (activeTab === 'student-evals') {
      // Calculate sentiment on the fly
      const avg = (seForm.q1 + seForm.q2 + seForm.q3 + seForm.q4 + seForm.q5) / 5;
      const computedSentiment = avg >= 4 ? 'Positive' : avg >= 2.5 ? 'Neutral' : 'Negative';

      addNewStudentEvaluation({
        ...seForm,
        date: new Date().toISOString().split('T')[0],
        sentiment: computedSentiment,
        overallScore: avg
      });
      triggerToast(isAr ? 'تم إرسال تقييمك للمقرر بنجاح! شكراً لك.' : 'Syllabus evaluation submitted successfully! Thank you.');
    } else if (activeTab === 'lecturer-self') {
      addNewLecturerSelfEvaluation({
        ...lseForm,
        date: new Date().toISOString().split('T')[0],
        overallScore: (lseForm.teachingSelfScore + lseForm.researchSelfScore + lseForm.communitySelfScore + lseForm.adminSelfScore) / 4
      });
      triggerToast(isAr ? 'تم تسجيل التقييم الذاتي لأعضاء هيئة التدريس!' : 'Lecturer self-evaluation registered!');
    } else if (activeTab === 'peer-reviews') {
      addNewPeerReview({
        ...prForm,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending Approval',
        arabicStatus: 'قيد الاعتماد'
      });
      triggerToast(isAr ? 'تم إرسال تقرير مراجعة الأقران الأكاديمي!' : 'Peer review academic report submitted!');
    } else if (activeTab === 'external-reviews') {
      addNewExternalReview({
        ...erForm,
        date: new Date().toISOString().split('T')[0],
        auditReportAttached: attachedFiles.length > 0,
        findingFiles: attachedFiles
      });
      triggerToast(isAr ? 'تم توثيق نتائج المراجعة الخارجية بنجاح!' : 'External review findings documented!');
    } else if (activeTab === 'objectives') {
      addNewQualityObjective({
        ...qoForm
      });
      triggerToast(isAr ? 'تم إضافة هدف جودة استراتيجي جديد!' : 'Strategic quality objective added!');
    }

    setIsAddModalOpen(false);
  };

  const handleTogglePeerReview = (id: string, newStatus: 'Approved' | 'Rejected') => {
    updatePeerReviewStatus(id, newStatus);
    triggerToast(
      isAr 
        ? `تم تحديث حالة تقرير مراجعة الأقران إلى: ${newStatus === 'Approved' ? 'معتمد' : 'مرفوض'}`
        : `Peer review report state set to: ${newStatus}`,
      'success'
    );
  };

  const canManageQuestions = useMemo(() => {
    return ['Platform Admin', 'Institution Admin', 'Quality Manager', 'Super Admin'].includes(actingRole);
  }, [actingRole]);

  const handleMoveQuestion = (qId: string, direction: 'up' | 'down') => {
    const typeQuestions = [...evaluationQuestions]
      .filter(q => q.evaluationType === selectedQuestionType)
      .sort((a, b) => a.order - b.order);
      
    const idx = typeQuestions.findIndex(q => q.id === qId);
    if (idx === -1) return;
    
    if (direction === 'up' && idx > 0) {
      const prev = { ...typeQuestions[idx - 1] };
      const curr = { ...typeQuestions[idx] };
      const tempOrder = curr.order;
      
      curr.order = prev.order;
      prev.order = tempOrder;
      
      if (curr.order === prev.order) {
        curr.order = prev.order - 1;
      }
      
      updateEvaluationQuestion(curr);
      updateEvaluationQuestion(prev);
      triggerToast(isAr ? 'تم تعديل ترتيب السؤال بنجاح' : 'Question order updated successfully');
    } else if (direction === 'down' && idx < typeQuestions.length - 1) {
      const next = { ...typeQuestions[idx + 1] };
      const curr = { ...typeQuestions[idx] };
      const tempOrder = curr.order;
      
      curr.order = next.order;
      next.order = tempOrder;
      
      if (curr.order === next.order) {
        curr.order = next.order + 1;
      }
      
      updateEvaluationQuestion(curr);
      updateEvaluationQuestion(next);
      triggerToast(isAr ? 'تم تعديل ترتيب السؤال بنجاح' : 'Question order updated successfully');
    }
  };

  const handleOpenAddQuestion = () => {
    const currentMaxOrder = evaluationQuestions
      .filter(q => q.evaluationType === selectedQuestionType)
      .reduce((max, q) => Math.max(max, q.order), 0);
      
    setEditingQuestion(null);
    setQuestionForm({
      textEn: '',
      textAr: '',
      isActive: true,
      evaluationType: selectedQuestionType,
      order: currentMaxOrder + 1
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setQuestionForm({
      textEn: q.textEn,
      textAr: q.textAr,
      isActive: q.isActive,
      evaluationType: q.evaluationType,
      order: q.order
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      updateEvaluationQuestion({
        ...editingQuestion,
        ...questionForm
      });
      triggerToast(isAr ? 'تم تحديث السؤال بنجاح' : 'Question updated successfully');
    } else {
      addNewEvaluationQuestion({
        ...questionForm
      });
      triggerToast(isAr ? 'تمت إضافة سؤال التقييم بنجاح' : 'Evaluation question added successfully');
    }
    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا السؤال؟' : 'Are you sure you want to delete this question?')) {
      deleteEvaluationQuestion(qId);
      triggerToast(isAr ? 'تم حذف السؤال بنجاح' : 'Question deleted successfully');
    }
  };

  const handleToggleQuestionActive = (q: any) => {
    updateEvaluationQuestion({
      ...q,
      isActive: !q.isActive
    });
    triggerToast(
      isAr 
        ? `تم ${!q.isActive ? 'تنشيط' : 'إلغاء تنشيط'} السؤال` 
        : `Question ${!q.isActive ? 'activated' : 'deactivated'} successfully`
    );
  };

  return (
    <div className="space-y-6" id="quality-evals-main">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm" id="evals-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <Award className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            {isAr ? 'التقييمات الأكاديمية وضمان الجودة' : 'Academic Evaluations & Quality SER'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isAr 
              ? 'تتبع الاستطلاعات الطلابية، مراجعة الأقران، التقييم الذاتي، ومؤشرات معايير الاعتماد البرامجي والأكاديمي'
              : 'Audit student feedback, lecturer self-evals, peer reviews, and accreditation metrics dynamically'}
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
          {canWrite && activeTab !== 'accreditation' && activeTab !== 'questions-config' && (
            <button 
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-xs font-bold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              <FilePlus className="h-4 w-4" />
              {activeTab === 'student-evals' 
                ? (isAr ? 'إجراء تقييم مقرر' : 'Evaluate Course Syllabus')
                : (isAr ? 'إضافة استمارة تقييم' : 'Submit Quality Record')
              }
            </button>
          )}
        </div>
      </div>

      {/* Directory Tab Switcher */}
      <div className="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 gap-1" id="evals-tabs-switch">
        {[
          { key: 'student-evals', label: isAr ? 'استطلاعات تقييم الطلاب' : 'Student Evaluations', icon: Star },
          { key: 'lecturer-self', label: isAr ? 'التقييم الذاتي للمحاضرين' : 'Lecturer Self Evals', icon: UserCheck },
          { key: 'peer-reviews', label: isAr ? 'تقييم ومراجعة الأقران' : 'Academic Peer Reviews', icon: Compass },
          { key: 'external-reviews', label: isAr ? 'تقارير المراجعة الخارجية' : 'External Reviews', icon: ShieldCheck },
          { key: 'objectives', label: isAr ? 'أهداف الجودة والمبادرات' : 'Quality Objectives', icon: CheckSquare },
          { key: 'accreditation', label: isAr ? 'معايير الاعتماد الأكاديمي' : 'Accreditation Standards', icon: Award },
          ...(canManageQuestions ? [{ key: 'questions-config', label: isAr ? 'إعدادات الاستمارات والأسئلة' : 'Dynamic Question Bank', icon: Settings }] : [])
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

      {/* Interactive Evaluation Statistics Dashboard Block (Only for Student Evals Tab) */}
      {activeTab === 'student-evals' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800" id="evals-aggregates-bento">
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="text-xs font-bold text-zinc-500">{isAr ? 'معدل رضا المقررات العام' : 'Course Overall Satisfaction'}</div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 mt-1">{seAverages.overall}%</div>
            <div className="text-[10px] text-zinc-400 mt-1">{isAr ? 'محسوب من 5 ركائز تعليمية' : 'Aggregated from 5 educational pillars'}</div>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-[10px] font-bold text-zinc-500 mb-2">{isAr ? 'وضوح الأهداف والمنهج' : 'Syllabus & Objectives Clarity'}</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-bold">{seAverages.q1}/5.0</span>
              <div className="w-24 bg-zinc-100 h-2 rounded overflow-hidden">
                <div className="bg-zinc-900 h-full" style={{ width: `${(parseFloat(seAverages.q1) || 5) * 20}%` }}></div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-[10px] font-bold text-zinc-500 mb-2">{isAr ? 'تنظيم الدرس والمحتوى' : 'Organization & Structuring'}</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-bold">{seAverages.q2}/5.0</span>
              <div className="w-24 bg-zinc-100 h-2 rounded overflow-hidden">
                <div className="bg-zinc-900 h-full" style={{ width: `${(parseFloat(seAverages.q2) || 5) * 20}%` }}></div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-[10px] font-bold text-zinc-500 mb-2">{isAr ? 'ملاءمة أسلوب التقييم' : 'Fairness of Assessments'}</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-bold">{seAverages.q3}/5.0</span>
              <div className="w-24 bg-zinc-100 h-2 rounded overflow-hidden">
                <div className="bg-zinc-900 h-full" style={{ width: `${(parseFloat(seAverages.q3) || 5) * 20}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Area */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4" id="evals-filters">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input 
            type="text"
            placeholder={isAr ? 'البحث بالاسم أو الهيئة...' : 'Search objectives, findings...'}
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
            <option value="ALL">{isAr ? 'كل الحالات والأنواع' : 'All Statuses & Sentiments'}</option>
            {activeTab === 'student-evals' && (
              <>
                <option value="Positive">{isAr ? 'إيجابي' : 'Positive Feedback'}</option>
                <option value="Neutral">{isAr ? 'حيادي' : 'Neutral Feedback'}</option>
                <option value="Negative">{isAr ? 'بحاجة إلى تدخل' : 'Negative Feedback'}</option>
              </>
            )}
            {activeTab === 'peer-reviews' && (
              <>
                <option value="Pending Approval">{isAr ? 'قيد التدقيق' : 'Pending Approval'}</option>
                <option value="Approved">{isAr ? 'معتمد' : 'Approved'}</option>
                <option value="Rejected">{isAr ? 'مرفوض' : 'Rejected'}</option>
              </>
            )}
            {activeTab === 'objectives' && (
              <>
                <option value="In Progress">{isAr ? 'قيد التنفيذ' : 'In Progress'}</option>
                <option value="Achieved">{isAr ? 'مكتمل بنجاح' : 'Achieved'}</option>
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

      {/* Main Table / Grid Cards Layout */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden" id="evals-data-container">
        {activeTab === 'questions-config' ? (
          <div className="p-6 space-y-6" id="questions-config-board">
            {/* Upper control bar with evaluation type selection and Add Question button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col space-y-1.5 flex-1 max-w-md">
                <label className="text-xs font-extrabold text-zinc-500">{isAr ? 'نوع الاستمارة / التقييم المستهدف' : 'Target Evaluation Form Type'}</label>
                <select
                  value={selectedQuestionType}
                  onChange={(e) => setSelectedQuestionType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-bold focus:ring-1 focus:ring-zinc-950"
                >
                  {[
                    { key: 'Student evaluates Lecturer', label: isAr ? 'طالب يقيم محاضر (Student evaluates Lecturer)' : 'Student evaluates Lecturer' },
                    { key: 'Student evaluates Course', label: isAr ? 'طالب يقيم مقرر (Student evaluates Course)' : 'Student evaluates Course' },
                    { key: 'Student evaluates Laboratory', label: isAr ? 'طالب يقيم مختبر (Student evaluates Laboratory)' : 'Student evaluates Laboratory' },
                    { key: 'Student evaluates Training', label: isAr ? 'طالب يقيم تدريب (Student evaluates Training)' : 'Student evaluates Training' },
                    { key: 'Lecturer Self Evaluation', label: isAr ? 'التقييم الذاتي للمحاضر (Lecturer Self Evaluation)' : 'Lecturer Self Evaluation' },
                    { key: 'Peer Evaluation', label: isAr ? 'تقييم الأقران (Peer Evaluation)' : 'Peer Evaluation' },
                    { key: 'Department Evaluation', label: isAr ? 'تقييم القسم (Department Evaluation)' : 'Department Evaluation' },
                    { key: 'External Review Evaluation', label: isAr ? 'المراجعة الخارجية (External Review Evaluation)' : 'External Review Evaluation' }
                  ].map(item => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleOpenAddQuestion}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-xs font-bold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 self-end sm:self-center"
              >
                <Plus className="h-4 w-4" />
                {isAr ? 'إضافة سؤال جديد' : 'Create Custom Question'}
              </button>
            </div>

            {/* List of Questions in the selected category */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-zinc-500">
                  {isAr ? 'الأسئلة الحالية والترتيب الأكاديمي' : 'Active Questions & Academic Sequencing'}
                </span>
                <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
                  {evaluationQuestions.filter(q => q.evaluationType === selectedQuestionType).length} {isAr ? 'سؤال' : 'Questions'}
                </span>
              </div>

              {evaluationQuestions.filter(q => q.evaluationType === selectedQuestionType).length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                  <AlertTriangle className="h-8 w-8 text-zinc-400 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-500">
                    {isAr ? 'لا توجد أسئلة مخصصة بعد في هذه الفئة.' : 'No custom questions added yet in this category.'}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {isAr ? 'سيتم استخدام الأسئلة الافتراضية للمستأجر تلقائياً.' : 'The tenant default evaluation questions will be served instead.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {evaluationQuestions
                    .filter(q => q.evaluationType === selectedQuestionType)
                    .sort((a, b) => a.order - b.order)
                    .map((q, idx, arr) => (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                          q.isActive
                            ? 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                            : 'bg-zinc-50/50 dark:bg-zinc-900/10 border-zinc-200 dark:border-zinc-800 opacity-60'
                        }`}
                      >
                        {/* Left Side: Index & Text */}
                        <div className="flex items-start gap-3 flex-1">
                          <span className="font-mono text-xs font-extrabold bg-zinc-100 dark:bg-zinc-850 text-zinc-500 w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="space-y-1.5 flex-1">
                            {/* Bilingual texts */}
                            <div>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Arabic (AR)</span>
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-relaxed text-right" dir="rtl">
                                {q.textAr}
                              </p>
                            </div>
                            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-1">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">English (EN)</span>
                              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                {q.textEn}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Quick Toggles, Move Controls & CRUD Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-zinc-900">
                          {/* Active Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleQuestionActive(q)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                              q.isActive
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {q.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
                          </button>

                          {/* Order Sequencing controls */}
                          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-50 dark:bg-zinc-900">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveQuestion(q.id, 'up')}
                              className={`p-1 rounded-md text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none`}
                              title={isAr ? 'تحريك للأعلى' : 'Move Up'}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-[10px] font-mono font-bold px-1 text-zinc-400">
                              {q.order}
                            </span>
                            <button
                              type="button"
                              disabled={idx === arr.length - 1}
                              onClick={() => handleMoveQuestion(q.id, 'down')}
                              className={`p-1 rounded-md text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none`}
                              title={isAr ? 'تحريك للأسفل' : 'Move Down'}
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Edit / Delete Buttons */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditQuestion(q)}
                            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-850 text-indigo-600 dark:text-indigo-400"
                            title={isAr ? 'تعديل' : 'Edit'}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-850 text-red-600 dark:text-red-400"
                            title={isAr ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'accreditation' ? (
          /* Accreditation Standards Checklist rendering is unique */
          <div className="p-6 space-y-6" id="standards-progress-board">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredData.map((std: AccreditationStandard) => {
                const percent = Math.min(100, Math.round(std.compliancePercentage || 0));
                return (
                  <div key={std.id} className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-bold text-zinc-400">{std.code}</span>
                        <h4 className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50 mt-0.5">
                          {isAr ? std.arabicTitle : std.title}
                        </h4>
                      </div>
                      <span className="text-xs font-bold bg-zinc-200 dark:bg-zinc-800 px-2.5 py-0.5 rounded">
                        {percent}%
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500 space-y-1">
                      <div>
                        <span className="font-bold">{isAr ? 'تحليل الفجوات: ' : 'Gap Analysis: '}</span>
                        <span>{std.gapAnalysis}</span>
                      </div>
                      <div>
                        <span className="font-bold">{isAr ? 'خطة التطوير: ' : 'Improvement Plan: '}</span>
                        <span>{std.improvementPlan}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-semibold text-zinc-500">
                        <span>{isAr ? 'معدل المطابقة والاستيفاء' : 'Compliance Rate'}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-850 h-2 rounded overflow-hidden">
                        <div className="bg-zinc-900 dark:bg-zinc-100 h-full transition-all" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <span>{isAr ? 'مستوى تقدم الإنجاز' : 'Implementation progress'}: <strong className="text-zinc-800 dark:text-zinc-200">{std.progressTracking || 0}%</strong></span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        {isAr ? 'مستوفى داخلياً' : 'Verified Internally'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
                  {activeTab === 'student-evals' && (
                    <>
                      <th className="p-4">{isAr ? 'تاريخ التقييم' : 'Submission Date'}</th>
                      <th className="p-4">{isAr ? 'رأي الطالب وملاحظاته' : 'Written Feedback'}</th>
                      <th className="p-4 text-center">{isAr ? 'الدرجة المتوسطة' : 'Score'}</th>
                      <th className="p-4">{isAr ? 'تحليل المشاعر' : 'Sentiment Analyzed'}</th>
                    </>
                  )}

                  {activeTab === 'lecturer-self' && (
                    <>
                      <th className="p-4">{isAr ? 'الأكاديمي' : 'Lecturer Profile'}</th>
                      <th className="p-4">{isAr ? 'الأهداف الفردية للعام الدراسي' : 'Personal Strategic Goals'}</th>
                      <th className="p-4 text-center">{isAr ? 'تقييم التدريس' : 'Teaching'}</th>
                      <th className="p-4 text-center">{isAr ? 'تقييم البحث' : 'Research'}</th>
                      <th className="p-4 text-center">{isAr ? 'تقييم المشاركة' : 'Community'}</th>
                    </>
                  )}

                  {activeTab === 'peer-reviews' && (
                    <>
                      <th className="p-4">{isAr ? 'عضو هيئة التدريس المستهدف' : 'Target Faculty'}</th>
                      <th className="p-4">{isAr ? 'درجة المنهج' : 'Syllabus Score'}</th>
                      <th className="p-4">{isAr ? 'درجة التدريس' : 'Teaching Method'}</th>
                      <th className="p-4">{isAr ? 'درجة التقييمات' : 'Assessment'}</th>
                      <th className="p-4">{isAr ? 'حالة المراجعة والاعتماد' : 'Review Status'}</th>
                      {['Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean'].includes(actingRole) && <th className="p-4 text-right">{isAr ? 'الاعتماد السريع' : 'Approve Review'}</th>}
                    </>
                  )}

                  {activeTab === 'external-reviews' && (
                    <>
                      <th className="p-4">{isAr ? 'هيئة الرقابة الخارجية' : 'Reviewing Agency'}</th>
                      <th className="p-4">{isAr ? 'المدة الزمنية' : 'Audit Period'}</th>
                      <th className="p-4 text-center">{isAr ? 'الدرجة الشاملة' : 'Score'}</th>
                      <th className="p-4">{isAr ? 'نقاط القوة' : 'Strengths Highlighted'}</th>
                      <th className="p-4">{isAr ? 'حالة الامتثال' : 'Compliance'}</th>
                    </>
                  )}

                  {activeTab === 'objectives' && (
                    <>
                      <th className="p-4">{isAr ? 'المبادرة أو الهدف' : 'Objective Initiative'}</th>
                      <th className="p-4">{isAr ? 'المقدار الحالي' : 'Current'}</th>
                      <th className="p-4">{isAr ? 'الهدف المعياري' : 'Target'}</th>
                      <th className="p-4">{isAr ? 'التقدم الإجمالي' : 'Progress'}</th>
                      <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
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
                  paginatedData.map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100">
                      {activeTab === 'student-evals' && (
                        <>
                          <td className="p-4 font-mono font-semibold text-zinc-500">{item.date}</td>
                          <td className="p-4 font-medium italic text-zinc-850 dark:text-zinc-100 max-w-[280px] truncate">{item.writtenFeedback || (isAr ? 'لا توجد تعليقات مكتوبة' : 'No commentary added')}</td>
                          <td className="p-4 text-center font-mono font-bold text-zinc-900 dark:text-zinc-50">
                            {((item.overallScore || 4.5) * 20).toFixed(0)}%
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.sentiment === 'Positive' 
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700' 
                                : item.sentiment === 'Neutral' 
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600' 
                                : 'bg-red-100 dark:bg-red-950/40 text-red-700'
                            }`}>
                              {item.sentiment}
                            </span>
                          </td>
                        </>
                      )}

                      {activeTab === 'lecturer-self' && (
                        <>
                          <td className="p-4 font-semibold text-zinc-950 dark:text-zinc-50">
                            {isAr ? 'التقييم الذاتي السنوي' : 'Lecturer Self-Assessment'}
                          </td>
                          <td className="p-4 text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
                            {isAr ? item.arabicPersonalGoals : item.personalGoals}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300">{item.teachingSelfScore}/5</td>
                          <td className="p-4 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300">{item.researchSelfScore}/5</td>
                          <td className="p-4 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300">{item.communitySelfScore}/5</td>
                        </>
                      )}

                      {activeTab === 'peer-reviews' && (
                        <>
                          <td className="p-4 font-semibold text-zinc-950 dark:text-zinc-50">
                            {isAr ? 'عضو هيئة تدريس' : 'Peer Academic Review'}
                          </td>
                          <td className="p-4 text-center font-mono">{item.syllabusScore}%</td>
                          <td className="p-4 text-center font-mono">{item.teachingMethodScore}%</td>
                          <td className="p-4 text-center font-mono">{item.assessmentScore}%</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Approved' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : item.status === 'Rejected' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {isAr ? item.arabicStatus : item.status}
                            </span>
                          </td>
                          {['Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean'].includes(actingRole) && (
                            <td className="p-4 text-right">
                              {item.status === 'Pending Approval' && (
                                <div className="flex justify-end gap-1">
                                  <button 
                                    onClick={() => handleTogglePeerReview(item.id, 'Approved')}
                                    className="px-2 py-1 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-[10px]"
                                  >
                                    {isAr ? 'اعتماد' : 'Approve'}
                                  </button>
                                  <button 
                                    onClick={() => handleTogglePeerReview(item.id, 'Rejected')}
                                    className="px-2 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-700 text-[10px]"
                                  >
                                    {isAr ? 'رفض' : 'Reject'}
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </>
                      )}

                      {activeTab === 'external-reviews' && (
                        <>
                          <td className="p-4 font-semibold text-zinc-950 dark:text-zinc-50">
                            {isAr ? item.arabicAgencyName : item.agencyName}
                          </td>
                          <td className="p-4 font-mono text-zinc-500">
                            {item.reviewStartDate} - {item.reviewEndDate}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {item.overallScore}%
                          </td>
                          <td className="p-4 text-zinc-500 truncate max-w-[200px]">{item.strengths}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                              {isAr ? item.arabicStatus : item.status}
                            </span>
                          </td>
                        </>
                      )}

                      {activeTab === 'objectives' && (
                        <>
                          <td className="p-4 font-semibold text-zinc-950 dark:text-zinc-50">
                            {isAr ? item.arabicTitle : item.title}
                          </td>
                          <td className="p-4 font-mono">{item.currentValue} {item.unit}</td>
                          <td className="p-4 font-mono">{item.targetValue} {item.unit}</td>
                          <td className="p-4">
                            <div className="w-24 bg-zinc-100 dark:bg-zinc-800 h-2 rounded overflow-hidden">
                              <div className="bg-zinc-900 dark:bg-zinc-100 h-full" style={{ width: `${Math.min(100, Math.round((parseFloat(item.currentValue) / (parseFloat(item.targetValue) || 1)) * 100))}%` }}></div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">
                              {isAr ? item.arabicStatus : item.status}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && activeTab !== 'questions-config' && (
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

      {/* Evaluation Interact Modal Dialog */}
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
                  {activeTab === 'student-evals' 
                    ? (isAr ? 'استبيان تقييم الطالب لمحتوى المنهج والأكاديمي' : 'Course Syllabus Student Questionnaire')
                    : (isAr ? 'تقديم مستند تقييم جودة' : 'Register Evaluation Data')
                  }
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdd} className="p-6 space-y-4">
                {activeTab === 'student-evals' && (
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">{isAr ? 'المقرر الأكاديمي المراد تقييمه' : 'Course Module to Evaluate'}</label>
                        <select 
                          value={seForm.courseId}
                          onChange={(e) => setSeForm(prev => ({ ...prev, courseId: e.target.value }))}
                          className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                        >
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>{isAr ? c.arabicName : c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">{isAr ? 'الفصل الأكاديمي' : 'Academic Term'}</label>
                        <input 
                          type="text" required
                          value={seForm.term}
                          onChange={(e) => setSeForm(prev => ({ ...prev, term: e.target.value }))}
                          className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                        />
                      </div>
                    </div>

                    {/* Question Pillars Rating */}
                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-3">
                      <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{isAr ? 'ركائز التقييم الخمس' : 'Rate the following on a scale of 1 to 5:'}</h4>
                      
                      {[
                        { key: 'q1', label: isAr ? '1. وضوح خطة المساق والمخرجات التعليمية المقررة (CLOs)' : '1. Clarity of Course Syllabus and Learning Outcomes (CLOs)' },
                        { key: 'q2', label: isAr ? '2. التزام المحاضر بالخطة الزمنية وتسليم المادة التدريسية' : '2. Structure, organization, and execution of syllabus schedule' },
                        { key: 'q3', label: isAr ? '3. ملاءمة وعدالة نظام الاختبارات والتقييم والتدريب العملي' : '3. Adequacy and fairness of exam alignment with criteria' },
                        { key: 'q4', label: isAr ? '4. الدعم والتوجيه المقدم من المحاضر والساعات المكتبية' : '4. Instructor feedback and interactive office hours utility' },
                        { key: 'q5', label: isAr ? '5. جودة المراجع العلمية والمصادر الإضافية المستخدمة' : '5. Resources, reading material quality, and reference value' }
                      ].map((item) => (
                        <div key={item.key} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900/50 gap-2">
                          <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setSeForm(prev => ({ ...prev, [item.key]: val }))}
                                className={`h-6 w-6 text-xs font-bold rounded flex items-center justify-center border ${
                                  (seForm as any)[item.key] === val
                                    ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 border-transparent'
                                    : 'bg-white text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 hover:bg-zinc-100'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold">{isAr ? 'ملاحظات وتوصيات إضافية (اختياري)' : 'Additional Written Feedback (Optional)'}</label>
                      <textarea 
                        rows={3}
                        value={seForm.writtenFeedback}
                        onChange={(e) => setSeForm(prev => ({ ...prev, writtenFeedback: e.target.value }))}
                        placeholder={isAr ? 'اكتب انطباعك بوضوح للمساهمة في تحسين جودة المساق الأكاديمي...' : 'Provide construct feedback to improve academic alignment...'}
                        className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'lecturer-self' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'المقرر' : 'Syllabus Course'}</label>
                      <select 
                        value={lseForm.courseId}
                        onChange={(e) => setLseForm(prev => ({ ...prev, courseId: e.target.value }))}
                        className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                      >
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{isAr ? c.arabicName : c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'الترم الدراسي' : 'Term'}</label>
                      <input 
                        type="text" required
                        value={lseForm.term}
                        onChange={(e) => setLseForm(prev => ({ ...prev, term: e.target.value }))}
                        className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-2 gap-2 border-t pt-2">
                      <div>
                        <label className="block text-[10px] font-bold">{isAr ? 'كفاءة التدريس' : 'Teaching Self Score (1-5)'}</label>
                        <input type="number" min="1" max="5" value={lseForm.teachingSelfScore} onChange={e => setLseForm(p => ({ ...p, teachingSelfScore: parseInt(e.target.value) }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold">{isAr ? 'النشاط البحثي' : 'Research Self Score (1-5)'}</label>
                        <input type="number" min="1" max="5" value={lseForm.researchSelfScore} onChange={e => setLseForm(p => ({ ...p, researchSelfScore: parseInt(e.target.value) }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'الأهداف الفردية للعام الأكاديمي' : 'SaaS Individual Strategic Goals'}</label>
                      <textarea rows={3} value={lseForm.personalGoals} onChange={e => setLseForm(p => ({ ...p, personalGoals: e.target.value, arabicPersonalGoals: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                  </div>
                )}

                {activeTab === 'peer-reviews' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'المقرر' : 'Syllabus Course'}</label>
                      <select 
                        value={prForm.courseId}
                        onChange={(e) => setPrForm(prev => ({ ...prev, courseId: e.target.value }))}
                        className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border"
                      >
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{isAr ? c.arabicName : c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'درجة مطابقة المنهج (0-100)' : 'Syllabus Score (0-100)'}</label>
                      <input type="number" value={prForm.syllabusScore} onChange={e => setPrForm(p => ({ ...p, syllabusScore: parseInt(e.target.value) }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'ملاحظات المراجع' : 'Reviewer Comments'}</label>
                      <textarea rows={3} value={prForm.comments} onChange={e => setPrForm(p => ({ ...p, comments: e.target.value, arabicComments: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                  </div>
                )}

                {activeTab === 'external-reviews' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'الجهة المدققة' : 'External Auditing Board'}</label>
                      <input type="text" value={erForm.agencyName} onChange={e => setErForm(p => ({ ...p, agencyName: e.target.value, arabicAgencyName: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'الدرجة الكلية الممنوحة' : 'Overall Audit Score (0-100)'}</label>
                      <input type="number" value={erForm.overallScore} onChange={e => setErForm(p => ({ ...p, overallScore: parseInt(e.target.value) }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'أهم التوصيات والمخرجات' : 'Agreed Strengths & Findings'}</label>
                      <textarea rows={3} value={erForm.strengths} onChange={e => setErForm(p => ({ ...p, strengths: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                  </div>
                )}

                {activeTab === 'objectives' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'عنوان هدف الجودة (EN)' : 'Quality Objective Title (EN)'}</label>
                      <input type="text" required value={qoForm.title} onChange={e => setQoForm(p => ({ ...p, title: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'عنوان هدف الجودة (AR)' : 'Quality Objective Title (AR)'}</label>
                      <input type="text" required value={qoForm.arabicTitle} onChange={e => setQoForm(p => ({ ...p, arabicTitle: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'المقدار الحالي المستهدف' : 'Current Value'}</label>
                      <input type="number" value={qoForm.currentValue} onChange={e => setQoForm(p => ({ ...p, currentValue: parseInt(e.target.value) }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'المعيار المستهدف النهائي' : 'Target Metric'}</label>
                      <input type="number" value={qoForm.targetValue} onChange={e => setQoForm(p => ({ ...p, targetValue: parseInt(e.target.value) }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                  </div>
                )}

                {/* Submit Controls */}
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
                    {isAr ? 'إرسال التقرير' : 'Submit Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Question Config Modal */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" id="question-editor-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <h3 className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-indigo-500" />
                  {editingQuestion 
                    ? (isAr ? 'تعديل سؤال الاستمارة' : 'Modify Evaluation Question') 
                    : (isAr ? 'إضافة سؤال جديد للاستمارة' : 'Create Custom Evaluation Question')}
                </h3>
                <button type="button" onClick={() => setIsQuestionModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="p-6 space-y-5">
                {/* Selected target evaluation form type - read-only in edit, dropdown in add */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">{isAr ? 'نوع الاستمارة المستهدفة' : 'Evaluation Category Form'}</label>
                  <select
                    value={questionForm.evaluationType}
                    disabled={!!editingQuestion}
                    onChange={e => setQuestionForm(p => ({ ...p, evaluationType: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded bg-zinc-50 border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-700 disabled:opacity-60"
                  >
                    {[
                      { key: 'Student evaluates Lecturer', label: isAr ? 'طالب يقيم محاضر (Student evaluates Lecturer)' : 'Student evaluates Lecturer' },
                      { key: 'Student evaluates Course', label: isAr ? 'طالب يقيم مقرر (Student evaluates Course)' : 'Student evaluates Course' },
                      { key: 'Student evaluates Laboratory', label: isAr ? 'طالب يقيم مختبر (Student evaluates Laboratory)' : 'Student evaluates Laboratory' },
                      { key: 'Student evaluates Training', label: isAr ? 'طالب يقيم تدريب (Student evaluates Training)' : 'Student evaluates Training' },
                      { key: 'Lecturer Self Evaluation', label: isAr ? 'التقييم الذاتي للمحاضر (Lecturer Self Evaluation)' : 'Lecturer Self Evaluation' },
                      { key: 'Peer Evaluation', label: isAr ? 'تقييم الأقران (Peer Evaluation)' : 'Peer Evaluation' },
                      { key: 'Department Evaluation', label: isAr ? 'تقييم القسم (Department Evaluation)' : 'Department Evaluation' },
                      { key: 'External Review Evaluation', label: isAr ? 'المراجعة الخارجية (External Review Evaluation)' : 'External Review Evaluation' }
                    ].map(item => (
                      <option key={item.key} value={item.key}>{item.label}</option>
                    ))}
                  </select>
                </div>

                {/* Question English text */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">{isAr ? 'السؤال باللغة الإنجليزية (EN)' : 'Question English Text (EN)'}</label>
                  <textarea
                    rows={2}
                    required
                    value={questionForm.textEn}
                    onChange={e => setQuestionForm(p => ({ ...p, textEn: e.target.value }))}
                    placeholder="e.g. The lecturer communicates the subject clearly and effectively."
                    className="w-full text-xs p-2.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 leading-relaxed font-sans"
                  />
                </div>

                {/* Question Arabic text */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">{isAr ? 'السؤال باللغة العربية (AR)' : 'Question Arabic Text (AR)'}</label>
                  <textarea
                    rows={2}
                    required
                    value={questionForm.textAr}
                    onChange={e => setQuestionForm(p => ({ ...p, textAr: e.target.value }))}
                    placeholder="مثال: يلتزم المحاضر بالساعات المكتبية المخصصة لإرشاد ومساعدة الطلاب."
                    className="w-full text-xs p-2.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 leading-relaxed font-sans text-right"
                    dir="rtl"
                  />
                </div>

                {/* Quick numeric fields like Order & Active state */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">{isAr ? 'ترتيب الظهور التسلسلي' : 'Display Sequence Order'}</label>
                    <input
                      type="number"
                      required
                      value={questionForm.order}
                      onChange={e => setQuestionForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                      className="w-full text-xs p-2.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="inline-flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <input
                        type="checkbox"
                        checked={questionForm.isActive}
                        onChange={e => setQuestionForm(p => ({ ...p, isActive: e.target.checked }))}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {isAr ? 'حالة النشاط الفوري' : 'Active Immediately'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Controls */}
                <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-xs font-bold text-white dark:text-zinc-900 hover:bg-zinc-800"
                  >
                    {isAr ? 'حفظ التعديلات' : 'Save Question'}
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
