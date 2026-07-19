import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Bell, Calendar as CalendarIcon, FileText, Megaphone, Plus, Search, 
  Download, Printer, FileSpreadsheet, CheckCircle, Clock, Calendar,
  X, ChevronLeft, ChevronRight, Activity, TrendingUp, BarChart2,
  PieChart as PieIcon, Award, ShieldAlert, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Announcement, CalendarEvent } from '../types';

export const CommsReportsHubView: React.FC = () => {
  const { 
    language, activeInstitution, actingRole, currentUser, t,
    announcements, addNewAnnouncement,
    notifications, markNotificationsAsRead,
    calendarEvents, addNewCalendarEvent,
    kpis, programs, studentEvaluations, riskItems, auditLogs
  } = useApp();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'announcements' | 'notifications' | 'calendar' | 'reports'>('reports');

  // --- Search & Filters State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [reportType, setReportType] = useState<'kpi' | 'programs' | 'surveys' | 'compliance'>('kpi');

  // --- CRUD/Details Modals ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form states
  const [anForm, setAnForm] = useState({ 
    title: '', 
    arabicTitle: '', 
    details: '', 
    arabicDetails: '', 
    priority: 'Normal' as 'Normal' | 'High' | 'Medium', 
    targetAudience: 'All' as 'All' | 'Students' | 'Lecturers' | 'Employees', 
    status: 'Published' as 'Published' | 'Scheduled' | 'Draft'
  });
  const [calForm, setCalForm] = useState({ title: '', arabicTitle: '', description: '', date: '2026-06-20', type: 'Audit' as 'Audit' | 'Meeting' | 'Event' | 'Deadline' | 'Task', time: '10:00 AM' });

  const handleOpenAdd = () => setIsAddModalOpen(true);

  // Toast
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' }>({ show: false, msg: '', type: 'info' });
  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const canWrite = useMemo(() => {
    return ['Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean', 'Department Head'].includes(actingRole);
  }, [actingRole]);

  // --- Executive Reports Data Generators ---
  const kpiChartData = useMemo(() => {
    return kpis.map(k => ({
      name: isAr ? k.arabicName : k.name,
      current: k.value,
      target: k.target,
      benchmark: k.benchmark
    }));
  }, [kpis, isAr]);

  const programStatusChartData = useMemo(() => {
    const counts: Record<string, number> = {
      'Accredited': 0,
      'Self Study': 0,
      'External Review': 0,
      'Draft': 0,
      'Needs Revision': 0
    };
    programs.forEach(p => {
      if (counts[p.status] !== undefined) {
        counts[p.status]++;
      } else {
        counts['Draft']++;
      }
    });
    return Object.keys(counts).map(key => ({
      name: isAr 
        ? (key === 'Accredited' ? 'معتمد' : key === 'Self Study' ? 'دراسة ذاتية' : key === 'External Review' ? 'مراجعة خارجية' : key === 'Draft' ? 'مسودة' : 'بحاجة لمراجعة')
        : key,
      value: counts[key]
    }));
  }, [programs, isAr]);

  const surveySatisfactionData = useMemo(() => {
    // Group evaluations by course
    const averages: Record<string, { total: number; count: number; name: string }> = {};
    studentEvaluations.forEach(se => {
      const cId = se.targetId || 'CRS-GEN';
      const score = (se.score || 85); // score %
      if (!averages[cId]) {
        averages[cId] = { total: 0, count: 0, name: se.targetName || 'General' };
      }
      averages[cId].total += score;
      averages[cId].count++;
    });

    return Object.keys(averages).map(key => ({
      name: averages[key].name,
      score: Math.round(averages[key].total / averages[key].count)
    }));
  }, [studentEvaluations]);

  const complianceRiskData = useMemo(() => {
    // Distribute risks by category
    const categories: Record<string, number> = {
      'Operational': 0,
      'Academic': 0,
      'Financial': 0,
      'Reputational': 0
    };
    riskItems.forEach(rk => {
      const cat = rk.category || 'Operational';
      if (categories[cat] !== undefined) {
        categories[cat] += (rk.likelihood || 1) * (rk.impact || 1);
      }
    });

    return Object.keys(categories).map(key => ({
      category: key,
      riskIndex: categories[key]
    }));
  }, [riskItems]);

  const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8'];

  // Export functions
  const handleExport = (format: 'pdf' | 'excel') => {
    const filename = `executive_bi_report_${reportType}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    triggerToast(
      isAr 
        ? `جاري تحضير التقرير التنفيذي للتحليلات الأكاديمية بصيغة ${format.toUpperCase()}... تم التنزيل (${filename})`
        : `Executive BI report generated as ${format.toUpperCase()}... Downloaded (${filename})`, 
      'success'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'announcements') {
      addNewAnnouncement({
        ...anForm,
        publicationDate: new Date().toISOString().split('T')[0],
        attachments: []
      });
      triggerToast(isAr ? 'تم نشر الإعلان الأكاديمي للجامعة بنجاح!' : 'University academic announcement published!');
    } else if (activeTab === 'calendar') {
      addNewCalendarEvent({
        ...calForm
      });
      triggerToast(isAr ? 'تم جدولة الموعد الجديد على لوحة التقويم الأكاديمي!' : 'New calendar event scheduled successfully!');
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6" id="comms-reports-main">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white bg-emerald-600`}
          >
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm" id="comms-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            {isAr ? 'التحليلات والمحاكاة والاتصال' : 'Executive BI Reports & Corporate Comms'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isAr 
              ? 'إنشاء التقارير التنفيذية التفاعلية ومتابعة المخططات البيانية وإصدار الإعلانات وجدولة تقويم ضمان الجودة'
              : 'Generate executive analytics, render state BI widgets, publish notices, and view real-time audit logs'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeTab === 'reports' && (
            <>
              <button 
                onClick={() => handleExport('excel')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Excel
              </button>
              <button 
                onClick={() => handleExport('pdf')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
              >
                <FileText className="h-4 w-4" />
                Export PDF
              </button>
              <button 
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
              >
                <Printer className="h-4 w-4" />
                {isAr ? 'طباعة التقرير' : 'Print Report'}
              </button>
            </>
          )}

          {canWrite && (activeTab === 'announcements' || activeTab === 'calendar') && (
            <button 
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-xs font-bold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              {activeTab === 'announcements' 
                ? (isAr ? 'إنشاء إعلان عام' : 'Create Announcement')
                : (isAr ? 'إضافة موعد تقويمي' : 'Schedule Event')
              }
            </button>
          )}
        </div>
      </div>

      {/* Directory Tab Switcher */}
      <div className="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 gap-1" id="comms-tabs-switch">
        {[
          { key: 'reports', label: isAr ? 'لوحة تحليلات الجودة BI' : 'Aura BI Analytics', icon: BarChart2 },
          { key: 'calendar', label: isAr ? 'التقويم الأكاديمي المشترك' : 'Audit Calendar', icon: CalendarIcon },
          { key: 'announcements', label: isAr ? 'إعلانات الإدارة والكلية' : 'Announcements Board', icon: Megaphone },
          { key: 'notifications', label: isAr ? 'سجل التدقيق الحي والمستجدات' : 'SaaS System Logs', icon: Bell }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
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

      {/* Main Panel Content Renderers */}
      <div className="space-y-6" id="comms-panel-body">
        
        {/* TAB 1: REPORTS & INTUITIVE RECHARTS BI VISUALIZATIONS */}
        {activeTab === 'reports' && (
          <div className="space-y-6" id="reports-view-pane">
            
            {/* Inner BI switcher buttons */}
            <div className="flex flex-wrap gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3" id="inner-bi-selector">
              {[
                { id: 'kpi', label: isAr ? 'تحليلات مؤشرات الأداء (KPIs)' : 'KPI Target vs Actuals', icon: TrendingUp },
                { id: 'programs', label: isAr ? 'إحصاءات تقدم الاعتماد البرامجي' : 'Program Accreditation progress', icon: Award },
                { id: 'surveys', label: isAr ? 'مستويات رضا الطلاب للمقررات' : 'Student Satisfaction index', icon: GraduationCap },
                { id: 'compliance', label: isAr ? 'سجل توزيع المخاطر التشغيلية' : 'Compliance Risk Distribution', icon: ShieldAlert }
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setReportType(btn.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-100 ${
                    reportType === btn.id 
                      ? 'bg-zinc-900 border-transparent text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold' 
                      : 'bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <btn.icon className="h-3.5 w-3.5" />
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Recharts Wrapper Card */}
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6" id="recharts-display-card">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-6 flex items-center gap-2">
                <BarChart2 className="h-4.5 w-4.5" />
                {reportType === 'kpi' && (isAr ? 'مقارنة القيم الفعلية الحالية بمؤشرات الأداء المستهدفة' : 'Performance Indicators: Real Value against Benchmark targets')}
                {reportType === 'programs' && (isAr ? 'توزيع البرامج الدراسية حسب مراحل الاعتماد والتقييم' : 'SaaS Program Distribution breakdown across stages')}
                {reportType === 'surveys' && (isAr ? 'متوسط رضا الطلاب عن جودة المناهج التدريسية ومخرجات التعلم' : 'Syllabus Feedback Satisfaction averaged by Course Module')}
                {reportType === 'compliance' && (isAr ? 'مؤشر خطورة سيناريوهات عدم المطابقة والمخاطر حسب الفئات' : 'Calculated Cumulative Risk index across operational categories')}
              </h3>

              <div className="h-[300px] w-full" id="recharts-body">
                {reportType === 'kpi' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kpiChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="current" name={isAr ? 'القيمة الحالية' : 'Current Actual'} fill="#18181b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" name={isAr ? 'المعيار المستهدف' : 'Target Standard'} fill="#71717a" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="benchmark" name={isAr ? 'المستوى المقارن' : 'Global Benchmark'} fill="#d4d4d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {reportType === 'programs' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={programStatusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#18181b"
                        dataKey="value"
                      >
                        {programStatusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {reportType === 'surveys' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={surveySatisfactionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#18181b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="score" name={isAr ? 'نسبة الرضا' : 'Satisfaction %'} stroke="#18181b" fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {reportType === 'compliance' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={complianceRiskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="riskIndex" name={isAr ? 'مؤشر الخطورة الشامل' : 'Severity Multiplier'} stroke="#18181b" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT CALENDAR AND EVENT TIMELINES */}
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="calendar-view-pane">
            
            {/* Sidebar event picker & planner */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
              <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                {isAr ? 'التقويم الأكاديمي ورقابة الجودة' : 'Quality Roadmap Calendar'}
              </h4>
              <p className="text-[11px] text-zinc-500">
                {isAr 
                  ? 'يتيح لك التقويم جدولة فترات مراجعة الأقران، زيارات لجان الاعتماد NCAAA الخارجية، ومواعيد إقفال تدقيق ملفات المساقات الأكاديمية.'
                  : 'The shared calendar maps Peer Review periods, NCAAA board visitation schedules, and Syllabus audit deadlines.'}
              </p>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border text-[10px] space-y-2">
                <div className="font-bold flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-zinc-600" /> Key Deadlines</div>
                <div className="flex justify-between"><span>Syllabus Audit FE&T</span> <strong className="text-red-500">June 15</strong></div>
                <div className="flex justify-between"><span>External Review NCAAA</span> <strong>May 20</strong></div>
              </div>
            </div>

            {/* Timelines listing feed */}
            <div className="md:col-span-2 space-y-4" id="calendar-events-feed">
              {calendarEvents.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 bg-white rounded-xl border">
                  {isAr ? 'لا توجد مواعيد مضافة حالياً.' : 'No scheduled calendar events found.'}
                </div>
              ) : (
                calendarEvents.map((ev: CalendarEvent) => (
                  <div key={ev.id} className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-center font-mono">
                      <span className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                        {ev.date.split('-')[2] || '20'}
                      </span>
                      <span className="block text-[8px] font-bold uppercase text-zinc-400">
                        {new Date(ev.date).toLocaleString('en', { month: 'short' })}
                      </span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                          {isAr ? ev.arabicTitle : ev.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-[9px] font-bold uppercase text-zinc-500">
                          {ev.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ANNOUNCEMENTS BILLBOARD */}
        {activeTab === 'announcements' && (
          <div className="space-y-4" id="announcements-view-pane">
            {announcements.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 bg-white rounded-xl border">
                {isAr ? 'لا توجد إعلانات منشورة.' : 'No academic announcements posted.'}
              </div>
            ) : (
              announcements.map((an: Announcement) => (
                <div key={an.id} className="p-5 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📢</span>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                          {isAr ? an.arabicTitle : an.title}
                        </h4>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>AURA Administration</span>
                          <span>•</span>
                          <span>{an.publicationDate}</span>
                          <span>•</span>
                          <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 text-[9px] uppercase font-bold">{an.priority}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-8">
                    {isAr ? an.arabicDetails : an.details}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: LIVE NOTIFICATIONS TIMELINE */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden" id="notifications-view-pane">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-xs font-bold">{isAr ? 'أحدث مستجدات النظام وسجل التدقيق' : 'Live Platform Activities & Audit Stream'}</span>
              <button 
                onClick={markNotificationsAsRead}
                className="text-[10px] font-bold text-zinc-500 hover:text-zinc-850"
              >
                {isAr ? 'تعليم الكل كمقروء' : 'Mark All as Read'}
              </button>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-900 max-h-[350px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-400">
                  {isAr ? 'سجل الإشعارات فارغ.' : 'System notification registry is empty.'}
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`p-4 flex items-start gap-3 transition-colors ${n.read ? 'opacity-70 bg-white' : 'bg-zinc-50/50 dark:bg-zinc-900/20'}`}>
                    <span className="text-base mt-0.5">
                      {n.type === 'success' ? '🟢' : n.type === 'warning' ? '🟡' : '🔵'}
                    </span>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {isAr ? n.arabicTitle : n.title}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400">
                          {n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        {isAr ? n.arabicMessage : n.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Add Modal Dialog for Announcements or Calendar scheduler */}
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
                  {activeTab === 'announcements' 
                    ? (isAr ? 'نشر إعلان أكاديمي رسمي للكلية' : 'Create Academic College Notice')
                    : (isAr ? 'جدولة موعد/تدقيق على التقويم' : 'Schedule New Calendar Audit/Event')
                  }
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdd} className="p-6 space-y-4">
                {activeTab === 'announcements' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'عنوان الإعلان (EN)' : 'Notice Title (EN)'}</label>
                      <input type="text" required value={anForm.title} onChange={e => setAnForm(p => ({ ...p, title: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'عنوان الإعلان (AR)' : 'Notice Title (AR)'}</label>
                      <input type="text" required value={anForm.arabicTitle} onChange={e => setAnForm(p => ({ ...p, arabicTitle: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'الفئة' : 'Category'}</label>
                      <select value={anForm.category} onChange={e => setAnForm(p => ({ ...p, category: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border">
                        <option value="General">General</option>
                        <option value="Syllabus Audit">Syllabus Audit</option>
                        <option value="NCAAA Accreditation">NCAAA Accreditation</option>
                        <option value="Academic Board">Academic Board</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'محتوى الإعلان بالتفصيل (EN)' : 'Announcement Body (EN)'}</label>
                      <textarea rows={3} required value={anForm.content} onChange={e => setAnForm(p => ({ ...p, content: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'محتوى الإعلان بالتفصيل (AR)' : 'Announcement Body (AR)'}</label>
                      <textarea rows={3} required value={anForm.arabicContent} onChange={e => setAnForm(p => ({ ...p, arabicContent: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'عنوان الحدث التقويمي (EN)' : 'Event Title (EN)'}</label>
                      <input type="text" required value={calForm.title} onChange={e => setCalForm(p => ({ ...p, title: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'عنوان الحدث التقويمي (AR)' : 'Event Title (AR)'}</label>
                      <input type="text" required value={calForm.arabicTitle} onChange={e => setCalForm(p => ({ ...p, arabicTitle: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'نوع الحدث' : 'Event Type'}</label>
                      <select value={calForm.type} onChange={e => setCalForm(p => ({ ...p, type: e.target.value as any, arabicType: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border">
                        <option value="Audit">Internal Quality Audit</option>
                        <option value="NCAAA Visit">NCAAA External Board Visit</option>
                        <option value="Peer Review">Peer Evaluation Week</option>
                        <option value="Syllabus Lock">Syllabus Completion Deadline</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">{isAr ? 'التاريخ المحدد' : 'Date'}</label>
                      <input type="date" value={calForm.date} onChange={e => setCalForm(p => ({ ...p, date: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1">{isAr ? 'الوصف التوضيحي للحدث' : 'Brief Narrative'}</label>
                      <textarea rows={2} required value={calForm.description} onChange={e => setCalForm(p => ({ ...p, description: e.target.value, arabicDescription: e.target.value }))} className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-900 border" />
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
