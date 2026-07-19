/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Code,
  Key,
  ShieldAlert,
  Terminal,
  Play,
  Send,
  CheckCircle,
  Copy,
  BookOpen,
  Sliders
} from 'lucide-react';

interface Credentials {
  apiKey: string;
  secretKey: string;
  jwtToken: string;
  rateLimit: string;
}

export const APIPlatformView: React.FC = () => {
  const { language, activeInstitution } = useApp();
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(false);

  // Playground interactive states
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/{institutionId}/statistics');
  const [headerInstId, setHeaderInstId] = useState(activeInstitution.id);
  const [headerApiKey, setHeaderApiKey] = useState('');
  const [headerAuth, setHeaderAuth] = useState('');
  
  // Response output states
  const [apiResponseStatus, setApiResponseStatus] = useState<number | null>(null);
  const [apiResponseHeaders, setApiResponseHeaders] = useState<string>('');
  const [apiResponseBody, setApiResponseBody] = useState<any>(null);
  const [runningRequest, setRunningRequest] = useState(false);

  // Notification toast
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/auth/credentials?institutionId=${activeInstitution.id}`);
      const data = await res.json();
      if (data.success) {
        setCredentials(data.credentials);
        setHeaderApiKey(data.credentials.apiKey);
        setHeaderAuth(`Bearer ${data.credentials.jwtToken}`);
      }
    } catch (e) {
      console.error('Error fetching credentials:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
    setHeaderInstId(activeInstitution.id);
  }, [activeInstitution]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRunRequest = async () => {
    setRunningRequest(true);
    setApiResponseStatus(null);
    setApiResponseBody(null);
    setApiResponseHeaders('');

    // Reconstruct URL based on selected endpoint
    const resolvedUrl = selectedEndpoint.replace('{institutionId}', headerInstId);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-institution-id': headerInstId
      };
      if (headerApiKey) headers['x-api-key'] = headerApiKey;
      if (headerAuth) headers['Authorization'] = headerAuth;

      const startTime = performance.now();
      const res = await fetch(resolvedUrl, { headers });
      const duration = (performance.now() - startTime).toFixed(1);

      setApiResponseStatus(res.status);
      setApiResponseHeaders(`date: ${new Date().toUTCString()}\ncontent-type: application/json\nx-response-time: ${duration}ms\ntenant-isolated: true`);
      
      const body = await res.json();
      setApiResponseBody(body);

      // Log API action to system logs on server
      await fetch('/api/server-logs/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'API Call Made',
          institution: activeInstitution.name,
          user: 'API Developer Console',
          details: `Requested endpoint ${resolvedUrl} - Status: ${res.status}`
        })
      });
    } catch (e: any) {
      setApiResponseStatus(500);
      setApiResponseBody({ error: 'Failed to communicate with REST API: ' + e.message });
    } finally {
      setRunningRequest(false);
    }
  };

  // Simulate malicious security attempt
  const handleSimulateAttack = () => {
    // Attempting to request active institution data but using "al-hikma" ID (malicious cross-tenant fetch)
    setHeaderInstId('al-hikma');
    // Using Oxford's API key (or invalid key) to trigger automatic 401 Isolation block
    setHeaderApiKey(credentials?.apiKey || 'invalid_leak_key');
    setSelectedEndpoint('/api/v1/{institutionId}/statistics');
    alert('Security Attack Simulated: Header mismatch injected. Press "Execute Request" below to verify live isolation blocks!');
  };

  const isRTL = language === 'ar';

  return (
    <div className="space-y-8 animate-in fade-in duration-300" id="api-platform-root" style={{ textAlign: isRTL ? 'right' : 'left' }}>
      {/* Platform Title */}
      <div className="border-b border-slate-150 dark:border-slate-800 pb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Code className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>{isRTL ? 'منصة المطورين وبوابات الربط' : 'Enterprise REST API Gateway'}</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isRTL 
            ? 'ربط الأنظمة الجامعية والـ LMS واستخراج بيانات الاعتماد وضمان الجودة بنظام عزل تام ومحكم لكل مؤسسة'
            : 'Integrate external LMS systems and automate quality metric synchronization via secure, completely isolated endpoints.'}
        </p>
      </div>

      {/* API Key Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Key className="w-5 h-5 text-indigo-500" />
              <span>{isRTL ? 'بيانات مفاتيح الاتصال والربط' : 'API Connection Keys'}</span>
            </h3>

            {loading ? (
              <p className="text-xs text-slate-400 text-center py-6">{isRTL ? 'جاري جلب المفاتيح...' : 'Generating credentials...'}</p>
            ) : credentials ? (
              <div className="space-y-4 text-xs font-mono" style={{ textAlign: 'left' }}>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Institution tenant ID</span>
                  <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg p-2.5 justify-between items-center">
                    <span className="text-indigo-400 font-bold">{activeInstitution.id}</span>
                    <button onClick={() => handleCopy(activeInstitution.id, 'id')} className="text-slate-500 hover:text-white">
                      {copiedField === 'id' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">X-API-KEY</span>
                  <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg p-2.5 justify-between items-center">
                    <span className="truncate text-slate-300 pr-2">{credentials.apiKey}</span>
                    <button onClick={() => handleCopy(credentials.apiKey, 'key')} className="text-slate-500 hover:text-white">
                      {copiedField === 'key' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">SECRET-KEY</span>
                  <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg p-2.5 justify-between items-center">
                    <span className="truncate text-slate-300 pr-2">{credentials.secretKey}</span>
                    <button onClick={() => handleCopy(credentials.secretKey, 'sec')} className="text-slate-500 hover:text-white">
                      {copiedField === 'sec' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Bearer JWT Token</span>
                  <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg p-2.5 justify-between items-center">
                    <span className="truncate text-slate-400 pr-2">{credentials.jwtToken}</span>
                    <button onClick={() => handleCopy(credentials.jwtToken, 'jwt')} className="text-slate-500 hover:text-white">
                      {copiedField === 'jwt' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rate Quota</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-black text-[10px] border border-indigo-500/20">{credentials.rateLimit}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Tenant Isolation Guard Announcement */}
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-rose-500 flex items-center gap-2 text-xs" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <ShieldAlert className="w-4 h-4" />
              <span>{isRTL ? 'قواعد جدار الحماية وعزل البيانات' : 'Strict Tenant Isolation Policy'}</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isRTL 
                ? 'يقوم النظام تلقائياً برفض أي استدعاء خارجي للـ API يحتوي على تضارب بين مفتاح الربط والرمز السري وبين كود المنشأة المستدعاة. هذا يمنع تسريب البيانات بنسبة 100%.'
                : 'The API Gateway cross-references the client API key against the active institution headers. Requests attempting cross-tenant lookups receive an automatic HTTP 401 Block.'}
            </p>
            <button
              onClick={handleSimulateAttack}
              className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-[10px] rounded-lg border border-rose-500/20 transition-colors"
            >
              {isRTL ? 'محاكاة هجوم اختراق البيانات' : 'Inbound Isolation Vulnerability Test'}
            </button>
          </div>
        </div>

        {/* OpenAPI / Swagger Sandbox */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <span>{isRTL ? 'مستندات واجهة الـ API التفاعلية (Swagger)' : 'OpenAPI Interactive Testbed (Swagger)'}</span>
            </h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-500">v1.4 OpenAPI</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Endpoint Selector */}
            <div className="space-y-1.5" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <label className="font-bold text-slate-600 dark:text-slate-400">{isRTL ? 'رابط المسار المطلوب اختباره' : 'Select Endpoint Target'}</label>
              <div className="flex gap-2">
                <span className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-500 font-black rounded uppercase flex items-center">GET</span>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono text-xs"
                >
                  <option value="/api/v1/{institutionId}/statistics">/api/v1/&#123;institutionId&#125;/statistics (مؤشرات جودة الأداء)</option>
                  <option value="/api/v1/{institutionId}/students">/api/v1/&#123;institutionId&#125;/students (دليل الطلاب الأكاديمي)</option>
                  <option value="/api/v1/{institutionId}/courses">/api/v1/&#123;institutionId&#125;/courses (توزيع المقررات والمساقات)</option>
                </select>
              </div>
            </div>

            {/* Injected Header Parameter Configurator */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl space-y-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">{isRTL ? 'رؤوس الطلب الـ Headers المطلوبة للتحقق' : 'Request Security Headers'}</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold block">x-institution-id</label>
                  <input
                    type="text"
                    value={headerInstId}
                    onChange={(e) => setHeaderInstId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold block">x-api-key</label>
                  <input
                    type="text"
                    value={headerApiKey}
                    onChange={(e) => setHeaderApiKey(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-[11px] truncate"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold block">Authorization</label>
                  <input
                    type="text"
                    value={headerAuth}
                    onChange={(e) => setHeaderAuth(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-[11px] truncate"
                  />
                </div>
              </div>
            </div>

            {/* Execute trigger */}
            <button
              onClick={handleRunRequest}
              disabled={runningRequest}
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-indigo-600/10 transition-colors"
            >
              {runningRequest ? (
                <>
                  <Terminal className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? 'جاري استدعاء البيانات وتمريرها...' : 'Executing REST Request...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isRTL ? 'تشغيل الطلب التفاعلي (Run Request)' : 'Execute API Sandbox Call'}</span>
                </>
              )}
            </button>

            {/* Swagger REST Output */}
            {(apiResponseStatus !== null || apiResponseBody !== null) && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">{isRTL ? 'مخرجات خادم النظام الـ Response' : 'Server Output Response'}</span>
                
                <div className="bg-slate-950 text-slate-200 rounded-xl overflow-hidden font-mono border border-slate-800 text-[11px]">
                  {/* Title Bar */}
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-850 flex justify-between items-center">
                    <span>STATUS: <strong className={apiResponseStatus === 200 ? 'text-emerald-400' : 'text-rose-400'}>{apiResponseStatus}</strong></span>
                    <span className="text-[10px] text-slate-500">JSON</span>
                  </div>

                  {/* Headers */}
                  <pre className="p-4 bg-slate-950 border-b border-slate-900 text-slate-500 text-[10px]">
                    {apiResponseHeaders}
                  </pre>

                  {/* Body */}
                  <pre className="p-4 bg-slate-950 overflow-x-auto text-emerald-400 max-h-72">
                    {JSON.stringify(apiResponseBody, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
