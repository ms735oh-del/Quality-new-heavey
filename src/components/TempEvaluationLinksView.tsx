/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Link2,
  Plus,
  QrCode,
  Users,
  Clock,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  X,
  FileCheck,
  Send,
  UserCheck,
  Eye,
  Star,
  Trash,
  Play,
  Check,
  Archive,
  HelpCircle,
  Sliders,
  ShieldAlert
} from 'lucide-react';

interface TempLink {
  id: string;
  code: string;
  institutionId?: string;
  evaluationType: string;
  faculty: string;
  department: string;
  program: string;
  course: string;
  lecturer: string;
  academicLevel: string;
  semester: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  maxResponses: number;
  singleDevice: boolean;
  oneSubmissionPerStudent: boolean;
  anonymous: boolean;
  passwordProtected: boolean;
  password?: string;
  qrCodeUrl: string;
  shortUrl: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Active' | 'Expired' | 'Closed' | 'Completed' | 'Archived';
  responseCount: number;
  ratingScale?: string;
  resultVisibility?: string;
  reportPermissions?: string;
  allowedStudents?: string;
  questionsList?: Array<{
    id: string;
    textEn: string;
    textAr: string;
    category: string;
    weight: number;
    required: boolean;
  }>;
}

const mapCampaignTypeToQuestionType = (campType: string): string => {
  switch (campType) {
    case 'Lecturer Evaluation':
      return 'Student evaluates Lecturer';
    case 'Course Evaluation':
      return 'Student evaluates Course';
    case 'Laboratory Evaluation':
      return 'Student evaluates Laboratory';
    case 'Training Evaluation':
      return 'Student evaluates Training';
    case 'Self Assessment':
    case 'Lecturer Self Evaluation':
      return 'Lecturer Self Evaluation';
    case 'Peer Review':
    case 'Peer Evaluation':
      return 'Peer Evaluation';
    default:
      return 'Student evaluates Lecturer';
  }
};

export const TempEvaluationLinksView: React.FC = () => {
  const { language, activeInstitution, lecturers, evaluationQuestions } = useApp();
  const [links, setLinks] = useState<TempLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'admin' | 'student'>('admin');

  // Fallback default lecturers if none exist in active context
  const defaultLecturers = [
    { id: 'l1', name: 'Dr. Emily Watson', arabicName: 'د. إيميلي واتسون' },
    { id: 'l2', name: 'Dr. Alistair Vance', arabicName: 'د. أليستير فانس' },
    { id: 'l3', name: 'Prof. Charles Higgins', arabicName: 'أ.د. تشارلز هيجينز' }
  ];
  const displayLecturers = lecturers && lecturers.length > 0 ? lecturers : defaultLecturers;

  // Form states for Link Generation
  const [evaluationType, setEvaluationType] = useState('Lecturer Evaluation');
  const [faculty, setFaculty] = useState('Faculty of Engineering');
  const [department, setDepartment] = useState('Computer Science');
  const [program, setProgram] = useState('B.Sc. Computer Science');
  const [course, setCourse] = useState('CS402 - Artificial Intelligence');
  
  // Multiple selected lecturers state
  const [selectedLecturers, setSelectedLecturers] = useState<string[]>(['Dr. Emily Watson']);
  
  const [academicLevel, setAcademicLevel] = useState('Level 4');
  const [semester, setSemester] = useState('Semester 2, 2026');
  
  // Dynamic default dates to ensure generated links are never expired upon creation
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState(() => {
    const future = new Date();
    future.setDate(future.getDate() + 14); // 14 days from now
    return future.toISOString().split('T')[0];
  });
  const [endTime, setEndTime] = useState('17:00');
  
  const [maxResponses, setMaxResponses] = useState(100);
  const [singleDevice, setSingleDevice] = useState(true);
  const [oneSubmissionPerStudent, setOneSubmissionPerStudent] = useState(true);
  const [anonymous, setAnonymous] = useState(true);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');

  // Extended Evaluation Settings
  const [ratingScale, setRatingScale] = useState('Likert');
  const [allowedStudents, setAllowedStudents] = useState('All');
  const [resultVisibility, setResultVisibility] = useState('Admin & Lecturer');
  const [reportPermissions, setReportPermissions] = useState('Quality Committee');
  const [initialStatus, setInitialStatus] = useState<'Draft' | 'Under Review' | 'Approved' | 'Active'>('Active');

  // Custom Questionnaire Design State
  const [selectedQuestions, setSelectedQuestions] = useState<Array<{
    id: string;
    textEn: string;
    textAr: string;
    category: string;
    weight: number;
    required: boolean;
  }>>([]);

  // Generated Link Success Modal
  const [generatedLink, setGeneratedLink] = useState<TempLink | null>(null);

  // Student Evaluation Gateway States
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [activeStudentLink, setActiveStudentLink] = useState<TempLink | null>(null);
  const [studentId, setStudentId] = useState('');
  const [studentPass, setStudentPass] = useState('');
  
  // Multi-lecturer evaluation state
  const [evaluations, setEvaluations] = useState<Record<string, Record<string, string | number>>>({});
  
  const [studentComments, setStudentComments] = useState('');
  const [studentError, setStudentError] = useState('');
  const [studentSuccessMsg, setStudentSuccessMsg] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Fallback defaults if no questions exist
  const FALLBACK_QUESTIONS = [
    {
      id: 'q1',
      textEn: 'Commitment to lecture times and prompt organization',
      textAr: 'الالتزام بمواعيد المحاضرات والتنظيم الأكاديمي واللقاءات',
      category: 'Teaching Quality'
    },
    {
      id: 'q2',
      textEn: 'Clarity of explanations, presentation quality, and teaching tools',
      textAr: 'وضوح الشرح وجودة العرض والأدوات والوسائل التعليمية المستخدمة',
      category: 'Course Content'
    },
    {
      id: 'q3',
      textEn: 'Responsiveness, interactive engagement, and office support',
      textAr: 'التجاوب مع أسئلة الطلاب والدعم والتفاعل الفعال في الساعات المكتبية',
      category: 'Instructor Engagement'
    },
    {
      id: 'q4',
      textEn: 'Fairness and objectivity in grading and homework assessments',
      textAr: 'العدالة والموضوعية في تقييم تكليفات واختبارات الطلاب وتوزيع الدرجات',
      category: 'Assessment'
    }
  ];

  // Auto-populate questionnaire when evaluation type or institution questions change
  useEffect(() => {
    const mappedType = mapCampaignTypeToQuestionType(evaluationType);
    let filtered = evaluationQuestions.filter(q => q.evaluationType === mappedType && q.isActive);
    
    if (filtered.length === 0) {
      // populate with fallbacks
      setSelectedQuestions(FALLBACK_QUESTIONS.map(q => ({
        id: q.id,
        textEn: q.textEn,
        textAr: q.textAr,
        category: q.category,
        weight: 1,
        required: true
      })));
    } else {
      setSelectedQuestions(filtered.map(q => ({
        id: q.id,
        textEn: q.textEn,
        textAr: q.textAr,
        category: 'Core Dimension',
        weight: 1,
        required: true
      })));
    }
  }, [evaluationType, evaluationQuestions, activeInstitution]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      // Append activeInstitution.id to isolate data securely
      const res = await fetch(`/api/temp-links?institutionId=${activeInstitution.id}`);
      const data = await res.json();
      if (data.success) {
        setLinks(data.links);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [activeInstitution]);

  // Initialize evaluations structure when the student evaluation opens
  useEffect(() => {
    if (activeStudentLink) {
      const names = activeStudentLink.lecturer.split(',').map(s => s.trim());
      const initialEvals: Record<string, Record<string, string | number>> = {};
      const targetQuestions = activeStudentLink.questionsList && activeStudentLink.questionsList.length > 0 
        ? activeStudentLink.questionsList 
        : FALLBACK_QUESTIONS;

      names.forEach(name => {
        initialEvals[name] = {};
        targetQuestions.forEach(q => {
          if (activeStudentLink.ratingScale === '5-Stars') {
            initialEvals[name][q.id] = 5;
          } else if (activeStudentLink.ratingScale === 'Slider') {
            initialEvals[name][q.id] = 8;
          } else if (activeStudentLink.ratingScale === 'Binary') {
            initialEvals[name][q.id] = 'Yes';
          } else {
            initialEvals[name][q.id] = 'Excellent';
          }
        });
      });
      setEvaluations(initialEvals);
    }
  }, [activeStudentLink]);

  const handleRatingChange = (lecturerName: string, questionId: string, value: string | number) => {
    setEvaluations(prev => ({
      ...prev,
      [lecturerName]: {
        ...(prev[lecturerName] || {}),
        [questionId]: value
      }
    }));
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestions.length === 0) {
      alert(language === 'ar' ? 'الرجاء اختيار سؤال واحد على الأقل للاستمارة!' : 'Please select at least one question for the template!');
      return;
    }

    try {
      const res = await fetch('/api/temp-links/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationType, faculty, department, program, course, 
          lecturer: selectedLecturers.join(', '), 
          academicLevel, semester, startDate, startTime, endDate, endTime,
          maxResponses, singleDevice, oneSubmissionPerStudent, anonymous, passwordProtected, password,
          institution: activeInstitution.id,
          user: 'Quality Manager',
          ratingScale,
          resultVisibility,
          reportPermissions,
          allowedStudents,
          questionsList: selectedQuestions,
          initialStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedLink(data.link);
        fetchLinks();
        // Log action on system
        await fetch('/api/server-logs/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'Generate Evaluation Form Campaign',
            institution: activeInstitution.name,
            user: 'Quality Manager',
            details: `Created campaign ${data.link.code} for ${course} (${initialStatus})`
          })
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/temp-links/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          institution: activeInstitution.id,
          user: 'Quality Manager'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchLinks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الاستمارة نهائياً؟' : 'Are you sure you want to permanently delete this evaluation campaign?')) return;
    try {
      const res = await fetch('/api/temp-links/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          institution: activeInstitution.id,
          user: 'Quality Manager'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchLinks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLookupStudentLink = () => {
    setStudentError('');
    setStudentSuccessMsg('');
    if (!studentCodeInput.trim()) {
      setStudentError(language === 'ar' ? 'الرجاء إدخال رمز صحيح.' : 'Please enter a valid link code.');
      return;
    }

    const match = links.find(l => l.code.toUpperCase() === studentCodeInput.trim().toUpperCase());
    if (!match) {
      setStudentError(language === 'ar' ? 'الكود المدخل غير مطابق لأي تقييم نشط.' : 'The specified code does not match any active evaluation.');
      return;
    }

    // Admins can test/preview Draft or Approved links, but students can only access Active links
    if (match.status !== 'Active' && match.status !== 'Approved' && match.status !== 'Draft') {
      setStudentError(language === 'ar' ? 'هذا التقييم غير نشط حالياً.' : 'This evaluation is not currently active.');
      return;
    }

    // Dynamic frontend expiration validation for Active links
    if (match.status === 'Active') {
      const endDateTime = new Date(`${match.endDate}T${match.endTime}`);
      if (new Date() > endDateTime) {
        setStudentError(language === 'ar' ? 'عذراً، لقد انتهت صلاحية رابط التقييم هذا طبقاً للجدول الزمني.' : 'This evaluation link has expired on schedule.');
        return;
      }
    }

    setActiveStudentLink(match);
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudentLink) return;

    if (activeStudentLink.passwordProtected && activeStudentLink.password !== studentPass) {
      setStudentError(language === 'ar' ? 'الرقم السري للتقييم غير صحيح.' : 'Incorrect evaluation security password.');
      return;
    }

    if (activeStudentLink.oneSubmissionPerStudent && !activeStudentLink.anonymous && !studentId) {
      setStudentError(language === 'ar' ? 'الرقم الجامعي للطالب مطلوب للتقييمات غير مجهولة الهوية.' : 'Student Identification ID is required for non-anonymous evaluations.');
      return;
    }

    setSubmittingEval(true);
    setStudentError('');

    try {
      const res = await fetch('/api/temp-links/submit-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeStudentLink.code,
          studentId: activeStudentLink.anonymous ? 'Anonymous' : studentId,
          password: studentPass,
          rating: evaluations, 
          comments: studentComments
        })
      });

      const data = await res.json();
      if (data.success) {
        setStudentSuccessMsg(language === 'ar' ? 'تم إرسال تقييمك بنجاح! شكراً لك.' : data.message);
        setActiveStudentLink(null);
        setStudentCodeInput('');
        setStudentId('');
        setStudentPass('');
        setStudentComments('');
        fetchLinks();
      } else {
        setStudentError(data.error || 'Failed to submit evaluation.');
      }
    } catch (err) {
      setStudentError('Server communication failure. Please try again.');
    } finally {
      setSubmittingEval(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'Draft':
        return 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20';
      case 'Under Review':
        return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'Approved':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'Expired':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Closed':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'Archived':
        return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
    }
  };

  const isRTL = language === 'ar';

  return (
    <div className="space-y-8" id="temp-eval-root" style={{ textAlign: isRTL ? 'right' : 'left' }}>
      {/* Top Banner */}
      <div className="border-b border-slate-150 dark:border-slate-800 pb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Link2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>{isRTL ? 'تصميم وإدارة استمارات وتقييمات المؤسسة' : 'Evaluation Forms & Campaigns'}</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isRTL 
            ? 'تكامل تام مع بنك الأسئلة لإعداد وبناء استمارات التقييم المخصصة وتوزيعها ومراجعتها واعتمادها قبل النشر مع عزل البيانات الكامل للمؤسسة'
            : 'SaaS isolated builder to design templates, customize question weights, set schedules, and approve campaigns before publishing.'}
        </p>

        {/* Sub Navigation */}
        <div className="flex gap-4 mt-6 border-b border-slate-100 dark:border-slate-850" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <button
            onClick={() => setActiveSubTab('admin')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeSubTab === 'admin' 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRTL ? 'بوابة تصميم وإدارة الاستمارات' : 'Form Campaign Builder'}
          </button>
          <button
            onClick={() => setActiveSubTab('student')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeSubTab === 'student' 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRTL ? 'محاكاة وبوابة التقييم للطلاب' : 'Student Response Gateway'}
          </button>
        </div>
      </div>

      {activeSubTab === 'admin' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Link Generation Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-6 h-fit space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Plus className="w-5 h-5 text-indigo-500" />
              <span>{isRTL ? 'تصميم استمارة / حملة جديدة' : 'Design New Campaign Form'}</span>
            </h3>

            <form onSubmit={handleGenerateLink} className="space-y-4 text-xs" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'نوع التقييم' : 'Evaluation Target Type'}</label>
                <select
                  value={evaluationType}
                  onChange={(e) => setEvaluationType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 font-medium"
                >
                  <option value="Lecturer Evaluation">Lecturer Evaluation (تقييم المحاضر)</option>
                  <option value="Course Evaluation">Course Evaluation (تقييم المقرر الدراسي)</option>
                  <option value="Laboratory Evaluation">Laboratory Evaluation (تقييم المعامل)</option>
                  <option value="Training Evaluation">Training Evaluation (تقييم التدريب الميداني)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'الكلية المعنية' : 'Faculty Scope'}</label>
                  <select
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5"
                  >
                    <option value="Faculty of Engineering">Engineering</option>
                    <option value="Faculty of Computing">Computing</option>
                    <option value="College of Science">Sciences</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'القسم الأكاديمي' : 'Department Scope'}</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Eng</option>
                    <option value="Information Systems">Info Systems</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'البرنامج الأكاديمي' : 'Academic Program'}</label>
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'السنة الدراسية / المستوى' : 'Academic Year / Level'}</label>
                  <input
                    type="text"
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'المقرر والمساق الدراسي' : 'Course Target'}</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 font-semibold"
                  >
                    <option value="CS402 - Artificial Intelligence">CS402 - Artificial Intelligence</option>
                    <option value="CS201 - Advanced Java Programming">CS201 - Advanced Java Programming</option>
                    <option value="SE301 - Software Architecture">SE301 - Software Architecture</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'الفصل الدراسي' : 'Semester'}</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 dark:text-slate-400">
                  {isRTL ? 'المحاضرين المطلوب تقييمهم (اختر متعدد)' : 'Lecturers to Evaluate (Select Multiple)'}
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-28 overflow-y-auto p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                  {displayLecturers.map(lect => {
                    const name = isRTL ? (lect.arabicName || lect.name) : lect.name;
                    const isChecked = selectedLecturers.includes(lect.name);
                    return (
                      <label key={lect.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLecturers([...selectedLecturers, lect.name]);
                            } else {
                              if (selectedLecturers.length > 1) {
                                setSelectedLecturers(selectedLecturers.filter(n => n !== lect.name));
                              }
                            }
                          }}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <span>{name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Questionnaire Customizer Box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5" />
                    {isRTL ? 'تصميم وتخصيص أسئلة الاستمارة' : 'Questionnaire & Weights Design'}
                  </span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-bold font-mono">
                    {selectedQuestions.length} {isRTL ? 'أسئلة' : 'Active'}
                  </span>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {selectedQuestions.map((q, idx) => (
                    <div key={q.id} className="p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">
                          {isRTL ? q.textAr : q.textEn}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedQuestions(selectedQuestions.filter(item => item.id !== q.id))}
                          className="text-rose-500 hover:text-rose-400 p-0.5"
                          title={isRTL ? 'حذف السؤال من الاستمارة' : 'Remove from Form'}
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                        <div>
                          <label className="text-slate-400 font-bold block mb-0.5">{isRTL ? 'الفئة' : 'Category'}</label>
                          <input
                            type="text"
                            value={q.category}
                            onChange={(e) => {
                              const updated = [...selectedQuestions];
                              updated[idx].category = e.target.value;
                              setSelectedQuestions(updated);
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded px-1.5 py-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 font-bold block mb-0.5">{isRTL ? 'الوزن (الضرب)' : 'Weight'}</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={q.weight}
                            onChange={(e) => {
                              const updated = [...selectedQuestions];
                              updated[idx].weight = Number(e.target.value);
                              setSelectedQuestions(updated);
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded px-1.5 py-0.5 text-center font-mono font-bold"
                          />
                        </div>
                        <div className="flex items-center justify-center pt-2">
                          <label className="flex items-center gap-1 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) => {
                                const updated = [...selectedQuestions];
                                updated[idx].required = e.target.checked;
                                setSelectedQuestions(updated);
                              }}
                              className="w-3.5 h-3.5 rounded"
                            />
                            <span className="text-slate-500 font-bold">{isRTL ? 'إجباري' : 'Req'}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedules */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg">
                <div className="space-y-1">
                  <span className="font-bold text-slate-500 block uppercase tracking-wider text-[9px]">{isRTL ? 'تاريخ البدء' : 'Start Date'}</span>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent w-full p-1" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-500 block uppercase tracking-wider text-[9px]">{isRTL ? 'تاريخ الانتهاء' : 'End Date'}</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent w-full p-1" />
                </div>
              </div>

              {/* Custom Settings Parameters */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[10px] uppercase tracking-wider mb-1">
                  {isRTL ? 'إعدادات الاستمارة والنشر' : 'Evaluation campaign parameters'}
                </span>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'مقياس التقييم' : 'Rating Scale'}</span>
                  <select
                    value={ratingScale}
                    onChange={(e) => setRatingScale(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1"
                  >
                    <option value="Likert">Likert (4 Point ممتاز-مقبول)</option>
                    <option value="5-Stars">5-Star System (⭐ نظام النجوم)</option>
                    <option value="Slider">1-10 Slider (مؤشر خطي)</option>
                    <option value="Binary">Binary Yes/No (نعم / لا)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'الطلاب المسموح لهم' : 'Allowed Students'}</span>
                  <select
                    value={allowedStudents}
                    onChange={(e) => setAllowedStudents(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1"
                  >
                    <option value="All">All Registered (كل الطلاب)</option>
                    <option value="Program Cohort">Program Cohort (دفعة البرنامج)</option>
                    <option value="Course Roll">Course Class Roll (مقيدين بالمساق)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'ظهور النتائج المباشرة' : 'Result Visibility'}</span>
                  <select
                    value={resultVisibility}
                    onChange={(e) => setResultVisibility(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1"
                  >
                    <option value="Quality Admin Only">Quality Admin Only</option>
                    <option value="Admin & Lecturer">Admin & Lecturer</option>
                    <option value="Public (All Staff)">Public (All Staff)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'صلاحيات تقرير التحليل' : 'Report Permissions'}</span>
                  <select
                    value={reportPermissions}
                    onChange={(e) => setReportPermissions(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1"
                  >
                    <option value="Quality Committee">Quality Committee Only</option>
                    <option value="Dean & Dept Head">Dean & Dept Head</option>
                    <option value="All Faculty">All Academic Faculty</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'الحد الأقصى للمشاركات' : 'Max Responses'}</span>
                  <input
                    type="number"
                    value={maxResponses}
                    onChange={(e) => setMaxResponses(Number(e.target.value))}
                    className="w-20 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1 text-center font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'حصر المشاركة لجهاز واحد' : 'Lock to Single Device'}</span>
                  <input type="checkbox" checked={singleDevice} onChange={(e) => setSingleDevice(e.target.checked)} className="w-4 h-4 rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'تقييم مجهول الهوية' : 'Enforce Anonymity'}</span>
                  <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="w-4 h-4 rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'حماية برمز سري' : 'Password Protected'}</span>
                  <input type="checkbox" checked={passwordProtected} onChange={(e) => setPasswordProtected(e.target.checked)} className="w-4 h-4 rounded" />
                </div>

                {passwordProtected && (
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRTL ? 'الرقم السري' : 'Security Passcode'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 font-mono"
                  />
                )}

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{isRTL ? 'حالة الحملة المبدئية' : 'Initial Campaign State'}</span>
                  <select
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value as any)}
                    className="bg-indigo-50/70 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-900 rounded p-1 font-bold text-indigo-700 dark:text-indigo-400"
                  >
                    <option value="Draft">Draft (مسودة قيد الإعداد)</option>
                    <option value="Under Review">Under Review (تحت المراجعة)</option>
                    <option value="Approved">Approved (معتمد جاهز للتجربة)</option>
                    <option value="Active">Active (نشط ومستمر فورياً)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm shadow-indigo-600/10 transition-colors cursor-pointer"
              >
                {isRTL ? 'نشر وتوليد رابط الاستمارة والمواصفات' : 'Deploy Designed Form Campaign'}
              </button>
            </form>
          </div>

          {/* Directory Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-indigo-500" />
                  <span>{isRTL ? 'حملات واستمارات الجودة بالمؤسسة' : 'Isolated Institution Campaign Directory'}</span>
                </h3>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-400 font-bold">
                  {links.length} {isRTL ? 'استمارات مخصصة' : 'Templates'}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <p className="text-xs text-center py-10 text-slate-400">{isRTL ? 'جاري التحميل وعزل البيانات...' : 'Synchronizing secure tenant portal...'}</p>
                ) : links.length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-400">{isRTL ? 'لا توجد حملات جودة مخصصة نشطة في هذه المؤسسة.' : 'No express quality campaigns exist inside your isolated tenant database.'}</p>
                  </div>
                ) : (
                  links.map(l => (
                    <div key={l.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        <div className="flex items-center gap-2 flex-wrap" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black text-xs rounded-lg font-mono tracking-wider">
                            {l.code}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusBadge(l.status)}`}>
                            {l.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{l.course}</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <p>{isRTL ? `المحاضر: ${l.lecturer}` : `Instructor: ${l.lecturer}`}</p>
                          <p>{isRTL ? `الفصل: ${l.semester}` : `Semester: ${l.semester}`}</p>
                          <p>{isRTL ? `الكلية: ${l.faculty}` : `Faculty: ${l.faculty}`}</p>
                          <p>{isRTL ? `مقياس القياس: ${l.ratingScale || 'Likert'}` : `Scale: ${l.ratingScale || 'Likert'}`}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono mt-2">
                          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"><Clock className="w-3 h-3" /> {l.endDate}</span>
                          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"><Users className="w-3 h-3" /> Max: {l.maxResponses}</span>
                          {l.passwordProtected && <span className="flex items-center gap-1 text-amber-500 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10"><Lock className="w-3 h-3" /> Protected</span>}
                          {l.singleDevice && <span className="flex items-center gap-1 text-indigo-500 bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10"><UserCheck className="w-3 h-3" /> Single Device</span>}
                          {l.questionsList && (
                            <span className="flex items-center gap-1 text-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 font-bold">
                              ✓ {l.questionsList.length} {isRTL ? 'أسئلة مخصصة' : 'Custom questions'}
                            </span>
                          )}
                        </div>

                        {/* WORKFLOW CONTROLS (review, preview, test, publish, close, archive) */}
                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-3" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isRTL ? 'مراحل الاعتماد والنشر:' : 'Workflow:'}</span>
                          
                          {/* Test / Preview Simulator Option */}
                          <button
                            onClick={() => {
                              setActiveStudentLink(l);
                              setActiveSubTab('student');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-md transition-all"
                            title={isRTL ? 'اختبار وتجربة الاستمارة بمحاكي الطالب' : 'Run testing simulation / preview form'}
                          >
                            <Play className="w-3 h-3" />
                            <span>{isRTL ? 'تجربة واختبار التقييم' : 'Test / Preview'}</span>
                          </button>

                          {/* Submit for Review (if draft) */}
                          {l.status === 'Draft' && (
                            <button
                              onClick={() => handleUpdateStatus(l.id, 'Under Review')}
                              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-purple-600 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 rounded-md transition-all"
                            >
                              <span>{isRTL ? 'إرسال للمراجعة والتدقيق' : 'Submit for Review'}</span>
                            </button>
                          )}

                          {/* Approve (if under review) */}
                          {(l.status === 'Under Review' || l.status === 'Draft') && (
                            <button
                              onClick={() => handleUpdateStatus(l.id, 'Approved')}
                              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 rounded-md transition-all"
                            >
                              <Check className="w-3 h-3" />
                              <span>{isRTL ? 'اعتماد وصياغة نهائية' : 'Approve Form'}</span>
                            </button>
                          )}

                          {/* Publish (if approved or draft) */}
                          {(l.status === 'Approved' || l.status === 'Draft' || l.status === 'Under Review') && (
                            <button
                              onClick={() => handleUpdateStatus(l.id, 'Active')}
                              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-md transition-all"
                            >
                              <span>{isRTL ? 'نشر وإتاحة للطلاب فوراً' : 'Publish / Make Active'}</span>
                            </button>
                          )}

                          {/* Close Campaign (if active) */}
                          {l.status === 'Active' && (
                            <button
                              onClick={() => handleUpdateStatus(l.id, 'Closed')}
                              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-md transition-all"
                            >
                              <X className="w-3 h-3" />
                              <span>{isRTL ? 'إغلاق المشاركة' : 'Close Campaign'}</span>
                            </button>
                          )}

                          {/* Archive Campaign (if closed or completed) */}
                          {(l.status === 'Closed' || l.status === 'Completed' || l.status === 'Expired') && (
                            <button
                              onClick={() => handleUpdateStatus(l.id, 'Archived')}
                              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-500/10 border border-slate-500/20 hover:bg-slate-500/20 rounded-md transition-all"
                            >
                              <Archive className="w-3 h-3" />
                              <span>{isRTL ? 'أرشفة الحملة' : 'Archive'}</span>
                            </button>
                          )}

                          {/* Delete Campaign */}
                          <button
                            onClick={() => handleDeleteCampaign(l.id)}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-red-500 hover:text-red-400 ml-auto"
                            title={isRTL ? 'حذف الحملة' : 'Delete Campaign'}
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between gap-4 flex-shrink-0 md:min-h-[140px]">
                        {/* Metrics */}
                        <div className="text-right" style={{ textAlign: isRTL ? 'left' : 'right' }}>
                          <span className="text-3xl font-black text-slate-800 dark:text-white block">{l.responseCount}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-black block">{isRTL ? 'مشاركة مستلمة' : 'Responses Received'}</span>
                        </div>

                        {/* QR Code trigger */}
                        <button
                          onClick={() => setGeneratedLink(l)}
                          className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-400 font-bold bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 rounded-lg px-3 py-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isRTL ? 'عرض الـ QR والرابط' : 'View Code / Link'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STUDENT SUBMISSION SCREEN / TESTING SIMULATOR */
        <div className="max-w-2xl mx-auto">
          {!activeStudentLink ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-8 space-y-6 text-center shadow-lg">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center mx-auto text-indigo-500">
                <FileCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{isRTL ? 'بوابة التقييم الطلابي الفوري' : 'Student Evaluation Portal'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isRTL 
                    ? 'الرجاء إدخال الرمز المكون من 8 خانات المقدم من أستاذ المادة للمشاركة في تقييم جودة التعليم'
                    : 'Enter the session evaluation code provided by your instructor to complete your survey.'}
                </p>
              </div>

              {studentError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs font-semibold flex items-center gap-2 justify-center">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{studentError}</span>
                </div>
              )}

              {studentSuccessMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-xs font-semibold flex items-center gap-2 justify-center">
                  <CheckCircle className="w-5 h-5" />
                  <span>{studentSuccessMsg}</span>
                </div>
              )}

              <div className="flex gap-3 max-w-sm mx-auto">
                <input
                  type="text"
                  value={studentCodeInput}
                  onChange={(e) => setStudentCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. EVAL-793X"
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-center font-black font-mono tracking-widest text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleLookupStudentLink}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-indigo-600/10 cursor-pointer"
                >
                  {isRTL ? 'دخول' : 'Access'}
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE STUDENT EVALUATION FORM */
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-6 md:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
              
              {/* Draft Indicator Warning */}
              {['Draft', 'Approved'].includes(activeStudentLink.status) && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-600 text-xs font-semibold">
                  <span className="text-base">🧪</span>
                  <div>
                    <p className="font-bold">{isRTL ? 'وضعية محاكاة وتجربة الاستمارة (معاينة الإدارة)' : 'Form Test Simulation Mode (Admin Preview)'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{isRTL ? 'هذه الاستمارة غير نشطة للجمهور حالياً. يمكنك ملؤها الآن لاختبار الأسئلة والأوزان.' : 'This questionnaire is not yet published to students. You are testing its exact design parameters.'}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-850 pb-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg font-mono tracking-wider">
                    {activeStudentLink.code}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">{activeStudentLink.course}</h3>
                  <p className="text-xs text-slate-500 mt-1">Instructor: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeStudentLink.lecturer}</span></p>
                </div>
                <button 
                  onClick={() => setActiveStudentLink(null)} 
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {studentError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs font-semibold flex items-center gap-2 justify-center">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{studentError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitEvaluation} className="space-y-6 text-sm" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {/* Authorization credentials if not anonymous */}
                {!activeStudentLink.anonymous && (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-bold block">{isRTL ? 'رقم الهوية الجامعي (مطلوب)' : 'Student University ID (Required)'}</label>
                      <input
                        type="text"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g. STD-2026-98"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Password Protection */}
                {activeStudentLink.passwordProtected && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-1">
                    <label className="text-xs text-slate-500 font-bold block">{isRTL ? 'الرمز السري للدخول للتقييم' : 'Evaluation Password (Required)'}</label>
                    <input
                      type="password"
                      required
                      value={studentPass}
                      onChange={(e) => setStudentPass(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                )}

                {/* Evaluative Dimensions */}
                <div className="space-y-6">
                  {activeStudentLink.lecturer.split(',').map(s => s.trim()).map((lecturerName, lectIdx) => {
                    const currentQuestions = activeStudentLink.questionsList && activeStudentLink.questionsList.length > 0 
                      ? activeStudentLink.questionsList 
                      : FALLBACK_QUESTIONS.map(q => ({ ...q, weight: 1, required: true }));

                    return (
                      <div key={lecturerName} className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl space-y-4 shadow-sm" id={`lecturer-eval-card-${lectIdx}`}>
                        {/* Doctor Name displayed clearly */}
                        <div className="border-b border-indigo-100 dark:border-indigo-950 pb-2 flex items-center justify-between" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                          <div className="flex items-center gap-2" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <span className="text-base text-indigo-600 dark:text-indigo-400">👤</span>
                            <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400" id={`lecturer-header-name-${lectIdx}`}>
                              {isRTL ? `تقييم الأستاذ / الدكتور: ${lecturerName}` : `Evaluation for Prof. / Dr. ${lecturerName}`}
                            </h4>
                          </div>
                          
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                            {activeStudentLink.ratingScale || 'Likert'}
                          </span>
                        </div>

                        <div className="space-y-5">
                          {currentQuestions.map((q, qIdx) => {
                            const currentValue = evaluations[lecturerName]?.[q.id] || (activeStudentLink.ratingScale === '5-Stars' ? 5 : activeStudentLink.ratingScale === 'Slider' ? 8 : activeStudentLink.ratingScale === 'Binary' ? 'Yes' : 'Excellent');
                            
                            return (
                              <div key={q.id} className="space-y-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-800" id={`eval-question-container-${lectIdx}-${qIdx}`}>
                                <div className="flex items-start justify-between gap-2" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {qIdx + 1}. {isRTL ? q.textAr : q.textEn}
                                    {q.required && <span className="text-rose-500 ml-1">*</span>}
                                  </p>
                                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-medium">
                                    {q.category} {q.weight > 1 ? `(Weight: ${q.weight})` : ''}
                                  </span>
                                </div>
                                
                                {/* 1. DYNAMIC RATING SCALE: 5-STAR SYSTEM */}
                                {activeStudentLink.ratingScale === '5-Stars' && (
                                  <div className="flex items-center gap-2 pt-1.5 justify-center">
                                    {[1, 2, 3, 4, 5].map((starVal) => (
                                      <button
                                        key={starVal}
                                        type="button"
                                        onClick={() => handleRatingChange(lecturerName, q.id, starVal)}
                                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                                      >
                                        <Star 
                                          className={`w-7 h-7 ${
                                            starVal <= (currentValue as number) 
                                              ? 'fill-amber-400 text-amber-400' 
                                              : 'text-slate-300 dark:text-slate-700'
                                          }`} 
                                        />
                                      </button>
                                    ))}
                                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 ml-2">({currentValue}/5)</span>
                                  </div>
                                )}

                                {/* 2. DYNAMIC RATING SCALE: 1-10 SLIDER */}
                                {activeStudentLink.ratingScale === 'Slider' && (
                                  <div className="space-y-2 pt-1.5 px-4">
                                    <input
                                      type="range"
                                      min="1"
                                      max="10"
                                      value={currentValue as number}
                                      onChange={(e) => handleRatingChange(lecturerName, q.id, Number(e.target.value))}
                                      className="w-full accent-indigo-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                                      <span>1 ({isRTL ? 'ضعيف جداً' : 'Poor'})</span>
                                      <span className="text-indigo-600 dark:text-indigo-400 text-sm font-black">{currentValue} / 10</span>
                                      <span>10 ({isRTL ? 'ممتاز تماماً' : 'Exceptional'})</span>
                                    </div>
                                  </div>
                                )}

                                {/* 3. DYNAMIC RATING SCALE: BINARY YES / NO */}
                                {activeStudentLink.ratingScale === 'Binary' && (
                                  <div className="grid grid-cols-2 gap-2 pt-1.5" id={`binary-options-grid-${lectIdx}-${qIdx}`}>
                                    {['Yes', 'No'].map((opt) => {
                                      const isChecked = currentValue === opt;
                                      return (
                                        <label
                                          key={opt}
                                          className={`flex items-center justify-center p-2 rounded-lg border text-center cursor-pointer transition-all ${
                                            isChecked 
                                              ? 'bg-indigo-50 dark:bg-indigo-950/35 border-indigo-400 text-indigo-700 dark:text-indigo-400 font-bold shadow-xs' 
                                              : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                                          }`}
                                        >
                                          <input
                                            type="radio"
                                            name={`${lecturerName}-${q.id}`}
                                            value={opt}
                                            checked={isChecked}
                                            onChange={() => handleRatingChange(lecturerName, q.id, opt)}
                                            className="sr-only"
                                          />
                                          <span className="text-xs font-bold">{opt === 'Yes' ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* 4. DYNAMIC RATING SCALE: STANDARD LIKERT */}
                                {(activeStudentLink.ratingScale === 'Likert' || !activeStudentLink.ratingScale) && (
                                  <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800" id={`likert-options-grid-${lectIdx}-${qIdx}`}>
                                    {[
                                      { value: 'Excellent', labelEn: 'Excellent', labelAr: 'ممتاز' },
                                      { value: 'Very Good', labelEn: 'Very Good', labelAr: 'جيد جداً' },
                                      { value: 'Good', labelEn: 'Good', labelAr: 'جيد' },
                                      { value: 'Acceptable', labelEn: 'Acceptable', labelAr: 'مقبول' }
                                    ].map(opt => {
                                      const isChecked = currentValue === opt.value;
                                      return (
                                        <label 
                                          key={opt.value} 
                                          id={`lbl-opt-${lectIdx}-${q.id}-${opt.value}`}
                                          className={`flex flex-col items-center justify-center p-2 rounded border text-center cursor-pointer transition-all ${
                                            isChecked 
                                              ? 'bg-indigo-50/70 dark:bg-indigo-950/35 border-indigo-400 text-indigo-700 dark:text-indigo-400 font-bold shadow-xs' 
                                              : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900'
                                          }`}
                                        >
                                          <input
                                            type="radio"
                                            name={`${lecturerName}-${q.id}`}
                                            value={opt.value}
                                            checked={isChecked}
                                            onChange={() => handleRatingChange(lecturerName, q.id, opt.value)}
                                            className="sr-only"
                                          />
                                          <span className="text-[11px] font-semibold">{isRTL ? opt.labelAr : opt.labelEn}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className="space-y-2">
                    <label className="font-bold text-slate-800 dark:text-slate-200 block">{isRTL ? 'ملاحظات ومقترحات إضافية للمقرر والمحاضرين' : 'Open-Ended Feedback / Comments'}</label>
                    <textarea
                      value={studentComments}
                      onChange={(e) => setStudentComments(e.target.value)}
                      rows={4}
                      placeholder={isRTL ? 'اكتب مقترحاتك وملاحظاتك لتحسين جودة العملية التعليمية للطلاب...' : 'Enter your constructive suggestions here...'}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      id="student-comments-textarea"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <button
                    type="button"
                    onClick={() => setActiveStudentLink(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-lg cursor-pointer"
                  >
                    {isRTL ? 'رجوع' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEval}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm shadow-emerald-600/10 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingEval ? (isRTL ? 'جاري الإرسال...' : 'Submitting...') : (isRTL ? 'إرسال التقييم النهائي' : 'Submit Evaluation')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SUCCESS MODAL / QR CARD POPUP */}
      {generatedLink && (() => {
        const realEvalUrl = `${window.location.origin}/?code=${generatedLink.code}`;
        const realQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(realEvalUrl)}`;
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <span className="font-bold text-slate-800 dark:text-white text-sm">{isRTL ? 'رابط التقييم النشط' : 'Active QR Code & URL'}</span>
                <button 
                  onClick={() => setGeneratedLink(null)}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl w-fit mx-auto">
                  <img src={realQrCodeUrl} alt="Evaluation QR Code" referrerPolicy="no-referrer" className="w-44 h-44 mx-auto bg-white p-2 rounded-lg" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">{isRTL ? 'كود التقييم المباشر للطلاب' : 'Evaluation Access Code'}</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-widest">{generatedLink.code}</span>
                </div>

                <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-xs break-all font-mono">
                  <span className="text-[9px] text-slate-400 font-bold block">{isRTL ? 'الرابط المختصر للطلاب' : 'Short Student URL'}</span>
                  <a href={realEvalUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline font-bold block mt-1">{realEvalUrl}</a>
                </div>
              </div>

              <button
                onClick={() => setGeneratedLink(null)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {isRTL ? 'إغلاق التفاصيل' : 'Close Details'}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
