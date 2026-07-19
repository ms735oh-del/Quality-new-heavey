/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'Super Admin'
  | 'Platform Admin'
  | 'Institution Admin'
  | 'Quality Manager'
  | 'Quality Coordinator'
  | 'Auditor'
  | 'Dean'
  | 'Department Head'
  | 'Program Coordinator'
  | 'Lecturer'
  | 'Student'
  | 'External Reviewer'
  | 'Guest';

export interface Institution {
  id: string;
  institutionId?: string; // Backwards and forwards compatibility
  name: string;
  status?: string; // Backwards and forwards compatibility
  arabicName: string;
  logo: string;
  domain: string;
  primaryColor: string;
  secondaryColor: string;
  studentCount: number;
  facultyCount: number;
  activePrograms: number;
  accreditationStatus: 'Accredited' | 'Conditional' | 'Under Review' | 'Not Accredited';
  arabicAccreditationStatus: string;
  // SaaS Subscription and White-Label properties
  subscriptionTier?: 'Free Trial' | 'Basic' | 'Professional' | 'Enterprise';
  subscriptionStatus?: 'Pending Payment' | 'Active' | 'Suspended' | 'Expired' | 'Cancelled';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  maxUsers?: number;
  maxStudents?: number;
  maxLecturers?: number;
  storageLimitGB?: number;
  apiAccess?: boolean;
  aiFeatures?: boolean;
  reportsAccess?: boolean;
  evaluationFeatures?: boolean;
  logoCustomized?: boolean;
  customDomain?: string;
  customSubdomain?: string;
}

export interface User {
  id: string;
  uid: string; // Required unique identifier corresponding to Firebase/Auth credentials
  institutionId: string;
  tenantId: string; // Required tenant isolation index for robust cross-tenant separation
  name: string;
  arabicName: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  arabicDepartment: string;
  active: boolean;
  permissions: string[]; // Required security list of fine-grained capabilities
}

export interface KPI {
  id: string;
  institutionId: string;
  name: string;
  arabicName: string;
  category: 'Academics' | 'Research' | 'Resources' | 'Student Life' | 'Community';
  arabicCategory: string;
  value: number;
  target: number;
  unit: string;
  history: { date: string; value: number }[];
}

export interface Program {
  id: string;
  institutionId: string;
  name: string;
  arabicName: string;
  code: string;
  department: string;
  arabicDepartment: string;
  coordinatorId: string;
  status: 'Draft' | 'Self Study' | 'External Review' | 'Accredited' | 'Needs Revision';
  arabicStatus: string;
  selfStudyScore: number; // 0 - 100
  complianceRate: number; // %
}

export interface Course {
  id: string;
  programId: string;
  name: string;
  arabicName: string;
  code: string;
  creditHours: number;
  syllabusApproved: boolean;
  reviewStatus: 'Approved' | 'Pending Review' | 'Needs Revision';
  arabicReviewStatus: string;
  complianceScore: number; // 0 - 100
  lecturerName: string;
}

export interface ActionPlan {
  id: string;
  institutionId: string;
  programId: string;
  title: string;
  arabicTitle: string;
  recommendation: string;
  arabicRecommendation: string;
  responsibleParty: string;
  arabicResponsibleParty: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  arabicStatus: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface QualityReport {
  id: string;
  institutionId: string;
  title: string;
  arabicTitle: string;
  type: 'Self-Evaluation' | 'Annual Program Review' | 'Course Portfolio' | 'Site Visit Audit';
  arabicType: string;
  authorId: string;
  status: 'Draft' | 'Submitted' | 'Reviewed' | 'Approved';
  arabicStatus: string;
  overallScore: number;
  sections: {
    id: string;
    title: string;
    arabicTitle: string;
    score: number;
    feedback: string;
    arabicFeedback: string;
  }[];
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  institutionId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  arabicAction: string;
  details: string;
  arabicDetails: string;
  timestamp: string;
  ipAddress: string;
  type: 'Security' | 'Data Change' | 'Auth' | 'System';
}

export interface Task {
  id: string;
  institutionId: string;
  title: string;
  arabicTitle: string;
  description: string;
  arabicDescription: string;
  dueDate: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  arabicStatus: string;
  priority: 'High' | 'Medium' | 'Low';
  assigneeRole: UserRole;
}

export interface Notification {
  id: string;
  title: string;
  arabicTitle: string;
  message: string;
  arabicMessage: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type Language = 'en' | 'ar';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Faculty {
  id: string;
  institutionId: string;
  name: string;
  arabicName: string;
  code: string;
  description: string;
  arabicDescription: string;
  dean: string;
  arabicDean: string;
  departmentsCount: number;
  programsCount: number;
}

export interface Department {
  id: string;
  institutionId: string;
  facultyId: string;
  name: string;
  arabicName: string;
  head: string;
  arabicHead: string;
  programsCount: number;
  lecturersCount: number;
  studentsCount: number;
}

export interface Student {
  id: string;
  institutionId: string;
  studentId: string;
  nationalId: string;
  fullName: string;
  arabicFullName: string;
  gender: 'Male' | 'Female' | 'Other';
  arabicGender: string;
  birthDate: string;
  email: string;
  phone: string;
  facultyId: string;
  departmentId: string;
  programId: string;
  academicLevel: number;
  semester: number;
  status: 'Active' | 'Suspended' | 'Graduated';
  arabicStatus: string;
  gpa: number;
  photo: string;
}

export interface Lecturer {
  id: string;
  institutionId: string;
  employeeId: string;
  name: string;
  arabicName: string;
  email: string;
  phone: string;
  facultyId: string;
  departmentId: string;
  academicRank: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'Teaching Assistant';
  arabicAcademicRank: string;
  qualification: string;
  arabicQualification: string;
  researchInterests: string;
  arabicResearchInterests: string;
  publications: string[];
  officeHours: string;
  experienceYears: number;
  cvAttached: boolean;
  certificates: string[];
}

export interface QualityObjective {
  id: string;
  institutionId: string;
  title: string;
  arabicTitle: string;
  indicator: string;
  arabicIndicator: string;
  targetValue: string;
  currentValue: string;
  planTitle: string;
  arabicPlanTitle: string;
  status: 'Achieved' | 'On Track' | 'Delayed';
  arabicStatus: string;
}

export interface StudentEvaluation {
  id: string;
  institutionId: string;
  studentId: string; // Keep empty if anonymous
  isAnonymous: boolean;
  evaluateType: 'Lecturer' | 'Course' | 'Laboratory' | 'Training';
  arabicEvaluateType: string;
  targetId: string; // Lecturer ID or Course ID
  targetName: string;
  arabicTargetName: string;
  q1Rating: number; // 1-5
  q2Rating: number; // 1-5
  q3Rating: number; // 1-5
  qMcOption: string; // 'Excellent' | 'Good' | 'Fair' | 'Poor'
  qYesNo: 'Yes' | 'No';
  comments: string;
  score: number; // out of 100
  timestamp: string;
}

export interface LecturerSelfEvaluation {
  id: string;
  institutionId: string;
  lecturerId: string;
  lecturerName: string;
  arabicLecturerName: string;
  teachingScore: number; // 1-10
  researchScore: number; // 1-10
  communityScore: number; // 1-10
  professionalDevelopmentScore: number; // 1-10
  achievements: string;
  arabicAchievements: string;
  evidenceFiles: string[];
  progressRate: number; // %
  timestamp: string;
}

export interface PeerReview {
  id: string;
  institutionId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  weightedScore: number;
  comments: string;
  evidenceFile: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  arabicStatus: string;
}

export interface ExternalReview {
  id: string;
  institutionId: string;
  reviewerName: string;
  reviewType: 'Program' | 'Department' | 'College' | 'Institution';
  arabicReviewType: string;
  targetName: string;
  evidenceFile: string;
  recommendations: string;
  arabicRecommendations: string;
  status: 'Reviewed' | 'Pending Action' | 'Resolved';
  arabicStatus: string;
}

export interface AccreditationStandard {
  id: string;
  institutionId: string;
  code: string;
  title: string;
  arabicTitle: string;
  compliancePercentage: number;
  gapAnalysis: string;
  improvementPlan: string;
  progressTracking: number; // %
}

export interface ComplaintSuggestion {
  id: string;
  institutionId: string;
  submitterType: 'Student' | 'Lecturer' | 'Employee' | 'Guest';
  submitterName: string;
  type: 'Complaint' | 'Suggestion' | 'Feedback';
  arabicType: string;
  title: string;
  arabicTitle: string;
  details: string;
  attachments: string[];
  status: 'Submitted' | 'Under Review' | 'Resolved';
  arabicStatus: string;
  assignedReviewer: string;
  responseHistory: { responder: string; message: string; date: string }[];
}

export interface InternalAudit {
  id: string;
  institutionId: string;
  planTitle: string;
  arabicPlanTitle: string;
  auditTeam: string;
  checklist: string[];
  findings: string;
  observations: string;
  correctiveActions: string;
  status: 'Draft' | 'Open' | 'Closed' | 'Follow-up';
  arabicStatus: string;
}

export interface RiskItem {
  id: string;
  institutionId: string;
  category: 'Strategic' | 'Academic' | 'Financial' | 'Operational' | 'Reputational';
  arabicCategory: string;
  title: string;
  arabicTitle: string;
  likelihood: number; // 1 to 5
  impact: number; // 1 to 5
  mitigationPlan: string;
  arabicMitigationPlan: string;
  responsiblePerson: string;
  deadline: string;
  status: 'Identified' | 'Mitigating' | 'Controlled';
  arabicStatus: string;
}

export interface CapaItem {
  id: string;
  institutionId: string;
  type: 'Corrective' | 'Preventive';
  title: string;
  arabicTitle: string;
  responsiblePerson: string;
  dueDate: string;
  evidenceFile: string;
  progress: number;
  status: 'Open' | 'In Progress' | 'Closed';
  arabicStatus: string;
}

export interface DocumentItem {
  id: string;
  institutionId: string;
  title: string;
  category: 'Accreditation' | 'Policy' | 'Curriculum' | 'Audit' | 'Course Portfolio';
  folder: string;
  version: string;
  allowedRoles: UserRole[];
  status: 'Draft' | 'Pending' | 'Approved';
  arabicStatus: string;
  evidenceUrl: string;
  history: { action: string; user: string; date: string }[];
}

export interface Announcement {
  id: string;
  institutionId: string;
  title: string;
  arabicTitle: string;
  details: string;
  arabicDetails: string;
  priority: 'High' | 'Medium' | 'Normal';
  targetAudience: 'All' | 'Students' | 'Lecturers' | 'Employees';
  attachments: string[];
  publicationDate: string;
  status: 'Published' | 'Scheduled' | 'Draft';
}

export interface CalendarEvent {
  id: string;
  institutionId: string;
  title: string;
  arabicTitle: string;
  type: 'Meeting' | 'Audit' | 'Event' | 'Deadline' | 'Task';
  date: string;
  time: string;
  description: string;
}

export interface EvaluationQuestion {
  id: string;
  institutionId: string;
  textEn: string;
  textAr: string;
  evaluationType: 'Student evaluates Lecturer' | 'Student evaluates Course' | 'Student evaluates Laboratory' | 'Student evaluates Training' | 'Lecturer Self Evaluation' | 'Peer Evaluation' | 'Department Evaluation' | 'External Review Evaluation';
  isActive: boolean;
  order: number;
}

