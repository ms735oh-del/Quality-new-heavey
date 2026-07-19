import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, School, BookOpen, GraduationCap, Users, UserCheck, 
  Plus, Search, Edit2, Trash2, Filter, ArrowUpDown, Download, 
  Printer, FileSpreadsheet, FileText, CheckCircle, Clock, Calendar,
  X, ChevronLeft, ChevronRight, Paperclip, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Faculty, Department, Program, Course, Lecturer, Student } from '../types';

export const AcademicsDirectoryView: React.FC = () => {
  const { 
    language, activeInstitution, actingRole, currentUser, t,
    faculties, addNewFaculty, updateFaculty, deleteFaculty,
    departments, addNewDepartment, updateDepartment, deleteDepartment,
    programs, addNewProgram, changeProgramStatus,
    getCoursesForProgram, addNewCourse, changeCourseReview, courses,
    students, addNewStudent, updateStudent, deleteStudent,
    lecturers, addNewLecturer, updateLecturer, deleteLecturer
  } = useApp();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'faculties' | 'departments' | 'programs' | 'courses' | 'lecturers' | 'students'>('faculties');

  // --- Search & Filters State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [facultyFilter, setFacultyFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- CRUD Modals ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // --- Attachments & History ---
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Form states
  const [facultyForm, setFacultyForm] = useState({ name: '', arabicName: '', code: '', description: '', arabicDescription: '', dean: '', arabicDean: '' });
  const [departmentForm, setDepartmentForm] = useState({ facultyId: '', name: '', arabicName: '', head: '', arabicHead: '' });
  const [studentForm, setStudentForm] = useState({ studentId: '', nationalId: '', fullName: '', arabicFullName: '', gender: 'Male', arabicGender: 'ذكر', birthDate: '', email: '', phone: '', facultyId: '', departmentId: '', programId: '', academicLevel: 1, semester: 1, status: 'Active', arabicStatus: 'نشط', gpa: 3.5 });
  const [lecturerForm, setLecturerForm] = useState({ employeeId: '', name: '', arabicName: '', email: '', phone: '', facultyId: '', departmentId: '', academicRank: 'Assistant Professor', arabicAcademicRank: 'أستاذ مساعد', qualification: '', arabicQualification: '', researchInterests: '', arabicResearchInterests: '', officeHours: '', experienceYears: 5 });

  // Permissions helpers
  const canWrite = useMemo(() => {
    return ['Super Admin', 'Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean', 'Department Head'].includes(actingRole);
  }, [actingRole]);

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' }>({ show: false, msg: '', type: 'info' });
  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileName = e.dataTransfer.files[0].name;
      setAttachedFiles(prev => [...prev, fileName]);
      triggerToast(isAr ? `تم إرفاق الملف: ${fileName}` : `File attached: ${fileName}`, 'info');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setAttachedFiles(prev => [...prev, fileName]);
      triggerToast(isAr ? `تم إرفاق الملف: ${fileName}` : `File attached: ${fileName}`, 'info');
    }
  };

  // --- Sort Helper ---
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // --- PDF & Excel Export Mock ---
  const handleExport = (format: 'pdf' | 'excel') => {
    const filename = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    triggerToast(
      isAr 
        ? `جاري تصدير ${activeTab} بصيغة ${format.toUpperCase()}... تم تنزيل الملف (${filename})`
        : `Exporting ${activeTab} as ${format.toUpperCase()}... Downloaded (${filename})`, 
      'success'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Data Processors ---
  const filteredData = useMemo(() => {
    let base: any[] = [];
    if (activeTab === 'faculties') base = faculties;
    else if (activeTab === 'departments') base = departments;
    else if (activeTab === 'programs') base = programs;
    else if (activeTab === 'courses') base = courses;
    else if (activeTab === 'lecturers') base = lecturers;
    else if (activeTab === 'students') base = students;

    return base.filter(item => {
      const s = searchQuery.toLowerCase();
      const matchesSearch = 
        (item.name && item.name.toLowerCase().includes(s)) ||
        (item.arabicName && item.arabicName.toLowerCase().includes(s)) ||
        (item.code && item.code.toLowerCase().includes(s)) ||
        (item.fullName && item.fullName.toLowerCase().includes(s)) ||
        (item.arabicFullName && item.arabicFullName.toLowerCase().includes(s)) ||
        (item.studentId && item.studentId.toLowerCase().includes(s));

      let matchesStatus = true;
      if (statusFilter !== 'ALL') {
        if (item.status) matchesStatus = item.status === statusFilter;
        else if (item.academicRank) matchesStatus = item.academicRank === statusFilter;
      }

      let matchesFaculty = true;
      if (facultyFilter !== 'ALL' && item.facultyId) {
        matchesFaculty = item.facultyId === facultyFilter;
      }

      return matchesSearch && matchesStatus && matchesFaculty;
    }).sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [activeTab, faculties, departments, programs, courses, lecturers, students, searchQuery, statusFilter, facultyFilter, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // --- CRUD Functions ---
  const handleOpenAdd = () => {
    setAttachedFiles([]);
    if (activeTab === 'faculties') {
      setFacultyForm({ name: '', arabicName: '', code: '', description: '', arabicDescription: '', dean: '', arabicDean: '' });
    } else if (activeTab === 'departments') {
      setDepartmentForm({ facultyId: faculties[0]?.id || '', name: '', arabicName: '', head: '', arabicHead: '' });
    } else if (activeTab === 'students') {
      setStudentForm({ studentId: 'STD-2026-' + Math.floor(100 + Math.random() * 900), nationalId: 'NAT-998822', fullName: '', arabicFullName: '', gender: 'Male', arabicGender: 'ذكر', birthDate: '2004-01-01', email: '', phone: '', facultyId: faculties[0]?.id || '', departmentId: departments[0]?.id || '', programId: programs[0]?.id || '', academicLevel: 1, semester: 1, status: 'Active', arabicStatus: 'نشط', gpa: 3.5 });
    } else if (activeTab === 'lecturers') {
      setLecturerForm({ employeeId: 'EMP-3044', name: '', arabicName: '', email: '', phone: '', facultyId: faculties[0]?.id || '', departmentId: departments[0]?.id || '', academicRank: 'Assistant Professor', arabicAcademicRank: 'أستاذ مساعد', qualification: 'Ph.D.', arabicQualification: 'دكتوراه', researchInterests: '', arabicResearchInterests: '', officeHours: 'Mon 2-4 PM', experienceYears: 6 });
    }
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setSelectedItem(item);
    setAttachedFiles([]);
    if (activeTab === 'faculties') {
      setFacultyForm({ name: item.name, arabicName: item.arabicName, code: item.code, description: item.description, arabicDescription: item.arabicDescription, dean: item.dean, arabicDean: item.arabicDean });
    } else if (activeTab === 'departments') {
      setDepartmentForm({ facultyId: item.facultyId, name: item.name, arabicName: item.arabicName, head: item.head, arabicHead: item.arabicHead });
    } else if (activeTab === 'students') {
      setStudentForm({ ...item });
    } else if (activeTab === 'lecturers') {
      setLecturerForm({ ...item });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    if (activeTab === 'faculties') {
      addNewFaculty({
        ...facultyForm,
        departmentsCount: 0,
        programsCount: 0
      });
      triggerToast(isAr ? 'تم إضافة الكلية بنجاح!' : 'Faculty added successfully!');
    } else if (activeTab === 'departments') {
      addNewDepartment({
        ...departmentForm,
        programsCount: 0,
        lecturersCount: 0,
        studentsCount: 0
      });
      triggerToast(isAr ? 'تم إضافة القسم بنجاح!' : 'Department added successfully!');
    } else if (activeTab === 'students') {
      addNewStudent({
        ...studentForm
      });
      triggerToast(isAr ? 'تم قيد الطالب بنجاح!' : 'Student registered successfully!');
    } else if (activeTab === 'lecturers') {
      addNewLecturer({
        ...lecturerForm,
        publications: [],
        cvAttached: attachedFiles.length > 0,
        certificates: attachedFiles
      });
      triggerToast(isAr ? 'تم تسجيل المحاضر بنجاح!' : 'Lecturer profile added successfully!');
    }
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite || !selectedItem) return;

    if (activeTab === 'faculties') {
      updateFaculty({
        ...selectedItem,
        ...facultyForm
      });
      triggerToast(isAr ? 'تم تحديث بيانات الكلية!' : 'Faculty details updated!');
    } else if (activeTab === 'departments') {
      updateDepartment({
        ...selectedItem,
        ...departmentForm
      });
      triggerToast(isAr ? 'تم تحديث بيانات القسم!' : 'Department details updated!');
    } else if (activeTab === 'students') {
      updateStudent({
        ...selectedItem,
        ...studentForm
      });
      triggerToast(isAr ? 'تم تحديث ملف الطالب!' : 'Student file updated!');
    } else if (activeTab === 'lecturers') {
      updateLecturer({
        ...selectedItem,
        ...lecturerForm,
        cvAttached: attachedFiles.length > 0 || selectedItem.cvAttached,
        certificates: [...(selectedItem.certificates || []), ...attachedFiles]
      });
      triggerToast(isAr ? 'تم تحديث ملف المحاضر!' : 'Lecturer details updated!');
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!canWrite) return;
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا السجل؟' : 'Are you sure you want to delete this record?')) {
      if (activeTab === 'faculties') deleteFaculty(id);
      else if (activeTab === 'departments') deleteDepartment(id);
      else if (activeTab === 'students') deleteStudent(id);
      else if (activeTab === 'lecturers') deleteLecturer(id);
      triggerToast(isAr ? 'تم حذف السجل بنجاح.' : 'Record removed successfully.', 'info');
    }
  };

  return (
    <div className="space-y-6" id="academics-directory-main">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm" id="academics-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            {isAr ? 'دليل المؤسسة الأكاديمي' : 'Institution Academic Directory'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isAr 
              ? `إدارة الكليات والأقسام والبرامج والطلاب وأعضاء التدريس لمستأجر: ${activeInstitution.name}`
              : `Manage Colleges, Departments, Programs, Students, and Faculty for: ${activeInstitution.name}`}
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
          <button 
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
          >
            <Printer className="h-4 w-4" />
            {isAr ? 'طباعة' : 'Print'}
          </button>
          {canWrite && activeTab !== 'programs' && activeTab !== 'courses' && (
            <button 
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-xs font-bold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              {isAr ? 'إضافة جديد' : 'Add New'}
            </button>
          )}
        </div>
      </div>

      {/* Directory Tab Switcher */}
      <div className="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 gap-1" id="academics-tabs-switch">
        {[
          { key: 'faculties', label: isAr ? 'الكليات' : 'Faculties', icon: Building2 },
          { key: 'departments', label: isAr ? 'الأقسام الأكاديمية' : 'Departments', icon: School },
          { key: 'programs', label: isAr ? 'البرامج الأكاديمية' : 'Programs', icon: BookOpen },
          { key: 'courses', label: isAr ? 'المقررات الدراسية' : 'Courses', icon: BookOpen },
          { key: 'lecturers', label: isAr ? 'أعضاء هيئة التدريس' : 'Lecturers', icon: Users },
          { key: 'students', label: isAr ? 'شؤون الطلاب' : 'Students', icon: GraduationCap }
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
                setFacultyFilter('ALL');
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
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4" id="academics-filters">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input 
            type="text"
            placeholder={isAr ? 'البحث بالاسم أو الرمز...' : 'Search by name, code...'}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className={`w-full text-xs py-2 pr-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 ${isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
          />
        </div>

        {activeTab === 'lecturers' && (
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs py-2 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none text-zinc-600 dark:text-zinc-400"
            >
              <option value="ALL">{isAr ? 'كل الرتب الأكاديمية' : 'All Ranks'}</option>
              <option value="Professor">{isAr ? 'أستاذ' : 'Professor'}</option>
              <option value="Associate Professor">{isAr ? 'أستاذ مشارك' : 'Associate Professor'}</option>
              <option value="Assistant Professor">{isAr ? 'أستاذ مساعد' : 'Assistant Professor'}</option>
              <option value="Lecturer">{isAr ? 'محاضر' : 'Lecturer'}</option>
            </select>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs py-2 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none text-zinc-600 dark:text-zinc-400"
            >
              <option value="ALL">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
              <option value="Active">{isAr ? 'نشط' : 'Active'}</option>
              <option value="Suspended">{isAr ? 'موقوف' : 'Suspended'}</option>
              <option value="Graduated">{isAr ? 'خريج' : 'Graduated'}</option>
            </select>
          </div>
        )}

        {(activeTab === 'departments' || activeTab === 'students' || activeTab === 'lecturers') && (
          <div>
            <select
              value={facultyFilter}
              onChange={(e) => { setFacultyFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs py-2 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none text-zinc-600 dark:text-zinc-400"
            >
              <option value="ALL">{isAr ? 'كل الكليات' : 'All Faculties'}</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{isAr ? f.arabicName : f.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="text-xs text-zinc-500 flex items-center justify-end md:col-start-4">
          {isAr 
            ? `تم العثور على ${filteredData.length} سجل` 
            : `Found ${filteredData.length} records`}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden" id="academics-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
                {activeTab === 'faculties' && (
                  <>
                    <th className="p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort('name')}>
                      {isAr ? 'اسم الكلية' : 'Faculty Name'} <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                    </th>
                    <th className="p-4">{isAr ? 'الكود' : 'Code'}</th>
                    <th className="p-4">{isAr ? 'العميد' : 'Dean'}</th>
                    <th className="p-4 text-center">{isAr ? 'الأقسام' : 'Departments'}</th>
                    <th className="p-4 text-center">{isAr ? 'البرامج' : 'Programs'}</th>
                    {canWrite && <th className="p-4 text-right">{isAr ? 'العمليات' : 'Actions'}</th>}
                  </>
                )}

                {activeTab === 'departments' && (
                  <>
                    <th className="p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort('name')}>
                      {isAr ? 'اسم القسم' : 'Department Name'} <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                    </th>
                    <th className="p-4">{isAr ? 'رئيس القسم' : 'Head of Department'}</th>
                    <th className="p-4 text-center">{isAr ? 'البرامج' : 'Programs'}</th>
                    <th className="p-4 text-center">{isAr ? 'أعضاء التدريس' : 'Lecturers'}</th>
                    <th className="p-4 text-center">{isAr ? 'الطلاب المقيدين' : 'Students'}</th>
                    {canWrite && <th className="p-4 text-right">{isAr ? 'العمليات' : 'Actions'}</th>}
                  </>
                )}

                {activeTab === 'programs' && (
                  <>
                    <th className="p-4">{isAr ? 'اسم البرنامج' : 'Program Name'}</th>
                    <th className="p-4">{isAr ? 'الكود' : 'Code'}</th>
                    <th className="p-4">{isAr ? 'الدرجة العلمية' : 'Degree'}</th>
                    <th className="p-4">{isAr ? 'حالة الاعتماد' : 'Accreditation'}</th>
                    <th className="p-4 text-center">{isAr ? 'المخرجات التعليمية' : 'Learning Outcomes'}</th>
                  </>
                )}

                {activeTab === 'courses' && (
                  <>
                    <th className="p-4">{isAr ? 'المقرر الدراسي' : 'Course Module'}</th>
                    <th className="p-4">{isAr ? 'الكود' : 'Code'}</th>
                    <th className="p-4 text-center">{isAr ? 'الساعات المعتمدة' : 'Credits'}</th>
                    <th className="p-4">{isAr ? 'حالة مراجعة المنهج' : 'Syllabus Status'}</th>
                    <th className="p-4 text-center">{isAr ? 'مستوى المحاذاة' : 'Alignment score'}</th>
                  </>
                )}

                {activeTab === 'lecturers' && (
                  <>
                    <th className="p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort('name')}>
                      {isAr ? 'عضو هيئة التدريس' : 'Lecturer Name'} <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                    </th>
                    <th className="p-4">{isAr ? 'الرقم الوظيفي' : 'ID'}</th>
                    <th className="p-4">{isAr ? 'الرتبة الأكاديمية' : 'Academic Rank'}</th>
                    <th className="p-4">{isAr ? 'المؤهلات' : 'Qualification'}</th>
                    <th className="p-4 text-center">{isAr ? 'الخبرة (سنوات)' : 'Exp'}</th>
                    {canWrite && <th className="p-4 text-right">{isAr ? 'العمليات' : 'Actions'}</th>}
                  </>
                )}

                {activeTab === 'students' && (
                  <>
                    <th className="p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort('fullName')}>
                      {isAr ? 'اسم الطالب' : 'Student Name'} <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />
                    </th>
                    <th className="p-4">{isAr ? 'الرقم الجامعي' : 'Student ID'}</th>
                    <th className="p-4">{isAr ? 'المستوى' : 'Level'}</th>
                    <th className="p-4 text-center">{isAr ? 'المعدل GPA' : 'GPA'}</th>
                    <th className="p-4">{isAr ? 'حالة القيد' : 'Status'}</th>
                    {canWrite && <th className="p-4 text-right">{isAr ? 'العمليات' : 'Actions'}</th>}
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                    {isAr ? 'لا توجد سجلات مطابقة للمعايير المحددة.' : 'No records found matching the criteria.'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100">
                    {activeTab === 'faculties' && (
                      <>
                        <td className="p-4 font-semibold text-zinc-950 dark:text-zinc-50">
                          {isAr ? item.arabicName : item.name}
                        </td>
                        <td className="p-4 font-mono font-medium">{item.code}</td>
                        <td className="p-4">{isAr ? item.arabicDean : item.dean}</td>
                        <td className="p-4 text-center font-mono font-semibold">{item.departmentsCount || 0}</td>
                        <td className="p-4 text-center font-mono font-semibold">{item.programsCount || 0}</td>
                      </>
                    )}

                    {activeTab === 'departments' && (
                      <>
                        <td className="p-4 font-semibold text-zinc-950 dark:text-zinc-50">
                          {isAr ? item.arabicName : item.name}
                        </td>
                        <td className="p-4">{isAr ? item.arabicHead : item.head}</td>
                        <td className="p-4 text-center font-mono font-semibold">{item.programsCount || 0}</td>
                        <td className="p-4 text-center font-mono font-semibold">{item.lecturersCount || 0}</td>
                        <td className="p-4 text-center font-mono font-semibold text-zinc-600 dark:text-zinc-400">{item.studentsCount || 0}</td>
                      </>
                    )}

                    {activeTab === 'programs' && (
                      <>
                        <td className="p-4 font-semibold text-zinc-950 dark:text-zinc-50">
                          {isAr ? item.arabicName : item.name}
                        </td>
                        <td className="p-4 font-mono">{item.code}</td>
                        <td className="p-4">{item.degree}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            item.status === 'Accredited' 
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {isAr ? item.arabicStatus : item.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                            {item.outcomes?.length || 0} CLOs Mapped
                          </span>
                        </td>
                      </>
                    )}

                    {activeTab === 'courses' && (
                      <>
                        <td className="p-4 font-semibold text-zinc-950 dark:text-zinc-50">
                          {isAr ? item.arabicName : item.name}
                        </td>
                        <td className="p-4 font-mono font-medium">{item.code}</td>
                        <td className="p-4 text-center font-mono">{item.credits} Cr.</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            item.reviewStatus === 'Approved' 
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700' 
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
                          }`}>
                            {isAr ? item.arabicReviewStatus : item.reviewStatus}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {item.alignmentScore}%
                        </td>
                      </>
                    )}

                    {activeTab === 'lecturers' && (
                      <>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base">👤</span>
                            <div>
                              <div className="font-semibold text-zinc-950 dark:text-zinc-50">{isAr ? item.arabicName : item.name}</div>
                              <div className="text-[10px] text-zinc-400">{item.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-zinc-500">{item.employeeId}</td>
                        <td className="p-4 font-semibold text-zinc-700 dark:text-zinc-300">
                          {isAr ? item.arabicAcademicRank : item.academicRank}
                        </td>
                        <td className="p-4 text-zinc-600 dark:text-zinc-400 text-[11px]">
                          {isAr ? item.arabicQualification : item.qualification}
                        </td>
                        <td className="p-4 text-center font-mono">{item.experienceYears} y.</td>
                      </>
                    )}

                    {activeTab === 'students' && (
                      <>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{item.photo || '👦'}</span>
                            <div>
                              <div className="font-semibold text-zinc-950 dark:text-zinc-50">{isAr ? item.arabicFullName : item.fullName}</div>
                              <div className="text-[10px] text-zinc-400">{item.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-medium text-zinc-600 dark:text-zinc-400">{item.studentId}</td>
                        <td className="p-4 font-semibold">Level {item.academicLevel} / Sem {item.semester}</td>
                        <td className="p-4 text-center font-mono font-bold text-zinc-850 dark:text-zinc-100">
                          {item.gpa?.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Active' 
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                          }`}>
                            {isAr ? item.arabicStatus : item.status}
                          </span>
                        </td>
                      </>
                    )}

                    {canWrite && activeTab !== 'programs' && activeTab !== 'courses' && (
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
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

      {/* CRUD Add/Edit Dialog Modals */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden"
            >
              {/* Modal Title Header */}
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                  {isAddModalOpen 
                    ? (isAr ? `إضافة ${activeTab}` : `Add New ${activeTab.slice(0, -1)}`)
                    : (isAr ? `تعديل بيانات ${activeTab}` : `Edit ${activeTab.slice(0, -1)}`)
                  }
                </h3>
                <button 
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Action Form */}
              <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="p-6 space-y-4">
                {activeTab === 'faculties' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'اسم الكلية (EN)' : 'Faculty Name (EN)'}</label>
                      <input 
                        type="text" required
                        value={facultyForm.name}
                        onChange={(e) => setFacultyForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'اسم الكلية (AR)' : 'Faculty Name (AR)'}</label>
                      <input 
                        type="text" required
                        value={facultyForm.arabicName}
                        onChange={(e) => setFacultyForm(prev => ({ ...prev, arabicName: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'رمز الكلية' : 'Faculty Code'}</label>
                      <input 
                        type="text" required
                        placeholder="e.g. FE&T"
                        value={facultyForm.code}
                        onChange={(e) => setFacultyForm(prev => ({ ...prev, code: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'اسم العميد' : 'Dean Name'}</label>
                      <input 
                        type="text" required
                        value={facultyForm.dean}
                        onChange={(e) => setFacultyForm(prev => ({ ...prev, dean: e.target.value, arabicDean: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الوصف التوضيحي' : 'Description'}</label>
                      <textarea 
                        rows={2}
                        value={facultyForm.description}
                        onChange={(e) => setFacultyForm(prev => ({ ...prev, description: e.target.value, arabicDescription: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'departments' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الكلية التابع لها' : 'Belongs to Faculty'}</label>
                      <select 
                        required
                        value={departmentForm.facultyId}
                        onChange={(e) => setDepartmentForm(prev => ({ ...prev, facultyId: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none text-zinc-600 dark:text-zinc-400"
                      >
                        {faculties.map(f => (
                          <option key={f.id} value={f.id}>{isAr ? f.arabicName : f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'اسم القسم (EN)' : 'Department Name (EN)'}</label>
                      <input 
                        type="text" required
                        value={departmentForm.name}
                        onChange={(e) => setDepartmentForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'اسم القسم (AR)' : 'Department Name (AR)'}</label>
                      <input 
                        type="text" required
                        value={departmentForm.arabicName}
                        onChange={(e) => setDepartmentForm(prev => ({ ...prev, arabicName: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'رئيس القسم' : 'Head of Department'}</label>
                      <input 
                        type="text" required
                        value={departmentForm.head}
                        onChange={(e) => setDepartmentForm(prev => ({ ...prev, head: e.target.value, arabicHead: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'students' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto p-1">
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الرقم الجامعي' : 'Student ID'}</label>
                      <input 
                        type="text" required
                        value={studentForm.studentId}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, studentId: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الرقم القومي / الهوية' : 'National ID'}</label>
                      <input 
                        type="text" required
                        value={studentForm.nationalId}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, nationalId: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الاسم بالكامل (EN)' : 'Full Name (EN)'}</label>
                      <input 
                        type="text" required
                        value={studentForm.fullName}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الاسم بالكامل (AR)' : 'Full Name (AR)'}</label>
                      <input 
                        type="text" required
                        value={studentForm.arabicFullName}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, arabicFullName: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                      <input 
                        type="email" required
                        value={studentForm.email}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
                      <input 
                        type="text" required
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الكلية' : 'Faculty'}</label>
                      <select 
                        value={studentForm.facultyId}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, facultyId: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      >
                        {faculties.map(f => (
                          <option key={f.id} value={f.id}>{isAr ? f.arabicName : f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'القسم الأكاديمي' : 'Department'}</label>
                      <select 
                        value={studentForm.departmentId}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, departmentId: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{isAr ? d.arabicName : d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'المعدل التراكمي GPA' : 'Academic GPA'}</label>
                      <input 
                        type="number" step="0.01" max="4" required
                        value={studentForm.gpa}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, gpa: parseFloat(e.target.value) }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'المستوى الدراسي' : 'Academic Level'}</label>
                      <input 
                        type="number" required
                        value={studentForm.academicLevel}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, academicLevel: parseInt(e.target.value) }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'lecturers' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto p-1">
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الرقم الوظيفي' : 'Employee ID'}</label>
                      <input 
                        type="text" required
                        value={lecturerForm.employeeId}
                        onChange={(e) => setLecturerForm(prev => ({ ...prev, employeeId: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الاسم بالكامل (EN)' : 'Full Name (EN)'}</label>
                      <input 
                        type="text" required
                        value={lecturerForm.name}
                        onChange={(e) => setLecturerForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الاسم بالكامل (AR)' : 'Full Name (AR)'}</label>
                      <input 
                        type="text" required
                        value={lecturerForm.arabicName}
                        onChange={(e) => setLecturerForm(prev => ({ ...prev, arabicName: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الرتبة الأكاديمية' : 'Academic Rank'}</label>
                      <select 
                        value={lecturerForm.academicRank}
                        onChange={(e) => setLecturerForm(prev => ({ ...prev, academicRank: e.target.value as any, arabicAcademicRank: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      >
                        <option value="Professor">{isAr ? 'أستاذ' : 'Professor'}</option>
                        <option value="Associate Professor">{isAr ? 'أستاذ مشارك' : 'Associate Professor'}</option>
                        <option value="Assistant Professor">{isAr ? 'أستاذ مساعد' : 'Assistant Professor'}</option>
                        <option value="Lecturer">{isAr ? 'محاضر' : 'Lecturer'}</option>
                        <option value="Teaching Assistant">{isAr ? 'معيد' : 'Teaching Assistant'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الكلية' : 'Faculty'}</label>
                      <select 
                        value={lecturerForm.facultyId}
                        onChange={(e) => setLecturerForm(prev => ({ ...prev, facultyId: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      >
                        {faculties.map(f => (
                          <option key={f.id} value={f.id}>{isAr ? f.arabicName : f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'القسم الأكاديمي' : 'Department'}</label>
                      <select 
                        value={lecturerForm.departmentId}
                        onChange={(e) => setLecturerForm(prev => ({ ...prev, departmentId: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{isAr ? d.arabicName : d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'المؤهلات العلمية (EN)' : 'Qualifications (EN)'}</label>
                      <input 
                        type="text" required
                        value={lecturerForm.qualification}
                        onChange={(e) => setLecturerForm(prev => ({ ...prev, qualification: e.target.value, arabicQualification: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">{isAr ? 'الاهتمامات البحثية (EN)' : 'Research Interests (EN)'}</label>
                      <input 
                        type="text"
                        value={lecturerForm.researchInterests}
                        onChange={(e) => setLecturerForm(prev => ({ ...prev, researchInterests: e.target.value, arabicResearchInterests: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Attachments Upload drag-drop area */}
                <div className="space-y-2 mt-4" id="drag-drop-container">
                  <label className="block text-xs font-bold">{isAr ? 'المرفقات والملفات الثبوتية' : 'Evidence Documents & Attachments'}</label>
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      dragActive 
                        ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/50' 
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50'
                    }`}
                  >
                    <Paperclip className="h-6 w-6 text-zinc-400 mb-1.5" />
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                      {isAr ? 'اسحب وأفلت الملفات هنا أو انقر لتحديدها' : 'Drag & Drop files here, or click to browse'}
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      id="academic-file-picker" 
                      onChange={handleFileSelect}
                    />
                    <label 
                      htmlFor="academic-file-picker"
                      className="text-[10px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 cursor-pointer font-bold"
                    >
                      {isAr ? 'تصفح الملفات' : 'Browse Files'}
                    </label>
                  </div>
                  {/* Attached Files List */}
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {attachedFiles.map((file, i) => (
                        <div key={i} className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded">
                          <Paperclip className="h-3 w-3 text-zinc-500" />
                          <span>{file}</span>
                          <button 
                            type="button"
                            onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-red-500 hover:text-red-700 ml-1 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audit History Log Segment (Only for Edits) */}
                {isEditModalOpen && selectedItem && (
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2 mt-4 text-[10px]" id="audit-history-timeline">
                    <div className="font-bold flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                      <Activity className="h-3.5 w-3.5" />
                      {isAr ? 'سجل التدقيق والتعديلات' : 'Audit Logs & Change History'}
                    </div>
                    <div className="space-y-1.5 max-h-[80px] overflow-y-auto pr-1">
                      <div className="flex justify-between text-zinc-500">
                        <span>● {isAr ? 'تم إنشاء السجل الأصلي بنجاح' : 'Original record deployed successfully'}</span>
                        <span>2026-07-10</span>
                      </div>
                      <div className="flex justify-between text-zinc-500">
                        <span>● {isAr ? 'تم التحقق من مطابقة الجودة' : 'Verified digital compliance state'}</span>
                        <span>2026-07-12</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Action Controls */}
                <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-6">
                  <button 
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                    className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-xs font-bold text-white dark:text-zinc-900 hover:bg-zinc-800"
                  >
                    {isAr ? 'حفظ البيانات' : 'Save Details'}
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
