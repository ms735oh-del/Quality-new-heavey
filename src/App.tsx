/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AcademicsDirectoryView } from './components/AcademicsDirectoryView';
import { QualityEvaluationsView } from './components/QualityEvaluationsView';
import { OperationsRiskView } from './components/OperationsRiskView';
import { CommsReportsHubView } from './components/CommsReportsHubView';
import { QualityReviewView } from './components/QualityReviewView';
import { SelfStudyFormView } from './components/SelfStudyFormView';
import { SiteVisitAuditsView } from './components/SiteVisitAuditsView';
import { KPIAnalyticsView } from './components/KPIAnalyticsView';
import { AuditLogView } from './components/AuditLogView';
import { SettingsPanelView } from './components/SettingsPanelView';
import { SuperAdminView } from './components/SuperAdminView';
import { TempEvaluationLinksView } from './components/TempEvaluationLinksView';
import { APIPlatformView } from './components/APIPlatformView';
import { AIInsightsView } from './components/AIInsightsView';
import { UserManualView } from './components/UserManualView';
import { StandaloneEvaluationView } from './components/StandaloneEvaluationView';
import { LoginView } from './components/LoginView';
import { ShieldAlert } from 'lucide-react';

function AppContent() {
  const { language, activeInstitution, isAuthenticated, login, currentUser, actingRole, updateInstitution } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  // SaaS Yemen Wallet settings state
  const [walletSettings, setWalletSettings] = useState<any>({
    JAWALI_WALLET_NUMBER: '770001234',
    JAWALI_ACCOUNT_NAME: 'Aura Quality SaaS Hub (Jawali)',
    JAWALI_MERCHANT_ID: 'MERCH-JAW-9988',
    JEEB_WALLET_NUMBER: '780005678',
    JEEB_ACCOUNT_NAME: 'Aura Quality SaaS Hub (Jeeb)',
    JEEB_MERCHANT_ID: 'MERCH-JEE-5544'
  });

  const [paymentForm, setPaymentForm] = useState({
    plan: 'Professional',
    walletType: 'Jawali' as 'Jawali' | 'Jeeb',
    amount: 2499,
    transactionNumber: '',
    proofImage: ''
  });

  const [dragActive, setDragActive] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load wallet configurations from environment via backend proxy
    fetch('/api/saas/wallet-settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setWalletSettings(data.settings);
        }
      })
      .catch(err => console.error('Failed to load wallet configuration:', err));
  }, []);

  const handlePlanChange = (p: string) => {
    const cost = p === 'Enterprise' ? 4999 : p === 'Professional' ? 2499 : p === 'Basic' ? 999 : 0;
    setPaymentForm(prev => ({ ...prev, plan: p, amount: cost }));
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
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentForm(prev => ({ ...prev, proofImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentForm(prev => ({ ...prev, proofImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.transactionNumber || !paymentForm.proofImage) {
      alert(language === 'ar' ? 'الرجاء إدخال رقم العملية وصورة إثبات الدفع.' : 'Please enter transaction number and upload payment proof.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/saas/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionId: activeInstitution.id,
          institutionName: activeInstitution.name,
          plan: paymentForm.plan,
          amount: paymentForm.amount,
          walletType: paymentForm.walletType,
          transactionNumber: paymentForm.transactionNumber,
          proofImage: paymentForm.proofImage
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPaymentSuccess(true);
          // Update local storage representation to reflect Pending Payment immediately
          const updatedInst = {
            ...activeInstitution,
            subscriptionStatus: 'Pending Payment' as const,
            subscriptionTier: paymentForm.plan as any
          };
          updateInstitution(updatedInst);
        }
      } else {
        alert('Server connection error. Please try again.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Routing Detection for public evaluation links
  const getEvalCodeFromURL = () => {
    const pathParts = window.location.pathname.split('/');
    const evalIdx = pathParts.indexOf('eval');
    if (evalIdx !== -1 && pathParts[evalIdx + 1]) {
      return pathParts[evalIdx + 1].trim().toUpperCase();
    }
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code') || params.get('eval');
    if (codeParam) {
      return codeParam.trim().toUpperCase();
    }
    const hash = window.location.hash;
    if (hash) {
      const cleanHash = hash.replace('#', '');
      if (cleanHash.startsWith('eval/')) {
        return cleanHash.split('/')[1]?.trim().toUpperCase();
      }
      if (cleanHash.length >= 6 && cleanHash.includes('-')) {
        return cleanHash.trim().toUpperCase();
      }
    }
    return '';
  };

  const evalCode = getEvalCodeFromURL();
  if (evalCode) {
    return <StandaloneEvaluationView code={evalCode} />;
  }

  // Check authentication
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={login} />;
  }

  // Define RBAC and Tenant security verification guards
  const canAccessTab = (tab: string, role: string): boolean => {
    if (role === 'Platform Admin' || role === 'Super Admin') {
      return true;
    }
    switch (tab) {
      case 'super-admin':
        return role === 'Super Admin' || role === 'Platform Admin';
      case 'temp-links':
        return ['Super Admin', 'Platform Admin', 'Institution Admin', 'Quality Manager'].includes(role);
      case 'api-platform':
        return ['Super Admin', 'Platform Admin', 'Institution Admin', 'Quality Manager'].includes(role);
      case 'dashboard':
        return true;
      case 'ai-insights':
        return ['Super Admin', 'Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean', 'Department Head', 'Program Coordinator'].includes(role);
      case 'academics-directory':
        return true;
      case 'quality-evaluations':
        return true;
      case 'ops-risk':
        return true;
      case 'comms-reports':
        return true;
      case 'programs':
        return ['Institution Admin', 'Dean', 'Department Head', 'Program Coordinator', 'Lecturer', 'Student'].includes(role);
      case 'selfStudy':
        return ['Institution Admin', 'Dean', 'Department Head', 'Program Coordinator', 'Lecturer', 'External Reviewer'].includes(role);
      case 'externalAudits':
        return ['Institution Admin', 'Dean', 'Department Head', 'External Reviewer'].includes(role);
      case 'kpiTracker':
        return true;
      case 'securityLogs':
        return ['Platform Admin', 'Institution Admin', 'Super Admin'].includes(role);
      case 'settings':
        return ['Platform Admin', 'Institution Admin', 'Super Admin'].includes(role);
      case 'user-manual':
        return true;
      default:
        return false;
    }
  };

  const isPlatformManager = actingRole === 'Platform Admin' || actingRole === 'Super Admin';
  // Enforce true tenant-ownership data-isolation guard
  const hasTenantOwnership = isPlatformManager || currentUser.institutionId === activeInstitution.id;
  const isAuthorized = canAccessTab(activeTab, actingRole) && hasTenantOwnership;

  // Subscription Restriction Logic
  const subStatus = activeInstitution.subscriptionStatus || 'Active';
  const isRestricted = !isPlatformManager && (subStatus !== 'Active') && activeTab !== 'settings';

  const renderActiveView = () => {
    if (isRestricted) {
      return (
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-500/10 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-amber-500 p-8 text-white relative">
              <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                SaaS System Restriction
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {language === 'ar' ? 'تم تقييد الوصول للمؤسسة' : 'Tenant Access Restricted'}
              </h1>
              <p className="mt-2 text-rose-100 max-w-2xl text-sm md:text-base leading-relaxed">
                {language === 'ar' 
                  ? `حالة الاشتراك الحالية: [${subStatus === 'Pending Payment' ? 'بانتظار موافقة الإدارة' : subStatus}]. يرجى إتمام عملية الدفع وتنشيط الباقة للاستفادة الكاملة من ميزات النظام.` 
                  : `Subscription status is currently [${subStatus}]. To unlock the system modules, please select your plan, complete the transfer, and upload the payment proof.`}
              </p>
            </div>

            {paymentSuccess || subStatus === 'Pending Payment' ? (
              <div className="p-10 text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-amber-500/10 text-amber-500 flex items-center justify-center rounded-full border border-amber-500/20">
                  <ShieldAlert size={40} className="animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">
                    {language === 'ar' ? 'بانتظار موافقة مدير النظام' : 'Payment Proof Submitted'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm md:text-base leading-relaxed">
                    {language === 'ar'
                      ? 'تم تسجيل معاملتك بنجاح برقم المعرف الخاص بها وهي قيد المراجعة والتدقيق المالي الآن. سيتم التنشيط التلقائي فور الموافقة.'
                      : 'Your wallet transfer proof has been logged and is currently being audited by the Platform Administrator. Your account will unlock automatically upon approval.'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-left max-w-xs mx-auto font-mono text-slate-500 space-y-1">
                  <div>TENANT_ID: {activeInstitution.id}</div>
                  <div>PROPOSED_PLAN: {paymentForm.plan}</div>
                  <div>TXN_NUMBER: {paymentForm.transactionNumber}</div>
                  <div>STATUS: PENDING_VERIFICATION</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Select Plan & Price Details */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                      {language === 'ar' ? '1. اختيار باقة الاشتراك' : '1. Select Subscription Plan'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {['Basic', 'Professional', 'Enterprise'].map(plan => (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => handlePlanChange(plan)}
                          className={`p-4 rounded-2xl text-left border transition-all relative ${
                            paymentForm.plan === plan
                              ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900'
                          }`}
                        >
                          <div className="font-bold text-sm">{plan}</div>
                          <div className="text-lg font-extrabold mt-1">
                            {plan === 'Basic' ? '$999' : plan === 'Professional' ? '$2,499' : '$4,999'}
                            <span className="text-xs font-normal text-slate-400">/yr</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                        {language === 'ar' ? '2. اختيار محفظة الدفع اليمنية' : '2. Choose Yemen Wallet'}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {['Jawali', 'Jeeb'].map(wallet => (
                          <button
                            key={wallet}
                            type="button"
                            onClick={() => setPaymentForm(prev => ({ ...prev, walletType: wallet as any }))}
                            className={`py-3 rounded-xl font-semibold border transition-all ${
                              paymentForm.walletType === wallet
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {wallet === 'Jawali' ? 'Jawali (جوالي)' : 'Jeeb (جيب)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Wallet Instructions Box */}
                    <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-3">
                      <div className="text-sm font-bold text-indigo-500">
                        {language === 'ar' ? 'معلومات التحويل الرسمية' : 'Official Transfer Instructions'}
                      </div>
                      <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                        <div>
                          <strong>{language === 'ar' ? 'رقم المحفظة:' : 'Wallet Number:'}</strong>{' '}
                          <span className="font-mono bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded text-indigo-600">
                            {paymentForm.walletType === 'Jawali' ? walletSettings.JAWALI_WALLET_NUMBER : walletSettings.JEEB_WALLET_NUMBER}
                          </span>
                        </div>
                        <div>
                          <strong>{language === 'ar' ? 'اسم الحساب:' : 'Account Name:'}</strong>{' '}
                          <span>{paymentForm.walletType === 'Jawali' ? walletSettings.JAWALI_ACCOUNT_NAME : walletSettings.JEEB_ACCOUNT_NAME}</span>
                        </div>
                        <div>
                          <strong>{language === 'ar' ? 'معرف التاجر:' : 'Merchant ID:'}</strong>{' '}
                          <span className="font-mono text-slate-500">{paymentForm.walletType === 'Jawali' ? walletSettings.JAWALI_MERCHANT_ID : walletSettings.JEEB_MERCHANT_ID}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission and Proof Upload Box */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                      {language === 'ar' ? '3. بيانات إثبات الحوالة' : '3. Transaction Proof Details'}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                          {language === 'ar' ? 'المبلغ المحول ($)' : 'Transfer Amount ($)'}
                        </label>
                        <input
                          type="number"
                          value={paymentForm.amount}
                          readOnly
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 font-mono text-slate-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                          {language === 'ar' ? 'رقم عملية التحويل (TXN)' : 'Transaction Number (TXN)'}
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentForm.transactionNumber}
                          onChange={e => setPaymentForm(prev => ({ ...prev, transactionNumber: e.target.value }))}
                          placeholder="TXN-XXXXXX"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Drag and Drop Box */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                          {language === 'ar' ? 'صورة إشعار/إثبات الدفع' : 'Payment Receipt Notification (Image)'}
                        </label>
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
                            dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {paymentForm.proofImage ? (
                            <div className="space-y-2">
                              <img src={paymentForm.proofImage} alt="Receipt proof" className="mx-auto max-h-32 rounded-lg border object-cover" />
                              <p className="text-xs text-indigo-500 font-bold">{language === 'ar' ? 'تم اختيار صورة الإشعار' : 'Receipt Image Attached'}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-2xl text-slate-400">📁</div>
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                {language === 'ar' ? 'اسحب وأفلت صورة الإشعار هنا أو انقر للاختيار' : 'Drag & drop payment receipt here, or click to select'}
                              </p>
                              <p className="text-[10px] text-slate-400">Supports JPG, PNG, WEBP (Max 5MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting 
                        ? (language === 'ar' ? 'جاري إرسال المعاملة...' : 'Sending Proof...') 
                        : (language === 'ar' ? 'إرسال إثبات الدفع لتنشيط الباقة' : 'Submit Transfer Proof & Activate')}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      );
    }

    if (!isAuthorized) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-rose-500/20 shadow-xl max-w-2xl mx-auto space-y-6">
          <div className="p-4 bg-rose-500/10 rounded-full text-rose-500 border border-rose-500/20">
            <ShieldAlert size={48} className="animate-bounce" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold font-sans text-rose-600 dark:text-rose-400">
              {language === 'ar' ? 'خطأ 403: الوصول غير مصرح به' : '403 Forbidden Access'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm md:text-base">
              {language === 'ar' 
                ? 'تمنع سياسة الأمان وجدار الحماية المعزول حسابك من عرض هذه الصفحة أو التفاعل مع بياناتها.' 
                : 'Security policy and multi-tenant isolation protocols prevent your account from accessing this workspace or querying its records.'}
            </p>
          </div>

          <div className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-left font-mono text-xs text-slate-500 space-y-1 max-w-md mx-auto border border-slate-100 dark:border-slate-800">
            <div><span className="text-indigo-500">REQUEST_PATH:</span> /{activeTab}</div>
            <div><span className="text-indigo-500">USER_EMAIL:</span> {currentUser.email}</div>
            <div><span className="text-indigo-500">USER_ROLE:</span> {actingRole}</div>
            <div><span className="text-indigo-500">TENANT_ID:</span> {activeInstitution.id}</div>
            <div><span className="text-indigo-500">OWNER_TENANT:</span> {currentUser.institutionId}</div>
            <div><span className="text-indigo-500">SECURITY_GUARD:</span> FAILED_RBAC_OR_TENANT_MISMATCH</div>
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:opacity-90 transition shadow-md active:scale-95"
          >
            {language === 'ar' ? 'العودة للوحة التحكم الرئيسية' : 'Return to Safe Area'}
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'user-manual':
        return <UserManualView />;
      case 'ai-insights':
        return <AIInsightsView />;
      case 'super-admin':
        return <SuperAdminView />;
      case 'temp-links':
        return <TempEvaluationLinksView />;
      case 'api-platform':
        return <APIPlatformView />;
      case 'academics-directory':
        return <AcademicsDirectoryView />;
      case 'quality-evaluations':
        return <QualityEvaluationsView />;
      case 'ops-risk':
        return <OperationsRiskView />;
      case 'comms-reports':
        return <CommsReportsHubView />;
      case 'programs':
        return <QualityReviewView />;
      case 'selfStudy':
        return <SelfStudyFormView />;
      case 'externalAudits':
        return <SiteVisitAuditsView />;
      case 'kpiTracker':
        return <KPIAnalyticsView />;
      case 'securityLogs':
        return <AuditLogView />;
      case 'settings':
        return <SettingsPanelView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300"
    >
      {/* SaaS Sidebar Panel */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Client Workspace Area */}
        <div className="p-6 md:p-10 max-w-7xl w-full mx-auto space-y-6">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
