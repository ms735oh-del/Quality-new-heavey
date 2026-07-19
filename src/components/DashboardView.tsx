/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, UserRole } from '../types';
import {
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Calendar,
  CheckSquare,
  Square,
  Plus,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    language,
    activeInstitution,
    actingRole,
    kpis,
    programs,
    tasks,
    addNewTask,
    changeTaskStatus,
    auditLogs,
    t
  } = useApp();

  // Tasks form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [taskAssignee, setTaskAssignee] = useState<UserRole>('Lecturer');

  // Multi-tenant aggregate calculations
  const totalStudentsCount = activeInstitution.studentCount;
  const totalFacultyCount = activeInstitution.facultyCount;
  const activeProgramsCount = programs.length;

  const averageCompliance = programs.length > 0 
    ? Math.round(programs.reduce((acc, p) => acc + p.complianceRate, 0) / programs.length) 
    : 0;

  const averageSelfStudy = programs.length > 0 
    ? Math.round(programs.reduce((acc, p) => acc + p.selfStudyScore, 0) / programs.length) 
    : 0;

  // Compile Chart data dynamically from KPIs
  // Format for historical KPI monthly chart
  const historicalChartData = [
    { name: 'Jan', Oxford: 91.2, Cairo: 75.0, Target: 90 },
    { name: 'Feb', Oxford: 92.4, Cairo: 76.2, Target: 90 },
    { name: 'Mar', Oxford: 93.1, Cairo: 77.0, Target: 90 },
    { name: 'Apr', Oxford: 93.8, Cairo: 78.0, Target: 90 },
    { name: 'May', Oxford: 94.5, Cairo: 78.4, Target: 90 }
  ];

  // Dynamic bar chart data: programs compliance score vs self study
  const programQualityChartData = programs.map(p => ({
    name: p.code,
    fullName: language === 'ar' ? p.arabicName : p.name,
    [language === 'ar' ? 'درجة الامتثال' : 'Compliance Rate']: p.complianceRate,
    [language === 'ar' ? 'التقييم الذاتي' : 'Self-Study Score']: p.selfStudyScore
  }));

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const arabicPriorityMap = {
      High: 'عالية',
      Medium: 'متوسطة',
      Low: 'منخفضة'
    };

    addNewTask({
      title: taskTitle,
      arabicTitle: taskTitle, // Keep simple for translation simulation
      description: taskDesc,
      arabicDescription: taskDesc,
      dueDate: taskDueDate || new Date().toISOString().split('T')[0],
      status: 'Todo',
      arabicStatus: 'المهمة المطلوبة',
      priority: taskPriority,
      assigneeRole: taskAssignee
    });

    // Reset Form
    setTaskTitle('');
    setTaskDesc('');
    setTaskDueDate('');
    setTaskPriority('Medium');
    setTaskAssignee('Lecturer');
    setShowTaskForm(false);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-view-container">
      {/* 1. SaaS Hero Row */}
      <div 
        className="rounded-xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-sm transition-all duration-300 border border-white/10"
        style={{
          background: `linear-gradient(135deg, ${activeInstitution.primaryColor} 0%, ${activeInstitution.secondaryColor} 100%)`
        }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-48 h-48 rotate-12" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-white/15 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider backdrop-blur-sm">
              {activeInstitution.domain}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider flex items-center gap-1 backdrop-blur-sm border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('activeUser')}</span>
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {t('welcomeBack')}, {actingRole}
            </h2>
            <p className="text-white/80 max-w-xl text-sm mt-1 leading-relaxed">
              {language === 'ar' 
                ? `مرحبًا بك في منصة الجودة المتكاملة لـ ${activeInstitution.arabicName}. جميع الموارد معزولة وقواعد البيانات الفردية نشطة وآمنة.`
                : `Managing Institutional Effectiveness for ${activeInstitution.name}. Continuous quality loops, accreditation standards, and course portfolios are active.`
              }
            </p>
          </div>
        </div>

        {/* Live Simulator Indicator */}
        <div className="mt-8 flex items-center justify-between text-xs border-t border-white/10 pt-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-white/90">{t('mockIndicator')}</span>
          </div>
          <span className="text-white/60 font-mono text-[11px]">UTC: 2026-07-13</span>
        </div>
      </div>

      {/* 2. Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-stats-grid">
        {/* Stat 1: Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('totalStudents')}</span>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {totalStudentsCount.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-bold">▲ +4.2%</span>
              <span>vs previous term</span>
            </p>
          </div>
        </div>

        {/* Stat 2: Active Programs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('programTitle')}</span>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-500">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {activeProgramsCount}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-indigo-500 font-bold">{totalFacultyCount}</span>
              <span>{t('totalFaculty')}</span>
            </p>
          </div>
        </div>

        {/* Stat 3: Average Compliance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('complianceRate')}</span>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {averageCompliance}%
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-bold">Target: 95%</span>
              <span>alignment index</span>
            </p>
          </div>
        </div>

        {/* Stat 4: Average Self Study */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('averageSerScore')}</span>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-500">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {averageSelfStudy}/100
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-amber-500 font-bold">Accredited Grade A</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Recharts Visualisation Suite */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="dashboard-charts-row">
        {/* Chart A: Department Quality Comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">{t('departmentBreakdown')}</h4>
            <p className="text-xs text-slate-400 mt-0.5">Syllabus compliance vs evaluation report scores</p>
          </div>
          <div className="h-80 w-full mt-6" id="program-quality-barchart">
            {programQualityChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No active program data to graph.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programQualityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', pt: '10px' }} />
                  <Bar dataKey={language === 'ar' ? 'درجة الامتثال' : 'Compliance Rate'} fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey={language === 'ar' ? 'التقييم الذاتي' : 'Self-Study Score'} fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Historical Index Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">{t('historicalKpis')}</h4>
            <p className="text-xs text-slate-400 mt-0.5">Comparison curves mapped across multiple institutions</p>
          </div>
          <div className="h-80 w-full mt-6" id="kpi-historical-linechart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="Oxford" name="Oxford Global" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Cairo" name="Cairo National" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Target" name="Quality Baseline" stroke="#f59e0b" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Operations & Recent activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-operations-row">
        {/* Calendar Compliance Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <span>{t('tasksCalendar')}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Academic audits and action items track</p>
              </div>
              <button
                id="add-task-modal-trigger"
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 transition-colors"
                title={t('addCustomTask')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Task creation popup inside container */}
            {showTaskForm && (
              <form onSubmit={handleCreateTask} id="dashboard-task-creation-form" className="mt-4 p-4 border border-indigo-150 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-lg space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500">{t('taskTitle')}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Audit CS Exam Samples"
                      value={taskTitle}
                      onChange={e => setTaskTitle(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500">{t('dueDate')}</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={e => setTaskDueDate(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">{t('taskDesc')}</label>
                  <input
                    type="text"
                    placeholder="Details about standard compliance..."
                    value={taskDesc}
                    onChange={e => setTaskDesc(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500">{t('priority')}</label>
                    <select
                      value={taskPriority}
                      onChange={e => setTaskPriority(e.target.value as any)}
                      className="w-full text-xs p-1.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500">{t('assigneeRole')}</label>
                    <select
                      value={taskAssignee}
                      onChange={e => setTaskAssignee(e.target.value as any)}
                      className="w-full text-xs p-1.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    >
                      <option value="Lecturer">Lecturer</option>
                      <option value="Quality Manager">Quality Manager</option>
                      <option value="Dean">Dean</option>
                      <option value="Program Coordinator">Program Coordinator</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-indigo-100 dark:border-indigo-950">
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
                  >
                    {t('addCustomTask')}
                  </button>
                </div>
              </form>
            )}

            {/* Tasks List */}
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1" id="dashboard-tasks-list">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  {t('noTasks')}
                </div>
              ) : (
                tasks.map(task => {
                  const isCompleted = task.status === 'Completed';
                  return (
                    <div
                       key={task.id}
                       id={`task-item-${task.id}`}
                       className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all ${
                        isCompleted 
                          ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850 opacity-60' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                      }`}
                       style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
                    >
                      <button
                        id={`task-check-btn-${task.id}`}
                        onClick={() => changeTaskStatus(task.id, isCompleted ? 'Todo' : 'Completed')}
                        className={`mt-0.5 text-indigo-600 hover:text-indigo-800 transition-colors ${
                          language === 'ar' ? 'ml-1' : 'mr-1'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckSquare className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                        <p className={`text-xs font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {language === 'ar' ? task.arabicTitle : task.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {language === 'ar' ? task.arabicDescription : task.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                            {task.dueDate}
                          </span>
                          <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-500 px-2 py-0.5 rounded">
                            {task.assigneeRole}
                          </span>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            task.priority === 'High' 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                              : task.priority === 'Medium'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-slate-400/10 text-slate-400'
                          }`}>
                            {task.priority === 'High' ? t('high') : task.priority === 'Medium' ? t('medium') : t('low')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Live Security Ledger Preview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>{t('recentAuditLogs')}</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Isolated events & multi-tenant transaction audit stream</p>
          </div>

          <div className="mt-4 space-y-3.5 max-h-80 overflow-y-auto pr-1" id="dashboard-audit-logs">
            {auditLogs.slice(0, 5).map(log => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-150/50 dark:border-slate-850/50 relative overflow-hidden"
                style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
              >
                <div className="absolute top-0 right-0 p-1 opacity-5">
                  <ShieldCheck className="w-12 h-12 text-slate-900 dark:text-white" />
                </div>
                <div className="flex items-center justify-between mb-1" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                  <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? log.arabicAction : log.action}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">{log.timestamp.slice(11, 19)}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ar' ? log.arabicDetails : log.details}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                  <span className="text-[9px] font-mono bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20">
                    {log.userName.split(' ').pop()} ({log.userRole})
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    log.type === 'Security' 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                      : log.type === 'Data Change'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-slate-500/10 text-slate-500'
                  }`}>
                    {log.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
