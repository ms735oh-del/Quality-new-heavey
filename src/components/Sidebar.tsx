/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck,
  Building2,
  TrendingUp,
  FileKey,
  Settings,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  Laptop,
  CheckCircle,
  Activity,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Link,
  Code,
  Sparkles,
  BookOpenCheck,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    activeInstitution,
    setActiveInstitution,
    institutions,
    actingRole,
    setActingRole,
    currentUser,
    resetAllData,
    logout,
    t
  } = useApp();

  const [tenantOpen, setTenantOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  // Define roles list for easy demo swapping
  const ALL_ROLES: UserRole[] = [
    'Super Admin',
    'Platform Admin',
    'Institution Admin',
    'Quality Manager',
    'Quality Coordinator',
    'Auditor',
    'Dean',
    'Department Head',
    'Program Coordinator',
    'Lecturer',
    'Student',
    'External Reviewer',
    'Guest'
  ];

  // RBAC Permission check for navigation items
  const canAccessTab = (tab: string): boolean => {
    if (actingRole === 'Platform Admin' || actingRole === 'Super Admin') {
      return true;
    }
    switch (tab) {
      case 'super-admin':
        return actingRole === 'Super Admin' || actingRole === 'Platform Admin';
      case 'temp-links':
        return ['Super Admin', 'Platform Admin', 'Institution Admin', 'Quality Manager'].includes(actingRole);
      case 'api-platform':
        return ['Super Admin', 'Platform Admin', 'Institution Admin', 'Quality Manager'].includes(actingRole);
      case 'dashboard':
        return true;
      case 'ai-insights':
        return ['Super Admin', 'Platform Admin', 'Institution Admin', 'Quality Manager', 'Dean', 'Department Head', 'Program Coordinator'].includes(actingRole);
      case 'academics-directory':
        return true;
      case 'quality-evaluations':
        return true;
      case 'ops-risk':
        return true;
      case 'comms-reports':
        return true;
      case 'programs':
        return ['Institution Admin', 'Dean', 'Department Head', 'Program Coordinator', 'Lecturer', 'Student'].includes(actingRole);
      case 'selfStudy':
        return ['Institution Admin', 'Dean', 'Department Head', 'Program Coordinator', 'Lecturer', 'External Reviewer'].includes(actingRole);
      case 'externalAudits':
        return ['Institution Admin', 'Dean', 'Department Head', 'External Reviewer'].includes(actingRole);
      case 'kpiTracker':
        return true; // Everyone can see KPIs
      case 'securityLogs':
        return ['Platform Admin', 'Institution Admin', 'Super Admin'].includes(actingRole);
      case 'settings':
        return ['Platform Admin', 'Institution Admin', 'Super Admin'].includes(actingRole);
      case 'user-manual':
        return true; // Everyone can access the user manual
      default:
        return false;
    }
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'user-manual', label: language === 'ar' ? 'دليل الاستخدام والتشغيل' : 'User Guide & Manual', icon: BookOpenCheck },
    { id: 'ai-insights', label: language === 'ar' ? 'التحليلات الاستشارية الذكية' : 'AI Strategic Insights', icon: Sparkles },
    { id: 'super-admin', label: language === 'ar' ? 'بوابة المشرف العام' : 'Super Admin Suite', icon: ShieldCheck },
    { id: 'temp-links', label: language === 'ar' ? 'روابط التقييم المؤقتة' : 'Temporary Link Portal', icon: Link },
    { id: 'api-platform', label: language === 'ar' ? 'منصة المطورين والـ API' : 'Developer API Hub', icon: Code },
    { id: 'academics-directory', label: language === 'ar' ? 'دليل الكليات والمساقات' : 'Academics Directory', icon: GraduationCap },
    { id: 'quality-evaluations', label: language === 'ar' ? 'التقييمات وضمان الجودة' : 'Evaluations & Standards', icon: FileCheck },
    { id: 'ops-risk', label: language === 'ar' ? 'العمليات والمخاطر والـ CAPA' : 'Operations & Risk', icon: AlertTriangle },
    { id: 'comms-reports', label: language === 'ar' ? 'التحليلات والمحاكاة والاتصال' : 'Executive BI & Comms', icon: TrendingUp },
    { id: 'programs', label: t('programs'), icon: GraduationCap },
    { id: 'selfStudy', label: t('selfStudy'), icon: FileCheck },
    { id: 'externalAudits', label: t('externalAudits'), icon: Building2 },
    { id: 'kpiTracker', label: t('kpiTracker'), icon: TrendingUp },
    { id: 'securityLogs', label: t('securityLogs'), icon: FileKey },
    { id: 'settings', label: t('settings'), icon: Settings }
  ];

  const filteredNavItems = navItems.filter(item => canAccessTab(item.id));

  // Determine indicator badges for institution accreditation status
  const getAccreditationBadge = (status: string) => {
    switch (status) {
      case 'Accredited':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'Under Review':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'Conditional':
      default:
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    }
  };

  return (
    <div 
      id="app-sidebar"
      className={`w-64 flex-shrink-0 bg-slate-950 text-slate-300 flex flex-col justify-between ${
        language === 'ar' ? 'border-l border-slate-850' : 'border-r border-slate-850'
      }`}
    >
      <div className="overflow-y-auto flex-1">
        {/* Banner Logo */}
        <div className="p-6 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm shadow-blue-500/20">A</div>
            <div>
              <h1 className="font-bold leading-none text-sm text-white">AURA Quality</h1>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-0.5">Enterprise SaaS</span>
            </div>
          </div>
          {/* Quick Language Toggle */}
          <button 
            id="lang-toggle-btn"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-medium">{language === 'en' ? 'AR' : 'EN'}</span>
          </button>
        </div>

        {/* Tenant (Institution) Selector */}
        <div className="p-4 border-b border-slate-850 relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-slate-500 font-medium block uppercase tracking-wider">
              {t('institutionLabel')}
            </label>
            {!['Super Admin', 'Platform Admin'].includes(actingRole) && (
              <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 font-black border border-emerald-500/20 uppercase">
                {language === 'ar' ? 'معزول' : 'Isolated'}
              </span>
            )}
          </div>
          <button
            id="tenant-dropdown-trigger"
            disabled={!['Super Admin', 'Platform Admin'].includes(actingRole)}
            onClick={() => setTenantOpen(!tenantOpen)}
            className={`w-full flex items-center justify-between bg-slate-900 text-white rounded-lg p-2.5 text-xs font-semibold transition-all border border-slate-800 ${
              ['Super Admin', 'Platform Admin'].includes(actingRole) 
                ? 'hover:bg-slate-850 cursor-pointer' 
                : 'opacity-90 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-lg flex-shrink-0">{activeInstitution.logo}</span>
              <span className="truncate">
                {language === 'ar' ? activeInstitution.arabicName : activeInstitution.name}
              </span>
            </div>
            {['Super Admin', 'Platform Admin'].includes(actingRole) ? (
              <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
            ) : (
              <span className="text-xs text-emerald-500 font-bold">🔒</span>
            )}
          </button>

          {tenantOpen && ['Super Admin', 'Platform Admin'].includes(actingRole) && (
            <div id="tenant-dropdown-list" className="absolute left-4 right-4 mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden">
              {institutions.map(inst => (
                <button
                  key={inst.id}
                  id={`tenant-select-${inst.id}`}
                  onClick={() => {
                    setActiveInstitution(inst.id);
                    setTenantOpen(false);
                  }}
                  className={`w-full text-start px-4 py-2.5 text-xs flex items-center gap-2.5 hover:bg-slate-800 transition-colors cursor-pointer ${
                    activeInstitution.id === inst.id ? 'bg-slate-850 font-bold text-blue-400' : 'text-slate-300'
                  }`}
                >
                  <span className="text-lg">{inst.logo}</span>
                  <div className="truncate">
                    <p className="font-medium truncate">{language === 'ar' ? inst.arabicName : inst.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{inst.domain}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Accreditation Ribbon */}
          <div className="mt-2.5 flex items-center justify-between text-xs p-2 rounded bg-slate-950/40 border border-slate-900/50">
            <span className="text-slate-500 font-medium text-[11px]">{t('accreditedPrograms')}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getAccreditationBadge(activeInstitution.accreditationStatus)}`}>
              {language === 'ar' ? activeInstitution.arabicAccreditationStatus : activeInstitution.accreditationStatus}
            </span>
          </div>
        </div>

        {/* Role Access Simulator (RBAC Controller) */}
        <div className="p-4 border-b border-slate-850 relative bg-slate-950/20">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>RBAC Simulator</span>
            </label>
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-indigo-500/10 text-indigo-300 font-black border border-indigo-500/20">
              Active
            </span>
          </div>
          <button
            id="role-dropdown-trigger"
            onClick={() => setRoleOpen(!roleOpen)}
            className="w-full flex items-center justify-between bg-indigo-950/20 hover:bg-indigo-900/20 text-slate-300 rounded-lg p-2 text-xs font-medium transition-all border border-indigo-950/50 cursor-pointer"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-lg flex-shrink-0">{currentUser?.avatar || '👤'}</span>
              <div className="truncate text-start">
                <p className="font-bold text-indigo-200 text-[11px] truncate">
                  {language === 'ar' ? currentUser?.arabicName : currentUser?.name}
                </p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{actingRole}</p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          </button>

          {roleOpen && (
            <div id="role-dropdown-list" className="absolute left-4 right-4 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
              <div className="p-2 bg-slate-950 text-[10px] text-slate-400 font-semibold border-b border-slate-850">
                {t('changeRoleDesc')}
              </div>
              {ALL_ROLES.map(role => (
                <button
                  key={role}
                  id={`role-select-${role.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => {
                    setActingRole(role);
                    setRoleOpen(false);
                  }}
                  className={`w-full text-start px-4 py-2 text-xs hover:bg-slate-800 transition-colors cursor-pointer ${
                    actingRole === role ? 'bg-indigo-950/50 text-indigo-300 font-bold' : 'text-slate-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Navigation Menu */}
        <nav className="py-4" id="sidebar-nav">
          <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {language === 'ar' ? 'الإدارة والجودة' : 'Management'}
          </div>
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all border-s-4 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border-blue-500 font-bold'
                    : 'text-slate-400 border-transparent hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls: Themes, Reset & Safety */}
      <div className="p-4 border-t border-slate-850 bg-slate-950/20 space-y-4">
        {/* Tenant Status Details Card */}
        <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tenant Isolation</span>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          </div>
          <p className="text-xs font-bold text-white truncate">
            {language === 'ar' ? activeInstitution.arabicName : activeInstitution.name}
          </p>
          <p className="text-[10px] text-slate-600 mt-1 font-mono">Cloud Firestore: US-EAST-1</p>
        </div>

        <div className="flex items-center justify-between gap-1">
          {/* Theme Selector Toggle */}
          <div className="flex bg-slate-900 border border-slate-850 rounded-lg p-1 w-full justify-between items-center">
            <button
              id="theme-light-btn"
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded flex-1 flex justify-center text-xs transition-colors cursor-pointer ${
                theme === 'light' ? 'bg-slate-800 text-white font-bold shadow' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              id="theme-dark-btn"
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded flex-1 flex justify-center text-xs transition-colors cursor-pointer ${
                theme === 'dark' ? 'bg-slate-800 text-white font-bold shadow' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              id="theme-auto-btn"
              onClick={() => setTheme('auto')}
              className={`p-1.5 rounded flex-1 flex justify-center text-xs transition-colors cursor-pointer ${
                theme === 'auto' ? 'bg-slate-800 text-white font-bold shadow' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Auto Match System Theme"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Database Clear Button */}
        <button
          id="system-reset-data-btn"
          onClick={() => {
            if (confirm(language === 'ar' ? 'هل أنت متأكد من مسح جميع البيانات واستعادة البذور الأصلية؟' : 'Are you sure you want to reset all data back to the default original seed?')) {
              resetAllData();
            }
          }}
          className="w-full text-slate-500 hover:text-red-400 border border-slate-900 hover:border-red-950/20 rounded-lg py-2 text-[10px] font-mono transition-all flex items-center justify-center gap-1.5 hover:bg-red-950/10 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('resetDb')}</span>
        </button>

        {/* Secure Logout Button */}
        <button
          id="logout-btn"
          onClick={logout}
          className="w-full text-slate-500 hover:text-rose-400 border border-slate-900 hover:border-rose-950/20 rounded-lg py-2.5 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 hover:bg-rose-950/10 cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          <span>{language === 'ar' ? 'تسجيل الخروج الآمن' : 'Secure Logout'}</span>
        </button>

        {/* Secured Label */}
        <div className="text-center text-[10px] text-slate-650 font-mono select-none">
          {t('allRightsReserved')}
        </div>
      </div>
    </div>
  );
};
