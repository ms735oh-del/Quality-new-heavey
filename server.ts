/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// --- Live Server State for API Keys and Backups ---
// Pre-seeded API credentials for tenant isolation simulation
const API_CREDENTIALS: Record<string, { apiKey: string; secretKey: string; jwtToken: string; rateLimit: string }> = {
  'oxford-global': {
    apiKey: 'aura_live_oxford_pk_9a8f273c',
    secretKey: 'aura_sec_oxford_88c7f910ea092',
    jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnN0aXR1dGlvbklkIjoib3hmb3JkLWdsb2JhbCJ9.oxford_sig',
    rateLimit: '10,000 requests/day'
  },
  'al-hikma': {
    apiKey: 'aura_live_hikma_pk_1b2c3d4e',
    secretKey: 'aura_sec_hikma_a1b2c3d4e5f6',
    jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnN0aXR1dGlvbklkIjoiYWwtaGlrbWF9.hikma_sig',
    rateLimit: '5,000 requests/day'
  },
  'apex-tech': {
    apiKey: 'aura_live_apex_pk_5f6g7h8i',
    secretKey: 'aura_sec_apex_z9y8x7w6v5u4',
    jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnN0aXR1dGlvbklkIjoiYXBleC10ZWNoIn0.apex_sig',
    rateLimit: '2,000 requests/day'
  }
};

// In-Memory Backups
interface BackupPayload {
  id: string;
  timestamp: string;
  name: string;
  dbState: any;
}
let BACKUPS: BackupPayload[] = [];

// In-Memory Temporary Evaluation Links State
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
  submittedStudents: string[]; // List of student IDs/emails who already submitted
  submittedIPs: string[]; // List of client IPs who already submitted (for single-device check)
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

const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

let TEMP_LINKS: TempLink[] = [];

// In-Memory Server Audits
interface ServerAudit {
  id: string;
  timestamp: string;
  ip: string;
  action: string;
  institution: string;
  user: string;
  details: string;
}
let SERVER_AUDITS: ServerAudit[] = [];

const logServerAction = (action: string, institution: string, user: string, details: string, req?: express.Request) => {
  const ip = req ? (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
  SERVER_AUDITS.unshift({
    id: 'sa-' + Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
    ip,
    action,
    institution,
    user,
    details
  });
};

// --- Google Gemini AI SDK Helper (Lazy initialized) ---
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      console.warn('GEMINI_API_KEY is not set or using placeholder value. AI services will use simulated responses.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
}

// ==========================================
// 1. BACKUP & RESTORE ENDPOINTS
// ==========================================
app.post('/api/backup/save', (req, res) => {
  const { name, dbState, user, institution } = req.body;
  const backup: BackupPayload = {
    id: 'bak-' + Date.now(),
    timestamp: new Date().toISOString(),
    name: name || `Backup_${new Date().toISOString().split('T')[0]}`,
    dbState
  };
  BACKUPS.unshift(backup);
  logServerAction('Create Backup', institution || 'oxford-global', user || 'Super Admin', `Manual Backup created: ${backup.name}`, req);
  res.json({ success: true, backup });
});

app.get('/api/backup/list', (req, res) => {
  res.json({ success: true, backups: BACKUPS });
});

app.post('/api/backup/restore', (req, res) => {
  const { id, user, institution } = req.body;
  const match = BACKUPS.find(b => b.id === id);
  if (match) {
    logServerAction('Restore Backup', institution || 'oxford-global', user || 'Super Admin', `Restored backup: ${match.name}`, req);
    res.json({ success: true, dbState: match.dbState });
  } else {
    res.status(404).json({ success: false, error: 'Backup not found' });
  }
});

// ==========================================
// 2. TEMPORARY EVALUATION LINKS ENDPOINTS
// ==========================================
app.get('/api/temp-links', (req, res) => {
  const institutionId = req.query.institutionId as string || 'oxford-global';
  const now = new Date();
  
  // Filter by institution for isolation
  const list = TEMP_LINKS.filter(l => l.institutionId === institutionId);

  list.forEach(link => {
    // Only auto-expire active links that passed their end date
    if (link.status === 'Active' || link.status === 'Approved') {
      const endDateTime = new Date(`${link.endDate}T${link.endTime}`);
      if (now > endDateTime) {
        link.status = 'Expired';
      } else if (link.responseCount >= link.maxResponses) {
        link.status = 'Completed';
      }
    }
  });
  res.json({ success: true, links: list });
});

app.post('/api/temp-links/generate', (req, res) => {
  const { 
    evaluationType, faculty, department, program, course, lecturer,
    academicLevel, semester, startDate, startTime, endDate, endTime,
    maxResponses, singleDevice, oneSubmissionPerStudent, anonymous, passwordProtected, password,
    user, institution, ratingScale, resultVisibility, reportPermissions, allowedStudents, questionsList,
    initialStatus
  } = req.body;

  const code = 'EVAL-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const id = 'tl-' + Math.random().toString(36).substring(2, 11);

  const newLink: TempLink = {
    id,
    code,
    institutionId: institution || 'oxford-global',
    evaluationType,
    faculty,
    department,
    program,
    course,
    lecturer,
    academicLevel,
    semester,
    startDate,
    startTime,
    endDate,
    endTime,
    maxResponses: Number(maxResponses || 100),
    singleDevice: !!singleDevice,
    oneSubmissionPerStudent: !!oneSubmissionPerStudent,
    anonymous: !!anonymous,
    passwordProtected: !!passwordProtected,
    password,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://aura.quality.edu/eval/' + code)}`,
    shortUrl: `https://aura.qa/e/${code.split('-')[1]}`,
    status: initialStatus || 'Active',
    responseCount: 0,
    submittedStudents: [],
    submittedIPs: [],
    ratingScale: ratingScale || 'Likert',
    resultVisibility: resultVisibility || 'Admin & Lecturer',
    reportPermissions: reportPermissions || 'Quality Committee',
    allowedStudents: allowedStudents || 'All',
    questionsList: questionsList || []
  };

  TEMP_LINKS.unshift(newLink);
  logServerAction('Create Temp Eval Link', institution || 'oxford-global', user || 'Quality Manager', `Generated link ${code} for ${course} with status ${newLink.status}`, req);
  res.json({ success: true, link: newLink });
});

// Update status endpoint for Admin Approval Workflow (review, preview, test, publish, close, archive)
app.post('/api/temp-links/update-status', (req, res) => {
  const { id, status, user, institution } = req.body;
  const link = TEMP_LINKS.find(l => l.id === id);
  if (!link) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  // Enforce isolation
  if (institution && link.institutionId !== institution) {
    return res.status(403).json({ success: false, error: 'Access denied: Tenant mismatch.' });
  }

  const oldStatus = link.status;
  link.status = status;
  logServerAction('Update Campaign Status', institution || link.institutionId || 'oxford-global', user || 'Quality Manager', `Transitioned campaign ${link.code} from ${oldStatus} to ${status}`, req);
  res.json({ success: true, link });
});

// Delete endpoint
app.post('/api/temp-links/delete', (req, res) => {
  const { id, user, institution } = req.body;
  const linkIdx = TEMP_LINKS.findIndex(l => l.id === id);
  if (linkIdx === -1) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  const link = TEMP_LINKS[linkIdx];
  // Enforce isolation
  if (institution && link.institutionId !== institution) {
    return res.status(403).json({ success: false, error: 'Access denied: Tenant mismatch.' });
  }

  TEMP_LINKS.splice(linkIdx, 1);
  logServerAction('Delete Campaign', institution || link.institutionId || 'oxford-global', user || 'Quality Manager', `Deleted campaign ${link.code}`, req);
  res.json({ success: true });
});

app.post('/api/temp-links/submit-response', (req, res) => {
  const { code, studentId, password, rating, comments } = req.body;
  const link = TEMP_LINKS.find(l => l.code === code);
  
  if (!link) {
    return res.status(404).json({ success: false, error: 'Evaluation link not found.' });
  }

  // 1. Validate Expiration
  const endDateTime = new Date(`${link.endDate}T${link.endTime}`);
  if (new Date() > endDateTime) {
    link.status = 'Expired';
    return res.status(400).json({ success: false, error: 'This evaluation link has expired.' });
  }

  // 2. Validate Response Count Limit
  if (link.responseCount >= link.maxResponses) {
    link.status = 'Closed';
    return res.status(400).json({ success: false, error: 'This evaluation has reached its maximum response limit.' });
  }

  // 3. Password Validation
  if (link.passwordProtected && link.password !== password) {
    return res.status(401).json({ success: false, error: 'Incorrect evaluation password.' });
  }

  // 4. One submission per student check
  if (link.oneSubmissionPerStudent && studentId) {
    if (link.submittedStudents.includes(studentId)) {
      return res.status(400).json({ success: false, error: 'You have already submitted an evaluation for this session.' });
    }
  }

  // 5. Single Device (IP) check
  const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
  if (link.singleDevice) {
    if (link.submittedIPs.includes(ip)) {
      return res.status(400).json({ success: false, error: 'A submission has already been made from this device.' });
    }
  }

  // Submit response
  link.responseCount += 1;
  if (studentId) {
    link.submittedStudents.push(studentId);
  }
  link.submittedIPs.push(ip);

  // Auto-close if limit is reached
  if (link.responseCount >= link.maxResponses) {
    link.status = 'Completed';
  }

  logServerAction('Submit Temp Eval Response', 'oxford-global', studentId || 'Anonymous Student', `Submitted response for link ${code}`, req);
  res.json({ success: true, message: 'Evaluation submitted successfully! Access has been disabled for your session.' });
});

// ==========================================
// 3. SECURE REST API WITH COMPLETE TENANT ISOLATION
// ==========================================

// In-Memory Database for REST API with Complete Tenant Isolation
const TENANT_STUDENTS: Record<string, Array<{ id: string; name: string; email: string; level: string; status: string }>> = {
  'oxford-global': [
    { id: 'std-ox-1', name: 'John Smith', email: 'j.smith@aura.edu', level: 'Level 4', status: 'Active' },
    { id: 'std-ox-2', name: 'Aisha Al-Otaibi', email: 'a.otaibi@aura.edu', level: 'Level 3', status: 'Active' }
  ],
  'al-hikma': [
    { id: 'std-ca-1', name: 'James Carter', email: 'j.carter@edu.org', level: 'Level 4', status: 'Active' },
    { id: 'std-ca-2', name: 'Fatima Al-Harbi', email: 'f.harbi@edu.org', level: 'Level 3', status: 'Active' }
  ],
  'apex-tech': [
    { id: 'std-ap-1', name: 'Zaid Salem', email: 'z.salem@apex.edu', level: 'Level 2', status: 'Active' }
  ]
};

const TENANT_LECTURERS: Record<string, Array<{ id: string; name: string; email: string; department: string; status: string }>> = {
  'oxford-global': [
    { id: 'lec-ox-1', name: 'Dr. Emily Watson', email: 'watson@aura.edu', department: 'Computer Science', status: 'Active' },
    { id: 'lec-ox-2', name: 'Prof. Charles Higgins', email: 'higgins@aura.edu', department: 'Surgery & Anatomy', status: 'Active' }
  ],
  'al-hikma': [
    { id: 'lec-ca-1', name: 'Dr. Mahmoud El-Sayed', email: 'm.sayed@cairo.edu', department: 'Civil Engineering', status: 'Active' }
  ]
};

const TENANT_DEPARTMENTS: Record<string, Array<{ id: string; name: string; head: string; programsCount: number }>> = {
  'oxford-global': [
    { id: 'dept-ox-1', name: 'Computer Science', head: 'Dr. Grace Hopper', programsCount: 2 },
    { id: 'dept-ox-2', name: 'Surgery & Anatomy', head: 'Prof. Charles Higgins', programsCount: 1 }
  ],
  'al-hikma': [
    { id: 'dept-ca-1', name: 'Civil Engineering', head: 'Dr. Ahmed Ibrahim', programsCount: 2 }
  ]
};

const TENANT_COURSES: Record<string, Array<{ id: string; code: string; name: string; creditHours: number; syllabusApproved: boolean }>> = {
  'oxford-global': [
    { id: 'crs-ox-1', code: 'CS402', name: 'Artificial Intelligence', creditHours: 3, syllabusApproved: true },
    { id: 'crs-ox-2', code: 'SE301', name: 'Software Architecture', creditHours: 4, syllabusApproved: false }
  ],
  'al-hikma': [
    { id: 'crs-ca-1', code: 'CE201', name: 'Structural Analysis I', creditHours: 3, syllabusApproved: true }
  ]
};

const TENANT_EVALUATIONS: Record<string, Array<{ id: string; title: string; courseCode: string; status: string; responseCount: number; averageRating: number }>> = {
  'oxford-global': [
    { id: 'eval-ox-1', title: 'Course Evaluation CS402', courseCode: 'CS402', status: 'Active', responseCount: 42, averageRating: 4.6 }
  ],
  'al-hikma': [
    { id: 'eval-ca-1', title: 'Introductory Survey CE201', courseCode: 'CE201', status: 'Completed', responseCount: 15, averageRating: 4.2 }
  ]
};

const TENANT_REPORTS: Record<string, Array<{ id: string; title: string; type: string; score: number; status: string; date: string }>> = {
  'oxford-global': [
    { id: 'rep-ox-1', title: 'Self-Study Institutional Report', type: 'Self-Evaluation', score: 94, status: 'Approved', date: '2026-06-15' }
  ],
  'al-hikma': [
    { id: 'rep-ca-1', title: 'Annual Civil Program Audit', type: 'Annual Program Review', score: 81, status: 'Reviewed', date: '2026-05-20' }
  ]
};

// API Usage Stats Tracking
const API_REQUESTS_COUNT: Record<string, number> = {
  'oxford-global': 782,
  'al-hikma': 124,
  'apex-tech': 12
};

const API_ERRORS_COUNT: Record<string, number> = {
  'oxford-global': 5,
  'al-hikma': 2,
  'apex-tech': 0
};

// Middleware to enforce Tenant Isolation
const enforceTenantIsolation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const instId = req.headers['x-institution-id'] as string;
  const apiKey = req.headers['x-api-key'] as string;
  const secretKey = req.headers['x-api-secret'] as string || req.headers['x-secret-key'] as string;
  const authHeader = req.headers['authorization'] as string;

  if (!instId) {
    return res.status(400).json({ error: 'Missing x-institution-id header.' });
  }

  const credentials = API_CREDENTIALS[instId];
  if (!credentials) {
    return res.status(404).json({ error: 'Institution not registered on API Platform.' });
  }

  // Rate Limiting Check
  const currentRequests = API_REQUESTS_COUNT[instId] || 0;
  // Free: 100, Basic/Apex: 2000, Pro/Hikma: 5000, Enterprise/Oxford: 10000
  const limit = instId === 'oxford-global' ? 10000 : instId === 'al-hikma' ? 5000 : 2000;
  if (currentRequests >= limit) {
    API_ERRORS_COUNT[instId] = (API_ERRORS_COUNT[instId] || 0) + 1;
    logServerAction('API Rate Limit Exceeded', instId, 'External Client', `Blocked request after hitting quota of ${limit}`, req);
    return res.status(429).json({ error: `Rate limit exceeded. Quota reached for this tenant (${limit} requests/day).` });
  }

  // Check API Key & Optional Secret OR Bearer Token
  const hasValidApiKey = apiKey && apiKey === credentials.apiKey;
  const hasValidSecret = !secretKey || secretKey === credentials.secretKey;
  const hasValidJwt = authHeader && authHeader === `Bearer ${credentials.jwtToken}`;

  if ((!hasValidApiKey || !hasValidSecret) && !hasValidJwt) {
    API_ERRORS_COUNT[instId] = (API_ERRORS_COUNT[instId] || 0) + 1;
    logServerAction('API Unauthorized Access Attempt', instId, 'External Client', 'Failed credentials validation check', req);
    return res.status(401).json({ error: 'Unauthorized. Invalid API Key, Secret key, or JWT access token.' });
  }

  // Track usage
  API_REQUESTS_COUNT[instId] = currentRequests + 1;

  req.params.activeTenantId = instId;
  next();
};

// Endpoints supporting complete isolation
app.get('/api/v1/auth/credentials', (req, res) => {
  const instId = req.query.institutionId as string || 'oxford-global';
  let credentials = API_CREDENTIALS[instId];
  
  if (!credentials) {
    // Dynamically generate API Keys for newly registered SaaS tenants
    credentials = {
      apiKey: `aura_live_${instId.replace(/[^a-z0-9]/g, '_')}_pk_${Math.random().toString(36).substring(2, 10)}`,
      secretKey: `aura_sec_${instId.replace(/[^a-z0-9]/g, '_')}_${Math.random().toString(36).substring(2, 15)}`,
      jwtToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnN0aXR1dGlvbklkIjoiZXh0ZXJuYWwtaW5zdSJ9.${Math.random().toString(36).substring(2, 10)}_sig`,
      rateLimit: '2,000 requests/day'
    };
    API_CREDENTIALS[instId] = credentials;
    API_REQUESTS_COUNT[instId] = 0;
    API_ERRORS_COUNT[instId] = 0;
  }

  res.json({ success: true, institutionId: instId, credentials });
});

app.get('/api/v1/:activeTenantId/statistics', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  logServerAction('API Call', tenant, 'System Integration', 'Fetched statistics', req);
  
  const currentUsage = API_REQUESTS_COUNT[tenant] || 0;
  const maxLimit = tenant === 'oxford-global' ? 10000 : tenant === 'al-hikma' ? 5000 : 2000;
  
  res.json({
    institutionId: tenant,
    activeUsersCount: tenant === 'oxford-global' ? 1540 : tenant === 'al-hikma' ? 420 : 45,
    totalStudentsCount: tenant === 'oxford-global' ? 18400 : tenant === 'al-hikma' ? 12500 : 2400,
    complianceRate: tenant === 'oxford-global' ? 94.2 : tenant === 'al-hikma' ? 81.5 : 75.0,
    pendingCapaItems: tenant === 'oxford-global' ? 3 : tenant === 'al-hikma' ? 7 : 2,
    apiUsageRate: `${currentUsage}/${maxLimit.toLocaleString()} requests`,
    storageUsageGB: tenant === 'oxford-global' ? '14.2 GB / 500 GB' : tenant === 'al-hikma' ? '5.1 GB / 200 GB' : '1.2 GB / 50 GB'
  });
});

// REST API Endpoints with Tenant Isolation

// 1. Students Endpoints
app.get('/api/v1/:activeTenantId/students', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const list = TENANT_STUDENTS[tenant] || [];
  res.json({ institutionId: tenant, count: list.length, students: list });
});

app.post('/api/v1/:activeTenantId/students', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const { name, email, level } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required parameters: name, email.' });
  }
  if (!TENANT_STUDENTS[tenant]) TENANT_STUDENTS[tenant] = [];
  
  const newStudent = {
    id: `std-api-${Math.random().toString(36).substring(2, 6)}`,
    name,
    email,
    level: level || 'Level 1',
    status: 'Active'
  };
  TENANT_STUDENTS[tenant].push(newStudent);
  logServerAction('API Create Student', tenant, 'API Client', `Created student ${name}`, req);
  res.status(211).json({ success: true, student: newStudent });
});

app.put('/api/v1/:activeTenantId/students', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const { id, name, email, level, status } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing student id parameter.' });
  }
  const list = TENANT_STUDENTS[tenant] || [];
  const match = list.find(s => s.id === id);
  if (!match) {
    return res.status(444).json({ error: 'Student not found in this tenant context.' });
  }
  if (name) match.name = name;
  if (email) match.email = email;
  if (level) match.level = level;
  if (status) match.status = status;

  logServerAction('API Update Student', tenant, 'API Client', `Updated student ${match.name}`, req);
  res.json({ success: true, student: match });
});

// 2. Lecturers Endpoints
app.get('/api/v1/:activeTenantId/lecturers', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const list = TENANT_LECTURERS[tenant] || [];
  res.json({ institutionId: tenant, count: list.length, lecturers: list });
});

app.post('/api/v1/:activeTenantId/lecturers', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const { name, email, department } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required parameters: name, email.' });
  }
  if (!TENANT_LECTURERS[tenant]) TENANT_LECTURERS[tenant] = [];

  const newLec = {
    id: `lec-api-${Math.random().toString(36).substring(2, 6)}`,
    name,
    email,
    department: department || 'Information Technology',
    status: 'Active'
  };
  TENANT_LECTURERS[tenant].push(newLec);
  logServerAction('API Create Lecturer', tenant, 'API Client', `Created lecturer ${name}`, req);
  res.status(211).json({ success: true, lecturer: newLec });
});

app.put('/api/v1/:activeTenantId/lecturers', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const { id, name, email, department, status } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing lecturer id parameter.' });
  }
  const list = TENANT_LECTURERS[tenant] || [];
  const match = list.find(l => l.id === id);
  if (!match) {
    return res.status(444).json({ error: 'Lecturer not found in this tenant context.' });
  }
  if (name) match.name = name;
  if (email) match.email = email;
  if (department) match.department = department;
  if (status) match.status = status;

  logServerAction('API Update Lecturer', tenant, 'API Client', `Updated lecturer ${match.name}`, req);
  res.json({ success: true, lecturer: match });
});

// 3. Departments Endpoints
app.get('/api/v1/:activeTenantId/departments', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const list = TENANT_DEPARTMENTS[tenant] || [];
  res.json({ institutionId: tenant, count: list.length, departments: list });
});

app.post('/api/v1/:activeTenantId/departments', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const { name, head, programsCount } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing department name.' });
  }
  if (!TENANT_DEPARTMENTS[tenant]) TENANT_DEPARTMENTS[tenant] = [];

  const newDept = {
    id: `dept-api-${Math.random().toString(36).substring(2, 6)}`,
    name,
    head: head || 'TBD Head',
    programsCount: Number(programsCount || 1)
  };
  TENANT_DEPARTMENTS[tenant].push(newDept);
  logServerAction('API Create Department', tenant, 'API Client', `Created department ${name}`, req);
  res.status(211).json({ success: true, department: newDept });
});

// 4. Courses Endpoints
app.get('/api/v1/:activeTenantId/courses', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const list = TENANT_COURSES[tenant] || [];
  res.json({ institutionId: tenant, count: list.length, courses: list });
});

app.post('/api/v1/:activeTenantId/courses', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const { code, name, creditHours, syllabusApproved } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'Missing course code or name.' });
  }
  if (!TENANT_COURSES[tenant]) TENANT_COURSES[tenant] = [];

  const newCourse = {
    id: `crs-api-${Math.random().toString(36).substring(2, 6)}`,
    code,
    name,
    creditHours: Number(creditHours || 3),
    syllabusApproved: !!syllabusApproved
  };
  TENANT_COURSES[tenant].push(newCourse);
  logServerAction('API Create Course', tenant, 'API Client', `Created course ${code} - ${name}`, req);
  res.status(211).json({ success: true, course: newCourse });
});

// 5. Evaluations Endpoints
app.post('/api/v1/:activeTenantId/evaluations', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const { title, courseCode } = req.body;
  if (!title || !courseCode) {
    return res.status(400).json({ error: 'Missing evaluation title or courseCode.' });
  }
  if (!TENANT_EVALUATIONS[tenant]) TENANT_EVALUATIONS[tenant] = [];

  const newEval = {
    id: `eval-api-${Math.random().toString(36).substring(2, 6)}`,
    title,
    courseCode,
    status: 'Active',
    responseCount: 0,
    averageRating: 0.0
  };
  TENANT_EVALUATIONS[tenant].push(newEval);
  logServerAction('API Create Evaluation', tenant, 'API Client', `Created evaluation campaign: ${title}`, req);
  res.status(211).json({ success: true, evaluation: newEval });
});

app.get('/api/v1/:activeTenantId/evaluations/results', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const list = TENANT_EVALUATIONS[tenant] || [];
  res.json({
    institutionId: tenant,
    evaluationType: 'Aggregate Academic Evaluations',
    results: list.map(ev => ({
      evaluationId: ev.id,
      title: ev.title,
      courseCode: ev.courseCode,
      respondents: ev.responseCount,
      satisfactionRate: `${(ev.averageRating ? ev.averageRating * 20 : 90).toFixed(1)}%`,
      averageScore: ev.averageRating || 4.5
    }))
  });
});

// 6. Reports Endpoints
app.post('/api/v1/:activeTenantId/reports/generate', enforceTenantIsolation, (req, res) => {
  const tenant = req.params.activeTenantId;
  const { title, type } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Missing report title.' });
  }
  if (!TENANT_REPORTS[tenant]) TENANT_REPORTS[tenant] = [];

  const newReport = {
    id: `rep-api-${Math.random().toString(36).substring(2, 6)}`,
    title,
    type: type || 'Self-Evaluation',
    score: Math.floor(Math.random() * 20) + 80, // 80 - 100
    status: 'Approved',
    date: new Date().toISOString().split('T')[0]
  };
  TENANT_REPORTS[tenant].push(newReport);
  logServerAction('API Generate Report', tenant, 'API Client', `Generated quality report: ${title}`, req);
  res.status(211).json({ success: true, report: newReport });
});

// ==========================================
// 4. GOOGLE GEMINI AI INTEGRATION
// ==========================================
app.post('/api/ai/chat', async (req, res) => {
  const { message, history, systemInstruction } = req.body;
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      // Simulate response if key is missing
      const simResponse = `[Simulated Assistant Response] Thank you for your question: "${message}". In a fully deployed environment with a valid GEMINI_API_KEY, this response is dynamically written using gemini-3.5-flash with real-time quality assurance data context!`;
      return res.json({ text: simResponse });
    }

    const ai = getGeminiClient();
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: systemInstruction || 'You are an elite expert in University Quality Assurance, Accreditations, and SaaS data management.',
      }
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (err: any) {
    console.error('Gemini Chat error:', err);
    res.status(500).json({ error: 'AI processing failed: ' + err.message });
  }
});

app.post('/api/ai/service', async (req, res) => {
  const { serviceType, payload } = req.body;
  try {
    const key = process.env.GEMINI_API_KEY;
    
    // Simulate AI results if API key is not valid
    if (!key || key === 'MY_GEMINI_API_KEY') {
      let mockText = '';
      const lang = payload?.language || 'en';
      const area = payload?.focusArea || 'overall';
      const instName = payload?.institution?.name || 'Oxford Global';

      if (serviceType === 'strategic-insights') {
        if (lang === 'ar') {
          // Arabic high-fidelity insights
          if (area === 'overall') {
            mockText = `## 📊 التوصيات الاستراتيجية الكلية لـ **${instName}**

### 1. تسريع المواءمة ومعدلات الامتثال للبرامج الأكاديمية
متوسط معدل امتثال المناهج الحالي هو **${payload?.metrics?.averageCompliance || '94%'}** ودرجة التقييم الذاتي المتوسطة هي **${payload?.metrics?.averageSelfStudyScore || '88/100'}**. يوصى بشدة بتركيز الجهود على الكليات التي تقل عن عتبة الامتثال المستهدفة (95%):
- **مبادرة فورية**: تجميع فريق جودة مخصص لمراجعة المقررات الدراسية المعلقة في برنامج الهندسة الميكانيكية وإجراء مطابقة فورية لمخرجات التعلم مع المعايير الوطنية.

### 2. ميكنة العمليات ومكافحة المخاطر التشغيلية
مع وجود **${payload?.metrics?.activeRisksCount || 1}** من المخاطر النشطة وإجراءات CAPA المعلقة، يجب وضع آلية استباقية للسيطرة:
- **مبادرة وقائية**: إسناد مسؤولية متابعة البنود لعمداء الكليات المعنية وتفعيل الإخطارات التلقائية عبر البريد الإلكتروني لموظفي ضمان الجودة قبل ٣٠ يوماً من زيارة المقيم الخارجي.

### 3. تدعيم جودة المساقات وأساليب تقييم الطلاب
يظهر التحليل أن ٤٪ من المقررات تحتوي على مواءمة مباشرة مفقودة بين الاختبار النهائي ومخرجات التعلم المبرمجة:
- **خطة تصحيحية**: تنظيم ورشة عمل تدريبية لهيئة التدريس لربط بنود تقييم الطلاب بمصفوفات الكفايات المعتمدة.`;
          } else if (area === 'curriculum') {
            mockText = `## 📖 تحليل ومطابقة المناهج والمقررات لـ **${instName}**

### 1. معالجة فجوات المواءمة وتوافق المخرجات
مراجعة المقررات الدراسية تظهر وجود تباين في مواءمة المساقات الأكاديمية:
- **التوصية**: تحديث مصفوفات التوافق في برنامج علوم الحاسوب لتغطية معايير الاعتماد الأكاديمي الدولي (ABET) بشكل شامل.
- **الإجراء المقترح**: إسناد مهمة مراجعة ملفات المقررات (Course Portfolios) وتدقيق العينات العشوائية إلى رئيس القسم لضمان التوافق الكامل مع معايير جودة التعليم العالي.

### 2. اعتماد المناهج المعلقة بنظام آمن
- **التوصية**: تفعيل بروتوكول تسريع الاعتمادات للمواد الدراسية التي لا تزال في وضع "قيد المراجعة". يجب اتخاذ قرارات سريعة بشأنها أو طلب تصحيحات فورية لتجنب تراكم الملفات قبل انطلاق الفصل الدراسي الجديد.`;
          } else if (area === 'risk-capa') {
            mockText = `## ⚠️ مصفوفة العمليات التشغيلية والمخاطر والـ CAPA لـ **${instName}**

### 1. السيطرة الاستباقية على مخاطر تجديد الاعتماد
يشير التحليل الإحصائي لـ **${payload?.metrics?.activeRisksCount || 1}** من المخاطر النشطة إلى أهمية تكثيف العمل على المتطلبات المعلقة:
- **مبادرة تصحيحية**: تسريع إتمام تقارير المراجعة الداخلية لبرامج كلية الطب والهندسة.
- **التوصية**: تعيين مستشار جودة خارجي لتسجيل التدقيق ومراجعة الفجوات قبل انطلاق زيارة المقيمين الرسميين بـ ١٥ يوماً على الأقل.

### 2. تقليل فترات معالجة بنود CAPA
- **التوصية**: ربط بنود الإجراءات العلاجية والوقائية مباشرة في لوحة قيادة الجودة بالجامعة مع تحديد جهات مسؤولة بشكل محدد (مثل عميد الكلية أو منسق البرنامج) ومواعيد نهائية صارمة، لتقليل الزمن المستغرق لإغلاق الحالات التشغيلية المفتوحة.`;
          } else {
            mockText = `## 👥 استبيانات الطلاب وملاحظات هيئة التدريس لـ **${instName}**

### 1. تحسين الاستجابة لآراء وملاحظات الطلاب
- **التوصية**: بناءً على تحليل استبيانات الطلاب الأخيرة، يوصى بزيادة التفاعل في الساعات المكتبية المخصصة لمساقات المستوى الرابع.
- **الإجراء**: حث الأساتذة على تنظيم لقاءات مراجعة تفاعلية إضافية، وتوفير مصادر دعم إضافية لمعامل البرمجة والهندسة العملية.

### 2. تشجيع التقييم الذاتي المستمر لهيئة التدريس
- **التوصية**: تفعيل أداة التقييم الذاتي السنوية للأساتذة وربطها بمؤشرات جودة التدريس والبحوث وخدمة المجتمع لمكافأة الأداء المتميز وتحديد الاحتياجات التدريبية بدقة.`;
          }
        } else {
          // English high-fidelity insights
          if (area === 'overall') {
            mockText = `## 📊 AI Strategic Recommendations for **${instName}**

### 1. Accelerate Curriculum Alignment and Compliance Rates
Your current average program compliance is **${payload?.metrics?.averageCompliance || '94%'}** with a Self-Evaluation Score of **${payload?.metrics?.averageSelfStudyScore || '88/100'}**. To achieve the targeted **95%** threshold, prioritize active program review:
- **Strategic Directive**: Mobilize a dedicated quality task force to audit the course portfolios and syllabus mappings for any program scored under 90% (specifically in Engineering/Medicine).

### 2. Address Operational Risks and Close Outstanding CAPA Items
With **${payload?.metrics?.activeRisksCount || 1}** active risk items and **${payload?.metrics?.pendingCapasCount || 1}** open CAPAs, immediate actions are necessary to secure institutional compliance:
- **Corrective Action**: Task the Dean of Student Affairs and Program Coordinators with completing pending remedial initiatives within 30 days. Enable automated notification reminders.

### 3. Integrate Robust Student Feedback Feedback Loops
Direct assessments indicate that student feedback requests more flexible and transparent academic support:
- **Action Plan**: Align and publish official instructor office hours. Standardize laboratory safety and resources feedback checks.`;
          } else if (area === 'curriculum') {
            mockText = `## 📖 Curriculum Audit & Syllabus Compliance for **${instName}**

### 1. Solve Program Qualification Gaps
A deep review of course portfolios shows that certain advanced modules lack complete direct-mapping grids:
- **Strategic Recommendation**: Update the course syllabus mapping matrices for all Level 4 courses to conform perfectly with international accreditation bodies (such as ABET or AACSB).
- **Corrective Measure**: Standardize exam assessment benchmarks so that final grades are mathematically linked to program learning outcome (PLO) targets.

### 2. Fast-Track Pending Syllabus Approvals
- **Syllabus Protocol**: Implement a fast-track review process for any syllabus currently in "Pending Review" status to prevent registration delays before the upcoming semester starts.`;
          } else if (area === 'risk-capa') {
            mockText = `## ⚠️ Operations Risk & CAPA Evaluation for **${instName}**

### 1. Mitigate Accreditation site-visit Failure Risks
Your current risk profile indicates **${payload?.metrics?.activeRisksCount || 1}** identified risks that could delay or impact the next NCAAA accreditation renewal cycle:
- **Strategic Mitigation**: Task a specialized internal audit committee to compile and lock-submit all self-study portfolios at least 15 days prior to the scheduled site visits.
- **Evidence Verification**: Re-verify and audit the digital evidence storage buckets to ensure all links and attachments are complete and cryptographically accessible.

### 2. Reduce CAPA Cycle Closure Latency
- **CAPA Optimization**: Bind CAPA remediation items directly in the university's compliance calendar, enforcing strict owner accountability (e.g. assigning the Dean of Engineering or Head of Medicine) with automatic reminders.`;
          } else {
            mockText = `## 👥 Student Evaluations & Feedback Trends for **${instName}**

### 1. Optimize Course Ratings and Feedback Response
Based on recent student satisfaction surveys and course portfolios:
- **Strategic Advice**: Instructors in Level 4 courses are advised to increase scheduled office hours and implement interactive coding/lab assignments to drive student engagement.
- **Action Plan**: Standardize digital workspace portals to collect anonymous feedback every 4 weeks rather than only at the end of the semester.

### 2. Empower Faculty Self-Evaluation Workflows
- **Faculty Strategy**: Encourage all hired lecturers to complete their annual professional development self-evaluation reports, linking achievements to quality metrics.`;
          }
        }
        return res.json({ text: mockText });
      }

      switch (serviceType) {
        case 'report-writing':
          mockText = `### Academic Quality Report: ${payload.title || 'Syllabus Alignment'}\n\n**Executive Summary**\nThis document provides an automated quality audit evaluation for the curriculum. All metrics indicate standard compliance with structural requirements.\n\n**Key Findings**\n- Course portfolios are 95% complete.\n- Student learning outcome mapping is aligned with national qualification standards.\n\n**Corrective Suggestions**\n- Implement peer review workshops for Level 4 instructors.`;
          break;
        case 'quality-analysis':
          mockText = `### Quality Analysis Report\n\n**Syllabus Analysis**\nThe syllabus is structured correctly, but direct assessment alignment is missing for 2 core modules.\n\n**Compliance Rating**: 88%\n\n**Action Items**:\n1. Integrate direct mapping vectors.\n2. Update laboratory safety compliance documents.`;
          break;
        case 'eval-summary':
          mockText = `### Evaluation Summary: Dr. Watson\n\n- **Overall Rating**: 4.7 / 5.0\n- **Strength**: High engagement and interactive programming assignments.\n- **Feedback Summary**: Students requested more direct office hours for lab assignments.\n- **Verdict**: Excellent performance, recommended for course coordinator position.`;
          break;
        case 'risk-prediction':
          mockText = `### Operations & Risk Prediction Matrix\n\n**High Risk Category**: Academic Compliance Gap\n**Trigger**: Delayed submission of Self-Study files for Mechanical Engineering.\n**Projected Impact**: Delay in NCAAA renewal scheduled for November 2026.\n**Suggested Mitigation**: Mobilize dedicated QA task-force to complete alignment within 14 days.`;
          break;
        default:
          mockText = `### Dynamic Recommendations & Smart Insights\n\nBased on your active institution metrics, we recommend:\n1. Renewing IEEE subscriptions for the Computer Science department immediately.\n2. Conducting an internal audit of course MED302 due to feedback trends.`;
      }
      return res.json({ text: mockText });
    }

    const ai = getGeminiClient();
    let prompt = `Analyze the following academic quality data and provide high-quality professional university QA strategic insights and recommendations. Service requested: ${serviceType}.\n\n`;
    prompt += `Payload details:\n${JSON.stringify(payload, null, 2)}\n\n`;
    prompt += `Provide a beautifully formatted markdown output. 
Use clear headings, professional educational vocabulary, and concrete actionable suggestions.
If the requested language (language) is "ar", please write the response entirely in high-quality Arabic. Otherwise, write it in English.
Focus on the specific focusArea requested in the payload:
- "overall": General institutional compliance, average SER scores, active risks.
- "curriculum": Course syllabus mappings, syllabus reviews, learning outcomes, portfolio audits.
- "risk-capa": Operational risk register mitigation, CAPA progress tracking.
- "evaluations": Student evaluation surveys, ratings feedback loops.

Give 2 to 3 main strategic recommendations. For each, describe the finding, a proposed strategic initiative, and a concrete action step. Keep your output highly structured.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are the core AURA AI Educational Intelligence Engine. You write reports, classify complaints, predict operations risk, and deliver elite insights for Deans, Presidents, and Quality Directors.',
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error('AI Service error:', err);
    res.status(500).json({ error: 'AI service generation failed: ' + err.message });
  }
});

// ==========================================
// 4.5. COMMERCIAL SAAS & PAYMENT PLATFORM
// ==========================================

let WALLET_SETTINGS = {
  JAWALI_WALLET_NUMBER: process.env.JAWALI_WALLET_NUMBER || '770001234',
  JAWALI_ACCOUNT_NAME: process.env.JAWALI_ACCOUNT_NAME || 'Aura Quality SaaS Hub (Jawali)',
  JAWALI_MERCHANT_ID: process.env.JAWALI_MERCHANT_ID || 'MERCH-JAW-9988',
  JEEB_WALLET_NUMBER: process.env.JEEB_WALLET_NUMBER || '780005678',
  JEEB_ACCOUNT_NAME: process.env.JEEB_ACCOUNT_NAME || 'Aura Quality SaaS Hub (Jeeb)',
  JEEB_MERCHANT_ID: process.env.JEEB_MERCHANT_ID || 'MERCH-JEE-5544'
};

interface PaymentRecord {
  id: string;
  institutionId: string;
  institutionName: string;
  plan: string;
  amount: number;
  paymentMethod: string;
  walletType: 'Jawali' | 'Jeeb';
  transactionNumber: string;
  proofImage: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  rejectionReason?: string;
}

let PAYMENTS: PaymentRecord[] = [];

interface SaasSubscription {
  institutionId: string;
  tier: 'Free Trial' | 'Basic' | 'Professional' | 'Enterprise';
  status: 'Pending Payment' | 'Active' | 'Suspended' | 'Expired' | 'Cancelled';
  startDate: string;
  endDate: string;
  maxUsers: number;
  maxStudents: number;
  maxLecturers: number;
  storageLimitGB: number;
  apiAccess: boolean;
  aiFeatures: boolean;
  reportsAccess: boolean;
  evaluationFeatures: boolean;
}

let SAAS_SUBSCRIPTIONS: Record<string, SaasSubscription> = {
  'oxford-global': {
    institutionId: 'oxford-global',
    tier: 'Enterprise',
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    maxUsers: 200,
    maxStudents: 30000,
    maxLecturers: 2500,
    storageLimitGB: 500,
    apiAccess: true,
    aiFeatures: true,
    reportsAccess: true,
    evaluationFeatures: true
  },
  'al-hikma': {
    institutionId: 'al-hikma',
    tier: 'Professional',
    status: 'Active',
    startDate: '2026-02-15',
    endDate: '2027-02-15',
    maxUsers: 100,
    maxStudents: 15000,
    maxLecturers: 1000,
    storageLimitGB: 200,
    apiAccess: true,
    aiFeatures: true,
    reportsAccess: true,
    evaluationFeatures: true
  },
  'apex-tech': {
    institutionId: 'apex-tech',
    tier: 'Basic',
    status: 'Active',
    startDate: '2026-05-01',
    endDate: '2026-11-01',
    maxUsers: 30,
    maxStudents: 5000,
    maxLecturers: 300,
    storageLimitGB: 50,
    apiAccess: false,
    aiFeatures: false,
    reportsAccess: true,
    evaluationFeatures: true
  }
};

app.get('/api/saas/wallet-settings', (req, res) => {
  res.json({ success: true, settings: WALLET_SETTINGS });
});

app.post('/api/saas/wallet-settings', (req, res) => {
  const { 
    JAWALI_WALLET_NUMBER, JAWALI_ACCOUNT_NAME, JAWALI_MERCHANT_ID,
    JEEB_WALLET_NUMBER, JEEB_ACCOUNT_NAME, JEEB_MERCHANT_ID
  } = req.body;
  
  if (JAWALI_WALLET_NUMBER) WALLET_SETTINGS.JAWALI_WALLET_NUMBER = JAWALI_WALLET_NUMBER;
  if (JAWALI_ACCOUNT_NAME) WALLET_SETTINGS.JAWALI_ACCOUNT_NAME = JAWALI_ACCOUNT_NAME;
  if (JAWALI_MERCHANT_ID) WALLET_SETTINGS.JAWALI_MERCHANT_ID = JAWALI_MERCHANT_ID;
  if (JEEB_WALLET_NUMBER) WALLET_SETTINGS.JEEB_WALLET_NUMBER = JEEB_WALLET_NUMBER;
  if (JEEB_ACCOUNT_NAME) WALLET_SETTINGS.JEEB_ACCOUNT_NAME = JEEB_ACCOUNT_NAME;
  if (JEEB_MERCHANT_ID) WALLET_SETTINGS.JEEB_MERCHANT_ID = JEEB_MERCHANT_ID;

  logServerAction('Wallet Configuration Updated', 'Global System', 'Platform Admin', 'Updated Jawali/Jeeb settings', req);
  res.json({ success: true, settings: WALLET_SETTINGS });
});

app.get('/api/saas/payments', (req, res) => {
  res.json({ success: true, payments: PAYMENTS });
});

app.post('/api/saas/payments/submit', (req, res) => {
  const { institutionId, institutionName, plan, amount, walletType, transactionNumber, proofImage } = req.body;
  if (!institutionId || !plan || !amount || !walletType || !transactionNumber) {
    return res.status(400).json({ error: 'Missing required transfer detail parameters.' });
  }

  const newPayment: PaymentRecord = {
    id: `pay-${Math.random().toString(36).substring(2, 8)}`,
    institutionId,
    institutionName: institutionName || 'Academic Institution',
    plan,
    amount: Number(amount),
    paymentMethod: 'Mobile Wallet',
    walletType,
    transactionNumber,
    proofImage: proofImage || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=200&auto=format&fit=crop',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  };

  PAYMENTS.unshift(newPayment);
  
  // also update subscription state of institution to 'Pending Payment'
  if (!SAAS_SUBSCRIPTIONS[institutionId]) {
    SAAS_SUBSCRIPTIONS[institutionId] = {
      institutionId,
      tier: plan,
      status: 'Pending Payment',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      maxUsers: plan === 'Enterprise' ? 200 : plan === 'Professional' ? 100 : 30,
      maxStudents: plan === 'Enterprise' ? 30000 : plan === 'Professional' ? 15000 : 5000,
      maxLecturers: plan === 'Enterprise' ? 2500 : plan === 'Professional' ? 1000 : 300,
      storageLimitGB: plan === 'Enterprise' ? 500 : plan === 'Professional' ? 200 : 50,
      apiAccess: plan !== 'Basic',
      aiFeatures: plan !== 'Basic',
      reportsAccess: true,
      evaluationFeatures: true
    };
  } else {
    SAAS_SUBSCRIPTIONS[institutionId].status = 'Pending Payment';
    SAAS_SUBSCRIPTIONS[institutionId].tier = plan;
  }

  logServerAction('Subscription Payment Submitted', institutionId, 'Institution Admin', `Submitted ${walletType} proof for ${plan} Plan`, req);
  res.json({ success: true, payment: newPayment });
});

app.post('/api/saas/payments/approve', (req, res) => {
  const { paymentId, status, rejectionReason, approvedBy } = req.body;
  if (!paymentId || !status) {
    return res.status(400).json({ error: 'Missing paymentId or status.' });
  }

  const payment = PAYMENTS.find(p => p.id === paymentId);
  if (!payment) {
    return res.status(404).json({ error: 'Payment record not found.' });
  }

  payment.status = status;
  if (rejectionReason) payment.rejectionReason = rejectionReason;
  if (approvedBy) payment.approvedBy = approvedBy;

  const instId = payment.institutionId;
  const plan = payment.plan;

  if (status === 'Approved') {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]; // 1 year
    
    SAAS_SUBSCRIPTIONS[instId] = {
      institutionId: instId,
      tier: plan as any,
      status: 'Active',
      startDate,
      endDate,
      maxUsers: plan === 'Enterprise' ? 200 : plan === 'Professional' ? 100 : 30,
      maxStudents: plan === 'Enterprise' ? 30000 : plan === 'Professional' ? 15000 : 5000,
      maxLecturers: plan === 'Enterprise' ? 2500 : plan === 'Professional' ? 1000 : 300,
      storageLimitGB: plan === 'Enterprise' ? 500 : plan === 'Professional' ? 200 : 50,
      apiAccess: plan !== 'Basic',
      aiFeatures: plan !== 'Basic',
      reportsAccess: true,
      evaluationFeatures: true
    };
    logServerAction('Subscription Approved & Activated', instId, 'Platform Admin', `Payment approved. Activated ${plan} Plan.`, req);
  } else {
    if (SAAS_SUBSCRIPTIONS[instId]) {
      SAAS_SUBSCRIPTIONS[instId].status = 'Suspended';
    }
    logServerAction('Subscription Payment Rejected', instId, 'Platform Admin', `Payment rejected: ${rejectionReason}`, req);
  }

  res.json({ success: true, payment, subscription: SAAS_SUBSCRIPTIONS[instId] });
});

app.get('/api/saas/subscriptions', (req, res) => {
  res.json({ success: true, subscriptions: SAAS_SUBSCRIPTIONS });
});

app.post('/api/saas/subscriptions/update', (req, res) => {
  const { institutionId, tier, status, startDate, endDate, maxUsers, maxStudents, maxLecturers, storageLimitGB } = req.body;
  if (!institutionId) {
    return res.status(400).json({ error: 'Missing institutionId' });
  }

  const sub = SAAS_SUBSCRIPTIONS[institutionId] || {
    institutionId,
    tier: tier || 'Basic',
    status: status || 'Active',
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    maxUsers: maxUsers || 30,
    maxStudents: maxStudents || 5000,
    maxLecturers: maxLecturers || 300,
    storageLimitGB: storageLimitGB || 50,
    apiAccess: tier !== 'Basic',
    aiFeatures: tier !== 'Basic',
    reportsAccess: true,
    evaluationFeatures: true
  };

  if (tier) sub.tier = tier;
  if (status) sub.status = status;
  if (startDate) sub.startDate = startDate;
  if (endDate) sub.endDate = endDate;
  if (maxUsers) sub.maxUsers = maxUsers;
  if (maxStudents) sub.maxStudents = maxStudents;
  if (maxLecturers) sub.maxLecturers = maxLecturers;
  if (storageLimitGB) sub.storageLimitGB = storageLimitGB;
  
  sub.apiAccess = sub.tier !== 'Basic';
  sub.aiFeatures = sub.tier !== 'Basic';

  SAAS_SUBSCRIPTIONS[institutionId] = sub;
  logServerAction('Subscription Manually Updated', institutionId, 'Platform Admin', `Super admin manually updated subscription to ${sub.tier} (${sub.status})`, req);
  res.json({ success: true, subscription: sub });
});

// ==========================================
// 5. SERVER SYSTEM LOGS & AUDITS
// ==========================================
app.get('/api/server-logs', (req, res) => {
  res.json({ success: true, logs: SERVER_AUDITS });
});

app.post('/api/server-logs/add', (req, res) => {
  const { action, institution, user, details } = req.body;
  logServerAction(action, institution, user, details, req);
  res.json({ success: true });
});

// ==========================================
// 6. VITE AND STATIC ASSETS SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Pre-seed some default logs on start
  SERVER_AUDITS.push(
    {
      id: 'sa-init',
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      action: 'System Startup',
      institution: 'Global System',
      user: 'Platform Engine',
      details: 'AURA Quality SaaS Platform v1.4 Booted. Listening on Port 3000.'
    }
  );

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AURA] Full-stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
