/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Save, Sparkles, Plus, AlertCircle, Trash2, CheckCircle } from 'lucide-react';

export const SettingsPanelView: React.FC = () => {
  const {
    language,
    activeInstitution,
    institutions,
    addNewInstitution,
    resetAllData,
    actingRole,
    t
  } = useApp();

  // Institution edit states
  const [instName, setInstName] = useState(activeInstitution.name);
  const [instNameAr, setInstNameAr] = useState(activeInstitution.arabicName);
  const [instDomain, setInstDomain] = useState(activeInstitution.domain);
  const [instPrimaryColor, setInstPrimaryColor] = useState(activeInstitution.primaryColor);
  const [instSecondaryColor, setInstSecondaryColor] = useState(activeInstitution.secondaryColor);
  
  // New Tenant Provisioner Form States
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantNameAr, setNewTenantNameAr] = useState('');
  const [newTenantLogo, setNewTenantLogo] = useState('🎓');
  const [newTenantDomain, setNewTenantDomain] = useState('');
  const [newTenantPrimary, setNewTenantPrimary] = useState('#0f172a');
  const [newTenantSecondary, setNewTenantSecondary] = useState('#3b82f6');
  const [newTenantAccreditation, setNewTenantAccreditation] = useState<'Accredited' | 'Conditional' | 'Under Review'>('Accredited');

  const [showProvisionForm, setShowProvisionForm] = useState(false);
  const [successAlert, setSuccessAlert] = useState('');

  const handleProvisionTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantDomain) return;

    const arabicStatusMap = {
      'Accredited': 'معتمدة',
      'Conditional': 'اعتماد مشروط',
      'Under Review': 'تحت المراجعة'
    };

    addNewInstitution({
      name: newTenantName,
      arabicName: newTenantNameAr || newTenantName,
      logo: newTenantLogo,
      domain: newTenantDomain.toLowerCase(),
      primaryColor: newTenantPrimary,
      secondaryColor: newTenantSecondary,
      studentCount: 5000,
      facultyCount: 300,
      activePrograms: 0,
      accreditationStatus: newTenantAccreditation,
      arabicAccreditationStatus: arabicStatusMap[newTenantAccreditation]
    });

    setNewTenantName('');
    setNewTenantNameAr('');
    setNewTenantLogo('🎓');
    setNewTenantDomain('');
    setShowProvisionForm(false);
    setSuccessAlert(t('tenantCreated'));
    setTimeout(() => setSuccessAlert(''), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="settings-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
        <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
            <Settings className="w-7 h-7 text-indigo-500" />
            <span>{t('settingsTitle')}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">{t('settingsSubtitle')}</p>
        </div>
      </div>

      {/* Success alert */}
      {successAlert && (
        <div id="settings-success-alert" className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{successAlert}</span>
        </div>
      )}

      {/* Bento split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Isolated Tenant Configuration (Institution Admin edit) */}
        <div className="lg:col-span-2 space-y-6" id="settings-tenant-customizer">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
              <h3 className="text-md font-extrabold text-slate-900 dark:text-white">
                {t('institutionDetails')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Branding parameters isolated on the active server node.</p>
            </div>

            {/* Read-only profile view with brand color previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-bold text-slate-400">Tenant Identifier</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-850 text-xs font-mono dark:text-white">
                  {activeInstitution.id}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-slate-400">{t('domainLabel')}</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-850 text-xs font-mono dark:text-white">
                  {activeInstitution.domain}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-bold text-slate-400">Institutional Title (English)</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-850 text-xs font-semibold dark:text-white">
                  {activeInstitution.name}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-slate-400">Institutional Title (Arabic)</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-850 text-xs font-semibold dark:text-white text-right">
                  {activeInstitution.arabicName}
                </div>
              </div>
            </div>

            {/* Brand Theme Displays */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs uppercase font-bold text-slate-400">{t('brandTheme')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg shadow-inner flex-shrink-0" 
                    style={{ backgroundColor: activeInstitution.primaryColor }}
                  ></div>
                  <div>
                    <span className="text-xs font-semibold block">{t('primaryColor')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{activeInstitution.primaryColor}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg shadow-inner flex-shrink-0" 
                    style={{ backgroundColor: activeInstitution.secondaryColor }}
                  ></div>
                  <div>
                    <span className="text-xs font-semibold block">{t('secondaryColor')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{activeInstitution.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Super Admin - Deploy New Partner Tenant */}
        <div className="lg:col-span-1 space-y-6" id="settings-saas-provisioner">
          {/* Active Tenant Counts */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles className="w-32 h-32" />
            </div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-300 block mb-1">
              SaaS Scale Registry
            </span>
            <h4 className="text-lg font-black text-white">SaaS Active Nodes</h4>
            
            <div className="mt-4 flex items-center justify-between text-xs border-b border-white/10 pb-3">
              <span className="text-white/60">Institutions Deployed</span>
              <span className="font-mono font-black">{institutions.length}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-white/60">Total SaaS Users</span>
              <span className="font-mono font-black">4,200+ Accounts</span>
            </div>
          </div>

          {/* Provisioning Form */}
          {['Platform Admin', 'Super Admin'].includes(actingRole) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                  <Plus className="w-4 h-4 text-indigo-500" />
                  <span>{t('createNewTenant')}</span>
                </h4>
              </div>

              <form onSubmit={handleProvisionTenant} id="saas-tenant-provision-form" className="space-y-3.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">{t('tenantName')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cambridge Global College"
                    value={newTenantName}
                    onChange={e => setNewTenantName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">{t('tenantNameAr')}</label>
                  <input
                    type="text"
                    placeholder="مثال: معهد كامبريدج العالمي"
                    value={newTenantNameAr}
                    onChange={e => setNewTenantNameAr(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white text-right"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">{t('tenantDomain')}</label>
                  <input
                    type="text"
                    required
                    placeholder="cambridge.global.edu"
                    value={newTenantDomain}
                    onChange={e => setNewTenantDomain(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500">Primary Color</label>
                    <input
                      type="color"
                      value={newTenantPrimary}
                      onChange={e => setNewTenantPrimary(e.target.value)}
                      className="w-full h-8 rounded border bg-transparent p-0 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500">Secondary Color</label>
                    <input
                      type="color"
                      value={newTenantSecondary}
                      onChange={e => setNewTenantSecondary(e.target.value)}
                      className="w-full h-8 rounded border bg-transparent p-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">{t('accreditedPrograms')}</label>
                  <select
                    value={newTenantAccreditation}
                    onChange={e => setNewTenantAccreditation(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                  >
                    <option value="Accredited">Accredited</option>
                    <option value="Conditional">Conditional</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-md transition-all mt-2"
                >
                  Deploy Tenant Sandbox
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
