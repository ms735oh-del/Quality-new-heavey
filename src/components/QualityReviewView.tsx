/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Program, Course } from '../types';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Settings
} from 'lucide-react';

export const QualityReviewView: React.FC = () => {
  const {
    language,
    programs,
    addNewProgram,
    changeProgramStatus,
    getCoursesForProgram,
    addNewCourse,
    changeCourseReview,
    currentUser,
    actingRole,
    t
  } = useApp();

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showProgForm, setShowProgForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);

  // Program form states
  const [progName, setProgName] = useState('');
  const [progNameAr, setProgNameAr] = useState('');
  const [progCode, setProgCode] = useState('');
  const [progDept, setProgDept] = useState('');
  const [progDeptAr, setProgDeptAr] = useState('');

  // Course form states
  const [courseName, setCourseName] = useState('');
  const [courseNameAr, setCourseNameAr] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseCredits, setCourseCredits] = useState(3);
  const [courseInstructor, setCourseInstructor] = useState('');

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progName || !progCode) return;

    addNewProgram({
      name: progName,
      arabicName: progNameAr || progName,
      code: progCode.toUpperCase(),
      department: progDept,
      arabicDepartment: progDeptAr || progDept,
      coordinatorId: currentUser.id,
      status: 'Draft',
      arabicStatus: 'مسودة',
      selfStudyScore: 0,
      complianceRate: 0
    });

    setProgName('');
    setProgNameAr('');
    setProgCode('');
    setProgDept('');
    setProgDeptAr('');
    setShowProgForm(false);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram || !courseName || !courseCode) return;

    addNewCourse(selectedProgram.id, {
      name: courseName,
      arabicName: courseNameAr || courseName,
      code: courseCode.toUpperCase(),
      creditHours: Number(courseCredits),
      syllabusApproved: false,
      reviewStatus: 'Pending Review',
      arabicReviewStatus: 'قيد المراجعة',
      complianceScore: 0,
      lecturerName: courseInstructor || currentUser.name
    });

    setCourseName('');
    setCourseNameAr('');
    setCourseCode('');
    setCourseCredits(3);
    setCourseInstructor('');
    setShowCourseForm(false);
  };

  const activeCourses = selectedProgram ? getCoursesForProgram(selectedProgram.id) : [];

  return (
    <div className="space-y-8 animate-fade-in" id="quality-review-view">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
        <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
            <GraduationCap className="w-7 h-7 text-blue-500" />
            <span>{t('programTitle')}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">Review syllabus compliance, curriculum mapping and quality metrics.</p>
        </div>

        {['Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean', 'Department Head', 'Program Coordinator'].includes(actingRole) && (
          <button
            id="register-program-btn"
            onClick={() => setShowProgForm(!showProgForm)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all self-start"
            style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
          >
            <Plus className="w-4 h-4" />
            <span>{t('addProgram')}</span>
          </button>
        )}
      </div>

      {/* Program Registration Form Drawer-In */}
      {showProgForm && (
        <form onSubmit={handleCreateProgram} id="program-registration-form" className="bg-slate-50 dark:bg-slate-950/40 p-6 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">{t('programName')}</label>
              <input
                type="text"
                required
                placeholder="e.g. Bachelor of Science in Artificial Intelligence"
                value={progName}
                onChange={e => setProgName(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">{t('programName')} (العربية)</label>
              <input
                type="text"
                placeholder="مثال: بكالوريوس العلوم في الذكاء الاصطناعي"
                value={progNameAr}
                onChange={e => setProgNameAr(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">{t('programCode')}</label>
              <input
                type="text"
                required
                placeholder="e.g. BSAI"
                value={progCode}
                onChange={e => setProgCode(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">{t('department')}</label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science"
                value={progDept}
                onChange={e => setProgDept(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">{t('department')} (العربية)</label>
              <input
                type="text"
                placeholder="مثال: علوم الحاسب"
                value={progDeptAr}
                onChange={e => setProgDeptAr(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white text-right"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowProgForm(false)}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
            >
              {t('save')}
            </button>
          </div>
        </form>
      )}

      {/* Main split grid: Program list and Drilled details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Programs Catalog */}
        <div className={`lg:col-span-1 space-y-4`} id="programs-left-catalog">
          {programs.map(prog => {
            const isSelected = selectedProgram?.id === prog.id;
            return (
              <div
                key={prog.id}
                id={`program-card-${prog.id}`}
                onClick={() => setSelectedProgram(prog)}
                className={`p-5 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                }`}
                style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
              >
                <div className="flex items-center justify-between mb-3" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {prog.code}
                  </span>
                  
                  {/* Status Indicator */}
                  <span className={`text-[10px] font-bold ${
                    isSelected ? 'text-white/90' : 'text-slate-400'
                  }`}>
                    {language === 'ar' ? prog.arabicStatus : prog.status}
                  </span>
                </div>

                <h3 className={`text-sm font-extrabold truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {language === 'ar' ? prog.arabicName : prog.name}
                </h3>
                
                <p className={`text-xs mt-1 truncate ${isSelected ? 'text-white/75' : 'text-slate-400'}`}>
                  {language === 'ar' ? prog.arabicDepartment : prog.department}
                </p>

                {/* Progress bars inside card */}
                <div className="mt-4 space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold mb-1" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                      <span>{t('complianceIndex')}</span>
                      <span>{prog.complianceRate}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} 
                        style={{ width: `${prog.complianceRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Drilled Panel */}
        <div className="lg:col-span-2" id="program-drilled-details-panel">
          {selectedProgram ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
              {/* Program Overview Banner */}
              <div className="border-b border-slate-250 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                  <div className="flex items-center gap-2 mb-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                    <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold px-2.5 py-0.5 rounded-full">
                      {selectedProgram.code}
                    </span>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">
                      {language === 'ar' ? selectedProgram.arabicStatus : selectedProgram.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? selectedProgram.arabicName : selectedProgram.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'ar' ? selectedProgram.arabicDepartment : selectedProgram.department}
                  </p>
                </div>

                {/* Dropdown status selector */}
                {['Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean'].includes(actingRole) && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Set Status</label>
                    <select
                      id="program-status-selector"
                      value={selectedProgram.status}
                      onChange={e => {
                        changeProgramStatus(selectedProgram.id, e.target.value as any);
                        setSelectedProgram({ ...selectedProgram, status: e.target.value as any });
                      }}
                      className="text-xs p-1.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Self Study">Self Study</option>
                      <option value="External Review">External Review</option>
                      <option value="Accredited">Accredited</option>
                      <option value="Needs Revision">Needs Revision</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Dynamic Course Portfolio List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                  <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <span>{t('courseReview')}</span>
                  </h4>

                  {['Platform Admin', 'Institution Admin', 'Quality Manager', 'Program Coordinator', 'Lecturer'].includes(actingRole) && (
                    <button
                      id="register-course-btn"
                      onClick={() => setShowCourseForm(!showCourseForm)}
                      className="p-1 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 border border-indigo-100 dark:border-indigo-950"
                      style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('addCourse')}</span>
                    </button>
                  )}
                </div>

                {/* Course insertion form */}
                {showCourseForm && (
                  <form onSubmit={handleCreateCourse} id="course-registration-form" className="p-4 border border-indigo-150 dark:border-indigo-950 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500">{t('courseName')}</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Distributed Databases"
                          value={courseName}
                          onChange={e => setCourseName(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500">{t('courseName')} (العربية)</label>
                        <input
                          type="text"
                          placeholder="مثال: قواعد البيانات الموزعة"
                          value={courseNameAr}
                          onChange={e => setCourseNameAr(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500">{t('courseCode')}</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CS410"
                          value={courseCode}
                          onChange={e => setCourseCode(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500">{t('creditHours')}</label>
                        <input
                          type="number"
                          value={courseCredits}
                          onChange={e => setCourseCredits(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500">{t('instructor')}</label>
                        <input
                          type="text"
                          placeholder="Dr. Lecturer Name"
                          value={courseInstructor}
                          onChange={e => setCourseInstructor(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-indigo-50 dark:border-indigo-950">
                      <button
                        type="button"
                        onClick={() => setShowCourseForm(false)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                      >
                        {t('addCourse')}
                      </button>
                    </div>
                  </form>
                )}

                {/* Courses map */}
                <div className="space-y-3" id="program-courses-accordion">
                  {activeCourses.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No courses linked to this quality program. Click Add Course above to register.
                    </div>
                  ) : (
                    activeCourses.map(course => (
                      <div
                        key={course.id}
                        id={`course-row-${course.id}`}
                        className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                        style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
                      >
                        <div className="flex-1 min-w-0" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                          <div className="flex items-center gap-2 mb-1" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                            <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-500 font-bold px-2 py-0.5 rounded">
                              {course.code}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {course.creditHours} Credits
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            {language === 'ar' ? course.arabicName : course.name}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Instructor: {course.lecturerName}
                          </p>

                          {/* Syllabus alignment score status indicator */}
                          <div className="flex items-center gap-1.5 mt-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                            {course.syllabusApproved ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span className="text-[10px] text-slate-500">
                              {course.syllabusApproved ? t('courseMaterials') : t('courseMaterialsPending')}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                              (Alignment Index: {course.complianceScore}%)
                            </span>
                          </div>
                        </div>

                        {/* Syllabus Approval buttons */}
                        {['Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean', 'Department Head', 'Program Coordinator'].includes(actingRole) && (
                          <div className="flex items-center gap-1.5 self-end md:self-center">
                            <button
                              id={`course-approve-btn-${course.id}`}
                              onClick={() => changeCourseReview(course.id, 'Approved', 95)}
                              className="px-2.5 py-1 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded"
                            >
                              {t('approveSyllabus')}
                            </button>
                            <button
                              id={`course-needs-work-btn-${course.id}`}
                              onClick={() => changeCourseReview(course.id, 'Needs Revision', 45)}
                              className="px-2.5 py-1 text-[10px] bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded"
                            >
                              {t('needsWorkSyllabus')}
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <GraduationCap className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm">Select an Academic Program from the catalog directory to inspect quality compliance matrices, courses portfolios, and accreditation status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
