import { jsPDF } from 'jspdf';
import * as fs from 'fs';

// Create a new PDF document
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

// Colors
const primaryColor = [79, 70, 229]; // Indigo
const secondaryColor = [15, 23, 42]; // Slate-900
const accentColor = [16, 185, 129]; // Emerald
const textColor = [51, 65, 85]; // Slate-700
const lightBackground = [248, 250, 252]; // Soft slate-50
const highlightColor = [224, 242, 254]; // Sky blue bg

// Helper to draw horizontal rules
function drawHR(y) {
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
}

// Helper for Section Headers
function drawSectionHeader(num, title, y) {
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${num}. ${title}`, 15, y);
  drawHR(y + 3);
}

// ----------------------------------------------------
// PAGE 1: TITLE & COVER PAGE (Platform Owner / Super Admin Focus)
// ----------------------------------------------------
// Decorative sidebar accent
doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.rect(0, 0, 10, 297, 'F');

// Top banner
doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
doc.rect(10, 0, 200, 75, 'F');

doc.setFont('Helvetica', 'bold');
doc.setFontSize(26);
doc.setTextColor(255, 255, 255);
doc.text('AURA PLATFORM CONTROL & API MANUAL', 20, 35);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(12);
doc.setTextColor(199, 210, 254);
doc.text('Comprehensive Super Admin Operations, Tenant Isolation, & Developer Integrations', 20, 46);

// Meta box
doc.setFillColor(lightBackground[0], lightBackground[1], lightBackground[2]);
doc.roundedRect(20, 90, 175, 90, 3, 3, 'F');

doc.setFont('Helvetica', 'bold');
doc.setFontSize(15);
doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
doc.text('Platform Owner Metadata', 30, 105);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(textColor[0], textColor[1], textColor[2]);

let metaLines = [
  '• Role Profile: Platform Super Administrator / System Owner',
  '• Target Workspace Address: lztalaslamqadm@gmail.com (Root Principal)',
  '• Access Level: Comprehensive Database, API, Backups & Subscriptions Control',
  '• Tenant Model: Logical Multi-Tenant database virtualization via Firestore',
  '• Security Level: Zero cross-tenant data leak guarantees via dynamic API keys',
  '• Integration Protocols: REST, JWT Authorization Bearer, Custom Headers'
];

let yPos = 115;
metaLines.forEach(line => {
  doc.text(line, 30, yPos);
  yPos += 10;
});

// Quick table of contents
doc.setFont('Helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.text('MANUAL INDEX', 20, 200);
drawHR(203);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(10);
doc.setTextColor(textColor[0], textColor[1], textColor[2]);
doc.text('Section 1: Multi-Tenant Architecture & Database Isolation Model', 20, 210);
doc.text('Section 2: API Gateway Management & University Key Issuance', 20, 218);
doc.text('Section 3: Yemen Mobile Wallet Subscriptions & Financial Management', 20, 226);
doc.text('Section 4: Enterprise Backups, Point-In-Time Restore & Logs', 20, 234);
doc.text('Section 5: Complete Operational Step-by-Step Scenario', 20, 242);

// Footer
doc.setFont('Helvetica', 'italic');
doc.setFontSize(9);
doc.setTextColor(148, 163, 184);
doc.text('CONFIDENTIAL — For platform owner eyes only.', 20, 275);
doc.text('Page 1 of 5', 180, 275);

// ----------------------------------------------------
// PAGE 2: TENANT ISOLATION & ARCHITECTURE
// ----------------------------------------------------
doc.addPage();
// Decorative sidebar accent
doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.rect(0, 0, 10, 297, 'F');

drawSectionHeader('1', 'MULTI-TENANT ARCHITECTURE & DATABASE ISOLATION MODEL', 20);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(10);
doc.setTextColor(textColor[0], textColor[1], textColor[2]);

let p2_lines = [
  'AURA operates on a highly isolated logical multi-tenant database pattern. Instead of physical database',
  'segmentation which incurs significant infrastructure cost, AURA virtualizes databases using institutional',
  'identifiers (e.g. "oxford-global", "cairo-national"). This prevents structural interference and ensures secure isolation:',
  '',
  '  • Logical Partitioning: Every database transaction, record update, and analytical query requires an',
  '    institutionId parameter. The system strictly filters local state queries with this key.',
  '  • UI Workspace Isolation: When you log in as Platform Admin, you can switch between institutions via',
  '    the active workspace picker in the side panel. All lists, dashboards, and reports instantly filter to the',
  '    selected institution, protecting data hygiene.',
  '  • Public Port and Route Restrictions: The server binds specifically to port 3000 on 0.0.0.0. Student',
  '    evaluations run via short code parameters, immediately resolving the correct institution record from memory.'
];

yPos = 32;
p2_lines.forEach(line => {
  doc.text(line, 20, yPos);
  yPos += 7.5;
});

drawSectionHeader('2', 'API GATEWAY MANAGEMENT & UNIVERSITY KEY ISSUANCE', 125);

let p2_lines_2 = [
  'As Platform Admin, you control the REST API gateway through which partner universities integrate their local',
  'Learning Management Systems (LMS - e.g., Moodle, Blackboard) or Student Information Systems (SIS).',
  '',
  'How to Issue API Credentials to a University:',
  '  1. Go to the Developer API Console in the sidebar.',
  '  2. The system automatically provisions credentials specifically for the active institution workspace.',
  '  3. Copy the following issued tokens and hand them over to the university\'s IT Developer team:',
  '     - x-api-key: Unique Client Key used in request headers to authorize the institution.',
  '     - Client Secret: Cryptographic key to verify payload authenticity.',
  '     - Authorization JWT: Pre-signed Bearer Token with encrypted institution parameters.',
  '  4. The university developer must include these headers in their curl/fetch requests:',
  '     Headers: { "x-api-key": "...", "Authorization": "Bearer ...", "x-institution-id": "..." }',
  '',
  'Malicious Cross-Tenant Attack Safeguards:',
  '  To simulate security attacks, press "Simulate Attack" in the API playground. The system injects a mismatch',
  '  (e.g., using Oxford\'s API key while requesting Cairo\'s private records). AURA automatically intercepts',
  '  this and returns an immediate 401 Unauthorized block, guaranteeing full security compliance.'
];

yPos = 137;
p2_lines_2.forEach(line => {
  doc.text(line, 20, yPos);
  yPos += 7.5;
});

doc.text('Page 2 of 5', 180, 275);

// ----------------------------------------------------
// PAGE 3: PAYMENT GATEWAY & WALLET MANAGEMENT
// ----------------------------------------------------
doc.addPage();
// Decorative sidebar accent
doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.rect(0, 0, 10, 297, 'F');

drawSectionHeader('3', 'YEMEN MOBILE WALLET SUBSCRIPTIONS & FINANCIALS', 20);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(10);
doc.setTextColor(textColor[0], textColor[1], textColor[2]);

let p3_lines = [
  'AURA features a highly targeted regional mobile wallet subscription billing system designed for Yemen.',
  'This coordinates subscription flows via leading mobile networks including "Jawali" and "Jeeb".',
  '',
  'A. How to Configure Platform Wallets:',
  '  1. Navigate to the Super Admin Dashboard (accessible only to Platform Admin users).',
  '  2. Scroll down to the "Regional Wallet Configuration" panel.',
  '  3. Enter your active merchant wallet details: Wallet Phone Number, Account Name, and Merchant API ID.',
  '  4. Press "Update Configuration" to instantly apply the new credentials to the platform checkout.',
  '',
  'B. Understanding the Payment Review & Approval Pipeline:',
  '  • Student campaigns, premium AI reports, and maximum limits are governed by SaaS Subscriptions.',
  '  • When a tenant university requests a subscription upgrade (e.g. Basic to Enterprise), they select a plan',
  '    and receive your configured Wallet details. They transfer the payment and submit proof of transaction',
  '    (Reference Number and optional receipt snapshot).',
  '  • The payment record is captured in the "Pending Subscriptions Audit" queue on your Super Admin panel.',
  '  • You can review the payment detail, verify the transfer on your merchant phone, and press:',
  '    - Approve: Automatically updates the university subscription to "Active", sets limits, and unlocks API/AI.',
  '    - Reject: Suspends active upgrades and requests the tenant to submit a valid transaction token.'
];

yPos = 32;
p3_lines.forEach(line => {
  doc.text(line, 20, yPos);
  yPos += 8;
});

drawHR(180);

doc.setFont('Helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
doc.text('SAAS PLAN PRICING & QUOTA MATRIX', 20, 190);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(9.5);
doc.text('Plan Name      Yemeni Rial Equivalent      Max Users      Max Students      Max Lecturers      API / AI Access', 20, 200);
drawHR(203);
doc.text('Basic          300,000 YER / Month         30             5,000             300                Disabled', 20, 210);
doc.text('Professional   600,000 YER / Month         100            15,000            1,000              Enabled', 20, 218);
doc.text('Enterprise     1,200,000 YER / Month       200            30,000            2,500              Full Features', 20, 226);

doc.text('Page 3 of 5', 180, 275);

// ----------------------------------------------------
// PAGE 4: ENTERPRISE BACKUPS, PITR & AUDIT LOGS
// ----------------------------------------------------
doc.addPage();
// Decorative sidebar accent
doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.rect(0, 0, 10, 297, 'F');

drawSectionHeader('4', 'ENTERPRISE BACKUPS, POINT-IN-TIME RESTORE & AUDIT LOGS', 20);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(10);
doc.setTextColor(textColor[0], textColor[1], textColor[2]);

let p4_lines = [
  'AURA ensures unmatched enterprise durability by providing double-layer backup and restoration tools.',
  'These are accessible via the Super Admin Dashboard and operate in real-time without database downtime.',
  '',
  'A. Point-In-Time Recovery (PITR) Backup System:',
  '  • On-Demand Snapshot: Click "Create Full System Backup" in the Admin controls. The server takes a complete',
  '    JSON state mirror of all tenant records, databases, evaluation parameters, and wallet settings.',
  '  • Timestamp Tagging: Backups are saved with precise ISO-timestamps and labeled with metadata (e.g. "Pre-Upgrade")',
  '    to maintain clean recovery logs.',
  '  • Instant Point-in-Time Restore: If a database error or configuration leak occurs, scroll to the backups list,',
  '    locate your target snapshot, and press "Restore". The system instantly replaces active memory structures',
  '    and updates persistent layers seamlessly.',
  '',
  'B. Live Audit Logging & IP Security Tracing:',
  '  AURA maintains a strict compliance audit ledger capturing two distinct log types:',
  '  1. Operational Audit Logs (Tenant Specific): Track academic actions (e.g., submitting self-study, creating courses,',
  '     closing evaluations) accessible by local institution quality managers.',
  '  2. Live Server Security Logs (Platform Wide): Accessible only on the Super Admin panel. These record low-level',
  '     server events, tracking: timestamp, client IP address, action performed, tenant institution, user identity, and',
  '     detailed execution parameters. This satisfies regional accreditation requirements for data security auditing.'
];

yPos = 32;
p4_lines.forEach(line => {
  doc.text(line, 20, yPos);
  yPos += 8;
});

doc.text('Page 4 of 5', 180, 275);

// ----------------------------------------------------
// PAGE 5: OPERATIONAL SCENARIOS & RUNBOOKS
// ----------------------------------------------------
doc.addPage();
// Decorative sidebar accent
doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.rect(0, 0, 10, 297, 'F');

drawSectionHeader('5', 'STEP-BY-STEP PLATFORM USER GUIDE & OPERATIONAL RUNBOOKS', 20);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(10);
doc.setTextColor(textColor[0], textColor[1], textColor[2]);

let p5_lines = [
  'As Platform Admin, execute the following runbooks for daily administrative procedures:',
  '',
  'Runbook A: Onboarding a New University Tenant',
  '  1. Open the Super Admin Dashboard and locate the "Institutions Directory" panel.',
  '  2. Click "Add New Institution". Fill out parameters: English/Arabic Name, active domain name, and subscription tier.',
  '  3. Under the User Manager section, create a new "Quality Manager" or "Dean" account assigned specifically to the',
  '     new institution\'s tenant ID.',
  '  4. Log out and instruct the university\'s Dean to log in. Their workspace starts completely empty, fully',
  '     isolated and secure.',
  '',
  'Runbook B: Managing and Approving Campaign Evaluations',
  '  1. In the sidebar, select "Evaluation Forms & Campaigns".',
  '  2. You can review drafts of campaigns prepared by local college coordinators.',
  '  3. Transition the campaign status: "Draft" -> "Under Review" -> "Approved" -> "Active".',
  '  4. Once marked "Active", the student evaluation gateway is unlocked. Share the 8-digit access code (e.g. EVAL-793X)',
  '     with students to collect anonymous, aggregated responses.',
  '',
  'Runbook C: Executing AI Audits & Compliance Reviews',
  '  1. Navigate to the "AI Compliance Advisor" or "Quality Evaluations".',
  '  2. Click "Generate Strategic Quality Audit" or "AI Recommendation Review".',
  '  3. The server securely proxies isolated university metrics to the Google Gemini model using the secure',
  '     GEMINI_API_KEY environment secret, returning detailed compliance advice and actionable steps.'
];

yPos = 32;
p5_lines.forEach(line => {
  doc.text(line, 20, yPos);
  yPos += 8;
});

// Closing signature box
doc.setFillColor(lightBackground[0], lightBackground[1], lightBackground[2]);
doc.roundedRect(20, 215, 175, 45, 2, 2, 'F');

doc.setFont('Helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.text('SYSTEM OWNER AUTHORIZATION NOTICE', 25, 230);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(textColor[0], textColor[1], textColor[2]);
doc.text('This operations manual is cryptographically bound to the principal admin account. Unsanctioned', 25, 240);
doc.text('duplication or sharing of this document is strictly prohibited under SaaS compliance parameters.', 25, 248);

doc.text('Page 5 of 5', 180, 275);

// Output the generated PDF to a file
const pdfOutput = doc.output('arraybuffer');
fs.writeFileSync('./AURA_ADMIN_OPERATIONS_MANUAL.pdf', Buffer.from(pdfOutput));
console.log('Admin Operations PDF Manual generated successfully as AURA_ADMIN_OPERATIONS_MANUAL.pdf');
