import { jsPDF } from 'jspdf';
import * as fs from 'fs';

// Create a new PDF document
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

// Define elegant styles
const primaryColor = [79, 70, 229]; // Indigo
const secondaryColor = [30, 41, 59]; // Slate
const accentColor = [16, 185, 129]; // Emerald
const textColor = [51, 65, 85]; // Dark grey
const lightBackground = [248, 250, 252]; // Soft grey

// Helper to draw a horizontal rule
function drawHR(y) {
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
}

// Helper to draw section headers
function drawHeader(title, y) {
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(title, 15, y);
  drawHR(y + 3);
}

// ----------------------------------------------------
// PAGE 1: TITLE & COVER PAGE
// ----------------------------------------------------
// Header background banner
doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.rect(0, 0, 210, 80, 'F');

// Title text on cover
doc.setFont('Helvetica', 'bold');
doc.setFontSize(28);
doc.setTextColor(255, 255, 255);
doc.text('AURA QUALITY SAAS PLATFORM', 15, 35);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(14);
doc.setTextColor(199, 210, 254);
doc.text('Complete Institutional Academic Quality & Compliance Management Manual', 15, 48);

// Subtitle / Details box
doc.setFillColor(lightBackground[0], lightBackground[1], lightBackground[2]);
doc.roundedRect(15, 95, 180, 85, 4, 4, 'F');

doc.setFont('Helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
doc.text('Manual Overview & Metadata', 25, 110);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(11);
doc.setTextColor(textColor[0], textColor[1], textColor[2]);

let details = [
  '• Platform Name: AURA Institutional Quality Management SaaS',
  '• Target Roles: Quality Managers, Deans, Lecturers, and Students',
  '• Supported Workflows: Automated Surveys, Risk Logs, KPIs & AI Insight Auditing',
  '• Integration Stack: Google Workspace, Google GenAI (Gemini SDK), Firestore & Auth',
  '• Document Purpose: Complete user guide & environment setup instructions'
];

let yOffset = 120;
details.forEach(detail => {
  doc.text(detail, 25, yOffset);
  yOffset += 10;
});

// Footer
doc.setFont('Helvetica', 'italic');
doc.setFontSize(10);
doc.setTextColor(100, 116, 139);
doc.text('System generated technical manual — Confidentially isolated for authorized tenants.', 15, 270);
doc.text('Page 1 of 4', 180, 270);

// ----------------------------------------------------
// PAGE 2: ARCHITECTURE & CORE WORKFLOWS
// ----------------------------------------------------
doc.addPage();
drawHeader('1. SYSTEM ARCHITECTURE & ISOLATION', 20);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(textColor[0], textColor[1], textColor[2]);

let p2_text = [
  'AURA operates as a highly secure, tenant-isolated multi-institution platform designed to satisfy regional',
  'educational accreditation bodies. Every university is provisioned a logically isolated database space',
  'ensuring full structural security and information hygiene.',
  '',
  'Core Functional Units Available on AURA:',
  '  1. Dashboard & Core Analytics: Dynamic visual trackers monitoring performance logs and active surveys.',
  '  2. Academics & Department Directory: Manage and search courses, lecturers, and college divisions.',
  '  3. Quality Review & Self-Studies: Design, review, approve, and finalize comprehensive self-study logs.',
  '  4. Operations Risk Registry: Continuous audit log of administrative and academic risk events.',
  '  5. Site-Visit & Field Audits: External review tracker to align with national accreditation standards.',
  '  6. KPI Tracking Hub: Real-time data logging for critical quality indexes (student-to-staff, retention, etc.).'
];

yOffset = 35;
p2_text.forEach(line => {
  doc.text(line, 15, yOffset);
  yOffset += 7;
});

drawHeader('2. TEMPORARY EVALUATION CAMPAIGNS', 115);

let p2_text_2 = [
  'To resolve administrative overheads, AURA supports "Temporary Evaluation Campaigns" enabling',
  'Quality Officers to generate custom questionnaires, assign them to courses, and obtain structured responses.',
  '',
  'Workflow Steps:',
  '  • Design Phase: Define target course, selected instructors, and add customizable metrics from the bank.',
  '  • Approval Flow: Campaigns start as "Draft", transition to "Under Review", are finalized as "Approved",',
  '    and then marked "Active" to receive student responses.',
  '  • Dynamic Student Gateway: Students access evaluations via a 100% responsive interface utilizing the',
  '    secure 8-digit access code (e.g. EVAL-793X) or dynamic dynamic links.',
  '  • Adaptive QR Codes: Integrated QR codes dynamically update relative to current hosting origins,',
  '    safeguarding developers against 404 broken routes.'
];

yOffset = 130;
p2_text_2.forEach(line => {
  doc.text(line, 15, yOffset);
  yOffset += 7;
});

doc.text('Page 2 of 4', 180, 270);

// ----------------------------------------------------
// PAGE 3: ENVIRONMENT VARIABLES CONFIGURATION
// ----------------------------------------------------
doc.addPage();
drawHeader('3. ENVIRONMENT VARIABLES CONFIGURATION', 20);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(textColor[0], textColor[1], textColor[2]);

let p3_text = [
  'AURA utilizes secure, server-side environment variables to hide private credentials from the browser.',
  'These environment settings must be placed in the root directory under `.env` or injected',
  'via the AI Studio Secrets panel.',
  '',
  'Required Environment Keys Explained:',
  '',
  '  1. GEMINI_API_KEY (Server Secret)',
  '     - Function: Powers the smart AI Recommendation and Compliance Audits engine.',
  '     - Where to place: In the root `.env` or AI Studio Secrets.',
  '     - Format: GEMINI_API_KEY="AIzaSy..." (Do NOT prefix with VITE_).',
  '',
  '  2. APP_URL (SaaS Router Utility)',
  '     - Function: Automatically routes dynamic QR codes and evaluation gateways to the current site origin.',
  '     - Format: APP_URL="https://your-platform-domain.run.app"',
  '',
  '  3. Yemen Mobile Wallet Merchant Settings (Financial SaaS Gateway)',
  '     - Function: Coordinates premium subscription payments via regional wallets.',
  '     - JAWALI_WALLET_NUMBER: Merchant phone number for Jawali (e.g. 770001234).',
  '     - JAWALI_MERCHANT_ID: Unique Jawali integration token (e.g. MERCH-JAW-9988).',
  '     - JEEB_WALLET_NUMBER: Merchant phone number for Jeeb (e.g. 780005678).',
  '     - JEEB_MERCHANT_ID: Unique Jeeb integration token (e.g. MERCH-JEE-5544).'
];

yOffset = 35;
p3_text.forEach(line => {
  doc.text(line, 15, yOffset);
  yOffset += 7.5;
});

doc.text('Page 3 of 4', 180, 270);

// ----------------------------------------------------
// PAGE 4: DETAILED USER STEPS & LOGS
// ----------------------------------------------------
doc.addPage();
drawHeader('4. STEP-BY-STEP PLATFORM USER GUIDE', 20);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(textColor[0], textColor[1], textColor[2]);

let p4_text = [
  'Follow this operational outline to maximize the potential of the AURA platform:',
  '',
  'Step 1: Accessing the Portal',
  '  Open the main domain. Input authorized credentials (default credentials can be used or customized via',
  '  the user administration view). Select your institutional workspace (e.g., Oxford Global College).',
  '',
  'Step 2: Designing an Evaluation Form Campaign',
  '  Navigate to the "Evaluation Forms & Campaigns" tab in the left sidebar. Fill in the campaign parameters',
  '  (target lecturers, rating scales like Likert/Stars, and lock mechanisms). Set an active window schedule,',
  '  and transition the status to "Active" to publish it.',
  '',
  'Step 3: Simulating and Receiving Student Submissions',
  '  Instructors can display the generated QR code or copy the Short Link on the projector. Students input the',
  '  code in the Gateway sub-tab or load the link on their mobile devices to submit anonymous evaluations.',
  '',
  'Step 4: AI Audits & Compliance Reviews',
  '  Visit the "AI Compliance Advisor" or "Quality Evaluations" section. The platform feeds raw, isolated',
  '  metrics to the integrated Gemini model to automatically draft regional corrective actions, program self-studies,',
  '  and accreditation readiness scores without exporting sensitive student records.'
];

yOffset = 35;
p4_text.forEach(line => {
  doc.text(line, 15, yOffset);
  yOffset += 7.5;
});

doc.setFont('Helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.text('AURA Quality Management Suite — Enterprise SaaS Edition © 2026', 15, 255);

doc.text('Page 4 of 4', 180, 270);

// Output the generated PDF to a file
const pdfOutput = doc.output('arraybuffer');
fs.writeFileSync('./AURA_PLATFORM_MANUAL.pdf', Buffer.from(pdfOutput));
console.log('PDF Manual generated successfully as AURA_PLATFORM_MANUAL.pdf');
