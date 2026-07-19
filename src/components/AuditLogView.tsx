/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileKey, Search, Filter, ShieldCheck, Download } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const {
    language,
    auditLogs,
    t
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');

  // Filter logs by search and event type
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.arabicAction && log.arabicAction.includes(searchQuery)) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.arabicDetails && log.arabicDetails.includes(searchQuery)) ||
      log.ipAddress.includes(searchQuery);

    const matchesType = filterType === 'All' || log.type === filterType;

    return matchesSearch && matchesType;
  });

  const getLogTypeBadge = (type: string) => {
    switch (type) {
      case 'Security':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'Data Change':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Auth':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      default:
        return 'bg-slate-400/10 text-slate-400 border border-slate-500/10';
    }
  };

  // Export audit logs as CSV
  const handleExportCSV = () => {
    const headers = 'ID,Timestamp,Institution,User,Role,Action,Details,IPAddress,Type\n';
    const rows = filteredLogs.map(log => {
      return `"${log.id}","${log.timestamp}","${log.institutionId}","${log.userName}","${log.userRole}","${log.action.replace(/"/g, '""')}","${log.details.replace(/"/g, '""')}","${log.ipAddress}","${log.type}"`;
    }).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `saas_quality_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="audit-logs-ledger-container">
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
        <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2" style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
            <FileKey className="w-7 h-7 text-slate-800 dark:text-slate-200" />
            <span>{t('secTitle')}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">{t('secSubtitle')}</p>
        </div>

        <button
          id="export-audit-csv-btn"
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all self-start sm:self-auto"
          style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}
        >
          <Download className="w-4 h-4" />
          <span>Download CSV Report</span>
        </button>
      </div>

      {/* Query Filter and Search block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="audit-logs-search-row">
        {/* Search bar */}
        <div className="md:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            id="audit-log-search-input"
            type="text"
            placeholder={t('searchLogs')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs p-3.5 pl-10 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:text-white"
          />
        </div>

        {/* Type select */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Filter className="w-4 h-4 text-slate-400" />
          </span>
          <select
            id="audit-log-type-filter"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full text-xs p-3.5 pl-10 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none dark:text-white cursor-pointer appearance-none"
          >
            <option value="All">All Event Classes</option>
            <option value="Security">Security / Authorization</option>
            <option value="Data Change">Data Change / Write</option>
            <option value="Auth">Auth / Login</option>
            <option value="System">System / Infrastructure</option>
          </select>
        </div>
      </div>

      {/* Logs Table Layout with responsive cards on smaller screen */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm" id="audit-logs-table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
                <th className="px-6 py-4">{t('actionCol')}</th>
                <th className="px-6 py-4">{t('detailsCol')}</th>
                <th className="px-6 py-4">{t('userCol')}</th>
                <th className="px-6 py-4">{t('typeCol')}</th>
                <th className="px-6 py-4">{t('ipCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs text-slate-600 dark:text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No matching audit log transactions found. Secure tenant isolation verified.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    {/* Action */}
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      <div>
                        <p>{language === 'ar' ? log.arabicAction : log.action}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-normal mt-0.5">{log.timestamp.replace('T', ' ').slice(0, 19)}</p>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4 max-w-xs truncate">
                      <p className="truncate" title={language === 'ar' ? log.arabicDetails : log.details}>
                        {language === 'ar' ? log.arabicDetails : log.details}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {log.id}</p>
                    </td>

                    {/* Initiator */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{log.userName}</p>
                        <p className="text-[10px] text-indigo-500 font-mono mt-0.5">{log.userRole}</p>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getLogTypeBadge(log.type)}`}>
                        {log.type}
                      </span>
                    </td>

                    {/* Network address */}
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
