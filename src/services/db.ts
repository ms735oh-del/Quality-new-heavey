/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
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

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Default Institutions
export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'oxford-global',
    institutionId: 'oxford-global',
    name: 'AURA Quality Institution',
    status: 'Active',
    arabicName: 'مؤسسة أورا لضمان الجودة الأكاديمية',
    logo: '🎓',
    domain: 'aura.quality.edu',
    primaryColor: '#0f172a', // slate-900
    secondaryColor: '#3b82f6', // blue-500
    studentCount: 18400,
    facultyCount: 1500,
    activePrograms: 24,
    accreditationStatus: 'Under Review',
    arabicAccreditationStatus: 'تحت المراجعة',
    subscriptionTier: 'Enterprise',
    subscriptionStatus: 'Active',
    subscriptionStartDate: '2026-01-01',
    subscriptionEndDate: '2027-01-01',
    maxUsers: 200,
    maxStudents: 30000,
    maxLecturers: 2500,
    storageLimitGB: 500,
    apiAccess: true,
    aiFeatures: true,
    reportsAccess: true,
    evaluationFeatures: true,
    logoCustomized: true,
    customDomain: 'quality.aura.edu'
  },
  {
    id: 'al-hikma',
    institutionId: 'al-hikma',
    name: 'Al-Hikma University',
    status: 'Active',
    arabicName: 'جامعة الحكمة',
    logo: '🏛️',
    domain: 'hikma.quality.edu',
    primaryColor: '#1e3a8a', // blue-900
    secondaryColor: '#10b981', // emerald-500
    studentCount: 12500,
    facultyCount: 800,
    activePrograms: 16,
    accreditationStatus: 'Accredited',
    arabicAccreditationStatus: 'معتمدة',
    subscriptionTier: 'Professional',
    subscriptionStatus: 'Active',
    subscriptionStartDate: '2026-02-15',
    subscriptionEndDate: '2027-02-15',
    maxUsers: 100,
    maxStudents: 15000,
    maxLecturers: 1000,
    storageLimitGB: 200,
    apiAccess: true,
    aiFeatures: true,
    reportsAccess: true,
    evaluationFeatures: true,
    logoCustomized: false,
    customSubdomain: 'hikma.platform.com'
  },
  {
    id: 'apex-tech',
    institutionId: 'apex-tech',
    name: 'Apex Technical Institute',
    status: 'Active',
    arabicName: 'معهد أبكس التقني',
    logo: '⚙️',
    domain: 'apex.quality.edu',
    primaryColor: '#4f46e5', // indigo-600
    secondaryColor: '#f59e0b', // amber-500
    studentCount: 2400,
    facultyCount: 180,
    activePrograms: 8,
    accreditationStatus: 'Conditional',
    arabicAccreditationStatus: 'اعتماد مشروط',
    subscriptionTier: 'Basic',
    subscriptionStatus: 'Active',
    subscriptionStartDate: '2026-05-01',
    subscriptionEndDate: '2026-11-01',
    maxUsers: 30,
    maxStudents: 5000,
    maxLecturers: 300,
    storageLimitGB: 50,
    apiAccess: false,
    aiFeatures: false,
    reportsAccess: true,
    evaluationFeatures: true,
    logoCustomized: false
  }
];

// Default Users (Preconfigured for roles test)
export const INITIAL_USERS: User[] = [
  {
    id: 'user-main-admin',
    uid: 'user-main-admin',
    institutionId: 'oxford-global',
    tenantId: 'oxford-global',
    name: 'System Director',
    arabicName: 'المدير العام للنظام',
    email: 'lztalaslamqadm@gmail.com',
    role: 'Platform Admin',
    avatar: '👑',
    department: 'Quality & System Management',
    arabicDepartment: 'إدارة النظام والجودة',
    active: true,
    permissions: ['all']
  }
];

// KPIs per Institution
const getInitialKPIs = (): KPI[] => [];

// Programs per Institution
const getInitialPrograms = (): Program[] => [];

// Courses per Program
const getInitialCourses = (): Course[] => [];

// Quality Self Study Reports
const getInitialReports = (): QualityReport[] => [];

// Action plans (accreditation recommendation and responses)
const getInitialActionPlans = (): ActionPlan[] => [];

// Operational Tasks
const getInitialTasks = (): Task[] => [];

// System Notifications
const getInitialNotifications = (): Notification[] => [];

// Initial Audit Logs
const getInitialAuditLogs = (): AuditLog[] => [];

function DrSarahPetersonEmail() {
  return 'lztalaslamqadm@gmail.com';
}

// --- NEW SEED GENERATORS FOR THE VAST METADATA CORE MODULES ---

const getInitialFaculties = (): Faculty[] => [];

const getInitialDepartments = (): Department[] => [];

const getInitialStudents = (): Student[] => [];

const getInitialLecturers = (): Lecturer[] => [];

const getInitialQualityObjectives = (): QualityObjective[] => [];

const getInitialStudentEvaluations = (): StudentEvaluation[] => [];

const getInitialLecturerSelfEvaluations = (): LecturerSelfEvaluation[] => [];

const getInitialPeerReviews = (): PeerReview[] => [];

const getInitialExternalReviews = (): ExternalReview[] => [];

const getInitialAccreditationStandards = (): AccreditationStandard[] => [];

const getInitialComplaintsSuggestions = (): ComplaintSuggestion[] => [];

const getInitialInternalAudits = (): InternalAudit[] => [];

const getInitialRiskItems = (): RiskItem[] => [];

const getInitialCapaItems = (): CapaItem[] => [];

const getInitialDocumentItems = (): DocumentItem[] => [];

const getInitialAnnouncements = (): Announcement[] => [];

const getInitialCalendarEvents = (): CalendarEvent[] => [];

const getInitialEvaluationQuestions = (instId: string = 'oxford-global'): EvaluationQuestion[] => {
  const types: EvaluationQuestion['evaluationType'][] = [
    'Student evaluates Lecturer',
    'Student evaluates Course',
    'Student evaluates Laboratory',
    'Student evaluates Training',
    'Lecturer Self Evaluation',
    'Peer Evaluation',
    'Department Evaluation',
    'External Review Evaluation'
  ];
  
  const qMap: Record<EvaluationQuestion['evaluationType'], { en: string; ar: string }[]> = {
    'Student evaluates Lecturer': [
      { en: 'The lecturer demonstrates deep knowledge of the subject matter', ar: 'يظهر المحاضر معرفة عميقة بالمادة العلمية' },
      { en: 'The lecturer is committed to lecture times and prompt organization', ar: 'يلتزم المحاضر بمواعيد المحاضرات والتنظيم الأكاديمي واللقاءات' },
      { en: 'The lecturer encourages critical thinking and active student participation', ar: 'يشجع المحاضر التفكير النقدي والمشاركة الطلابية الفعالة' },
      { en: 'The evaluation and grading criteria are transparent and fair', ar: 'معايير التقييم وتوزيع الدرجات واضحة وعادلة' }
    ],
    'Student evaluates Course': [
      { en: 'The course objectives were clear and met during the semester', ar: 'كانت أهداف المقرر واضحة وتم تحقيقها خلال الفصل الدراسي' },
      { en: 'The textbook and learning materials were helpful and up-to-date', ar: 'كان الكتاب المقرر والمواد التعليمية مفيدة ومحدثة' },
      { en: 'The course workload was appropriate for the credit hours', ar: 'كان حجم العمل المطلوب للمقرر مناسباً لعدد الساعات المعتمدة' }
    ],
    'Student evaluates Laboratory': [
      { en: 'The lab equipment and software was modern and fully functional', ar: 'أجهزة المعمل والبرمجيات كانت حديثة وتعمل بكفاءة كاملة' },
      { en: 'The practical experiments directly complemented the theoretical lectures', ar: 'التجارب العملية كانت مكملة بشكل مباشر للمحاضرات النظرية' },
      { en: 'Safety protocols and guidelines were clearly explained and enforced', ar: 'تم شرح وتطبيق إرشادات وبروتوكولات السلامة بوضوح' }
    ],
    'Student evaluates Training': [
      { en: 'The training institution provided a structured and beneficial program', ar: 'وفرت جهة التدريب برنامجاً تدريبياً منظماً ومفيداً' },
      { en: 'The field supervisor provided sufficient guidance and constructive feedback', ar: 'قدم المشرف الميداني التوجيه الكافي والملاحظات البناءة' },
      { en: 'The field training helped acquire new practical skills for my career', ar: 'ساعد التدريب الميداني في اكتساب مهارات عملية جديدة لمستقبلي المهني' }
    ],
    'Lecturer Self Evaluation': [
      { en: 'I effectively designed assessments that align with learning outcomes', ar: 'قمت بتصميم تقييمات تتماشى بفعالية مع مخرجات التعلم' },
      { en: 'I actively participated in professional development and research activities', ar: 'شاركت بفعالية في التطوير المهني والأنشطة البحثية' },
      { en: 'I contributed to university quality enhancement and community services', ar: 'ساهمت في تحسين جودة الجامعة والخدمات المجتمعية' }
    ],
    'Peer Evaluation': [
      { en: 'The colleague maintains an interactive and supportive learning environment', ar: 'يحافظ الزميل على بيئة تعليمية تفاعلية وداعمة' },
      { en: 'The course syllabus is comprehensive and aligned with department goals', ar: 'توصيف المقرر الدراسي شامل ومتوافق مع أهداف القسم' }
    ],
    'Department Evaluation': [
      { en: 'The department provides sufficient academic counseling for students', ar: 'يوفر القسم الإرشاد الأكاديمي الكافي للطلاب' },
      { en: 'Academic resources and labs are adequate for all courses', ar: 'المصادر الأكاديمية والمعامل كافية لجميع المقررات' }
    ],
    'External Review Evaluation': [
      { en: 'The academic programs are aligned with national qualification frameworks', ar: 'تتوافق البرامج الأكاديمية مع أطر المؤهلات الوطنية' },
      { en: 'The continuous improvement plans are evidence-based and effective', ar: 'خطط التحسين المستمر قائمة على الأدلة وفعالة' }
    ]
  };

  const list: EvaluationQuestion[] = [];
  let index = 1;
  types.forEach(t => {
    const questions = qMap[t] || [];
    questions.forEach((q, qIdx) => {
      list.push({
        id: `eq-${instId}-${index++}`,
        institutionId: instId,
        textEn: q.en,
        textAr: q.ar,
        evaluationType: t,
        isActive: true,
        order: qIdx + 1
      });
    });
  });

  return list;
};


// Database Engine Class with local persistence
class LocalDatabaseEngine {
  private institutions: Institution[] = [];
  private users: User[] = [];
  private kpis: KPI[] = [];
  private programs: Program[] = [];
  private courses: Course[] = [];
  private actionPlans: ActionPlan[] = [];
  private reports: QualityReport[] = [];
  private tasks: Task[] = [];
  private notifications: Notification[] = [];
  private auditLogs: AuditLog[] = [];
  
  // New Private Collections
  private faculties: Faculty[] = [];
  private departments: Department[] = [];
  private students: Student[] = [];
  private lecturers: Lecturer[] = [];
  private qualityObjectives: QualityObjective[] = [];
  private studentEvaluations: StudentEvaluation[] = [];
  private lecturerSelfEvaluations: LecturerSelfEvaluation[] = [];
  private peerReviews: PeerReview[] = [];
  private externalReviews: ExternalReview[] = [];
  private accreditationStandards: AccreditationStandard[] = [];
  private complaintsSuggestions: ComplaintSuggestion[] = [];
  private internalAudits: InternalAudit[] = [];
  private riskItems: RiskItem[] = [];
  private capaItems: CapaItem[] = [];
  private documentItems: DocumentItem[] = [];
  private announcements: Announcement[] = [];
  private calendarEvents: CalendarEvent[] = [];
  private evaluationQuestions: EvaluationQuestion[] = [];

  constructor() {
    this.loadAll();
  }

  private loadAll() {
    try {
      this.institutions = this.getOrInit('inst_data', INITIAL_INSTITUTIONS);
      this.users = this.getOrInit('user_data', INITIAL_USERS);
      this.kpis = this.getOrInit('kpi_data', getInitialKPIs());
      this.programs = this.getOrInit('program_data', getInitialPrograms());
      this.courses = this.getOrInit('course_data', getInitialCourses());
      this.actionPlans = this.getOrInit('actionplan_data', getInitialActionPlans());
      this.reports = this.getOrInit('report_data', getInitialReports());
      this.tasks = this.getOrInit('task_data', getInitialTasks());
      this.notifications = this.getOrInit('notification_data', getInitialNotifications());
      this.auditLogs = this.getOrInit('audit_data', getInitialAuditLogs());
      
      // Load New Collections
      this.faculties = this.getOrInit('faculty_data', getInitialFaculties());
      this.departments = this.getOrInit('dept_data', getInitialDepartments());
      this.students = this.getOrInit('student_data', getInitialStudents());
      this.lecturers = this.getOrInit('lecturer_data', getInitialLecturers());
      this.qualityObjectives = this.getOrInit('qual_obj_data', getInitialQualityObjectives());
      this.studentEvaluations = this.getOrInit('student_eval_data', getInitialStudentEvaluations());
      this.lecturerSelfEvaluations = this.getOrInit('lecturer_self_data', getInitialLecturerSelfEvaluations());
      this.peerReviews = this.getOrInit('peer_review_data', getInitialPeerReviews());
      this.externalReviews = this.getOrInit('external_review_data', getInitialExternalReviews());
      this.accreditationStandards = this.getOrInit('accred_std_data', getInitialAccreditationStandards());
      this.complaintsSuggestions = this.getOrInit('complaint_data', getInitialComplaintsSuggestions());
      this.internalAudits = this.getOrInit('internal_audit_data', getInitialInternalAudits());
      this.riskItems = this.getOrInit('risk_data', getInitialRiskItems());
      this.capaItems = this.getOrInit('capa_data', getInitialCapaItems());
      this.documentItems = this.getOrInit('doc_data', getInitialDocumentItems());
      this.announcements = this.getOrInit('announcement_data', getInitialAnnouncements());
      this.calendarEvents = this.getOrInit('calendar_event_data', getInitialCalendarEvents());
      this.evaluationQuestions = this.getOrInit('eval_question_data', getInitialEvaluationQuestions());

      // Ensure all institutions have institutionId and status
      let instsChanged = false;
      this.institutions = this.institutions.map(inst => {
        let updated = false;
        if (!inst.institutionId) {
          inst.institutionId = inst.id;
          updated = true;
        }
        if (!inst.status) {
          inst.status = inst.subscriptionStatus || 'Active';
          updated = true;
        }
        if (updated) instsChanged = true;
        return inst;
      });
      if (instsChanged) {
        this.save('inst_data', this.institutions);
      }

      // Ensure all users have uid, tenantId, and permissions
      let usersChanged = false;
      this.users = this.users.map(u => {
        let updated = false;
        const raw = u as any;
        const uid = raw.uid || raw.id || 'user-' + generateId();
        const tenantId = raw.tenantId || raw.institutionId || 'oxford-global';
        const permissions = raw.permissions || (raw.role === 'Platform Admin' || raw.role === 'Super Admin'
          ? ['all']
          : raw.role === 'Institution Admin'
            ? ['read', 'write', 'admin']
            : ['read']);

        if (raw.uid !== uid || raw.tenantId !== tenantId || !raw.permissions) {
          updated = true;
        }

        const updatedUser: User = {
          ...u,
          uid,
          tenantId,
          permissions
        };

        if (updated) usersChanged = true;
        return updatedUser;
      });
      if (usersChanged) {
        this.save('user_data', this.users);
      }
    } catch (e) {
      console.error('Failed to load storage state. Defaulting to initial', e);
    }
  }

  private getOrInit<T>(key: string, defaultVal: T): T {
    const data = localStorage.getItem(`saas_quality_${key}`);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(defaultVal) && !Array.isArray(parsed)) {
          localStorage.setItem(`saas_quality_${key}`, JSON.stringify(defaultVal));
          return defaultVal;
        }
        if (parsed === null || parsed === undefined) {
          localStorage.setItem(`saas_quality_${key}`, JSON.stringify(defaultVal));
          return defaultVal;
        }
        return parsed;
      } catch (e) {
        console.error(`Failed to parse localStorage key saas_quality_${key}:`, e);
        localStorage.setItem(`saas_quality_${key}`, JSON.stringify(defaultVal));
        return defaultVal;
      }
    }
    localStorage.setItem(`saas_quality_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }

  private save(key: string, data: any) {
    localStorage.setItem(`saas_quality_${key}`, JSON.stringify(data));
  }

  private writeAuditLog(institutionId: string, userId: string, userName: string, role: UserRole, action: string, arabicAction: string, details: string, arabicDetails: string, type: 'Security' | 'Data Change' | 'Auth' | 'System') {
    const newLog: AuditLog = {
      id: 'log-' + generateId(),
      institutionId,
      userId,
      userName,
      userRole: role,
      action,
      arabicAction,
      details,
      arabicDetails,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1 (Isolated UI Client)',
      type
    };
    this.auditLogs.unshift(newLog);
    this.save('audit_data', this.auditLogs);
  }

  // --- Institutions ---
  getInstitutions(): Institution[] {
    return this.institutions;
  }

  addInstitution(inst: Omit<Institution, 'id'>, userId: string, userName: string): Institution {
    const instId = 'inst-' + generateId();
    const newInst: Institution = { 
      ...inst, 
      id: instId,
      institutionId: instId,
      status: inst.subscriptionStatus || 'Active'
    };
    this.institutions.push(newInst);
    this.save('inst_data', this.institutions);

    // 1. Generate Secure Admin Account
    const adminEmail = `admin@${newInst.domain || 'aura.quality.edu'}`;
    const adminUserId = 'user-' + generateId();
    const newAdmin: User = {
      id: adminUserId,
      uid: adminUserId,
      institutionId: newInst.id,
      tenantId: newInst.id,
      name: `Admin of ${newInst.name}`,
      arabicName: `مدير جودة ${newInst.arabicName || newInst.name}`,
      email: adminEmail,
      role: 'Institution Admin',
      avatar: '🛡️',
      department: 'Quality & Evaluation Department',
      arabicDepartment: 'عمادة الجودة والتطوير الأكاديمي',
      active: true,
      permissions: ['read', 'write', 'admin']
    };
    this.users.push(newAdmin);
    this.save('user_data', this.users);
    this.setPassword(adminEmail, 'Aura@2026');

    // 2. Generate Default Database Structure: Faculties & Departments
    const facId = 'fac-' + generateId();
    const newFaculty: Faculty = {
      id: facId,
      institutionId: newInst.id,
      name: 'Faculty of Computer Science & IT',
      arabicName: 'كلية علوم الحاسب وتقنية المعلومات',
      code: 'FCIT',
      description: 'Pre-seeded core workspace for information technology & software systems.',
      arabicDescription: 'مساحة العمل الأساسية لتقنية المعلومات ونظم البرمجيات.',
      dean: 'Prof. Alan Turing',
      arabicDean: 'أ.د. آلان تورينج',
      departmentsCount: 1,
      programsCount: 1
    };
    this.faculties.push(newFaculty);
    this.save('faculty_data', this.faculties);

    const deptId = 'dept-' + generateId();
    const newDept: Department = {
      id: deptId,
      institutionId: newInst.id,
      facultyId: facId,
      name: 'Department of Software Engineering',
      arabicName: 'قسم هندسة البرمجيات',
      head: 'Dr. Grace Hopper',
      arabicHead: 'د. غريس هوبر',
      programsCount: 1,
      lecturersCount: 5,
      studentsCount: 120
    };
    this.departments.push(newDept);
    this.save('dept_data', this.departments);

    // 3. Seed Default Academic Program & Courses
    const progId = 'prog-' + generateId();
    const newProg: Program = {
      id: progId,
      institutionId: newInst.id,
      name: 'B.Sc. Software Engineering',
      arabicName: 'بكالوريوس هندسة البرمجيات',
      code: 'BSSE',
      department: newDept.name,
      arabicDepartment: newDept.arabicName,
      coordinatorId: newAdmin.id,
      status: 'Self Study',
      arabicStatus: 'دراسة ذاتية',
      selfStudyScore: 78,
      complianceRate: 92
    };
    this.programs.push(newProg);
    this.save('program_data', this.programs);

    const defaultCourses: Course[] = [
      {
        id: 'course-' + generateId(),
        programId: progId,
        name: 'Introduction to Programming',
        arabicName: 'مقدمة في البرمجة',
        code: 'CS101',
        creditHours: 3,
        syllabusApproved: true,
        reviewStatus: 'Approved',
        arabicReviewStatus: 'معتمد',
        complianceScore: 95,
        lecturerName: 'Dr. Grace Hopper'
      },
      {
        id: 'course-' + generateId(),
        programId: progId,
        name: 'Software Architecture & Patterns',
        arabicName: 'بنية وأنماط البرمجيات',
        code: 'SE301',
        creditHours: 4,
        syllabusApproved: false,
        reviewStatus: 'Pending Review',
        arabicReviewStatus: 'قيد المراجعة',
        complianceScore: 84,
        lecturerName: 'Dr. Richard Helm'
      }
    ];
    this.courses.push(...defaultCourses);
    this.save('course_data', this.courses);

    // 4. Seed Standard KPIs
    const defaultKPIs: KPI[] = [
      {
        id: 'kpi-' + generateId(),
        institutionId: newInst.id,
        name: 'Syllabus Integration & Compliance',
        arabicName: 'معدل توافق ومواءمة خطط المقررات الأكاديمية',
        category: 'Academics',
        arabicCategory: 'الشؤون الأكاديمية',
        value: 92,
        target: 95,
        unit: '%',
        history: [{ date: 'Jan', value: 88 }, { date: 'Feb', value: 90 }, { date: 'Mar', value: 92 }]
      },
      {
        id: 'kpi-' + generateId(),
        institutionId: newInst.id,
        name: 'Student Course Evaluation Rating',
        arabicName: 'مؤشر تقييم الطلاب للمساقات الدراسية',
        category: 'Student Life',
        arabicCategory: 'شؤون الطلاب',
        value: 4.2,
        target: 4.5,
        unit: '/ 5',
        history: [{ date: 'Jan', value: 4.0 }, { date: 'Feb', value: 4.1 }, { date: 'Mar', value: 4.2 }]
      }
    ];
    this.kpis.push(...defaultKPIs);
    this.save('kpi_data', this.kpis);

    // 5. Seed Core Accreditation Standards
    const defaultAccreditation: AccreditationStandard[] = [
      {
        id: 'std-' + generateId(),
        institutionId: newInst.id,
        code: 'STD-1',
        title: 'Mission, Goals, and Strategic Planning',
        arabicTitle: 'الرسالة والأهداف والتخطيط الاستراتيجي',
        compliancePercentage: 85,
        gapAnalysis: 'Need to communicate the new Strategic Quality Plan to all stakeholders.',
        improvementPlan: 'Run direct outreach workshops for department boards and student representatives.',
        progressTracking: 60
      },
      {
        id: 'std-' + generateId(),
        institutionId: newInst.id,
        code: 'STD-3',
        title: 'Teaching and Learning Quality Assurance',
        arabicTitle: 'إدارة ضمان جودة التعليم والتعلم',
        compliancePercentage: 90,
        gapAnalysis: 'Syllabus templates need to be digitized and synchronized automatically.',
        improvementPlan: 'Enforce Course Portfolio approvals inside the unified AURA platform.',
        progressTracking: 75
      }
    ];
    this.accreditationStandards.push(...defaultAccreditation);
    this.save('accred_std_data', this.accreditationStandards);

    // 6. Write Auditing Trace
    this.writeAuditLog(
      newInst.id, 
      userId, 
      userName, 
      'Platform Admin', 
      'Deploy New Tenant Workspace', 
      'نشر بيئة مستأجر جديدة', 
      `Institution "${newInst.name}" was successfully created, secure administrator was registered: ${adminEmail} (Default Password: Aura@2026), and quality metadata was pre-seeded.`, 
      `تم إنشاء المؤسسة "${newInst.name}" بنجاح، وتسجيل حساب المدير الآمن: ${adminEmail} (كلمة المرور الافتراضية: Aura@2026)، وتجهيز هيكل الجودة الأكاديمية افتراضياً.`, 
      'System'
    );

    return newInst;
  }

  updateInstitution(inst: Institution, userId: string, userName: string): void {
    this.institutions = this.institutions.map(i => i.id === inst.id ? inst : i);
    this.save('inst_data', this.institutions);
    this.writeAuditLog(inst.id, userId, userName, 'Institution Admin', 'Updated Institution Details', 'تحديث بيانات المؤسسة', `Updated details for ${inst.name}.`, `تم تحديث بيانات المؤسسة ${inst.name}.`, 'Data Change');
  }

  deleteInstitution(id: string, userId: string, userName: string): void {
    const instToDelete = this.institutions.find(i => i.id === id);
    if (instToDelete) {
      this.institutions = this.institutions.filter(i => i.id !== id);
      this.save('inst_data', this.institutions);
      
      // Permanently isolate and destroy all related tenant datasets to ensure no orphaned resources
      this.users = this.users.filter(u => u.institutionId !== id);
      this.save('user_data', this.users);

      this.kpis = this.kpis.filter(k => k.institutionId !== id);
      this.save('kpi_data', this.kpis);

      this.programs = this.programs.filter(p => p.institutionId !== id);
      this.save('program_data', this.programs);

      this.faculties = this.faculties.filter(f => f.institutionId !== id);
      this.save('faculty_data', this.faculties);

      this.departments = this.departments.filter(d => d.institutionId !== id);
      this.save('dept_data', this.departments);

      this.writeAuditLog(
        id, 
        userId, 
        userName, 
        'Platform Admin', 
        'Destroy Tenant Data', 
        'إتلاف بيانات المستأجر', 
        `All isolated data storage blocks and system logs for "${instToDelete.name}" have been permanently scrubbed.`, 
        `تم مسح وإتلاف جميع حاويات البيانات والملفات والمسجلات المعزولة الخاصة بالمؤسسة "${instToDelete.name}" نهائياً.`, 
        'System'
      );
    }
  }

  // --- Users ---
  getUsers(institutionId: string): User[] {
    // Isolated per institution
    return this.users.filter(u => u.institutionId === institutionId);
  }

  addUser(user: Omit<User, 'id' | 'uid' | 'tenantId' | 'permissions'> & Partial<Pick<User, 'uid' | 'tenantId' | 'permissions'>>, triggerUserId: string, triggerUserName: string, role: UserRole): User {
    const newId = 'user-' + generateId();
    const newUser: User = { 
      ...user, 
      id: newId,
      uid: user.uid || newId,
      tenantId: user.tenantId || user.institutionId,
      permissions: user.permissions || (
        user.role === 'Platform Admin' || user.role === 'Super Admin'
          ? ['all']
          : user.role === 'Institution Admin'
            ? ['read', 'write', 'admin']
            : ['read']
      )
    };
    this.users.push(newUser);
    this.save('user_data', this.users);
    this.writeAuditLog(user.institutionId, triggerUserId, triggerUserName, role, 'Registered User', 'تم تسجيل مستخدم جديد', `Added ${newUser.name} as ${newUser.role} in department ${newUser.department}.`, `تمت إضافة ${newUser.name} كـ ${newUser.role} في قسم ${newUser.department}.`, 'Security');
    return newUser;
  }

  updateUser(user: User, triggerUserId: string, triggerUserName: string, role: UserRole): void {
    this.users = this.users.map(u => u.id === user.id ? user : u);
    this.save('user_data', this.users);
    this.writeAuditLog(user.institutionId, triggerUserId, triggerUserName, role, 'Updated User Details', 'تحديث بيانات المستخدم', `Updated details and role for ${user.name} (${user.role}).`, `تم تحديث تفاصيل ودور ${user.name} (${user.role}).`, 'Security');
  }

  deleteUser(userId: string, triggerUserId: string, triggerUserName: string, role: UserRole, institutionId: string): void {
    const userToDelete = this.users.find(u => u.id === userId);
    if (userToDelete) {
      this.users = this.users.filter(u => u.id !== userId);
      this.save('user_data', this.users);
      this.writeAuditLog(institutionId, triggerUserId, triggerUserName, role, 'Deleted User', 'تم حذف مستخدم', `Deleted user ${userToDelete.name} (${userToDelete.email}).`, `تم حذف المستخدم ${userToDelete.name} (${userToDelete.email}).`, 'Security');
    }
  }

  getPassword(email: string): string {
    const passwords = JSON.parse(localStorage.getItem('saas_quality_user_passwords') || '{}');
    return passwords[email.toLowerCase().trim()] || '123456'; // Default password for pre-seeded users
  }

  setPassword(email: string, pass: string): void {
    const passwords = JSON.parse(localStorage.getItem('saas_quality_user_passwords') || '{}');
    passwords[email.toLowerCase().trim()] = pass;
    localStorage.setItem('saas_quality_user_passwords', JSON.stringify(passwords));
  }

  // --- KPIs ---
  getKPIs(institutionId: string): KPI[] {
    return this.kpis.filter(k => k.institutionId === institutionId);
  }

  updateKPIValue(kpiId: string, newValue: number, userId: string, userName: string, role: UserRole): void {
    this.kpis = this.kpis.map(k => {
      if (k.id === kpiId) {
        const updatedHistory = [...k.history];
        if (updatedHistory.length >= 6) {
          updatedHistory.shift();
        }
        updatedHistory.push({
          date: new Date().toLocaleDateString('en-US', { month: 'short' }),
          value: newValue
        });

        this.writeAuditLog(
          k.institutionId,
          userId,
          userName,
          role,
          `KPI Value Updated: ${k.name}`,
          `تحديث مؤشر الأداء: ${k.arabicName}`,
          `Changed value from ${k.value} to ${newValue} ${k.unit}`,
          `تم تغيير القيمة من ${k.value} إلى ${newValue} ${k.unit}`,
          'Data Change'
        );

        return { ...k, value: newValue, history: updatedHistory };
      }
      return k;
    });
    this.save('kpi_data', this.kpis);
  }

  // --- Programs ---
  getPrograms(institutionId: string): Program[] {
    return this.programs.filter(p => p.institutionId === institutionId);
  }

  addProgram(program: Omit<Program, 'id'>, userId: string, userName: string, role: UserRole): Program {
    const newProg: Program = { ...program, id: 'prog-' + generateId() };
    this.programs.push(newProg);
    this.save('program_data', this.programs);
    this.writeAuditLog(program.institutionId, userId, userName, role, 'Added Academic Program', 'تم إضافة برنامج أكاديمي', `Created program ${newProg.name} (${newProg.code}).`, `تم إنشاء برنامج ${newProg.name} (${newProg.code}).`, 'Data Change');
    return newProg;
  }

  updateProgramStatus(programId: string, status: Program['status'], arabicStatus: string, userId: string, userName: string, role: UserRole): void {
    this.programs = this.programs.map(p => {
      if (p.id === programId) {
        this.writeAuditLog(p.institutionId, userId, userName, role, 'Updated Program Status', 'تحديث حالة البرنامج', `Changed ${p.name} status from ${p.status} to ${status}.`, `تم تغيير حالة ${p.name} من ${p.status} إلى ${status}.`, 'Data Change');
        return { ...p, status, arabicStatus };
      }
      return p;
    });
    this.save('program_data', this.programs);
  }

  // --- Courses ---
  getCourses(programId: string): Course[] {
    return this.courses.filter(c => c.programId === programId);
  }

  getAllCourses(institutionId: string): Course[] {
    const progs = this.getPrograms(institutionId);
    const progIds = progs.map(p => p.id);
    return this.courses.filter(c => progIds.includes(c.programId));
  }

  addCourse(course: Omit<Course, 'id'>, userId: string, userName: string, role: UserRole, institutionId: string): Course {
    const newCourse: Course = { ...course, id: 'course-' + generateId() };
    this.courses.push(newCourse);
    this.save('course_data', this.courses);
    this.writeAuditLog(institutionId, userId, userName, role, 'Created Course Module', 'تم إنشاء مادة دراسية جديدة', `Added course ${newCourse.name} (${newCourse.code}) to program.`, `تم إضافة مادة ${newCourse.name} (${newCourse.code}) إلى البرنامج.`, 'Data Change');
    return newCourse;
  }

  updateCourseReview(courseId: string, status: Course['reviewStatus'], arabicStatus: string, score: number, userId: string, userName: string, role: UserRole, institutionId: string): void {
    this.courses = this.courses.map(c => {
      if (c.id === courseId) {
        this.writeAuditLog(institutionId, userId, userName, role, 'Approved Course Syllabus', 'تم اعتماد ملف المقرر', `Reviewed course ${c.name}, setting compliance score to ${score} and status to ${status}.`, `تمت مراجعة مادة ${c.name}، وتعيين درجة الامتثال ${score} والحالة إلى ${status}.`, 'Data Change');
        return { ...c, reviewStatus: status, arabicReviewStatus: arabicStatus, complianceScore: score, syllabusApproved: status === 'Approved' };
      }
      return c;
    });
    this.save('course_data', this.courses);
  }

  // --- Quality Reports ---
  getReports(institutionId: string): QualityReport[] {
    return this.reports.filter(r => r.institutionId === institutionId);
  }

  saveReport(report: QualityReport, userId: string, userName: string, role: UserRole): void {
    const exists = this.reports.some(r => r.id === report.id);
    if (exists) {
      this.reports = this.reports.map(r => r.id === report.id ? report : r);
      this.writeAuditLog(report.institutionId, userId, userName, role, 'Saved Quality Self-Evaluation', 'حفظ التقييم الذاتي للجودة', `Updated Self-Evaluation ${report.title} sections.`, `تم تحديث أقسام التقييم الذاتي لـ ${report.title}.`, 'Data Change');
    } else {
      this.reports.push(report);
      this.writeAuditLog(report.institutionId, userId, userName, role, 'Created Quality Self-Evaluation', 'إنشاء التقييم الذاتي للجودة', `Created new quality dossier ${report.title}.`, `تم إنشاء ملف جودة جديد باسم ${report.title}.`, 'Data Change');
    }
    this.save('report_data', this.reports);
  }

  // --- Action Plans ---
  getActionPlans(institutionId: string): ActionPlan[] {
    return this.actionPlans.filter(a => a.institutionId === institutionId);
  }

  addActionPlan(ap: Omit<ActionPlan, 'id'>, userId: string, userName: string, role: UserRole): ActionPlan {
    const newAp: ActionPlan = { ...ap, id: 'ap-' + generateId() };
    this.actionPlans.push(newAp);
    this.save('actionplan_data', this.actionPlans);
    this.writeAuditLog(ap.institutionId, userId, userName, role, 'Created Strategic Action Recommendation', 'إنشاء توصية خطة عمل استراتيجية', `Created action plan for accreditation recommendation: ${newAp.title}.`, `تم إنشاء خطة عمل لتوصية الاعتماد: ${newAp.title}.`, 'Data Change');
    return newAp;
  }

  updateActionPlanStatus(apId: string, status: ActionPlan['status'], arabicStatus: string, userId: string, userName: string, role: UserRole): void {
    this.actionPlans = this.actionPlans.map(a => {
      if (a.id === apId) {
        this.writeAuditLog(a.institutionId, userId, userName, role, 'Updated Action Plan Status', 'تحديث حالة خطة العمل', `Changed status of action plan ${a.title} to ${status}.`, `تم تغيير حالة خطة العمل ${a.title} إلى ${status}.`, 'Data Change');
        return { ...a, status, arabicStatus };
      }
      return a;
    });
    this.save('actionplan_data', this.actionPlans);
  }

  // --- Operational Tasks ---
  getTasks(institutionId: string): Task[] {
    return this.tasks.filter(t => t.institutionId === institutionId);
  }

  addTask(task: Omit<Task, 'id'>, userId: string, userName: string, role: UserRole): Task {
    const newTask: Task = { ...task, id: 'task-' + generateId() };
    this.tasks.push(newTask);
    this.save('task_data', this.tasks);
    this.writeAuditLog(task.institutionId, userId, userName, role, 'Assigned Compliance Task', 'تم تعيين مهمة امتثال جديدة', `Assigned task "${newTask.title}" to role "${newTask.assigneeRole}".`, `تم تعيين المهمة "${newTask.title}" للدور "${newTask.assigneeRole}".`, 'Data Change');
    return newTask;
  }

  updateTaskStatus(taskId: string, status: Task['status'], arabicStatus: string, userId: string, userName: string, role: UserRole): void {
    this.tasks = this.tasks.map(t => {
      if (t.id === taskId) {
        this.writeAuditLog(t.institutionId, userId, userName, role, 'Completed Compliance Task', 'إكمال مهمة امتثال', `Updated task "${t.title}" status to "${status}".`, `تم تحديث حالة المهمة "${t.title}" إلى "${status}".`, 'Data Change');
        return { ...t, status, arabicStatus };
      }
      return t;
    });
    this.save('task_data', this.tasks);
  }

  // --- Notifications ---
  getNotifications(): Notification[] {
    return this.notifications;
  }

  markAllNotificationsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.save('notification_data', this.notifications);
  }

  addNotification(notif: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotif: Notification = {
      ...notif,
      id: 'notif-' + generateId(),
      timestamp: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(newNotif);
    this.save('notification_data', this.notifications);
    return newNotif;
  }

  // --- Audit Logs ---
  getAuditLogs(institutionId: string): AuditLog[] {
    return this.auditLogs.filter(l => l.institutionId === institutionId);
  }

  // --- Faculties ---
  getFaculties(institutionId: string): Faculty[] {
    return this.faculties.filter(f => f.institutionId === institutionId);
  }
  addFaculty(fac: Omit<Faculty, 'id'>, userId: string, userName: string, role: UserRole): Faculty {
    const fresh: Faculty = { ...fac, id: 'fac-' + generateId() };
    this.faculties.push(fresh);
    this.save('faculty_data', this.faculties);
    this.writeAuditLog(fac.institutionId, userId, userName, role, 'Added Faculty', 'تم إضافة كلية جديدة', `Created faculty ${fresh.name}.`, `تم إنشاء الكلية ${fresh.name}.`, 'Data Change');
    return fresh;
  }
  updateFaculty(fac: Faculty, userId: string, userName: string, role: UserRole): void {
    this.faculties = this.faculties.map(f => f.id === fac.id ? fac : f);
    this.save('faculty_data', this.faculties);
    this.writeAuditLog(fac.institutionId, userId, userName, role, 'Updated Faculty', 'تحديث بيانات الكلية', `Updated faculty ${fac.name}.`, `تم تحديث الكلية ${fac.name}.`, 'Data Change');
  }
  deleteFaculty(facId: string, instId: string, userId: string, userName: string, role: UserRole): void {
    this.faculties = this.faculties.filter(f => f.id !== facId);
    this.save('faculty_data', this.faculties);
    this.writeAuditLog(instId, userId, userName, role, 'Deleted Faculty', 'حذف كلية', `Removed faculty ID: ${facId}.`, `تم حذف الكلية ذات الرمز: ${facId}.`, 'Data Change');
  }

  // --- Departments ---
  getDepartments(institutionId: string): Department[] {
    return this.departments.filter(d => d.institutionId === institutionId);
  }
  addDepartment(dept: Omit<Department, 'id'>, userId: string, userName: string, role: UserRole): Department {
    const fresh: Department = { ...dept, id: 'dept-' + generateId() };
    this.departments.push(fresh);
    this.save('dept_data', this.departments);
    this.writeAuditLog(dept.institutionId, userId, userName, role, 'Added Department', 'تم إضافة قسم جديد', `Created department ${fresh.name}.`, `تم إنشاء قسم ${fresh.name}.`, 'Data Change');
    return fresh;
  }
  updateDepartment(dept: Department, userId: string, userName: string, role: UserRole): void {
    this.departments = this.departments.map(d => d.id === dept.id ? dept : d);
    this.save('dept_data', this.departments);
    this.writeAuditLog(dept.institutionId, userId, userName, role, 'Updated Department', 'تحديث بيانات القسم', `Updated department ${dept.name}.`, `تم تحديث القسم ${dept.name}.`, 'Data Change');
  }
  deleteDepartment(deptId: string, instId: string, userId: string, userName: string, role: UserRole): void {
    this.departments = this.departments.filter(d => d.id !== deptId);
    this.save('dept_data', this.departments);
    this.writeAuditLog(instId, userId, userName, role, 'Deleted Department', 'حذف قسم', `Removed department ID: ${deptId}.`, `تم حذف القسم ذو الرمز: ${deptId}.`, 'Data Change');
  }

  // --- Students ---
  getStudents(institutionId: string): Student[] {
    return this.students.filter(s => s.institutionId === institutionId);
  }
  addStudent(std: Omit<Student, 'id'>, userId: string, userName: string, role: UserRole): Student {
    const fresh: Student = { ...std, id: 'std-' + generateId() };
    this.students.push(fresh);
    this.save('student_data', this.students);
    this.writeAuditLog(std.institutionId, userId, userName, role, 'Registered Student', 'تم تسجيل طالب جديد', `Enrolled student ${fresh.fullName}.`, `تم قيد الطالب ${fresh.fullName}.`, 'Data Change');
    return fresh;
  }
  updateStudent(std: Student, userId: string, userName: string, role: UserRole): void {
    this.students = this.students.map(s => s.id === std.id ? std : s);
    this.save('student_data', this.students);
    this.writeAuditLog(std.institutionId, userId, userName, role, 'Updated Student Profile', 'تحديث ملف الطالب', `Updated profile of ${std.fullName}.`, `تم تحديث ملف الطالب ${std.fullName}.`, 'Data Change');
  }
  deleteStudent(stdId: string, instId: string, userId: string, userName: string, role: UserRole): void {
    this.students = this.students.filter(s => s.id !== stdId);
    this.save('student_data', this.students);
    this.writeAuditLog(instId, userId, userName, role, 'Deleted Student Profile', 'حذف ملف طالب', `Removed student ID: ${stdId}.`, `تم حذف الطالب ذو الرمز: ${stdId}.`, 'Data Change');
  }

  // --- Lecturers ---
  getLecturers(institutionId: string): Lecturer[] {
    return this.lecturers.filter(l => l.institutionId === institutionId);
  }
  addLecturer(lect: Omit<Lecturer, 'id'>, userId: string, userName: string, role: UserRole): Lecturer {
    const fresh: Lecturer = { ...lect, id: 'lect-' + generateId() };
    this.lecturers.push(fresh);
    this.save('lecturer_data', this.lecturers);
    this.writeAuditLog(lect.institutionId, userId, userName, role, 'Registered Lecturer', 'تم تسجيل عضو هيئة تدريس', `Added lecturer ${fresh.name}.`, `تمت إضافة المحاضر ${fresh.name}.`, 'Data Change');
    return fresh;
  }
  updateLecturer(lect: Lecturer, userId: string, userName: string, role: UserRole): void {
    this.lecturers = this.lecturers.map(l => l.id === lect.id ? lect : l);
    this.save('lecturer_data', this.lecturers);
    this.writeAuditLog(lect.institutionId, userId, userName, role, 'Updated Lecturer Profile', 'تحديث ملف المحاضر', `Updated profile of ${lect.name}.`, `تم تحديث ملف المحاضر ${lect.name}.`, 'Data Change');
  }
  deleteLecturer(lectId: string, instId: string, userId: string, userName: string, role: UserRole): void {
    this.lecturers = this.lecturers.filter(l => l.id !== lectId);
    this.save('lecturer_data', this.lecturers);
    this.writeAuditLog(instId, userId, userName, role, 'Deleted Lecturer Profile', 'حذف ملف محاضر', `Removed lecturer ID: ${lectId}.`, `تم حذف ملف المحاضر ذو الرمز: ${lectId}.`, 'Data Change');
  }

  // --- Quality Objectives ---
  getQualityObjectives(institutionId: string): QualityObjective[] {
    return this.qualityObjectives.filter(q => q.institutionId === institutionId);
  }
  addQualityObjective(qo: Omit<QualityObjective, 'id'>, userId: string, userName: string, role: UserRole): QualityObjective {
    const fresh: QualityObjective = { ...qo, id: 'qo-' + generateId() };
    this.qualityObjectives.push(fresh);
    this.save('qual_obj_data', this.qualityObjectives);
    this.writeAuditLog(qo.institutionId, userId, userName, role, 'Created Quality Objective', 'إنشاء هدف جودة', `Objective "${fresh.title}" registered.`, `تم تسجيل هدف الجودة "${fresh.title}".`, 'Data Change');
    return fresh;
  }
  updateQualityObjective(qo: QualityObjective, userId: string, userName: string, role: UserRole): void {
    this.qualityObjectives = this.qualityObjectives.map(q => q.id === qo.id ? qo : q);
    this.save('qual_obj_data', this.qualityObjectives);
    this.writeAuditLog(qo.institutionId, userId, userName, role, 'Updated Quality Objective', 'تحديث هدف الجودة', `Updated objective "${qo.title}".`, `تم تحديث هدف الجودة "${qo.title}".`, 'Data Change');
  }
  deleteQualityObjective(qoId: string, instId: string, userId: string, userName: string, role: UserRole): void {
    this.qualityObjectives = this.qualityObjectives.filter(q => q.id !== qoId);
    this.save('qual_obj_data', this.qualityObjectives);
    this.writeAuditLog(instId, userId, userName, role, 'Deleted Quality Objective', 'حذف هدف جودة', `Removed objective ID: ${qoId}.`, `تم حذف هدف الجودة ذو الرمز: ${qoId}.`, 'Data Change');
  }

  // --- Student Evaluations ---
  getStudentEvaluations(institutionId: string): StudentEvaluation[] {
    return this.studentEvaluations.filter(s => s.institutionId === institutionId);
  }
  addStudentEvaluation(se: Omit<StudentEvaluation, 'id'>): StudentEvaluation {
    const fresh: StudentEvaluation = { ...se, id: 'se-' + generateId() };
    this.studentEvaluations.push(fresh);
    this.save('student_eval_data', this.studentEvaluations);
    return fresh;
  }

  // --- Lecturer Self Evaluations ---
  getLecturerSelfEvaluations(institutionId: string): LecturerSelfEvaluation[] {
    return this.lecturerSelfEvaluations.filter(l => l.institutionId === institutionId);
  }
  addLecturerSelfEvaluation(lse: Omit<LecturerSelfEvaluation, 'id'>, userId: string, userName: string, role: UserRole): LecturerSelfEvaluation {
    const fresh: LecturerSelfEvaluation = { ...lse, id: 'lse-' + generateId() };
    this.lecturerSelfEvaluations.push(fresh);
    this.save('lecturer_self_data', this.lecturerSelfEvaluations);
    this.writeAuditLog(lse.institutionId, userId, userName, role, 'Submitted Self Evaluation', 'تقديم تقييم ذاتي للمحاضر', `Self evaluation submitted by ${lse.lecturerName}.`, `تم تقديم التقييم الذاتي من قبل ${lse.lecturerName}.`, 'Data Change');
    return fresh;
  }

  // --- Peer Reviews ---
  getPeerReviews(institutionId: string): PeerReview[] {
    return this.peerReviews.filter(p => p.institutionId === institutionId);
  }
  addPeerReview(pr: Omit<PeerReview, 'id'>, userId: string, userName: string, role: UserRole): PeerReview {
    const fresh: PeerReview = { ...pr, id: 'pr-' + generateId() };
    this.peerReviews.push(fresh);
    this.save('peer_review_data', this.peerReviews);
    this.writeAuditLog(pr.institutionId, userId, userName, role, 'Submitted Peer Review', 'تقديم تقييم الأقران', `Peer review created for ${pr.revieweeName}.`, `تم إنشاء تقييم الأقران للمحاضر ${pr.revieweeName}.`, 'Data Change');
    return fresh;
  }
  updatePeerReviewStatus(prId: string, status: PeerReview['status'], arabicStatus: string, instId: string, userId: string, userName: string, role: UserRole): void {
    this.peerReviews = this.peerReviews.map(p => p.id === prId ? { ...p, status, arabicStatus } : p);
    this.save('peer_review_data', this.peerReviews);
    this.writeAuditLog(instId, userId, userName, role, 'Approved Peer Review', 'اعتماد تقييم الأقران', `Review ID: ${prId} marked as ${status}.`, `تم وضع علامة على تقييم الأقران ${prId} كـ ${status}.`, 'Data Change');
  }

  // --- External Reviews ---
  getExternalReviews(institutionId: string): ExternalReview[] {
    return this.externalReviews.filter(e => e.institutionId === institutionId);
  }
  addExternalReview(er: Omit<ExternalReview, 'id'>, userId: string, userName: string, role: UserRole): ExternalReview {
    const fresh: ExternalReview = { ...er, id: 'er-' + generateId() };
    this.externalReviews.push(fresh);
    this.save('external_review_data', this.externalReviews);
    this.writeAuditLog(er.institutionId, userId, userName, role, 'Submitted External Review', 'تقديم تقرير التدقيق الخارجي', `External evaluation for ${er.targetName} recorded.`, `تم تسجيل التقييم الخارجي لـ ${er.targetName}.`, 'Data Change');
    return fresh;
  }

  // --- Accreditation Standards ---
  getAccreditationStandards(institutionId: string): AccreditationStandard[] {
    return this.accreditationStandards.filter(a => a.institutionId === institutionId);
  }
  addAccreditationStandard(as: Omit<AccreditationStandard, 'id'>, userId: string, userName: string, role: UserRole): AccreditationStandard {
    const fresh: AccreditationStandard = { ...as, id: 'as-' + generateId() };
    this.accreditationStandards.push(fresh);
    this.save('accred_std_data', this.accreditationStandards);
    this.writeAuditLog(as.institutionId, userId, userName, role, 'Added Accreditation Standard', 'إضافة معيار اعتماد', `Standard "${as.title}" created.`, `تم إنشاء المعيار "${as.title}".`, 'Data Change');
    return fresh;
  }
  updateAccreditationStandard(as: AccreditationStandard, userId: string, userName: string, role: UserRole): void {
    this.accreditationStandards = this.accreditationStandards.map(a => a.id === as.id ? as : a);
    this.save('accred_std_data', this.accreditationStandards);
    this.writeAuditLog(as.institutionId, userId, userName, role, 'Updated Accreditation Standard', 'تحديث معيار الاعتماد', `Standard "${as.title}" updated.`, `تم تحديث المعيار "${as.title}".`, 'Data Change');
  }

  // --- Complaints Suggestions ---
  getComplaintsSuggestions(institutionId: string): ComplaintSuggestion[] {
    return this.complaintsSuggestions.filter(c => c.institutionId === institutionId);
  }
  addComplaintSuggestion(cs: Omit<ComplaintSuggestion, 'id'>): ComplaintSuggestion {
    const fresh: ComplaintSuggestion = { ...cs, id: 'complaint-' + generateId() };
    this.complaintsSuggestions.push(fresh);
    this.save('complaint_data', this.complaintsSuggestions);
    return fresh;
  }
  updateComplaintSuggestion(cs: ComplaintSuggestion, userId: string, userName: string, role: UserRole): void {
    this.complaintsSuggestions = this.complaintsSuggestions.map(c => c.id === cs.id ? cs : c);
    this.save('complaint_data', this.complaintsSuggestions);
    this.writeAuditLog(cs.institutionId, userId, userName, role, 'Updated Complaint/Suggestion', 'تحديث الشكوى/المقترح', `Complaint ID: ${cs.id} status is now ${cs.status}.`, `تم تغيير حالة الشكوى ${cs.id} إلى ${cs.status}.`, 'Data Change');
  }

  // --- Internal Audits ---
  getInternalAudits(institutionId: string): InternalAudit[] {
    return this.internalAudits.filter(i => i.institutionId === institutionId);
  }
  addInternalAudit(ia: Omit<InternalAudit, 'id'>, userId: string, userName: string, role: UserRole): InternalAudit {
    const fresh: InternalAudit = { ...ia, id: 'audit-' + generateId() };
    this.internalAudits.push(fresh);
    this.save('internal_audit_data', this.internalAudits);
    this.writeAuditLog(ia.institutionId, userId, userName, role, 'Added Audit Plan', 'تم إضافة خطة تدقيق داخلي', `Audit "${fresh.planTitle}" logged.`, `تم تسجيل خطة التدقيق الداخلي "${fresh.planTitle}".`, 'Data Change');
    return fresh;
  }
  updateInternalAudit(ia: InternalAudit, userId: string, userName: string, role: UserRole): void {
    this.internalAudits = this.internalAudits.map(i => i.id === ia.id ? ia : i);
    this.save('internal_audit_data', this.internalAudits);
    this.writeAuditLog(ia.institutionId, userId, userName, role, 'Updated Audit Plan', 'تحديث خطة تدقيق داخلي', `Audit "${ia.planTitle}" updated status: ${ia.status}.`, `تم تحديث خطة التدقيق الداخلي "${ia.planTitle}" الحالة: ${ia.status}.`, 'Data Change');
  }

  // --- Risk Register ---
  getRiskItems(institutionId: string): RiskItem[] {
    return this.riskItems.filter(r => r.institutionId === institutionId);
  }
  addRiskItem(rk: Omit<RiskItem, 'id'>, userId: string, userName: string, role: UserRole): RiskItem {
    const fresh: RiskItem = { ...rk, id: 'rk-' + generateId() };
    this.riskItems.push(fresh);
    this.save('risk_data', this.riskItems);
    this.writeAuditLog(rk.institutionId, userId, userName, role, 'Logged Risk Issue', 'تسجيل خطر في السجل', `Risk "${fresh.title}" added with likelihood ${fresh.likelihood} & impact ${fresh.impact}.`, `تمت إضافة خطر "${fresh.title}" باحتمالية ${fresh.likelihood} وتأثير ${fresh.impact}.`, 'Data Change');
    return fresh;
  }
  updateRiskItem(rk: RiskItem, userId: string, userName: string, role: UserRole): void {
    this.riskItems = this.riskItems.map(r => r.id === rk.id ? rk : r);
    this.save('risk_data', this.riskItems);
    this.writeAuditLog(rk.institutionId, userId, userName, role, 'Updated Risk Record', 'تحديث سجل خطر', `Risk "${rk.title}" set status to ${rk.status}.`, `تم تغيير حالة الخطر "${rk.title}" إلى ${rk.status}.`, 'Data Change');
  }
  deleteRiskItem(rkId: string, instId: string, userId: string, userName: string, role: UserRole): void {
    this.riskItems = this.riskItems.filter(r => r.id !== rkId);
    this.save('risk_data', this.riskItems);
    this.writeAuditLog(instId, userId, userName, role, 'Deleted Risk Item', 'حذف خطر', `Removed risk ID: ${rkId}.`, `تم حذف خطر ذو الرمز: ${rkId}.`, 'Data Change');
  }

  // --- CAPA Items ---
  getCapaItems(institutionId: string): CapaItem[] {
    return this.capaItems.filter(c => c.institutionId === institutionId);
  }
  addCapaItem(cp: Omit<CapaItem, 'id'>, userId: string, userName: string, role: UserRole): CapaItem {
    const fresh: CapaItem = { ...cp, id: 'cp-' + generateId() };
    this.capaItems.push(fresh);
    this.save('capa_data', this.capaItems);
    this.writeAuditLog(cp.institutionId, userId, userName, role, 'Added CAPA Action', 'إضافة إجراء تصحيحي/وقائي', `CAPA plan "${fresh.title}" created.`, `تم إنشاء خطة الإجراءات "${fresh.title}".`, 'Data Change');
    return fresh;
  }
  updateCapaItem(cp: CapaItem, userId: string, userName: string, role: UserRole): void {
    this.capaItems = this.capaItems.map(c => c.id === cp.id ? cp : c);
    this.save('capa_data', this.capaItems);
    this.writeAuditLog(cp.institutionId, userId, userName, role, 'Updated CAPA Progress', 'تحديث إجراء تصحيحي/وقائي', `CAPA "${cp.title}" progress set to ${cp.progress}%.`, `تم تعيين تقدم خطة الإجراءات "${cp.title}" إلى ${cp.progress}%.`, 'Data Change');
  }

  // --- Document Items ---
  getDocumentItems(institutionId: string): DocumentItem[] {
    return this.documentItems.filter(d => d.institutionId === institutionId);
  }
  addDocumentItem(doc: Omit<DocumentItem, 'id'>, userId: string, userName: string, role: UserRole): DocumentItem {
    const fresh: DocumentItem = { ...doc, id: 'doc-' + generateId() };
    this.documentItems.push(fresh);
    this.save('doc_data', this.documentItems);
    this.writeAuditLog(doc.institutionId, userId, userName, role, 'Uploaded Document', 'تحميل مستند للمستودع', `Document "${fresh.title}" version ${fresh.version} added.`, `تمت إضافة مستند "${fresh.title}" إصدار ${fresh.version}.`, 'Data Change');
    return fresh;
  }
  updateDocumentItem(doc: DocumentItem, userId: string, userName: string, role: UserRole): void {
    this.documentItems = this.documentItems.map(d => d.id === doc.id ? doc : d);
    this.save('doc_data', this.documentItems);
    this.writeAuditLog(doc.institutionId, userId, userName, role, 'Updated Document details', 'تحديث مستند في المستودع', `Document "${doc.title}" marked status ${doc.status}.`, `تم تحديث مستند "${doc.title}" الحالة: ${doc.status}.`, 'Data Change');
  }

  // --- Announcements ---
  getAnnouncements(institutionId: string): Announcement[] {
    return this.announcements.filter(a => a.institutionId === institutionId);
  }
  addAnnouncement(an: Omit<Announcement, 'id'>, userId: string, userName: string, role: UserRole): Announcement {
    const fresh: Announcement = { ...an, id: 'an-' + generateId() };
    this.announcements.unshift(fresh);
    this.save('announcement_data', this.announcements);
    this.writeAuditLog(an.institutionId, userId, userName, role, 'Created Announcement', 'نشر إعلان جديد', `Announcement "${fresh.title}" published.`, `تم نشر الإعلان "${fresh.title}".`, 'Data Change');
    return fresh;
  }

  // --- Calendar Events ---
  getCalendarEvents(institutionId: string): CalendarEvent[] {
    return this.calendarEvents.filter(c => c.institutionId === institutionId);
  }
  addCalendarEvent(cal: Omit<CalendarEvent, 'id'>, userId: string, userName: string, role: UserRole): CalendarEvent {
    const fresh: CalendarEvent = { ...cal, id: 'cal-' + generateId() };
    this.calendarEvents.push(fresh);
    this.save('calendar_event_data', this.calendarEvents);
    this.writeAuditLog(cal.institutionId, userId, userName, role, 'Scheduled Event', 'جدولة حدث جديد', `Calendar event "${fresh.title}" created.`, `تم إنشاء حدث التقويم "${fresh.title}".`, 'Data Change');
    return fresh;
  }

  // --- Evaluation Questions ---
  getEvaluationQuestions(institutionId: string): EvaluationQuestion[] {
    const arr = Array.isArray(this.evaluationQuestions) ? this.evaluationQuestions : [];
    let list = arr.filter(q => q && q.institutionId === institutionId);
    if (list.length === 0) {
      const preseeded = getInitialEvaluationQuestions(institutionId);
      this.evaluationQuestions = [...arr, ...preseeded];
      this.save('eval_question_data', this.evaluationQuestions);
      list = preseeded;
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  addEvaluationQuestion(eq: Omit<EvaluationQuestion, 'id'>, userId: string, userName: string, role: UserRole): EvaluationQuestion {
    const fresh: EvaluationQuestion = { ...eq, id: 'eq-' + generateId() };
    this.evaluationQuestions.push(fresh);
    this.save('eval_question_data', this.evaluationQuestions);
    this.writeAuditLog(eq.institutionId, userId, userName, role, 'Added Evaluation Question', 'إضافة سؤال تقييم', `Added question: "${fresh.textEn}"`, `تمت إضافة سؤال تقييم: "${fresh.textAr}"`, 'Data Change');
    return fresh;
  }

  updateEvaluationQuestion(eq: EvaluationQuestion, userId: string, userName: string, role: UserRole): void {
    this.evaluationQuestions = this.evaluationQuestions.map(q => q.id === eq.id ? eq : q);
    this.save('eval_question_data', this.evaluationQuestions);
    this.writeAuditLog(eq.institutionId, userId, userName, role, 'Updated Evaluation Question', 'تحديث سؤال تقييم', `Updated question: "${eq.textEn}"`, `تم تحديث سؤال التقييم: "${eq.textAr}"`, 'Data Change');
  }

  deleteEvaluationQuestion(eqId: string, instId: string, userId: string, userName: string, role: UserRole): void {
    const found = this.evaluationQuestions.find(q => q.id === eqId);
    this.evaluationQuestions = this.evaluationQuestions.filter(q => q.id !== eqId);
    this.save('eval_question_data', this.evaluationQuestions);
    if (found) {
      this.writeAuditLog(instId, userId, userName, role, 'Deleted Evaluation Question', 'حذف سؤال تقييم', `Removed question: "${found.textEn}"`, `تم حذف سؤال التقييم: "${found.textAr}"`, 'Data Change');
    }
  }

  clearDatabase(): void {
    localStorage.removeItem('saas_quality_inst_data');
    localStorage.removeItem('saas_quality_user_data');
    localStorage.removeItem('saas_quality_kpi_data');
    localStorage.removeItem('saas_quality_program_data');
    localStorage.removeItem('saas_quality_course_data');
    localStorage.removeItem('saas_quality_actionplan_data');
    localStorage.removeItem('saas_quality_report_data');
    localStorage.removeItem('saas_quality_task_data');
    localStorage.removeItem('saas_quality_notification_data');
    localStorage.removeItem('saas_quality_audit_data');
    localStorage.removeItem('saas_quality_faculty_data');
    localStorage.removeItem('saas_quality_dept_data');
    localStorage.removeItem('saas_quality_student_data');
    localStorage.removeItem('saas_quality_lecturer_data');
    localStorage.removeItem('saas_quality_qual_obj_data');
    localStorage.removeItem('saas_quality_student_eval_data');
    localStorage.removeItem('saas_quality_lecturer_self_data');
    localStorage.removeItem('saas_quality_peer_review_data');
    localStorage.removeItem('saas_quality_external_review_data');
    localStorage.removeItem('saas_quality_accred_std_data');
    localStorage.removeItem('saas_quality_complaint_data');
    localStorage.removeItem('saas_quality_internal_audit_data');
    localStorage.removeItem('saas_quality_risk_data');
    localStorage.removeItem('saas_quality_capa_data');
    localStorage.removeItem('saas_quality_doc_data');
    localStorage.removeItem('saas_quality_announcement_data');
    localStorage.removeItem('saas_quality_calendar_event_data');
    localStorage.removeItem('saas_quality_eval_question_data');
    this.loadAll();
  }
}

export const dbService = new LocalDatabaseEngine();
