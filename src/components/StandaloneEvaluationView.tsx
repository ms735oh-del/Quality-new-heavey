/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import {
  CheckCircle,
  AlertTriangle,
  Send,
  Lock,
  UserCheck,
  Award,
  Globe,
  Loader2
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
  status: 'Active' | 'Expired' | 'Closed' | 'Completed';
  responseCount: number;
}

interface StandaloneEvaluationViewProps {
  code: string;
}

export const StandaloneEvaluationView: React.FC<StandaloneEvaluationViewProps> = ({ code }) => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar'); // Default to Arabic for user comfort
  const [linkDetails, setLinkDetails] = useState<TempLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form entries
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [evaluations, setEvaluations] = useState<Record<string, Record<string, string>>>({});
  const [comments, setComments] = useState('');

  const [questions, setQuestions] = useState<any[]>([]);

  const mapLinkTypeToQuestionType = (linkType: string): string => {
    if (linkType === 'Lecturer Evaluation' || linkType === 'Student evaluates Lecturer') {
      return 'Student evaluates Lecturer';
    }
    if (linkType === 'Course Evaluation' || linkType === 'Student evaluates Course') {
      return 'Student evaluates Course';
    }
    if (linkType === 'Laboratory Evaluation' || linkType === 'Student evaluates Laboratory') {
      return 'Student evaluates Laboratory';
    }
    if (linkType === 'Training Evaluation' || linkType === 'Student evaluates Training') {
      return 'Student evaluates Training';
    }
    if (linkType === 'Lecturer Self Evaluation') {
      return 'Lecturer Self Evaluation';
    }
    if (linkType === 'Peer Evaluation') {
      return 'Peer Evaluation';
    }
    if (linkType === 'Department Evaluation') {
      return 'Department Evaluation';
    }
    if (linkType === 'External Review Evaluation') {
      return 'External Review Evaluation';
    }
    return 'Student evaluates Lecturer';
  };

  const fallbackQuestions = [
    {
      id: 'q1',
      textEn: 'Commitment to lecture times, prompt organization and meetings',
      textAr: 'الالتزام بمواعيد المحاضرات والتنظيم الأكاديمي واللقاءات'
    },
    {
      id: 'q2',
      textEn: 'Clarity of explanations, presentation quality, and teaching tools used',
      textAr: 'وضوح الشرح وجودة العرض والأدوات والوسائل التعليمية المستخدمة'
    },
    {
      id: 'q3',
      textEn: 'Responsiveness, interactive engagement, and support during office hours',
      textAr: 'التجاوب مع أسئلة الطلاب والدعم والتفاعل الفعال في الساعات المكتبية'
    },
    {
      id: 'q4',
      textEn: 'Fairness and objectivity in grading, homework assessments, and grade distribution',
      textAr: 'العدالة والموضوعية في تقييم تكليفات واختبارات الطلاب وتوزيع الدرجات'
    }
  ];

  const LIKERT_OPTIONS = [
    { value: 'Excellent', labelEn: 'Excellent', labelAr: 'ممتاز' },
    { value: 'Very Good', labelEn: 'Very Good', labelAr: 'جيد جداً' },
    { value: 'Good', labelEn: 'Good', labelAr: 'جيد' },
    { value: 'Acceptable', labelEn: 'Acceptable', labelAr: 'مقبول' }
  ];

  useEffect(() => {
    const fetchLinkDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/temp-links');
        const data = await res.json();
        if (data.success) {
          const match = data.links.find((l: TempLink) => l.code.toUpperCase() === code.toUpperCase());
          if (!match) {
            setError(language === 'ar' ? 'رمز التقييم المدخل غير صحيح أو انتهت صلاحيته.' : 'Invalid or expired evaluation code.');
            setLoading(false);
            return;
          }

          // Expiration Check
          const endDateTime = new Date(`${match.endDate}T${match.endTime}`);
          if (new Date() > endDateTime || match.status === 'Expired') {
            setError(language === 'ar' ? 'عذراً، لقد انتهت صلاحية هذا التقييم طبقاً للجدول الزمني.' : 'This evaluation link has expired.');
            setLoading(false);
            return;
          }

          if (match.status === 'Closed' || match.status === 'Completed') {
            setError(language === 'ar' ? 'تم إغلاق هذا التقييم لتلقي الحد الأقصى من المشاركات.' : 'This evaluation has been closed or completed.');
            setLoading(false);
            return;
          }

          setLinkDetails(match);

          // Dynamic questions mapping from local database
          const mappedType = mapLinkTypeToQuestionType(match.evaluationType);
          const instId = match.institutionId || 'oxford-global';
          const allQuestions = dbService.getEvaluationQuestions(instId);
          const activeQuestions = allQuestions.filter(q => q.isActive && q.evaluationType === mappedType);
          const finalQuestions = activeQuestions.length > 0 ? activeQuestions : fallbackQuestions;
          setQuestions(finalQuestions);

          // Initialize evaluations structures for all lecturers
          const names = match.lecturer.split(',').map((s: string) => s.trim());
          const initial: Record<string, Record<string, string>> = {};
          names.forEach((name: string) => {
            initial[name] = {};
            finalQuestions.forEach(q => {
              initial[name][q.id] = 'Excellent';
            });
          });
          setEvaluations(initial);
        } else {
          setError(language === 'ar' ? 'fشل الاتصال بخادم الجودة.' : 'Failed to connect to the evaluation server.');
        }
      } catch (err) {
        setError(language === 'ar' ? 'فشل الاتصال بالشبكة.' : 'Network connection failed.');
      } finally {
        setLoading(false);
      }
    };

    fetchLinkDetails();
  }, [code, language]);

  const handleRatingChange = (lecturerName: string, questionId: string, value: string) => {
    setEvaluations(prev => ({
      ...prev,
      [lecturerName]: {
        ...(prev[lecturerName] || {}),
        [questionId]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkDetails) return;

    if (linkDetails.passwordProtected && linkDetails.password !== password) {
      setError(language === 'ar' ? 'الرمز السري للتقييم غير صحيح.' : 'Incorrect evaluation password.');
      return;
    }

    if (linkDetails.oneSubmissionPerStudent && !linkDetails.anonymous && !studentId) {
      setError(language === 'ar' ? 'الرقم الجامعي مطلوب للتحقق من الهوية.' : 'Student ID is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/temp-links/submit-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: linkDetails.code,
          studentId: linkDetails.anonymous ? 'Anonymous' : studentId,
          password,
          rating: evaluations,
          comments
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || (language === 'ar' ? 'فشل إرسال التقييم.' : 'Submission failed.'));
      }
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ في الاتصال بالخادم.' : 'Server connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  const isRTL = language === 'ar';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-100">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-bold">{isRTL ? 'جاري تحميل بوابة التقييم الأكاديمي...' : 'Loading Academic Evaluation Portal...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-100">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-md w-full text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/40 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{isRTL ? 'حدث خطأ في الوصول' : 'Access Error'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
          </div>
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              <Globe className="w-4 h-4" />
              <span>{isRTL ? 'Switch to English' : 'التحويل للعربية'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-100">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-md w-full text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{isRTL ? 'تم الإرسال بنجاح!' : 'Submitted Successfully!'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRTL 
                ? 'شكراً لمشاركتك الفعالة في تقييم جودة الأداء الأكاديمي. تم تسجيل صوتك وتفريغه لحساب الجودة والاعتماد.'
                : 'Thank you for participating in the academic performance assessment. Your response is recorded securely.'}
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10px] text-slate-400">
            <span>Powered by AURA Quality SaaS</span>
            <button
              onClick={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')}
              className="hover:underline font-bold"
            >
              {isRTL ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 md:px-6 flex flex-col items-center text-slate-800 dark:text-slate-100" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Top floating header */}
      <div className="max-w-3xl w-full mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
            🎓
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              {isRTL ? 'بوابة التقييم الطلابي للأداء الأكاديمي' : 'Academic Quality Assessment Portal'}
            </h2>
            <p className="text-[10px] text-slate-400">AURA Quality Assurance Framework</p>
          </div>
        </div>

        <button
          onClick={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isRTL ? 'English' : 'العربية'}</span>
        </button>
      </div>

      {/* Main evaluation card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden">
        {/* Banner */}
        <div className="p-6 md:p-8 bg-indigo-600 text-white space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full font-black text-xs font-mono tracking-wider">
              {linkDetails?.code}
            </span>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold">
              {linkDetails?.semester}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black leading-tight">
            {linkDetails?.course}
          </h1>
          <p className="text-xs text-indigo-100 max-w-2xl">
            {isRTL 
              ? 'تساهم هذه الاستبانة في تقييم وقياس جودة التدريس وتطوير المهارات وتصميم وتعديل المساقات طبقاً لمعايير الهيئة الوطنية للاعتماد والجودة.'
              : 'This survey contributes directly to institutional curriculum maps and lecturer professional developments.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Security details block */}
          {(!linkDetails?.anonymous || linkDetails?.passwordProtected) && (
            <div className="p-5 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
              {!linkDetails.anonymous && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                    {isRTL ? 'الرقم الجامعي للطالب (مطلوب للتحقق من المشاركة)' : 'Student ID (Required)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STD-2026-98"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              {linkDetails.passwordProtected && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                    {isRTL ? 'رمز أمان الاستبانة السري (مطلوب)' : 'Security Access Password (Required)'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Evaluations Grid */}
          <div className="space-y-10">
            {linkDetails?.lecturer.split(',').map(s => s.trim()).map((lecturerName, lectIdx) => (
              <div key={lecturerName} className="p-5 md:p-6 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 shadow-xs relative">
                {/* Doctor Display Title */}
                <div className="border-b border-indigo-100 dark:border-indigo-950/50 pb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm md:text-base font-black text-indigo-600 dark:text-indigo-400">
                    {isRTL ? `تقييم الأستاذ / الدكتور: ${lecturerName}` : `Evaluation for Professor: ${lecturerName}`}
                  </h3>
                </div>

                <div className="space-y-6">
                  {questions.map((q, qIdx) => {
                    const currentValue = evaluations[lecturerName]?.[q.id] || 'Excellent';
                    return (
                      <div key={q.id} className="space-y-3">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-relaxed">
                          {qIdx + 1}. {isRTL ? q.textAr : q.textEn}
                        </p>

                        {/* Likert options row */}
                        <div className="grid grid-cols-4 gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                          {LIKERT_OPTIONS.map(opt => {
                            const isChecked = currentValue === opt.value;
                            return (
                              <label
                                key={opt.value}
                                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg border text-center cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md shadow-indigo-600/10'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
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
                                <span className="text-[11px] font-bold">{isRTL ? opt.labelAr : opt.labelEn}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Comments block */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {isRTL ? 'ملاحظات وتوصيات إضافية لتحسين المقرر وطريقة الشرح والأداء' : 'Constructive Open Feedback / Recommendations'}
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={isRTL ? 'مساحة كتابة حرة لأي مقترح أكاديمي أو توصية للمحاضر والمؤسسة...' : 'Write any comments or suggestions to help the institution improve this course...'}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Submit button block */}
          <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {linkDetails?.anonymous ? (isRTL ? 'مجهول الهوية' : 'Anonymous Mode') : (isRTL ? 'مؤمن الهوية' : 'Verified Student ID')}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{submitting ? (isRTL ? 'جاري الإرسال...' : 'Submitting...') : (isRTL ? 'إرسال التقييم السري النهائي' : 'Submit Final Evaluation')}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-400 space-y-1">
        <p>© {new Date().getFullYear()} AURA Academic Quality & Accreditation Management. All rights reserved.</p>
        <p>AURA SaaS is compliant with national institutional alignment & security parameters.</p>
      </div>
    </div>
  );
};
