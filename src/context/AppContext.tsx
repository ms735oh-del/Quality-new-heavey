/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  ThemeMode,
  Institution,
  User,
  KPI,
  Program,
  Course,
  ActionPlan,
  QualityReport,
  AuditLog,
  Task,
  Notification,
  UserRole,
  Faculty,
  Department,
  Student,
  Lecturer,
  QualityObjective,
  StudentEvaluation,
  LecturerSelfEvaluation,
  PeerReview,
  ExternalReview,
  AccreditationStandard,
  ComplaintSuggestion,
  InternalAudit,
  RiskItem,
  CapaItem,
  DocumentItem,
  Announcement,
  CalendarEvent,
  EvaluationQuestion
} from '../types';
import { dbService, INITIAL_INSTITUTIONS, INITIAL_USERS } from '../services/db';
import { TRANSLATIONS } from '../services/translations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
  
  // Multi-tenant
  activeInstitution: Institution;
  setActiveInstitution: (instId: string) => void;
  institutions: Institution[];
  addNewInstitution: (inst: Omit<Institution, 'id'>) => void;
  updateInstitution: (inst: Institution) => void;
  deleteInstitution: (instId: string) => void;
  
  // Users & RBAC
  actingRole: UserRole;
  setActingRole: (role: UserRole) => void;
  currentUser: User;
  usersInInstitution: User[];
  addNewUser: (user: Omit<User, 'id' | 'institutionId'>, password?: string) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;

  // Data Actions
  kpis: KPI[];
  updateKPI: (kpiId: string, value: number) => void;
  
  programs: Program[];
  addNewProgram: (prog: Omit<Program, 'id' | 'institutionId'>) => void;
  changeProgramStatus: (progId: string, status: Program['status']) => void;
  
  courses: Course[];
  getCoursesForProgram: (progId: string) => Course[];
  addNewCourse: (progId: string, course: Omit<Course, 'id' | 'programId'>) => void;
  changeCourseReview: (courseId: string, status: Course['reviewStatus'], score: number) => void;
  
  reports: QualityReport[];
  submitReport: (report: QualityReport) => void;
  
  actionPlans: ActionPlan[];
  addNewActionPlan: (ap: Omit<ActionPlan, 'id' | 'institutionId'>) => void;
  changeActionPlanStatus: (apId: string, status: ActionPlan['status']) => void;
  
  tasks: Task[];
  addNewTask: (task: Omit<Task, 'id' | 'institutionId'>) => void;
  changeTaskStatus: (taskId: string, status: Task['status']) => void;
  
  notifications: Notification[];
  markNotificationsAsRead: () => void;
  
  auditLogs: AuditLog[];
  resetAllData: () => void;

  // --- New SaaS Quality Collections & CRUD ---
  faculties: Faculty[];
  addNewFaculty: (fac: Omit<Faculty, 'id' | 'institutionId'>) => void;
  updateFaculty: (fac: Faculty) => void;
  deleteFaculty: (facId: string) => void;

  departments: Department[];
  addNewDepartment: (dept: Omit<Department, 'id' | 'institutionId'>) => void;
  updateDepartment: (dept: Department) => void;
  deleteDepartment: (deptId: string) => void;

  students: Student[];
  addNewStudent: (std: Omit<Student, 'id' | 'institutionId'>) => void;
  updateStudent: (std: Student) => void;
  deleteStudent: (stdId: string) => void;

  lecturers: Lecturer[];
  addNewLecturer: (lect: Omit<Lecturer, 'id' | 'institutionId'>) => void;
  updateLecturer: (lect: Lecturer) => void;
  deleteLecturer: (lectId: string) => void;

  qualityObjectives: QualityObjective[];
  addNewQualityObjective: (qo: Omit<QualityObjective, 'id' | 'institutionId'>) => void;
  updateQualityObjective: (qo: QualityObjective) => void;
  deleteQualityObjective: (qoId: string) => void;

  studentEvaluations: StudentEvaluation[];
  addNewStudentEvaluation: (se: Omit<StudentEvaluation, 'id' | 'institutionId'>) => void;

  lecturerSelfEvaluations: LecturerSelfEvaluation[];
  addNewLecturerSelfEvaluation: (lse: Omit<LecturerSelfEvaluation, 'id' | 'institutionId'>) => void;

  peerReviews: PeerReview[];
  addNewPeerReview: (pr: Omit<PeerReview, 'id' | 'institutionId'>) => void;
  updatePeerReviewStatus: (prId: string, status: PeerReview['status']) => void;

  externalReviews: ExternalReview[];
  addNewExternalReview: (er: Omit<ExternalReview, 'id' | 'institutionId'>) => void;

  accreditationStandards: AccreditationStandard[];
  addNewAccreditationStandard: (as: Omit<AccreditationStandard, 'id' | 'institutionId'>) => void;
  updateAccreditationStandard: (as: AccreditationStandard) => void;

  complaintsSuggestions: ComplaintSuggestion[];
  addNewComplaintSuggestion: (cs: Omit<ComplaintSuggestion, 'id' | 'institutionId'>) => void;
  updateComplaintSuggestion: (cs: ComplaintSuggestion) => void;

  internalAudits: InternalAudit[];
  addNewInternalAudit: (ia: Omit<InternalAudit, 'id' | 'institutionId'>) => void;
  updateInternalAudit: (ia: InternalAudit) => void;

  riskItems: RiskItem[];
  addNewRiskItem: (rk: Omit<RiskItem, 'id' | 'institutionId'>) => void;
  updateRiskItem: (rk: RiskItem) => void;
  deleteRiskItem: (rkId: string) => void;

  capaItems: CapaItem[];
  addNewCapaItem: (cp: Omit<CapaItem, 'id' | 'institutionId'>) => void;
  updateCapaItem: (cp: CapaItem) => void;

  documentItems: DocumentItem[];
  addNewDocumentItem: (doc: Omit<DocumentItem, 'id' | 'institutionId'>) => void;
  updateDocumentItem: (doc: DocumentItem) => void;

  announcements: Announcement[];
  addNewAnnouncement: (an: Omit<Announcement, 'id' | 'institutionId'>) => void;

  calendarEvents: CalendarEvent[];
  addNewCalendarEvent: (cal: Omit<CalendarEvent, 'id' | 'institutionId'>) => void;

  evaluationQuestions: EvaluationQuestion[];
  addNewEvaluationQuestion: (eq: Omit<EvaluationQuestion, 'id' | 'institutionId'>) => void;
  updateEvaluationQuestion: (eq: EvaluationQuestion) => void;
  deleteEvaluationQuestion: (eqId: string) => void;
  
  // Translation Helper
  t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language State & Direction (RTL/LTR)
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('saas_quality_lang');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('saas_quality_lang', lang);
  };

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);

  // 2. Theme State & Dark Mode Integration
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('saas_quality_theme');
    return (saved as ThemeMode) || 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('saas_quality_theme', mode);
  };

  useEffect(() => {
    const updateTheme = () => {
      let active: 'light' | 'dark' = 'light';
      if (theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        active = isDark ? 'dark' : 'light';
      } else {
        active = theme === 'dark' ? 'dark' : 'light';
      }
      setResolvedTheme(active);

      const root = document.documentElement;
      if (active === 'dark') {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    updateTheme();
    if (theme === 'auto') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', updateTheme);
      return () => media.removeEventListener('change', updateTheme);
    }
  }, [theme]);

  // 3. Multi-tenant: Selected Institution State
  const [institutions, setInstitutions] = useState<Institution[]>(() => dbService.getInstitutions());
  const [activeInstitution, setActiveInstitutionState] = useState<Institution>(() => {
    const savedId = localStorage.getItem('saas_quality_active_inst');
    const match = institutions.find(i => i.id === savedId);
    return match || institutions[0] || INITIAL_INSTITUTIONS[0];
  });

  const setActiveInstitution = (instId: string) => {
    const match = institutions.find(i => i.id === instId);
    if (match) {
      setActiveInstitutionState(match);
      localStorage.setItem('saas_quality_active_inst', instId);
      // Auto switch acting user if changing tenant to align demo roles
      const tenantUsers = dbService.getUsers(instId);
      if (tenantUsers.length > 0) {
        // find best match or default to QM
        const best = tenantUsers.find(u => u.role === 'Quality Manager') || tenantUsers[0];
        setActingRole(best.role);
      }
    }
  };

  // 4. True Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('saas_quality_auth') === 'true';
  });

  const [actingRole, setActingRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('saas_quality_acting_role');
    return (saved as UserRole) || 'Platform Admin';
  });

  const setActingRole = (role: UserRole) => {
    setActingRoleState(role);
    localStorage.setItem('saas_quality_acting_role', role);
  };

  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [usersInInstitution, setUsersInInstitution] = useState<User[]>([]);

  const login = (email: string) => {
    const sanitizedEmail = email.trim().toLowerCase();
    setIsAuthenticated(true);
    localStorage.setItem('saas_quality_auth', 'true');
    localStorage.setItem('saas_quality_auth_email', sanitizedEmail);
    
    const currentList = dbService.getUsers(activeInstitution.id);
    let matchedUser = currentList.find(u => u.email.toLowerCase() === sanitizedEmail);
    
    if (!matchedUser) {
      const allInsts = dbService.getInstitutions();
      for (const inst of allInsts) {
        const users = dbService.getUsers(inst.id);
        const found = users.find(u => u.email.toLowerCase() === sanitizedEmail);
        if (found) {
          matchedUser = found;
          setActiveInstitution(inst.id);
          break;
        }
      }
    }

    if (matchedUser) {
      setCurrentUser(matchedUser);
      setActingRole(matchedUser.role);
    } else if (sanitizedEmail === 'lztalaslamqadm@gmail.com' || sanitizedEmail === 'iztalaslamqadm@gmail.com') {
      setCurrentUser(INITIAL_USERS[0]);
      setActingRole('Platform Admin');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('saas_quality_auth');
    localStorage.removeItem('saas_quality_auth_email');
    localStorage.removeItem('saas_quality_acting_role');
  };

  useEffect(() => {
    const currentList = dbService.getUsers(activeInstitution.id);
    setUsersInInstitution(currentList);
    
    const savedEmail = localStorage.getItem('saas_quality_auth_email') || 'lztalaslamqadm@gmail.com';
    let matchedUser = currentList.find(u => u.email.toLowerCase() === savedEmail.toLowerCase());
    
    if (!matchedUser) {
      const allInsts = dbService.getInstitutions();
      for (const inst of allInsts) {
        const users = dbService.getUsers(inst.id);
        const found = users.find(u => u.email.toLowerCase() === savedEmail.toLowerCase());
        if (found) {
          matchedUser = found;
          break;
        }
      }
    }

    if (!matchedUser && (savedEmail.toLowerCase() === 'lztalaslamqadm@gmail.com' || savedEmail.toLowerCase() === 'iztalaslamqadm@gmail.com')) {
      matchedUser = { ...INITIAL_USERS[0] };
    }

    if (matchedUser) {
      matchedUser.uid = matchedUser.uid || matchedUser.id;
      matchedUser.tenantId = matchedUser.tenantId || matchedUser.institutionId;
      matchedUser.permissions = matchedUser.permissions || (
        matchedUser.role === 'Platform Admin' || matchedUser.role === 'Super Admin'
          ? ['all']
          : matchedUser.role === 'Institution Admin'
            ? ['read', 'write', 'admin']
            : ['read']
      );

      const isPlatformManager = actingRole === 'Platform Admin' || actingRole === 'Super Admin';
      if (!isPlatformManager) {
        const existingInTenant = currentList.find(u => u.role === actingRole);
        if (existingInTenant) {
          matchedUser = {
            ...existingInTenant,
            uid: existingInTenant.uid || existingInTenant.id,
            tenantId: existingInTenant.tenantId || existingInTenant.institutionId,
            permissions: existingInTenant.permissions || ['read']
          };
        } else {
          matchedUser = {
            ...matchedUser,
            institutionId: activeInstitution.id,
            tenantId: activeInstitution.id,
            role: actingRole,
            permissions: actingRole === 'Institution Admin' ? ['read', 'write', 'admin'] : ['read']
          };
        }
      }
      setCurrentUser(matchedUser);
    } else {
      setCurrentUser(INITIAL_USERS[0]);
    }
  }, [activeInstitution, actingRole]);

  // 5. Data States (Refreshed on actions or tenant changes)
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [reports, setReports] = useState<QualityReport[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // New SaaS Quality States
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [qualityObjectives, setQualityObjectives] = useState<QualityObjective[]>([]);
  const [studentEvaluations, setStudentEvaluations] = useState<StudentEvaluation[]>([]);
  const [lecturerSelfEvaluations, setLecturerSelfEvaluations] = useState<LecturerSelfEvaluation[]>([]);
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);
  const [externalReviews, setExternalReviews] = useState<ExternalReview[]>([]);
  const [accreditationStandards, setAccreditationStandards] = useState<AccreditationStandard[]>([]);
  const [complaintsSuggestions, setComplaintsSuggestions] = useState<ComplaintSuggestion[]>([]);
  const [internalAudits, setInternalAudits] = useState<InternalAudit[]>([]);
  const [riskItems, setRiskItems] = useState<RiskItem[]>([]);
  const [capaItems, setCapaItems] = useState<CapaItem[]>([]);
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [evaluationQuestions, setEvaluationQuestions] = useState<EvaluationQuestion[]>([]);

  const refreshTenantData = () => {
    const instId = activeInstitution.id;
    setKpis(dbService.getKPIs(instId));
    setPrograms(dbService.getPrograms(instId));
    setCourses(dbService.getAllCourses(instId));
    setReports(dbService.getReports(instId));
    setActionPlans(dbService.getActionPlans(instId));
    setTasks(dbService.getTasks(instId));
    setNotifications(dbService.getNotifications());
    setAuditLogs(dbService.getAuditLogs(instId));

    // Reload New Collections
    setFaculties(dbService.getFaculties(instId));
    setDepartments(dbService.getDepartments(instId));
    setStudents(dbService.getStudents(instId));
    setLecturers(dbService.getLecturers(instId));
    setQualityObjectives(dbService.getQualityObjectives(instId));
    setStudentEvaluations(dbService.getStudentEvaluations(instId));
    setLecturerSelfEvaluations(dbService.getLecturerSelfEvaluations(instId));
    setPeerReviews(dbService.getPeerReviews(instId));
    setExternalReviews(dbService.getExternalReviews(instId));
    setAccreditationStandards(dbService.getAccreditationStandards(instId));
    setComplaintsSuggestions(dbService.getComplaintsSuggestions(instId));
    setInternalAudits(dbService.getInternalAudits(instId));
    setRiskItems(dbService.getRiskItems(instId));
    setCapaItems(dbService.getCapaItems(instId));
    setDocumentItems(dbService.getDocumentItems(instId));
    setAnnouncements(dbService.getAnnouncements(instId));
    setCalendarEvents(dbService.getCalendarEvents(instId));
    setEvaluationQuestions(dbService.getEvaluationQuestions(instId));
  };

  useEffect(() => {
    refreshTenantData();
  }, [activeInstitution]);

  const syncSaaSState = async () => {
    try {
      const res = await fetch('/api/saas/subscriptions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.subscriptions) {
          const subs = data.subscriptions;
          setInstitutions(prev => {
            const updated = prev.map(inst => {
              const sub = subs[inst.id];
              if (sub) {
                return {
                  ...inst,
                  subscriptionTier: sub.tier,
                  subscriptionStatus: sub.status,
                  subscriptionStartDate: sub.startDate,
                  subscriptionEndDate: sub.endDate,
                  maxUsers: sub.maxUsers,
                  maxStudents: sub.maxStudents,
                  maxLecturers: sub.maxLecturers,
                  storageLimitGB: sub.storageLimitGB,
                  apiAccess: sub.apiAccess,
                  aiFeatures: sub.aiFeatures,
                  reportsAccess: sub.reportsAccess,
                  evaluationFeatures: sub.evaluationFeatures
                };
              }
              return inst;
            });
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Failed to sync SaaS state with server:', err);
    }
  };

  useEffect(() => {
    syncSaaSState();
    const interval = setInterval(syncSaaSState, 10000); // sync every 10s
    return () => clearInterval(interval);
  }, [activeInstitution?.id]);

  // --- CRUD WRAPPERS ---
  const addNewInstitution = (inst: Omit<Institution, 'id'>) => {
    const fresh = dbService.addInstitution(inst, currentUser.id, currentUser.name);
    setInstitutions(dbService.getInstitutions());
    setActiveInstitutionState(fresh);
    localStorage.setItem('saas_quality_active_inst', fresh.id);
    
    // Trigger notification
    dbService.addNotification({
      title: 'Tenant Deployed Successfully',
      arabicTitle: 'تم نشر المستأجر بنجاح',
      message: `${inst.name} is now online with isolated storage containers.`,
      arabicMessage: `${inst.arabicName || inst.name} متصل الآن بحاويات تخزين معزولة.`,
      type: 'success'
    });
  };

  const updateInstitution = (inst: Institution) => {
    dbService.updateInstitution(inst, currentUser.id, currentUser.name);
    setInstitutions(dbService.getInstitutions());
  };

  const deleteInstitution = (instId: string) => {
    dbService.deleteInstitution(instId, currentUser.id, currentUser.name);
    const currentInsts = dbService.getInstitutions();
    setInstitutions(currentInsts);
    if (activeInstitution.id === instId) {
      const fallback = currentInsts[0] || INITIAL_INSTITUTIONS[0];
      setActiveInstitutionState(fallback);
      localStorage.setItem('saas_quality_active_inst', fallback.id);
    }
  };

  const addNewUser = (user: Omit<User, 'id' | 'institutionId'>, password?: string) => {
    const newUser = dbService.addUser({
      ...user,
      institutionId: activeInstitution.id
    }, currentUser.id, currentUser.name, actingRole);
    
    if (password) {
      dbService.setPassword(user.email, password);
    } else {
      dbService.setPassword(user.email, '123456');
    }

    setUsersInInstitution(dbService.getUsers(activeInstitution.id));
    
    dbService.addNotification({
      title: 'User Access Authorized',
      arabicTitle: 'تم ترخيص صلاحيات المستخدم',
      message: `Role assigned to ${user.name} successfully.`,
      arabicMessage: `تم تعيين الدور لـ ${user.name} بنجاح.`,
      type: 'info'
    });
    refreshTenantData();
  };

  const updateUser = (user: User) => {
    dbService.updateUser(user, currentUser.id, currentUser.name, actingRole);
    setUsersInInstitution(dbService.getUsers(activeInstitution.id));
    refreshTenantData();
  };

  const deleteUser = (userId: string) => {
    dbService.deleteUser(userId, currentUser.id, currentUser.name, actingRole, activeInstitution.id);
    setUsersInInstitution(dbService.getUsers(activeInstitution.id));
    refreshTenantData();
  };

  const updateKPI = (kpiId: string, value: number) => {
    dbService.updateKPIValue(kpiId, value, currentUser.id, currentUser.name, actingRole);
    
    dbService.addNotification({
      title: 'KPI Log Entered',
      arabicTitle: 'تم تسجيل مؤشر الأداء',
      message: `Metric standard has been successfully updated to ${value}.`,
      arabicMessage: `تم تحديث معيار المقاييس بنجاح إلى ${value}.`,
      type: 'success'
    });
    refreshTenantData();
  };

  const addNewProgram = (prog: Omit<Program, 'id' | 'institutionId'>) => {
    dbService.addProgram({
      ...prog,
      institutionId: activeInstitution.id
    }, currentUser.id, currentUser.name, actingRole);
    
    dbService.addNotification({
      title: 'Academic Program Registered',
      arabicTitle: 'تم تسجيل برنامج أكاديمي',
      message: `${prog.name} (${prog.code}) is now in compliance pipeline.`,
      arabicMessage: `${prog.arabicName || prog.name} (${prog.code}) مدرج الآن في مسار الامتثال.`,
      type: 'success'
    });
    refreshTenantData();
  };

  const changeProgramStatus = (progId: string, status: Program['status']) => {
    const arabicMap: Record<Program['status'], string> = {
      'Draft': 'مسودة',
      'Self Study': 'دراسة ذاتية',
      'External Review': 'مراجعة خارجية',
      'Accredited': 'معتمد',
      'Needs Revision': 'بحاجة إلى مراجعة'
    };
    dbService.updateProgramStatus(progId, status, arabicMap[status], currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  const getCoursesForProgram = (progId: string) => {
    return dbService.getCourses(progId);
  };

  const addNewCourse = (progId: string, course: Omit<Course, 'id' | 'programId'>) => {
    dbService.addCourse({
      ...course,
      programId: progId
    }, currentUser.id, currentUser.name, actingRole, activeInstitution.id);
    
    dbService.addNotification({
      title: 'Course Module Enrolled',
      arabicTitle: 'تم تسجيل مادة دراسية',
      message: `${course.name} syllabus is set for evaluation.`,
      arabicMessage: `منهج المادة ${course.arabicName || course.name} مهيأ الآن للتقييم الأكاديمي.`,
      type: 'info'
    });
    refreshTenantData();
  };

  const changeCourseReview = (courseId: string, status: Course['reviewStatus'], score: number) => {
    const arabicMap: Record<Course['reviewStatus'], string> = {
      'Approved': 'معتمد',
      'Pending Review': 'قيد المراجعة',
      'Needs Revision': 'بحاجة إلى مراجعة'
    };
    dbService.updateCourseReview(courseId, status, arabicMap[status], score, currentUser.id, currentUser.name, actingRole, activeInstitution.id);
    refreshTenantData();
  };

  const submitReport = (report: QualityReport) => {
    dbService.saveReport(report, currentUser.id, currentUser.name, actingRole);
    
    const submitted = report.status === 'Submitted';
    dbService.addNotification({
      title: submitted ? 'Accreditation SER Locked' : 'SER Report Draft Saved',
      arabicTitle: submitted ? 'تم قفل ملف الدراسة الذاتية للبرامج' : 'تم حفظ مسودة تقرير الدراسة الذاتية',
      message: submitted 
        ? `Academic quality evaluation report for ${report.title} successfully submitted.` 
        : `Progress on ${report.title} has been logged locally.`,
      arabicMessage: submitted 
        ? `تم تقديم تقرير تقييم الجودة الأكاديمية لـ ${report.arabicTitle || report.title} بنجاح.` 
        : `تم توثيق التقدم في ${report.arabicTitle || report.title} محلياً.`,
      type: submitted ? 'success' : 'info'
    });
    refreshTenantData();
  };

  const addNewActionPlan = (ap: Omit<ActionPlan, 'id' | 'institutionId'>) => {
    dbService.addActionPlan({
      ...ap,
      institutionId: activeInstitution.id
    }, currentUser.id, currentUser.name, actingRole);
    
    dbService.addNotification({
      title: 'Action Remediation Logged',
      arabicTitle: 'تم تسجيل الإجراء العلاجي',
      message: `Strategic recommendation initiative established: "${ap.title}".`,
      arabicMessage: `تم تأسيس مبادرة التوصية الاستراتيجية: "${ap.arabicTitle || ap.title}".`,
      type: 'warning'
    });
    refreshTenantData();
  };

  const changeActionPlanStatus = (apId: string, status: ActionPlan['status']) => {
    const arabicMap: Record<ActionPlan['status'], string> = {
      'Not Started': 'لم يبدأ بعد',
      'In Progress': 'قيد التنفيذ',
      'Completed': 'مكتملة بنجاح'
    };
    dbService.updateActionPlanStatus(apId, status, arabicMap[status], currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  const addNewTask = (task: Omit<Task, 'id' | 'institutionId'>) => {
    dbService.addTask({
      ...task,
      institutionId: activeInstitution.id
    }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  const changeTaskStatus = (taskId: string, status: Task['status']) => {
    const arabicMap: Record<Task['status'], string> = {
      'Todo': 'المهمة المطلوبة',
      'In Progress': 'قيد التنفيذ',
      'Completed': 'مكتملة بنجاح'
    };
    dbService.updateTaskStatus(taskId, status, arabicMap[status], currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  const markNotificationsAsRead = () => {
    dbService.markAllNotificationsRead();
    setNotifications(dbService.getNotifications());
  };

  const resetAllData = () => {
    dbService.clearDatabase();
    setInstitutions(dbService.getInstitutions());
    const match = dbService.getInstitutions()[0];
    setActiveInstitutionState(match);
    setActingRole('Quality Manager');
    
    dbService.addNotification({
      title: 'Workspace Data Reset',
      arabicTitle: 'تم إعادة تهيئة بيانات النظام',
      message: 'All custom tables successfully reseeded. Multitenant state safe.',
      arabicMessage: 'تمت إعادة تعيين جميع الجداول المخصصة بنجاح. حالة المستأجرين المتعددين آمنة.',
      type: 'warning'
    });
    refreshTenantData();
  };

  // --- Faculties Wrappers ---
  const addNewFaculty = (fac: Omit<Faculty, 'id' | 'institutionId'>) => {
    dbService.addFaculty({ ...fac, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updateFaculty = (fac: Faculty) => {
    dbService.updateFaculty(fac, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const deleteFaculty = (facId: string) => {
    dbService.deleteFaculty(facId, activeInstitution.id, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Departments Wrappers ---
  const addNewDepartment = (dept: Omit<Department, 'id' | 'institutionId'>) => {
    dbService.addDepartment({ ...dept, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updateDepartment = (dept: Department) => {
    dbService.updateDepartment(dept, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const deleteDepartment = (deptId: string) => {
    dbService.deleteDepartment(deptId, activeInstitution.id, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Students Wrappers ---
  const addNewStudent = (std: Omit<Student, 'id' | 'institutionId'>) => {
    dbService.addStudent({ ...std, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updateStudent = (std: Student) => {
    dbService.updateStudent(std, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const deleteStudent = (stdId: string) => {
    dbService.deleteStudent(stdId, activeInstitution.id, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Lecturers Wrappers ---
  const addNewLecturer = (lect: Omit<Lecturer, 'id' | 'institutionId'>) => {
    dbService.addLecturer({ ...lect, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updateLecturer = (lect: Lecturer) => {
    dbService.updateLecturer(lect, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const deleteLecturer = (lectId: string) => {
    dbService.deleteLecturer(lectId, activeInstitution.id, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Quality Objectives Wrappers ---
  const addNewQualityObjective = (qo: Omit<QualityObjective, 'id' | 'institutionId'>) => {
    dbService.addQualityObjective({ ...qo, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updateQualityObjective = (qo: QualityObjective) => {
    dbService.updateQualityObjective(qo, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const deleteQualityObjective = (qoId: string) => {
    dbService.deleteQualityObjective(qoId, activeInstitution.id, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Student Evaluations Wrappers ---
  const addNewStudentEvaluation = (se: Omit<StudentEvaluation, 'id' | 'institutionId'>) => {
    dbService.addStudentEvaluation({ ...se, institutionId: activeInstitution.id });
    refreshTenantData();
  };

  // --- Lecturer Self Evaluations Wrappers ---
  const addNewLecturerSelfEvaluation = (lse: Omit<LecturerSelfEvaluation, 'id' | 'institutionId'>) => {
    dbService.addLecturerSelfEvaluation({ ...lse, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Peer Reviews Wrappers ---
  const addNewPeerReview = (pr: Omit<PeerReview, 'id' | 'institutionId'>) => {
    dbService.addPeerReview({ ...pr, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updatePeerReviewStatus = (prId: string, status: PeerReview['status']) => {
    const arabicStatusMap: Record<PeerReview['status'], string> = {
      'Pending Approval': 'قيد الاعتماد',
      'Approved': 'معتمد',
      'Rejected': 'مرفوض'
    };
    dbService.updatePeerReviewStatus(prId, status, arabicStatusMap[status], activeInstitution.id, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- External Reviews Wrappers ---
  const addNewExternalReview = (er: Omit<ExternalReview, 'id' | 'institutionId'>) => {
    dbService.addExternalReview({ ...er, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Accreditation Standards Wrappers ---
  const addNewAccreditationStandard = (as: Omit<AccreditationStandard, 'id' | 'institutionId'>) => {
    dbService.addAccreditationStandard({ ...as, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updateAccreditationStandard = (as: AccreditationStandard) => {
    dbService.updateAccreditationStandard(as, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Complaints Suggestions Wrappers ---
  const addNewComplaintSuggestion = (cs: Omit<ComplaintSuggestion, 'id' | 'institutionId'>) => {
    dbService.addComplaintSuggestion({ ...cs, institutionId: activeInstitution.id });
    refreshTenantData();
  };
  const updateComplaintSuggestion = (cs: ComplaintSuggestion) => {
    dbService.updateComplaintSuggestion(cs, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Internal Audits Wrappers ---
  const addNewInternalAudit = (ia: Omit<InternalAudit, 'id' | 'institutionId'>) => {
    dbService.addInternalAudit({ ...ia, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updateInternalAudit = (ia: InternalAudit) => {
    dbService.updateInternalAudit(ia, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Risk Register Wrappers ---
  const addNewRiskItem = (rk: Omit<RiskItem, 'id' | 'institutionId'>) => {
    dbService.addRiskItem({ ...rk, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updateRiskItem = (rk: RiskItem) => {
    dbService.updateRiskItem(rk, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const deleteRiskItem = (rkId: string) => {
    dbService.deleteRiskItem(rkId, activeInstitution.id, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- CAPA Items Wrappers ---
  const addNewCapaItem = (cp: Omit<CapaItem, 'id' | 'institutionId'>) => {
    dbService.addCapaItem({ ...cp, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updateCapaItem = (cp: CapaItem) => {
    dbService.updateCapaItem(cp, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Document Items Wrappers ---
  const addNewDocumentItem = (doc: Omit<DocumentItem, 'id' | 'institutionId'>) => {
    dbService.addDocumentItem({ ...doc, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updateDocumentItem = (doc: DocumentItem) => {
    dbService.updateDocumentItem(doc, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Announcements Wrappers ---
  const addNewAnnouncement = (an: Omit<Announcement, 'id' | 'institutionId'>) => {
    dbService.addAnnouncement({ ...an, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Calendar Events Wrappers ---
  const addNewCalendarEvent = (cal: Omit<CalendarEvent, 'id' | 'institutionId'>) => {
    dbService.addCalendarEvent({ ...cal, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // --- Evaluation Questions Wrappers ---
  const addNewEvaluationQuestion = (eq: Omit<EvaluationQuestion, 'id' | 'institutionId'>) => {
    dbService.addEvaluationQuestion({ ...eq, institutionId: activeInstitution.id }, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const updateEvaluationQuestion = (eq: EvaluationQuestion) => {
    dbService.updateEvaluationQuestion(eq, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };
  const deleteEvaluationQuestion = (eqId: string) => {
    dbService.deleteEvaluationQuestion(eqId, activeInstitution.id, currentUser.id, currentUser.name, actingRole);
    refreshTenantData();
  };

  // 6. Translation Context Helper
  const t = (key: keyof typeof TRANSLATIONS['en']): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || String(key);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        resolvedTheme,
        
        activeInstitution,
        setActiveInstitution,
        institutions,
        addNewInstitution,
        updateInstitution,
        deleteInstitution,
        
        actingRole,
        setActingRole,
        currentUser,
        usersInInstitution,
        addNewUser,
        updateUser,
        deleteUser,
        isAuthenticated,
        login,
        logout,
        
        kpis,
        updateKPI,
        
        programs,
        addNewProgram,
        changeProgramStatus,
        
        courses,
        getCoursesForProgram,
        addNewCourse,
        changeCourseReview,
        
        reports,
        submitReport,
        
        actionPlans,
        addNewActionPlan,
        changeActionPlanStatus,
        
        tasks,
        addNewTask,
        changeTaskStatus,
        
        notifications,
        markNotificationsAsRead,
        
        auditLogs,
        resetAllData,

        // New SaaS Quality Bindings
        faculties,
        addNewFaculty,
        updateFaculty,
        deleteFaculty,
        departments,
        addNewDepartment,
        updateDepartment,
        deleteDepartment,
        students,
        addNewStudent,
        updateStudent,
        deleteStudent,
        lecturers,
        addNewLecturer,
        updateLecturer,
        deleteLecturer,
        qualityObjectives,
        addNewQualityObjective,
        updateQualityObjective,
        deleteQualityObjective,
        studentEvaluations,
        addNewStudentEvaluation,
        lecturerSelfEvaluations,
        addNewLecturerSelfEvaluation,
        peerReviews,
        addNewPeerReview,
        updatePeerReviewStatus,
        externalReviews,
        addNewExternalReview,
        accreditationStandards,
        addNewAccreditationStandard,
        updateAccreditationStandard,
        complaintsSuggestions,
        addNewComplaintSuggestion,
        updateComplaintSuggestion,
        internalAudits,
        addNewInternalAudit,
        updateInternalAudit,
        riskItems,
        addNewRiskItem,
        updateRiskItem,
        deleteRiskItem,
        capaItems,
        addNewCapaItem,
        updateCapaItem,
        documentItems,
        addNewDocumentItem,
        updateDocumentItem,
        announcements,
        addNewAnnouncement,
        calendarEvents,
        addNewCalendarEvent,

        evaluationQuestions,
        addNewEvaluationQuestion,
        updateEvaluationQuestion,
        deleteEvaluationQuestion,

        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
